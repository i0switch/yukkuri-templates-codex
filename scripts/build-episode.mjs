import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';
import {buildAudioForEpisode} from './voicevox.mjs';
import {buildAudioForEpisodeAquesTalk} from './aquestalk.mjs';
import {formatEpisodeValidationResult, validateEpisodeScript} from './lib/episode-validator.mjs';
import {ensureEpisodeBgm} from './lib/episode-bgm.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/build-episode.mjs <episode_id>');
}

const skipQualityGate = process.env.YUKKURI_SKIP_QUALITY_GATE === '1';

const runQualityGate = (gateScript, gateLabel) => {
  const gatePath = path.join(rootDir, 'scripts', gateScript);
  const result = spawnSync('node', [gatePath, episodeId], {
    cwd: rootDir,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
  if (result.error) {
    throw new Error(`${gateLabel} gate launch failed: ${result.error.message}`);
  }
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(
      `${gateLabel} gate FAILED for ${episodeId} (exit ${result.status}). ` +
      `_reference/script_prompt_pack 経由で台本を作り直してから再実行してください。` +
      ` (緊急バイパス: 環境変数 YUKKURI_SKIP_QUALITY_GATE=1)`
    );
  }
};

if (skipQualityGate) {
  console.warn(`# WARNING: YUKKURI_SKIP_QUALITY_GATE=1 が設定されています。prompt pack ゲートと品質監査をスキップします。`);
} else {
  runQualityGate('validate-script-generation-route.mjs', 'prompt pack route');
  runQualityGate('audit-script-quality.mjs', 'script quality');
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

const buildTimings = (script, durations) => {
  const naturalSceneDurations = [];
  for (const scene of script.scenes) {
    let cursor = 0.05;
    const dialogue = [];
    for (const line of scene.dialogue) {
      const prePause = line.pre_pause_sec ?? 0.08;
      const postPause = line.post_pause_sec ?? 0.10;
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
      naturalDurationSec: cursor + 0.06,
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
    public_dir: `episodes/${episodeId}`,
    base_layout_width: 1920,
    base_layout_height: 1080,
  };

  await fs.writeFile(renderJsonPath, JSON.stringify(renderData, null, 2));
};

const logImageEngine = () => {
  const resolverPath = path.join(rootDir, 'scripts', 'resolve-image-engine.mjs');
  const result = spawnSync('node', [resolverPath], {encoding: 'utf-8'});
  if (result.error) {
    console.warn(`# image engine resolver failed: ${result.error.message}`);
    return;
  }
  const engine = (result.stdout ?? '').trim();
  if (engine) {
    console.log(`# image engine: ${engine}`);
  }
  const stderr = (result.stderr ?? '').trim();
  if (stderr !== '') {
    console.warn(stderr);
  }
};

logImageEngine();

const document = await readYamlDocument();
const script = document.toJS();
await assertValidScript(script, 'Pre-build');
const scriptWithBgm = await ensureEpisodeBgm({script, document, episodeDir, scriptPath, rootDir});
const durations =
  scriptWithBgm.meta.voice_engine === 'aquestalk'
    ? await buildAudioForEpisodeAquesTalk(episodeDir, scriptWithBgm)
    : await buildAudioForEpisode(episodeDir, scriptWithBgm);
const updatedScript = buildTimings(scriptWithBgm, durations);
await assertValidScript(updatedScript, 'Post-build');
await buildRenderJson(updatedScript);
console.log(JSON.stringify({episodeId, total_duration_sec: updatedScript.total_duration_sec}, null, 2));
