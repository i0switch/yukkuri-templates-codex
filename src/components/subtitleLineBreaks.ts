import {loadDefaultJapaneseParser} from 'budoux';

type MeasureOptions = {
  text: string;
  width: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  maxLines?: number;
};

type MeasureResult = {
  text: string;
  lineCount: number;
  height: number;
  fitsMaxLines: boolean;
};

const CJK_CHAR_RE =
  /[\u1100-\u11FF\u2E80-\u2FFF\u3040-\u30FF\u3130-\u318F\u31A0-\u31BF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF01-\uFF60\uFFE0-\uFFE6]/;

const getCharWidthRatio = (char: string) => {
  if (char === ' ') {
    return 0.34;
  }
  if (char === '\t') {
    return 0.68;
  }
  if (CJK_CHAR_RE.test(char)) {
    return 1;
  }
  if (/[A-Z0-9]/.test(char)) {
    return 0.66;
  }
  if (/[a-z]/.test(char)) {
    return 0.58;
  }
  if (/[.,:;!?'`"-]/.test(char)) {
    return 0.34;
  }
  if (/[(){}\[\]<>/\\|]/.test(char)) {
    return 0.48;
  }
  return 0.72;
};

const measureTextWidth = (text: string, fontSize: number, letterSpacing: number) =>
  [...text].reduce((sum, char) => sum + fontSize * getCharWidthRatio(char) + letterSpacing, 0);

const japaneseParser = loadDefaultJapaneseParser();

const parseJapaneseChunks = (paragraph: string) => {
  try {
    const chunks = japaneseParser.parse(paragraph).filter((chunk) => chunk.length > 0);
    return chunks.length > 0 ? chunks : [paragraph];
  } catch {
    return [paragraph];
  }
};

const wrapLongChunkByCharacters = (chunk: string, width: number, fontSize: number, letterSpacing: number) => {
  const availableWidth = Math.max(1, width);
  const lines: string[] = [];
  let current = '';

  for (const char of chunk) {
    const next = current + char;
    if (current && measureTextWidth(next, fontSize, letterSpacing) > availableWidth) {
      lines.push(current);
      current = char;
      continue;
    }
    current = next;
  }

  lines.push(current);
  return lines;
};

const wrapByBudouxChunks = (paragraph: string, width: number, fontSize: number, letterSpacing: number) => {
  const availableWidth = Math.max(1, width);
  const lines: string[] = [];
  let current = '';

  for (const chunk of parseJapaneseChunks(paragraph)) {
    if (measureTextWidth(chunk, fontSize, letterSpacing) > availableWidth) {
      if (current) {
        lines.push(current);
        current = '';
      }
      lines.push(...wrapLongChunkByCharacters(chunk, availableWidth, fontSize, letterSpacing));
      continue;
    }

    const next = current + chunk;
    if (current && measureTextWidth(next, fontSize, letterSpacing) > availableWidth) {
      lines.push(current);
      current = chunk;
      continue;
    }
    current = next;
  }

  lines.push(current);
  return lines;
};

const rebalanceLinePair = (
  previous: string,
  next: string,
  width: number,
  fontSize: number,
  letterSpacing: number,
) => {
  const chunks = parseJapaneseChunks(previous);
  if (chunks.length <= 1) {
    return [previous, next];
  }

  let bestPrevious = previous;
  let bestNext = next;
  let bestScore = Math.abs(measureTextWidth(bestPrevious, fontSize, letterSpacing) - measureTextWidth(bestNext, fontSize, letterSpacing));
  let leftChunks = [...chunks];
  let rightText = next;

  while (leftChunks.length > 1) {
    const moved = leftChunks.pop();
    if (!moved) {
      break;
    }
    const candidatePrevious = leftChunks.join('');
    const candidateNext = moved + rightText;
    if (
      measureTextWidth(candidatePrevious, fontSize, letterSpacing) > width ||
      measureTextWidth(candidateNext, fontSize, letterSpacing) > width
    ) {
      break;
    }

    const score = Math.abs(measureTextWidth(candidatePrevious, fontSize, letterSpacing) - measureTextWidth(candidateNext, fontSize, letterSpacing));
    if (score <= bestScore) {
      bestPrevious = candidatePrevious;
      bestNext = candidateNext;
      bestScore = score;
      rightText = candidateNext;
      continue;
    }
    break;
  }

  return [bestPrevious, bestNext];
};

const rebalanceLines = (lines: string[], width: number, fontSize: number, letterSpacing: number) => {
  if (lines.length < 2) {
    return lines;
  }

  const balanced = [...lines];
  for (let index = balanced.length - 2; index >= 0; index -= 1) {
    const [previous, next] = rebalanceLinePair(
      balanced[index],
      balanced[index + 1],
      width,
      fontSize,
      letterSpacing,
    );
    balanced[index] = previous;
    balanced[index + 1] = next;
  }
  return balanced;
};

export const measureLineBreaks = ({
  text,
  width,
  fontSize,
  lineHeight,
  letterSpacing,
  maxLines,
}: MeasureOptions): MeasureResult => {
  const paragraphs = text.split('\n');
  const lines = paragraphs.flatMap((paragraph) => {
    if (!paragraph) {
      return [''];
    }
    return wrapByBudouxChunks(paragraph, width, fontSize, letterSpacing);
  });
  const balancedLines = rebalanceLines(lines, Math.max(1, width), fontSize, letterSpacing);

  return {
    text: balancedLines.join('\n'),
    lineCount: balancedLines.length,
    height: balancedLines.length * fontSize * lineHeight,
    fitsMaxLines: typeof maxLines !== 'number' || balancedLines.length <= maxLines,
  };
};
