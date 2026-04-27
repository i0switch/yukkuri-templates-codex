import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'yaml';

const rootDir = process.cwd();
const outDir = 'C:/temp/codex-img-batch-ep960-961';
const episodes = ['ep960-rm-wifi-slow-fix', 'ep961-zm-food-expense-trap'];

const systemBlock = `あなたは画像生成専門アシスタントです。\n\n【厳守】\n- 使うツールは image_gen（gpt-image-1）だけ。\n- shell / PowerShell / Bash / Read / Write / Apply など他のツールは絶対使わない。\n- ファイルコピーや保存先操作はしない。\n- プロジェクトファイルを読みに行かない。\n- 生成が終わったら最終行に [ALL_DONE] 1/1 とだけ出力。\n`;

const translatePrompt = (episodeId, sceneId, rawPrompt) => `${systemBlock}\n【プロンプト】\nCreate a clean Japanese explainer-video insert image for episode ${episodeId}, scene ${sceneId}.\nUse a polished semi-flat editorial illustration style, soft lighting, clear composition, 16:9 landscape.\nKeep the lower 20% visually quiet and uncluttered for subtitles and character overlays.\nRepresent the scene concept with objects, environment, icons, meters, labels, and simple visual metaphors.\nDo not draw any existing anime/game characters, real people, logos, brand names, copyrighted UI, or watermark.\nAvoid dense text, tiny tables, long Japanese sentences, speech bubbles, and dialogue transcription.\nIf Japanese labels are useful, use only very short quoted labels such as "確認", "注意", "手前", "今日" with max 4 Japanese characters each.\n\nSource scene brief in Japanese:\n${rawPrompt}\n\nFinal image must be a single standalone 16:9 PNG-like image, not a collage sheet, not a grid, not multiple variations.\n\n完了したら [ALL_DONE] 1/1 とだけ出力。\n`;

await fs.mkdir(outDir, {recursive: true});
const manifest = [];
for (const episodeId of episodes) {
  const yamlPath = path.join(rootDir, 'script', episodeId, 'script.yaml');
  const script = parse(await fs.readFile(yamlPath, 'utf8'));
  for (const scene of script.scenes) {
    const prompt = scene.visual_asset_plan?.[0]?.imagegen_prompt ?? scene.main?.asset_requirements?.imagegen_prompt;
    if (!prompt) throw new Error(`${episodeId}/${scene.id}: missing imagegen_prompt`);
    const label = `${episodeId}_${scene.id}`;
    const promptPath = path.join(outDir, `prompt_${label}.txt`);
    const logPath = path.join(outDir, `log_${label}.txt`);
    await fs.writeFile(promptPath, translatePrompt(episodeId, scene.id, prompt), 'utf8');
    manifest.push({episodeId, sceneId: scene.id, label, promptPath: promptPath.replaceAll('\\', '/'), logPath: logPath.replaceAll('\\', '/'), dest: `script/${episodeId}/assets/${scene.id}_main.png`});
  }
}
await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({outDir, count: manifest.length}, null, 2));
