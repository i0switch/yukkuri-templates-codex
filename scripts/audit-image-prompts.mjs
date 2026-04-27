import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadImagePromptPack} from './lib/load-image-prompt-pack.mjs';
import {loadImagePromptRegistry, promptFromRegistry} from './lib/image-prompt-registry.mjs';

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
  {key: 'support_visuals', patterns: [/図解、アイコン、小物、抽象的な画面風ビジュアル、概念図、状況説明ビジュアル/]},
  {key: 'image_role', patterns: [/画像の役割を、理解補助、不安喚起、笑い、比較、手順整理、証拠提示、オチ補助/]},
  {key: 'composition_type', patterns: [/構図タイプを、NG \/ OK 比較、失敗例シミュレーション、誇張図解、証拠写真風、チェックリスト、手順図、原因マップ、ビフォーアフター、ツッコミ待ち構図、事故寸前構図/]},
  {key: 'largest_subject', patterns: [/画面で一番大きく見せる対象/]},
  {key: 'visualized_sentence', patterns: [/対象シーンから画像化する一言を1つ選び/]},
  {key: 'mobile_viewing', patterns: [/スマホ視聴でも伝わるように主役は1つ/]},
  {key: 'no_generic_it_visual', patterns: [/どのシーンにも使える白背景アイコン、抽象的な青いネットワーク線/]},
  {key: 'japanese_text_only', patterns: [/画像内の可読テキストは日本語だけにしてください/]},
  {key: 'image_headline_required', patterns: [/対象シーンの見出し本文だけを大きく目立つ見出しとして配置してください/]},
  {key: 'no_bottom_input_space', patterns: [/下部に白帯、入力欄、チャット欄、テキストボックス風の余白を作らないでください/]},
  {key: 'aspect_ratio', patterns: [/16:9の横長構図/]},
  {key: 'mood_line', patterns: [/画像の雰囲気は.+で生成してください。/s]},
];

const INTERNAL_META_PATTERNS = [
  {key: 'scene_template', pattern: /scene_template|Scene\d{2}/i},
  {key: 'visual_type', pattern: /visual_type|hook_poster|boke_visual|tsukkomi_visual|myth_vs_fact|danger_simulation|before_after|three_step_board|checklist_panel|ranking_board|ui_mockup_safe|flowchart_scene|contrast_card|meme_like_diagram|mini_story_scene|final_action_card/i},
  {key: 'composition_type', pattern: /composition_type/i},
  {key: 'supports_moment', pattern: /supports_moment/i},
  {key: 'supports_dialogue', pattern: /supports_dialogue/i},
  {key: 'image_direction', pattern: /image_direction/i},
  {key: 'legacy_layers', pattern: /(?:前景|中景|背景)\s*[:：]|foreground|midground|background/i},
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
  /抽象的な青いネットワーク線/,
  /綺麗なIT図解/,
  /サイバー空間.{0,10}背景/,
  /どのシーンにも使える/,
  /テーマ名をそのまま図解/,
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

const LEGACY_IMAGEGEN_PROMPT_PATTERNS = [
  {key: 'english_aspect_instruction', pattern: /Make the aspect ratio 16:9\./i},
  {key: 'english_text_instruction', pattern: /\b(?:English|in English|with English)\b/i},
  {key: 'bottom_blank_space', pattern: /(?:下部|画面下部)20%[^。\n]*(?:余白|空け|空白|残し)/},
  {key: 'bottom_safe_space_en', pattern: /(?:bottom|lower)[^.\n]*(?:20|twenty)[^.\n]*(?:blank|empty|safe space|space)/i},
  {key: 'input_like_space', pattern: /(?:入力欄|チャット欄|テキストボックス|textbox|text box|prompt box)/i},
  {key: 'legacy_ui_wording', pattern: /実在UI|UIの完全模写|(?:^|[^一-龥ぁ-んァ-ヶA-Za-z])UI(?:[^一-龥ぁ-んァ-ヶA-Za-z]|$)/},
  {key: 'legacy_wide_whitespace', pattern: /余白のある横長構図|余白多め/},
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

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sceneHeadingFor = (prompt, sceneId) => {
  const firstLine = normalize(prompt).split('\n')[0]?.trim() ?? '';
  const match = firstLine.match(new RegExp(`^${escapeRegExp(sceneId)}:\\s*(.+)$`));
  return match ? {firstLine, title: match[1].trim()} : {firstLine, title: ''};
};

const promptLocationsFor = (scene, plan, registry) => {
  const locations = [];
  if (typeof plan?.imagegen_prompt === 'string') {
    locations.push({name: `${scene.id}.visual_asset_plan.imagegen_prompt`, prompt: plan.imagegen_prompt});
  }
  if (typeof plan?.imagegen_prompt_ref === 'string') {
    const prompt = promptFromRegistry(registry, plan.imagegen_prompt_ref);
    if (prompt) {
      locations.push({name: `${scene.id}.visual_asset_plan.imagegen_prompt_ref(${plan.imagegen_prompt_ref})`, prompt});
    }
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
  const contentPromptRef = content?.asset_requirements?.imagegen_prompt_ref;
  if (typeof contentPromptRef === 'string') {
    const prompt = promptFromRegistry(registry, contentPromptRef);
    if (prompt) {
      locations.push({name: `${scene.id}.${slot}.asset_requirements.imagegen_prompt_ref(${contentPromptRef})`, prompt});
    }
  }

  return locations;
};

const missingFixedRequirements = (prompt) =>
  FIXED_PROMPT_REQUIREMENTS.filter((requirement) => !requirement.patterns.some((pattern) => pattern.test(prompt))).map(
    (requirement) => requirement.key,
  );

const internalMetaMatches = (prompt) =>
  INTERNAL_META_PATTERNS.filter(({pattern}) => pattern.test(prompt)).map(({key}) => key);

const isNegatedLegacyPhrase = (prompt, matchIndex, matchLength) => {
  const prefix = prompt.slice(Math.max(0, matchIndex - 40), matchIndex);
  const suffix = prompt.slice(matchIndex + matchLength, matchIndex + matchLength + 80);
  return /(?:禁止|しない|入れない|避ける|ではない|しません|禁止です|作らない)[^。\n]*$/.test(prefix) ||
    /^[^。\n]*(?:禁止|しない|入れない|避ける|ではない|しません|禁止です|作らない)/.test(suffix);
};

const patternMatchesNonNegated = (prompt, pattern) => {
  for (const match of prompt.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))) {
    if (!isNegatedLegacyPhrase(prompt, match.index ?? 0, match[0].length)) {
      return true;
    }
  }
  return false;
};

const legacyPromptMatches = (prompt) =>
  LEGACY_IMAGEGEN_PROMPT_PATTERNS.filter(({pattern}) => patternMatchesNonNegated(prompt, pattern)).map(({key}) => key);

const genericPromptMatches = (prompt) => GENERIC_PROMPT_PATTERNS.filter((pattern) => patternMatchesNonNegated(prompt, pattern));

const isNegatedForbiddenBatchPhrase = (prompt, matchIndex) => {
  const prefix = prompt.slice(Math.max(0, matchIndex - 40), matchIndex);
  return /(?:禁止|しない|入れない|避ける|ではない|しません|禁止です)[^。\n]*$/.test(prefix);
};

const hasForbiddenBatchInstruction = (prompt) =>
  BATCH_GENERATION_PATTERNS.some((pattern) => {
    for (const match of prompt.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))) {
      if (!isNegatedForbiddenBatchPhrase(prompt, match.index ?? 0)) {
        return true;
      }
    }
    return false;
  });

const auditPrompt = ({scene, location, issues}) => {
  const prompt = normalize(location.prompt);
  const heading = sceneHeadingFor(prompt, scene.id);

  if (prompt.length < 240) {
    pushIssue(issues, 'error', 'weak-yukkuri-imagegen-prompt', `${location.name}: imagegen_prompt is too short`, {
      prompt,
    });
    return;
  }

  if (!heading.title) {
    pushIssue(issues, 'error', 'missing-scene-heading', `${location.name}: imagegen_prompt must start from the target scene id and title`);
  } else {
    const headlineInstruction = new RegExp(`画像内に「${escapeRegExp(heading.title)}」という見出しを必ず目立つように配置してください。`);
    if (!headlineInstruction.test(prompt)) {
      pushIssue(
        issues,
        'error',
        'missing-image-headline-instruction',
        `${location.name}: imagegen_prompt must explicitly place the scene title inside the image as a prominent headline`,
        {
          scene_heading: heading.firstLine,
          expected_title: heading.title,
        },
      );
    }
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

  if (genericPromptMatches(prompt).length > 0) {
    pushIssue(issues, 'error', 'generic-icon-imagegen-prompt', `${location.name}: imagegen_prompt still points toward a generic white-background icon/card`);
  }

  const legacyPrompt = legacyPromptMatches(prompt);
  if (legacyPrompt.length > 0) {
    pushIssue(issues, 'error', 'legacy-imagegen-prompt-wording', `${location.name}: imagegen_prompt still contains old prompt wording`, {
      matched: legacyPrompt,
    });
  }

  if (hasForbiddenBatchInstruction(prompt)) {
    pushIssue(
      issues,
      'error',
      'batch-or-grid-imagegen-plan',
      `${location.name}: image generation must be one image per image gen call; grid/sheet/batch/crop generation is forbidden`,
    );
  }
};

const auditPlan = ({scene, plan, index, issues, registry}) => {
  const pathName = `${scene.id}.visual_asset_plan[${index}]`;
  const locations = promptLocationsFor(scene, plan, registry);

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
  const registry = await loadImagePromptRegistry(episodeDir);

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
        auditPlan({scene, plan, index, issues, registry});
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
