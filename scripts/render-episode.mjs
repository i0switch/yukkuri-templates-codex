import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const episodeId = process.argv[2];
const outputPath = process.argv[3] ?? path.join('out', 'videos', `${episodeId}.mp4`);
const publicDir = path.join(rootDir, 'public');
const targetPublicDir = path.join(rootDir, '.remotion-public', episodeId);

if (!episodeId) {
  throw new Error('Usage: node scripts/render-episode.mjs <episode_id> [out/videos/file.mp4]');
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    shell: options.shell ?? false,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 64,
  });
  if (result.stdout) {
    console.log(result.stdout.trim());
  }
  if (result.stderr) {
    console.error(result.stderr.trim());
  }
  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(' ')} (status=${result.status}, signal=${result.signal ?? 'none'}, error=${
        result.error?.message ?? 'none'
      })`,
    );
  }
};

const copyDirectory = async (fromDir, toDir) => {
  await fs.mkdir(toDir, {recursive: true});
  const entries = await fs.readdir(fromDir, {withFileTypes: true});
  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(fromPath, toPath);
      continue;
    }

    await fs.copyFile(fromPath, toPath);
  }
};

const copyIfExists = async (fromDir, toDir) => {
  try {
    await fs.access(fromDir);
  } catch {
    return;
  }
  await copyDirectory(fromDir, toDir);
};

const prepareTargetPublicDir = async () => {
  await fs.rm(targetPublicDir, {recursive: true, force: true});
  await fs.mkdir(targetPublicDir, {recursive: true});

  await copyIfExists(path.join(publicDir, 'backgrounds'), path.join(targetPublicDir, 'backgrounds'));
  await copyIfExists(path.join(publicDir, 'fonts'), path.join(targetPublicDir, 'fonts'));

  for (const character of ['reimu', 'marisa', 'zundamon', 'metan']) {
    await copyIfExists(path.join(publicDir, 'characters', character), path.join(targetPublicDir, 'characters', character));
  }

  await copyDirectory(path.join(publicDir, 'episodes', episodeId), path.join(targetPublicDir, 'episodes', episodeId));
};

run(process.execPath, ['scripts/pre-render-gate.mjs', episodeId]);
run(process.execPath, ['scripts/build-episode.mjs', episodeId]);
run(process.execPath, ['scripts/generate-episode-compositions.mjs', episodeId]);
await prepareTargetPublicDir();
run(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  [
    'remotion',
    'render',
    'src/index.ts',
    `Video-${episodeId}`,
    outputPath,
    '--public-dir',
    path.relative(rootDir, targetPublicDir),
    '--log=error',
  ],
  {shell: process.platform === 'win32'},
);
