import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const layerPath = path.join(rootDir, 'src', 'components', 'VisualEmphasisLayer.tsx');
const rendererPath = path.join(rootDir, 'src', 'components', 'SceneRenderer.tsx');
const autoFitTextPath = path.join(rootDir, 'src', 'components', 'AutoFitText.tsx');
const subtitleBarPath = path.join(rootDir, 'src', 'components', 'SubtitleBar.tsx');
const zundamonPromptPath = path.join(rootDir, '_reference', 'script_prompt_pack', '05_draft_prompt_zundamon.md');

const assertIncludes = (content, needle, label) => {
  if (!content.includes(needle)) {
    throw new Error(`${label} missing expected text: ${needle}`);
  }
};

const assertNotIncludes = (content, needle, label) => {
  if (content.includes(needle)) {
    throw new Error(`${label} includes forbidden text: ${needle}`);
  }
};

const layer = await fs.readFile(layerPath, 'utf8');
const renderer = await fs.readFile(rendererPath, 'utf8');
const autoFitText = await fs.readFile(autoFitTextPath, 'utf8');
const subtitleBar = await fs.readFile(subtitleBarPath, 'utf8');
const zundamonPrompt = await fs.readFile(zundamonPromptPath, 'utf8');

for (const needle of [
  'data-visual-effect="flash-zoom"',
  'data-visual-effect="speed-lines-shake"',
  'ChapterTitleFlash',
  'Sparkles',
  'SpeedLines',
  "['danger', 'surprise', 'number']",
]) {
  assertNotIncludes(layer, needle, 'VisualEmphasisLayer');
}

assertIncludes(layer, 'export const VisualEmphasisLayer: React.FC<Props> = () => null;', 'VisualEmphasisLayer');
assertNotIncludes(renderer, "import {VisualEmphasisLayer} from './VisualEmphasisLayer';", 'SceneRenderer');
assertNotIncludes(renderer, '<VisualEmphasisLayer', 'SceneRenderer');
assertNotIncludes(renderer, 'line.emphasis', 'SceneRenderer');
assertNotIncludes(renderer, 'activeLine?.emphasis', 'SceneRenderer');
assertNotIncludes(renderer, 'se/${line.emphasis.se}', 'SceneRenderer');
assertNotIncludes(renderer, 'transform: `scale(${interpolate', 'SceneRenderer');
assertNotIncludes(renderer, "motionMode === 'warning'", 'SceneRenderer');
assertNotIncludes(renderer, "motionMode === 'reveal'", 'SceneRenderer');

for (const needle of [
  'highlightWords',
  'highlightVariant',
  'HighlightEmphasisKeyframes',
  'subtitle-highlight-emphasis',
  'extractMarkdownHighlights',
]) {
  assertNotIncludes(autoFitText, needle, 'AutoFitText');
  assertNotIncludes(subtitleBar, needle, 'SubtitleBar');
}

for (const needle of [
  '冒頭1番目のセリフは次の5タイプ',
  '1シーン内のずんだもん発話のうち、疑問形',
  '中盤シーン（全体の40〜60%地点）',
  '最後から2番目のシーン',
]) {
  assertIncludes(zundamonPrompt, needle, '05_draft_prompt_zundamon.md');
}

console.log(JSON.stringify({ok: true, checked: ['VisualEmphasisLayer unused', 'subtitle emphasis disabled', 'SceneRenderer static images', '05_draft_prompt_zundamon.md']}, null, 2));
