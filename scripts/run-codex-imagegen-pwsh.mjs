#!/usr/bin/env node
// Codex imagegen バッチ生成（PowerShell + codex exec 直叩き版）
//
// companion 経由は Windows で cmd ウィンドウがポップアップする問題があるため、
// pwsh.exe を windowsHide:true で spawn して、その中で codex exec を呼ぶ方式。
//
// Usage:
//   node scripts/run-codex-imagegen-pwsh.mjs [--parallel=N] <episode_id> [<episode_id>...]
//
// 動作:
//   1. 各 episode の script.yaml を読み込み
//   2. main.kind: image / sub.kind: image を抽出
//   3. asset 既存ならスキップ
//   4. asset_requirements.imagegen_prompt を pwsh -NonInteractive 経由で codex exec に投入
//   5. 直列時は reported path 優先 + 最新 png fallback、並列時は reported path 必須で target へ copy
//   6. デフォルトは直列、--parallel=N 指定時のみ並列処理

import {readFile, writeFile, copyFile, mkdir, stat, readdir, unlink} from 'node:fs/promises';
import {existsSync, readdirSync, writeFileSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {parse as parseYaml} from 'yaml';
import process from 'node:process';

const ROOT = process.cwd();
const GENERATED_DIR = path.join(os.homedir(), '.codex', 'generated_images');

// PowerShell 7+ のフルパスを解決する（Node spawn は WindowsStore reparse-point を辿れず即終了するため）
// WindowsApps ディレクトリは通常 readdirSync が permission denied になるので、
// 環境変数 → 既知のパスを順に試す（existsSync で確認できなくても spawn 時に試行）
const resolvePwsh = () => {
  if (process.platform !== 'win32') return 'pwsh';
  if (process.env.PWSH_EXE) return process.env.PWSH_EXE;
  // 既知の WindowsApps インストール（バージョン不明でも spawn してみる、ENOENT なら次へ）
  const knownPaths = [
    'C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.6.1.0_x64__8wekyb3d8bbwe\\pwsh.exe',
    'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
  ];
  for (const p of knownPaths) {
    if (existsSync(p)) return p;
  }
  return knownPaths[0]; // fallback to most likely
};

const PWSH = resolvePwsh();
console.log(`pwsh: ${PWSH}`);

const buildPrompt = (req) => {
  const lines = [];
  lines.push('imagegen スキルで画像を1枚生成して。');
  lines.push('');
  lines.push(`prompt: ${(req.imagegen_prompt || '').trim()}`);
  if (req.aspect === '16:9') lines.push('size: 1536x1024');
  else if (req.aspect === '1:1') lines.push('size: 1024x1024');
  else if (req.aspect === '9:16') lines.push('size: 1024x1536');
  if (req.negative) lines.push(`negative: ${req.negative}`);
  lines.push('');
  lines.push('生成完了したらファイルパスだけ報告して。shell経由のコピーは不要。');
  return lines.join('\n');
};

const runCodexExecViaPwsh = async (prompt) => {
  // pwsh -Command - (stdin) は環境によって動かないため、一時 .ps1 ファイル経由で実行
  const tmpPath = path.join(os.tmpdir(), `imagegen-${Date.now()}-${Math.random().toString(36).slice(2)}.ps1`);
  const psScript = `$ErrorActionPreference = 'Continue'
$prompt = @'
${prompt}
'@
$prompt | codex exec --dangerously-bypass-approvals-and-sandbox 2>&1
`;
  writeFileSync(tmpPath, psScript, 'utf-8');

  return new Promise((resolve) => {
    const args = ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', tmpPath];
    const p = spawn(PWSH, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    });
    let out = '';
    let err = '';
    p.stdout.on('data', (c) => (out += c.toString()));
    p.stderr.on('data', (c) => (err += c.toString()));
    p.on('close', async (code) => {
      try { await unlink(tmpPath); } catch {}
      resolve({code, out, err});
    });
    p.on('error', async (e) => {
      try { await unlink(tmpPath); } catch {}
      resolve({code: -1, out, err: err + '\n' + e.message});
    });
  });
};

const findLatestImage = async (afterMtimeMs) => {
  if (!existsSync(GENERATED_DIR)) return null;
  const sessions = await readdir(GENERATED_DIR);
  let bestPath = null;
  let bestMtime = 0;
  for (const sess of sessions) {
    const sessPath = path.join(GENERATED_DIR, sess);
    let files;
    try {
      files = await readdir(sessPath);
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.endsWith('.png')) continue;
      const fp = path.join(sessPath, f);
      let st;
      try {
        st = await stat(fp);
      } catch {
        continue;
      }
      if (st.mtimeMs > bestMtime && st.mtimeMs > afterMtimeMs) {
        bestMtime = st.mtimeMs;
        bestPath = fp;
      }
    }
  }
  return bestPath;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const updateMetaAssets = async (epDir, epId, entry) => {
  const metaPath = path.join(epDir, 'meta.json');
  let meta = {episode_id: epId, image_engine: 'codex-imagegen', assets: []};
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(await readFile(metaPath, 'utf-8'));
    } catch (error) {
      throw new Error(`meta.json parse failed: ${error.message ?? error}`);
    }
  }
  if (!Array.isArray(meta.assets)) meta.assets = [];
  meta.image_engine = meta.image_engine || 'codex-imagegen';

  const normalizedFile = path.posix.normalize(entry.file);
  const assetRecord = {
    file: normalizedFile,
    scene_id: entry.sceneId,
    slot: entry.slot,
    generator: 'Codex (imagegen)',
    imagegen_prompt: entry.imagegenPrompt,
    imagegen_model: 'gpt-image-2',
    license: 'AI生成素材。公開前に利用条件を再確認',
  };

  const idx = meta.assets.findIndex((asset) => path.posix.normalize(asset?.file || '') === normalizedFile);
  if (idx >= 0) meta.assets[idx] = {...meta.assets[idx], ...assetRecord};
  else meta.assets.push(assetRecord);

  await writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n');
};

const parseArgs = () => {
  const epIds = [];
  let parallel = 1;
  for (const arg of process.argv.slice(2)) {
    const parallelMatch = arg.match(/^--parallel=(\d+)$/);
    if (parallelMatch) {
      parallel = Math.max(1, Number(parallelMatch[1]));
      continue;
    }
    epIds.push(arg);
  }
  return {epIds, parallel};
};

const runLimited = async (items, limit, worker) => {
  let next = 0;
  const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(workers);
};

const main = async () => {
  const {epIds, parallel} = parseArgs();
  if (epIds.length === 0) {
    console.error('Usage: node scripts/run-codex-imagegen-pwsh.mjs [--parallel=N] <episode_id>...');
    process.exit(1);
  }

  for (const epId of epIds) {
    const epDir = path.join(ROOT, 'script', epId);
    const scriptPath = path.join(epDir, 'script.yaml');
    if (!existsSync(scriptPath)) {
      console.error(`script.yaml not found for ${epId}`);
      continue;
    }

    // image_direction / imagegen_prompt の機械監査ゲート（image_prompt_pack ルール準拠チェック）
    const auditScript = path.join(ROOT, 'scripts', 'audit-image-prompts.mjs');
    if (existsSync(auditScript)) {
      console.log(`\n--- image prompt audit gate: ${epId} ---`);
      const auditResult = spawnSync(process.execPath, [auditScript, epId], {stdio: 'inherit'});
      if (auditResult.status !== 0) {
        if (process.env.YUKKURI_SKIP_IMAGE_GATE === '1') {
          console.warn(`** ${epId}: image prompt audit FAILED but YUKKURI_SKIP_IMAGE_GATE=1, continuing. WARNING: 画像品質低下が起きる可能性。`);
        } else {
          console.error(`\n!! ${epId}: image prompt audit FAILED. set YUKKURI_SKIP_IMAGE_GATE=1 to bypass.`);
          process.exit(1);
        }
      }
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
        const targetRel = obj.asset;
        const targetAbs = path.join(epDir, targetRel);
        if (existsSync(targetAbs)) {
          const sz = (await stat(targetAbs)).size;
          if (sz > 1000) {
            console.log(`${epId}/${scene.id}/${slot}: skip (exists, ${(sz/1024).toFixed(0)}KB)`);
            continue;
          }
        }
        targets.push({sceneId: scene.id, slot, targetRel, targetAbs, req});
      }
    }

    console.log(`\n=== ${epId}: ${targets.length} targets to generate ===`);

    const trackerPath = path.join(epDir, '.imagegen-pwsh-tracker.json');
    const tracker = {episodeId: epId, startedAt: new Date().toISOString(), entries: []};

    const processTarget = async (t) => {
      console.log(`\n[${t.sceneId} ${t.slot}] generating...`);
      const startMtime = Date.now() - 1000; // 1秒前を基準にする
      const prompt = buildPrompt(t.req);
      const t0 = Date.now();
      const {code, out, err} = await runCodexExecViaPwsh(prompt);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

      // codex exec の output から file path を抽出
      const pathMatch = out.match(/[A-Z]:\\[^\s\n"']+ig_[a-f0-9]+\.png/i);
      const reportedPath = pathMatch?.[0] || null;

      if (code !== 0 && !reportedPath) {
        console.error(`  ! ${t.sceneId}/${t.slot}: exit ${code} (${elapsed}s)`);
        if (err) console.error(`    stderr: ${err.slice(0, 1500)}`);
        if (out) console.error(`    stdout: ${out.slice(0, 1500)}`);
        tracker.entries.push({...t, status: 'failed', code, elapsed, error: err.slice(0, 1500), stdout: out.slice(0, 1500)});
        await writeFile(trackerPath, JSON.stringify(tracker, null, 2));
        return;
      }

      // 並列時の mtime fallback は別 worker の画像を拾う可能性があるため使わない
      let srcPath = reportedPath;
      if ((!srcPath || !existsSync(srcPath)) && parallel === 1) {
        await sleep(1500);
        srcPath = await findLatestImage(startMtime);
      }

      if (!srcPath || !existsSync(srcPath)) {
        console.error(`  ! ${t.sceneId}/${t.slot}: no image found (${elapsed}s, exit=${code})`);
        if (out) console.error(`    stdout: ${out.slice(0, 1500)}`);
        if (err) console.error(`    stderr: ${err.slice(0, 1500)}`);
        tracker.entries.push({...t, status: 'no-image', elapsed, code, stdout: out.slice(0, 1500), stderr: err.slice(0, 1500)});
        await writeFile(trackerPath, JSON.stringify(tracker, null, 2));
        return;
      }

      await mkdir(path.dirname(t.targetAbs), {recursive: true});
      await copyFile(srcPath, t.targetAbs);
      await updateMetaAssets(epDir, epId, {
        file: t.targetRel,
        sceneId: t.sceneId,
        slot: t.slot,
        imagegenPrompt: t.req.imagegen_prompt,
      });
      const sz = (await stat(t.targetAbs)).size;
      console.log(`  ✓ ${t.sceneId}/${t.slot}: ${(sz/1024).toFixed(0)}KB (${elapsed}s) <- ${path.basename(srcPath)}`);
      tracker.entries.push({...t, status: 'copied', elapsed, sourcePath: srcPath});
      await writeFile(trackerPath, JSON.stringify(tracker, null, 2));
    };

    if (parallel > 1) {
      console.log(`parallel: ${parallel} (reported-path only, no mtime fallback)`);
      await runLimited(targets, parallel, processTarget);
    } else {
      for (const t of targets) {
        await processTarget(t);
        if (tracker.entries.filter(e => e.status === 'no-image' || e.status === 'failed').length >= 2) {
          console.error('  → 2連続失敗で中断、tracker 確認して');
          return;
        }
      }
    }

    tracker.finishedAt = new Date().toISOString();
    await writeFile(trackerPath, JSON.stringify(tracker, null, 2));

    const ok = tracker.entries.filter((e) => e.status === 'copied').length;
    const fail = tracker.entries.length - ok;
    console.log(`\n--- ${epId}: ${ok} copied, ${fail} failed ---`);
  }

  console.log('\n=== ALL DONE ===');
};

main().catch((err) => {
  console.error(`error: ${err?.message ?? err}`);
  process.exit(1);
});
