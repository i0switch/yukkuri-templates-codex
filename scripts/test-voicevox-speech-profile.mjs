import {applyVoicevoxSpeechProfile, VOICEVOX_SPEECH_PROFILE} from './voicevox.mjs';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(VOICEVOX_SPEECH_PROFILE.speedScale === 1.15, 'VOICEVOX speedScale must be fixed at 1.15');

const query = applyVoicevoxSpeechProfile({
  speedScale: 1.32,
  intonationScale: 1.0,
  volumeScale: 0.8,
  prePhonemeLength: 0.1,
  postPhonemeLength: 0.1,
});

assert(query.speedScale === 1.15, 'VOICEVOX query speedScale must be overwritten to 1.15');
assert(query.intonationScale === VOICEVOX_SPEECH_PROFILE.intonationScale, 'VOICEVOX intonationScale must use the fixed profile');
assert(query.volumeScale === VOICEVOX_SPEECH_PROFILE.volumeScale, 'VOICEVOX volumeScale must use the fixed profile');
assert(query.prePhonemeLength === VOICEVOX_SPEECH_PROFILE.prePhonemeLength, 'VOICEVOX prePhonemeLength must use the fixed profile');
assert(query.postPhonemeLength === VOICEVOX_SPEECH_PROFILE.postPhonemeLength, 'VOICEVOX postPhonemeLength must use the fixed profile');

console.log(JSON.stringify({ok: true, speedScale: VOICEVOX_SPEECH_PROFILE.speedScale}, null, 2));
