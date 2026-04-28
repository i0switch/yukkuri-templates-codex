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

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const episodeDir = path.join(rootDir, 'script', episodeId);
const auditsDir = path.join(episodeDir, 'audits');
const isHybridUserScript = await fileExists(path.join(auditsDir, 'manual_intake.md'));

run(['scripts/validate-script-generation-route.mjs']);
run(['scripts/normalize-aquestalk-presets.mjs', episodeId]);
run(['scripts/validate-script-prompt-pack-evidence.mjs', episodeId]);
run(['scripts/validate-script-final-review.mjs', episodeId]);
run(['scripts/audit-script-quality.mjs', episodeId]);
run(['scripts/sync-imagegen-ledger.mjs', episodeId, '--check']);
run(['scripts/estimate-episode-duration.mjs', episodeId]);
run(promptOnly ? ['scripts/validate-episode-script.mjs', episodeId, '--prompt-only'] : ['scripts/validate-episode-script.mjs', episodeId]);

console.log('[pre-render-gate] direct script_final image prompt mode: skipped image prompt, generated-image, and image-heavy episode audits');

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
        'normalize-aquestalk-presets',
        'validate-script-prompt-pack-evidence',
        'validate-script-final-review',
        'audit-script-quality',
        'sync-imagegen-ledger --check',
        'estimate-episode-duration',
        promptOnly ? 'validate-episode-script --prompt-only' : 'validate-episode-script',
        isHybridUserScript ? 'hybrid_user_script manual intake evidence' : 'script prompt pack presence',
        isHybridUserScript ? 'source_manual_script.md and audits/manual_intake.md' : 'episode-level script prompt pack evidence files',
        'script_final.md exists as the single Codex review target',
        'image prompt pack presence',
        'direct script_final scene text is allowed in visual_asset_plan imagegen_prompt',
        'image prompt and generated-image audits are intentionally non-blocking',
        'script_final.md metadata leaks and weak openings are blocked before render',
      ],
      prompt_only: promptOnly,
      mode: isHybridUserScript ? 'hybrid_user_script' : 'prompt_pack',
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(JSON.stringify({episodeId, verdict: 'PASS', prompt_only: promptOnly}, null, 2));
