#!/usr/bin/env node
// 生成後の機械監査: PNG ファイルの存在・サイズ・解像度・重複・meta.json の必須フィールドを検査する。
// 画像内容の評価は LLM 監査プロンプト (05_IMAGE_RESULT_AUDIT.md) で別途実施する想定。
//
// Usage:
//   node scripts/audit-generated-images.mjs <episode_id> [<episode_id>...]
//   node scripts/audit-generated-images.mjs <episode_id> --json
//
// 終了コード:
//   0: PASS（error 0 件）
//   1: FAIL

import {readFile, stat as statFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import {parse as parseYaml} from 'yaml';

const ROOT = process.cwd();
const MIN_PNG_BYTES = 30 * 1024;

function parseArgs(argv) {
  const positional = [];
  let json = false;
  for (const arg of argv) {
    if (arg === '--json') json = true;
    else positional.push(arg);
  }
  return {positional, json};
}

async function readPngDimensions(filePath) {
  const buf = await readFile(filePath);
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return {width, height};
}

function aspectMatch(width, height, aspectStr) {
  if (!width || !height) return false;
  const ratio = width / height;
  const map = {
    '16:9': [16 / 9, 1536 / 1024],
    '9:16': [9 / 16, 1024 / 1536],
    '1:1': [1],
    '4:3': [4 / 3],
    '3:4': [3 / 4],
  };
  const expectedRatios = map[aspectStr];
  if (!expectedRatios) return null;
  return expectedRatios.some((expected) => Math.abs(ratio - expected) / expected < 0.05);
}

async function sha256(filePath) {
  const buf = await readFile(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

async function loadScript(epId) {
  const scriptPath = path.join(ROOT, 'script', epId, 'script.yaml');
  const text = await readFile(scriptPath, 'utf8');
  return {scriptPath, script: parseYaml(text), epDir: path.join(ROOT, 'script', epId)};
}

async function loadMeta(epDir) {
  const metaPath = path.join(epDir, 'meta.json');
  if (!existsSync(metaPath)) return {meta: null, metaPath};
  try {
    const text = await readFile(metaPath, 'utf8');
    return {meta: JSON.parse(text), metaPath};
  } catch (e) {
    return {meta: null, metaPath, error: e.message};
  }
}

async function auditEpisode(epId) {
  const issues = [];
  const {script, epDir} = await loadScript(epId);
  const {meta, metaPath, error: metaError} = await loadMeta(epDir);

  const targets = [];
  for (const scene of script.scenes ?? []) {
    for (const slot of ['main', 'sub']) {
      const obj = scene?.[slot];
      if (!obj || obj.kind !== 'image' || !obj.asset) continue;
      targets.push({sceneId: scene.id, slot, asset: obj.asset, aspect: obj.asset_requirements?.aspect});
    }
  }

  if (targets.length === 0) {
    return {issues: [{level: 'warn', sceneId: '_episode', field: '_root', message: 'image scene が 0 件'}], targetCount: 0};
  }

  const hashByPath = new Map();
  for (const t of targets) {
    const absPath = path.join(epDir, t.asset);
    const sceneRef = `${t.sceneId}/${t.slot}`;
    if (!existsSync(absPath)) {
      issues.push({level: 'error', sceneId: sceneRef, field: 'asset', message: `画像が存在しない: ${t.asset}`});
      continue;
    }
    const st = await statFile(absPath);
    if (st.size < MIN_PNG_BYTES) {
      issues.push({level: 'error', sceneId: sceneRef, field: 'asset', message: `PNG サイズが小さすぎる: ${(st.size / 1024).toFixed(1)}KB (>= 30KB 必須)`});
      continue;
    }
    const dims = await readPngDimensions(absPath);
    if (!dims) {
      issues.push({level: 'error', sceneId: sceneRef, field: 'asset', message: `PNG ヘッダが不正: ${t.asset}`});
      continue;
    }
    if (t.aspect) {
      const ok = aspectMatch(dims.width, dims.height, t.aspect);
      if (ok === false) {
        issues.push({level: 'error', sceneId: sceneRef, field: 'aspect', message: `aspect ${t.aspect} に合致しない解像度: ${dims.width}x${dims.height}`});
      } else if (ok === null) {
        issues.push({level: 'warn', sceneId: sceneRef, field: 'aspect', message: `未知の aspect 値: ${t.aspect}`});
      }
    }
    const hash = await sha256(absPath);
    hashByPath.set(absPath, {hash, sceneRef, asset: t.asset});
  }

  // 同一 sha256 の使い回し検出
  const byHash = new Map();
  for (const [, info] of hashByPath) {
    if (!byHash.has(info.hash)) byHash.set(info.hash, []);
    byHash.get(info.hash).push(info);
  }
  for (const [, group] of byHash) {
    if (group.length > 1) {
      const refs = group.map((g) => g.sceneRef).join(', ');
      issues.push({level: 'error', sceneId: '_episode', field: 'sha256', message: `同一画像が複数シーンで使い回されている: ${refs}`});
    }
  }

  // meta.json の必須フィールド検査
  if (metaError) {
    issues.push({level: 'error', sceneId: '_episode', field: 'meta.json', message: `meta.json 解析失敗: ${metaError}`});
  } else if (!meta) {
    issues.push({level: 'warn', sceneId: '_episode', field: 'meta.json', message: `meta.json が無い: ${metaPath}`});
  } else {
    const assets = Array.isArray(meta.assets) ? meta.assets : [];
    const assetByFile = new Map();
    for (const a of assets) {
      if (a?.file) assetByFile.set(path.posix.normalize(a.file), a);
    }
    for (const t of targets) {
      const key = path.posix.normalize(t.asset);
      const rec = assetByFile.get(key);
      if (!rec) {
        issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.assets', message: `meta.json assets[] に ${t.asset} が登録されていない`});
        continue;
      }
      const scriptReq = (script.scenes ?? [])
        .find((scene) => scene.id === t.sceneId)?.[t.slot]?.asset_requirements;
      const isImagegen = Boolean(scriptReq?.imagegen_prompt)
        || rec.generator?.toLowerCase().includes('codex')
        || rec.generator?.toLowerCase().includes('imagegen');
      if (isImagegen) {
        if (!rec.generator) {
          issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.generator', message: 'imagegen 経路だが generator が記録されていない'});
        } else if (!rec.generator.toLowerCase().includes('codex') && !rec.generator.toLowerCase().includes('imagegen')) {
          issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.generator', message: `imagegen 経路だが generator が Codex/imagegen ではない: ${rec.generator}`});
        }
        if (!rec.imagegen_prompt) {
          issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.imagegen_prompt', message: 'imagegen 経路だが imagegen_prompt が記録されていない'});
        }
        if (!rec.imagegen_model) {
          issues.push({level: 'error', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.imagegen_model', message: 'imagegen 経路だが imagegen_model が記録されていない'});
        }
      }
      if (!rec.license) {
        issues.push({level: 'warn', sceneId: `${t.sceneId}/${t.slot}`, field: 'meta.license', message: 'license が記録されていない'});
      }
    }
  }

  return {issues, targetCount: targets.length};
}

function summarize(issues) {
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  return {errors: errors.length, warns: warns.length, errorList: errors, warnList: warns};
}

function format(epId, sum, count) {
  const lines = [];
  lines.push(`\n=== generated image audit: ${epId} ===`);
  lines.push(`image scenes: ${count}, errors: ${sum.errors}, warnings: ${sum.warns}`);
  for (const e of sum.errorList) lines.push(`  ERROR [${e.sceneId}] ${e.field}: ${e.message}`);
  for (const w of sum.warnList) lines.push(`  WARN  [${w.sceneId}] ${w.field}: ${w.message}`);
  lines.push(`result: ${sum.errors === 0 ? 'PASS' : 'FAIL'}`);
  return lines.join('\n');
}

async function main() {
  const {positional, json} = parseArgs(process.argv.slice(2));
  if (positional.length === 0) {
    console.error('Usage: node scripts/audit-generated-images.mjs <episode_id> [...] [--json]');
    process.exit(2);
  }

  let fail = false;
  const reports = [];
  for (const epId of positional) {
    try {
      const {issues, targetCount} = await auditEpisode(epId);
      const sum = summarize(issues);
      if (sum.errors > 0) fail = true;
      reports.push({epId, targetCount, sum});
      if (!json) console.log(format(epId, sum, targetCount));
    } catch (e) {
      fail = true;
      reports.push({epId, error: e.message});
      if (!json) console.error(`\n!! ${epId}: ${e.message}`);
    }
  }

  if (json) {
    console.log(JSON.stringify({overall: fail ? 'FAIL' : 'PASS', reports: reports.map((r) => ({
      epId: r.epId,
      targetCount: r.targetCount,
      errors: r.sum?.errors,
      warns: r.sum?.warns,
      errorList: r.sum?.errorList,
      error: r.error,
    }))}, null, 2));
  }

  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(`audit-generated-images error: ${e?.message ?? e}`);
  process.exit(2);
});
