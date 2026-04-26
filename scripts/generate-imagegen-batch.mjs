import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const COMPANION = path.join(
  os.homedir(),
  '.claude',
  'plugins',
  'cache',
  'openai-codex',
  'codex',
  '1.0.1',
  'scripts',
  'codex-companion.mjs',
);

const GEN_DIR = path.join(os.homedir(), '.codex', 'generated_images');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function listGeneratedPngs() {
  const files = [];
  try {
    const sessions = await fs.readdir(GEN_DIR);
    for (const s of sessions) {
      const dir = path.join(GEN_DIR, s);
      const stat = await fs.stat(dir).catch(() => null);
      if (!stat?.isDirectory()) continue;
      const entries = await fs.readdir(dir);
      for (const e of entries) {
        if (e.endsWith('.png')) {
          const fp = path.join(dir, e);
          const st = await fs.stat(fp);
          files.push({path: fp, mtime: st.mtimeMs, size: st.size});
        }
      }
    }
  } catch {}
  return files;
}

function launchTask(prompt) {
  return new Promise((resolve, reject) => {
    const p = spawn('node', [COMPANION, 'task', '--background', '--fresh'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
    });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(`launch failed (${code}): ${err}`));
      const m = out.match(/task-[A-Za-z0-9-]+/);
      if (!m) return reject(new Error(`no task id in output: ${out}`));
      resolve(m[0]);
    });
    p.stdin.end(prompt);
  });
}

function statusTask(taskId) {
  const r = spawnSync('node', [COMPANION, 'status', taskId], {encoding: 'utf8'});
  return {stdout: r.stdout || '', stderr: r.stderr || '', code: r.status};
}

async function waitForTask(taskId, timeoutMs = 5 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const {stdout} = statusTask(taskId);
    if (/Phase:\s*done/i.test(stdout) || /completed/i.test(stdout) || /error/i.test(stdout) || /failed/i.test(stdout)) {
      return stdout;
    }
    await sleep(5000);
  }
  return null;
}

async function generateOne({episodeId, file, prompt, baselineMtime}) {
  const promptText = `imagegen スキルで画像を1枚生成して。

prompt: ${prompt}
size: 1536x1024
negative: 写真風、リアル調、文字、ラベル、数字、ロゴ、透かし、字幕、UI文字、人物の顔, typography, watermark, caption, label, number

生成完了したらファイルパスだけ報告して、shell経由のコピーは不要。`;

  console.log(`[${episodeId}/${file}] launching...`);
  const taskId = await launchTask(promptText);
  console.log(`[${episodeId}/${file}] task=${taskId}`);

  const result = await waitForTask(taskId);
  if (!result) {
    console.warn(`[${episodeId}/${file}] timeout`);
    return null;
  }

  // find newest png since baseline
  const files = await listGeneratedPngs();
  const candidates = files.filter((f) => f.mtime > baselineMtime && f.size > 1000);
  candidates.sort((a, b) => b.mtime - a.mtime);
  if (candidates.length === 0) {
    console.warn(`[${episodeId}/${file}] no new png produced`);
    return null;
  }
  const target = path.resolve(process.cwd(), 'script', episodeId, file);
  await fs.mkdir(path.dirname(target), {recursive: true});
  await fs.copyFile(candidates[0].path, target);
  console.log(`[${episodeId}/${file}] copied from ${path.basename(candidates[0].path)} (${candidates[0].size}B)`);
  return target;
}

const episodes = ['ep701-rm-olbers-paradox', 'ep702-zm-body-mystery'];

for (const epId of episodes) {
  const metaPath = path.join('script', epId, 'meta.json');
  const meta = await loadJson(metaPath);
  const imagenAssets = (meta.assets || []).filter(
    (a) => a.imagegen_prompt && a.file?.endsWith('.png'),
  );
  console.log(`# ${epId}: ${imagenAssets.length} images`);

  for (const asset of imagenAssets) {
    const target = path.resolve(process.cwd(), 'script', epId, asset.file);
    // skip if already exists with size > 50KB
    try {
      const st = await fs.stat(target);
      if (st.size > 50000) {
        console.log(`[${epId}/${asset.file}] already exists (${st.size}B), skip`);
        continue;
      }
    } catch {}

    const baselineFiles = await listGeneratedPngs();
    const baselineMtime = baselineFiles.reduce((m, f) => Math.max(m, f.mtime), 0);

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await generateOne({
          episodeId: epId,
          file: asset.file,
          prompt: asset.imagegen_prompt,
          baselineMtime,
        });
        if (r) {
          success = true;
          break;
        }
      } catch (e) {
        console.warn(`[${epId}/${asset.file}] attempt ${attempt} error: ${e.message}`);
      }
      await sleep(2000);
    }
    if (!success) {
      console.error(`[${epId}/${asset.file}] FAILED after retries`);
    }
  }
}

console.log('done');
