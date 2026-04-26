#!/usr/bin/env node
// 機械監査: script.yaml 内の image_direction と imagegen_prompt が
// _reference/image_prompt_pack のルールに準拠しているか検査する。
//
// Usage:
//   node scripts/audit-image-prompts.mjs <episode_id>
//   node scripts/audit-image-prompts.mjs <episode_id> --json
//
// 終了コード:
//   0: PASS（error 0 件）
//   1: FAIL（error 1 件以上）
//
// バイパス: YUKKURI_SKIP_IMAGE_GATE=1 で warning ログだけ出して exit 0。

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parse as parseYaml} from 'yaml';
import {
  validateImageDirection,
  validateImagegenPromptString,
  checkVisualTypeDistribution,
  summarizeIssues,
} from './lib/image-direction-schema.mjs';

const ROOT = process.cwd();

function parseArgs(argv) {
  const positional = [];
  let json = false;
  let strict = true;
  for (const arg of argv) {
    if (arg === '--json') json = true;
    else if (arg === '--non-strict') strict = false;
    else positional.push(arg);
  }
  return {positional, json, strict};
}

async function loadScript(epId) {
  const scriptPath = path.join(ROOT, 'script', epId, 'script.yaml');
  const text = await readFile(scriptPath, 'utf8');
  return {scriptPath, script: parseYaml(text)};
}

function collectImageScenes(script) {
  const scenes = Array.isArray(script?.scenes) ? script.scenes : [];
  const targets = [];
  for (const scene of scenes) {
    for (const slot of ['main', 'sub']) {
      const obj = scene?.[slot];
      if (!obj || obj.kind !== 'image') continue;
      targets.push({sceneId: scene.id, slot, obj, scene});
    }
  }
  return targets;
}

function auditEpisode(script) {
  const issues = [];
  const targets = collectImageScenes(script);

  if (targets.length === 0) {
    return {issues: [{level: 'warn', sceneId: '_episode', field: '_root', message: 'image scene が 1 件もない'}], targetCount: 0};
  }

  const directions = [];
  for (const t of targets) {
    const dir = t.obj.image_direction;
    const dirIssues = validateImageDirection(dir, `${t.sceneId}/${t.slot}`);
    issues.push(...dirIssues);
    if (dir && typeof dir === 'object') {
      directions.push({...dir, scene_id: dir.scene_id || t.sceneId});
    }

    const promptText = t.obj.asset_requirements?.imagegen_prompt;
    const promptIssues = validateImagegenPromptString(promptText, `${t.sceneId}/${t.slot}`);
    issues.push(...promptIssues);

    if (!t.obj.asset_requirements) {
      issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'asset_requirements', message: 'asset_requirements ブロックが存在しない'});
    } else {
      const req = t.obj.asset_requirements;
      if (!req.aspect) {
        issues.push({level: 'warn', sceneId: `${t.sceneId}/${t.slot}`, field: 'asset_requirements.aspect', message: 'aspect が未指定'});
      }
      if (!req.negative || typeof req.negative !== 'string' || req.negative.length < 10) {
        issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'asset_requirements.negative', message: 'negative が未設定または短すぎる'});
      } else {
        for (const term of ['写真風', 'リアル調', '文字', 'ロゴ', '人物の顔']) {
          if (!req.negative.includes(term)) {
            issues.push({level: 'warn', sceneId: `${t.sceneId}/${t.slot}`, field: 'asset_requirements.negative', message: `negative に最低限の禁止語 "${term}" が欠けている`});
          }
        }
      }
    }
  }

  issues.push(...checkVisualTypeDistribution(directions));

  const mainBySceneId = new Map();
  const subBySceneId = new Map();
  for (const t of targets) {
    if (t.slot === 'main') mainBySceneId.set(t.sceneId, t.obj.image_direction);
    if (t.slot === 'sub') subBySceneId.set(t.sceneId, t.obj.image_direction);
  }
  for (const [sceneId, mainDir] of mainBySceneId) {
    const subDir = subBySceneId.get(sceneId);
    if (!subDir) continue;
    if (mainDir?.visual_type && subDir?.visual_type && mainDir.visual_type === subDir.visual_type) {
      issues.push({level: 'error', sceneId, field: 'visual_type', message: 'main と sub で同一の visual_type を使っている（役割重複）'});
    }
    if (mainDir?.image_should_support && subDir?.image_should_support && mainDir.image_should_support === subDir.image_should_support) {
      issues.push({level: 'error', sceneId, field: 'image_should_support', message: 'main と sub の image_should_support が完全一致（情報重複）'});
    }
  }

  return {issues, targetCount: targets.length};
}

function formatTextReport(epId, summary, targetCount) {
  const lines = [];
  lines.push(`\n=== image prompt audit: ${epId} ===`);
  lines.push(`image scenes: ${targetCount}`);
  lines.push(`errors: ${summary.errors}, warnings: ${summary.warns}`);
  if (summary.errors > 0) {
    lines.push('\n[ERROR]');
    for (const e of summary.errorList) {
      lines.push(`  - [${e.sceneId}] ${e.field}: ${e.message}`);
    }
  }
  if (summary.warns > 0) {
    lines.push('\n[WARN]');
    for (const w of summary.warnList) {
      lines.push(`  - [${w.sceneId}] ${w.field}: ${w.message}`);
    }
  }
  lines.push(`\nresult: ${summary.errors === 0 ? 'PASS' : 'FAIL'}`);
  return lines.join('\n');
}

async function main() {
  const {positional, json, strict} = parseArgs(process.argv.slice(2));
  if (positional.length === 0) {
    console.error('Usage: node scripts/audit-image-prompts.mjs <episode_id> [--json] [--non-strict]');
    process.exit(2);
  }

  let overallFail = false;
  const reports = [];
  for (const epId of positional) {
    try {
      const {script} = await loadScript(epId);
      const {issues, targetCount} = auditEpisode(script);
      const summary = summarizeIssues(issues);
      reports.push({epId, targetCount, summary});
      if (summary.errors > 0) overallFail = true;
      if (!json) console.log(formatTextReport(epId, summary, targetCount));
    } catch (error) {
      reports.push({epId, error: error.message ?? String(error)});
      overallFail = true;
      if (!json) console.error(`\n!! ${epId}: ${error.message ?? error}`);
    }
  }

  if (json) {
    console.log(JSON.stringify({overall: overallFail ? 'FAIL' : 'PASS', reports: reports.map((r) => ({
      epId: r.epId,
      targetCount: r.targetCount ?? 0,
      errors: r.summary?.errors ?? null,
      warns: r.summary?.warns ?? null,
      errorList: r.summary?.errorList ?? [],
      error: r.error ?? null,
    }))}, null, 2));
  }

  if (overallFail && strict) {
    if (process.env.YUKKURI_SKIP_IMAGE_GATE === '1') {
      console.warn('\n** YUKKURI_SKIP_IMAGE_GATE=1 set: bypassing image audit failure. WARNING: 構造的な品質低下が起きる可能性。');
      process.exit(0);
    }
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(`audit-image-prompts error: ${error?.message ?? error}`);
  process.exit(2);
});
