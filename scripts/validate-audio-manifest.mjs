import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {collectAudioManifestIssues} from './lib/audio-manifest-validator.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/validate-audio-manifest.mjs <episode_id|path/to/script.render.json|path/to/script.yaml>');
}

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.json') || value.endsWith('.yaml') || value.endsWith('.yml')) {
    return {
      episodeDir: path.dirname(directPath),
      scriptPath: directPath,
    };
  }
  const episodeDir = path.join(rootDir, 'script', value);
  return {
    episodeDir,
    scriptPath: path.join(episodeDir, 'script.render.json'),
  };
};

const readScript = async (scriptPath) => {
  const raw = await fs.readFile(scriptPath, 'utf8');
  if (scriptPath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parseDocument(raw).toJS();
};

const {episodeDir, scriptPath} = resolveTarget(target);
const script = await readScript(scriptPath);
const issues = await collectAudioManifestIssues({episodeDir, script});

if (issues.length > 0) {
  console.error(JSON.stringify({ok: false, target, issues}, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ok: true, target, checked_lines: script.scenes?.flatMap((scene) => scene.dialogue ?? []).length ?? 0}, null, 2));
}
