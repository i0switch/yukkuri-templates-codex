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
  const requiredPatterns = [
    {key: 'verdict', pattern: /verdict\s*:\s*(PASS|FAIL)|判定\s*[:：]\s*(PASS|FAIL|合格|不合格)/i},
    {key: 'blocking_issues', pattern: /blocking_issues|重大指摘|ブロッキング/i},
  ];
  for (const requirement of requiredPatterns) {
    if (!requirement.pattern.test(reviewText)) {
      contentIssues.push(`missing ${requirement.key}`);
    }
  }
  if (passVerdictPattern.test(reviewText)) {
    const requiredPassPatterns = [
      {key: 'opening_dialogue_review', pattern: /冒頭(1発話|30秒|15秒|評価|自然|フック)/},
      {key: 'script_final_meta_check', pattern: /メタ混入なし|設計メタ.*なし|設計メモ.*残っていない|設計メモ.*なし|meta leak/i},
      {key: 'explanation_bot_check', pattern: /説明bot|説明ボット|説明臭|説明台詞|解説役.*bot|解説役.*自然/},
      {key: 'watch_reason_check', pattern: /視聴継続|見る理由|続きを見る理由|続き.*理由/},
    ];
    for (const requirement of requiredPassPatterns) {
      if (!requirement.pattern.test(reviewText)) {
        contentIssues.push(`missing ${requirement.key}`);
      }
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
      ? 'script_final_review.md is missing required LLM review fields'
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
