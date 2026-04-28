import path from 'node:path';
import fs from 'node:fs/promises';
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
let reviewText = '';
try {
  reviewText = await fs.readFile(reviewPath, 'utf8');
} catch {
  reviewText = '';
}

const contentIssues = [];
if (state.ok) {
  const failVerdictPattern = /verdict\s*:\s*FAIL|判定\s*[:：]\s*(FAIL|不合格)/i;
  const passVerdictPattern = /verdict\s*:\s*PASS|判定\s*[:：]\s*(PASS|合格)/i;
  if (failVerdictPattern.test(reviewText)) {
    contentIssues.push('review verdict is FAIL');
  }
  if (!passVerdictPattern.test(reviewText) && !failVerdictPattern.test(reviewText)) {
    contentIssues.push('missing verdict');
  }
  const requiredPatterns = [
    {key: 'blocking_issues', pattern: /blocking_issues|重大指摘|ブロッキング/i},
  ];
  for (const requirement of requiredPatterns) {
    if (!requirement.pattern.test(reviewText)) {
      contentIssues.push(`missing ${requirement.key}`);
    }
  }
}

const ok = state.ok && contentIssues.length === 0;
const report = {
  ok,
  episode_id: episodeId,
  checked_at: new Date().toISOString(),
  script_final_sha256: state.currentHash,
  review_sha256: state.recordedHash,
  issue: !state.ok
    ? state.missingHash
      ? 'script_final_review.md must include a leading script_final_sha256 marker'
      : 'script_final_review.md is stale for current script_final.md'
    : contentIssues.length > 0
      ? 'script_final_review.md must have a fresh PASS verdict and blocking_issues field'
      : null,
  content_issues: contentIssues,
  legacy_hash_issue: state.ok
    ? null
    : state.missingHash
      ? 'script_final_review.md must include a leading script_final_sha256 marker'
      : 'script_final_review.md is stale for current script_final.md',
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
