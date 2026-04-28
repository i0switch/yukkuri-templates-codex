import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';
import {CANONICAL_FIXED_IMAGEGEN_PROMPT, formatCanonicalImagegenPrompt} from './lib/imagegen-prompt-contract.mjs';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'image-prompt-vnext-guard-fixtures');

const run = (args, {expectReportIssues = false, expectedIssueCode = ''} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== 0) {
    throw new Error(`Expected command exit 0: node ${args.join(' ')}\n${output}`);
  }
  if (expectReportIssues) {
    const jsonStart = result.stdout.indexOf('{');
    const report = JSON.parse(result.stdout.slice(jsonStart));
    if (report.ok !== false || !(report.issues ?? []).some((issue) => issue.level === 'error')) {
      throw new Error(`Expected image prompt report errors but got:\n${result.stdout}`);
    }
    if (expectedIssueCode && !(report.issues ?? []).some((issue) => issue.code === expectedIssueCode)) {
      throw new Error(`Expected issue code ${expectedIssueCode} but got:\n${result.stdout}`);
    }
  } else {
    const jsonStart = result.stdout.indexOf('{');
    const report = JSON.parse(result.stdout.slice(jsonStart));
    if (report.ok !== true || (report.issues ?? []).length !== 0) {
      throw new Error(`Expected image prompt report ok=true with no issues but got:\n${result.stdout}`);
    }
  }
};

const promptFor = (bad = false) =>
  bad
    ? `s01: 弱い画像

霊夢「危険を確認するわ」

ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、抽象的な画面風ビジュアル、概念図、状況説明ビジュアルを中心に構成してください。 抽象的な青いネットワーク線だけの綺麗なIT図解。 画像の雰囲気はテストで生成してください。`
    : formatCanonicalImagegenPrompt({
        sceneId: 's01',
        sceneTitle: '強い画像',
        dialogueText: '霊夢「危険を確認するわ」',
        mood: '赤い警告と白い生活感のある雰囲気',
      });

const promptMissingHeadlineInstruction = `s01: 見出し漏れ

霊夢「危険を確認するわ」

${CANONICAL_FIXED_IMAGEGEN_PROMPT}

画像の雰囲気は赤い警告と白い生活感のある雰囲気で生成してください。`;

const writeFixture = async ({name, bad = false, promptOverride = ''}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});
  const prompt = promptOverride || promptFor(bad);
  const script = {
    meta: {id: name, title: name, layout_template: 'Scene01', pair: 'RM', voice_engine: 'aquestalk', fps: 30, width: 1920, height: 1080, target_duration_sec: 300},
    characters: {left: {character: 'reimu', aquestalk_preset: '女性１'}, right: {character: 'marisa', aquestalk_preset: 'まりさ'}},
    scenes: [
      {
        id: 's01',
        role: 'intro',
        motion_mode: 'warning',
        main: {kind: 'image', asset: 'assets/s01_main.png'},
        sub: null,
        visual_asset_plan: [{slot: 'main', purpose: 'test', adoption_reason: 'test', image_role: '不安喚起', composition_type: '事故寸前構図', imagegen_prompt: prompt}],
        dialogue: [{id: 'l01', speaker: 'left', text: '危険を確認するわ'}],
      },
    ],
  };
  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});
const passPath = await writeFixture({name: 'prompt-pass'});
const badPath = await writeFixture({name: 'prompt-bad', bad: true});
const missingHeadlinePath = await writeFixture({name: 'prompt-missing-headline', promptOverride: promptMissingHeadlineInstruction});

run(['scripts/audit-image-prompts.mjs', passPath]);
run(['scripts/audit-image-prompts.mjs', badPath], {expectReportIssues: true});
run(['scripts/audit-image-prompts.mjs', missingHeadlinePath], {
  expectReportIssues: true,
  expectedIssueCode: 'missing-image-headline-instruction',
});

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
