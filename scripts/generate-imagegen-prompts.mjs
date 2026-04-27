/**
 * YAML の visual_asset_plan[0].imagegen_prompt を抽出し、
 * codex-imagegen 用プロンプトファイルを生成する
 * Usage: node scripts/generate-imagegen-prompts.mjs <episode_id>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';

const CODEX_HEADER = `あなたは画像生成専門アシスタントです。

【厳守】
- 使うツールは image_gen（gpt-image-1）だけ。
- shell / PowerShell / Bash / Read / Write / Apply など他のツールは絶対使わない。
- ファイルコピーや保存先操作はしない。生成画像はCodexが自動で \`~/.codex/generated_images/{session_id}/\` に保存するので、それで完了。
- プロジェクトファイルを読みに行かない。
- 生成が終わったら最終行に \`[ALL_DONE] 1/1\` とだけ出力。

【プロンプト】
`;

const episodeId = process.argv[2];
if (!episodeId) {
  console.error('Usage: node generate-imagegen-prompts.mjs <episode_id>');
  process.exit(1);
}

const rootDir = path.join(import.meta.dirname, '..');
const yamlPath = path.join(rootDir, 'script', episodeId, 'script.yaml');
const outDir = `C:/temp/codex-img-${episodeId}`;

const auditResult = spawnSync(process.execPath, ['scripts/audit-image-prompts.mjs', episodeId], {
  cwd: rootDir,
  encoding: 'utf8',
  windowsHide: true,
});

if (auditResult.error) {
  throw auditResult.error;
}

const jsonStart = auditResult.stdout.indexOf('{');
if (jsonStart === -1) {
  throw new Error(`image prompt audit did not return JSON:\n${auditResult.stdout}\n${auditResult.stderr}`);
}

const auditReport = JSON.parse(auditResult.stdout.slice(jsonStart));
if (auditReport.ok !== true) {
  throw new Error(
    [
      `Refusing to generate Codex imagegen prompt files for ${episodeId}.`,
      'audit:image-prompts reported errors; fix imagegen_prompt first.',
      JSON.stringify(auditReport.issues ?? [], null, 2),
    ].join('\n'),
  );
}

const yamlText = await fs.readFile(yamlPath, 'utf8');
const data = parse(yamlText);

await fs.mkdir(outDir, {recursive: true});

const jobs = [];
for (const scene of data.scenes) {
  const plan = scene.visual_asset_plan?.[0];
  if (!plan?.imagegen_prompt) {
    console.warn(`[WARN] ${scene.id}: no imagegen_prompt, skipping`);
    continue;
  }
  const promptFile = path.join(outDir, `prompt_${scene.id}.txt`);
  const content = CODEX_HEADER + plan.imagegen_prompt + '\n\n完了したら `[ALL_DONE] 1/1` とだけ出力。\n';
  await fs.writeFile(promptFile, content, 'utf8');
  jobs.push({sceneId: scene.id, promptFile, logFile: path.join(outDir, `log_${scene.id}.txt`)});
  console.log(`Created: ${promptFile}`);
}

// Print the generated job list for the caller
console.log('\n=== JOBS ===');
for (const j of jobs) {
  console.log(JSON.stringify(j));
}
console.log(`Total: ${jobs.length} scenes`);
