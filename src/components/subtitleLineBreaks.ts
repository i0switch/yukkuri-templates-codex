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

const wrapByCharacters = (paragraph: string, width: number, fontSize: number, letterSpacing: number) => {
  const availableWidth = Math.max(1, width);
  const lines: string[] = [];
  let current = '';

  for (const char of paragraph) {
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
    return wrapByCharacters(paragraph, width, fontSize, letterSpacing);
  });

  return {
    text: lines.join('\n'),
    lineCount: lines.length,
    height: lines.length * fontSize * lineHeight,
    fitsMaxLines: typeof maxLines !== 'number' || lines.length <= maxLines,
  };
};
