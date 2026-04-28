import fs from 'node:fs/promises';
import path from 'node:path';

export const IMAGE_PROMPT_PACK_FILES = [
  '00_IMAGE_GEN_MASTER_RULES.md',
  '01_IMAGE_DIRECTION_PROMPT.md',
  '02_IMAGEGEN_PROMPT_PROMPT.md',
  '04_IMAGE_REWRITE_PROMPT.md',
  '05_IMAGE_RESULT_AUDIT.md',
];

export async function loadImagePromptPack(rootDir = process.cwd(), {log = true} = {}) {
  const packDir = path.join(rootDir, '_reference', 'image_prompt_pack');
  const loaded = {};

  for (const file of IMAGE_PROMPT_PACK_FILES) {
    const filePath = path.join(packDir, file);
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(
        `Missing required image prompt pack file: ${filePath}\n` +
          '画像生成前に _reference/image_prompt_pack を配置してください。',
        {cause: error},
      );
    }

    if (!content.trim()) {
      throw new Error(`Image prompt file is empty: ${filePath}`);
    }

    loaded[file] = content;
    if (log) {
      console.log(`[image-prompt-pack] loaded ${path.relative(rootDir, filePath)}`);
    }
  }

  return {
    packDir,
    files: loaded,
  };
}
