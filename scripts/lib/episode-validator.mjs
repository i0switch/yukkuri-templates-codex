import fs from 'node:fs/promises';
import path from 'node:path';
import {isValidRmAquesTalkPreset, normalizeAquesTalkPreset, VALID_RM_AQUESTALK_PRESETS} from './aquestalk-presets.mjs';

export const SCENE_TEMPLATE_IDS = Array.from({length: 21}, (_, index) => `Scene${String(index + 1).padStart(2, '0')}`);
export const SCENE_TEMPLATE_ID_SET = new Set(SCENE_TEMPLATE_IDS);
export const SUB_CAPABLE_TEMPLATES = new Set(['Scene02', 'Scene03', 'Scene10', 'Scene13', 'Scene14']);
export const TITLE_CAPABLE_TEMPLATES = new Set(['Scene04', 'Scene08', 'Scene12', 'Scene15', 'Scene16', 'Scene17', 'Scene19']);
export const CONTENT_KINDS = new Set(['text', 'bullets', 'image']);
export const TYPOGRAPHY_FAMILIES = new Set(['gothic', 'mincho']);
export const TYPOGRAPHY_FAMILY_KEYS = new Set(['subtitle_family', 'content_family', 'title_family']);
export const TYPOGRAPHY_COLOR_KEYS = new Set(['subtitle_stroke_color', 'content_stroke_color', 'title_stroke_color']);
export const TYPOGRAPHY_WIDTH_KEYS = new Set(['subtitle_stroke_width', 'content_stroke_width', 'title_stroke_width']);
export const TYPOGRAPHY_KEYS = new Set([...TYPOGRAPHY_FAMILY_KEYS, ...TYPOGRAPHY_COLOR_KEYS, ...TYPOGRAPHY_WIDTH_KEYS]);
export const DIALOGUE_TYPOGRAPHY_KEYS = new Set(['subtitle_family', 'subtitle_stroke_color', 'subtitle_stroke_width']);
export const MOTION_MODES = new Set(['normal', 'punch', 'compare', 'warning', 'checklist', 'reveal', 'recap']);
export const EMPHASIS_STYLES = new Set(['punch', 'danger', 'surprise', 'number', 'action']);
export const EMPHASIS_SE = new Set(['pop', 'warning', 'question', 'reveal', 'success', 'fail', 'none']);
export const EMPHASIS_PAUSES_MS = new Set([0, 200, 300, 500]);
export const DIALOGUE_EXPRESSIONS = new Set([
  'normal',
  'neutral',
  'smile',
  'surprise',
  'shock',
  'wry',
  'confused',
  'confident',
  'laugh',
  'smug',
  'calm',
  'talk',
  'happy',
  'smirk',
  'halfOpen',
  'surprised',
  'shocked',
  'puzzled',
  'worried',
  'serious',
]);
export const VISUAL_IMAGE_ROLES = new Set(['理解補助', '不安喚起', '笑い', '比較', '手順整理', '証拠提示', 'オチ補助']);
export const VISUAL_COMPOSITION_TYPES = new Set([
  'NG / OK 比較',
  '失敗例シミュレーション',
  '誇張図解',
  '証拠写真風',
  'チェックリスト',
  '手順図',
  '原因マップ',
  'ビフォーアフター',
  'ツッコミ待ち構図',
  '事故寸前構図',
]);
export const KEIFONT_PUBLIC_PATH = path.join('public', 'fonts', 'keifont.ttf');
export const ZM_VOICEVOX_BINDINGS = Object.freeze({
  left: Object.freeze({character: 'zundamon', voicevoxSpeakerId: 3}),
  right: Object.freeze({character: 'metan', voicevoxSpeakerId: 2}),
});

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isFinitePositive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const normalizeAssetPath = (assetPath) => assetPath.replaceAll('\\', '/');

const pushIssue = (issues, level, pathName, message) => {
  issues.push({level, path: pathName, message});
};

const round1 = (value) => Math.round(value * 10) / 10;

const durationWindowForTarget = (targetSec) => {
  if (!Number.isFinite(targetSec) || targetSec <= 0) {
    return null;
  }
  return {min: targetSec * 0.9, max: targetSec * 1.1};
};

const IMAGE_ASSET_EXTENSION_RE = /\.(png|jpe?g|webp|gif)$/i;
const REQUIRED_IMAGE_LEDGER_FIELDS = [
  'source_type',
  'license',
  'scene_id',
  'slot',
  'purpose',
  'adoption_reason',
  'imagegen_prompt',
];
const USER_GENERATED_SOURCE_TYPE = 'user_generated';
const IMAGEGEN_SOURCE_TYPE = 'imagegen';
const IMAGEGEN_SOURCE_URL_RE = /^codex:\/\/generated_images\/.+/i;

const isSafeEpisodeRelativePath = (filePath) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    return false;
  }

  const normalized = normalizeAssetPath(filePath);
  const segments = normalized.split('/');
  return !path.isAbsolute(normalized) && !segments.includes('..') && !normalized.startsWith('public/');
};

const assertEpisodeFile = async ({filePath, episodeDir, issuePath, label, errors, promptOnly = false}) => {
  if (!isSafeEpisodeRelativePath(filePath)) {
    pushIssue(errors, 'error', issuePath, `${label} must be a safe relative episode path: ${filePath ?? '<missing>'}`);
    return;
  }

  if (!episodeDir || promptOnly) {
    return;
  }

  const normalized = normalizeAssetPath(filePath);
  const file = path.resolve(episodeDir, normalized);
  const root = path.resolve(episodeDir);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    pushIssue(errors, 'error', issuePath, `${label} escapes the episode directory: ${filePath}`);
    return;
  }

  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) {
      pushIssue(errors, 'error', issuePath, `${label} is not a file: ${filePath}`);
    }
  } catch {
    pushIssue(errors, 'error', issuePath, `${label} does not exist: ${filePath}`);
  }
};

const validateTypographyConfig = ({config, pathName, errors, warnings, usedExplicitGothic, allowedKeys = TYPOGRAPHY_KEYS}) => {
  if (config === undefined || config === null) {
    return;
  }

  if (!isPlainObject(config)) {
    pushIssue(errors, 'error', pathName, 'typography must be an object');
    return;
  }

  for (const key of Object.keys(config)) {
    if (!allowedKeys.has(key)) {
      const level = pathName.includes('.dialogue[') && TYPOGRAPHY_KEYS.has(key) ? 'error' : 'error';
      const message = pathName.includes('.dialogue[')
        ? 'dialogue typography only supports subtitle_family, subtitle_stroke_color, and subtitle_stroke_width'
        : 'typography only supports family and stroke keys for subtitle, content, and title';
      pushIssue(level === 'error' ? errors : warnings, level, `${pathName}.${key}`, message);
      continue;
    }

    const value = config[key];
    if (TYPOGRAPHY_COLOR_KEYS.has(key)) {
      if (typeof value !== 'string' || value.trim() === '') {
        pushIssue(errors, 'error', `${pathName}.${key}`, `typography stroke color must be a non-empty string: ${value ?? '<missing>'}`);
      }
      continue;
    }

    if (TYPOGRAPHY_WIDTH_KEYS.has(key)) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 24) {
        pushIssue(errors, 'error', `${pathName}.${key}`, `typography stroke width must be a number from 0 to 24: ${value ?? '<missing>'}`);
      }
      continue;
    }

    if (!TYPOGRAPHY_FAMILIES.has(value)) {
      pushIssue(errors, 'error', `${pathName}.${key}`, `typography family must be gothic or mincho: ${value ?? '<missing>'}`);
      continue;
    }

    if (value === 'gothic') {
      usedExplicitGothic.value = true;
    }
  }
};

const assertKeifontIfNeeded = async ({rootDir, usedExplicitGothic, errors}) => {
  if (!usedExplicitGothic.value) {
    return;
  }

  const fontPath = path.resolve(rootDir, KEIFONT_PUBLIC_PATH);
  try {
    const stat = await fs.stat(fontPath);
    if (!stat.isFile()) {
      pushIssue(errors, 'error', 'public/fonts/keifont.ttf', 'explicit gothic typography requires public/fonts/keifont.ttf');
    }
  } catch {
    pushIssue(errors, 'error', 'public/fonts/keifont.ttf', 'explicit gothic typography requires public/fonts/keifont.ttf');
  }
};

const readMetaJson = async ({episodeDir, errors}) => {
  if (!episodeDir) {
    return null;
  }

  const metaPath = path.join(episodeDir, 'meta.json');
  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(raw);
    if (!isPlainObject(meta)) {
      pushIssue(errors, 'error', 'meta.json', 'meta.json must contain a JSON object');
      return null;
    }
    return meta;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      pushIssue(errors, 'error', 'meta.json', 'meta.json is required for asset/license audit');
      return null;
    }

    pushIssue(errors, 'error', 'meta.json', `meta.json could not be parsed: ${error.message}`);
    return null;
  }
};

const readImagegenManifest = async ({episodeDir, errors}) => {
  if (!episodeDir) {
    return null;
  }

  const manifestPath = path.join(episodeDir, 'imagegen_manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    if (!isPlainObject(manifest)) {
      pushIssue(errors, 'error', 'imagegen_manifest.json', 'imagegen_manifest.json must contain a JSON object');
      return null;
    }
    return manifest;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    pushIssue(errors, 'error', 'imagegen_manifest.json', `imagegen_manifest.json could not be parsed: ${error.message}`);
    return null;
  }
};

const validateNoAudioPlaybackRate = ({script, meta, errors}) => {
  const scan = (value, pathName, sourceLabel) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scan(item, `${pathName}[${index}]`, sourceLabel));
      return;
    }
    if (!isPlainObject(value)) {
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${pathName}.${key}`;
      if (key === 'audio_playback_rate') {
        pushIssue(
          errors,
          'error',
          childPath,
          `audio_playback_rate is forbidden in ${sourceLabel}; keep speech speed fixed and adjust dialogue density or natural pauses instead`,
        );
      }
      scan(child, childPath, sourceLabel);
    }
  };

  scan(script, 'script.yaml', 'script.yaml');

  if (meta) {
    scan(meta, 'meta.json', 'meta.json');
  }
};

const collectReferencedFiles = (script) => {
  const files = [];

  if (script.bgm?.file) {
    files.push({file: script.bgm.file, kind: 'bgm', path: 'bgm.file'});
  }

  script.scenes.forEach((scene, sceneIndex) => {
    for (const contentKey of ['main', 'sub']) {
      const content = scene?.[contentKey];
      if (content?.kind === 'image') {
        files.push({
          file: content.asset,
          kind: 'image',
          path: `scenes[${sceneIndex}].${contentKey}.asset`,
        });
      }
    }
    if (Array.isArray(scene?.main_timeline)) {
      scene.main_timeline.forEach((entry, entryIndex) => {
        if (entry?.asset) {
          files.push({
            file: entry.asset,
            kind: 'image',
            path: `scenes[${sceneIndex}].main_timeline[${entryIndex}].asset`,
          });
        }
      });
    }
  });

  return files;
};

const isImageLedgerFile = (file) => {
  const normalized = normalizeAssetPath(String(file ?? ''));
  return normalized.startsWith('assets/') && IMAGE_ASSET_EXTENSION_RE.test(normalized);
};

const isUserGeneratedImageAsset = (asset) => asset?.source_type === USER_GENERATED_SOURCE_TYPE;
const isImagegenImageAsset = (asset) => asset?.source_type === IMAGEGEN_SOURCE_TYPE;

const imagegenManifestEntries = (manifest) => {
  if (!manifest) {
    return [];
  }
  if (Array.isArray(manifest.images)) {
    return manifest.images;
  }
  if (Array.isArray(manifest.generated_images)) {
    return manifest.generated_images;
  }
  if (Array.isArray(manifest.entries)) {
    return manifest.entries;
  }
  return [];
};

const manifestFileForEntry = (entry) => normalizeAssetPath(entry?.file ?? entry?.destination ?? entry?.saved_path ?? entry?.asset ?? '');

const manifestSourceForEntry = (entry) => entry?.source_url ?? entry?.generation_id ?? entry?.generated_id ?? '';

const manifestEntryForAsset = ({manifest, asset}) => {
  const entries = imagegenManifestEntries(manifest);
  const normalizedFile = normalizeAssetPath(asset.file);
  return (
    entries.find((entry) => manifestFileForEntry(entry) === normalizedFile) ??
    entries.find((entry) => entry?.scene_id === asset.scene_id && entry?.slot === asset.slot) ??
    null
  );
};

const validateMetaLedger = async ({script, meta, imagegenManifest, errors}) => {
  if (!meta) {
    return;
  }

  if (!Array.isArray(meta.assets)) {
    pushIssue(errors, 'error', 'meta.json.assets', 'meta.json assets array is required');
    return;
  }

  const references = collectReferencedFiles(script);
  const referencedImageFiles = new Set(references.filter((reference) => reference.kind === 'image').map((reference) => normalizeAssetPath(reference.file)));
  const assetEntries = new Map();
  for (const [index, asset] of meta.assets.entries()) {
    if (!isPlainObject(asset)) {
      pushIssue(errors, 'error', `meta.json.assets[${index}]`, 'asset ledger entry must be an object');
      continue;
    }

    if (typeof asset.file !== 'string' || asset.file.trim() === '') {
      pushIssue(errors, 'error', `meta.json.assets[${index}].file`, 'asset ledger entry requires file');
      continue;
    }

    const normalizedFile = normalizeAssetPath(asset.file);
    assetEntries.set(normalizedFile, {asset, index});

    const isImageAsset = referencedImageFiles.has(normalizedFile) || isImageLedgerFile(normalizedFile);
    if (!isImageAsset) {
      if (typeof asset.license !== 'string' || asset.license.trim() === '') {
        pushIssue(errors, 'error', `meta.json.assets[${index}].license`, `${asset.file}: license is required`);
      }
      continue;
    }

    const missingImageFields = REQUIRED_IMAGE_LEDGER_FIELDS.filter((field) => typeof asset[field] !== 'string' || asset[field].trim() === '');
    if (missingImageFields.length > 0) {
      pushIssue(
        errors,
        'error',
        `meta.json.assets[${index}]`,
        `${asset.file}: image ledger entry requires ${missingImageFields.join(', ')}`,
      );
    }

    if (isUserGeneratedImageAsset(asset)) {
      if (typeof asset.generation_tool !== 'string' || asset.generation_tool.trim() === '') {
        pushIssue(
          errors,
          'error',
          `meta.json.assets[${index}].generation_tool`,
          `${asset.file}: user_generated image assets require generation_tool`,
        );
      }
      if (asset.rights_confirmed !== true) {
        pushIssue(
          errors,
          'error',
          `meta.json.assets[${index}].rights_confirmed`,
          `${asset.file}: user_generated image assets require rights_confirmed: true`,
        );
      }
    } else if (isImagegenImageAsset(asset)) {
      if (asset.generation_tool !== 'codex-imagegen') {
        pushIssue(
          errors,
          'error',
          `meta.json.assets[${index}].generation_tool`,
          `${asset.file}: imagegen assets require generation_tool: codex-imagegen`,
        );
      }
      const hasGenerationId = typeof asset.generation_id === 'string' && asset.generation_id.trim() !== '';
      const hasCodexSourceUrl = typeof asset.source_url === 'string' && IMAGEGEN_SOURCE_URL_RE.test(asset.source_url);
      if (!hasGenerationId && !hasCodexSourceUrl) {
        pushIssue(
          errors,
          'error',
          `meta.json.assets[${index}].source_url`,
          `${asset.file}: imagegen assets require source_url codex://generated_images/... or generation_id`,
        );
      }
      if (asset.rights_confirmed !== true) {
        pushIssue(
          errors,
          'error',
          `meta.json.assets[${index}].rights_confirmed`,
          `${asset.file}: imagegen assets require rights_confirmed: true`,
        );
      }

      const manifestEntry = manifestEntryForAsset({manifest: imagegenManifest, asset});
      if (!manifestEntry) {
        pushIssue(
          errors,
          'error',
          'imagegen_manifest.json',
          `${asset.file}: imagegen assets require matching imagegen_manifest.json entry`,
        );
      } else {
        const manifestFile = manifestFileForEntry(manifestEntry);
        if (manifestFile !== normalizedFile) {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest destination does not match asset file`);
        }
        if (manifestEntry.scene_id !== asset.scene_id) {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest scene_id must match meta.json`);
        }
        if ((manifestEntry.slot ?? 'main') !== (asset.slot ?? 'main')) {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest slot must match meta.json`);
        }
        if ((asset.slot_group ?? null) && (manifestEntry.slot_group ?? asset.slot_group) !== asset.slot_group) {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest slot_group must match meta.json`);
        }
        const manifestSource = String(manifestSourceForEntry(manifestEntry) ?? '').trim();
        const assetSources = [asset.source_url, asset.generation_id].filter((value) => typeof value === 'string' && value.trim() !== '');
        if (assetSources.length > 0 && manifestSource && !assetSources.includes(manifestSource)) {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest source_url/generation_id must match meta.json`);
        }
        if (typeof manifestEntry.prompt_sha256 !== 'string' || manifestEntry.prompt_sha256.trim() === '') {
          pushIssue(errors, 'error', 'imagegen_manifest.json', `${asset.file}: manifest entry requires prompt_sha256`);
        }
      }
    } else {
      pushIssue(
        errors,
        'error',
        `meta.json.assets[${index}].source_type`,
        `${asset.file}: image source_type must be imagegen or user_generated`,
      );
    }
  }

  for (const reference of references) {
    const normalized = normalizeAssetPath(reference.file);
    const entry = assetEntries.get(normalized);
    if (!entry) {
      pushIssue(errors, 'error', 'meta.json.assets', `${reference.path}: referenced ${reference.kind} is missing from meta.json assets: ${reference.file}`);
      continue;
    }

    // Source/provenance fields are intentionally non-blocking in direct script_final image prompt mode.
  }
};

const assertAssetPath = async ({assetPath, episodeDir, sceneId, contentPath, errors, promptOnly = false}) => {
  if (typeof assetPath !== 'string' || assetPath.trim() === '') {
    pushIssue(errors, 'error', contentPath, `${sceneId}: image.asset is required`);
    return;
  }

  if (assetPath.includes('\\')) {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset must use forward slashes: ${assetPath}`);
  }

  const normalized = normalizeAssetPath(assetPath);
  const segments = normalized.split('/');

  if (!normalized.startsWith('assets/')) {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset must start with assets/: ${assetPath}`);
  }

  if (path.isAbsolute(normalized) || segments.includes('..') || normalized.startsWith('public/')) {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset must be a safe relative assets/... path: ${assetPath}`);
  }

  if (!episodeDir || promptOnly) {
    return;
  }

  const assetFile = path.resolve(episodeDir, normalized);
  const assetsRoot = path.resolve(episodeDir, 'assets');
  if (!assetFile.startsWith(`${assetsRoot}${path.sep}`)) {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset escapes the episode assets directory: ${assetPath}`);
    return;
  }

  try {
    const stat = await fs.stat(assetFile);
    if (!stat.isFile()) {
      pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset is not a file: ${assetPath}`);
    }
  } catch {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset does not exist: ${assetPath}`);
  }
};

const SUB_TEXT_WARN_THRESHOLD = 140;
const SUB_BULLETS_WARN_THRESHOLD = 6;
const MAIN_TIMELINE_SLOT_RE = /^main(?:_\d{2})?$/;

const hasSceneEmphasis = (scene, {requireSe = false} = {}) =>
  Array.isArray(scene?.dialogue) &&
  scene.dialogue.some((line) => {
    if (!isPlainObject(line?.emphasis)) {
      return false;
    }
    if (!requireSe) {
      return true;
    }
    return EMPHASIS_SE.has(line.emphasis.se) && line.emphasis.se !== 'none';
  });

const sceneDurationForMotion = (script, scene) => {
  if (typeof scene.duration_sec === 'number' && Number.isFinite(scene.duration_sec) && scene.duration_sec > 0) {
    return scene.duration_sec;
  }
  const targetSec = Number(script.meta?.target_duration_sec ?? script.total_duration_sec ?? 0);
  const sceneCount = Array.isArray(script.scenes) && script.scenes.length > 0 ? script.scenes.length : 1;
  return Number.isFinite(targetSec) && targetSec > 0 ? targetSec / sceneCount : 0;
};

const midpointSceneIndexes = (scenes) => {
  const indexes = [];
  for (let index = 0; index < scenes.length; index += 1) {
    const ratio = (index + 0.5) / Math.max(1, scenes.length);
    if (ratio >= 0.4 && ratio <= 0.6) {
      indexes.push(index);
    }
  }
  return indexes;
};

const validateEmphasisConfig = ({emphasis, pathName, lineLabel, errors}) => {
  if (emphasis === undefined || emphasis === null) {
    return;
  }
  if (!isPlainObject(emphasis)) {
    pushIssue(errors, 'error', pathName, `${lineLabel}: emphasis must be an object`);
    return;
  }

  if (!Array.isArray(emphasis.words) || emphasis.words.length === 0) {
    pushIssue(errors, 'error', `${pathName}.words`, `${lineLabel}: emphasis.words must be a non-empty array`);
  } else {
    emphasis.words.forEach((word, index) => {
      if (typeof word !== 'string' || word.trim() === '') {
        pushIssue(errors, 'error', `${pathName}.words[${index}]`, `${lineLabel}: emphasis word must be non-empty text`);
      }
    });
  }

  if (!EMPHASIS_STYLES.has(emphasis.style)) {
    pushIssue(errors, 'error', `${pathName}.style`, `${lineLabel}: emphasis.style must be punch, danger, surprise, number, or action`);
  }
  if (!EMPHASIS_SE.has(emphasis.se)) {
    pushIssue(errors, 'error', `${pathName}.se`, `${lineLabel}: emphasis.se must be pop, warning, question, reveal, success, fail, or none`);
  }
  if (!EMPHASIS_PAUSES_MS.has(emphasis.pause_after_ms)) {
    pushIssue(errors, 'error', `${pathName}.pause_after_ms`, `${lineLabel}: emphasis.pause_after_ms must be 0, 200, 300, or 500`);
  }
};

const validateDialogueExpression = ({expression, pathName, lineLabel, errors}) => {
  if (expression === undefined || expression === null) {
    return;
  }
  if (typeof expression !== 'string' || expression.trim() === '') {
    pushIssue(errors, 'error', pathName, `${lineLabel}: expression must be a non-empty string when provided`);
    return;
  }
  if (!DIALOGUE_EXPRESSIONS.has(expression)) {
    pushIssue(
      errors,
      'error',
      pathName,
      `${lineLabel}: expression must be one of ${[...DIALOGUE_EXPRESSIONS].join(', ')}`,
    );
  }
};

const validateExpressionRunBalance = ({scene, scenePath, errors}) => {
  const latestBySpeaker = new Map();
  for (const [lineIndex, line] of (scene.dialogue ?? []).entries()) {
    if (!isPlainObject(line) || !['left', 'right'].includes(line.speaker)) {
      continue;
    }
    const expression = line.expression ?? 'normal';
    const previous = latestBySpeaker.get(line.speaker);
    const run = previous?.expression === expression ? previous.run + 1 : 1;
    if (line.expression && run >= 3) {
      pushIssue(
        errors,
        'error',
        `${scenePath}.dialogue[${lineIndex}].expression`,
        `${scene.id}/${line.id ?? lineIndex}: same speaker expression must not continue for 3 dialogue turns`,
      );
      return;
    }
    latestBySpeaker.set(line.speaker, {expression, run});
  }
};

const validateVisualAssetPlan = ({scene, scenePath, errors}) => {
  if (!Array.isArray(scene.visual_asset_plan)) {
    return;
  }

  scene.visual_asset_plan.forEach((plan, index) => {
    const planPath = `${scenePath}.visual_asset_plan[${index}]`;
    if (!isPlainObject(plan)) {
      pushIssue(errors, 'error', planPath, `${scene.id}: visual_asset_plan entry must be an object`);
      return;
    }
    if (!VISUAL_IMAGE_ROLES.has(plan.image_role)) {
      pushIssue(errors, 'error', `${planPath}.image_role`, `${scene.id}: image_role must be one of ${[...VISUAL_IMAGE_ROLES].join(', ')}`);
    }
    if (!VISUAL_COMPOSITION_TYPES.has(plan.composition_type)) {
      pushIssue(errors, 'error', `${planPath}.composition_type`, `${scene.id}: composition_type must be one of ${[...VISUAL_COMPOSITION_TYPES].join(', ')}`);
    }
    if (typeof plan.slot !== 'string' || !MAIN_TIMELINE_SLOT_RE.test(plan.slot)) {
      pushIssue(errors, 'error', `${planPath}.slot`, `${scene.id}: visual_asset_plan slot must be main or main_XX`);
    }
    if (plan.slot !== 'main' && plan.slot_group !== 'main') {
      pushIssue(errors, 'error', `${planPath}.slot_group`, `${scene.id}: timeline visual_asset_plan entries require slot_group: main`);
    }
  });
};

const lineIndexById = (dialogue) => {
  const indexes = new Map();
  if (!Array.isArray(dialogue)) {
    return indexes;
  }
  dialogue.forEach((line, index) => {
    if (typeof line?.id === 'string' && line.id.trim() !== '') {
      indexes.set(line.id, index);
    }
  });
  return indexes;
};

const validateMainTimeline = async ({scene, scenePath, episodeDir, errors, promptOnly}) => {
  if (scene.main_timeline === undefined || scene.main_timeline === null) {
    return;
  }
  if (!Array.isArray(scene.main_timeline)) {
    pushIssue(errors, 'error', `${scenePath}.main_timeline`, `${scene.id}: main_timeline must be an array`);
    return;
  }
  if (scene.main_timeline.length === 0) {
    pushIssue(errors, 'error', `${scenePath}.main_timeline`, `${scene.id}: main_timeline must not be empty`);
    return;
  }

  const indexes = lineIndexById(scene.dialogue);
  const seenSlots = new Set();
  for (const [index, entry] of scene.main_timeline.entries()) {
    const entryPath = `${scenePath}.main_timeline[${index}]`;
    if (!isPlainObject(entry)) {
      pushIssue(errors, 'error', entryPath, `${scene.id}: main_timeline entry must be an object`);
      continue;
    }
    const slot = entry.slot;
    if (typeof slot !== 'string' || !MAIN_TIMELINE_SLOT_RE.test(slot)) {
      pushIssue(errors, 'error', `${entryPath}.slot`, `${scene.id}: main_timeline slot must be main or main_XX`);
    } else if (seenSlots.has(slot)) {
      pushIssue(errors, 'error', `${entryPath}.slot`, `${scene.id}: duplicate main_timeline slot: ${slot}`);
    } else {
      seenSlots.add(slot);
    }
    if (entry.slot_group !== undefined && entry.slot_group !== 'main') {
      pushIssue(errors, 'error', `${entryPath}.slot_group`, `${scene.id}: main_timeline slot_group must be main`);
    }
    await assertAssetPath({assetPath: entry.asset, episodeDir, sceneId: scene.id, contentPath: entryPath, errors, promptOnly});

    const hasLineIds = Array.isArray(entry.line_ids);
    const hasRange = typeof entry.start_line_id === 'string' || typeof entry.end_line_id === 'string';
    if (!hasLineIds && !hasRange) {
      pushIssue(errors, 'error', entryPath, `${scene.id}/${slot ?? index}: main_timeline requires line_ids or start_line_id/end_line_id`);
      continue;
    }
    if (hasLineIds) {
      if (entry.line_ids.length === 0) {
        pushIssue(errors, 'error', `${entryPath}.line_ids`, `${scene.id}/${slot ?? index}: line_ids must not be empty`);
      }
      for (const [lineIndex, lineId] of entry.line_ids.entries()) {
        if (typeof lineId !== 'string' || !indexes.has(lineId)) {
          pushIssue(errors, 'error', `${entryPath}.line_ids[${lineIndex}]`, `${scene.id}/${slot ?? index}: unknown dialogue line id: ${lineId ?? '<missing>'}`);
        }
      }
      continue;
    }
    if (!indexes.has(entry.start_line_id)) {
      pushIssue(errors, 'error', `${entryPath}.start_line_id`, `${scene.id}/${slot ?? index}: unknown start_line_id: ${entry.start_line_id ?? '<missing>'}`);
    }
    if (!indexes.has(entry.end_line_id)) {
      pushIssue(errors, 'error', `${entryPath}.end_line_id`, `${scene.id}/${slot ?? index}: unknown end_line_id: ${entry.end_line_id ?? '<missing>'}`);
    }
    if (indexes.has(entry.start_line_id) && indexes.has(entry.end_line_id) && indexes.get(entry.start_line_id) > indexes.get(entry.end_line_id)) {
      pushIssue(errors, 'error', entryPath, `${scene.id}/${slot ?? index}: start_line_id must come before end_line_id`);
    }
  }
};

const validateMotionAndEmphasisCoverage = ({script, errors}) => {
  const scenes = script.scenes ?? [];
  if (scenes.length === 0) {
    return;
  }

  if (!hasSceneEmphasis(scenes[0], {requireSe: true})) {
    pushIssue(errors, 'error', 'scenes[0].dialogue.emphasis', 's01 requires at least one emphasis with non-none SE');
  }

  const midpointIndexes = midpointSceneIndexes(scenes);
  const midpointHasNonNormal = midpointIndexes.some((index) => scenes[index]?.motion_mode && scenes[index].motion_mode !== 'normal');
  const midpointHasEmphasis = midpointIndexes.some((index) => hasSceneEmphasis(scenes[index], {requireSe: true}));
  if (!midpointHasNonNormal) {
    pushIssue(errors, 'error', 'scenes.motion_mode', '40-60% midpoint rehook scene must use a non-normal motion_mode');
  }
  if (!midpointHasEmphasis) {
    pushIssue(errors, 'error', 'scenes.dialogue.emphasis', '40-60% midpoint rehook scene requires emphasis with non-none SE');
  }

  const lastScene = scenes[scenes.length - 1];
  const lastPath = `scenes[${scenes.length - 1}]`;
  if (lastScene?.motion_mode === 'normal') {
    pushIssue(errors, 'error', `${lastPath}.motion_mode`, `${lastScene.id ?? 'last scene'}: final action scene must not use motion_mode: normal`);
  }
  if (!hasSceneEmphasis(lastScene, {requireSe: true})) {
    pushIssue(errors, 'error', `${lastPath}.dialogue.emphasis`, `${lastScene?.id ?? 'last scene'}: final action scene requires emphasis with non-none SE`);
  }

  let normalRunSec = 0;
  let runStart = null;
  scenes.forEach((scene, index) => {
    if (scene.motion_mode === 'normal') {
      normalRunSec += sceneDurationForMotion(script, scene);
      runStart ??= index;
      if (normalRunSec > 60) {
        pushIssue(
          errors,
          'error',
          `scenes[${runStart}..${index}].motion_mode`,
          `motion_mode: normal must not continue for more than 60 seconds; estimated run=${round1(normalRunSec)}s`,
        );
      }
      return;
    }
    normalRunSec = 0;
    runStart = null;
  });
};

const validateContent = async ({content, sceneId, contentPath, episodeDir, errors, warnings, slot, promptOnly = false}) => {
  if (content === null || content === undefined) {
    return;
  }

  if (!isPlainObject(content)) {
    pushIssue(errors, 'error', contentPath, `${sceneId}: content must be an object or null`);
    return;
  }

  if (!CONTENT_KINDS.has(content.kind)) {
    pushIssue(errors, 'error', `${contentPath}.kind`, `${sceneId}: content.kind must be text, bullets, or image`);
    return;
  }

  // v2 rule: main is image-only. Sub text/bullets are handled by template-level guards below.
  if (slot === 'main' && content.kind !== 'image') {
    pushIssue(
      errors,
      'error',
      `${contentPath}.kind`,
      `${sceneId}: main content slot is image-only; use kind: image (text/bullets are allowed only on sub)`,
    );
    return;
  }

  if (content.kind === 'text') {
    if (typeof content.text !== 'string' || content.text.trim() === '') {
      pushIssue(errors, 'error', `${contentPath}.text`, `${sceneId}: text content requires non-empty text`);
    } else if (warnings && content.text.length > SUB_TEXT_WARN_THRESHOLD) {
      pushIssue(
        warnings,
        'warning',
        `${contentPath}.text`,
        `${sceneId}: sub text length ${content.text.length} exceeds ${SUB_TEXT_WARN_THRESHOLD} chars; consider trimming for readability`,
      );
    }
  }

  if (content.kind === 'bullets') {
    if (!Array.isArray(content.items) || content.items.length === 0) {
      pushIssue(errors, 'error', `${contentPath}.items`, `${sceneId}: bullets content requires non-empty items`);
    } else {
      content.items.forEach((item, index) => {
        if (typeof item !== 'string' || item.trim() === '') {
          pushIssue(errors, 'error', `${contentPath}.items[${index}]`, `${sceneId}: bullet item must be non-empty text`);
        }
      });
      if (warnings && content.items.length > SUB_BULLETS_WARN_THRESHOLD) {
        pushIssue(
          warnings,
          'warning',
          `${contentPath}.items`,
          `${sceneId}: sub bullets has ${content.items.length} items, more than ${SUB_BULLETS_WARN_THRESHOLD}; consider trimming for readability`,
        );
      }
    }
  }

  if (content.kind === 'image') {
    if (typeof content.caption === 'string' && content.caption.trim() !== '') {
      pushIssue(errors, 'error', `${contentPath}.caption`, `${sceneId}: image.caption is disabled because image content slots must render image-only`);
    }
    await assertAssetPath({assetPath: content.asset, episodeDir, sceneId, contentPath, errors, promptOnly});
  }
};

const validateTiming = ({script, errors, warnings}) => {
  let sceneDurationSum = 0;
  let hasAllSceneDurations = true;

  script.scenes.forEach((scene, sceneIndex) => {
    const scenePath = `scenes[${sceneIndex}]`;
    if (scene.duration_sec === undefined || scene.duration_sec === null) {
      hasAllSceneDurations = false;
    } else if (!isFinitePositive(scene.duration_sec)) {
      pushIssue(errors, 'error', `${scenePath}.duration_sec`, `${scene.id}: duration_sec must be a positive finite number`);
    } else {
      sceneDurationSum += scene.duration_sec;
    }

    if (!Array.isArray(scene.dialogue)) {
      return;
    }

    scene.dialogue.forEach((line, lineIndex) => {
      const linePath = `${scenePath}.dialogue[${lineIndex}]`;
      const hasTiming = line.start_sec !== undefined || line.end_sec !== undefined || line.wav_sec !== undefined;
      if (!hasTiming) {
        return;
      }

      if (!isFinitePositive(line.wav_sec)) {
        pushIssue(errors, 'error', `${linePath}.wav_sec`, `${scene.id}/${line.id}: wav_sec must be a positive finite number`);
      }
      if (typeof line.start_sec !== 'number' || !Number.isFinite(line.start_sec) || line.start_sec < 0) {
        pushIssue(errors, 'error', `${linePath}.start_sec`, `${scene.id}/${line.id}: start_sec must be a finite number >= 0`);
      }
      if (!isFinitePositive(line.end_sec)) {
        pushIssue(errors, 'error', `${linePath}.end_sec`, `${scene.id}/${line.id}: end_sec must be a positive finite number`);
      }
      if (
        typeof line.start_sec === 'number' &&
        typeof line.end_sec === 'number' &&
        Number.isFinite(line.start_sec) &&
        Number.isFinite(line.end_sec) &&
        line.end_sec <= line.start_sec
      ) {
        pushIssue(errors, 'error', `${linePath}.end_sec`, `${scene.id}/${line.id}: end_sec must be greater than start_sec`);
      }
      if (
        isFinitePositive(scene.duration_sec) &&
        typeof line.end_sec === 'number' &&
        Number.isFinite(line.end_sec) &&
        line.end_sec > scene.duration_sec + 0.1
      ) {
        pushIssue(errors, 'error', `${linePath}.end_sec`, `${scene.id}/${line.id}: dialogue ends after scene duration`);
      }
    });
  });

  if (hasAllSceneDurations && script.total_duration_sec !== undefined) {
    if (!isFinitePositive(script.total_duration_sec)) {
      pushIssue(errors, 'error', 'total_duration_sec', 'total_duration_sec must be a positive finite number');
    } else if (Math.abs(script.total_duration_sec - sceneDurationSum) > 0.2) {
      pushIssue(
        errors,
        'error',
        'total_duration_sec',
        `total_duration_sec must match scene durations within 0.2s: total=${script.total_duration_sec}, sum=${Math.round(sceneDurationSum * 10) / 10}`,
      );
    }
  }

  const targetSec = Number(script.meta?.target_duration_sec);
  const durationWindow = durationWindowForTarget(targetSec);
  if (
    durationWindow &&
    typeof script.total_duration_sec === 'number' &&
    Number.isFinite(script.total_duration_sec) &&
    script.total_duration_sec < durationWindow.min
  ) {
    pushIssue(
      errors,
      'error',
      'total_duration_sec',
      `total_duration_sec must not be below the natural speech duration minimum for target_duration_sec without changing speech speed: target=${round1(targetSec)}s, allowed_min=${round1(durationWindow.min)}s, actual=${round1(script.total_duration_sec)}s`,
    );
  }

  if (
    durationWindow &&
    typeof script.total_duration_sec === 'number' &&
    Number.isFinite(script.total_duration_sec) &&
    script.total_duration_sec > durationWindow.max
  ) {
    pushIssue(
      warnings,
      'warning',
      'total_duration_sec',
      `total_duration_sec exceeds the target_duration_sec natural speech window, but natural overrun is allowed and script_final.md must stay unchanged for duration: target=${round1(targetSec)}s, allowed_max=${round1(durationWindow.max)}s, actual=${round1(script.total_duration_sec)}s`,
    );
  }
};

const resolveSceneTemplate = ({script, errors, warnings}) => {
  if (script.meta?.allow_duplicate_templates === true) {
    pushIssue(warnings, 'warning', 'meta.allow_duplicate_templates', 'allow_duplicate_templates is deprecated; use meta.layout_template for the single video template');
  }

  const sceneTemplate = typeof script.meta?.layout_template === 'string' ? script.meta.layout_template : undefined;

  if (typeof script.meta?.scene_template === 'string') {
    pushIssue(errors, 'error', 'meta.scene_template', 'meta.scene_template is not supported. Use meta.layout_template only.');
  }

  if (sceneTemplate !== undefined && !SCENE_TEMPLATE_ID_SET.has(sceneTemplate)) {
    pushIssue(errors, 'error', 'meta.layout_template', `meta.layout_template must be Scene01-Scene21: ${sceneTemplate}`);
  }

  if (!sceneTemplate) {
    pushIssue(errors, 'error', 'meta.layout_template', 'meta.layout_template is required as the single template for the whole video');
  }

  script.scenes.forEach((scene, sceneIndex) => {
    if (scene && Object.prototype.hasOwnProperty.call(scene, 'scene_template')) {
      const sceneId = scene.id ?? `scenes[${sceneIndex}]`;
      pushIssue(errors, 'error', `scenes[${sceneIndex}].scene_template`, `${sceneId}: scenes[].scene_template is not supported. Use meta.layout_template only.`);
    }
  });

  return sceneTemplate;
};

const validateVoiceEngineBindings = ({script, errors}) => {
  const voiceEngine = script.meta?.voice_engine;
  const pair = script.meta?.pair;
  const characters = script.characters;

  if (!['aquestalk', 'voicevox'].includes(voiceEngine)) {
    pushIssue(errors, 'error', 'meta.voice_engine', `voice_engine must be aquestalk or voicevox: ${voiceEngine ?? '<missing>'}`);
  }

  if (pair === 'ZM' && voiceEngine !== 'voicevox') {
    pushIssue(errors, 'error', 'meta.voice_engine', 'ZM episodes must use voice_engine: voicevox');
  }

  if (pair === 'RM' && voiceEngine !== 'aquestalk') {
    pushIssue(errors, 'error', 'meta.voice_engine', 'RM episodes must use voice_engine: aquestalk');
  }

  if (!isPlainObject(characters)) {
    pushIssue(errors, 'error', 'characters', 'characters is required');
    return;
  }

  if (pair === 'ZM') {
    for (const [side, expected] of Object.entries(ZM_VOICEVOX_BINDINGS)) {
      const config = characters[side];
      const pathName = `characters.${side}`;
      if (!isPlainObject(config)) {
        pushIssue(errors, 'error', pathName, `ZM ${side} character config is required`);
        continue;
      }
      if (config.character !== expected.character) {
        pushIssue(errors, 'error', `${pathName}.character`, `ZM ${side} character must be ${expected.character}: ${config.character ?? '<missing>'}`);
      }
      if (!Number.isInteger(config.voicevox_speaker_id)) {
        pushIssue(
          errors,
          'error',
          `${pathName}.voicevox_speaker_id`,
          `${expected.character} must use numeric VOICEVOX speaker id ${expected.voicevoxSpeakerId}: ${config.voicevox_speaker_id ?? '<missing>'}`,
        );
      } else if (config.voicevox_speaker_id !== expected.voicevoxSpeakerId) {
        pushIssue(
          errors,
          'error',
          `${pathName}.voicevox_speaker_id`,
          `${expected.character} must use VOICEVOX speaker id ${expected.voicevoxSpeakerId}: ${config.voicevox_speaker_id}`,
        );
      }
      if (Object.prototype.hasOwnProperty.call(config, 'aquestalk_preset')) {
        pushIssue(errors, 'error', `${pathName}.aquestalk_preset`, `${expected.character} must not use aquestalk_preset in ZM episodes`);
      }
    }
  }

  for (const side of ['left', 'right']) {
    const config = characters[side];
    if (!isPlainObject(config)) {
      continue;
    }

    if (['zundamon', 'metan'].includes(config.character) && voiceEngine !== 'voicevox') {
      pushIssue(errors, 'error', `characters.${side}.character`, `${config.character} requires voice_engine: voicevox`);
    }
    if (pair === 'RM' && Object.prototype.hasOwnProperty.call(config, 'voicevox_speaker_id')) {
      pushIssue(errors, 'error', `characters.${side}.voicevox_speaker_id`, 'RM episodes must not use voicevox_speaker_id');
    }
    if (pair === 'RM') {
      const preset = config.aquestalk_preset;
      if (typeof preset !== 'string' || preset.trim() === '') {
        pushIssue(errors, 'error', `characters.${side}.aquestalk_preset`, `RM ${side} must use an AquesTalk preset`);
      } else if (!isValidRmAquesTalkPreset(preset)) {
        const normalized = normalizeAquesTalkPreset({side, preset});
        const valid = [...VALID_RM_AQUESTALK_PRESETS].join(', ');
        pushIssue(
          errors,
          'error',
          `characters.${side}.aquestalk_preset`,
          `RM ${side} aquestalk_preset must be normalized before render: ${preset} -> ${normalized}; valid presets: ${valid}`,
        );
      }
    }
  }
};
export const formatEpisodeValidationResult = (result) => {
  const lines = [];
  for (const error of result.errors) {
    lines.push(`ERROR ${error.path}: ${error.message}`);
  }
  for (const warning of result.warnings) {
    lines.push(`WARN ${warning.path}: ${warning.message}`);
  }
  return lines.join('\n');
};

export const validateEpisodeScript = async (script, options = {}) => {
  const errors = [];
  const warnings = [];
  const episodeDir = options.episodeDir ? path.resolve(options.episodeDir) : null;
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();
  const usedExplicitGothic = {value: false};

  if (!isPlainObject(script)) {
    pushIssue(errors, 'error', 'script', 'script must be an object');
    return {ok: false, errors, warnings};
  }

  if (!isPlainObject(script.meta)) {
    pushIssue(errors, 'error', 'meta', 'meta is required');
  } else {
    validateTypographyConfig({
      config: script.meta.typography,
      pathName: 'meta.typography',
      errors,
      warnings,
      usedExplicitGothic,
    });
  }

  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    pushIssue(errors, 'error', 'scenes', 'scenes must be a non-empty array');
    return {ok: false, errors, warnings};
  }

  validateVoiceEngineBindings({script, errors});

  const meta = await readMetaJson({episodeDir, errors});
  const imagegenManifest = await readImagegenManifest({episodeDir, errors});
  validateNoAudioPlaybackRate({script, meta, errors});
  await validateMetaLedger({script, meta, imagegenManifest, errors});

  if (script.bgm?.file) {
    await assertEpisodeFile({
      filePath: script.bgm.file,
      episodeDir,
      issuePath: 'bgm.file',
      label: 'bgm.file',
      errors,
      promptOnly: options.promptOnly,
    });
  }

  const canonicalTemplate = resolveSceneTemplate({script, errors, warnings});

  for (const [sceneIndex, scene] of script.scenes.entries()) {
    const scenePath = `scenes[${sceneIndex}]`;
    if (!isPlainObject(scene)) {
      pushIssue(errors, 'error', scenePath, 'scene must be an object');
      continue;
    }

    const sceneId = typeof scene.id === 'string' && scene.id.trim() ? scene.id : scenePath;
    const resolvedTemplate = canonicalTemplate;
    if (!MOTION_MODES.has(scene.motion_mode)) {
      pushIssue(
        errors,
        'error',
        `${scenePath}.motion_mode`,
        `${sceneId}: motion_mode must be normal, punch, compare, warning, checklist, reveal, or recap`,
      );
    }
    if (!SCENE_TEMPLATE_ID_SET.has(resolvedTemplate)) {
      pushIssue(
        errors,
        'error',
        'meta.layout_template',
        `${sceneId}: layout_template must be Scene01-Scene21: ${resolvedTemplate ?? '<missing>'}`,
      );
    }

    validateTypographyConfig({
      config: scene.typography,
      pathName: `${scenePath}.typography`,
      errors,
      warnings,
      usedExplicitGothic,
    });

    if (scene.sub && !SUB_CAPABLE_TEMPLATES.has(resolvedTemplate)) {
      pushIssue(warnings, 'warning', `${scenePath}.sub`, `${sceneId}: ${resolvedTemplate} has no renderable sub content area; use sub: null`);
    }

    if (SUB_CAPABLE_TEMPLATES.has(resolvedTemplate)) {
      if (scene.sub === null || scene.sub === undefined) {
        pushIssue(
          errors,
          'error',
          `${scenePath}.sub`,
          `${sceneId}: ${resolvedTemplate} requires sub content; use sub.kind text or bullets for every scene`,
        );
      } else if (scene.sub?.kind === 'image') {
        pushIssue(
          errors,
          'error',
          `${scenePath}.sub.kind`,
          `${sceneId}: ${resolvedTemplate} sub content must be text or bullets; sub.kind image is not allowed for new episodes`,
        );
      }
    }

    if (scene.title_text && !TITLE_CAPABLE_TEMPLATES.has(resolvedTemplate)) {
      pushIssue(errors, 'error', `${scenePath}.title_text`, `${sceneId}: ${resolvedTemplate} has no title slot; title_text is forbidden for this template`);
    }

    if (!scene.main) {
      pushIssue(errors, 'error', `${scenePath}.main`, `${sceneId}: main content is required`);
    }
    validateVisualAssetPlan({scene, scenePath, errors});
    await validateContent({content: scene.main, sceneId, contentPath: `${scenePath}.main`, episodeDir, errors, warnings, slot: 'main', promptOnly: options.promptOnly});
    await validateContent({content: scene.sub, sceneId, contentPath: `${scenePath}.sub`, episodeDir, errors, warnings, slot: 'sub', promptOnly: options.promptOnly});

    if (!Array.isArray(scene.dialogue)) {
      pushIssue(errors, 'error', `${scenePath}.dialogue`, `${sceneId}: dialogue must be an array`);
      continue;
    }
    await validateMainTimeline({scene, scenePath, episodeDir, errors, promptOnly: options.promptOnly});

    for (const [lineIndex, line] of scene.dialogue.entries()) {
      const linePath = `${scenePath}.dialogue[${lineIndex}]`;
      if (!isPlainObject(line)) {
        pushIssue(errors, 'error', linePath, `${sceneId}: dialogue line must be an object`);
        continue;
      }
      if (typeof line.id !== 'string' || line.id.trim() === '') {
        pushIssue(errors, 'error', `${linePath}.id`, `${sceneId}: dialogue line id is required`);
      }
      if (!['left', 'right'].includes(line.speaker)) {
        pushIssue(errors, 'error', `${linePath}.speaker`, `${sceneId}/${line.id ?? lineIndex}: speaker must be left or right`);
      }
      if (typeof line.text !== 'string' || line.text.trim() === '') {
        pushIssue(errors, 'error', `${linePath}.text`, `${sceneId}/${line.id ?? lineIndex}: dialogue text is required`);
      }
      validateEmphasisConfig({
        emphasis: line.emphasis,
        pathName: `${linePath}.emphasis`,
        lineLabel: `${sceneId}/${line.id ?? lineIndex}`,
        errors,
      });
      validateDialogueExpression({
        expression: line.expression,
        pathName: `${linePath}.expression`,
        lineLabel: `${sceneId}/${line.id ?? lineIndex}`,
        errors,
      });
      validateTypographyConfig({
        config: line.typography,
        pathName: `${linePath}.typography`,
        errors,
        warnings,
        usedExplicitGothic,
        allowedKeys: DIALOGUE_TYPOGRAPHY_KEYS,
      });
    }
    validateExpressionRunBalance({scene, scenePath, errors});
  }

  await assertKeifontIfNeeded({rootDir, usedExplicitGothic, errors});
  validateMotionAndEmphasisCoverage({script, errors});
  validateTiming({script, errors, warnings});

  return {ok: errors.length === 0, errors, warnings};
};
