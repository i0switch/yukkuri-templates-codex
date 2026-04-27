import fs from 'node:fs/promises';
import path from 'node:path';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const loadImagePromptRegistry = async (episodeDir) => {
  try {
    const raw = await fs.readFile(path.join(episodeDir, 'image_prompts.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

export const promptFromRegistry = (registry, ref) => {
  if (!registry || typeof ref !== 'string' || ref.trim() === '') {
    return '';
  }
  const prompts = registry.prompts;
  if (isPlainObject(prompts)) {
    const entry = prompts[ref];
    if (typeof entry === 'string') {
      return entry;
    }
    if (isPlainObject(entry) && typeof entry.imagegen_prompt === 'string') {
      return entry.imagegen_prompt;
    }
  }
  if (Array.isArray(prompts)) {
    const entry = prompts.find((item) => isPlainObject(item) && item.ref === ref);
    return typeof entry?.imagegen_prompt === 'string' ? entry.imagegen_prompt : '';
  }
  return '';
};
