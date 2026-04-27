import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const layerPath = path.join(rootDir, 'src', 'components', 'VisualEmphasisLayer.tsx');
const rendererPath = path.join(rootDir, 'src', 'components', 'SceneRenderer.tsx');
const zundamonPromptPath = path.join(rootDir, '_reference', 'script_prompt_pack', '05_draft_prompt_zundamon.md');

const assertIncludes = (content, needle, label) => {
  if (!content.includes(needle)) {
    throw new Error(`${label} missing expected text: ${needle}`);
  }
};

const layer = await fs.readFile(layerPath, 'utf8');
const renderer = await fs.readFile(rendererPath, 'utf8');
const zundamonPrompt = await fs.readFile(zundamonPromptPath, 'utf8');

for (const needle of [
  'data-visual-effect="flash-zoom"',
  'data-visual-effect="speed-lines-shake"',
  'ChapterTitleFlash',
  "progress?.style === 'action'",
  "['danger', 'surprise', 'number']",
]) {
  assertIncludes(layer, needle, 'VisualEmphasisLayer');
}

assertIncludes(renderer, "import {VisualEmphasisLayer} from './VisualEmphasisLayer';", 'SceneRenderer');
assertIncludes(renderer, '<VisualEmphasisLayer', 'SceneRenderer');
assertIncludes(renderer, 'sceneGoal={scene.scene_goal}', 'SceneRenderer');

for (const needle of [
  '冒頭1番目のセリフは次の5タイプ',
  '1シーン内のずんだもん発話のうち、疑問形',
  '中盤シーン（全体の40〜60%地点）',
  '最後から2番目のシーン',
]) {
  assertIncludes(zundamonPrompt, needle, '05_draft_prompt_zundamon.md');
}

console.log(JSON.stringify({ok: true, checked: ['VisualEmphasisLayer', 'SceneRenderer', '05_draft_prompt_zundamon.md']}, null, 2));
