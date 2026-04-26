import fs from 'node:fs/promises';
import path from 'node:path';
import {ensureBgmInEpisode} from './download-bgm.mjs';
import {selectBgmTrack} from './select-bgm.mjs';

const appendBgmToMetaJson = async ({episodeDir, track}) => {
  const metaPath = path.join(episodeDir, 'meta.json');
  let raw;

  try {
    raw = await fs.readFile(metaPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.warn('[bgm] meta.json が見つからないため assets 追記をスキップします。');
      return;
    }
    throw error;
  }

  const meta = JSON.parse(raw);
  if (!Array.isArray(meta.assets)) meta.assets = [];

  if (!meta.assets.some((asset) => asset.file === 'bgm/track.mp3')) {
    meta.assets.push({
      file: 'bgm/track.mp3',
      kind: 'bgm',
      title: track.title,
      source_url: track.source_url,
      license: track.license,
      credit_required: track.credit_required ?? false,
    });
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
    console.log('[bgm] meta.json に bgm/track.mp3 を追記しました。');
  }
};

export async function ensureEpisodeBgm({script, document, episodeDir, scriptPath, rootDir = process.cwd()}) {
  if (script.bgm?.file) {
    console.log(`[bgm] bgmセクション設定済み (${script.bgm.file})。スキップします。`);
    return script;
  }

  console.log('[bgm] bgmセクション未設定。自動選択を開始します...');
  const track = await selectBgmTrack(script.meta);
  console.log(`[bgm] 選択: "${track.title}" (${track.id})`);

  await ensureBgmInEpisode(track, episodeDir, {rootDir});

  const bgm = {
    title: track.title,
    source_url: track.source_url,
    file: 'bgm/track.mp3',
    license: track.license,
    volume: track.volume,
    fade_in_sec: track.fade_in_sec,
    fade_out_sec: track.fade_out_sec,
  };

  document.set('bgm', bgm);
  await fs.writeFile(scriptPath, document.toString(), 'utf8');
  console.log('[bgm] script.yaml に bgmセクションを書き込みました。');

  await appendBgmToMetaJson({episodeDir, track});

  return {...script, bgm};
}
