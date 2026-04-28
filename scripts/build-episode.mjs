import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';
import {buildAudioForEpisode} from './voicevox.mjs';
import {buildAudioForEpisodeAquesTalk} from './aquestalk.mjs';
import {formatEpisodeValidationResult, validateEpisodeScript} from './lib/episode-validator.mjs';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';
import {assertAudioManifestMatchesScript} from './lib/audio-manifest-validator.mjs';
import {writeTtsDurationProfile} from './lib/duration-estimator.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];
const flags = new Set(process.argv.slice(3));
const forceAudio = flags.has('--force') || flags.has('--force-audio');

if (!episodeId) {
  throw new Error('Usage: node scripts/build-episode.mjs <episode_id> [--force|--force-audio]');
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

const assertStructuralPreflight = () => {
  for (const args of [
    ['scripts/validate-script-generation-route.mjs'],
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
      throw new Error(`Pre-build structural preflight failed: node ${args.join(' ')}`);
    }
  }
};

const durationWindowForTarget = (targetSec) => {
  if (!Number.isFinite(targetSec) || targetSec <= 0) {
    return null;
  }
  return {min: targetSec * 0.9, max: targetSec * 1.1};
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
  const durationWindow = durationWindowForTarget(Number(targetTotal));
  if (durationWindow && naturalTotal < durationWindow.min) {
    throw new Error(
      `Natural speech duration is too short for target_duration_sec without changing speech speed: natural=${round1(naturalTotal)}s, allowed_min=${round1(durationWindow.min)}s. Increase dialogue density instead of using audio_playback_rate.`,
    );
  }
  if (durationWindow && naturalTotal > durationWindow.max) {
    console.warn(
      `Natural speech duration exceeds target_duration_sec window, but natural overrun is allowed and script_final.md must stay unchanged for duration: natural=${round1(naturalTotal)}s, allowed_max=${round1(durationWindow.max)}s. Keeping the script unchanged.`,
    );
  }

  let runningTotal = 0;
  script.scenes = script.scenes.map((scene, index) => {
    const timing = naturalSceneDurations[index];
    const durationSec = round1(timing.naturalDurationSec);
    runningTotal += durationSec;
    return {
      ...scene,
      dialogue: timing.dialogue,
      tail_pad_sec: 0,
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
    meta: {
      ...script.meta,
      fps: script.meta?.fps ?? 30,
    },
    scenes: script.scenes,
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
assertStructuralPreflight();
const durations =
  script.meta.voice_engine === 'aquestalk'
    ? await buildAudioForEpisodeAquesTalk(episodeDir, script, {forceAudio})
    : await buildAudioForEpisode(episodeDir, script, {forceAudio});
const updatedScript = buildTimings(script, durations);
await writeTtsDurationProfile({episodeDir, script: updatedScript, durations});
await assertValidScript(updatedScript, 'Post-build');
await assertAudioManifestMatchesScript({episodeDir, script: updatedScript});
await buildRenderJson(updatedScript);
console.log(JSON.stringify({episodeId, total_duration_sec: updatedScript.total_duration_sec}, null, 2));



