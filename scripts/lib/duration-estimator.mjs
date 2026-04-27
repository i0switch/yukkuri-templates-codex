export const TTS_SECONDS_PER_LINE = Object.freeze({
  aquestalk: 5.2,
  voicevox: 3.8,
});

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

export const estimateEpisodeDuration = (script) => {
  const voiceEngine = normalizeVoiceEngine(script);
  const secondsPerLine = TTS_SECONDS_PER_LINE[voiceEngine];
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
    seconds_per_line: secondsPerLine,
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
