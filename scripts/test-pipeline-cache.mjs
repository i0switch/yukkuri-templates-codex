import fs from 'node:fs/promises';
import path from 'node:path';
import {
  audioLineInputHash,
  fileSha256,
  readAudioManifest,
  shouldReuseAudioLine,
  shouldReuseLegacyAudioLine,
  writeAudioManifest,
} from './lib/pipeline-cache.mjs';

const rootDir = process.cwd();
const fixtureDir = path.join(rootDir, '.cache', 'pipeline-cache-test');

await fs.rm(fixtureDir, {recursive: true, force: true});
await fs.mkdir(fixtureDir, {recursive: true});

const audioFile = path.join(fixtureDir, 's01_l01.wav');
await fs.writeFile(audioFile, 'cached wav bytes', 'utf8');

const firstHash = audioLineInputHash({voiceEngine: 'voicevox', speaker: 'left', voiceId: 3, text: '同じ台詞'});
const secondHash = audioLineInputHash({voiceEngine: 'voicevox', speaker: 'left', voiceId: 3, text: '同じ台詞'});
const changedTextHash = audioLineInputHash({voiceEngine: 'voicevox', speaker: 'left', voiceId: 3, text: '違う台詞'});
const oldVoicevoxProfileHash = audioLineInputHash({
  voiceEngine: 'voicevox',
  speaker: 'left',
  voiceId: 3,
  text: '同じ台詞',
  speechProfile: {speedScale: 1.32},
});
const currentVoicevoxProfileHash = audioLineInputHash({
  voiceEngine: 'voicevox',
  speaker: 'left',
  voiceId: 3,
  text: '同じ台詞',
  speechProfile: {speedScale: 1.15},
});

if (firstHash !== secondHash) {
  throw new Error('audioLineInputHash must be stable for identical line inputs');
}
if (firstHash === changedTextHash) {
  throw new Error('audioLineInputHash must change when dialogue text changes');
}
if (oldVoicevoxProfileHash === currentVoicevoxProfileHash) {
  throw new Error('audioLineInputHash must change when VOICEVOX speech profile changes');
}

await writeAudioManifest(fixtureDir, {
  version: 1,
  entries: {
    s01_l01: {
      file: 'audio/s01_l01.wav',
      input_hash: firstHash,
      duration_sec: 1.23,
      file_sha256: await fileSha256(audioFile),
    },
  },
});

const manifest = await readAudioManifest(fixtureDir);
const reusable = await shouldReuseAudioLine({
  episodeDir: fixtureDir,
  manifest,
  key: 's01_l01',
  outFile: audioFile,
  inputHash: firstHash,
});
if (!reusable.ok || reusable.durationSec !== 1.23) {
  throw new Error(`Expected reusable cached audio line, got ${JSON.stringify(reusable)}`);
}

const stale = await shouldReuseAudioLine({
  episodeDir: fixtureDir,
  manifest,
  key: 's01_l01',
  outFile: audioFile,
  inputHash: changedTextHash,
});
if (stale.ok || stale.reason !== 'input_hash_mismatch') {
  throw new Error(`Expected changed text to invalidate cached audio, got ${JSON.stringify(stale)}`);
}

const legacy = await shouldReuseLegacyAudioLine({
  lineDurations: {s01_l01: 1.23},
  key: 's01_l01',
  outFile: audioFile,
});
if (!legacy.ok || legacy.durationSec !== 1.23 || typeof legacy.fileSha256 !== 'string') {
  throw new Error(`Expected legacy line-durations audio to be reusable, got ${JSON.stringify(legacy)}`);
}

console.log(JSON.stringify({ok: true, tested: ['audio-line-hash', 'speech-profile-hash', 'audio-cache-reuse', 'audio-cache-invalidation', 'legacy-audio-cache-adoption']}, null, 2));
