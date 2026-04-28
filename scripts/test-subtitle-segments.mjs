import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'src', 'components', 'subtitleSegments.ts');
const lineBreaksSourcePath = path.join(rootDir, 'src', 'components', 'subtitleLineBreaks.ts');
const cacheDir = path.join(rootDir, '.cache', 'subtitle-segments-test');
const compiledPath = path.join(cacheDir, 'subtitleSegments.mjs');
const lineBreaksCompiledPath = path.join(cacheDir, 'subtitleLineBreaks.mjs');

const source = await fs.readFile(sourcePath, 'utf8');
const lineBreaksSource = await fs.readFile(lineBreaksSourcePath, 'utf8');
const compile = (contents, fileName) => ts.transpileModule(contents, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  },
  fileName,
}).outputText;
const compiled = compile(source, sourcePath).replace(
  "from './subtitleLineBreaks'",
  "from './subtitleLineBreaks.mjs'",
);
const lineBreaksCompiled = compile(lineBreaksSource, lineBreaksSourcePath);

await fs.mkdir(cacheDir, {recursive: true});
await fs.writeFile(lineBreaksCompiledPath, lineBreaksCompiled, 'utf8');
await fs.writeFile(compiledPath, compiled, 'utf8');

const {splitSubtitleText, resolveSubtitleSegmentText} = await import(`file://${compiledPath.replaceAll('\\', '/')}`);

const scene12SubtitleOptions = {
  width: 1069,
  fontSize: 43,
  lineHeight: 1.22,
  letterSpacing: 0,
  maxLines: 2,
};

const visibleText = (value) => value.replace(/\n/g, '').replace(/\s+/g, '');

const assertTwoLinePages = (segments, label) => {
  if (segments.length < 2) {
    throw new Error(`Expected ${label} to split into subtitle pages, got ${JSON.stringify(segments)}`);
  }
  for (const segment of segments) {
    const lineCount = segment.split('\n').length;
    if (lineCount > 2) {
      throw new Error(`Expected ${label} page to stay within 2 lines, got ${lineCount}: ${JSON.stringify(segment)}`);
    }
  }
};

const sample =
  'スマホの通知を少し見るだけのつもりでも、集中が切れたあとに元の作業へ戻るまで時間がかかるから、入口を先に閉じるのが大事なのだ。';
const segments = splitSubtitleText(sample, 30);

if (segments.length < 2) {
  throw new Error(`Expected long subtitle to split, got ${JSON.stringify(segments)}`);
}
if (segments.join('') !== sample) {
  throw new Error(`Split changed subtitle content: ${JSON.stringify(segments)}`);
}
if (segments.some((segment) => [...segment.replace(/\s+/g, '')].length > 30)) {
  throw new Error(`Segment exceeded max chars: ${JSON.stringify(segments)}`);
}

const line = {text: sample, start_sec: 10, end_sec: 16};
const first = resolveSubtitleSegmentText({line, currentSec: 10.1, maxChars: 30});
const second = resolveSubtitleSegmentText({line, currentSec: 13.2, maxChars: 30});
if (!first || !second || first === second) {
  throw new Error(`Expected same line to page through subtitle segments: ${JSON.stringify({first, second})}`);
}

const adSample = 'アプリ側は広告枠を出して、広告主から収益を得るんだぜ。テレビCMのスマホ版みたいなものだぜ。';
const adSegments = splitSubtitleText(adSample, scene12SubtitleOptions);
assertTwoLinePages(adSegments, 'adSample');
if (visibleText(adSegments.join('')) !== visibleText(adSample)) {
  throw new Error(`Width split changed adSample content: ${JSON.stringify(adSegments)}`);
}
if (adSegments[0].includes('テレビCM')) {
  throw new Error(`Expected second sentence to move to next subtitle page: ${JSON.stringify(adSegments)}`);
}
if (!adSegments.slice(1).join('').includes('テレビCMのスマホ版みたいなものだぜ。')) {
  throw new Error(`Expected TV-CM sentence in later subtitle page: ${JSON.stringify(adSegments)}`);
}

const permissionsSample = 'そうだぜ。位置情報、連絡先、写真、マイク、通知。このあたりは特に確認したいぜ。';
const permissionsSegments = splitSubtitleText(permissionsSample, scene12SubtitleOptions);
assertTwoLinePages(permissionsSegments, 'permissionsSample');
if (visibleText(permissionsSegments.join('')) !== visibleText(permissionsSample)) {
  throw new Error(`Width split changed permissionsSample content: ${JSON.stringify(permissionsSegments)}`);
}

const pagedLine = {text: adSample, start_sec: 10, end_sec: 16};
const firstPage = resolveSubtitleSegmentText({line: pagedLine, currentSec: 10.1, splitOptions: scene12SubtitleOptions});
const secondPage = resolveSubtitleSegmentText({line: pagedLine, currentSec: 13.2, splitOptions: scene12SubtitleOptions});
if (!firstPage || !secondPage || firstPage === secondPage || firstPage.includes('テレビCM')) {
  throw new Error(`Expected width-based subtitle paging: ${JSON.stringify({firstPage, secondPage})}`);
}

console.log(JSON.stringify({ok: true, segments, first, second, adSegments, permissionsSegments}, null, 2));
