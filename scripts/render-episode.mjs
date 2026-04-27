import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {hashPaths, readRenderManifest, writeRenderManifest} from './lib/pipeline-cache.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];
const args = process.argv.slice(3);
const outputArg = args.find((arg) => !arg.startsWith('--'));
const outputPath = outputArg ?? path.join('out', 'videos', `${episodeId}.mp4`);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const force = flags.has('--force');
const forceAudio = force || flags.has('--force-audio');
const forceRender = force || flags.has('--force-render');
const publicDir = path.join(rootDir, 'public');
const targetPublicDir = path.join(rootDir, '.remotion-public', episodeId);
const compositionEpisodeId = episodeId.replace(/[^a-zA-Z0-9\u3040-\u30ff\u3400-\u9fff-]+/g, '-');
const episodeDir = path.join(rootDir, 'script', episodeId);

if (!episodeId) {
  throw new Error('Usage: node scripts/render-episode.mjs <episode_id> [out/videos/file.mp4] [--force|--force-audio|--force-images|--force-render]');
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
  await copyIfExists(path.join(publicDir, 'se'), path.join(targetPublicDir, 'se'));

  for (const character of ['reimu', 'marisa', 'zundamon', 'metan']) {
    await copyIfExists(path.join(publicDir, 'characters', character), path.join(targetPublicDir, 'characters', character));
  }

  await copyDirectory(path.join(publicDir, 'episodes', episodeId), path.join(targetPublicDir, 'episodes', episodeId));
};

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const renderInputHash = async () =>
  hashPaths(
    [
      path.join(episodeDir, 'script.render.json'),
      path.join(rootDir, 'src'),
      path.join(publicDir, 'backgrounds'),
      path.join(publicDir, 'fonts'),
      path.join(publicDir, 'se'),
      path.join(publicDir, 'characters', 'reimu'),
      path.join(publicDir, 'characters', 'marisa'),
      path.join(publicDir, 'characters', 'zundamon'),
      path.join(publicDir, 'characters', 'metan'),
      path.join(publicDir, 'episodes', episodeId),
      path.join(rootDir, 'package.json'),
    ],
    {rootDir},
  );

const artifactInputHashes = async () => ({
  script_final: await hashPaths([path.join(episodeDir, 'script_final.md')], {rootDir}),
  script_yaml: await hashPaths([path.join(episodeDir, 'script.yaml')], {rootDir}),
  image_prompts: await hashPaths([path.join(episodeDir, 'image_prompt_v2.md'), path.join(episodeDir, 'image_prompts.json')], {
    rootDir,
  }),
  image_files: await hashPaths([path.join(episodeDir, 'assets')], {rootDir}),
  bgm_files: await hashPaths([path.join(episodeDir, 'bgm')], {rootDir}),
  render_json: await hashPaths([path.join(episodeDir, 'script.render.json')], {rootDir}),
});

run(process.execPath, ['scripts/select-bgm.mjs', episodeId, ...(force ? ['--force-bgm'] : [])]);
run(process.execPath, ['scripts/pre-render-gate.mjs', episodeId]);
run(process.execPath, [
  'scripts/build-episode.mjs',
  episodeId,
  '--skip-quality-gate',
  ...(forceAudio ? ['--force-audio'] : []),
]);
run(process.execPath, ['scripts/generate-episode-compositions.mjs', episodeId]);
const inputHash = await renderInputHash();
const inputs = await artifactInputHashes();
const renderManifest = await readRenderManifest(episodeDir);
const resolvedOutputPath = path.resolve(rootDir, outputPath);
if (!forceRender && renderManifest.input_hash === inputHash && (await fileExists(resolvedOutputPath))) {
  console.log(
    JSON.stringify(
      {
        episodeId,
        render_cache: {
          status: 'skipped',
          reason: 'render input hash unchanged',
          output: path.relative(rootDir, resolvedOutputPath).replaceAll('\\', '/'),
        },
      },
      null,
      2,
    ),
  );
} else {
  await prepareTargetPublicDir();
  run(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'remotion',
      'render',
      'src/index.ts',
      `Video-${compositionEpisodeId}`,
      outputPath,
      '--public-dir',
      path.relative(rootDir, targetPublicDir),
      '--log=error',
    ],
    {shell: process.platform === 'win32'},
  );
  await writeRenderManifest(episodeDir, {
    input_hash: inputHash,
    inputs,
    output: path.relative(rootDir, resolvedOutputPath).replaceAll('\\', '/'),
    composition_id: `Video-${compositionEpisodeId}`,
  });
}
