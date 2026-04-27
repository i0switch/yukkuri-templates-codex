import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'expression-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(1920, 16);
  buffer.writeUInt32BE(1080, 20);
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
      throw new Error(`Expected message "${expectMessage}" but got:\n${output}`);
    }
    return;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${output}`);
  }
};

const emphasis = (style = 'danger', se = 'warning') => ({words: ['危険'], style, se, pause_after_ms: 300});

const writeFixture = async ({name, invalidExpression = false, repeatedExpression = false}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});

  const scenes = Array.from({length: 10}, (_, index) => {
    const sceneId = `s${String(index + 1).padStart(2, '0')}`;
    const required = index === 0 || index === 4 || index === 9;
    const expressions = repeatedExpression
      ? ['shock', 'confident', 'shock', 'confident', 'shock']
      : ['shock', 'confident', 'confused', 'smug', 'laugh'];
    const dialogue = [
      {id: 'l01', speaker: 'left', text: '危険を確認するわ', expression: expressions[0], ...(required ? {emphasis: emphasis()} : {})},
      {id: 'l02', speaker: 'right', text: '先に見るんだぜ', expression: expressions[1]},
      {id: 'l03', speaker: 'left', text: 'それ普通に怖いわ', expression: expressions[2]},
      {id: 'l04', speaker: 'right', text: 'ここが分かれ道だ', expression: expressions[3]},
      {id: 'l05', speaker: 'left', text: 'じゃあ今見るわ', expression: expressions[4]},
    ];
    if (invalidExpression && index === 1) {
      dialogue[0].expression = 'super_angry';
    }

    return {
      id: sceneId,
      role: index === 0 ? 'intro' : index === 9 ? 'cta' : 'body',
      motion_mode: index === 0 ? 'warning' : index === 4 ? 'reveal' : index === 9 ? 'recap' : index % 2 === 0 ? 'punch' : 'compare',
      duration_sec: 30,
      scene_goal: index === 4 ? '中盤の再フック' : 'test',
      main: {kind: 'image', asset: `assets/${sceneId}_main.png`},
      sub: null,
      visual_asset_plan: [
        {
          slot: 'main',
          purpose: 'test',
          adoption_reason: 'test',
          image_role: '理解補助',
          composition_type: ['NG / OK 比較', '誇張図解', '証拠写真風'][index % 3],
          imagegen_prompt: 'test prompt',
        },
      ],
      dialogue,
    };
  });

  for (const scene of scenes) {
    await fs.writeFile(path.join(dir, scene.main.asset), pngBytes());
  }

  const script = {
    meta: {id: name, title: name, layout_template: 'Scene01', pair: 'RM', voice_engine: 'aquestalk', fps: 30, width: 1920, height: 1080, target_duration_sec: 300},
    characters: {left: {character: 'reimu', aquestalk_preset: 'reimu'}, right: {character: 'marisa', aquestalk_preset: 'marisa'}},
    scenes,
    total_duration_sec: 300,
  };
  const assets = scenes.map((scene) => ({
    file: scene.main.asset,
    source_type: 'user_generated',
    generation_tool: 'fixture',
    rights_confirmed: true,
    license: 'fixture',
    scene_id: scene.id,
    slot: 'main',
    purpose: 'test',
    adoption_reason: 'test',
    imagegen_prompt: 'test prompt',
  }));
  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify({assets}, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});
const passPath = await writeFixture({name: 'expression-pass'});
const invalidPath = await writeFixture({name: 'expression-invalid', invalidExpression: true});
const repeatedPath = await writeFixture({name: 'expression-repeated', repeatedExpression: true});

run(['scripts/validate-episode-script.mjs', passPath]);
run(['scripts/validate-episode-script.mjs', invalidPath], {expectFailure: true, expectMessage: 'expression must be one of'});
run(['scripts/validate-episode-script.mjs', repeatedPath], {expectFailure: true, expectMessage: 'same speaker expression must not continue'});

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
