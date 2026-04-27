import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'sub-content-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  return buffer;
};

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

const writeFixture = async ({name, layoutTemplate, sub}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});
  await fs.writeFile(path.join(dir, 'assets', 's01_main.png'), pngBytes());
  if (sub?.kind === 'image') {
    await fs.writeFile(path.join(dir, 'assets', 's01_sub.png'), pngBytes());
  }

  const script = {
    meta: {
      id: name,
      title: name,
      layout_template: layoutTemplate,
      pair: 'ZM',
      fps: 30,
      width: 1280,
      height: 720,
      audience: 'test',
      tone: 'test',
      bgm_mood: 'test',
      voice_engine: 'voicevox',
      target_duration_sec: 300,
      image_style: 'test',
    },
    characters: {
      left: {character: 'zundamon', voicevox_speaker_id: 3},
      right: {character: 'metan', voicevox_speaker_id: 2},
    },
    scenes: [
      {
        id: 's01',
        role: 'intro',
        motion_mode: 'warning',
        scene_goal: 'test',
        viewer_question: 'test',
        visual_role: 'test',
        visual_asset_plan: [
          {
            slot: 'main',
            purpose: 'test',
            adoption_reason: 'test',
            image_role: '理解補助',
            composition_type: '誇張図解',
            imagegen_prompt: 'test prompt',
          },
        ],
        main: {kind: 'image', asset: 'assets/s01_main.png'},
        sub,
        dialogue: [
          {id: 'l01', speaker: 'left', text: '危険を確認するのだ', emphasis: {words: ['危険'], style: 'danger', se: 'warning', pause_after_ms: 300}},
          {id: 'l02', speaker: 'right', text: 'テストですわ'},
        ],
      },
    ],
  };

  const assets = [
    {
      file: 'assets/s01_main.png',
      source_type: 'user_generated',
      generation_tool: 'fixture',
      rights_confirmed: true,
      license: 'generated image',
      scene_id: 's01',
      slot: 'main',
      purpose: 'test',
      adoption_reason: 'test',
      imagegen_prompt: 'test prompt',
    },
  ];
  if (sub?.kind === 'image') {
    assets.push({
      file: 'assets/s01_sub.png',
      source_type: 'user_generated',
      generation_tool: 'fixture',
      rights_confirmed: true,
      license: 'generated image',
      scene_id: 's01',
      slot: 'sub',
      purpose: 'test',
      adoption_reason: 'test',
      imagegen_prompt: 'test prompt',
    });
  }

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify({assets}, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const scene02Null = await writeFixture({name: 'scene02-null-sub', layoutTemplate: 'Scene02', sub: null});
const scene02Image = await writeFixture({
  name: 'scene02-image-sub',
  layoutTemplate: 'Scene02',
  sub: {kind: 'image', asset: 'assets/s01_sub.png'},
});
const scene02Text = await writeFixture({
  name: 'scene02-text-sub',
  layoutTemplate: 'Scene02',
  sub: {kind: 'text', text: '詳しい補足テキスト\n注意点を短く表示\n数字の意味を補う\n今の手順を示す\n次の確認を出す\n最後の行動を置く'},
});
const scene02Bullets = await writeFixture({
  name: 'scene02-bullets-sub',
  layoutTemplate: 'Scene02',
  sub: {kind: 'bullets', items: ['小見出し', '注意点', '数字補足', '現在地', '確認先', '次にやること']},
});
const scene05Null = await writeFixture({name: 'scene05-null-sub', layoutTemplate: 'Scene05', sub: null});
const scene05Text = await writeFixture({
  name: 'scene05-text-sub',
  layoutTemplate: 'Scene05',
  sub: {kind: 'text', text: 'sub枠なしテンプレでは警告になる補足'},
});

run(['scripts/validate-episode-script.mjs', scene02Null], {
  expectFailure: true,
  expectMessage: 'requires sub content',
});
run(['scripts/validate-episode-script.mjs', scene02Image], {
  expectFailure: true,
  expectMessage: 'sub content must be text or bullets',
});
run(['scripts/validate-episode-script.mjs', scene02Text]);
run(['scripts/validate-episode-script.mjs', scene02Bullets]);
run(['scripts/validate-episode-script.mjs', scene05Null]);
run(['scripts/validate-episode-script.mjs', scene05Text]);

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
