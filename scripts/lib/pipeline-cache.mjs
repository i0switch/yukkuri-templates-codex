import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const AUDIO_MANIFEST_FILE = 'audio-manifest.json';
export const RENDER_MANIFEST_FILE = 'render-manifest.json';

const stableJson = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

export const sha256Text = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

export const hashObject = (value) => sha256Text(stableJson(value));

export const fileSha256 = async (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(await fs.readFile(filePath));
  return hash.digest('hex');
};

const statFile = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
};

export const audioLineInputHash = ({voiceEngine, speaker, voiceId, text}) =>
  hashObject({
    kind: 'audio-line-v1',
    voice_engine: voiceEngine,
    speaker,
    voice_id: voiceId,
    text,
  });

export const readJsonFile = async (filePath, fallback = null) => {
  try {
    return JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
};

export const writeJsonFile = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export const readAudioManifest = async (episodeDir) =>
  readJsonFile(path.join(episodeDir, AUDIO_MANIFEST_FILE), {version: 1, entries: {}});

export const writeAudioManifest = async (episodeDir, manifest) =>
  writeJsonFile(path.join(episodeDir, AUDIO_MANIFEST_FILE), {
    version: 1,
    updated_at: new Date().toISOString(),
    entries: manifest?.entries ?? {},
  });

export const shouldReuseAudioLine = async ({manifest, key, outFile, inputHash}) => {
  const entry = manifest?.entries?.[key];
  if (!entry) {
    return {ok: false, reason: 'manifest_entry_missing'};
  }
  if (entry.input_hash !== inputHash) {
    return {ok: false, reason: 'input_hash_mismatch'};
  }
  const stat = await statFile(outFile);
  if (!stat) {
    return {ok: false, reason: 'audio_file_missing'};
  }
  if (typeof entry.duration_sec !== 'number' || !Number.isFinite(entry.duration_sec) || entry.duration_sec <= 0) {
    return {ok: false, reason: 'duration_missing'};
  }
  if (entry.file_sha256) {
    const actualHash = await fileSha256(outFile);
    if (actualHash !== entry.file_sha256) {
      return {ok: false, reason: 'file_hash_mismatch'};
    }
  }
  return {ok: true, durationSec: entry.duration_sec};
};

export const shouldReuseLegacyAudioLine = async ({lineDurations, key, outFile}) => {
  const durationSec = lineDurations?.[key];
  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec) || durationSec <= 0) {
    return {ok: false, reason: 'legacy_duration_missing'};
  }
  const stat = await statFile(outFile);
  if (!stat) {
    return {ok: false, reason: 'legacy_audio_file_missing'};
  }
  return {
    ok: true,
    durationSec,
    fileSha256: await fileSha256(outFile),
  };
};

export const mapLimit = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(Number.isFinite(limit) ? Math.floor(limit) : 1, items.length || 1));

  await Promise.all(
    Array.from({length: workerCount}, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    }),
  );

  return results;
};

const collectFiles = async (targetPath) => {
  const stat = await statFile(targetPath);
  if (stat) {
    return [targetPath];
  }

  const entries = await fs.readdir(targetPath, {withFileTypes: true});
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith('.'))
      .map(async (entry) => {
        const entryPath = path.join(targetPath, entry.name);
        return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
      }),
  );
  return nested.flat();
};

export const hashPaths = async (paths, {rootDir = process.cwd()} = {}) => {
  const hash = crypto.createHash('sha256');
  for (const target of paths) {
    try {
      const files = (await collectFiles(target)).sort();
      for (const file of files) {
        hash.update(path.relative(rootDir, file).replaceAll('\\', '/'));
        hash.update('\0');
        hash.update(await fs.readFile(file));
        hash.update('\0');
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
      hash.update(`missing:${path.relative(rootDir, target).replaceAll('\\', '/')}`);
    }
  }
  return hash.digest('hex');
};

export const readRenderManifest = async (episodeDir) =>
  readJsonFile(path.join(episodeDir, RENDER_MANIFEST_FILE), {version: 1});

export const writeRenderManifest = async (episodeDir, manifest) =>
  writeJsonFile(path.join(episodeDir, RENDER_MANIFEST_FILE), {
    version: 1,
    updated_at: new Date().toISOString(),
    ...manifest,
  });
