import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/validate-script-prompt-pack-evidence.mjs <episode_id>');
}

const REQUIRED_EVIDENCE = [
  {
    key: 'input_normalize',
    file: 'script_prompt_pack_input_normalize.md',
    promptFile: '01_input_normalize_prompt.md',
    minChars: 250,
  },
  {
    key: 'template_analysis',
    file: 'script_prompt_pack_template_analysis.md',
    promptFile: '02_template_analysis_prompt.md',
    minChars: 300,
  },
  {
    key: 'plan',
    file: 'script_prompt_pack_plan.md',
    promptFile: '03_plan_prompt.md',
    minChars: 400,
  },
  {
    key: 'draft',
    file: 'script_prompt_pack_draft.md',
    promptFile: 'draft_prompt',
    minChars: 800,
  },
  {
    key: 'image_prompts',
    file: 'script_prompt_pack_image_prompts.md',
    promptFile: '08_image_prompt_prompt.md',
    minChars: 500,
  },
  {
    key: 'yaml',
    file: 'script_prompt_pack_yaml.md',
    promptFile: '10_yaml_prompt.md',
    minChars: 400,
  },
  {
    key: 'final_episode_audit',
    file: 'script_prompt_pack_final_episode_audit.md',
    promptFile: '11_final_episode_audit.md',
    minChars: 250,
    mustMatch: /PASS|FAIL|verdict|判定/,
  },
];

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const readTextIfExists = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const audit = async () => {
  const issues = [];
  const episodeDir = path.join(rootDir, 'script', episodeId);
  const auditsDir = path.join(episodeDir, 'audits');
  const scriptFinalPath = path.join(episodeDir, 'script_final.md');
  const scriptFinalV2Path = path.join(episodeDir, 'script_final_v2.md');

  const finalScript = (await readTextIfExists(scriptFinalPath)) ?? (await readTextIfExists(scriptFinalV2Path));
  if (finalScript === null) {
    pushIssue(issues, 'error', 'missing-script-final', 'Codexレビュー対象の script_final.md がありません', {
      expected: [
        path.relative(rootDir, scriptFinalPath).replaceAll('\\', '/'),
        path.relative(rootDir, scriptFinalV2Path).replaceAll('\\', '/'),
      ],
    });
  } else if (finalScript.trim().length < 800) {
    pushIssue(issues, 'error', 'thin-script-final', 'Codexレビュー対象の script_final.md が薄すぎます', {
      chars: finalScript.trim().length,
      min_chars: 800,
    });
  }

  for (const requirement of REQUIRED_EVIDENCE) {
    const expectedPath = path.join(auditsDir, requirement.file);
    const relExpected = path.relative(rootDir, expectedPath).replaceAll('\\', '/');
    const text = await readTextIfExists(expectedPath);

    if (text === null) {
      pushIssue(issues, 'error', 'missing-prompt-pack-evidence-file', 'Script Prompt Pack の生成証跡ファイルがありません', {
        key: requirement.key,
        file: relExpected,
      });
      continue;
    }

    if (text.trim().length < requirement.minChars) {
      pushIssue(issues, 'error', 'thin-prompt-pack-evidence-file', 'Script Prompt Pack 証跡ファイルの内容が薄すぎます', {
        key: requirement.key,
        file: relExpected,
        chars: text.trim().length,
        min_chars: requirement.minChars,
      });
    }

    const promptFileRecorded =
      requirement.promptFile === 'draft_prompt'
        ? text.includes('04_draft_prompt_yukkuri.md') || text.includes('05_draft_prompt_zundamon.md')
        : text.includes(requirement.promptFile);
    if (!promptFileRecorded) {
      pushIssue(issues, 'error', 'prompt-pack-source-not-recorded', '証跡ファイルに使用した prompt pack ファイル名が記録されていません', {
        key: requirement.key,
        file: relExpected,
        required_prompt_file: requirement.promptFile,
      });
    }

    if (requirement.mustMatch && !requirement.mustMatch.test(text)) {
      pushIssue(issues, 'error', 'prompt-pack-audit-verdict-missing', '監査証跡にPASS/FAIL判断がありません', {
        key: requirement.key,
        file: relExpected,
      });
    }

  }

  const rewritePath = path.join(auditsDir, 'script_prompt_pack_rewrite.md');
  const rewriteText = await readTextIfExists(rewritePath);
  if (rewriteText !== null && !rewriteText.includes('07_rewrite_prompt.md')) {
    pushIssue(issues, 'error', 'rewrite-prompt-pack-source-not-recorded', 'rewrite証跡に07_rewrite_prompt.mdが記録されていません', {
      file: path.relative(rootDir, rewritePath).replaceAll('\\', '/'),
    });
  }

  const report = {
    ok: !issues.some((issue) => issue.level === 'error'),
    episode_id: episodeId,
    checked_at: new Date().toISOString(),
    audits_dir: path.relative(rootDir, auditsDir).replaceAll('\\', '/'),
    required_evidence: REQUIRED_EVIDENCE.map((item) => item.file),
    codex_review_target: finalScript === null ? null : 'script_final.md',
    issues,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
