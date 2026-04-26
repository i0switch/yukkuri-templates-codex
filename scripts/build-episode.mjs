import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';
import {buildAudioForEpisode} from './voicevox.mjs';
import {buildAudioForEpisodeAquesTalk} from './aquestalk.mjs';
import {formatEpisodeValidationResult, validateEpisodeScript} from './lib/episode-validator.mjs';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/build-episode.mjs <episode_id>');
}

const episodeDir = path.join(rootDir, 'script', episodeId);
const scriptPath = path.join(episodeDir, 'script.yaml');
const renderJsonPath = path.join(episodeDir, 'script.render.json');
const publicEpisodeDir = path.join(rootDir, 'public', 'episodes', episodeId);

const readYamlDocument = async () => parseDocument(await fs.readFile(scriptPath, 'utf8'));

const round1 = (value) => Math.round(value * 10) / 10;

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, {recursive: true});
};

const copyDirectoryContents = async (fromDir, toDir) => {
  try {
    await fs.access(fromDir);
  } catch {
    return;
  }

  await ensureDir(toDir);
  const entries = await fs.readdir(fromDir, {withFileTypes: true});
  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectoryContents(fromPath, toPath);
      continue;
    }

    await fs.copyFile(fromPath, toPath);
  }
};

const assertValidScript = async (script, stage) => {
  const result = await validateEpisodeScript(script, {episodeDir});
  const details = formatEpisodeValidationResult(result);
  if (details) {
    console.warn(details);
  }
  if (!result.ok) {
    throw new Error(`${stage} validation failed`);
  }
};

const assertQualityGate = () => {
  for (const args of [
    ['scripts/validate-script-generation-route.mjs'],
    ['scripts/audit-script-quality.mjs', episodeId],
    ['scripts/audit-image-prompts.mjs', episodeId],
    ['scripts/audit-episode-quality.mjs', episodeId],
    ['scripts/audit-generated-images.mjs', episodeId],
  ]) {
    const result = spawnSync(process.execPath, args, {
      cwd: rootDir,
      encoding: 'utf8',
      windowsHide: true,
    });
    if (result.stdout) {
      console.log(result.stdout.trim());
    }
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
    if (result.status !== 0) {
      throw new Error(`Pre-build quality gate failed: node ${args.join(' ')}`);
    }
  }
};

const buildTimings = (script, durations) => {
  const naturalSceneDurations = [];
  for (const scene of script.scenes) {
    let cursor = 0.14;
    const dialogue = [];
    for (const line of scene.dialogue) {
      const prePause = line.pre_pause_sec ?? 0.08;
      const postPause = line.post_pause_sec ?? 0.22;
      const wavSec = durations[`${scene.id}_${line.id}`];
      if (typeof wavSec !== 'number' || !Number.isFinite(wavSec) || wavSec <= 0) {
        throw new Error(`Missing or invalid audio duration: ${scene.id}/${line.id}`);
      }
      const startSec = cursor + prePause;
      const endSec = startSec + wavSec;
      dialogue.push({
        ...line,
        pre_pause_sec: prePause,
        post_pause_sec: postPause,
        wav_sec: wavSec,
        start_sec: round1(startSec),
        end_sec: round1(endSec),
      });
      cursor = endSec + postPause;
    }

    naturalSceneDurations.push({
      id: scene.id,
      naturalDurationSec: cursor + 0.18,
      dialogue,
    });
  }

  const naturalTotal = naturalSceneDurations.reduce((sum, scene) => sum + scene.naturalDurationSec, 0);
  const targetTotal = script.meta.target_duration_sec ?? naturalTotal;
  const remainingGap = Math.max(targetTotal - naturalTotal, 0);
  const scenePadding = remainingGap / naturalSceneDurations.length;

  let runningTotal = 0;
  script.scenes = script.scenes.map((scene, index) => {
    const timing = naturalSceneDurations[index];
    const tailPadSec = round1(scenePadding);
    const durationSec = round1(timing.naturalDurationSec + tailPadSec);
    runningTotal += durationSec;
    return {
      ...scene,
      dialogue: timing.dialogue,
      tail_pad_sec: tailPadSec,
      duration_sec: durationSec,
    };
  });

  script.total_duration_sec = round1(runningTotal);
  return script;
};

const buildRenderJson = async (script) => {
  await ensureDir(publicEpisodeDir);
  await copyDirectoryContents(path.join(episodeDir, 'audio'), path.join(publicEpisodeDir, 'audio'));
  await copyDirectoryContents(path.join(episodeDir, 'assets'), path.join(publicEpisodeDir, 'assets'));
  await copyDirectoryContents(path.join(episodeDir, 'bgm'), path.join(publicEpisodeDir, 'bgm'));

  const renderData = {
    ...script,
    scenes: script.scenes.map(({scene_template: _sceneTemplate, ...scene}) => scene),
    public_dir: `episodes/${episodeId}`,
    base_layout_width: 1920,
    base_layout_height: 1080,
  };

  await fs.writeFile(renderJsonPath, JSON.stringify(renderData, null, 2));
};

await loadScriptPromptPack(rootDir);
const document = await readYamlDocument();
const script = document.toJS();
await assertValidScript(script, 'Pre-build');
assertQualityGate();
const durations =
  script.meta.voice_engine === 'aquestalk'
    ? await buildAudioForEpisodeAquesTalk(episodeDir, script)
    : await buildAudioForEpisode(episodeDir, script);
const updatedScript = buildTimings(script, durations);
await assertValidScript(updatedScript, 'Post-build');
await buildRenderJson(updatedScript);
console.log(JSON.stringify({episodeId, total_duration_sec: updatedScript.total_duration_sec}, null, 2));



