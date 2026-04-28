import path from 'node:path';
import {audioLineInputHash, readAudioManifest, shouldReuseAudioLine} from './pipeline-cache.mjs';
import {sanitizeAquesTalkText} from '../aquestalk.mjs';
import {sanitizeSpeechText, VOICEVOX_SPEECH_PROFILE} from '../voicevox.mjs';

const normalizeVoiceEngine = (script) => String(script?.meta?.voice_engine ?? '').toLowerCase();

const voiceIdForLine = (script, line) => {
  if (normalizeVoiceEngine(script) === 'voicevox') {
    return line.speaker === 'left'
      ? script.characters?.left?.voicevox_speaker_id
      : script.characters?.right?.voicevox_speaker_id;
  }
  return line.speaker === 'left'
    ? script.characters?.left?.aquestalk_preset
    : script.characters?.right?.aquestalk_preset;
};

const sanitizedTextForLine = (script, line) =>
  normalizeVoiceEngine(script) === 'aquestalk'
    ? sanitizeAquesTalkText(line.text ?? '')
    : sanitizeSpeechText(line.text ?? '');

export const expectedAudioInputHash = (script, line) => {
  const voiceEngine = normalizeVoiceEngine(script);
  const input = {
    voiceEngine,
    speaker: line.speaker,
    voiceId: voiceIdForLine(script, line),
    text: sanitizedTextForLine(script, line),
  };
  if (voiceEngine === 'voicevox') {
    input.speechProfile = VOICEVOX_SPEECH_PROFILE;
  }
  return audioLineInputHash(input);
};

export const collectAudioManifestIssues = async ({episodeDir, script}) => {
  const manifest = await readAudioManifest(episodeDir);
  const issues = [];

  for (const scene of script.scenes ?? []) {
    for (const line of scene.dialogue ?? []) {
      const key = `${scene.id}_${line.id}`;
      const entry = manifest?.entries?.[key];
      const expectedHash = expectedAudioInputHash(script, line);
      const outFile = path.join(episodeDir, entry?.file ?? `audio/${key}.wav`);

      if (entry?.adopted_from === 'line-durations.json') {
        issues.push({
          key,
          reason: 'legacy_line_durations_adopted',
          message: `${key}: legacy line-durations.json audio adoption is not allowed; rebuild with --force-audio`,
        });
        continue;
      }

      const reusable = await shouldReuseAudioLine({
        manifest,
        key,
        outFile,
        inputHash: expectedHash,
      });
      if (!reusable.ok) {
        issues.push({
          key,
          reason: reusable.reason,
          expected_hash: expectedHash,
          actual_hash: entry?.input_hash ?? null,
          message: `${key}: audio manifest does not match current dialogue text (${reusable.reason})`,
        });
      }
    }
  }

  return issues;
};

export const assertAudioManifestMatchesScript = async ({episodeDir, script}) => {
  const issues = await collectAudioManifestIssues({episodeDir, script});
  if (issues.length > 0) {
    const sample = issues.slice(0, 8).map((issue) => `- ${issue.message}`).join('\n');
    throw new Error(`Audio manifest validation failed (${issues.length} issue(s)).\n${sample}`);
  }
  return {ok: true};
};
