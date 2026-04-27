import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'watchability-guard-fixtures');

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

const goodDialogue = (index) => {
  if (index === 1) {
    return [
      {id: 'l01', speaker: 'left', text: 'スマホ写真、消す前に3分で詰むかも'},
      {id: 'l02', speaker: 'right', text: 'それ、あるあるの罠だ'},
      {id: 'l03', speaker: 'left', text: '今日確認すれば消す前に防げるのね'},
      {id: 'l04', speaker: 'right', text: 'まず保存先を見るんだぜ'},
    ];
  }
  if (index === 10) {
    return [
      {id: 'l01', speaker: 'left', text: '今日1回だけ保存先を確認するわ'},
      {id: 'l02', speaker: 'right', text: 'それで十分だ'},
      {id: 'l03', speaker: 'left', text: '写真を何年分ためてるかコメントで教えて'},
      {id: 'l04', speaker: 'right', text: 'あるある共有だぜ'},
    ];
  }
  return [
    {id: 'l01', speaker: 'left', text: `どうせ全部クラウドにあるでしょ、${index}年放置でも平気よ`},
    {id: 'l02', speaker: 'right', text: '雑に信じるな'},
    {id: 'l03', speaker: 'right', text: `例えば無料枠5GBを超えると保存されない写真が出る`},
    {id: 'l04', speaker: 'left', text: index === 5 ? 'マジで！？犯人そこなの？' : 'それ普通にヤバいわ'},
    {id: 'l05', speaker: 'right', text: '先に保存先を見るのが結論だぜ'},
  ];
};

const writeFixture = async ({name, weakOpening = false, questionOveruse = false, dazeOveruse = false}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});
  const scenes = Array.from({length: 10}, (_, index) => ({
    id: `s${String(index + 1).padStart(2, '0')}`,
    role: index === 0 ? 'intro' : index === 9 ? 'cta' : 'body',
    scene_goal: index === 4 ? '中盤の再フック。実は犯人は無料枠という断言で引き戻す' : '保存先の確認',
    motion_mode: index === 0 ? 'warning' : index === 4 ? 'reveal' : index === 9 ? 'recap' : index % 3 === 0 ? 'compare' : 'punch',
    main: {kind: 'image', asset: `assets/s${String(index + 1).padStart(2, '0')}_main.png`},
    sub: null,
    visual_asset_plan: [
      {
        slot: 'main',
        purpose: 'scene support',
        adoption_reason: 'scene support',
        image_role: index === 9 ? 'オチ補助' : '不安喚起',
        composition_type: ['事故寸前構図', '証拠写真風', 'NG / OK 比較'][index % 3],
        imagegen_prompt: 'fixture',
      },
    ],
    dialogue:
      weakOpening && index === 0
        ? [
            {id: 'l01', speaker: 'left', text: '今回は写真保存について解説するわ'},
            {id: 'l02', speaker: 'right', text: '大事だぜ'},
            {id: 'l03', speaker: 'left', text: 'そうなのね'},
          ]
        : questionOveruse && index === 1
          ? [
              {id: 'l01', speaker: 'left', text: 'どうせ全部クラウドにあるでしょ？'},
              {id: 'l02', speaker: 'right', text: '雑に信じるな'},
              {id: 'l03', speaker: 'right', text: '例えば無料枠5GBを超えると保存されない写真が出る'},
              {id: 'l04', speaker: 'left', text: 'それって消えるの？'},
              {id: 'l05', speaker: 'right', text: '先に保存先を見るのが結論だぜ'},
            ]
          : dazeOveruse && index > 0 && index < 9
            ? [
                {id: 'l01', speaker: 'left', text: `どうせ全部クラウドにあるでしょ、${index + 1}年放置でも平気よ`},
                {id: 'l02', speaker: 'right', text: '雑に信じるんだぜ'},
                {id: 'l03', speaker: 'left', text: 'それ普通にヤバいわ'},
                {id: 'l04', speaker: 'right', text: '先に保存先を見るんだぜ'},
              ]
            : goodDialogue(index + 1),
  }));
  const script = {
    meta: {id: name, title: name, layout_template: 'Scene01', pair: 'RM', voice_engine: 'aquestalk', fps: 30, width: 1920, height: 1080, target_duration_sec: 120},
    characters: {left: {character: 'reimu', aquestalk_preset: 'reimu'}, right: {character: 'marisa', aquestalk_preset: 'marisa'}},
    scenes,
  };
  const scriptFinal = `<!-- scene_format: fixture -->
<!-- viewer_misunderstanding: fixture -->
<!-- reaction_level: L3 -->
<!-- mini_punchline: fixture -->
<!-- number_or_example: 5GB -->
<!-- セルフ監査: fixture -->
# fixture

${scenes.flatMap((scene) => scene.dialogue.map((line) => `${line.speaker === 'left' ? '霊夢' : '魔理沙'}「${line.text}」`)).join('\n')}
`;
  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'script_final.md'), scriptFinal, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});
const passPath = await writeFixture({name: 'watchability-pass'});
const weakOpeningPath = await writeFixture({name: 'weak-opening', weakOpening: true});
const questionOverusePath = await writeFixture({name: 'question-overuse', questionOveruse: true});
const dazeOverusePath = await writeFixture({name: 'daze-overuse', dazeOveruse: true});

run(['scripts/audit-script-quality.mjs', passPath]);
run(['scripts/audit-script-quality.mjs', weakOpeningPath], {expectFailure: true, expectMessage: 'opening-first-hook-weak'});
run(['scripts/audit-script-quality.mjs', questionOverusePath], {expectFailure: true, expectMessage: 'viewer-question-overuse'});
run(['scripts/audit-script-quality.mjs', dazeOverusePath], {expectFailure: true, expectMessage: 'rm-daze-ending-ratio-high'});

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
