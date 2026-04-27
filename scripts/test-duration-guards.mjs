import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'duration-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  return buffer;
};

const promptSha256 = (value) => createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');

const run = (args, {expectFailure = false, expectMessage} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  const output = `${result.stdout}\n${result.stderr}`;

  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${output}`);
    }
    if (expectMessage && !output.includes(expectMessage)) {
      throw new Error(`Expected failure message "${expectMessage}" but got:\n${output}`);
    }
    return;
  }

  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${output}`);
  }
};

const writeFixture = async ({name, targetDurationSec, totalDurationSec}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});
  await fs.writeFile(path.join(dir, 'assets', 's01_main.png'), pngBytes());

  const script = {
    meta: {
      id: name,
      title: name,
      layout_template: 'Scene02',
      pair: 'ZM',
      fps: 30,
      width: 1280,
      height: 720,
      audience: 'test',
      tone: 'test',
      bgm_mood: 'test',
      voice_engine: 'voicevox',
      target_duration_sec: targetDurationSec,
      image_style: 'test',
    },
    characters: {
      left: {character: 'zundamon', voicevox_speaker_id: 3},
      right: {character: 'metan', voicevox_speaker_id: 2},
    },
    total_duration_sec: totalDurationSec,
    scenes: [
      {
        id: 's01',
        role: 'intro',
        motion_mode: 'warning',
        scene_goal: 'test',
        viewer_question: 'test',
        visual_role: 'test',
        duration_sec: totalDurationSec,
        visual_asset_plan: [
          {
            slot: 'main',
            purpose: 'test',
            adoption_reason: 'test',
            image_role: '理解補助',
            composition_type: '誇張図解',
            imagegen_prompt: 'duration guard fixture image prompt',
          },
        ],
        main: {kind: 'image', asset: 'assets/s01_main.png'},
        sub: {
          kind: 'bullets',
          items: ['尺チェック', '自然音声優先'],
        },
        dialogue: [
          {id: 'l01', speaker: 'left', text: '危険を確認するのだ', wav_sec: 1, start_sec: 0.1, end_sec: 1.1, emphasis: {words: ['危険'], style: 'danger', se: 'warning', pause_after_ms: 300}},
          {id: 'l02', speaker: 'right', text: 'テストですわ', wav_sec: 1, start_sec: 1.3, end_sec: 2.3},
        ],
      },
    ],
  };

  const meta = {
    assets: [
      {
        file: 'assets/s01_main.png',
        source_type: 'imagegen',
        generation_tool: 'codex-imagegen',
        rights_confirmed: true,
        license: 'generated image',
        scene_id: 's01',
        slot: 'main',
        purpose: 'test',
        adoption_reason: 'test',
        imagegen_prompt: 'duration guard fixture image prompt',
        source_url: 'codex://generated_images/duration-guard-fixture/s01_main.png',
        generation_id: 'duration-guard-fixture/s01_main.png',
      },
    ],
  };
  const manifest = {
    version: 1,
    images: [
      {
        file: 'assets/s01_main.png',
        destination: 'assets/s01_main.png',
        scene_id: 's01',
        slot: 'main',
        source_url: 'codex://generated_images/duration-guard-fixture/s01_main.png',
        generation_id: 'duration-guard-fixture/s01_main.png',
        prompt_sha256: promptSha256('duration guard fixture image prompt'),
      },
    ],
  };

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'imagegen_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const target300At280 = await writeFixture({name: 'target-300-at-280', targetDurationSec: 300, totalDurationSec: 280});
const target360At340 = await writeFixture({name: 'target-360-at-340', targetDurationSec: 360, totalDurationSec: 340});
const target360At310 = await writeFixture({name: 'target-360-at-310', targetDurationSec: 360, totalDurationSec: 310});

run(['scripts/validate-episode-script.mjs', target300At280]);
run(['scripts/validate-episode-script.mjs', target360At340]);
run(['scripts/validate-episode-script.mjs', target360At310], {
  expectFailure: true,
  expectMessage: 'allowed=324-396s',
});

const buildEpisodeSource = await fs.readFile(path.join(rootDir, 'scripts', 'build-episode.mjs'), 'utf8');
for (const removedPaddingToken of ['remainingGap', 'scenePadding']) {
  if (buildEpisodeSource.includes(removedPaddingToken)) {
    throw new Error(`build-episode.mjs must not pad scenes to target_duration_sec with ${removedPaddingToken}`);
  }
}

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
