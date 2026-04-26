import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SCRIPT_PROMPT_PACK_FILES = [
  '00_MASTER_SCRIPT_RULES.md',
  '01_plan_prompt.md',
  '02_draft_prompt.md',
  '03_audit_prompt.md',
  '04_rewrite_prompt.md',
  '05_yaml_prompt.md',
];

export const PROMPT_PACK_REL_PATH = path.join('_reference', 'script_prompt_pack');

export async function loadScriptPromptPack(rootDir = process.cwd(), {silent = false} = {}) {
  const packDir = path.join(rootDir, PROMPT_PACK_REL_PATH);

  try {
    const stat = await fs.stat(packDir);
    if (!stat.isDirectory()) {
      throw new Error(`Prompt pack path is not a directory: ${packDir}`);
    }
  } catch (error) {
    throw new Error(
      `Missing script prompt pack directory: ${packDir}\n` +
      `_reference/script_prompt_pack を配置してから再実行してください。\n` +
      `原因: ${error.message ?? error}`
    );
  }

  const loaded = {};
  const missing = [];

  for (const file of SCRIPT_PROMPT_PACK_FILES) {
    const filePath = path.join(packDir, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (!content.trim()) {
        missing.push({file, reason: 'empty'});
        continue;
      }
      loaded[file] = content;
      if (!silent) {
        console.log(`[prompt-pack] OK  ${file}`);
      }
    } catch (error) {
      missing.push({file, reason: error.code === 'ENOENT' ? 'missing' : `error:${error.message ?? error}`});
    }
  }

  if (missing.length > 0) {
    const lines = missing.map(({file, reason}) => `- ${file} (${reason})`).join('\n');
    throw new Error(
      `Required script prompt pack files are missing or empty under ${packDir}:\n${lines}\n` +
      `台本生成前に _reference/script_prompt_pack を整備してください。`
    );
  }

  return {
    packDir,
    files: loaded,
    fileNames: [...SCRIPT_PROMPT_PACK_FILES],
  };
}

export async function ensureScriptPromptPackOrThrow(rootDir = process.cwd(), options) {
  return loadScriptPromptPack(rootDir, options);
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
    const result = await loadScriptPromptPack(process.cwd());
    console.log(JSON.stringify({
      ok: true,
      packDir: result.packDir,
      files: result.fileNames,
    }, null, 2));
  } catch (error) {
    console.error(error.message ?? String(error));
    process.exit(1);
  }
}
