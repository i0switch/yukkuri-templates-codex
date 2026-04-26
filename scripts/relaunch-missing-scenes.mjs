#!/usr/bin/env node
// 欠けているシーンの imagegen を sequential で再投入する
//
// Usage: node scripts/relaunch-missing-scenes.mjs <episode_id> <scene_id>...

import {readFile, writeFile} from 'node:fs/promises';
import {existsSync, statSync} from 'node:fs';
import {spawn} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {parse as parseYaml} from 'yaml';
import process from 'node:process';

const ROOT = process.cwd();
const COMPANION = path.join(
  os.homedir(),
  '.claude',
  'plugins',
  'cache',
  'openai-codex',
  'codex',
  '1.0.1',
  'scripts',
  'codex-companion.mjs'
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const startCompanionTask = (prompt) =>
  new Promise((resolve, reject) => {
    const p = spawn('node', [COMPANION, 'task', '--background', '--fresh'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (c) => (stdout += c.toString()));
    p.stderr.on('data', (c) => (stderr += c.toString()));
    p.on('close', (code) => {
      if (code !== 0) reject(new Error(`code=${code} stderr=${stderr}`));
      else {
        const m = (stdout + stderr).match(/task-[a-z0-9]+-[a-z0-9]+/i);
        if (m) resolve(m[0]);
        else reject(new Error(`no task id in: ${stdout}`));
      }
    });
    p.on('error', reject);
    p.stdin.end(prompt);
  });

const buildPrompt = (req) => {
  const lines = [];
  lines.push('imagegen スキルで画像を1枚生成して。');
  lines.push('');
  lines.push(`prompt: ${(req.imagegen_prompt || '').trim()}`);
  if (req.aspect === '16:9') lines.push('size: 1536x1024');
  else if (req.aspect === '1:1') lines.push('size: 1024x1024');
  if (req.negative) lines.push(`negative: ${req.negative}`);
  lines.push('');
  lines.push('生成完了したらファイルパスだけ報告して。shell経由のコピーは不要。');
  return lines.join('\n');
};

const main = async () => {
  const [episodeId, ...sceneIds] = process.argv.slice(2);
  if (!episodeId || sceneIds.length === 0) {
    console.error('Usage: node scripts/relaunch-missing-scenes.mjs <episode_id> <scene_id>...');
    process.exit(1);
  }

  const epDir = path.join(ROOT, 'script', episodeId);
  const scriptPath = path.join(epDir, 'script.yaml');
  const yamlText = await readFile(scriptPath, 'utf-8');
  const script = parseYaml(yamlText);

  const trackerPath = path.join(epDir, '.imagegen-tracker.json');
  let tracker = {episodeId, entries: []};
  if (existsSync(trackerPath)) {
    tracker = JSON.parse(await readFile(trackerPath, 'utf-8'));
  }

  const newEntries = [];
  for (const sid of sceneIds) {
    const scene = script.scenes.find((s) => s.id === sid);
    if (!scene) {
      console.warn(`scene ${sid} not found, skipping`);
      continue;
    }
    const obj = scene.main;
    if (!obj || obj.kind !== 'image' || !obj.asset) continue;
    const req = obj.asset_requirements;
    if (!req?.imagegen_prompt) continue;
    const targetRel = obj.asset;
    const targetAbs = path.join(epDir, targetRel);
    if (existsSync(targetAbs) && statSync(targetAbs).size > 1000) {
      console.log(`${sid}: already exists, skipping`);
      continue;
    }
    newEntries.push({sceneId: sid, slot: 'main', targetRel, targetAbs, req});
  }

  console.log(`Relaunching ${newEntries.length} scenes for ${episodeId} (sequential)`);
  for (const e of newEntries) {
    console.log(`launching ${e.sceneId}...`);
    const prompt = buildPrompt(e.req);
    try {
      const taskId = await startCompanionTask(prompt);
      console.log(`  -> ${taskId}`);
      // Remove old entry for same scene if exists
      tracker.entries = tracker.entries.filter((x) => x.sceneId !== e.sceneId);
      tracker.entries.push({...e, taskId, status: 'queued'});
      await writeFile(trackerPath, JSON.stringify(tracker, null, 2));
    } catch (err) {
      console.error(`  ! ${e.sceneId} failed: ${err.message}`);
    }
    // 1秒待ってから次（state.json への書き込み race condition 回避）
    await sleep(1000);
  }

  console.log('Done relaunching.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
