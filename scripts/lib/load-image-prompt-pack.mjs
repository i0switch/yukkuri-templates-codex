import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const IMAGE_PROMPT_PACK_FILES = [
  '00_IMAGE_GEN_MASTER_RULES.md',
  '01_IMAGE_DIRECTION_PROMPT.md',
  '02_IMAGEGEN_PROMPT_PROMPT.md',
  '03_IMAGE_PROMPT_AUDIT.md',
  '04_IMAGE_REWRITE_PROMPT.md',
  '05_IMAGE_RESULT_AUDIT.md',
];

export const IMAGE_PROMPT_PACK_OPTIONAL_FILES = [
  'README.md',
  path.join('archetypes', 'visual_type_catalog.md'),
  path.join('archetypes', 'composition_type_catalog.md'),
];

export const IMAGE_PROMPT_PACK_REL_PATH = path.join('_reference', 'image_prompt_pack');

export async function loadImagePromptPack(rootDir = process.cwd(), {silent = false} = {}) {
  const packDir = path.join(rootDir, IMAGE_PROMPT_PACK_REL_PATH);

  try {
    const stat = await fs.stat(packDir);
    if (!stat.isDirectory()) {
      throw new Error(`Image prompt pack path is not a directory: ${packDir}`);
    }
  } catch (error) {
    throw new Error(
      `Missing image prompt pack directory: ${packDir}\n` +
      `_reference/image_prompt_pack を配置してから再実行してください。\n` +
      `原因: ${error.message ?? error}`
    );
  }

  const loaded = {};
  const missing = [];

  for (const file of IMAGE_PROMPT_PACK_FILES) {
    const filePath = path.join(packDir, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (!content.trim()) {
        missing.push({file, reason: 'empty'});
        continue;
      }
      loaded[file] = content;
      if (!silent) {
        console.log(`[image-pack] OK  ${file}`);
      }
    } catch (error) {
      missing.push({file, reason: error.code === 'ENOENT' ? 'missing' : `error:${error.message ?? error}`});
    }
  }

  if (missing.length > 0) {
    const lines = missing.map(({file, reason}) => `- ${file} (${reason})`).join('\n');
    throw new Error(
      `Required image prompt pack files are missing or empty under ${packDir}:\n${lines}\n` +
      `画像生成前に _reference/image_prompt_pack を整備してください。`
    );
  }

  const optional = {};
  for (const file of IMAGE_PROMPT_PACK_OPTIONAL_FILES) {
    const filePath = path.join(packDir, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (content.trim()) optional[file] = content;
    } catch {
      // optional は欠けても OK
    }
  }

  return {
    packDir,
    files: loaded,
    optional,
    fileNames: [...IMAGE_PROMPT_PACK_FILES],
  };
}

export async function ensureImagePromptPackOrThrow(rootDir = process.cwd(), options) {
  return loadImagePromptPack(rootDir, options);
}

const isMain = (() => {
  try {
    const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
    const thisPath = path.resolve(fileURLToPath(import.meta.url));
    return thisPath === argvPath;
  } catch {
    return false;
  }
})();

if (isMain) {
  try {
    const result = await loadImagePromptPack(process.cwd());
    console.log(JSON.stringify({
      ok: true,
      packDir: result.packDir,
      files: result.fileNames,
      optionalCount: Object.keys(result.optional).length,
    }, null, 2));
  } catch (error) {
    console.error(error.message ?? String(error));
    process.exit(1);
  }
}
