import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '..', 'data', 'bgm-catalog.json');

let catalogCache;

export async function loadBgmCatalog() {
  if (catalogCache) return catalogCache;

  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  if (!Array.isArray(catalog.tracks) || catalog.tracks.length === 0) {
    throw new Error('bgm-catalog.json: tracks 配列が空です');
  }

  catalogCache = catalog;
  return catalog;
}

export async function selectBgmTrack(meta = {}) {
  const {tracks} = await loadBgmCatalog();
  const bgmMood = meta.bgm_mood ?? null;
  const tone = meta.tone ?? null;
  const pair = meta.character_pair ?? meta.pair ?? null;

  const scored = tracks.map((track, index) => {
    let score = 0;

    if (bgmMood && track.moods?.includes(bgmMood)) score += 100;
    if (tone && track.tones?.includes(tone)) score += 50;
    if (pair) {
      if (!Array.isArray(track.pairs) || track.pairs.length === 0) score += 10;
      else if (track.pairs.includes(pair)) score += 20;
    }

    return {track, score, index};
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = scored[0];

  if (selected.score === 0) {
    console.warn(`[bgm] カタログにマッチするトラックがありません。先頭トラック "${selected.track.title}" を使います。`);
  }

  return selected.track;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cases = [
    {meta: {tone: '軽快で実用的', character_pair: 'RM'}, expect: 'dova-16211'},
    {meta: {bgm_mood: 'upbeat', tone: '未登録トーン'}, expect: 'dova-16211'},
    {meta: {}, expect: 'dova-16211'},
  ];

  for (const testCase of cases) {
    const result = await selectBgmTrack(testCase.meta);
    console.log(`${result.id === testCase.expect ? 'PASS' : 'FAIL'} → ${result.id} (expected: ${testCase.expect})`);
  }
}
