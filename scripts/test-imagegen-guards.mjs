import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'imagegen-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(1920, 16);
  buffer.writeUInt32BE(1080, 20);
  return buffer;
};

const run = (args, {expectFailure = false, expectReportIssues = false} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (expectReportIssues) {
    // v2: image audit は非ブロッキング (exit code 0)。report の ok: false / errors を verify する。
    // loader logs は stdout 先頭に混ざるので、最初の `{` から末尾までを JSON として抽出する。
    const jsonStart = result.stdout.indexOf('{');
    if (jsonStart === -1) {
      throw new Error(`Expected JSON report in stdout: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    let report;
    try {
      report = JSON.parse(result.stdout.slice(jsonStart));
    } catch {
      throw new Error(`Expected JSON report but could not parse: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    const errorIssues = (report.issues ?? []).filter((issue) => issue.level === 'error');
    if (report.ok !== false || errorIssues.length === 0) {
      throw new Error(`Expected report.ok=false with error issues, got ok=${report.ok} errors=${errorIssues.length}: node ${args.join(' ')}`);
    }
    return;
  }
  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    return;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
};

const promptFor = ({sceneId, lineText}) => `${sceneId}: テストシーン

${lineText}

ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、UI、概念図、状況説明ビジュアルを中心に構成してください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 YouTubeの解説動画に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。 Make the aspect ratio 16:9.

画像の雰囲気は青緑と白を基調にした明るい解説動画向けの雰囲気で生成してください。`;

const sceneFor = (index, prompt) => {
  const sceneId = `s${String(index).padStart(2, '0')}`;
  const visualTypes = ['hook_poster', 'myth_vs_fact', 'danger_simulation', 'before_after', 'flowchart_scene', 'checklist_panel', 'mini_story_scene', 'final_action_card'];
  const visualType = visualTypes[(index - 1) % visualTypes.length];
  const compositionType = ['smartphone_closeup', 'split_warning_path', 'three_layer_panel'][index % 3];
  const lineText = `確認${index}をするのだ`;
  const finalPrompt = prompt ?? promptFor({sceneId, lineText});
  return {
    id: sceneId,
    role: index === 1 ? 'intro' : index === 7 ? 'outro' : index === 8 ? 'cta' : 'body',
    scene_goal: `${sceneId} goal`,
    viewer_question: `${sceneId} question`,
    visual_role: `${sceneId} visual`,
    main: {
      kind: 'image',
      asset: `assets/${sceneId}_main.png`,
      asset_requirements: {
        imagegen_prompt: finalPrompt,
      },
    },
    sub: null,
    visual_asset_plan: [
      {
        slot: 'main',
        purpose: `${sceneId} purpose`,
        supports_dialogue: [`${sceneId}_l01`],
        supports_moment: `${sceneId}_l01の誤解を止めて行動へつなぐ瞬間`,
        visual_type: visualType,
        composition_type: compositionType,
        image_direction: {
          scene_id: sceneId,
          dialogue_role: '誤解訂正',
          scene_emotion: '危険から安心',
          visual_type: visualType,
          composition_type: compositionType,
          image_should_support: `${sceneId}_l01の会話補強`,
          key_visual_sentence: '危険を避けて安全な行動へ進む',
          main_subject: '注意サイン付きスマホ',
          foreground: '大きな注意サインとスマホ',
          midground: '安全な選択肢へ向かう矢印',
          background: '青緑の解説動画用パネル',
          color_palette: '青緑、白、注意の赤',
          text_strategy: {
            image_text_allowed: true,
            image_text_max_words: 3,
            image_text_examples: ['STOP'],
          },
          layout_safety: {
            keep_bottom_20_percent_empty: true,
            avoid_character_area: true,
            avoid_sub_area_overlap: true,
          },
          must_not_include: ['実在UI', '既存キャラクター', '長文日本語'],
          quality_bar: 'YouTube解説動画の高品質スライドとして成立',
        },
        imagegen_prompt: finalPrompt,
      },
    ],
    dialogue: [{id: 'l01', speaker: index % 2 === 0 ? 'right' : 'left', text: lineText}],
  };
};

const writeFixture = async ({name, badPrompt, sheetMeta = false}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});

  const scenes = Array.from({length: 8}, (_, index) => sceneFor(index + 1, index === 0 ? badPrompt : undefined));
  const script = {
    meta: {
      id: name,
      title: name,
      pair: 'ZM',
      fps: 30,
      width: 1920,
      height: 1080,
      audience: 'test',
      tone: 'test',
      bgm_mood: 'test',
      voice_engine: 'voicevox',
      target_duration_sec: 300,
      image_style: '青緑の高品質解説動画スライド',
      layout_template: 'Scene01',
    },
    characters: {left: {character: 'zundamon'}, right: {character: 'metan'}},
    scenes,
  };

  const assets = [];
  for (const scene of scenes) {
    const assetPath = scene.main.asset;
    await fs.writeFile(path.join(dir, assetPath), pngBytes());
    const plan = scene.visual_asset_plan[0];
    assets.push({
      file: assetPath,
      source_type: 'OpenAI image generation',
      source_url: sheetMeta ? 'openai-image://shared-sheet' : `openai-image://${name}/${scene.id}`,
      generation_id: sheetMeta ? 'shared-sheet' : `${name}-${scene.id}`,
      license: 'generated image',
      imagegen_model: 'gpt-image-2',
      scene_id: scene.id,
      slot: 'main',
      purpose: plan.purpose,
      adoption_reason: `${scene.id}の会話補強に一致`,
      imagegen_prompt: plan.imagegen_prompt,
      image_direction: plan.image_direction,
      visual_type: plan.visual_type,
      supports_dialogue: plan.supports_dialogue,
      supports_moment: plan.supports_moment,
      ...(sheetMeta ? {crop_from: 'sheet.png'} : {}),
    });
  }

  const meta = {assets};
  if (sheetMeta) {
    meta.generated_asset_sheet = 'openai-image://shared-sheet';
  }

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const weakPrompt = 'ゆっくり解説動画用。中央に主題、余白多め。licensed photo style, clean explainer thumbnail, high readability。';
const weakPath = await writeFixture({name: 'weak-prompt', badPrompt: weakPrompt});
const sheetPath = await writeFixture({name: 'grid-sheet', sheetMeta: true});
const passPath = await writeFixture({name: 'pass'});

// audit-image-prompts.mjs is non-blocking in v2 (exit 0); verify the report flags issues instead.
run(['scripts/audit-image-prompts.mjs', weakPath], {expectReportIssues: true});
run(['scripts/validate-episode-script.mjs', sheetPath]);
run(['scripts/audit-episode-quality.mjs', sheetPath], {expectFailure: true});
run(['scripts/audit-image-prompts.mjs', passPath]);
run(['scripts/validate-episode-script.mjs', passPath]);
run(['scripts/audit-episode-quality.mjs', passPath]);

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
