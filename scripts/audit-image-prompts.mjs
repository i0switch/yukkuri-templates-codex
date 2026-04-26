import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadImagePromptPack} from './lib/load-image-prompt-pack.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-image-prompts.mjs <episode_id|path/to/script.yaml>');
}

const FIXED_PROMPT_REQUIREMENTS = [
  {key: 'insert_image_japanese', patterns: [/ゆっくり解説動画向けの挿入画像を日本語で生成してください/]},
  {key: 'not_dialogue_recreation', patterns: [/会話内容をそのまま再現するためのものではなく/]},
  {key: 'no_dialogue_in_image', patterns: [/字幕やセリフは別で表示するため、会話等は画像に入れないでください/]},
  {key: 'no_character_chat_scene', patterns: [/キャラクター同士の会話シーンにはせず/]},
  {key: 'support_visuals', patterns: [/図解、アイコン、小物、UI、概念図、状況説明ビジュアル/]},
  {key: 'aspect_ratio', patterns: [/Make the aspect ratio 16:9\./]},
  {key: 'mood_line', patterns: [/画像の雰囲気は.+で生成してください。/s]},
];

const INTERNAL_META_PATTERNS = [
  {key: 'scene_template', pattern: /scene_template|Scene\d{2}/i},
  {key: 'visual_type', pattern: /visual_type|hook_poster|boke_visual|tsukkomi_visual|myth_vs_fact|danger_simulation|before_after|three_step_board|checklist_panel|ranking_board|ui_mockup_safe|flowchart_scene|contrast_card|meme_like_diagram|mini_story_scene|final_action_card/i},
  {key: 'composition_type', pattern: /composition_type/i},
  {key: 'supports_moment', pattern: /supports_moment/i},
  {key: 'supports_dialogue', pattern: /supports_dialogue/i},
  {key: 'image_direction', pattern: /image_direction/i},
  {key: 'legacy_layers', pattern: /前景|中景|背景|foreground|midground|background/i},
  {key: 'legacy_quality', pattern: /negative constraints|品質基準|生成単位|safe_space/i},
];

const GENERIC_PROMPT_PATTERNS = [
  /白背景.{0,12}中央.{0,12}アイコン/,
  /中央に.{0,10}(アイコン|シンプルな図解)/,
  /中央に主題.{0,12}余白多め/,
  /中央に.{0,8}主題.{0,20}余白/,
  /汎用(素材|アイコン|図解)/,
  /フラットな図解[。．\s]*$/,
  /わかりやすいカード[。．\s]*$/,
  /licensed photo style/i,
  /clean explainer thumbnail/i,
  /high readability/i,
];

const BATCH_GENERATION_PATTERNS = [
  /(?:^|[^a-z])grid(?:[^a-z]|$)/i,
  /グリッド/,
  /8枚/,
  /八枚/,
  /複数枚/,
  /一気に生成/,
  /一括生成/,
  /まとめて生成/,
  /同時生成(?:する|して|で|を)/,
  /batch/i,
  /sheet/i,
  /sprite/i,
  /asset[_ -]?sheet/i,
  /sprite[_ -]?sheet/i,
  /crop/i,
  /cut\s*out/i,
  /切り出し/,
  /切り抜き/,
];

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

const normalize = (value) => String(value ?? '').replace(/\r\n/g, '\n').trim();

const promptLocationsFor = (scene, plan) => {
  const locations = [];
  if (typeof plan?.imagegen_prompt === 'string') {
    locations.push({name: `${scene.id}.visual_asset_plan.imagegen_prompt`, prompt: plan.imagegen_prompt});
  }

  const slot = plan?.slot;
  const content = slot === 'main' || slot === 'sub' ? scene[slot] : null;
  // v2 rule: sub may render text or bullets (no image asset). Skip imagegen_prompt audit for non-image sub slots.
  if (slot === 'sub' && content && content.kind !== 'image') {
    return locations;
  }
  const contentPrompt = content?.asset_requirements?.imagegen_prompt;
  if (typeof contentPrompt === 'string') {
    locations.push({name: `${scene.id}.${slot}.asset_requirements.imagegen_prompt`, prompt: contentPrompt});
  }

  return locations;
};

const missingFixedRequirements = (prompt) =>
  FIXED_PROMPT_REQUIREMENTS.filter((requirement) => !requirement.patterns.some((pattern) => pattern.test(prompt))).map(
    (requirement) => requirement.key,
  );

const internalMetaMatches = (prompt) =>
  INTERNAL_META_PATTERNS.filter(({pattern}) => pattern.test(prompt)).map(({key}) => key);

const auditPrompt = ({scene, location, issues}) => {
  const prompt = normalize(location.prompt);

  if (prompt.length < 240) {
    pushIssue(issues, 'error', 'weak-yukkuri-imagegen-prompt', `${location.name}: imagegen_prompt is too short`, {
      prompt,
    });
    return;
  }

  if (!prompt.includes(`${scene.id}:`)) {
    pushIssue(issues, 'error', 'missing-scene-heading', `${location.name}: imagegen_prompt must start from the target scene id and title`);
  }

  const missingDialogue = (scene.dialogue ?? [])
    .map((line) => line?.text)
    .filter((text) => typeof text === 'string' && text.trim() !== '' && !prompt.includes(text.trim()));
  if (missingDialogue.length > 0) {
    pushIssue(issues, 'error', 'missing-script-final-dialogue', `${location.name}: imagegen_prompt must include the target scene dialogue text`, {
      missing_count: missingDialogue.length,
      first_missing: missingDialogue[0],
    });
  }

  const missing = missingFixedRequirements(prompt);
  if (missing.length > 0) {
    pushIssue(issues, 'error', 'incomplete-fixed-imagegen-prompt', `${location.name}: imagegen_prompt is missing fixed prompt text`, {
      missing,
    });
  }

  const internalMeta = internalMetaMatches(prompt);
  if (internalMeta.length > 0) {
    pushIssue(issues, 'error', 'internal-meta-in-imagegen-prompt', `${location.name}: imagegen_prompt must not include internal metadata`, {
      matched: internalMeta,
    });
  }

  if (GENERIC_PROMPT_PATTERNS.some((pattern) => pattern.test(prompt))) {
    pushIssue(issues, 'error', 'generic-icon-imagegen-prompt', `${location.name}: imagegen_prompt still points toward a generic white-background icon/card`);
  }

  if (BATCH_GENERATION_PATTERNS.some((pattern) => pattern.test(prompt))) {
    pushIssue(
      issues,
      'error',
      'batch-or-grid-imagegen-plan',
      `${location.name}: image generation must be one image per image gen call; grid/sheet/batch/crop generation is forbidden`,
    );
  }
};

const auditPlan = ({scene, plan, index, issues}) => {
  const pathName = `${scene.id}.visual_asset_plan[${index}]`;
  const locations = promptLocationsFor(scene, plan);

  if (locations.length === 0) {
    pushIssue(issues, 'error', 'missing-imagegen-prompt', `${pathName}: imagegen_prompt is required`);
    return;
  }

  for (const location of locations) {
    auditPrompt({scene, location, issues});
  }

  const normalizedPrompts = [...new Set(locations.map((location) => normalize(location.prompt)))];
  if (normalizedPrompts.length > 1) {
    pushIssue(issues, 'error', 'unsynced-imagegen-prompt', `${pathName}: visual_asset_plan and asset_requirements prompts must be identical`);
  }
};

const audit = async () => {
  await loadImagePromptPack(rootDir);
  const issues = [];
  const {scriptPath, episodeDir} = resolveTarget(target);
  const script = await readScript(scriptPath);

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
        auditPlan({scene, plan, index, issues});
      }
    }
  }

  const report = {
    ok: !issues.some((issue) => issue.level === 'error'),
    episode_id: script?.meta?.id ?? path.basename(episodeDir),
    checked_at: new Date().toISOString(),
    script_path: path.relative(rootDir, scriptPath),
    fixed_prompt_requirements: FIXED_PROMPT_REQUIREMENTS.map((requirement) => requirement.key),
    forbidden_internal_meta: INTERNAL_META_PATTERNS.map((requirement) => requirement.key),
    issues,
  };

  console.log(JSON.stringify(report, null, 2));
  // v2: image prompt 監査は任意・非ブロッキング。CLAUDE.md「画像監査は任意」方針に揃え、exit code は常に 0。
  // issues は report に残るが、pre-render-gate / build-episode の停止条件にはしない。
};

await audit();
