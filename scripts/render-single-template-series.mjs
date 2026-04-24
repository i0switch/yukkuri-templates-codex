import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'out', 'videos');
const pairArgIndex = process.argv.findIndex((value) => value === '--pair');
const pairId = (pairArgIndex >= 0 ? process.argv[pairArgIndex + 1] : 'ZM')?.toUpperCase() ?? 'ZM';

const pairConfigs = {
  ZM: {
    manifestPath: path.join(rootDir, 'script', 'single-template-series.manifest.json'),
    reportPath: path.join(outputDir, 'single-template-series.report.json'),
  },
  RM: {
    manifestPath: path.join(rootDir, 'script', 'single-template-series-rm.manifest.json'),
    reportPath: path.join(outputDir, 'single-template-series-rm.report.json'),
  },
};

const pairConfig = pairConfigs[pairId];

if (!pairConfig) {
  throw new Error(`Unsupported pair: ${pairId}`);
}

const {manifestPath, reportPath} = pairConfig;

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

const run = async (command, args, options = {}) => {
  const invocation =
    process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')
      ? ['cmd.exe', ['/d', '/s', '/c', command, ...args]]
      : [command, args];
  const {stdout, stderr} = await execFileAsync(invocation[0], invocation[1], {
    cwd: rootDir,
    maxBuffer: 1024 * 1024 * 32,
    ...options,
  });
  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }
};

const ffprobeJson = async (filePath) => {
  const {stdout} = await execFileAsync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,width,height,sample_rate,channels',
      '-of',
      'json',
      filePath,
    ],
    {
      cwd: rootDir,
      maxBuffer: 1024 * 1024 * 8,
    },
  );
  return JSON.parse(stdout);
};

await fs.mkdir(outputDir, {recursive: true});

for (const episode of manifest.episodes) {
  await run('node', ['scripts/build-episode.mjs', episode.episode_id]);
}

await run('node', ['scripts/generate-episode-compositions.mjs']);
await run('npx.cmd', ['tsc', '--noEmit']);

const report = [];

for (const episode of manifest.episodes) {
  const compositionId = `Video-${episode.episode_id}`;
  const rawPath = path.join(outputDir, `${episode.episode_id}-raw.mp4`);
  const finalPath = path.join(outputDir, `${episode.episode_id}.mp4`);

  await run('npx.cmd', [
    'remotion',
    'render',
    'src/index.ts',
    compositionId,
    rawPath,
    '--codec=h264',
    '--crf=23',
    '--pixel-format=yuv420p',
  ]);

  await run('ffmpeg', [
    '-y',
    '-i',
    rawPath,
    '-c:v',
    'libx264',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-ac',
    '2',
    '-ar',
    '48000',
    finalPath,
  ]);

  const probe = await ffprobeJson(finalPath);
  report.push({
    episode_id: episode.episode_id,
    template: episode.template,
    title: episode.title,
    output: finalPath,
    probe,
  });
}

await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({reportPath, count: report.length}, null, 2));
