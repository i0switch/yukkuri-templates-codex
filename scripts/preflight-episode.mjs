import {spawnSync} from 'node:child_process';

const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/preflight-episode.mjs <episode_id>');
}

const run = (args) => {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 32,
  });
  if (result.stdout) {
    console.log(result.stdout.trim());
  }
  if (result.stderr) {
    console.error(result.stderr.trim());
  }
  if (result.status !== 0) {
    throw new Error(`Preflight command failed: node ${args.join(' ')}`);
  }
};

run(['scripts/normalize-aquestalk-presets.mjs', episodeId]);
run(['scripts/audit-image-prompts.mjs', episodeId]);
run(['scripts/sync-imagegen-ledger.mjs', episodeId, '--check']);
run(['scripts/estimate-episode-duration.mjs', episodeId]);
run(['scripts/validate-episode-script.mjs', episodeId, '--prompt-only']);

console.log(JSON.stringify({episode_id: episodeId, verdict: 'PASS'}, null, 2));
