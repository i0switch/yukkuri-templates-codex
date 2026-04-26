import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ensureBgmInEpisode, getBgmPoolPath} from './download-bgm.mjs';

const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bgm-pool-test-'));
const episodeDir = path.join(rootDir, 'script', 'ep-test');
const poolPath = getBgmPoolPath('fixture-track', rootDir);
await fs.mkdir(path.dirname(poolPath), {recursive: true});
await fs.writeFile(poolPath, 'fixture audio');

const result = await ensureBgmInEpisode(
  {
    id: 'fixture-track',
    title: 'Fixture Track',
    source_url: 'https://example.invalid/source',
    download_url: 'https://example.invalid/download',
  },
  episodeDir,
  {rootDir},
);

assert.equal(result.poolPath, poolPath);
assert.equal(result.episodeBgmPath, path.join(episodeDir, 'bgm', 'track.mp3'));
assert.equal(await fs.readFile(result.episodeBgmPath, 'utf8'), 'fixture audio');

console.log('download-bgm tests passed');
