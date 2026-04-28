import fs from 'node:fs/promises';
import path from 'node:path';
import {
  collectAudioManifestIssues,
  expectedAudioInputHash,
} from './lib/audio-manifest-validator.mjs';
import {fileSha256, writeAudioManifest} from './lib/pipeline-cache.mjs';

const rootDir = process.cwd();
const fixtureDir = path.join(rootDir, '.cache', 'audio-manifest-validator-test');

await fs.rm(fixtureDir, {recursive: true, force: true});
await fs.mkdir(path.join(fixtureDir, 'audio'), {recursive: true});

const writeAudio = async (file, content) => {
  const outFile = path.join(fixtureDir, file);
  await fs.writeFile(outFile, content, 'utf8');
  return outFile;
};

const voicevoxScript = {
  meta: {id: 'voicevox-fixture', voice_engine: 'voicevox'},
  characters: {
    left: {voicevox_speaker_id: 3},
    right: {voicevox_speaker_id: 2},
  },
  scenes: [
    {
      id: 's01',
      dialogue: [
        {id: 'l01', speaker: 'left', text: '通知、ショートカット、ウィジェットを見直すのだ。'},
      ],
    },
  ],
};

const aquestalkScript = {
  meta: {id: 'aquestalk-fixture', voice_engine: 'aquestalk'},
  characters: {
    left: {aquestalk_preset: '女性１'},
    right: {aquestalk_preset: 'まりさ'},
  },
  scenes: [
    {
      id: 's02',
      dialogue: [
        {id: 'l01', speaker: 'right', text: '50分かけて計画だけ作って寝るのは避けるぜ。'},
      ],
    },
  ],
};

const voicevoxAudio = await writeAudio('audio/s01_l01.wav', 'voicevox wav');
await writeAudioManifest(fixtureDir, {
  version: 1,
  entries: {
    s01_l01: {
      file: 'audio/s01_l01.wav',
      input_hash: expectedAudioInputHash(voicevoxScript, voicevoxScript.scenes[0].dialogue[0]),
      duration_sec: 1.2,
      file_sha256: await fileSha256(voicevoxAudio),
      voice_engine: 'voicevox',
    },
  },
});

let issues = await collectAudioManifestIssues({episodeDir: fixtureDir, script: voicevoxScript});
if (issues.length !== 0) {
  throw new Error(`Expected matching VOICEVOX manifest, got ${JSON.stringify(issues)}`);
}

const staleScript = structuredClone(voicevoxScript);
staleScript.scenes[0].dialogue[0].text = '別の字幕に変わったのだ。';
issues = await collectAudioManifestIssues({episodeDir: fixtureDir, script: staleScript});
if (issues[0]?.reason !== 'input_hash_mismatch') {
  throw new Error(`Expected stale VOICEVOX text to fail by input_hash_mismatch, got ${JSON.stringify(issues)}`);
}

const aquestalkAudio = await writeAudio('audio/s02_l01.wav', 'aquestalk wav');
await writeAudioManifest(fixtureDir, {
  version: 1,
  entries: {
    s02_l01: {
      file: 'audio/s02_l01.wav',
      input_hash: expectedAudioInputHash(aquestalkScript, aquestalkScript.scenes[0].dialogue[0]),
      duration_sec: 1.4,
      file_sha256: await fileSha256(aquestalkAudio),
      voice_engine: 'aquestalk',
    },
  },
});

issues = await collectAudioManifestIssues({episodeDir: fixtureDir, script: aquestalkScript});
if (issues.length !== 0) {
  throw new Error(`Expected matching AquesTalk manifest, got ${JSON.stringify(issues)}`);
}

await writeAudioManifest(fixtureDir, {
  version: 1,
  entries: {
    s02_l01: {
      file: 'audio/s02_l01.wav',
      input_hash: expectedAudioInputHash(aquestalkScript, aquestalkScript.scenes[0].dialogue[0]),
      duration_sec: 1.4,
      file_sha256: await fileSha256(aquestalkAudio),
      voice_engine: 'aquestalk',
      adopted_from: 'line-durations.json',
    },
  },
});

issues = await collectAudioManifestIssues({episodeDir: fixtureDir, script: aquestalkScript});
if (issues[0]?.reason !== 'legacy_line_durations_adopted') {
  throw new Error(`Expected legacy AquesTalk adoption to fail, got ${JSON.stringify(issues)}`);
}

console.log(JSON.stringify({ok: true, tested: ['voicevox-hash-match', 'voicevox-stale-text', 'aquestalk-hash-match', 'legacy-rejection']}, null, 2));
