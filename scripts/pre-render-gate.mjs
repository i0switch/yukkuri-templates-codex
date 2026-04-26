import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/pre-render-gate.mjs <episode_id>');
}

const run = (args) => {
  const result = spawnSync(process.execPath, args, {
    cwd: rootDir,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.stdout) {
    console.log(result.stdout.trim());
  }
  if (result.stderr) {
    console.error(result.stderr.trim());
  }
  if (result.status !== 0) {
    throw new Error(`Gate command failed: node ${args.join(' ')}`);
  }
};

run(['scripts/validate-episode-script.mjs', episodeId]);
run(['scripts/audit-episode-quality.mjs', episodeId]);

const auditsDir = path.join(rootDir, 'script', episodeId, 'audits');
await fs.mkdir(auditsDir, {recursive: true});
await fs.writeFile(
  path.join(auditsDir, 'pre_render_gate.json'),
  `${JSON.stringify(
    {
      step: 'pre_render_gate',
      verdict: 'PASS',
      checked_at: new Date().toISOString(),
      checks: [
        'validate-episode-script',
        'audit-episode-quality',
        'image provenance rejects fallback/local card assets',
        'image files must be inspectable raster assets above delivery thresholds',
        'dialogue rejects known mechanical conversion artifacts',
      ],
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(JSON.stringify({episodeId, verdict: 'PASS'}, null, 2));
