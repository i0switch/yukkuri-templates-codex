import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument, stringify} from 'yaml';
import {normalizeAquesTalkPreset} from './lib/aquestalk-presets.mjs';

const rootDir = process.cwd();
const target = process.argv[2];
const checkOnly = process.argv.includes('--check');

if (!target) {
  throw new Error('Usage: node scripts/normalize-aquestalk-presets.mjs <episode_id|path/to/script.yaml> [--check]');
}

const scriptPath = target.endsWith('.yaml') || target.endsWith('.yml')
  ? path.resolve(rootDir, target)
  : path.join(rootDir, 'script', target, 'script.yaml');

const doc = parseDocument(await fs.readFile(scriptPath, 'utf8'));
const script = doc.toJS();
const changes = [];

if (script?.meta?.pair === 'RM' || script?.meta?.voice_engine === 'aquestalk') {
  for (const side of ['left', 'right']) {
    const config = script?.characters?.[side];
    if (!config || typeof config !== 'object') {
      continue;
    }
    const before = config.aquestalk_preset;
    const after = normalizeAquesTalkPreset({side, preset: before});
    if (before !== after) {
      config.aquestalk_preset = after;
      changes.push({path: `characters.${side}.aquestalk_preset`, before: before ?? null, after});
    }
  }
}

if (changes.length > 0 && !checkOnly) {
  await fs.writeFile(scriptPath, stringify(script), 'utf8');
}

console.log(
  JSON.stringify(
    {
      ok: changes.length === 0 || !checkOnly,
      script_path: path.relative(rootDir, scriptPath).replaceAll('\\', '/'),
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
