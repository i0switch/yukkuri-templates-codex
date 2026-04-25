import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';
import {formatEpisodeValidationResult, validateEpisodeScript} from './lib/episode-validator.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-video.mjs <episode_id> [path/to/video.mp4]');
}

const episodeId = target.replace(/^Video-/, '');
const episodeDir = path.resolve(rootDir, 'script', episodeId);
const explicitVideoPath = process.argv[3];
const videoPath = explicitVideoPath
  ? path.resolve(rootDir, explicitVideoPath)
  : path.resolve(rootDir, 'out', 'videos', `${episodeId}.mp4`);

const DELIVERY_PROFILE = {
  width: 1920,
  height: 1080,
  fps: 30,
  max_silence_sec: 0.5,
  duration_tolerance_sec: 1,
};

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const readScript = async () => {
  const renderJsonPath = path.join(episodeDir, 'script.render.json');
  const scriptYamlPath = path.join(episodeDir, 'script.yaml');

  try {
    return {
      path: renderJsonPath,
      script: JSON.parse(await fs.readFile(renderJsonPath, 'utf8')),
    };
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    path: scriptYamlPath,
    script: parseDocument(await fs.readFile(scriptYamlPath, 'utf8')).toJS(),
  };
};

const runTool = (command, args) => {
  const result = spawnSync(command, args, {encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout || result.status}`);
  }

  return result;
};

const parseFps = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const [numerator, denominator] = value.split('/').map((part) => Number.parseFloat(part));
  if (!Number.isFinite(numerator)) {
    return null;
  }
  if (!Number.isFinite(denominator) || denominator === 0) {
    return numerator;
  }

  return numerator / denominator;
};

const probeVideo = (filePath) => {
  const result = runTool('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=index,codec_type,width,height,r_frame_rate,avg_frame_rate,duration',
    '-show_entries',
    'format=duration,size',
    '-of',
    'json',
    filePath,
  ]);

  return JSON.parse(result.stdout);
};

const detectSilence = (filePath) => {
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', filePath, '-af', 'silencedetect=n=-45dB:d=0.5', '-f', 'null', '-'],
    {encoding: 'utf8'},
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg silencedetect failed: ${result.stderr || result.stdout || result.status}`);
  }

  const combined = `${result.stdout}\n${result.stderr}`;
  const matches = [...combined.matchAll(/silence_duration:\s*([0-9.]+)/g)];
  return matches.map((match) => Number.parseFloat(match[1])).filter((value) => Number.isFinite(value));
};

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const audit = async () => {
  const errors = [];
  const warnings = [];
  const {path: scriptPath, script} = await readScript();

  const validation = await validateEpisodeScript(script, {episodeDir});
  for (const error of validation.errors) {
    pushIssue(errors, 'error', 'script-validation', error.message, {path: error.path});
  }
  for (const warning of validation.warnings) {
    pushIssue(warnings, 'warning', 'script-validation', warning.message, {path: warning.path});
  }

  if (!(await fileExists(videoPath))) {
    pushIssue(errors, 'error', 'video-missing', `MP4 does not exist: ${path.relative(rootDir, videoPath)}`);
  }

  if (script.bgm?.file) {
    if (!(await fileExists(path.join(episodeDir, script.bgm.file)))) {
      pushIssue(errors, 'error', 'bgm-missing', `BGM file does not exist: ${script.bgm.file}`);
    }
  } else {
    pushIssue(errors, 'error', 'bgm-missing', 'script.bgm.file is required for delivery-quality video audit');
  }

  if (
    script.meta?.width !== DELIVERY_PROFILE.width ||
    script.meta?.height !== DELIVERY_PROFILE.height ||
    script.meta?.fps !== DELIVERY_PROFILE.fps
  ) {
    pushIssue(
      errors,
      'error',
      'delivery-profile-mismatch',
      `script.meta must target ${DELIVERY_PROFILE.width}x${DELIVERY_PROFILE.height} @ ${DELIVERY_PROFILE.fps}fps`,
      {
        expected: {
          width: DELIVERY_PROFILE.width,
          height: DELIVERY_PROFILE.height,
          fps: DELIVERY_PROFILE.fps,
        },
        actual: {
          width: script.meta?.width,
          height: script.meta?.height,
          fps: script.meta?.fps,
        },
      },
    );
  }

  let probe = null;
  let silenceDurations = [];
  if (errors.length === 0 || (await fileExists(videoPath))) {
    probe = probeVideo(videoPath);
    const videoStream = probe.streams?.find((stream) => stream.codec_type === 'video');
    const audioStream = probe.streams?.find((stream) => stream.codec_type === 'audio');
    const durationSec = Number.parseFloat(probe.format?.duration ?? videoStream?.duration ?? 'NaN');
    const expectedDuration = script.total_duration_sec;

    if (!videoStream) {
      pushIssue(errors, 'error', 'video-stream-missing', 'MP4 has no video stream');
    } else {
      if (videoStream.width !== DELIVERY_PROFILE.width || videoStream.height !== DELIVERY_PROFILE.height) {
        pushIssue(
          errors,
          'error',
          'resolution-mismatch',
          `Expected ${DELIVERY_PROFILE.width}x${DELIVERY_PROFILE.height}, got ${videoStream.width}x${videoStream.height}`,
        );
      }

      const fps = parseFps(videoStream.avg_frame_rate) ?? parseFps(videoStream.r_frame_rate);
      if (Math.abs(fps - DELIVERY_PROFILE.fps) > 0.01) {
        pushIssue(errors, 'error', 'fps-mismatch', `Expected ${DELIVERY_PROFILE.fps}fps, got ${fps}`);
      }
    }

    if (!audioStream) {
      pushIssue(errors, 'error', 'audio-stream-missing', 'MP4 has no audio stream');
    }

    if (
      typeof expectedDuration === 'number' &&
      Number.isFinite(durationSec) &&
      Math.abs(durationSec - expectedDuration) > DELIVERY_PROFILE.duration_tolerance_sec
    ) {
      pushIssue(errors, 'error', 'duration-mismatch', `Expected ${expectedDuration}s ±1s, got ${Math.round(durationSec * 100) / 100}s`);
    }

    if (audioStream) {
      silenceDurations = detectSilence(videoPath);
      const longSilences = silenceDurations.filter((duration) => duration >= DELIVERY_PROFILE.max_silence_sec);
      if (longSilences.length > 0) {
        pushIssue(
          errors,
          'error',
          'long-silence',
          `Detected ${longSilences.length} silence gaps >= 0.5s`,
          {durations_sec: longSilences.map((value) => Math.round(value * 1000) / 1000)},
        );
      }
    }
  }

  const report = {
    ok: errors.length === 0,
    episode_id: episodeId,
    checked_at: new Date().toISOString(),
    delivery_profile: DELIVERY_PROFILE,
    script_path: path.relative(rootDir, scriptPath),
    video_path: path.relative(rootDir, videoPath),
    errors,
    warnings,
    probe,
    silence_durations_sec: silenceDurations,
    script_validation: formatEpisodeValidationResult(validation),
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
