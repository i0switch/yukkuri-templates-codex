import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {
  SCENE_TEMPLATE_ID_SET,
  SUB_CAPABLE_TEMPLATES,
  TITLE_CAPABLE_TEMPLATES,
  formatEpisodeValidationResult,
} from './lib/episode-validator.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/lint-script-pre.mjs <episode_id|path/to/script.yaml>');
}

const countChars = (value) => Array.from(value).length;
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const normalizeAssetPath = (assetPath) => assetPath.replaceAll('\\', '/');
const pushIssue = (issues, level, pathName, message) => issues.push({level, path: pathName, message});

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml')) {
    return directPath;
  }
  return path.join(rootDir, 'script', value, 'script.yaml');
};

const readScript = async (scriptPath) => {
  const raw = await fs.readFile(scriptPath, 'utf8');
  return parseDocument(raw).toJS();
};

const assertAssetPath = ({assetPath, sceneId, contentPath, errors}) => {
  if (typeof assetPath !== 'string' || assetPath.trim() === '') {
    pushIssue(errors, 'error', `${contentPath}.asset`, `${sceneId}: image.asset is required`);
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
};

const validateContent = ({content, sceneId, contentPath, errors}) => {
  if (content === null || content === undefined) {
    return;
  }
  if (!isPlainObject(content)) {
    pushIssue(errors, 'error', contentPath, `${sceneId}: content must be an object or null`);
    return;
  }
  if (content.kind === 'image') {
    assertAssetPath({assetPath: content.asset, sceneId, contentPath, errors});
  }
};

const validatePreScript = (script) => {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(script)) {
    pushIssue(errors, 'error', 'script', 'script must be an object');
    return {ok: false, errors, warnings};
  }

  if (!isPlainObject(script.meta)) {
    pushIssue(errors, 'error', 'meta', 'meta is required');
  }

  if (script.meta?.scene_template !== undefined) {
    pushIssue(errors, 'error', 'meta.scene_template', 'meta.scene_template is deprecated; use meta.layout_template');
  }

  const template = script.meta?.layout_template;
  if (!SCENE_TEMPLATE_ID_SET.has(template)) {
    pushIssue(errors, 'error', 'meta.layout_template', `meta.layout_template must be Scene01-Scene21: ${template ?? '<missing>'}`);
  }

  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    pushIssue(errors, 'error', 'scenes', 'scenes must be a non-empty array');
    return {ok: false, errors, warnings};
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
      pushIssue(errors, 'error', `${scenePath}.sub`, `${sceneId}: ${template} has no renderable sub content area; use sub: null`);
    }

    if (scene.title_text && !TITLE_CAPABLE_TEMPLATES.has(template)) {
      pushIssue(errors, 'error', `${scenePath}.title_text`, `${sceneId}: ${template} has no title slot; move the heading into main.text if needed`);
    }

    if (!scene.main) {
      pushIssue(errors, 'error', `${scenePath}.main`, `${sceneId}: main content is required`);
    }
    validateContent({content: scene.main, sceneId, contentPath: `${scenePath}.main`, errors});
    validateContent({content: scene.sub, sceneId, contentPath: `${scenePath}.sub`, errors});

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
      if (typeof line.text !== 'string' || line.text.trim() === '') {
        pushIssue(errors, 'error', `${linePath}.text`, `${sceneId}/${line.id ?? lineIndex}: dialogue text is required`);
      } else if (countChars(line.text) > 25) {
        pushIssue(errors, 'error', `${linePath}.text`, `${sceneId}/${line.id ?? lineIndex}: dialogue text exceeds 25 chars: "${line.text}"`);
      }
    }
  }

  return {ok: errors.length === 0, errors, warnings};
};

const scriptPath = resolveTarget(target);
const script = await readScript(scriptPath);
const result = validatePreScript(script);
const details = formatEpisodeValidationResult(result);
if (details) {
  console.log(details);
}

if (!result.ok) {
  process.exitCode = 1;
} else {
  console.log(`OK pre-lint ${path.relative(rootDir, scriptPath)}`);
}
