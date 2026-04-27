import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {formatEpisodeValidationResult, validateEpisodeScript} from './lib/episode-validator.mjs';
import {checkVoicevoxEngine} from './voicevox.mjs';

const rootDir = process.cwd();
const target = process.argv[2];
const promptOnly = process.argv.includes('--prompt-only') || process.argv.includes('--prompt_only');

if (!target) {
  throw new Error('Usage: node scripts/validate-episode-script.mjs <episode_id|path/to/script.yaml|path/to/script.render.json>');
}

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml') || value.endsWith('.json')) {
    return {
      scriptPath: directPath,
      episodeDir: path.dirname(directPath),
      isEpisodeId: false,
    };
  }

  const episodeDir = path.resolve(rootDir, 'script', value);
  return {
    scriptPath: path.join(episodeDir, 'script.yaml'),
    episodeDir,
    isEpisodeId: true,
  };
};

const readScript = async (scriptPath) => {
  const raw = await fs.readFile(scriptPath, 'utf8');
  if (scriptPath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parseDocument(raw).toJS();
};

const {scriptPath, episodeDir, isEpisodeId} = resolveTarget(target);
const script = await readScript(scriptPath);
const result = await validateEpisodeScript(script, {episodeDir, promptOnly});
let preflightError = null;

if (result.ok && isEpisodeId && !promptOnly && script.meta?.voice_engine === 'voicevox') {
  try {
    await checkVoicevoxEngine();
  } catch (error) {
    preflightError = error;
  }
}

const details = formatEpisodeValidationResult(result);
if (details) {
  console.log(details);
}

if (preflightError) {
  console.error(preflightError.message);
  process.exitCode = 1;
} else if (!result.ok) {
  process.exitCode = 1;
} else {
  console.log(`OK ${path.relative(rootDir, scriptPath)} (${result.warnings.length} warnings${promptOnly ? ', prompt-only' : ''})`);
}
