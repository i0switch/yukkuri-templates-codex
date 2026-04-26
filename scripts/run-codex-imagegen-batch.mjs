#!/usr/bin/env node
// Codex imagegen バッチ生成ヘルパー
//
// Usage:
//   node scripts/run-codex-imagegen-batch.mjs <episode_id> [--max-parallel <N>]
//
// 動作:
//   1. script/<episode_id>/script.yaml を読み込む
//   2. 各 scene の main.kind: image / sub.kind: image を抽出
//   3. asset 既存ならスキップ（再生成しない）
//   4. asset_requirements.imagegen_prompt を使って codex-companion task を投入
//   5. 全タスクを polling、完了したら ~/.codex/generated_images/<session>/ から最新 png を copy
//   6. レポート出力
//
// 環境前提:
//   - codex CLI がインストール済み (Logged in using ChatGPT)
//   - codex-companion.mjs が ~/.claude/plugins/cache/openai-codex/codex/<ver>/scripts/ にある

import {readFile, writeFile, mkdir, copyFile, stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
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
const GENERATED_DIR = path.join(os.homedir(), '.codex', 'generated_images');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sh = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe'], shell: false, windowsHide: true, ...opts});
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

const shStdin = (cmd, args, stdinText) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: ['pipe', 'pipe', 'pipe'], shell: false, windowsHide: true});
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (c) => (stdout += c.toString()));
    p.stderr.on('data', (c) => (stderr += c.toString()));
    p.on('close', (code) => {
      if (code === 0) resolve({stdout, stderr});
      else reject(new Error(`${cmd} exited ${code}\n${stderr}`));
    });
    p.on('error', reject);
    p.stdin.end(stdinText);
  });

const parseArgs = (argv) => {
  const out = {episodeId: null, maxParallel: 5, statusOnly: false};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--max-parallel') {
      out.maxParallel = Number(argv[++i] || '5');
    } else if (a === '--status-only') {
      out.statusOnly = true;
    } else if (!out.episodeId) {
      out.episodeId = a;
    }
  }
  return out;
};

const buildPrompt = (req) => {
  const lines = [];
  lines.push('imagegen スキルで画像を1枚生成して。');
  lines.push('');
  lines.push(`prompt: ${(req.imagegen_prompt || '').trim()}`);
  if (req.aspect) lines.push(`aspect: ${req.aspect}`);
  if (req.aspect === '16:9') lines.push('size: 1536x1024');
  else if (req.aspect === '1:1') lines.push('size: 1024x1024');
  else if (req.aspect === '9:16') lines.push('size: 1024x1536');
  if (req.negative) lines.push(`negative: ${req.negative}`);
  lines.push('');
  lines.push('生成完了したらファイルパスだけ報告して。shell経由のコピーは不要。');
  return lines.join('\n');
};

const startCompanionTask = async (prompt) => {
  // stdin で prompt を渡す（shell経由の改行クリッピングを回避）
  // --fresh で必ず新スレッドにする（過去の無関係な session 流用を防ぐ）
  const args = [COMPANION, 'task', '--background', '--fresh'];
  const {stdout, stderr} = await shStdin('node', args, prompt);
  const m = (stdout + stderr).match(/task-[a-z0-9]+-[a-z0-9]+/i);
  if (!m) {
    throw new Error(`Could not extract task id from companion output:\n${stdout}\n${stderr}`);
  }
  return m[0];
};

const getStatus = async (taskId) => {
  const {stdout} = await sh('node', [COMPANION, 'status', taskId]);
  const text = stdout;
  const phaseMatch = text.match(/Phase:\s*(\S+)/);
  const sessMatch = text.match(/Codex session ID:\s*(\S+)/);
  const stateMatch = text.match(/\|\s*(running|completed|failed)\s*\|/);
  return {
    phase: phaseMatch?.[1] || 'unknown',
    sessionId: sessMatch?.[1] || null,
    state: stateMatch?.[1] || 'unknown',
    raw: text
  };
};

const findLatestImageInSession = async (sessionId) => {
  const dir = path.join(GENERATED_DIR, sessionId);
  if (!existsSync(dir)) return null;
  const entries = await import('node:fs/promises').then((m) => m.readdir(dir));
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
  const {episodeId, maxParallel, statusOnly} = parseArgs(process.argv);
  if (!episodeId) {
    console.error('Usage: node scripts/run-codex-imagegen-batch.mjs <episode_id> [--max-parallel N] [--status-only]');
    process.exit(1);
  }

  const epDir = path.join(ROOT, 'script', episodeId);
  const scriptPath = path.join(epDir, 'script.yaml');
  if (!existsSync(scriptPath)) {
    throw new Error(`script.yaml not found: ${scriptPath}`);
  }
  const yamlText = await readFile(scriptPath, 'utf-8');
  const script = parseYaml(yamlText);

  const targets = [];
  for (const scene of script.scenes ?? []) {
    for (const slot of ['main', 'sub']) {
      const obj = scene[slot];
      if (!obj || obj.kind !== 'image' || !obj.asset) continue;
      const req = obj.asset_requirements;
      if (!req?.imagegen_prompt) continue;
      const targetRel = obj.asset; // e.g. "assets/s01_main.png"
      const targetAbs = path.join(epDir, targetRel);
      if (existsSync(targetAbs)) {
        const sz = (await stat(targetAbs)).size;
        if (sz > 1000) {
          // already exists with non-trivial content; skip
          continue;
        }
      }
      targets.push({sceneId: scene.id, slot, targetRel, targetAbs, req});
    }
  }

  console.log(`Episode: ${episodeId}`);
  console.log(`Targets to generate: ${targets.length}`);

  if (targets.length === 0) {
    console.log('Nothing to do. Exiting.');
    return;
  }

  const trackerPath = path.join(epDir, '.imagegen-tracker.json');
  const tracker = {episodeId, startedAt: new Date().toISOString(), entries: []};

  // Phase 1: launch tasks (rate-limited concurrency: maxParallel at a time using a sliding window)
  console.log(`\n=== Phase 1: launching tasks (max parallel=${maxParallel}) ===`);
  const inflight = new Set();
  const queue = [...targets];
  while (queue.length > 0 || inflight.size > 0) {
    while (queue.length > 0 && inflight.size < maxParallel) {
      const t = queue.shift();
      const prompt = buildPrompt(t.req);
      const p = (async () => {
        try {
          console.log(`launching ${t.sceneId} ${t.slot}...`);
          const taskId = await startCompanionTask(prompt);
          console.log(`  -> taskId=${taskId}`);
          tracker.entries.push({...t, taskId, status: 'queued'});
          await writeFile(trackerPath, JSON.stringify(tracker, null, 2));
        } catch (e) {
          console.error(`  ! launch failed for ${t.sceneId}: ${e.message}`);
          tracker.entries.push({...t, taskId: null, status: 'launch-failed', error: e.message});
        }
      })();
      inflight.add(p);
      p.finally(() => inflight.delete(p));
    }
    if (inflight.size > 0) await Promise.race([...inflight, sleep(1000)]);
  }

  // Phase 2: poll until all done
  console.log(`\n=== Phase 2: polling task completion ===`);
  const pending = new Set(tracker.entries.filter((e) => e.taskId).map((e) => e.taskId));
  const sessionByTask = new Map();
  while (pending.size > 0) {
    for (const taskId of [...pending]) {
      try {
        const st = await getStatus(taskId);
        if (st.sessionId) sessionByTask.set(taskId, st.sessionId);
        if (st.state === 'completed' || st.state === 'failed' || st.phase === 'done') {
          pending.delete(taskId);
          console.log(`  ${taskId} -> ${st.state}/${st.phase}`);
        }
      } catch (e) {
        // ignore transient
      }
    }
    if (pending.size > 0) {
      console.log(`  pending: ${pending.size}`);
      await sleep(15000);
    }
  }

  // Phase 3: copy images
  console.log(`\n=== Phase 3: copying images ===`);
  for (const e of tracker.entries) {
    if (!e.taskId) continue;
    const sessionId = sessionByTask.get(e.taskId);
    if (!sessionId) {
      e.status = 'no-session';
      console.log(`  ${e.sceneId} ${e.slot}: no session id`);
      continue;
    }
    const src = await findLatestImageInSession(sessionId);
    if (!src) {
      e.status = 'no-image';
      console.log(`  ${e.sceneId} ${e.slot}: no image in session ${sessionId}`);
      continue;
    }
    await mkdir(path.dirname(e.targetAbs), {recursive: true});
    await copyFile(src, e.targetAbs);
    e.status = 'copied';
    e.sourcePath = src;
    e.sessionId = sessionId;
    console.log(`  ${e.sceneId} ${e.slot}: copied to ${e.targetRel}`);
  }

  tracker.finishedAt = new Date().toISOString();
  await writeFile(trackerPath, JSON.stringify(tracker, null, 2));

  // Summary
  const ok = tracker.entries.filter((e) => e.status === 'copied').length;
  const fail = tracker.entries.length - ok;
  console.log(`\n=== Done ===`);
  console.log(`  copied: ${ok}`);
  console.log(`  failed: ${fail}`);
  if (fail > 0) {
    console.log('\nFailed entries:');
    for (const e of tracker.entries) if (e.status !== 'copied') console.log(`  - ${e.sceneId} ${e.slot}: ${e.status} ${e.error || ''}`);
  }
};

main().catch((err) => {
  console.error(`error: ${err?.message ?? err}`);
  process.exit(1);
});
