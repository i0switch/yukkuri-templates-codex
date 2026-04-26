import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const episodeId = process.argv[2];
const promptOnly = process.argv.includes('--prompt-only') || process.argv.includes('--prompt_only');

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

run(['scripts/validate-script-generation-route.mjs']);
run(['scripts/validate-script-prompt-pack-evidence.mjs', episodeId]);
run(['scripts/audit-script-quality.mjs', episodeId]);
run(promptOnly ? ['scripts/validate-episode-script.mjs', episodeId, '--prompt-only'] : ['scripts/validate-episode-script.mjs', episodeId]);

console.log('[pre-render-gate] direct script_final image prompt mode: skipped image prompt, generated-image, and image-heavy episode audits');

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
        'validate-script-generation-route',
        'validate-script-prompt-pack-evidence',
        promptOnly ? 'validate-episode-script --prompt-only' : 'validate-episode-script',
        'audit-script-quality',
        'script prompt pack presence',
        'episode-level script prompt pack evidence files',
        'script_final.md exists as the single Codex review target',
        'image prompt pack presence',
        'direct script_final scene text is allowed in visual_asset_plan imagegen_prompt',
        'image prompt and generated-image audits are intentionally non-blocking',
        'dialogue rejects known mechanical conversion artifacts',
      ],
      prompt_only: promptOnly,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(JSON.stringify({episodeId, verdict: 'PASS', prompt_only: promptOnly}, null, 2));
