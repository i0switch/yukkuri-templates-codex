import fs from 'node:fs/promises';
import path from 'node:path';
import {createWriteStream} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

export function getBgmPoolPath(trackId, rootDir = process.cwd()) {
  return path.join(rootDir, 'bgm-pool', `${trackId}.mp3`);
}

async function downloadToPool(track, poolPath) {
  console.log(`[bgm] Downloading "${track.title}" from ${track.download_url} ...`);
  const response = await fetch(track.download_url);
  if (!response.ok) {
    throw new Error(
      `BGMダウンロード失敗: HTTP ${response.status}\n` +
        `  手動で bgm-pool/${track.id}.mp3 に配置してから再実行してください。\n` +
        `  ダウンロード元: ${track.source_url}`,
    );
  }

  await fs.mkdir(path.dirname(poolPath), {recursive: true});
  await pipeline(Readable.fromWeb(response.body), createWriteStream(poolPath));
  console.log(`[bgm] Cached → bgm-pool/${track.id}.mp3`);
}

export async function ensureBgmInEpisode(track, episodeDir, {rootDir = process.cwd()} = {}) {
  const poolPath = getBgmPoolPath(track.id, rootDir);

  try {
    await fs.access(poolPath);
    console.log(`[bgm] Pool hit: bgm-pool/${track.id}.mp3`);
  } catch {
    await downloadToPool(track, poolPath);
  }

  const episodeBgmDir = path.join(episodeDir, 'bgm');
  const episodeBgmPath = path.join(episodeBgmDir, 'track.mp3');
  await fs.mkdir(episodeBgmDir, {recursive: true});
  await fs.copyFile(poolPath, episodeBgmPath);
  console.log(`[bgm] Placed → ${path.relative(rootDir, episodeBgmPath)}`);

  return {poolPath, episodeBgmPath};
}
