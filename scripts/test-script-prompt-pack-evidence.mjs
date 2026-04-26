import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, 'script');
const fixtureIds = [
  '__fixture_prompt_pack_evidence_pass',
  '__fixture_prompt_pack_evidence_missing',
  '__fixture_prompt_pack_evidence_codex_self',
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

const writeEvidence = async ({episodeId, reviewer = 'script-prompt-pack-audit', includeEvidence = true}) => {
  const dir = path.join(fixtureRoot, episodeId, 'audits');
  await fs.rm(path.join(fixtureRoot, episodeId), {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});

  if (includeEvidence) {
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_plan.md'),
      evidenceText({
        promptFile: '01_plan_prompt.md',
        body: '企画、構成、表示枠、会話の役割、素材挿入ポイントを段階的に確定した。'.repeat(12),
        verdict: 'PLAN READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_draft.md'),
      evidenceText({
        promptFile: '02_draft_prompt.md',
        body: '初稿本文。ボケ、ツッコミ、誤解訂正、視聴者の疑問、解説の返しをシーンごとに作成した。'.repeat(22),
        verdict: 'DRAFT READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_audit.md'),
      evidenceText({
        promptFile: '03_audit_prompt.md',
        body: '監査観点。文脈破綻、キャラの掛け合い、情報の順番、字幕長、テンプレ適合を確認した。'.repeat(12),
        verdict: '判定: PASS',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_yaml.md'),
      evidenceText({
        promptFile: '05_yaml_prompt.md',
        body: 'YAML変換。script.mdのPASS済み本文からmeta.layout_template、main.asset、sub、dialogueを変換した。'.repeat(12),
        verdict: 'YAML READY',
      }),
      'utf8',
    );
  }

  await fs.writeFile(
    path.join(dir, 'script_generation_audit.json'),
    `${JSON.stringify(
      {
        step: 'script_generation',
        verdict: 'PASS',
        reviewer,
        prompt_pack_evidence: {
          plan: `script/${episodeId}/audits/script_prompt_pack_plan.md`,
          draft: `script/${episodeId}/audits/script_prompt_pack_draft.md`,
          audit: `script/${episodeId}/audits/script_prompt_pack_audit.md`,
          yaml: `script/${episodeId}/audits/script_prompt_pack_yaml.md`,
        },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
};

for (const id of fixtureIds) {
  await fs.rm(path.join(fixtureRoot, id), {recursive: true, force: true});
}

await writeEvidence({episodeId: '__fixture_prompt_pack_evidence_pass'});
await writeEvidence({episodeId: '__fixture_prompt_pack_evidence_missing', includeEvidence: false});
await writeEvidence({episodeId: '__fixture_prompt_pack_evidence_codex_self', reviewer: 'codex-self'});

run('__fixture_prompt_pack_evidence_pass');
run('__fixture_prompt_pack_evidence_missing', {expectFailure: true});
run('__fixture_prompt_pack_evidence_codex_self', {expectFailure: true});

for (const id of fixtureIds) {
  await fs.rm(path.join(fixtureRoot, id), {recursive: true, force: true});
}

console.log(JSON.stringify({ok: true, tested: fixtureIds}, null, 2));
