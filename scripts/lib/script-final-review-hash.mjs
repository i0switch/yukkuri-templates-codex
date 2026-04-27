import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const scriptFinalSha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

export const reviewHashFromText = (text) => {
  const match = String(text ?? '').match(/script_final_sha256:\s*([a-f0-9]{64}|STALE_AFTER_SYNC)/i);
  return match ? match[1] : null;
};

export const readScriptFinalReviewState = async ({scriptFinalPath, reviewPath}) => {
  const scriptFinal = await fs.readFile(scriptFinalPath, 'utf8');
  const review = await fs.readFile(reviewPath, 'utf8');
  const currentHash = scriptFinalSha256(scriptFinal);
  const recordedHash = reviewHashFromText(review);
  return {
    currentHash,
    recordedHash,
    ok: recordedHash === currentHash,
    stale: recordedHash === 'STALE_AFTER_SYNC' || (recordedHash !== null && recordedHash !== currentHash),
    missingHash: recordedHash === null,
  };
};
