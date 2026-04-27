import path from 'node:path';
import {readScriptFinalReviewState} from './lib/script-final-review-hash.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/validate-script-final-review.mjs <episode_id>');
}

const episodeDir = path.join(rootDir, 'script', episodeId);
const scriptFinalPath = path.join(episodeDir, 'script_final.md');
const reviewPath = path.join(episodeDir, 'audits', 'script_final_review.md');

const state = await readScriptFinalReviewState({scriptFinalPath, reviewPath});
const report = {
  ok: state.ok,
  episode_id: episodeId,
  checked_at: new Date().toISOString(),
  script_final_sha256: state.currentHash,
  review_sha256: state.recordedHash,
  issue: state.ok
    ? null
    : state.missingHash
      ? 'script_final_review.md must include a leading script_final_sha256 marker'
      : 'script_final_review.md is stale for current script_final.md',
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
