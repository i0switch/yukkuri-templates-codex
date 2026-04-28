import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'src', 'components', 'subtitleSegments.ts');
const lineBreaksSourcePath = path.join(rootDir, 'src', 'components', 'subtitleLineBreaks.ts');
const subtitleLayoutSourcePath = path.join(rootDir, 'src', 'components', 'subtitleLayout.ts');
const cacheDir = path.join(rootDir, '.cache', 'subtitle-segments-test');
const compiledPath = path.join(cacheDir, 'subtitleSegments.mjs');
const lineBreaksCompiledPath = path.join(cacheDir, 'subtitleLineBreaks.mjs');
const subtitleLayoutCompiledPath = path.join(cacheDir, 'subtitleLayout.mjs');

const source = await fs.readFile(sourcePath, 'utf8');
const lineBreaksSource = await fs.readFile(lineBreaksSourcePath, 'utf8');
const subtitleLayoutSource = await fs.readFile(subtitleLayoutSourcePath, 'utf8');
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
await fs.writeFile(subtitleLayoutCompiledPath, compile(subtitleLayoutSource, subtitleLayoutSourcePath), 'utf8');

const {splitSubtitleText, resolveSubtitleSegmentText, stripVisualEmphasisMarkers, extractVisualEmphasisText} = await import(`file://${compiledPath.replaceAll('\\', '/')}`);
const {resolveOverlaySubtitleLayout} = await import(`file://${subtitleLayoutCompiledPath.replaceAll('\\', '/')}`);

const scene12OverlayLayout = resolveOverlaySubtitleLayout({
  rect: {
    w: 1125,
    h: 162,
    paddingX: 72,
    paddingY: 6,
  },
  strokeWidth: 6,
  fallbackPaddingX: 28,
  fallbackPaddingY: 12,
});

const scene12SubtitleOptions = {
  width: scene12OverlayLayout.innerWidth,
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

const markedSample = 'それ、[[マジで！？]] ってなるくらい危ない入口なのだ。';
const strippedMarkedSample = 'それ、マジで！？ ってなるくらい危ない入口なのだ。';
if (stripVisualEmphasisMarkers(markedSample) !== strippedMarkedSample) {
  throw new Error(`Expected visual emphasis markers to be stripped from subtitle text`);
}
if (extractVisualEmphasisText(markedSample) !== 'マジで！？') {
  throw new Error(`Expected marked visual emphasis text to be extracted`);
}
const markedSegments = splitSubtitleText(markedSample, 30);
if (markedSegments.join('').includes('[[') || markedSegments.join('').includes(']]')) {
  throw new Error(`Expected subtitle segments to omit visual emphasis markers: ${JSON.stringify(markedSegments)}`);
}
if (markedSegments.join('') !== strippedMarkedSample) {
  throw new Error(`Visual emphasis marker stripping changed subtitle content: ${JSON.stringify(markedSegments)}`);
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

const screenshotSample = '上がるのは作業速度だぜ。誰の悩みを、何で解決して、どう売るかが無いと売上にはならないんだぜ。';
const screenshotSegments = splitSubtitleText(screenshotSample, scene12SubtitleOptions);
assertTwoLinePages(screenshotSegments, 'screenshotSample');
if (visibleText(screenshotSegments.join('')) !== visibleText(screenshotSample)) {
  throw new Error(`Width split changed screenshotSample content: ${JSON.stringify(screenshotSegments)}`);
}
if (screenshotSegments[0].includes('ならないんだぜ')) {
  throw new Error(`Expected tail phrase to move to next subtitle page: ${JSON.stringify(screenshotSegments)}`);
}

const pagedLine = {text: adSample, start_sec: 10, end_sec: 16};
const firstPage = resolveSubtitleSegmentText({line: pagedLine, currentSec: 10.1, splitOptions: scene12SubtitleOptions});
const secondPage = resolveSubtitleSegmentText({line: pagedLine, currentSec: 14.8, splitOptions: scene12SubtitleOptions});
if (!firstPage || !secondPage || firstPage === secondPage || firstPage.includes('テレビCM')) {
  throw new Error(`Expected width-based subtitle paging: ${JSON.stringify({firstPage, secondPage})}`);
}

const unevenPagedLine = {text: screenshotSample, start_sec: 20, end_sec: 30};
const unevenHalfPage = resolveSubtitleSegmentText({
  line: unevenPagedLine,
  currentSec: 25,
  splitOptions: scene12SubtitleOptions,
});
const unevenLatePage = resolveSubtitleSegmentText({
  line: unevenPagedLine,
  currentSec: 28.7,
  splitOptions: scene12SubtitleOptions,
});
if (unevenHalfPage !== screenshotSegments[0]) {
  throw new Error(
    `Expected longer first subtitle page to remain visible at 50% progress: ${JSON.stringify({
      unevenHalfPage,
      expected: screenshotSegments[0],
      screenshotSegments,
    })}`,
  );
}
if (unevenLatePage !== screenshotSegments[1]) {
  throw new Error(
    `Expected shorter second subtitle page to appear late in the line: ${JSON.stringify({
      unevenLatePage,
      expected: screenshotSegments[1],
      screenshotSegments,
    })}`,
  );
}

console.log(
  JSON.stringify(
    {
      ok: true,
      segments,
      first,
      second,
      markedSegments,
      adSegments,
      permissionsSegments,
      screenshotSegments,
      unevenHalfPage,
      unevenLatePage,
    },
    null,
    2,
  ),
);
