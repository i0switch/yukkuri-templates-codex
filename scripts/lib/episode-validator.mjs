import fs from 'node:fs/promises';
import path from 'node:path';

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
export const KEIFONT_PUBLIC_PATH = path.join('public', 'fonts', 'keifont.ttf');

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isFinitePositive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const normalizeAssetPath = (assetPath) => assetPath.replaceAll('\\', '/');

const pushIssue = (issues, level, pathName, message) => {
  issues.push({level, path: pathName, message});
};

const IMAGE_ASSET_EXTENSION_RE = /\.(png|jpe?g|webp|gif)$/i;
const REQUIRED_IMAGE_LEDGER_FIELDS = [
  'scene_id',
  'slot',
  'purpose',
  'adoption_reason',
];

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
  });

  return files;
};

const isImageLedgerFile = (file) => {
  const normalized = normalizeAssetPath(String(file ?? ''));
  return normalized.startsWith('assets/') && IMAGE_ASSET_EXTENSION_RE.test(normalized);
};

const validateMetaLedger = ({script, meta, errors}) => {
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

    if (typeof asset.license !== 'string' || asset.license.trim() === '') {
      pushIssue(errors, 'error', `meta.json.assets[${index}].license`, `${asset.file}: license is required`);
    }

    const isImageAsset = referencedImageFiles.has(normalizedFile) || isImageLedgerFile(normalizedFile);
    if (!isImageAsset) {
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

const validateContent = async ({content, sceneId, contentPath, episodeDir, errors, promptOnly = false}) => {
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

  if (content.kind !== 'image') {
    pushIssue(
      errors,
      'error',
      `${contentPath}.kind`,
      `${sceneId}: rendered content slots are image-only; use kind: image or set sub: null instead of Remotion-rendered text`,
    );
  }

  if (content.kind === 'text' && (typeof content.text !== 'string' || content.text.trim() === '')) {
    pushIssue(errors, 'error', `${contentPath}.text`, `${sceneId}: text content requires non-empty text`);
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
    }
  }

  if (content.kind === 'image') {
    if (typeof content.caption === 'string' && content.caption.trim() !== '') {
      pushIssue(errors, 'error', `${contentPath}.caption`, `${sceneId}: image.caption is disabled because content slots must render image-only`);
    }
    await assertAssetPath({assetPath: content.asset, episodeDir, sceneId, contentPath, errors, promptOnly});
  }
};

const validateTiming = ({script, errors}) => {
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
};

const uniqueValues = (values) => [...new Set(values.filter((value) => typeof value === 'string' && value.trim() !== ''))];

const resolveSceneTemplate = ({script, errors, warnings}) => {
  if (script.meta?.allow_duplicate_templates === true) {
    pushIssue(warnings, 'warning', 'meta.allow_duplicate_templates', 'allow_duplicate_templates is deprecated; use meta.layout_template for the single video template');
  }

  const sceneTemplates = uniqueValues(script.scenes.map((scene) => scene?.scene_template));
  let sceneTemplate = typeof script.meta?.layout_template === 'string' ? script.meta.layout_template : undefined;
  const legacyMetaTemplate = typeof script.meta?.scene_template === 'string' ? script.meta.scene_template : undefined;

  if (legacyMetaTemplate !== undefined) {
    if (sceneTemplate === undefined) {
      sceneTemplate = legacyMetaTemplate;
      pushIssue(warnings, 'warning', 'meta.scene_template', 'meta.scene_template is accepted as a legacy alias; prefer meta.layout_template');
    } else if (sceneTemplate !== legacyMetaTemplate) {
      pushIssue(errors, 'error', 'meta.scene_template', `meta.scene_template must match meta.layout_template (${sceneTemplate}), got ${legacyMetaTemplate}`);
    }
  }

  if (sceneTemplate !== undefined && !SCENE_TEMPLATE_ID_SET.has(sceneTemplate)) {
    pushIssue(errors, 'error', 'meta.layout_template', `meta.layout_template must be Scene01-Scene21: ${sceneTemplate}`);
  }

  if (!sceneTemplate) {
    if (sceneTemplates.length === 1) {
      sceneTemplate = sceneTemplates[0];
      pushIssue(warnings, 'warning', 'meta.layout_template', `legacy script: move shared scenes[].scene_template (${sceneTemplate}) to meta.layout_template`);
    } else {
      pushIssue(errors, 'error', 'meta.layout_template', 'meta.layout_template is required as the single template for the whole video');
    }
  }

  if (sceneTemplates.length > 1) {
    pushIssue(errors, 'error', 'scenes', `Only one scene_template is allowed per video; found ${sceneTemplates.join(', ')}`);
  }

  script.scenes.forEach((scene, sceneIndex) => {
    if (typeof scene?.scene_template === 'string' && scene.scene_template !== sceneTemplate) {
      const sceneId = scene.id ?? `scenes[${sceneIndex}]`;
      pushIssue(errors, 'error', `scenes[${sceneIndex}].scene_template`, `${sceneId}: scene_template must match meta.layout_template (${sceneTemplate}), got ${scene.scene_template}`);
    }
  });

  return sceneTemplate;
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

  const meta = await readMetaJson({episodeDir, errors});
  validateMetaLedger({script, meta, errors});

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
    const resolvedTemplate = scene.scene_template ?? canonicalTemplate;
    if (!SCENE_TEMPLATE_ID_SET.has(resolvedTemplate)) {
      pushIssue(
        errors,
        'error',
        scene.scene_template === undefined ? 'meta.layout_template' : `${scenePath}.scene_template`,
        `${sceneId}: scene_template must be Scene01-Scene21: ${resolvedTemplate ?? '<missing>'}`,
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

    if (scene.title_text && !TITLE_CAPABLE_TEMPLATES.has(resolvedTemplate)) {
      pushIssue(warnings, 'warning', `${scenePath}.title_text`, `${sceneId}: ${resolvedTemplate} has no title slot; move the heading into main.text if needed`);
    }

    if (!scene.main) {
      pushIssue(errors, 'error', `${scenePath}.main`, `${sceneId}: main content is required`);
    }
    await validateContent({content: scene.main, sceneId, contentPath: `${scenePath}.main`, episodeDir, errors, promptOnly: options.promptOnly});
    await validateContent({content: scene.sub, sceneId, contentPath: `${scenePath}.sub`, episodeDir, errors, promptOnly: options.promptOnly});

    if (!Array.isArray(scene.dialogue)) {
      pushIssue(errors, 'error', `${scenePath}.dialogue`, `${sceneId}: dialogue must be an array`);
      continue;
    }

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
      validateTypographyConfig({
        config: line.typography,
        pathName: `${linePath}.typography`,
        errors,
        warnings,
        usedExplicitGothic,
        allowedKeys: DIALOGUE_TYPOGRAPHY_KEYS,
      });
    }
  }

  await assertKeifontIfNeeded({rootDir, usedExplicitGothic, errors});
  validateTiming({script, errors});

  return {ok: errors.length === 0, errors, warnings};
};






