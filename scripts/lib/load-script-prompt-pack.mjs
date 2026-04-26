import fs from 'node:fs/promises';
import path from 'node:path';

export const SCRIPT_PROMPT_PACK_FILES = [
  '00_MASTER_SCRIPT_RULES.md',
  '01_plan_prompt.md',
  '02_draft_prompt.md',
  '03_audit_prompt.md',
  '04_rewrite_prompt.md',
  '05_yaml_prompt.md',
];

export async function loadScriptPromptPack(rootDir = process.cwd(), {log = true} = {}) {
  const packDir = path.join(rootDir, '_reference', 'script_prompt_pack');
  const loaded = {};

  for (const file of SCRIPT_PROMPT_PACK_FILES) {
    const filePath = path.join(packDir, file);
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(
        `Missing required script prompt pack file: ${filePath}\n` +
          '台本生成前に _reference/script_prompt_pack を配置してください。',
        {cause: error},
      );
    }

    if (!content.trim()) {
      throw new Error(`Prompt file is empty: ${filePath}`);
    }

    loaded[file] = content;
    if (log) {
      console.log(`[script-prompt-pack] loaded ${path.relative(rootDir, filePath)}`);
    }
  }

  return {
    packDir,
    files: loaded,
  };
}
