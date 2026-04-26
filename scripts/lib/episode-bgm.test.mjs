import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {ensureEpisodeBgm} from './episode-bgm.mjs';

const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'episode-bgm-test-'));
const episodeDir = path.join(rootDir, 'script', 'ep-test');
await fs.mkdir(path.join(rootDir, 'bgm-pool'), {recursive: true});
await fs.mkdir(episodeDir, {recursive: true});
await fs.writeFile(path.join(rootDir, 'bgm-pool', 'dova-16211.mp3'), 'fixture audio');
await fs.writeFile(
  path.join(episodeDir, 'meta.json'),
  JSON.stringify({assets: [{file: 'assets/s01_main.png', license: 'test'}]}, null, 2),
);

const scriptYaml = `meta:
  id: ep-test
  episode_id: ep-test
  layout_template: Scene04
  character_pair: RM
  tone: 軽快で実用的
  voice_engine: voicevox
  target_duration_sec: 30
scenes:
  - id: s01
    main:
      kind: text
      text: テスト
    sub: null
    dialogue:
      - id: l01
        speaker: left
        text: テスト
`;
const scriptPath = path.join(episodeDir, 'script.yaml');
await fs.writeFile(scriptPath, scriptYaml);
const document = parseDocument(scriptYaml);
const script = document.toJS();

const result = await ensureEpisodeBgm({script, document, episodeDir, scriptPath, rootDir});

assert.equal(result.bgm.file, 'bgm/track.mp3');
assert.equal(result.bgm.title, 'upbeat step');
assert.equal(await fs.readFile(path.join(episodeDir, 'bgm', 'track.mp3'), 'utf8'), 'fixture audio');

const savedYaml = await fs.readFile(scriptPath, 'utf8');
assert.match(savedYaml, /^bgm:/m);
assert.match(savedYaml, /file: bgm\/track\.mp3/);

const meta = JSON.parse(await fs.readFile(path.join(episodeDir, 'meta.json'), 'utf8'));
assert.equal(
  meta.assets.some((asset) => asset.file === 'bgm/track.mp3' && asset.kind === 'bgm' && asset.title === 'upbeat step'),
  true,
);

const secondResult = await ensureEpisodeBgm({script: result, document: parseDocument(savedYaml), episodeDir, scriptPath, rootDir});
assert.equal(secondResult, result);

const invalidMetaEpisodeDir = path.join(rootDir, 'script', 'ep-invalid-meta');
await fs.mkdir(invalidMetaEpisodeDir, {recursive: true});
await fs.writeFile(path.join(invalidMetaEpisodeDir, 'meta.json'), '{broken');
await assert.rejects(
  () => ensureEpisodeBgm({script, document: parseDocument(scriptYaml), episodeDir: invalidMetaEpisodeDir, scriptPath: path.join(invalidMetaEpisodeDir, 'script.yaml'), rootDir}),
  SyntaxError,
);

console.log('episode-bgm tests passed');
