import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parseDocument} from 'yaml';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/sync-script-markdown-from-yaml.mjs <episode_id>');
}

const episodeDir = path.join(rootDir, 'script', episodeId);
const scriptPath = path.join(episodeDir, 'script.yaml');
const script = parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();

const speakerName = (speaker) => {
  const pair = script.meta?.pair;
  if (pair === 'ZM') {
    return speaker === 'left' ? 'ずんだもん' : 'めたん';
  }
  return speaker === 'left' ? '霊夢' : '魔理沙';
};

const promptHash = (value) => createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');
const generatedFromYaml = ['script', 'yaml'].join('.');

const sceneMarkdown = (scene) => {
  const lines = (scene.dialogue ?? []).map((line) => `${speakerName(line.speaker)}「${line.text ?? ''}」`).join('\n');
  const subContent =
    scene.sub?.kind === 'bullets'
      ? (scene.sub.items ?? []).join(' / ')
      : scene.sub?.kind === 'text'
        ? scene.sub.text
        : 'subなし';
  return `## ${scene.id} ${scene.title_text ?? scene.scene_goal ?? scene.id}

- role: ${scene.role ?? ''}
- scene_format: ${scene.scene_format ?? ''}
- scene_goal: ${scene.scene_goal ?? ''}
- viewer_question: ${scene.viewer_question ?? ''}
- viewer_misunderstanding: ${scene.viewer_misunderstanding ?? ''}
- reaction_level: ${scene.reaction_level ?? ''}
- number_or_example: ${scene.number_or_example ?? ''}
- main_content: ${scene.visual_role ?? scene.main?.asset ?? ''}
- sub_content: ${subContent ?? ''}
- image_insert_point: main
- mini_punchline: ${scene.mini_punchline ?? ''}
- セルフ監査: YAML同期後のため、script_final_review.md は再確認が必要。

${lines}

visual_asset_plan:
${(scene.visual_asset_plan ?? [])
  .map((plan) => `  - slot: ${plan.slot ?? 'main'}\n    purpose: ${plan.purpose ?? ''}\n    adoption_reason: ${plan.adoption_reason ?? ''}`)
  .join('\n')}
`;
};

const markdown = `<!-- scene_format: YAMLから再構築 / ${script.scenes?.length ?? 0} scenes / ${(script.scenes ?? []).reduce((sum, scene) => sum + (scene.dialogue?.length ?? 0), 0)} dialogue lines -->
<!-- viewer_misunderstanding: YAML同期後。必要なら人間/Codexレビューで最新化する -->
<!-- reaction_level: YAML同期後。必要なら人間/Codexレビューで最新化する -->
<!-- mini_punchline: YAML同期後。必要なら人間/Codexレビューで最新化する -->
<!-- number_or_example: YAML同期後。必要なら人間/Codexレビューで最新化する -->
<!-- セルフ監査: script.yaml から同期。script_final_review.md は stale 扱い。 -->
# ${script.meta?.title ?? episodeId}

## メタ
- episode_id: ${script.meta?.id ?? episodeId}
- layout_template: ${script.meta?.layout_template ?? ''}
- pair: ${script.meta?.pair ?? ''}
- target_duration: ${script.meta?.target_duration_sec ?? ''}秒
- target_dialogue_count: ${(script.scenes ?? []).reduce((sum, scene) => sum + (scene.dialogue?.length ?? 0), 0)}

${(script.scenes ?? []).map(sceneMarkdown).join('\n')}
`;

const promptEntries = {};
const imagePromptSections = [];
for (const scene of script.scenes ?? []) {
  for (const plan of scene.visual_asset_plan ?? []) {
    const slot = plan.slot ?? 'main';
    const ref = `${scene.id}.${slot}`;
    const prompt = plan.imagegen_prompt ?? '';
    if (!prompt) {
      continue;
    }
    promptEntries[ref] = {
      ref,
      scene_id: scene.id,
      slot,
      asset: scene[slot]?.asset ?? scene.main?.asset ?? '',
      imagegen_prompt: prompt,
      prompt_sha256: promptHash(prompt),
    };
    imagePromptSections.push(`## ${ref}\n\n保存先: ${promptEntries[ref].asset}\n\n\`\`\`text\n${prompt}\n\`\`\``);
  }
}

await fs.writeFile(path.join(episodeDir, 'script_final.md'), markdown, 'utf8');
await fs.writeFile(path.join(episodeDir, 'script_draft.md'), markdown, 'utf8');
await fs.writeFile(
  path.join(episodeDir, 'image_prompts.json'),
  `${JSON.stringify({version: 1, generated_from: generatedFromYaml, prompts: promptEntries}, null, 2)}\n`,
  'utf8',
);
await fs.writeFile(path.join(episodeDir, 'image_prompt_v2.md'), `# image_prompt_v2\n\n${imagePromptSections.join('\n\n')}\n`, 'utf8');

const reviewPath = path.join(episodeDir, 'audits', 'script_final_review.md');
try {
  const review = await fs.readFile(reviewPath, 'utf8');
  const staleLine = '<!-- script_final_sha256: STALE_AFTER_SYNC -->';
  const nextReview = /script_final_sha256:/i.test(review)
    ? review.replace(/<!--\s*script_final_sha256:\s*[^>]+-->/i, staleLine)
    : `${staleLine}\n${review}`;
  await fs.writeFile(reviewPath, nextReview, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

console.log(JSON.stringify({ok: true, episode_id: episodeId, prompts: Object.keys(promptEntries).length}, null, 2));
