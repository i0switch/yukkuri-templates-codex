import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadImagePromptRegistry, promptFromRegistry} from './lib/image-prompt-registry.mjs';
import {sha256Text, writeJsonFile} from './lib/pipeline-cache.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];
const checkOnly = process.argv.includes('--check');

if (!episodeId) {
  throw new Error('Usage: node scripts/sync-imagegen-ledger.mjs <episode_id|episode_dir|path/to/script.yaml> [--check]');
}

const normalize = (value) => String(value ?? '').replaceAll('\\', '/');

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
};

const registryPromptForScene = ({registry, sceneId, slot = 'main', promptRef}) => {
  const candidates = [promptRef, typeof promptRef === 'string' && promptRef.includes('#') ? promptRef.split('#').pop() : null, `${sceneId}.${slot}`, `${sceneId}.main`, sceneId].filter(Boolean);
  for (const ref of candidates) {
    const prompt = promptFromRegistry(registry, ref);
    if (prompt) {
      return prompt;
    }
  }
  const entry = Array.isArray(registry?.prompts)
    ? registry.prompts.find((item) => item?.scene_id === sceneId && (item.slot ?? 'main') === slot)
    : null;
  return typeof entry?.imagegen_prompt === 'string' ? entry.imagegen_prompt : '';
};

const manifestFile = (entry) => normalize(entry?.file ?? entry?.destination ?? entry?.dest ?? '');
const planForSlot = (scene, slot) =>
  Array.isArray(scene.visual_asset_plan)
    ? scene.visual_asset_plan.find((item) => item?.slot === slot) ??
      (slot === 'main' ? scene.visual_asset_plan.find((item) => item?.slot === 'main') ?? scene.visual_asset_plan[0] : null)
    : null;

const directTarget = path.resolve(rootDir, episodeId);
const episodeDir = episodeId.endsWith('.yaml') || episodeId.endsWith('.yml')
  ? path.dirname(directTarget)
  : episodeId.includes('/') || episodeId.includes('\\')
    ? directTarget
    : path.join(rootDir, 'script', episodeId);
const scriptPath = path.join(episodeDir, 'script.yaml');
const metaPath = path.join(episodeDir, 'meta.json');
const manifestPath = path.join(episodeDir, 'imagegen_manifest.json');

const script = parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();
const registry = await loadImagePromptRegistry(episodeDir);
const meta = await readJson(metaPath, {});
const manifest = await readJson(manifestPath, {version: 1, images: []});
const changes = [];
const promptByFile = new Map();

for (const scene of script?.scenes ?? []) {
  if (scene?.main?.kind !== 'image') {
    continue;
  }
  const sceneId = scene.id;
  const entries = Array.isArray(scene.main_timeline) && scene.main_timeline.length > 0
    ? scene.main_timeline
    : [{slot: 'main', asset: scene.main.asset}];
  for (const [index, entry] of entries.entries()) {
    const slot = typeof entry?.slot === 'string' && entry.slot.trim() ? entry.slot.trim() : index === 0 ? 'main' : `main_${String(index + 1).padStart(2, '0')}`;
    const file = normalize(entry?.asset ?? (slot === 'main' ? scene.main.asset : ''));
    const plan = planForSlot(scene, slot);
    const prompt =
      registryPromptForScene({registry, sceneId, slot, promptRef: plan?.imagegen_prompt_ref}) ||
      (typeof plan?.imagegen_prompt === 'string' ? plan.imagegen_prompt : '') ||
      (slot === 'main' && typeof scene.main?.asset_requirements?.imagegen_prompt === 'string' ? scene.main.asset_requirements.imagegen_prompt : '');
    if (file && prompt) {
      promptByFile.set(file, {sceneId, slot, prompt, promptSha256: sha256Text(prompt)});
    }
  }
}

if (Array.isArray(meta.assets)) {
  for (const [index, asset] of meta.assets.entries()) {
    const file = normalize(asset?.file);
    const promptInfo = promptByFile.get(file);
    if (!promptInfo || asset?.source_type !== 'imagegen') {
      continue;
    }
    if (asset.imagegen_prompt !== promptInfo.prompt) {
      changes.push({file, path: `meta.json.assets[${index}].imagegen_prompt`});
      asset.imagegen_prompt = promptInfo.prompt;
    }
    if (asset.scene_id !== promptInfo.sceneId) {
      changes.push({file, path: `meta.json.assets[${index}].scene_id`});
      asset.scene_id = promptInfo.sceneId;
    }
    if ((asset.slot ?? 'main') !== promptInfo.slot) {
      changes.push({file, path: `meta.json.assets[${index}].slot`});
      asset.slot = promptInfo.slot;
    }
    if (promptInfo.slot.startsWith('main') && asset.slot_group !== 'main') {
      changes.push({file, path: `meta.json.assets[${index}].slot_group`});
      asset.slot_group = 'main';
    }
  }
}

const entries = Array.isArray(manifest.images) ? manifest.images : [];
for (const [index, entry] of entries.entries()) {
  const file = manifestFile(entry);
  const promptInfo = promptByFile.get(file);
  if (!promptInfo) {
    continue;
  }
  if (entry.prompt_sha256 !== promptInfo.promptSha256) {
    changes.push({file, path: `imagegen_manifest.json.images[${index}].prompt_sha256`, before: entry.prompt_sha256 ?? null, after: promptInfo.promptSha256});
    entry.prompt_sha256 = promptInfo.promptSha256;
  }
  if (entry.scene_id !== promptInfo.sceneId) {
    changes.push({file, path: `imagegen_manifest.json.images[${index}].scene_id`});
    entry.scene_id = promptInfo.sceneId;
  }
  if ((entry.slot ?? 'main') !== promptInfo.slot) {
    changes.push({file, path: `imagegen_manifest.json.images[${index}].slot`});
    entry.slot = promptInfo.slot;
  }
  if (promptInfo.slot.startsWith('main') && entry.slot_group !== 'main') {
    changes.push({file, path: `imagegen_manifest.json.images[${index}].slot_group`});
    entry.slot_group = 'main';
  }
}
manifest.version = manifest.version ?? 1;
manifest.images = entries;

if (changes.length > 0 && !checkOnly) {
  await writeJsonFile(metaPath, meta);
  await writeJsonFile(manifestPath, manifest);
}

console.log(
  JSON.stringify(
    {
      ok: changes.length === 0 || !checkOnly,
      episode_id: episodeId,
      changed: changes.length > 0,
      check_only: checkOnly,
      changes,
    },
    null,
    2,
  ),
);

if (checkOnly && changes.length > 0) {
  process.exitCode = 1;
}
