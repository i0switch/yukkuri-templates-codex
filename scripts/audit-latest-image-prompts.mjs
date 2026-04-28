import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const scriptRoot = path.join(rootDir, 'script');

const options = {
  limit: 8,
  warnOnly: false,
  episodes: [],
};

for (const arg of process.argv.slice(2)) {
  if (arg === '--warn-only') {
    options.warnOnly = true;
    continue;
  }
  if (arg.startsWith('--limit=')) {
    options.limit = Number.parseInt(arg.slice('--limit='.length), 10);
    continue;
  }
  if (arg.startsWith('--episode=')) {
    options.episodes.push(arg.slice('--episode='.length));
    continue;
  }
  throw new Error(`Unknown argument: ${arg}`);
}

if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 50) {
  throw new Error('--limit must be an integer from 1 to 50');
}

const MOJIBAKE_PATTERNS = [
  /�/,
  /ã[€‚ƒ„…†‡ˆ‰Š‹ŒŽ]/,
  /ã[一-龥ぁ-んァ-ヶ]/,
  /ã€/,
  /ã/,
  /ã‚/,
  /ãƒ/,
  /ï¼/,
  /â€¦/,
  /â†’/,
  /â€œ|â€|â€˜|â€™/,
];

const LEGACY_PROMPT_PATTERNS = [
  {code: 'legacy-english-aspect-ratio', pattern: /Make the aspect ratio 16:9\./i},
  {code: 'legacy-youtube-wording', pattern: /YouTube(?:ã|の)解説動画/i},
  {code: 'legacy-bottom-space-request', pattern: /(?:下部|画面下部|bottom|lower)[^。\n]*(?:余白を(?:空け|残し)|blank|empty|safe space)/i},
];

const isDirectory = async (dirPath) => {
  try {
    return (await fs.stat(dirPath)).isDirectory();
  } catch {
    return false;
  }
};

const fileExists = async (filePath) => {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
};

const latestEpisodeDirs = async () => {
  const entries = await fs.readdir(scriptRoot, {withFileTypes: true});
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = path.join(scriptRoot, entry.name);
    const promptPath = path.join(dir, 'image_prompts.json');
    if (!(await fileExists(promptPath))) {
      continue;
    }
    const stat = await fs.stat(promptPath);
    dirs.push({episodeId: entry.name, dir, mtimeMs: stat.mtimeMs});
  }
  return dirs.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, options.limit);
};

const requestedEpisodeDirs = async () => {
  const dirs = [];
  for (const episodeId of options.episodes) {
    const dir = path.join(scriptRoot, episodeId);
    if (!(await isDirectory(dir))) {
      throw new Error(`Episode directory not found: script/${episodeId}`);
    }
    dirs.push({episodeId, dir, mtimeMs: 0});
  }
  return dirs;
};

const collectStrings = (value, strings = []) => {
  if (typeof value === 'string') {
    strings.push(value);
    return strings;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, strings);
    }
    return strings;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectStrings(item, strings);
    }
  }
  return strings;
};

const excerpt = (text, index) => {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + 80);
  return text.slice(start, end).replace(/\s+/g, ' ');
};

const inspectEpisode = async ({episodeId, dir}) => {
  const promptPath = path.join(dir, 'image_prompts.json');
  const rel = path.relative(rootDir, promptPath).replaceAll('\\', '/');
  const issues = [];
  let json;
  let raw;

  try {
    raw = await fs.readFile(promptPath, 'utf8');
  } catch (error) {
    issues.push({level: 'error', code: 'image-prompts-read-failed', file: rel, message: error.message});
    return {episode_id: episodeId, file: rel, ok: false, issues};
  }

  try {
    json = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (error) {
    issues.push({level: 'error', code: 'image-prompts-json-parse-failed', file: rel, message: error.message});
    return {episode_id: episodeId, file: rel, ok: false, issues};
  }

  const strings = collectStrings(json);
  for (const [stringIndex, value] of strings.entries()) {
    for (const pattern of MOJIBAKE_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(value);
      if (match) {
        issues.push({
          level: 'error',
          code: 'mojibake-suspected',
          file: rel,
          string_index: stringIndex,
          match: match[0],
          excerpt: excerpt(value, match.index),
        });
        break;
      }
    }

    for (const {code, pattern} of LEGACY_PROMPT_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(value);
      if (match) {
        issues.push({
          level: 'error',
          code,
          file: rel,
          string_index: stringIndex,
          match: match[0],
          excerpt: excerpt(value, match.index),
        });
      }
    }
  }

  return {
    episode_id: episodeId,
    file: rel,
    ok: issues.length === 0,
    prompt_strings: strings.length,
    issues,
  };
};

const targets = options.episodes.length > 0 ? await requestedEpisodeDirs() : await latestEpisodeDirs();
const reports = [];
for (const target of targets) {
  reports.push(await inspectEpisode(target));
}

const issues = reports.flatMap((report) => report.issues.map((issue) => ({episode_id: report.episode_id, ...issue})));
const output = {
  ok: issues.length === 0,
  checked_at: new Date().toISOString(),
  mode: options.episodes.length > 0 ? 'explicit-episodes' : 'latest',
  limit: options.limit,
  checked_episodes: reports.map((report) => report.episode_id),
  reports,
  issues,
};

console.log(JSON.stringify(output, null, 2));
if (!output.ok && !options.warnOnly) {
  process.exitCode = 1;
}
