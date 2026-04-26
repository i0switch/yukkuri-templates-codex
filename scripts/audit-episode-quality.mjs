import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-episode-quality.mjs <episode_id|path/to/script.yaml|path/to/script.render.json>');
}

const SUB_CAPABLE_TEMPLATES = new Set(['Scene02', 'Scene03', 'Scene10', 'Scene13', 'Scene14']);
const VISION_SHIFT_WINDOW = 5;
const REFERENCE_METADATA_RATIO = 0.8;

const GENRE_PROFILES = new Set([
  'unsolved_mystery_list_6',
  'dark_case_list_4',
  'single_big_question_mystery',
  'public_person_controversy_safe',
]);
const LEGACY_REFERENCE_STYLE_PROFILES = new Set(['listicle_mystery', 'scandal_case', 'crime_timeline', 'deep_mystery']);
const REFERENCE_STYLE_PROFILES = new Set([...LEGACY_REFERENCE_STYLE_PROFILES, ...GENRE_PROFILES]);
const REFERENCE_BEATS = new Set([
  'op_hook',
  'greeting',
  'disclaimer',
  'topic_setup',
  'numbered_case',
  'timeline',
  'background',
  'evidence',
  'counterpoint',
  'unresolved_point',
  'midpoint_rehook',
  'summary',
  'cta',
]);
const STRONG_HOOK_TYPES = new Set([
  'unresolved_question',
  'strange_fact',
  'rumor_or_suspicion',
  'timeline_gap',
  'counterintuitive',
  'loss_or_warning',
]);
const HOOK_TYPES = new Set([...STRONG_HOOK_TYPES, 'none']);
const EVIDENCE_ROLES = new Set(['claim', 'background', 'evidence', 'counterpoint', 'limit', 'interpretation', 'summary', 'none']);

const QUALITY_PROFILE = {
  maxDuplicateLineCount: 2,
  maxRepeatedMainContentCount: 4,
  maxRepeatedSubContentCount: 4,
  minUniqueImageRatio: 0.5,
  minImageCountForLongEpisode: 8,
  longEpisodeSceneThreshold: 4,
  minImagePromptChars: 120,
  minSceneMetadataScenesRatio: 0.8,
  minImageAssetBytes: 100_000,
  minImageWidth: 640,
  minImageHeight: 360,
};

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

const REQUIRED_IMAGE_LEDGER_FIELDS = [
  'scene_id',
  'slot',
  'purpose',
  'adoption_reason',
  'imagegen_prompt',
  'imagegen_model',
  'visual_type',
  'supports_moment',
];
const BANNED_IMAGE_ASSET_METADATA_KEYS = [
  'generated_asset_sheet',
  'asset_sheet',
  'sprite_sheet',
  'crop_from',
  'source_rect',
  'parent_image',
  'cut_from',
  'derived_from_sheet',
  'local_project_generated_asset',
];

const DISALLOWED_IMAGE_SOURCE_PATTERNS = [
  /local[_ -]?project[_ -]?generated/i,
  /local[_ -]?generated/i,
  /generated locally by codex image[_ -]?gen skill/i,
  /generated in local project workspace/i,
  /fallback/i,
  /placeholder/i,
  /smoke/i,
  /card/i,
  /copy/i,
];

const APPROVED_IMAGE_SOURCE_PATTERNS = [
  /openai.*image/i,
  /image[_ -]?gen/i,
];

const AWKWARD_DIALOGUE_PATTERNS = [
  /羽目ぜ/,
  /コツぜ/,
  /仕組みぜ/,
  /得意ぜ/,
  /必須ぜ/,
  /必要ぜ/,
  /大事な$/,
  /十分な$/,
];

const ABSTRACT_ASSET_TERMS = [
  '図解',
  'カード',
  'イラスト',
  'シンプル',
  'わかりやすい',
  '動画用',
  'フラット',
  '日本語フラット図解カード',
  '小さく検証する',
];

const REQUIRED_IMAGE_PROMPT_TERMS = [
  {key: 'template', patterns: [/Scene\d{2}/i, /テンプレート/, /メイン枠/, /サブ枠/, /main枠/i, /sub枠/i]},
  {key: 'tone', patterns: [/トーン/, /雰囲気/, /動画/, /解説動画/, /ゆっくり/, /ずんだもん/]},
  {key: 'composition', patterns: [/中央/, /左/, /右/, /上部/, /下部/, /構図/, /配置/, /分割/]},
  {key: 'spacing', patterns: [/余白/, /読みやす/, /見やす/, /シンプル/, /1枚1メッセージ/]},
  {key: 'negative', patterns: [/文字なし/, /細かい文字なし/, /ロゴなし/, /実在人物なし/, /既存キャラクターなし/, /ブランドロゴなし/]},
];

const REQUIRED_DIALOGUE_SUPPORT_PROMPT_TERMS = [
  {key: 'visual_type', patterns: [/visual_type|hook_poster|boke_visual|tsukkomi_visual|myth_vs_fact|danger_simulation|before_after|three_step_board|checklist_panel|ranking_board|ui_mockup_safe|flowchart_scene|contrast_card|meme_like_diagram|mini_story_scene|final_action_card/]},
  {key: 'composition_type', patterns: [/composition_type|前景|中景|背景|視線/i]},
  {key: 'dialogue_support', patterns: [/会話|掛け合い|セリフ|ボケ|ツッコミ|誤解|訂正|補強|supports_moment/i]},
  {key: 'remotion_overlay', patterns: [/Remotion|重ねる|画像内の文字|長文は入れない/]},
  {key: 'bottom_safety', patterns: [/下部20%|字幕とキャラ|キャラ表示用|左右キャラ/]},
  {key: 'single_image_generation', patterns: [/1枚ずつ生成|一枚ずつ生成|この1枚専用|この一枚専用|他画像と同時生成しない|同時生成しない|個別生成|1画像につき1回|一画像につき一回/]},
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

const normalizeText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/[。、！？!?「」『』（）()\[\]【】・:：,，.．]/g, '')
    .trim();

const normalizeList = (items) => items.map((item) => normalizeText(item)).filter(Boolean).join('|');

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml') || value.endsWith('.json')) {
    return {scriptPath: directPath, episodeDir: path.dirname(directPath)};
  }

  const episodeDir = path.resolve(rootDir, 'script', value);
  return {scriptPath: path.join(episodeDir, 'script.yaml'), episodeDir};
};

const readScript = async (scriptPath) => {
  const raw = await fs.readFile(scriptPath, 'utf8');
  if (scriptPath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parseDocument(raw).toJS();
};

const readMeta = async (episodeDir) => {
  try {
    return JSON.parse(await fs.readFile(path.join(episodeDir, 'meta.json'), 'utf8'));
  } catch {
    return null;
  }
};

const contentSignature = (content) => {
  if (!content) {
    return 'null';
  }
  if (content.kind === 'image') {
    return normalizeText(content.caption || content.asset);
  }
  if (content.kind === 'bullets') {
    return normalizeList(content.items ?? []);
  }
  if (content.kind === 'text') {
    return normalizeText(content.text);
  }
  return normalizeText(JSON.stringify(content));
};

const countBy = (values) => {
  const counts = new Map();
  for (const value of values) {
    if (!value) {
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const entriesOver = (counts, limit) =>
  [...counts.entries()]
    .filter(([, count]) => count > limit)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({value, count}));

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

const assetFilePath = (episodeDir, assetPath) => path.resolve(episodeDir, assetPath.replaceAll('\\', '/'));

const readImageInfo = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return {
      type: 'png',
      bytes: buffer.length,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) {
        break;
      }
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          type: 'jpeg',
          bytes: buffer.length,
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + length;
    }
  }

  return {type: 'unknown', bytes: buffer.length, width: 0, height: 0};
};

const imagePromptFor = (content, metaEntries) => {
  const asset = content?.asset?.replaceAll('\\', '/');
  const meta = asset ? metaEntries.get(asset) : null;
  return [
    content?.asset_requirements?.imagegen_prompt,
    content?.asset_requirements?.generation_plan,
    content?.asset_requirements?.generation_method,
    content?.asset_requirements?.description,
    content?.asset_requirements?.style,
    meta?.imagegen_prompt,
    meta?.generation_plan,
    meta?.generation_method,
    meta?.description,
    meta?.title,
  ]
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .join(' / ');
};

const isSpecificAssetPrompt = (prompt) => {
  const normalized = normalizeText(prompt);
  if (normalized.length < QUALITY_PROFILE.minImagePromptChars) {
    return false;
  }
  return !ABSTRACT_ASSET_TERMS.some((term) => normalized === normalizeText(term));
};

const missingImagePromptTerms = (prompt) => {
  const text = String(prompt ?? '');
  return REQUIRED_IMAGE_PROMPT_TERMS.filter((requirement) => !requirement.patterns.some((pattern) => pattern.test(text))).map(
    (requirement) => requirement.key,
  );
};

const missingDialogueSupportPromptTerms = (prompt) => {
  const text = String(prompt ?? '');
  return REQUIRED_DIALOGUE_SUPPORT_PROMPT_TERMS.filter((requirement) => !requirement.patterns.some((pattern) => pattern.test(text))).map(
    (requirement) => requirement.key,
  );
};

const stripNegativeConstraintLines = (value) =>
  String(value ?? '')
    .split(/\r?\n/)
    .reduce(
      (state, line) => {
        if (/(禁止|must_not_include|negative|入れない|含めない)/i.test(line)) {
          state.skipping = true;
          return state;
        }
        if (state.skipping && /(生成単位|画面構図|デザイン|文字方針|品質基準)/.test(line) && line.trim() !== '') {
          state.skipping = false;
        }
        if (!state.skipping) {
          state.lines.push(line);
        }
        return state;
      },
      {lines: [], skipping: false},
    )
    .lines.join('\n');

const hasBatchGenerationPlan = (value) => BATCH_GENERATION_PATTERNS.some((pattern) => pattern.test(stripNegativeConstraintLines(value)));

const imageSourceText = (asset) =>
  [
    asset?.source_site,
    asset?.source_type,
    asset?.source_url,
    asset?.title,
    asset?.license,
    asset?.generator,
    asset?.provenance,
  ]
    .filter((value) => typeof value === 'string')
    .join(' ');

const isDisallowedImageSource = (asset) => DISALLOWED_IMAGE_SOURCE_PATTERNS.some((pattern) => pattern.test(imageSourceText(asset)));

const isApprovedImageSource = (asset) => {
  const text = imageSourceText(asset);
  return APPROVED_IMAGE_SOURCE_PATTERNS.some((pattern) => pattern.test(text));
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const imageGenerationIdentifiers = (asset) =>
  ['source_url', 'generation_id']
    .map((field) => ({field, value: typeof asset?.[field] === 'string' ? asset[field].trim() : ''}))
    .filter(({value}) => value !== '');

const primaryImageGenerationSource = (asset) => {
  const source = imageGenerationIdentifiers(asset)[0];
  return source ? `${source.field}:${source.value}` : '';
};

const hasSceneMetadata = (scene) =>
  typeof scene.scene_goal === 'string' &&
  scene.scene_goal.trim() !== '' &&
  typeof scene.viewer_question === 'string' &&
  scene.viewer_question.trim() !== '' &&
  typeof scene.visual_role === 'string' &&
  scene.visual_role.trim() !== '';

const hasVisualAssetPlan = (scene) =>
  Array.isArray(scene.visual_asset_plan) &&
  scene.visual_asset_plan.length > 0 &&
  scene.visual_asset_plan.every(
    (plan) =>
      isPlainObject(plan) &&
      typeof plan.slot === 'string' &&
      plan.slot.trim() !== '' &&
      typeof plan.purpose === 'string' &&
      plan.purpose.trim() !== '' &&
      Array.isArray(plan.supports_dialogue) &&
      plan.supports_dialogue.length > 0 &&
      typeof plan.supports_moment === 'string' &&
      plan.supports_moment.trim() !== '' &&
      VISUAL_TYPES.has(plan.visual_type) &&
      typeof plan.composition_type === 'string' &&
      plan.composition_type.trim() !== '' &&
      isPlainObject(plan.image_direction) &&
      typeof plan.image_direction.foreground === 'string' &&
      plan.image_direction.foreground.trim() !== '' &&
      typeof plan.image_direction.midground === 'string' &&
      plan.image_direction.midground.trim() !== '' &&
      typeof plan.image_direction.background === 'string' &&
      plan.image_direction.background.trim() !== '',
  );

const hasReferenceMetadata = (scene) =>
  typeof scene.reference_style === 'string' &&
  scene.reference_style.trim() !== '' &&
  typeof scene.reference_beat === 'string' &&
  scene.reference_beat.trim() !== '' &&
  typeof scene.hook_type === 'string' &&
  scene.hook_type.trim() !== '' &&
  typeof scene.curiosity_gap === 'string' &&
  scene.curiosity_gap.trim() !== '' &&
  typeof scene.evidence_role === 'string' &&
  scene.evidence_role.trim() !== '' &&
  typeof scene.next_reason === 'string' &&
  scene.next_reason.trim() !== '';

const hasAnyReferenceMetadata = (script) =>
  REFERENCE_STYLE_PROFILES.has(script.meta?.reference_style) ||
  GENRE_PROFILES.has(script.meta?.genre_profile) ||
  script.scenes.some((scene) =>
    ['reference_style', 'reference_beat', 'hook_type', 'curiosity_gap', 'evidence_role', 'next_reason'].some(
      (key) => scene?.[key] !== undefined,
    ),
  );

const resolvedTemplateForScript = (script) =>
  script.meta?.layout_template ?? script.meta?.scene_template ?? script.scenes?.find((scene) => scene?.scene_template)?.scene_template;

const assertRoleFlow = (script, errors) => {
  const roles = script.scenes.map((scene) => scene.role);
  if (!roles.includes('intro')) {
    pushIssue(errors, 'error', 'role-flow', 'At least one intro scene is required');
  }
  if (!roles.includes('body')) {
    pushIssue(errors, 'error', 'role-flow', 'At least one body scene is required');
  }
  if (!roles.includes('outro')) {
    pushIssue(errors, 'error', 'role-flow', 'At least one outro scene is required');
  }
  if (!roles.includes('cta')) {
    pushIssue(errors, 'error', 'role-flow', 'At least one cta scene is required');
  }
  if (roles[0] !== 'intro' && roles[0] !== 'hook') {
    pushIssue(errors, 'error', 'role-flow', `First scene should be intro or hook, got ${roles[0] ?? '<missing>'}`);
  }
  if (roles.at(-1) !== 'cta') {
    pushIssue(errors, 'error', 'role-flow', `Last scene should be cta, got ${roles.at(-1) ?? '<missing>'}`);
  }
};

const assertVisionShifts = (script, warnings) => {
  for (let start = 0; start < script.scenes.length; start += VISION_SHIFT_WINDOW) {
    const scenes = script.scenes.slice(start, start + VISION_SHIFT_WINDOW);
    if (scenes.length < VISION_SHIFT_WINDOW) {
      continue;
    }
    const signatures = new Set(scenes.map((scene) => `${scene.role}:${contentSignature(scene.main)}:${contentSignature(scene.sub)}`));
    if (signatures.size < 2) {
      pushIssue(
        warnings,
        'warning',
        'vision-shift',
        `Scenes ${start + 1}-${start + scenes.length} repeat the same role/content shape; add a visual or argument shift`,
      );
    }
  }
};

const assertReferenceStyleFit = (script, errors, warnings) => {
  if (!hasAnyReferenceMetadata(script)) {
    return;
  }

  const expectedStyle = script.meta?.genre_profile ?? script.meta?.reference_style;
  if (!REFERENCE_STYLE_PROFILES.has(expectedStyle)) {
    pushIssue(errors, 'error', 'reference-style', `meta.reference_style must be one of ${[...REFERENCE_STYLE_PROFILES].join(', ')}`);
  }

  const scenesWithReferenceMetadata = script.scenes.filter(hasReferenceMetadata).length;
  const referenceMetadataRatio = scenesWithReferenceMetadata / script.scenes.length;
  if (referenceMetadataRatio < REFERENCE_METADATA_RATIO) {
    pushIssue(errors, 'error', 'missing-reference-metadata', 'most scenes need reference_style, reference_beat, hook_type, curiosity_gap, evidence_role, and next_reason', {
      scenes: script.scenes.length,
      scenes_with_reference_metadata: scenesWithReferenceMetadata,
      minimum_ratio: REFERENCE_METADATA_RATIO,
    });
  }

  const invalidReferenceFields = [];
  for (const scene of script.scenes) {
    if (scene.reference_style !== undefined && !REFERENCE_STYLE_PROFILES.has(scene.reference_style)) {
      invalidReferenceFields.push({scene: scene.id, field: 'reference_style', value: scene.reference_style});
    }
    if (scene.reference_beat !== undefined && !REFERENCE_BEATS.has(scene.reference_beat)) {
      invalidReferenceFields.push({scene: scene.id, field: 'reference_beat', value: scene.reference_beat});
    }
    if (scene.hook_type !== undefined && !HOOK_TYPES.has(scene.hook_type)) {
      invalidReferenceFields.push({scene: scene.id, field: 'hook_type', value: scene.hook_type});
    }
    if (scene.evidence_role !== undefined && !EVIDENCE_ROLES.has(scene.evidence_role)) {
      invalidReferenceFields.push({scene: scene.id, field: 'evidence_role', value: scene.evidence_role});
    }
    if (expectedStyle && scene.reference_style && scene.reference_style !== expectedStyle) {
      invalidReferenceFields.push({scene: scene.id, field: 'reference_style', value: scene.reference_style, expected: expectedStyle});
    }
  }
  if (invalidReferenceFields.length > 0) {
    pushIssue(errors, 'error', 'invalid-reference-field', 'reference metadata contains unsupported values', {
      fields: invalidReferenceFields,
    });
  }

  const firstTwoScenes = script.scenes.slice(0, 2);
  if (!firstTwoScenes.some((scene) => STRONG_HOOK_TYPES.has(scene.hook_type))) {
    pushIssue(errors, 'error', 'reference-hook-missing', 'reference-style episodes need a strong hook_type in the first two scenes', {
      allowed_hook_types: [...STRONG_HOOK_TYPES],
    });
  }

  const referenceBeats = script.scenes.map((scene) => scene.reference_beat).filter(Boolean);
  if (!referenceBeats.includes('midpoint_rehook')) {
    pushIssue(errors, 'error', 'midpoint-rehook-missing', 'reference-style episodes need a midpoint_rehook beat');
  }
  if (!referenceBeats.includes('summary')) {
    pushIssue(errors, 'error', 'summary-beat-missing', 'reference-style episodes need a summary beat that returns to the opening question');
  }

  const viewerReactionLines = script.scenes.flatMap((scene) =>
    (scene.dialogue ?? []).filter((line) => line.speaker === 'left' && /[？?]|え、|なんで|つまり|怖|おかしく|マジ|どういう/.test(line.text ?? '')),
  );
  const totalDialogueLines = script.scenes.reduce((sum, scene) => sum + (scene.dialogue?.length ?? 0), 0);
  const viewerReactionRatio = viewerReactionLines.length / Math.max(1, totalDialogueLines);
  if (viewerReactionRatio < 0.2) {
    pushIssue(warnings, 'warning', 'viewer-reaction-thin', 'viewer-side questions/reactions are thin for reference-style yukkuri videos', {
      reaction_lines: viewerReactionLines.length,
      total_dialogue_lines: totalDialogueLines,
      minimum_ratio: 0.2,
    });
  }

  if (expectedStyle === 'listicle_mystery' || expectedStyle === 'unsolved_mystery_list_6') {
    const numberedCases = referenceBeats.filter((beat) => beat === 'numbered_case').length;
    const minimumCases = expectedStyle === 'unsolved_mystery_list_6' ? 6 : 3;
    if (numberedCases < minimumCases) {
      pushIssue(errors, 'error', 'numbered-case-insufficient', `${expectedStyle} needs at least ${minimumCases} numbered_case beats`, {
        numbered_cases: numberedCases,
        minimum_cases: minimumCases,
      });
    }
    if (!referenceBeats.includes('unresolved_point')) {
      pushIssue(errors, 'error', 'unresolved-point-missing', 'listicle_mystery needs at least one unresolved_point beat');
    }
  }

  if (expectedStyle === 'scandal_case' || expectedStyle === 'public_person_controversy_safe') {
    if (!referenceBeats.includes('disclaimer')) {
      pushIssue(errors, 'error', 'disclaimer-missing', `${expectedStyle} needs a disclaimer beat`);
    }
    const evidenceRoles = script.scenes.map((scene) => scene.evidence_role).filter(Boolean);
    for (const requiredRole of ['counterpoint', 'limit']) {
      if (!evidenceRoles.includes(requiredRole)) {
        pushIssue(errors, 'error', 'scandal-evidence-role-missing', `${expectedStyle} needs evidence_role: ${requiredRole}`);
      }
    }
  }

  if (expectedStyle === 'dark_case_list_4') {
    const numberedCases = referenceBeats.filter((beat) => beat === 'numbered_case').length;
    if (numberedCases < 4) {
      pushIssue(errors, 'error', 'numbered-case-insufficient', 'dark_case_list_4 needs at least four numbered_case beats', {
        numbered_cases: numberedCases,
      });
    }
    if (!referenceBeats.includes('disclaimer')) {
      pushIssue(errors, 'error', 'disclaimer-missing', 'dark_case_list_4 needs a disclaimer or caution beat');
    }
  }

  if (expectedStyle === 'crime_timeline') {
    const timelineBeats = referenceBeats.filter((beat) => beat === 'timeline').length;
    if (timelineBeats < 2) {
      pushIssue(errors, 'error', 'timeline-insufficient', 'crime_timeline needs multiple timeline beats', {
        timeline_beats: timelineBeats,
      });
    }
    const purposeText = [script.meta?.goal, script.meta?.tone, script.meta?.audience, ...script.scenes.map((scene) => scene.scene_goal)]
      .filter(Boolean)
      .join(' ');
    if (!/(注意喚起|再発防止|風化防止)/.test(purposeText)) {
      pushIssue(errors, 'error', 'crime-purpose-missing', 'crime_timeline needs an explicit caution/prevention/anti-forgetting purpose');
    }
  }

  if (expectedStyle === 'deep_mystery' || expectedStyle === 'single_big_question_mystery') {
    const hasBigQuestion = script.scenes.slice(0, 2).some((scene) => /なぜ|どうして|謎|疑問/.test(scene.curiosity_gap ?? ''));
    if (!hasBigQuestion) {
      pushIssue(errors, 'error', 'deep-question-missing', `${expectedStyle} needs a clear big question in the opening curiosity_gap`);
    }
    if (!script.scenes.some((scene) => scene.evidence_role === 'counterpoint')) {
      pushIssue(warnings, 'warning', 'deep-counterpoint-missing', `${expectedStyle} benefits from at least one counterpoint or alternate theory`);
    }
  }
};

const audit = async () => {
  const errors = [];
  const warnings = [];
  const {scriptPath, episodeDir} = resolveTarget(target);
  const script = await readScript(scriptPath);
  const meta = await readMeta(episodeDir);
  const metaEntries = imageEntriesFromMeta(meta);

  if (!isPlainObject(script) || !Array.isArray(script.scenes) || script.scenes.length === 0) {
    pushIssue(errors, 'error', 'script', 'script.scenes must be a non-empty array');
  } else {
    assertRoleFlow(script, errors);
    assertVisionShifts(script, warnings);
    assertReferenceStyleFit(script, errors, warnings);

    const dialogue = script.scenes.flatMap((scene) =>
      Array.isArray(scene.dialogue)
        ? scene.dialogue.map((line) => ({
            scene: scene.id,
            id: line.id,
            speaker: line.speaker,
            text: line.text,
            normalized: normalizeText(line.text),
          }))
        : [],
    );

    const repeatedLines = entriesOver(countBy(dialogue.map((line) => line.normalized)), QUALITY_PROFILE.maxDuplicateLineCount);
    if (repeatedLines.length > 0) {
      pushIssue(errors, 'error', 'repeated-dialogue', 'Dialogue lines are repeated too often', {
        repeated: repeatedLines.slice(0, 10),
      });
    }

    const awkwardDialogue = dialogue
      .filter((line) => AWKWARD_DIALOGUE_PATTERNS.some((pattern) => pattern.test(line.text)))
      .map((line) => ({scene: line.scene, id: line.id, speaker: line.speaker, text: line.text}));
    if (awkwardDialogue.length > 0) {
      pushIssue(errors, 'error', 'awkward-dialogue', 'Dialogue contains mechanical or unnatural wording that requires script review', {
        lines: awkwardDialogue.slice(0, 20),
      });
    }

    const rightRuns = [];
    for (const scene of script.scenes) {
      let run = 0;
      for (const line of scene.dialogue ?? []) {
        if (line.speaker === 'right') {
          run += 1;
          if (run >= 3) {
            rightRuns.push(scene.id);
            break;
          }
        } else {
          run = 0;
        }
      }
    }
    if (rightRuns.length > 0) {
      pushIssue(warnings, 'warning', 'explainer-monologue', 'Explainer speaks 3+ lines in a row; insert viewer reaction or question', {
        scenes: rightRuns,
      });
    }

    const mainRepeats = entriesOver(
      countBy(script.scenes.map((scene) => contentSignature(scene.main))),
      QUALITY_PROFILE.maxRepeatedMainContentCount,
    );
    if (mainRepeats.length > 0) {
      pushIssue(errors, 'error', 'repeated-main-content', 'main content is reused across too many scenes', {repeated: mainRepeats});
    }

    const subScenes = script.scenes.filter((scene) => scene.sub);
    const subRepeats = entriesOver(countBy(subScenes.map((scene) => contentSignature(scene.sub))), QUALITY_PROFILE.maxRepeatedSubContentCount);
    if (subRepeats.length > 0) {
      pushIssue(errors, 'error', 'repeated-sub-content', 'sub content is reused across too many scenes', {repeated: subRepeats});
    }

    const sceneTemplate = resolvedTemplateForScript(script);
    const missingSubRole = SUB_CAPABLE_TEMPLATES.has(sceneTemplate)
      ? script.scenes.filter((scene) => !scene.sub || contentSignature(scene.main) === contentSignature(scene.sub)).map((scene) => scene.id)
      : [];
    if (missingSubRole.length > 0) {
      pushIssue(errors, 'error', 'sub-role-missing', 'sub-capable templates must use sub as a distinct support/checklist area', {
        scenes: missingSubRole,
      });
    }

    const imageScenes = script.scenes.filter((scene) => scene.main?.kind === 'image' || scene.sub?.kind === 'image');
    const uniqueImageAssets = new Set(
      imageScenes.flatMap((scene) => [scene.main, scene.sub]).filter((content) => content?.kind === 'image').map((content) => content.asset),
    );
    const uniqueGenerationSources = new Set(
      [...uniqueImageAssets]
        .map((assetPath) => metaEntries.get(String(assetPath ?? '').replaceAll('\\', '/')))
        .map(primaryImageGenerationSource)
        .filter(Boolean),
    );
    if (uniqueImageAssets.size > 0 && hasOwn(meta ?? {}, 'generated_asset_sheet')) {
      pushIssue(errors, 'error', 'generated-asset-sheet', 'generated_asset_sheet is not allowed when image assets are present; batch/grid/sheet generation and crop/cut-out adoption are forbidden; generate each image with a separate image gen call', {
        generated_asset_sheet: meta.generated_asset_sheet,
        unique_image_assets: uniqueImageAssets.size,
      });
    }
    if (uniqueImageAssets.size > 0 && uniqueGenerationSources.size !== uniqueImageAssets.size) {
      pushIssue(errors, 'error', 'generation-source-count-mismatch', 'unique image assets must have one unique source_url or generation_id each', {
        unique_image_assets: uniqueImageAssets.size,
        unique_generation_sources: uniqueGenerationSources.size,
      });
    }
    if (script.scenes.length >= QUALITY_PROFILE.longEpisodeSceneThreshold && uniqueImageAssets.size < QUALITY_PROFILE.minImageCountForLongEpisode) {
      pushIssue(errors, 'error', 'too-few-images', 'long episodes need enough distinct image assets to avoid static-card fatigue', {
        scenes: script.scenes.length,
        unique_image_assets: uniqueImageAssets.size,
        minimum: QUALITY_PROFILE.minImageCountForLongEpisode,
      });
    }

    const bodyScenes = script.scenes.filter((scene) => scene.role === 'body');
    const bodyScenesWithoutMainImage = bodyScenes.filter((scene) => scene.main?.kind !== 'image').map((scene) => scene.id);
    if (bodyScenes.length >= 2 && bodyScenesWithoutMainImage.length > Math.floor(bodyScenes.length / 2)) {
      pushIssue(errors, 'error', 'too-many-body-scenes-without-main-image', 'most body scenes need a main image asset for watchability', {
        body_scenes: bodyScenes.length,
        scenes_without_main_image: bodyScenesWithoutMainImage,
      });
    }

    const imageRatio = uniqueImageAssets.size / Math.max(1, script.scenes.length);
    if (script.scenes.length >= QUALITY_PROFILE.longEpisodeSceneThreshold && imageRatio < QUALITY_PROFILE.minUniqueImageRatio) {
      pushIssue(errors, 'error', 'low-image-variety', 'image variety is too low for the episode length', {
        scenes: script.scenes.length,
        unique_image_assets: uniqueImageAssets.size,
        minimum_ratio: QUALITY_PROFILE.minUniqueImageRatio,
      });
    }

    const weakImagePrompts = [];
    const incompleteImagePrompts = [];
    const incompleteDialogueSupportPrompts = [];
    const batchGenerationPrompts = [];
    for (const scene of script.scenes) {
      for (const key of ['main', 'sub']) {
        const content = scene[key];
        if (content?.kind !== 'image') {
          continue;
        }
        const prompt = imagePromptFor(content, metaEntries);
        if (hasBatchGenerationPlan(prompt)) {
          batchGenerationPrompts.push({scene: scene.id, slot: key, asset: content.asset, prompt});
        }
        if (!isSpecificAssetPrompt(prompt)) {
          weakImagePrompts.push({scene: scene.id, slot: key, asset: content.asset, prompt});
        }
        const missing = missingImagePromptTerms(prompt);
        if (missing.length > 0) {
          incompleteImagePrompts.push({scene: scene.id, slot: key, asset: content.asset, missing, prompt});
        }
        const dialogueMissing = missingDialogueSupportPromptTerms(prompt);
        if (dialogueMissing.length > 0) {
          incompleteDialogueSupportPrompts.push({scene: scene.id, slot: key, asset: content.asset, missing: dialogueMissing, prompt});
        }
      }
    }
    if (weakImagePrompts.length > 0) {
      pushIssue(errors, 'error', 'weak-image-prompt', 'image assets need concrete template-aware generation prompts', {
        assets: weakImagePrompts.slice(0, 12),
      });
    }
    if (incompleteImagePrompts.length > 0) {
      pushIssue(errors, 'error', 'incomplete-imagegen-prompt', 'imagegen prompts must include template/tone/composition/spacing/negative constraints', {
        assets: incompleteImagePrompts.slice(0, 12),
        required_prompt_terms: REQUIRED_IMAGE_PROMPT_TERMS.map((requirement) => requirement.key),
      });
    }
    if (incompleteDialogueSupportPrompts.length > 0) {
      pushIssue(errors, 'error', 'incomplete-dialogue-support-imagegen-prompt', 'imagegen prompts must support concrete yukkuri/zundamon dialogue moments, not generic icon cards', {
        assets: incompleteDialogueSupportPrompts.slice(0, 12),
        required_prompt_terms: REQUIRED_DIALOGUE_SUPPORT_PROMPT_TERMS.map((requirement) => requirement.key),
      });
    }
    if (batchGenerationPrompts.length > 0) {
      pushIssue(errors, 'error', 'batch-or-grid-imagegen-plan', 'imagegen prompts must request one image per image gen call; grid/sheet/batch/crop generation is forbidden', {
        assets: batchGenerationPrompts.slice(0, 12),
      });
    }

    const scenesWithMetadata = script.scenes.filter(hasSceneMetadata).length;
    const metadataRatio = scenesWithMetadata / script.scenes.length;
    if (metadataRatio < QUALITY_PROFILE.minSceneMetadataScenesRatio) {
      pushIssue(errors, 'error', 'missing-scene-quality-metadata', 'most scenes need scene_goal, viewer_question, and visual_role', {
        scenes: script.scenes.length,
        scenes_with_metadata: scenesWithMetadata,
        minimum_ratio: QUALITY_PROFILE.minSceneMetadataScenesRatio,
      });
    }

    const scenesWithoutVisualAssetPlan = script.scenes.filter((scene) => !hasVisualAssetPlan(scene)).map((scene) => scene.id);
    if (scenesWithoutVisualAssetPlan.length > 0) {
      pushIssue(errors, 'error', 'missing-visual-asset-plan', 'each scene needs visual_asset_plan with image_direction, visual_type, supports_dialogue, and supports_moment for asset density and audit handoff', {
        scenes: scenesWithoutVisualAssetPlan,
      });
    }

    const planVisualTypes = script.scenes
      .flatMap((scene) => (Array.isArray(scene.visual_asset_plan) ? scene.visual_asset_plan : []))
      .map((plan) => plan.visual_type)
      .filter(Boolean);
    if (planVisualTypes.length >= 4 && new Set(planVisualTypes).size < 3) {
      pushIssue(errors, 'error', 'low-visual-type-variety', 'visual_type must vary across scenes so GPT-Image-2 does not produce samey generic diagrams', {
        visual_types: planVisualTypes,
        unique_visual_types: [...new Set(planVisualTypes)],
      });
    }

    const vagueMetaAssets = [];
    const incompleteLedgerAssets = [];
    const disallowedAssetSources = [];
    const unapprovedAssetSources = [];
    const bannedImageAssetMetadata = [];
    const duplicateImagegenSources = [];
    const weakImageFiles = [];
    const invalidDialogueSupportLedger = [];
    const imageSourceOwners = new Map();
    for (const [file, asset] of metaEntries.entries()) {
      if (!file.startsWith('assets/')) {
        continue;
      }
      const description = [asset.description, asset.imagegen_prompt, asset.title].filter(Boolean).join(' / ');
      if (!isSpecificAssetPrompt(description)) {
        vagueMetaAssets.push({file, description});
      }
      const missingLedgerFields = REQUIRED_IMAGE_LEDGER_FIELDS.filter(
        (field) => typeof asset[field] !== 'string' || asset[field].trim() === '',
      );
      if (!isPlainObject(asset.image_direction)) {
        missingLedgerFields.push('image_direction');
      }
      if (!Array.isArray(asset.supports_dialogue) || asset.supports_dialogue.length === 0) {
        missingLedgerFields.push('supports_dialogue');
      }
      if (imageGenerationIdentifiers(asset).length === 0) {
        missingLedgerFields.push('source_url or generation_id');
      }
      if (missingLedgerFields.length > 0) {
        incompleteLedgerAssets.push({file, missing: missingLedgerFields});
      }
      const bannedKeys = BANNED_IMAGE_ASSET_METADATA_KEYS.filter((key) => hasOwn(asset, key));
      if (bannedKeys.length > 0) {
        bannedImageAssetMetadata.push({file, banned_keys: bannedKeys, reason: 'batch/grid/sheet generation and crop/cut-out adoption are forbidden'});
      }
      for (const {field, value} of imageGenerationIdentifiers(asset)) {
        const key = `${field}:${value}`;
        const owner = imageSourceOwners.get(key);
        if (owner) {
          duplicateImagegenSources.push({file, first_file: owner.file, field, value});
        } else {
          imageSourceOwners.set(key, {file});
        }
      }
      if (isDisallowedImageSource(asset)) {
        disallowedAssetSources.push({file, source: imageSourceText(asset)});
      } else if (!isApprovedImageSource(asset)) {
        unapprovedAssetSources.push({file, source: imageSourceText(asset)});
      }
      if (!VISUAL_TYPES.has(asset.visual_type)) {
        invalidDialogueSupportLedger.push({file, field: 'visual_type', value: asset.visual_type, allowed: [...VISUAL_TYPES]});
      }
      if (Array.isArray(asset.supports_dialogue) && asset.supports_dialogue.some((id) => typeof id !== 'string' || !/^s\d+_l\d+/i.test(id))) {
        invalidDialogueSupportLedger.push({file, field: 'supports_dialogue', value: asset.supports_dialogue});
      }
      if (isPlainObject(asset.image_direction)) {
        const safety = asset.image_direction.layout_safety;
        if (safety?.keep_bottom_20_percent_empty !== true || safety?.avoid_character_area !== true) {
          invalidDialogueSupportLedger.push({
            file,
            field: 'image_direction.layout_safety',
            value: safety,
            expected: 'keep_bottom_20_percent_empty and avoid_character_area must be true',
          });
        }
      }

      try {
        const info = await readImageInfo(assetFilePath(episodeDir, file));
        if (
          info.bytes < QUALITY_PROFILE.minImageAssetBytes ||
          info.width < QUALITY_PROFILE.minImageWidth ||
          info.height < QUALITY_PROFILE.minImageHeight
        ) {
          weakImageFiles.push({
            file,
            bytes: info.bytes,
            width: info.width,
            height: info.height,
            minimum: {
              bytes: QUALITY_PROFILE.minImageAssetBytes,
              width: QUALITY_PROFILE.minImageWidth,
              height: QUALITY_PROFILE.minImageHeight,
            },
          });
        }
      } catch (error) {
        weakImageFiles.push({file, error: error.message});
      }
    }
    if (vagueMetaAssets.length > 0) {
      pushIssue(errors, 'error', 'vague-asset-ledger', 'meta.json image entries need concrete visual descriptions or prompts', {
        assets: vagueMetaAssets.slice(0, 12),
      });
    }
    if (incompleteLedgerAssets.length > 0) {
      pushIssue(errors, 'error', 'incomplete-asset-ledger', 'meta.json image entries need scene_id, slot, purpose, adoption_reason, imagegen_prompt, imagegen_model, image_direction, visual_type, supports_dialogue, supports_moment, and source_url or generation_id', {
        assets: incompleteLedgerAssets.slice(0, 12),
      });
    }
    if (invalidDialogueSupportLedger.length > 0) {
      pushIssue(errors, 'error', 'invalid-dialogue-support-ledger', 'meta.json image entries must use supported visual_type values and safe dialogue-linked image_direction metadata', {
        assets: invalidDialogueSupportLedger.slice(0, 20),
      });
    }
    if (bannedImageAssetMetadata.length > 0) {
      pushIssue(errors, 'error', 'banned-image-asset-metadata', 'image entries must not contain sheet/crop provenance metadata; batch/grid/sheet generation and crop/cut-out adoption are forbidden', {
        assets: bannedImageAssetMetadata.slice(0, 20),
        banned_keys: BANNED_IMAGE_ASSET_METADATA_KEYS,
      });
    }
    if (duplicateImagegenSources.length > 0) {
      pushIssue(errors, 'error', 'duplicate-imagegen-source', 'multiple image assets share the same source_url or generation_id', {
        assets: duplicateImagegenSources.slice(0, 20),
      });
    }
    if (disallowedAssetSources.length > 0) {
      pushIssue(errors, 'error', 'disallowed-image-source', 'delivery images must not be fallback, placeholder, copied, or local card assets', {
        assets: disallowedAssetSources.slice(0, 20),
      });
    }
    if (unapprovedAssetSources.length > 0) {
      pushIssue(errors, 'error', 'unapproved-image-source', 'Codex delivery images must use image gen provenance only; NotebookLM and licensed downloads are not accepted for inserted images', {
        assets: unapprovedAssetSources.slice(0, 20),
      });
    }
    if (weakImageFiles.length > 0) {
      pushIssue(errors, 'error', 'weak-image-file', 'delivery images are missing, too small, or not inspectable as real raster assets', {
        assets: weakImageFiles.slice(0, 20),
      });
    }
  }

  const report = {
    ok: errors.length === 0,
    episode_id: script?.meta?.id ?? path.basename(episodeDir),
    checked_at: new Date().toISOString(),
    quality_profile: QUALITY_PROFILE,
    reference_quality_profile: {
      styles: [...REFERENCE_STYLE_PROFILES],
      genre_profiles: [...GENRE_PROFILES],
      metadata_ratio: REFERENCE_METADATA_RATIO,
      beats: [...REFERENCE_BEATS],
      hook_types: [...HOOK_TYPES],
      evidence_roles: [...EVIDENCE_ROLES],
    },
    script_path: path.relative(rootDir, scriptPath),
    errors,
    warnings,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
