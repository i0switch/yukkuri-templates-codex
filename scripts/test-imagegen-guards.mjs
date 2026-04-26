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

const run = (args, {expectFailure = false} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}`);
    }
    return;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
};

const promptFor = ({sceneId, visualType, compositionType}) => `ゆっくり解説 / ずんだもん解説動画のScene01 main枠で使う高品質ビジュアル素材。
この画像は、台本内の「${sceneId}_l01の誤解を止めて行動へつなぐ掛け合い」を視覚的に補強する。
visual_typeは「${visualType}」、composition_typeは「${compositionType}」。
画面構図：
前景には大きな注意サインと手元のスマホ。
中景には安全な選択肢へ進む矢印。
背景には淡い青緑の整理された解説動画用パネル。
視線は左上の危険から右側の解決へ流れる。
デザイン：
高品質な日本のYouTube解説動画内スライドとして、余白、階層、視線誘導がある。
色は青緑、白、注意の赤。光は明るく清潔。
画面下部20%は字幕とキャラ表示用に空ける。
文字方針：
画像内の文字は最大3語まで。正確な日本語説明はRemotionで重ねるため、長文は入れない。
文字なし、細かい文字なし、ロゴなし、実在人物なし、既存キャラクターなし、ブランドロゴなし。
禁止：
白背景に中央アイコンだけ、汎用素材、実在ロゴ、実在UI、既存キャラクター、写真風人物、長文テキスト、細かい表、8枚グリッド、sprite sheet、asset sheet、一括生成、切り出し、crop。
生成単位：
この1枚専用のプロンプトとして、1枚ずつ生成する。他画像と同時生成しない。`;

const sceneFor = (index, prompt) => {
  const sceneId = `s${String(index).padStart(2, '0')}`;
  const visualTypes = ['hook_poster', 'myth_vs_fact', 'danger_simulation', 'before_after', 'flowchart_scene', 'checklist_panel', 'mini_story_scene', 'final_action_card'];
  const visualType = visualTypes[(index - 1) % visualTypes.length];
  const compositionType = ['smartphone_closeup', 'split_warning_path', 'three_layer_panel'][index % 3];
  const finalPrompt = prompt ?? promptFor({sceneId, visualType, compositionType});
  return {
    id: sceneId,
    role: index === 1 ? 'intro' : index === 7 ? 'outro' : index === 8 ? 'cta' : 'body',
    scene_goal: `${sceneId} goal`,
    viewer_question: `${sceneId} question`,
    visual_role: `${sceneId} visual`,
    main: {
      kind: 'image',
      asset: `assets/${sceneId}_main.png`,
      caption: `${sceneId} main`,
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
            remotion_overlay_text: ['安全確認'],
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
    dialogue: [{id: 'l01', speaker: index % 2 === 0 ? 'right' : 'left', text: `確認${index}をするのだ`}],
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

run(['scripts/audit-image-prompts.mjs', weakPath], {expectFailure: true});
run(['scripts/validate-episode-script.mjs', sheetPath], {expectFailure: true});
run(['scripts/audit-episode-quality.mjs', sheetPath], {expectFailure: true});
run(['scripts/audit-image-prompts.mjs', passPath]);
run(['scripts/validate-episode-script.mjs', passPath]);
run(['scripts/audit-episode-quality.mjs', passPath]);

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
