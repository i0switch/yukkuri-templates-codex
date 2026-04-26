import fs from 'node:fs/promises';
import path from 'node:path';

export const SCENE_TEMPLATE_IDS = Array.from({length: 21}, (_, index) => `Scene${String(index + 1).padStart(2, '0')}`);
export const SCENE_TEMPLATE_ID_SET = new Set(SCENE_TEMPLATE_IDS);
export const SUB_CAPABLE_TEMPLATES = new Set(['Scene02', 'Scene03', 'Scene10', 'Scene13', 'Scene14']);
export const TITLE_CAPABLE_TEMPLATES = new Set(['Scene04', 'Scene08', 'Scene12', 'Scene15', 'Scene16', 'Scene17', 'Scene19']);
export const CONTENT_KINDS = new Set(['text', 'bullets', 'image']);

const countChars = (value) => Array.from(value).length;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isFinitePositive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const normalizeAssetPath = (assetPath) => assetPath.replaceAll('\\', '/');

const pushIssue = (issues, level, pathName, message) => {
  issues.push({level, path: pathName, message});
};

const isSafeEpisodeRelativePath = (filePath) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    return false;
  }

  const normalized = normalizeAssetPath(filePath);
  const segments = normalized.split('/');
  return !path.isAbsolute(normalized) && !segments.includes('..') && !normalized.startsWith('public/');
};

const assertEpisodeFile = async ({filePath, episodeDir, issuePath, label, errors}) => {
  if (!isSafeEpisodeRelativePath(filePath)) {
    pushIssue(errors, 'error', issuePath, `${label} must be a safe relative episode path: ${filePath ?? '<missing>'}`);
    return;
  }

  if (!episodeDir) {
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

const validateMetaLedger = ({script, meta, errors}) => {
  if (!meta) {
    return;
  }

  if (!Array.isArray(meta.assets)) {
    pushIssue(errors, 'error', 'meta.json.assets', 'meta.json assets array is required');
    return;
  }

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

    assetEntries.set(normalizeAssetPath(asset.file), {asset, index});

    if (typeof asset.license !== 'string' || asset.license.trim() === '') {
      pushIssue(errors, 'error', `meta.json.assets[${index}].license`, `${asset.file}: license is required`);
    }
  }

  for (const reference of collectReferencedFiles(script)) {
    const normalized = normalizeAssetPath(reference.file);
    const entry = assetEntries.get(normalized);
    if (!entry) {
      pushIssue(errors, 'error', 'meta.json.assets', `${reference.path}: referenced ${reference.kind} is missing from meta.json assets: ${reference.file}`);
      continue;
    }

    const {asset, index} = entry;
    const hasSource =
      typeof asset.source_url === 'string' && asset.source_url.trim() !== '' ||
      typeof asset.source_site === 'string' && asset.source_site.trim() !== '' ||
      typeof asset.imagegen_prompt === 'string' && asset.imagegen_prompt.trim() !== '' ||
      typeof asset.source_type === 'string' && asset.source_type.trim() !== '' ||
      typeof asset.title === 'string' && asset.title.trim() !== '';

    if (!hasSource) {
      pushIssue(
        errors,
        'error',
        `meta.json.assets[${index}]`,
        `${asset.file}: source_url, source_site, imagegen_prompt, source_type, or title is required`,
      );
    }
  }
};

const assertAssetPath = async ({assetPath, episodeDir, sceneId, contentPath, errors}) => {
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

  if (!episodeDir) {
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

const validateContent = async ({content, sceneId, contentPath, episodeDir, errors, warnings}) => {
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
    await assertAssetPath({assetPath: content.asset, episodeDir, sceneId, contentPath, errors});
    validateAssetRequirements({content, sceneId, contentPath, warnings});
  }
};

const NLM_MARKER_RE = /^\[(FIG|INFO|SLIDE|MAP|VIDEO):\d+\]$/;
const TEXT_FORBID_RE = /(文字|テキスト|text|typography|letters|wordmark|caption)/i;

const validateAssetRequirements = ({content, sceneId, contentPath, warnings}) => {
  const requirements = content.asset_requirements;
  const reqPath = `${contentPath}.asset_requirements`;

  if (requirements === undefined || requirements === null) {
    pushIssue(
      warnings,
      'warning',
      reqPath,
      `${sceneId}: asset_requirements is recommended for image content (engine routing)`,
    );
    return;
  }

  if (!isPlainObject(requirements)) {
    pushIssue(warnings, 'warning', reqPath, `${sceneId}: asset_requirements should be an object`);
    return;
  }

  const hasImagegenPrompt =
    typeof requirements.imagegen_prompt === 'string' && requirements.imagegen_prompt.trim() !== '';
  const hasNlmMarker =
    typeof requirements.nlm_marker_id === 'string' && requirements.nlm_marker_id.trim() !== '';

  if (!hasImagegenPrompt && !hasNlmMarker) {
    pushIssue(
      warnings,
      'warning',
      reqPath,
      `${sceneId}: asset_requirements should include imagegen_prompt (codex-imagegen) or nlm_marker_id (notebooklm)`,
    );
  }

  if (hasImagegenPrompt) {
    if (typeof requirements.aspect !== 'string' || requirements.aspect.trim() === '') {
      pushIssue(
        warnings,
        'warning',
        `${reqPath}.aspect`,
        `${sceneId}: aspect is recommended when imagegen_prompt is set (e.g. "16:9")`,
      );
    }
    const promptMentionsForbid =
      TEXT_FORBID_RE.test(requirements.imagegen_prompt) ||
      (typeof requirements.negative === 'string' && TEXT_FORBID_RE.test(requirements.negative));
    if (!promptMentionsForbid) {
      pushIssue(
        warnings,
        'warning',
        `${reqPath}.imagegen_prompt`,
        `${sceneId}: imagegen_prompt or negative should explicitly forbid text/letters in the image`,
      );
    }
  }

  if (hasNlmMarker && !NLM_MARKER_RE.test(requirements.nlm_marker_id.trim())) {
    pushIssue(
      warnings,
      'warning',
      `${reqPath}.nlm_marker_id`,
      `${sceneId}: nlm_marker_id should match [FIG|INFO|SLIDE|MAP|VIDEO:N]: ${requirements.nlm_marker_id}`,
    );
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

  if (!isPlainObject(script)) {
    pushIssue(errors, 'error', 'script', 'script must be an object');
    return {ok: false, errors, warnings};
  }

  if (!isPlainObject(script.meta)) {
    pushIssue(errors, 'error', 'meta', 'meta is required');
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
    });
  }

  if (script.meta?.scene_template !== undefined) {
    pushIssue(errors, 'error', 'meta.scene_template', 'meta.scene_template is deprecated; use meta.layout_template');
  }

  const template = script.meta?.layout_template;
  if (!SCENE_TEMPLATE_ID_SET.has(template)) {
    pushIssue(errors, 'error', 'meta.layout_template', `meta.layout_template must be Scene01-Scene21: ${template ?? '<missing>'}`);
  }

  for (const [sceneIndex, scene] of script.scenes.entries()) {
    const scenePath = `scenes[${sceneIndex}]`;
    if (!isPlainObject(scene)) {
      pushIssue(errors, 'error', scenePath, 'scene must be an object');
      continue;
    }

    const sceneId = typeof scene.id === 'string' && scene.id.trim() ? scene.id : scenePath;
    if (scene.scene_template !== undefined) {
      pushIssue(errors, 'error', `${scenePath}.scene_template`, `${sceneId}: scene_template is forbidden in scenes[]; use meta.layout_template`);
    }

    if (scene.sub && !SUB_CAPABLE_TEMPLATES.has(template)) {
      pushIssue(warnings, 'warning', `${scenePath}.sub`, `${sceneId}: ${template} has no renderable sub content area; use sub: null`);
    }

    if (scene.title_text && !TITLE_CAPABLE_TEMPLATES.has(template)) {
      pushIssue(warnings, 'warning', `${scenePath}.title_text`, `${sceneId}: ${template} has no title slot; move the heading into main.text if needed`);
    }

    if (!scene.main) {
      pushIssue(errors, 'error', `${scenePath}.main`, `${sceneId}: main content is required`);
    }
    await validateContent({content: scene.main, sceneId, contentPath: `${scenePath}.main`, episodeDir, errors, warnings});
    await validateContent({content: scene.sub, sceneId, contentPath: `${scenePath}.sub`, episodeDir, errors, warnings});

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
      } else if (countChars(line.text) > 25) {
        pushIssue(errors, 'error', `${linePath}.text`, `${sceneId}/${line.id ?? lineIndex}: dialogue text exceeds 25 chars: "${line.text}"`);
      }
    }
  }

  validateTiming({script, errors});

  return {ok: errors.length === 0, errors, warnings};
};
