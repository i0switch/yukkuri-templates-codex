import {spawnSync} from 'node:child_process';
import path from 'node:path';

const episodes = process.argv.slice(2);
if (episodes.length === 0) {
  console.error('Usage: node scripts/render-batch.mjs <ep_id_1> [ep_id_2] ...');
  process.exit(1);
}

const run = (cmd, args) => {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {stdio: 'inherit', shell: false});
  if (r.status !== 0) {
    throw new Error(`Command failed (${r.status}): ${cmd} ${args.join(' ')}`);
  }
};

for (const ep of episodes) {
  console.log(`\n=== ${ep}: validate ===`);
  run('node', ['scripts/validate-episode-script.mjs', ep]);

  console.log(`\n=== ${ep}: build ===`);
  run('node', ['scripts/build-episode.mjs', ep]);
}

console.log('\n=== generate compositions ===');
run('node', ['scripts/generate-episode-compositions.mjs']);

for (const ep of episodes) {
  const out = path.posix.join('out', 'videos', `${ep}.mp4`);
  console.log(`\n=== ${ep}: render ===`);
  run('npx', ['remotion', 'render', 'src/index.ts', `Video-${ep}`, out]);
  console.log(`✓ rendered: ${out}`);
}

console.log('\nALL DONE');
