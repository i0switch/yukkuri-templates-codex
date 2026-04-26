import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadImagePromptPack} from './lib/load-image-prompt-pack.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-image-prompts.mjs <episode_id|path/to/script.yaml>');
}

const VISUAL_TYPES = new Set([
  'hook_poster',
  'boke_visual',
  'tsukkomi_visual',
  'myth_vs_fact',
  'danger_simulation',
  'before_after',
  'three_step_board',
  'checklist_panel',
  'ranking_board',
  'ui_mockup_safe',
  'flowchart_scene',
  'contrast_card',
  'meme_like_diagram',
  'mini_story_scene',
  'final_action_card',
]);

const PROMPT_REQUIREMENTS = [
  {key: 'purpose', patterns: [/使用目的|用途|高品質ビジュアル素材|メイン枠|サブ枠|main枠|sub枠/i]},
  {key: 'genre', patterns: [/ゆっくり解説|ずんだもん解説/]},
  {key: 'scene_template', patterns: [/Scene\d{2}/]},
  {key: 'visual_type', patterns: [/visual_type|hook_poster|boke_visual|tsukkomi_visual|myth_vs_fact|danger_simulation|before_after|three_step_board|checklist_panel|ranking_board|ui_mockup_safe|flowchart_scene|contrast_card|meme_like_diagram|mini_story_scene|final_action_card/]},
  {key: 'composition_type', patterns: [/composition_type|構図|前景|中景|背景/]},
  {key: 'dialogue_support', patterns: [/会話|掛け合い|セリフ|ボケ|ツッコミ|誤解|訂正|補強|supports_moment/i]},
  {key: 'subject_layers', patterns: [/主役|前景|中景|背景|foreground|midground|background/i]},
  {key: 'color_light', patterns: [/色|光|lighting|palette/i]},
  {key: 'safe_space', patterns: [/下部20%|字幕|キャラ|余白|Remotion/]},
  {key: 'negative', patterns: [/禁止|実在ロゴ|実在UI|既存キャラクター|写真風人物|長文/]},
  {key: 'quality_bar', patterns: [/品質|完成度|高品質|YouTube/]},
];

const GENERIC_PROMPT_PATTERNS = [
  /白背景.{0,12}中央.{0,12}アイコン/,
  /中央に.{0,10}(アイコン|シンプルな図解)/,
  /汎用(素材|アイコン|図解)/,
  /フラットな図解[。．\s]*$/,
  /わかりやすいカード[。．\s]*$/,
];

const SCENE02_SUB_VISUAL_TYPES = new Set(['checklist_panel', 'three_step_board', 'ranking_board', 'contrast_card', 'final_action_card']);
const SCENE02_MAIN_ONLY_VISUAL_TYPES = new Set([
  'hook_poster',
  'boke_visual',
  'tsukkomi_visual',
  'myth_vs_fact',
  'danger_simulation',
  'before_after',
  'ui_mockup_safe',
  'flowchart_scene',
  'meme_like_diagram',
  'mini_story_scene',
]);

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const resolveTarget = (value) => {
  if (value.endsWith('.yaml') || value.endsWith('.yml')) {
    const scriptPath = path.resolve(rootDir, value);
    return {scriptPath, episodeDir: path.dirname(scriptPath)};
  }

  const episodeDir = path.resolve(rootDir, 'script', value);
  return {scriptPath: path.join(episodeDir, 'script.yaml'), episodeDir};
};

const readScript = async (scriptPath) => parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();

const readMeta = async (episodeDir) => {
  try {
    return JSON.parse(await fs.readFile(path.join(episodeDir, 'meta.json'), 'utf8'));
  } catch {
    return null;
  }
};

const imageEntriesFromMeta = (meta) => {
  const entries = new Map();
  if (!Array.isArray(meta?.assets)) {
    return entries;
  }
  for (const asset of meta.assets) {
    if (isPlainObject(asset) && typeof asset.file === 'string') {
      entries.set(asset.file.replaceAll('\\', '/'), asset);
    }
  }
  return entries;
};

const lineIdsForScene = (scene) => new Set((scene.dialogue ?? []).map((line) => `${scene.id}_${line.id}`));

const promptForPlan = (plan, content, metaAsset) =>
  [
    plan?.imagegen_prompt,
    content?.asset_requirements?.imagegen_prompt,
    metaAsset?.imagegen_prompt,
  ]
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .join('\n');

const missingPromptRequirements = (prompt) =>
  PROMPT_REQUIREMENTS.filter((requirement) => !requirement.patterns.some((pattern) => pattern.test(prompt))).map(
    (requirement) => requirement.key,
  );

const normalizeRoleText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/[。、！？!?「」『』（）()\[\]【】・:：,，.．]/g, '')
    .trim();

const planRoleSignature = (plan) =>
  [
    plan?.purpose,
    plan?.supports_moment,
    plan?.visual_type,
    plan?.composition_type,
    plan?.image_direction?.dialogue_role,
    plan?.image_direction?.key_visual_sentence,
    plan?.image_direction?.main_subject,
  ]
    .map(normalizeRoleText)
    .filter(Boolean)
    .join('|');

const auditPlan = ({script, metaEntries, scene, plan, index, issues}) => {
  const pathName = `${scene.id}.visual_asset_plan[${index}]`;
  const slot = plan?.slot;
  const content = slot === 'main' || slot === 'sub' ? scene[slot] : null;
  const metaAsset = content?.asset ? metaEntries.get(String(content.asset).replaceAll('\\', '/')) : null;
  const direction = plan?.image_direction ?? metaAsset?.image_direction;
  const visualType = plan?.visual_type ?? direction?.visual_type ?? metaAsset?.visual_type;
  const supportsDialogue = plan?.supports_dialogue ?? metaAsset?.supports_dialogue;
  const supportsMoment = plan?.supports_moment ?? metaAsset?.supports_moment;
  const prompt = promptForPlan(plan, content, metaAsset);

  if (!VISUAL_TYPES.has(visualType)) {
    pushIssue(issues, 'error', 'invalid-visual-type', `${pathName}: visual_type must be a supported yukkuri/zundamon visual type`, {
      value: visualType,
      allowed: [...VISUAL_TYPES],
    });
  }

  if (!Array.isArray(supportsDialogue) || supportsDialogue.length === 0) {
    pushIssue(issues, 'error', 'missing-supports-dialogue', `${pathName}: supports_dialogue must name the dialogue ids this image supports`);
  } else {
    const validLineIds = lineIdsForScene(scene);
    const unknown = supportsDialogue.filter((lineId) => !validLineIds.has(lineId));
    if (unknown.length > 0) {
      pushIssue(issues, 'error', 'unknown-supports-dialogue', `${pathName}: supports_dialogue contains ids not found in the scene dialogue`, {
        unknown,
        available: [...validLineIds],
      });
    }
  }

  if (typeof supportsMoment !== 'string' || supportsMoment.trim().length < 12) {
    pushIssue(issues, 'error', 'missing-supports-moment', `${pathName}: supports_moment must describe the exact conversation moment`);
  }

  const requiredDirectionFields = [
    'dialogue_role',
    'scene_emotion',
    'composition_type',
    'image_should_support',
    'key_visual_sentence',
    'main_subject',
    'foreground',
    'midground',
    'background',
    'color_palette',
  ];
  if (!isPlainObject(direction)) {
    pushIssue(issues, 'error', 'missing-image-direction', `${pathName}: image_direction is required before imagegen_prompt`);
  } else {
    const missingDirection = requiredDirectionFields.filter((field) => typeof direction[field] !== 'string' || direction[field].trim() === '');
    if (missingDirection.length > 0) {
      pushIssue(issues, 'error', 'incomplete-image-direction', `${pathName}: image_direction is missing required fields`, {
        missing: missingDirection,
      });
    }
    if (direction?.layout_safety?.keep_bottom_20_percent_empty !== true) {
      pushIssue(issues, 'error', 'unsafe-image-layout', `${pathName}: image_direction.layout_safety.keep_bottom_20_percent_empty must be true`);
    }
    if (direction?.layout_safety?.avoid_character_area !== true) {
      pushIssue(issues, 'error', 'unsafe-character-layout', `${pathName}: image_direction.layout_safety.avoid_character_area must be true`);
    }
  }

  if (typeof prompt !== 'string' || prompt.trim().length < 240) {
    pushIssue(issues, 'error', 'weak-yukkuri-imagegen-prompt', `${pathName}: imagegen_prompt is too short for GPT-Image-2 visual direction`, {
      prompt,
    });
  } else {
    const missing = missingPromptRequirements(prompt);
    if (missing.length > 0) {
      pushIssue(issues, 'error', 'incomplete-yukkuri-imagegen-prompt', `${pathName}: imagegen_prompt is missing required GPT-Image-2 fields`, {
        missing,
      });
    }
    if (GENERIC_PROMPT_PATTERNS.some((pattern) => pattern.test(prompt))) {
      pushIssue(issues, 'error', 'generic-icon-imagegen-prompt', `${pathName}: imagegen_prompt still points toward a generic white-background icon/card`);
    }
  }

  if (slot === 'sub' && /(複雑|迷路|フローチャート|大量|細かい|表)/.test(prompt)) {
    pushIssue(issues, 'error', 'sub-image-too-complex', `${pathName}: sub slot must stay simple and not carry complex diagrams`);
  }

  return visualType;
};

const audit = async () => {
  await loadImagePromptPack(rootDir);
  const issues = [];
  const {scriptPath, episodeDir} = resolveTarget(target);
  const script = await readScript(scriptPath);
  const meta = await readMeta(episodeDir);
  const metaEntries = imageEntriesFromMeta(meta);
  const visualTypes = [];

  if (!isPlainObject(script) || !Array.isArray(script.scenes)) {
    pushIssue(issues, 'error', 'script', 'script.scenes must be present');
  } else {
    for (const scene of script.scenes) {
      const plans = Array.isArray(scene.visual_asset_plan) ? scene.visual_asset_plan : [];
      if (plans.length === 0) {
        pushIssue(issues, 'error', 'missing-visual-asset-plan', `${scene.id}: visual_asset_plan is required`);
        continue;
      }
      for (const [index, plan] of plans.entries()) {
        visualTypes.push(auditPlan({script, metaEntries, scene, plan, index, issues}));
      }

      if ((script.meta?.layout_template ?? script.meta?.scene_template) === 'Scene02') {
        const mainPlan = plans.find((plan) => plan.slot === 'main');
        const subPlan = plans.find((plan) => plan.slot === 'sub');
        if (mainPlan && subPlan) {
          const mainMoment = String(mainPlan.supports_moment ?? '');
          const subMoment = String(subPlan.supports_moment ?? '');
          const mainSignature = planRoleSignature(mainPlan);
          const subSignature = planRoleSignature(subPlan);
          if (
            mainMoment && mainMoment === subMoment ||
            mainPlan.visual_type && mainPlan.visual_type === subPlan.visual_type ||
            mainPlan.composition_type && mainPlan.composition_type === subPlan.composition_type ||
            mainSignature && mainSignature === subSignature
          ) {
            pushIssue(issues, 'error', 'scene02-main-sub-duplicated', `${scene.id}: Scene02 main/sub must not repeat the same visual role`, {
              main: {
                visual_type: mainPlan.visual_type,
                composition_type: mainPlan.composition_type,
                supports_moment: mainPlan.supports_moment,
                purpose: mainPlan.purpose,
              },
              sub: {
                visual_type: subPlan.visual_type,
                composition_type: subPlan.composition_type,
                supports_moment: subPlan.supports_moment,
                purpose: subPlan.purpose,
              },
            });
          }
          if (!SCENE02_SUB_VISUAL_TYPES.has(subPlan.visual_type)) {
            pushIssue(issues, 'error', 'scene02-sub-visual-type', `${scene.id}: Scene02 sub slot must be a compact support/check/action visual type`, {
              visual_type: subPlan.visual_type,
              allowed: [...SCENE02_SUB_VISUAL_TYPES],
            });
          }
          if (!SCENE02_MAIN_ONLY_VISUAL_TYPES.has(mainPlan.visual_type)) {
            pushIssue(issues, 'error', 'scene02-main-visual-type', `${scene.id}: Scene02 main slot must carry situation, emotion, contrast, or danger flow rather than a compact support panel`, {
              visual_type: mainPlan.visual_type,
              allowed: [...SCENE02_MAIN_ONLY_VISUAL_TYPES],
            });
          }
        }
      }
    }

    const definedTypes = visualTypes.filter(Boolean);
    if (definedTypes.length >= 4 && new Set(definedTypes).size < 3) {
      pushIssue(issues, 'error', 'low-visual-type-variety', 'visual_type is not varied enough for watchability', {
        visual_types: definedTypes,
        unique_visual_types: [...new Set(definedTypes)],
      });
    }
  }

  const report = {
    ok: !issues.some((issue) => issue.level === 'error'),
    episode_id: script?.meta?.id ?? path.basename(episodeDir),
    checked_at: new Date().toISOString(),
    script_path: path.relative(rootDir, scriptPath),
    visual_type_options: [...VISUAL_TYPES],
    prompt_requirements: PROMPT_REQUIREMENTS.map((requirement) => requirement.key),
    issues,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
