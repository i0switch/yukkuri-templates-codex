import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'motion-emphasis-guard-fixtures');

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
  if (expectMessage && !output.includes(expectMessage)) {
    throw new Error(`Expected message "${expectMessage}" but got:\n${output}`);
  }
};

const writeFixture = async ({name, midpointNormal = false, legacyEmphasis = false}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});

  const scenes = Array.from({length: 10}, (_, index) => {
    const sceneId = `s${String(index + 1).padStart(2, '0')}`;
    const mode =
      index === 0
        ? 'warning'
        : index === 4 || index === 5
          ? midpointNormal
            ? 'normal'
            : 'reveal'
          : index === 9
            ? 'recap'
            : index % 2 === 0
              ? 'punch'
              : 'compare';
    return {
      id: sceneId,
      role: index === 0 ? 'intro' : index === 9 ? 'cta' : 'body',
      motion_mode: mode,
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
      dialogue: [
        {id: 'l01', speaker: 'left', text: '危険を確認するわ', ...(legacyEmphasis && index === 0 ? {emphasis: {words: ['危険'], style: 'danger', se: 'warning', pause_after_ms: 300}} : {})},
        {id: 'l02', speaker: 'right', text: '先に見るんだぜ'},
      ],
    };
  });

  for (const scene of scenes) {
    await fs.writeFile(path.join(dir, scene.main.asset), pngBytes());
  }

  const script = {
    meta: {id: name, title: name, layout_template: 'Scene01', pair: 'RM', voice_engine: 'aquestalk', fps: 30, width: 1920, height: 1080, target_duration_sec: 300},
    characters: {left: {character: 'reimu', aquestalk_preset: '女性１'}, right: {character: 'marisa', aquestalk_preset: 'まりさ'}},
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
const passPath = await writeFixture({name: 'motion-pass'});
const midpointNormalPath = await writeFixture({name: 'midpoint-normal', midpointNormal: true});
const legacyEmphasisPath = await writeFixture({name: 'legacy-emphasis', legacyEmphasis: true});

run(['scripts/validate-episode-script.mjs', passPath]);
run(['scripts/validate-episode-script.mjs', midpointNormalPath], {expectFailure: true, expectMessage: 'midpoint rehook scene must use a non-normal motion_mode'});
run(['scripts/validate-episode-script.mjs', legacyEmphasisPath], {expectMessage: 'emphasis is deprecated and ignored by render'});

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
