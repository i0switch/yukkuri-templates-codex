import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {loadDefaultJapaneseParser} from 'budoux';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'src', 'components', 'subtitleLineBreaks.ts');
const cacheDir = path.join(rootDir, '.cache', 'subtitle-line-breaks-test');
const compiledPath = path.join(cacheDir, 'subtitleLineBreaks.mjs');

const source = await fs.readFile(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  },
  fileName: sourcePath,
}).outputText;

await fs.mkdir(cacheDir, {recursive: true});
await fs.writeFile(compiledPath, compiled, 'utf8');

const {measureLineBreaks} = await import(`file://${compiledPath.replaceAll('\\', '/')}`);

const sample = '無料体験の出口に有料ゲートがあることを知らないまま登録すると、解約のタイミングで損をする可能性がある。';
const chunks = loadDefaultJapaneseParser().parse(sample);
if (chunks.length < 4 || chunks.join('') !== sample) {
  throw new Error(`BudouX did not return usable Japanese chunks: ${JSON.stringify(chunks)}`);
}

const result = measureLineBreaks({
  text: sample,
  width: 360,
  fontSize: 30,
  lineHeight: 1.25,
  letterSpacing: 0,
  maxLines: 3,
});

const overflowResult = measureLineBreaks({
  text: sample,
  width: 360,
  fontSize: 30,
  lineHeight: 1.25,
  letterSpacing: 0,
  maxLines: 2,
});

const lines = result.text.split('\n');
if (lines.length < 2) {
  throw new Error(`Expected wrapped subtitle lines, got: ${result.text}`);
}
if (lines.join('') !== sample) {
  throw new Error(`Wrapping changed text content: ${result.text}`);
}
if (!result.text.includes('有料ゲートが')) {
  throw new Error(`Expected BudouX chunk to remain intact: ${result.text}`);
}
if (lines.some((line) => line.length <= 1)) {
  throw new Error(`Unexpected one-character subtitle line: ${result.text}`);
}
if (overflowResult.fitsMaxLines) {
  throw new Error(`Expected sample to overflow 2 subtitle lines: ${overflowResult.text}`);
}

for (const [label, text] of [
  ['ad sample', 'アプリ側は広告枠を出して、広告主から収益を得るんだぜ。'],
  ['permission sample', 'そうだぜ。位置情報、連絡先、写真、マイク、通知。'],
]) {
  const scene12Result = measureLineBreaks({
    text,
    width: 1069,
    fontSize: 43,
    lineHeight: 1.22,
    letterSpacing: 0,
    maxLines: 2,
  });
  if (!scene12Result.fitsMaxLines) {
    throw new Error(`Expected ${label} to fit Scene12 2-line subtitle page: ${scene12Result.text}`);
  }
  if (scene12Result.text.split('\n').length > 2) {
    throw new Error(`Expected ${label} to stay within 2 visual lines: ${scene12Result.text}`);
  }
}

console.log(JSON.stringify({ok: true, lines, overflowLines: overflowResult.text.split('\n'), chunks}, null, 2));
