import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/verify-second-codex-audits.mjs <episode_id>');
}

const REQUIRED_STEPS = [
  'reference_analysis',
  'profile_design',
  'prompt_update',
  'schema_update',
  'quality_audit_update',
  'sample_episode',
  'final_reference_fit',
];

const episodeDir = path.resolve(rootDir, 'script', episodeId);
const auditsDir = path.join(episodeDir, 'audits');

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

const main = async () => {
  const errors = [];
  const warnings = [];
  let files = [];

  try {
    files = await fs.readdir(auditsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      errors.push({
        code: 'audits-dir-missing',
        message: `audits directory is required: ${path.relative(rootDir, auditsDir)}`,
      });
    } else {
      throw error;
    }
  }

  const auditEntries = [];
  for (const fileName of files.filter((file) => file.endsWith('.json'))) {
    const filePath = path.join(auditsDir, fileName);
    try {
      const audit = await readJson(filePath);
      auditEntries.push({fileName, filePath, audit});
    } catch (error) {
      errors.push({
        code: 'audit-json-invalid',
        file: path.relative(rootDir, filePath),
        message: error.message,
      });
    }
  }

  const byStep = new Map();
  for (const entry of auditEntries) {
    const {audit, filePath} = entry;
    const label = path.relative(rootDir, filePath);

    if (typeof audit.step !== 'string' || audit.step.trim() === '') {
      errors.push({code: 'step-missing', file: label, message: 'audit.step is required'});
      continue;
    }

    if (!byStep.has(audit.step)) {
      byStep.set(audit.step, []);
    }
    byStep.get(audit.step).push(entry);

    if (audit.verdict !== 'PASS') {
      errors.push({
        code: 'audit-not-pass',
        file: label,
        step: audit.step,
        message: `verdict must be PASS, got ${audit.verdict ?? '<missing>'}`,
      });
    }

    if (audit.reviewer !== 'second-codex') {
      errors.push({
        code: 'reviewer-invalid',
        file: label,
        step: audit.step,
        message: 'reviewer must be second-codex',
      });
    }

    if (!Array.isArray(audit.blocking_issues)) {
      errors.push({code: 'blocking-issues-invalid', file: label, step: audit.step, message: 'blocking_issues must be an array'});
    } else if (audit.blocking_issues.length > 0) {
      errors.push({code: 'blocking-issues-present', file: label, step: audit.step, message: 'blocking_issues must be empty for PASS'});
    }

    if (!Array.isArray(audit.required_fixes)) {
      errors.push({code: 'required-fixes-invalid', file: label, step: audit.step, message: 'required_fixes must be an array'});
    } else if (audit.required_fixes.length > 0) {
      errors.push({code: 'required-fixes-present', file: label, step: audit.step, message: 'required_fixes must be empty for PASS'});
    }

    if (typeof audit.checked_at !== 'string' || Number.isNaN(Date.parse(audit.checked_at))) {
      errors.push({code: 'checked-at-invalid', file: label, step: audit.step, message: 'checked_at must be an ISO timestamp'});
    }
  }

  for (const step of REQUIRED_STEPS) {
    if (!byStep.has(step)) {
      errors.push({
        code: 'required-step-missing',
        step,
        message: `missing second Codex audit for step: ${step}`,
      });
    } else if (byStep.get(step).length > 1) {
      warnings.push({
        code: 'duplicate-step-audit',
        step,
        files: byStep.get(step).map((entry) => path.relative(rootDir, entry.filePath)),
      });
    }
  }

  const report = {
    ok: errors.length === 0,
    episode_id: episodeId,
    checked_at: new Date().toISOString(),
    audits_dir: path.relative(rootDir, auditsDir),
    required_steps: REQUIRED_STEPS,
    found_steps: [...byStep.keys()].sort(),
    errors,
    warnings,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await main();
