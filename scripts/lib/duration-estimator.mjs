import path from 'node:path';
import {readJsonFile, writeJsonFile} from './pipeline-cache.mjs';

export const TTS_SECONDS_PER_LINE = Object.freeze({
  aquestalk: 5.2,
  voicevox: 3.3,
});

export const TTS_DURATION_PROFILE_FILE = 'tts-duration-profile.json';

export const durationWindowForTarget = (targetSec) => {
  const target = Number(targetSec);
  if (!Number.isFinite(target) || target <= 0) {
    return null;
  }
  return {min: target * 0.9, max: target * 1.1};
};

const normalizeVoiceEngine = (script) => {
  const engine = String(script?.meta?.voice_engine ?? '').toLowerCase();
  return Object.hasOwn(TTS_SECONDS_PER_LINE, engine) ? engine : 'voicevox';
};

export const collectDialogueStats = (script) => {
  const scenes = Array.isArray(script?.scenes) ? script.scenes : [];
  const lines = scenes.flatMap((scene) => (Array.isArray(scene?.dialogue) ? scene.dialogue : []));
  const charCount = lines.reduce((sum, line) => sum + String(line?.text ?? '').trim().length, 0);
  return {
    sceneCount: scenes.length,
    lineCount: lines.length,
    charCount,
    averageCharsPerLine: lines.length > 0 ? charCount / lines.length : 0,
    averageLinesPerScene: scenes.length > 0 ? lines.length / scenes.length : 0,
  };
};

const measuredSecondsPerLine = async ({episodeDir, voiceEngine}) => {
  if (!episodeDir) {
    return null;
  }

  const profile = await readJsonFile(path.join(episodeDir, TTS_DURATION_PROFILE_FILE), null);
  if (
    profile?.voice_engine === voiceEngine &&
    typeof profile.actual_seconds_per_line === 'number' &&
    Number.isFinite(profile.actual_seconds_per_line) &&
    profile.actual_seconds_per_line > 0
  ) {
    return {
      secondsPerLine: profile.actual_seconds_per_line,
      source: TTS_DURATION_PROFILE_FILE,
      measuredLineCount: profile.dialogue_lines ?? null,
      measuredTotalSec: profile.total_audio_sec ?? null,
    };
  }

  const manifest = await readJsonFile(path.join(episodeDir, 'audio-manifest.json'), null);
  const entries = Object.values(manifest?.entries ?? {}).filter(
    (entry) =>
      entry?.voice_engine === voiceEngine &&
      typeof entry.duration_sec === 'number' &&
      Number.isFinite(entry.duration_sec) &&
      entry.duration_sec > 0,
  );
  if (entries.length > 0) {
    const total = entries.reduce((sum, entry) => sum + entry.duration_sec, 0);
    return {
      secondsPerLine: total / entries.length,
      source: 'audio-manifest.json',
      measuredLineCount: entries.length,
      measuredTotalSec: total,
    };
  }

  const lineDurations = await readJsonFile(path.join(episodeDir, 'line-durations.json'), null);
  const durations = Object.values(lineDurations ?? {}).filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  if (durations.length > 0) {
    const total = durations.reduce((sum, value) => sum + value, 0);
    return {
      secondsPerLine: total / durations.length,
      source: 'line-durations.json',
      measuredLineCount: durations.length,
      measuredTotalSec: total,
    };
  }

  return null;
};

export const writeTtsDurationProfile = async ({episodeDir, script, durations}) => {
  const voiceEngine = normalizeVoiceEngine(script);
  const values = Object.values(durations ?? {}).filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  if (!episodeDir || values.length === 0) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  const profile = {
    version: 1,
    updated_at: new Date().toISOString(),
    voice_engine: voiceEngine,
    dialogue_lines: values.length,
    total_audio_sec: Math.round(total * 10) / 10,
    actual_seconds_per_line: Math.round((total / values.length) * 100) / 100,
  };
  await writeJsonFile(path.join(episodeDir, TTS_DURATION_PROFILE_FILE), profile);
  return profile;
};

export const estimateEpisodeDuration = (script, options = {}) => {
  const voiceEngine = normalizeVoiceEngine(script);
  const measured = options.measured ?? null;
  const secondsPerLine = measured?.secondsPerLine ?? TTS_SECONDS_PER_LINE[voiceEngine];
  const stats = collectDialogueStats(script);
  const estimatedSec = stats.lineCount * secondsPerLine;
  const targetSec = Number(script?.meta?.target_duration_sec ?? script?.total_duration_sec ?? 0);
  const window = durationWindowForTarget(targetSec);
  const durationStatus =
    window === null
      ? 'not_applicable'
      : estimatedSec < window.min
        ? 'under'
        : estimatedSec > window.max
          ? 'over'
          : 'within';
  const recommendedLineDelta = durationStatus === 'under' ? Math.ceil((window.min - estimatedSec) / secondsPerLine) : 0;

  return {
    ok: durationStatus !== 'under',
    voice_engine: voiceEngine,
    seconds_per_line: Math.round(secondsPerLine * 100) / 100,
    seconds_per_line_source: measured?.source ?? 'default',
    actual_seconds_per_line: measured ? Math.round(measured.secondsPerLine * 100) / 100 : null,
    measured_dialogue_lines: measured?.measuredLineCount ?? null,
    measured_total_audio_sec: measured?.measuredTotalSec ? Math.round(measured.measuredTotalSec * 10) / 10 : null,
    target_duration_sec: Number.isFinite(targetSec) && targetSec > 0 ? targetSec : null,
    allowed_min_sec: window ? Math.round(window.min * 10) / 10 : null,
    allowed_max_sec: window ? Math.round(window.max * 10) / 10 : null,
    estimated_duration_sec: Math.round(estimatedSec * 10) / 10,
    duration_status: durationStatus,
    recommended_line_delta: recommendedLineDelta,
    stats: {
      scenes: stats.sceneCount,
      dialogue_lines: stats.lineCount,
      chars: stats.charCount,
      average_chars_per_line: Math.round(stats.averageCharsPerLine * 10) / 10,
      average_lines_per_scene: Math.round(stats.averageLinesPerScene * 10) / 10,
    },
  };
};

export const estimateEpisodeDurationWithMeasurements = async (script, {episodeDir} = {}) => {
  const voiceEngine = normalizeVoiceEngine(script);
  const measured = await measuredSecondsPerLine({episodeDir, voiceEngine});
  return estimateEpisodeDuration(script, {measured});
};
