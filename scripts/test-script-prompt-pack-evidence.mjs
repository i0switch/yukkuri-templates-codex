import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, 'script');
const fixtureIds = [
  '__fixture_prompt_pack_evidence_pass',
  '__fixture_prompt_pack_evidence_missing',
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
      path.join(dir, 'script_prompt_pack_input_normalize.md'),
      evidenceText({
        promptFile: '01_input_normalize_prompt.md',
        body: '入力条件、テーマ、尺、キャラペア、テンプレートを整理した。'.repeat(14),
        verdict: 'INPUT READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_template_analysis.md'),
      evidenceText({
        promptFile: '02_template_analysis_prompt.md',
        body: 'Scene02のmain/sub/subtitle/avoid areaを読み、枠利用を確定した。'.repeat(14),
        verdict: 'TEMPLATE READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_plan.md'),
      evidenceText({
        promptFile: '03_plan_prompt.md',
        body: '企画、構成、表示枠、会話の役割、素材挿入ポイントを段階的に確定した。'.repeat(12),
        verdict: 'PLAN READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_draft.md'),
      evidenceText({
        promptFile: '04_draft_prompt_yukkuri.md',
        body: '初稿本文。ボケ、ツッコミ、誤解訂正、視聴者の疑問、解説の返しをシーンごとに作成した。'.repeat(22),
        verdict: 'DRAFT READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_image_prompts.md'),
      evidenceText({
        promptFile: '08_image_prompt_prompt.md',
        body: '画像プロンプト。script_final.mdの対象シーン全文を使い、字幕とは別の16:9挿入画像として生成する直投げpromptを作成した。'.repeat(16),
        verdict: 'IMAGE PROMPTS READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_yaml.md'),
      evidenceText({
        promptFile: '10_yaml_prompt.md',
        body: 'YAML変換。script_final.mdの本文からmeta.layout_template、main.asset、sub、dialogueを変換した。'.repeat(12),
        verdict: 'YAML READY',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(dir, 'script_prompt_pack_final_episode_audit.md'),
      evidenceText({
        promptFile: '11_final_episode_audit.md',
        body: '最終確認。script_final.md、script.yaml、画像プロンプト、meta、証跡が揃っていることを確認した。'.repeat(10),
        verdict: 'verdict: PASS',
      }),
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureRoot, episodeId, 'script_final.md'),
      '# script_final\n\n' + '霊夢「自然な発話単位で進む最終台本です」\n魔理沙「Codexレビュー対象はこのファイルだけです」\n'.repeat(40),
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
          input_normalize: `script/${episodeId}/audits/script_prompt_pack_input_normalize.md`,
          template_analysis: `script/${episodeId}/audits/script_prompt_pack_template_analysis.md`,
          plan: `script/${episodeId}/audits/script_prompt_pack_plan.md`,
          draft: `script/${episodeId}/audits/script_prompt_pack_draft.md`,
          image_prompts: `script/${episodeId}/audits/script_prompt_pack_image_prompts.md`,
          yaml: `script/${episodeId}/audits/script_prompt_pack_yaml.md`,
          final_episode_audit: `script/${episodeId}/audits/script_prompt_pack_final_episode_audit.md`,
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

run('__fixture_prompt_pack_evidence_pass');
run('__fixture_prompt_pack_evidence_missing', {expectFailure: true});

for (const id of fixtureIds) {
  await fs.rm(path.join(fixtureRoot, id), {recursive: true, force: true});
}

console.log(JSON.stringify({ok: true, tested: fixtureIds}, null, 2));
