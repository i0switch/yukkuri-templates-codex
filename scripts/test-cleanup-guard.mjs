import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'cleanup-guard-fixtures');

const run = (args, {expectFailure = false} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    return result.stdout;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
};

await fs.rm(fixtureRoot, {recursive: true, force: true});
await fs.mkdir(path.join(fixtureRoot, 'scripts', 'oneoff'), {recursive: true});
await fs.writeFile(path.join(fixtureRoot, '.tmp_episode.mjs'), 'console.log("tmp");\n', 'utf8');
await fs.writeFile(path.join(fixtureRoot, 'scripts', 'oneoff', 'create-ep001.mjs'), 'console.log("historical");\n', 'utf8');

const failed = run(['scripts/check-cleanup.mjs', `--root=${path.relative(rootDir, fixtureRoot)}`], {expectFailure: true});
if (!failed.includes('.tmp_episode.mjs') || failed.includes('scripts/oneoff/create-ep001.mjs')) {
  throw new Error(`cleanup guard should flag root temp script and ignore scripts/oneoff, got:\n${failed}`);
}

await fs.rm(path.join(fixtureRoot, '.tmp_episode.mjs'), {force: true});
run(['scripts/check-cleanup.mjs', `--root=${path.relative(rootDir, fixtureRoot)}`]);

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
