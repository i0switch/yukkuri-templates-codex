import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {estimateEpisodeDurationWithMeasurements} from './lib/duration-estimator.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/estimate-episode-duration.mjs <episode_id|path/to/script.yaml>');
}

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml')) {
    return directPath;
  }
  return path.join(rootDir, 'script', value, 'script.yaml');
};

const scriptPath = resolveTarget(target);
const script = parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();
const episodeDir = path.dirname(scriptPath);
const report = {
  episode_id: script?.meta?.id ?? path.basename(path.dirname(scriptPath)),
  checked_at: new Date().toISOString(),
  script_path: path.relative(rootDir, scriptPath).replaceAll('\\', '/'),
  ...(await estimateEpisodeDurationWithMeasurements(script, {episodeDir})),
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
