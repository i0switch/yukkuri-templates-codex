import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';

const repoRoot = process.cwd();

const makeAudioFixture = () => {
  const buffer = Buffer.alloc(14000, 0);
  buffer.write('ID3', 0, 'latin1');
  buffer.write('fixture-mp3', 10, 'latin1');
  return buffer;
};

const writeEpisode = async ({root, id, withBgm}) => {
  const episodeDir = path.join(root, 'script', id);
  await fs.mkdir(path.join(episodeDir, 'assets'), {recursive: true});
  await fs.mkdir(path.join(episodeDir, 'bgm'), {recursive: true});

  if (withBgm) {
    await fs.writeFile(path.join(episodeDir, 'bgm', 'track.mp3'), makeAudioFixture());
  }

  const bgm = withBgm
    ? `
bgm:
  source_url: https://dova-s.jp/bgm/detail/existing
  file: bgm/track.mp3
  license: existing license
  volume: 0.11
  fade_in_sec: 1
  fade_out_sec: 1.5
`
    : '';

  await fs.writeFile(
    path.join(episodeDir, 'script.yaml'),
    `meta:
  id: ${id}
  title: 詐欺DMに注意
  layout_template: Scene01
  pair: ZM
  fps: 30
  width: 1920
  height: 1080
  audience: 初心者
  tone: 軽く緊張感のある解説
  bgm_mood: 軽く緊張感のある解説用
  voice_engine: voicevox
  target_duration_sec: 30
characters:
  left:
    character: zundamon
    voicevox_speaker_id: 3
  right:
    character: metan
    voicevox_speaker_id: 2
${bgm}scenes:
  - id: s01
    role: intro
    main:
      kind: text
      text: テスト
    sub: null
    duration_sec: 3
    dialogue:
      - id: l01
        speaker: left
        text: テストなのだ
total_duration_sec: 3
`,
    'utf8',
  );

  await fs.writeFile(
    path.join(episodeDir, 'meta.json'),
    JSON.stringify(
      {
        episode_id: id,
        assets: withBgm
          ? [
              {
                file: 'bgm/track.mp3',
                source_site: 'dova-syndrome',
                source_url: 'https://dova-s.jp/bgm/detail/existing',
                title: 'Existing',
                composer: 'Composer',
                license: 'existing license',
                credit_required: false,
              },
            ]
          : [],
      },
      null,
      2,
    ),
    'utf8',
  );

  return episodeDir;
};

const runSelectBgm = ({root, id, candidatesPath}) => {
  const result = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'select-bgm.mjs'), id], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BGM_ROOT_DIR: root,
      BGM_CANDIDATES_JSON: candidatesPath,
      BGM_MIN_BYTES: '10240',
    },
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(`select-bgm failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
  return result;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const main = async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'select-bgm-test-'));
  const sourceAudio = path.join(root, 'source-track.mp3');
  await fs.writeFile(sourceAudio, makeAudioFixture());
  const candidatesPath = path.join(root, 'candidates.json');
  await fs.writeFile(
    candidatesPath,
    JSON.stringify(
      [
        {
          title: 'Tense Explanation Loop',
          composer: 'Fixture Composer',
          source_site: 'dova-syndrome',
          source_url: 'https://dova-s.jp/bgm/detail/fixture',
          download_url: sourceAudio,
          description: '緊張感のある解説向けBGM',
          tags: ['緊張感', '解説', '普通の速さ'],
          loop: true,
          dl_count: 100,
        },
      ],
      null,
      2,
    ),
    'utf8',
  );

  const missingEpisode = 'ep-missing-bgm';
  const missingDir = await writeEpisode({root, id: missingEpisode, withBgm: false});
  runSelectBgm({root, id: missingEpisode, candidatesPath});

  const selectedScript = parseDocument(await fs.readFile(path.join(missingDir, 'script.yaml'), 'utf8')).toJS();
  const selectedMeta = JSON.parse(await fs.readFile(path.join(missingDir, 'meta.json'), 'utf8'));
  const selectedBgm = await fs.stat(path.join(missingDir, 'bgm', 'track.mp3'));
  assert(selectedScript.bgm?.file === 'bgm/track.mp3', 'script.yaml bgm.file was not populated');
  assert(selectedScript.bgm?.source_url === 'https://dova-s.jp/bgm/detail/fixture', 'script.yaml bgm.source_url was not populated');
  assert(selectedBgm.size >= 10240, 'selected BGM file was not written');
  assert(
    selectedMeta.assets.some((asset) => asset.file === 'bgm/track.mp3' && asset.selection_reason),
    'meta.json BGM ledger entry was not written',
  );

  const existingEpisode = 'ep-existing-bgm';
  const existingDir = await writeEpisode({root, id: existingEpisode, withBgm: true});
  const before = await fs.readFile(path.join(existingDir, 'bgm', 'track.mp3'));
  const result = runSelectBgm({root, id: existingEpisode, candidatesPath});
  const after = await fs.readFile(path.join(existingDir, 'bgm', 'track.mp3'));
  const existingScript = parseDocument(await fs.readFile(path.join(existingDir, 'script.yaml'), 'utf8')).toJS();
  assert(result.stdout.includes('"status": "skipped"'), 'existing BGM episode was not skipped');
  assert(Buffer.compare(before, after) === 0, 'existing BGM file was overwritten');
  assert(existingScript.bgm?.source_url === 'https://dova-s.jp/bgm/detail/existing', 'existing script BGM was modified');

  console.log(JSON.stringify({ok: true, tests: ['missing-bgm-populates-ledger', 'existing-bgm-not-overwritten']}, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
