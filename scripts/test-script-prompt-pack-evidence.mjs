import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, 'script');
const fixtureIds = [
  '__fixture_prompt_pack_evidence_pass',
  '__fixture_prompt_pack_evidence_missing',
  '__fixture_manual_intake_pass',
  '__fixture_manual_intake_no_rights',
];

const run = (episodeId, {expectFailure = false} = {}) => {
  const result = spawnSync(process.execPath, ['scripts/validate-script-prompt-pack-evidence.mjs', episodeId], {
    cwd: rootDir,
    encoding: 'utf8',
    windowsHide: true,
  });

  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: ${episodeId}\n${result.stdout}`);
    }
    return;
  }

  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: ${episodeId}\n${result.stdout}\n${result.stderr}`);
  }
};

const evidenceText = ({promptFile, body, verdict = ''}) => `# Script Prompt Pack Evidence

- prompt_file: _reference/script_prompt_pack/${promptFile}
- episode: fixture
- input_conditions: theme, template, duration, character pair were fixed before generation.

## Output

${body}

## Verdict

${verdict}

この証跡はテスト用だが、実運用ではここにLLMへ渡した入力、生成結果、監査観点、修正差分を残す。
.analysis の一時スクリプトやセリフ配列直書きではなく、prompt pack の段階出力を保存する。
`;

const writeEvidence = async ({episodeId, includeEvidence = true}) => {
  const dir = path.join(fixtureRoot, episodeId, 'audits');
  await fs.rm(path.join(fixtureRoot, episodeId), {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});

  await fs.writeFile(
    path.join(fixtureRoot, episodeId, 'script_final.md'),
    '# script_final\n\n霊夢「短くてもLLMレビュー対象の台本だよ」\n魔理沙「文字数ではなくレビューで判断するぜ」\n',
    'utf8',
  );

  if (includeEvidence) {
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_input_normalize.md'),
      evidenceText({
        promptFile: '01_input_normalize_prompt.md',
        body: '入力条件を整理した。',
        verdict: 'INPUT READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_template_analysis.md'),
      evidenceText({
        promptFile: '02_template_analysis_prompt.md',
        body: 'テンプレートを確認した。',
        verdict: 'TEMPLATE READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_plan.md'),
      evidenceText({
        promptFile: '03_plan_prompt.md',
        body: '企画と構成を決めた。',
        verdict: 'PLAN READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_draft.md'),
      evidenceText({
        promptFile: '04_draft_prompt_yukkuri.md',
        body: '初稿本文を作成した。',
        verdict: 'DRAFT READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_image_prompts.md'),
      evidenceText({
        promptFile: '08_image_prompt_prompt.md',
        body: '画像プロンプトを作成した。',
        verdict: 'IMAGE PROMPTS READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_yaml.md'),
      evidenceText({
        promptFile: '10_yaml_prompt.md',
        body: 'YAMLへ変換した。',
        verdict: 'YAML READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_final_episode_audit.md'),
      evidenceText({
        promptFile: '11_final_episode_audit.md',
        body: '最終確認をした。',
        verdict: 'verdict: PASS',
      }),
      'utf8',
    );
  }
};

const writeManualIntake = async ({episodeId, rightsConfirmed = true}) => {
  const episodeDir = path.join(fixtureRoot, episodeId);
  const auditsDir = path.join(episodeDir, 'audits');
  await fs.rm(episodeDir, {recursive: true, force: true});
  await fs.mkdir(auditsDir, {recursive: true});
  await fs.writeFile(
    path.join(episodeDir, 'source_manual_script.md'),
    '# source_manual_script\n\n' + 'ユーザーが手書きした台本素材。ここからAIが動画用の構成、自然会話、script_final.mdを整える。'.repeat(8),
    'utf8',
  );
  await fs.writeFile(
    path.join(episodeDir, 'script_final.md'),
    '# script_final\n\n' + '霊夢「手書き台本を元に自然な会話へ整えた版だよ」\n魔理沙「画像はユーザー生成で受け入れる契約にするぜ」\n'.repeat(40),
    'utf8',
  );
  await fs.writeFile(
    path.join(auditsDir, 'manual_intake.md'),
    `# manual_intake

mode: hybrid_user_script
source_script: source_manual_script.md
script_author: user
image_source: user_generated
rights_confirmed: ${rightsConfirmed}
notes: Codex / Claude Code のどちらでも同じ成果物構造で進める。
`,
    'utf8',
  );
};

for (const id of fixtureIds) {
  await fs.rm(path.join(fixtureRoot, id), {recursive: true, force: true});
}

await writeEvidence({episodeId: '__fixture_prompt_pack_evidence_pass'});
await writeEvidence({episodeId: '__fixture_prompt_pack_evidence_missing', includeEvidence: false});
await writeManualIntake({episodeId: '__fixture_manual_intake_pass'});
await writeManualIntake({episodeId: '__fixture_manual_intake_no_rights', rightsConfirmed: false});

run('__fixture_prompt_pack_evidence_pass');
run('__fixture_prompt_pack_evidence_missing', {expectFailure: true});
run('__fixture_manual_intake_pass');
run('__fixture_manual_intake_no_rights', {expectFailure: true});

for (const id of fixtureIds) {
  await fs.rm(path.join(fixtureRoot, id), {recursive: true, force: true});
}

console.log(JSON.stringify({ok: true, tested: fixtureIds}, null, 2));
