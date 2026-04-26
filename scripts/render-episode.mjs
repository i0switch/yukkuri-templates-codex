// 単一の正規入口: prompt pack 経由ゲート → 機械監査 → lint → validate → build → composition登録 → remotion render
// 直接 build-episode.mjs / generate-episode-compositions.mjs / npx remotion を叩いて bypass されないように、
// 通常運用ではこのラッパーを使う。緊急バイパスは YUKKURI_SKIP_QUALITY_GATE=1 のみ。

import {spawnSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const episodeIds = args.filter((arg) => !arg.startsWith('--'));
const skipFlags = {
  skipRender: args.includes('--no-render'),
  skipBuild: args.includes('--no-build'),
};

if (episodeIds.length === 0) {
  console.error('Usage: node scripts/render-episode.mjs <episode_id> [<episode_id>...] [--no-build] [--no-render]');
  process.exit(2);
}

// --no-build を指定したら必ず --no-render も併用させる。
// ゲートは script.yaml を見る一方、Remotion は script.render.json を読むので、
// build をスキップしたまま render すると「監査済み YAML」と「描画される JSON」がズレる。
if (skipFlags.skipBuild && !skipFlags.skipRender) {
  console.error(
    '--no-build は --no-render と併用してください。古い script.render.json で render すると、品質ゲート済み YAML と描画内容がズレます。',
  );
  process.exit(2);
}

const runStep = (label, command, commandArgs, options = {}) => {
  console.log(`\n=== ${label} ===`);
  console.log(`$ ${command} ${commandArgs.join(' ')}`);
  const isWindowsCmd = process.platform === 'win32' && command.toLowerCase().endsWith('.cmd');
  const launchCommand = isWindowsCmd ? 'cmd.exe' : command;
  const launchArgs = isWindowsCmd ? ['/d', '/s', '/c', command, ...commandArgs] : commandArgs;
  const result = spawnSync(launchCommand, launchArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
  if (result.error) {
    throw new Error(`${label} failed to launch: ${result.error.message}`);
  }
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`${label} FAILED (exit ${result.status})`);
  }
};

const node = (script, scriptArgs = []) => runStep(script, 'node', [path.join(rootDir, 'scripts', script), ...scriptArgs]);

const ensureFileExists = async (filePath, label) => {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`${label} not found: ${filePath}`);
  }
};

for (const episodeId of episodeIds) {
  console.log(`\n##############################################`);
  console.log(`# Render pipeline for: ${episodeId}`);
  console.log(`##############################################`);

  const episodeDir = path.join(rootDir, 'script', episodeId);
  await ensureFileExists(episodeDir, 'episode directory');

  // 1. prompt pack 経由ゲート（episode 指定で strict 化）
  node('validate-script-generation-route.mjs', [episodeId]);

  // 2. 機械監査（尺・密度・語尾・最終行動）
  node('audit-script-quality.mjs', [episodeId]);

  // 3. プリチェック（lint）
  try {
    node('lint-script-pre.mjs', [episodeId]);
  } catch (error) {
    console.warn(`# WARN: lint-script-pre failed: ${error.message}. 続行する場合は手動で修正してください。`);
    throw error;
  }

  // 4. 非破壊チェック（素材・ライセンス）
  try {
    node('validate-episode-script.mjs', [episodeId]);
  } catch (error) {
    console.warn(`# WARN: validate-episode-script failed: ${error.message}`);
    throw error;
  }

  // 4b. image_direction 軽量 lint（image scene が無い episode はスキップされる）
  try {
    node('validate-image-direction.mjs', [episodeId]);
  } catch (error) {
    if (process.env.YUKKURI_SKIP_IMAGE_GATE === '1') {
      console.warn(`# WARN: image_direction lint failed but YUKKURI_SKIP_IMAGE_GATE=1, continuing.`);
    } else {
      console.warn(`# WARN: image_direction lint failed: ${error.message}. set YUKKURI_SKIP_IMAGE_GATE=1 to bypass.`);
      throw error;
    }
  }

  if (skipFlags.skipBuild) {
    console.log(`# Skipping build (--no-build)`);
  } else {
    // 5. ビルド（音声・尺・render JSON 生成）
    node('build-episode.mjs', [episodeId]);
  }

  // 6. Composition 登録
  node('generate-episode-compositions.mjs');

  if (skipFlags.skipRender) {
    console.log(`# Skipping remotion render (--no-render)`);
    continue;
  }

  // 7. Remotion レンダリング
  const compositionId = `Video-${episodeId}`;
  const outDir = path.join(rootDir, 'out', 'videos');
  await fs.mkdir(outDir, {recursive: true});
  const outPath = path.join(outDir, `${episodeId}.mp4`);
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  runStep(
    `remotion render ${compositionId}`,
    npxCommand,
    ['remotion', 'render', 'src/index.ts', compositionId, outPath, '--codec=h264', '--crf=23', '--pixel-format=yuv420p'],
  );
  console.log(`# Wrote: ${outPath}`);
}

console.log(`\nAll episodes rendered successfully: ${episodeIds.join(', ')}`);
