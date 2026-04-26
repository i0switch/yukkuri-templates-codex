#!/usr/bin/env node
// Codex imagegen タスクのドレイナー
//
// Usage: node scripts/drain-imagegen-tasks.mjs <episode_id> [<episode_id>...]
//
// 動作:
//   1. 各 episode の .imagegen-tracker.json を読み込み
//   2. 各 task について codex-companion status で session ID を取得
//   3. ~/.codex/generated_images/<session>/ に画像があり、task が完了していたらターゲットへ copy
//   4. 全 task 処理が終わるまでループ
//
// このスクリプトは完了済み・進行中問わず、対応する画像が出現したら順次copyする。

import {readFile, writeFile, copyFile, mkdir, stat, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
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
const GENERATED_DIR = path.join(os.homedir(), '.codex', 'generated_images');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sh = (cmd, args) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe'], shell: false, windowsHide: true});
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (c) => (stdout += c.toString()));
    p.stderr.on('data', (c) => (stderr += c.toString()));
    p.on('close', (code) => {
      if (code === 0) resolve({stdout, stderr});
      else reject(new Error(`${cmd} exited ${code}\n${stderr}`));
    });
    p.on('error', reject);
  });

const getStatus = async (taskId) => {
  try {
    const {stdout} = await sh('node', [COMPANION, 'status', taskId]);
    const text = stdout;
    const phaseMatch = text.match(/Phase:\s*(\S+)/);
    const sessMatch = text.match(/Codex session ID:\s*(\S+)/);
    const stateMatch = text.match(/\|\s*(running|completed|failed|queued|cancelled)\s*\|/);
    return {
      phase: phaseMatch?.[1] || 'unknown',
      sessionId: sessMatch?.[1] || null,
      state: stateMatch?.[1] || 'unknown'
    };
  } catch (e) {
    return {phase: 'error', sessionId: null, state: 'error'};
  }
};

const findLatestImageInSession = async (sessionId) => {
  const dir = path.join(GENERATED_DIR, sessionId);
  if (!existsSync(dir)) return null;
  const entries = await readdir(dir);
  const pngs = entries.filter((e) => e.endsWith('.png'));
  if (pngs.length === 0) return null;
  let best = null;
  let bestMtime = 0;
  for (const f of pngs) {
    const fp = path.join(dir, f);
    const st = await stat(fp);
    if (st.mtimeMs > bestMtime) {
      bestMtime = st.mtimeMs;
      best = fp;
    }
  }
  return best;
};

const main = async () => {
  const epIds = process.argv.slice(2);
  if (epIds.length === 0) {
    console.error('Usage: node scripts/drain-imagegen-tasks.mjs <episode_id>...');
    process.exit(1);
  }

  const eps = [];
  for (const id of epIds) {
    const trackerPath = path.join(ROOT, 'script', id, '.imagegen-tracker.json');
    if (!existsSync(trackerPath)) {
      console.warn(`tracker not found for ${id}: ${trackerPath}`);
      continue;
    }
    const data = JSON.parse(await readFile(trackerPath, 'utf-8'));
    eps.push({id, trackerPath, data});
  }

  const allEntries = eps.flatMap((ep) =>
    ep.data.entries
      .filter((e) => e.taskId && (e.status === 'queued' || e.status === 'launching'))
      .map((e) => ({ep, entry: e}))
  );

  console.log(`Total entries to drain: ${allEntries.length}`);
  if (allEntries.length === 0) {
    console.log('Nothing pending.');
    return;
  }

  const pending = new Set(allEntries.map((x) => x.entry.taskId));
  let iteration = 0;
  const maxIter = 200;

  while (pending.size > 0 && iteration < maxIter) {
    iteration++;
    let progress = 0;
    for (const {ep, entry} of allEntries) {
      if (!pending.has(entry.taskId)) continue;
      const st = await getStatus(entry.taskId);
      if (st.sessionId && !entry.sessionId) {
        entry.sessionId = st.sessionId;
      }
      // Try to find image
      if (entry.sessionId) {
        const img = await findLatestImageInSession(entry.sessionId);
        if (img) {
          await mkdir(path.dirname(entry.targetAbs), {recursive: true});
          await copyFile(img, entry.targetAbs);
          entry.status = 'copied';
          entry.sourcePath = img;
          pending.delete(entry.taskId);
          console.log(`[${iteration}] ${ep.id} ${entry.sceneId}: copied (${st.state}/${st.phase}) <- ${img}`);
          progress++;
        }
      }
      if (st.state === 'failed' || st.state === 'cancelled') {
        entry.status = `${st.state}-no-image`;
        pending.delete(entry.taskId);
        console.log(`[${iteration}] ${ep.id} ${entry.sceneId}: ${st.state}, no image`);
        progress++;
      }
    }

    // Save trackers
    for (const ep of eps) {
      await writeFile(ep.trackerPath, JSON.stringify(ep.data, null, 2));
    }

    if (pending.size > 0) {
      console.log(`[${iteration}] pending=${pending.size} progress_this_iter=${progress}`);
      await sleep(20000);
    }
  }

  // Final report
  console.log(`\n=== Drain done (iterations=${iteration}) ===`);
  for (const ep of eps) {
    const ok = ep.data.entries.filter((e) => e.status === 'copied').length;
    const total = ep.data.entries.length;
    console.log(`  ${ep.id}: ${ok}/${total} copied`);
    for (const e of ep.data.entries) {
      if (e.status !== 'copied') {
        console.log(`    - ${e.sceneId}: ${e.status} task=${e.taskId} session=${e.sessionId}`);
      }
    }
  }
};

main().catch((err) => {
  console.error(`error: ${err?.message ?? err}`);
  process.exit(1);
});
