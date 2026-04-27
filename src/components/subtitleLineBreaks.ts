import {loadDefaultJapaneseParser} from 'budoux';

type LineBreakMode = 'normal' | 'budoux';

type MeasureOptions = {
  text: string;
  width: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  mode: LineBreakMode;
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
const CLOSING_PUNCTUATION_RE = /^[、。，．！？!?）)]/;
const OPENING_PUNCTUATION_RE = /[（(「『【\[]$/;

const parser = loadDefaultJapaneseParser();

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

const normalizePhrases = (phrases: string[]) => {
  const normalized: string[] = [];

  for (const phrase of phrases) {
    if (!phrase) {
      continue;
    }

    if (normalized.length > 0 && CLOSING_PUNCTUATION_RE.test(phrase)) {
      normalized[normalized.length - 1] += phrase;
      continue;
    }

    if (normalized.length > 0 && OPENING_PUNCTUATION_RE.test(normalized[normalized.length - 1])) {
      normalized[normalized.length - 1] += phrase;
      continue;
    }

    normalized.push(phrase);
  }

  return normalized.length > 0 ? normalized : phrases;
};

const splitLongPhrase = (phrase: string, availableWidth: number, fontSize: number, letterSpacing: number) => {
  const chunks: string[] = [];
  let current = '';

  for (const char of phrase) {
    const next = current + char;
    if (current && measureTextWidth(next, fontSize, letterSpacing) > availableWidth) {
      chunks.push(current);
      current = char;
      continue;
    }
    current = next;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [phrase];
};

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

const wrapByBudoux = (paragraph: string, width: number, fontSize: number, letterSpacing: number) => {
  const availableWidth = Math.max(1, width);
  const phrases = normalizePhrases(parser.parse(paragraph));
  const lines: string[] = [];
  let current = '';

  for (const phrase of phrases) {
    const phraseParts =
      measureTextWidth(phrase, fontSize, letterSpacing) > availableWidth
        ? splitLongPhrase(phrase, availableWidth, fontSize, letterSpacing)
        : [phrase];

    for (const part of phraseParts) {
      const next = current + part;
      if (current && measureTextWidth(next, fontSize, letterSpacing) > availableWidth) {
        lines.push(current);
        current = part;
        continue;
      }
      current = next;
    }
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
  mode,
  maxLines,
}: MeasureOptions): MeasureResult => {
  const paragraphs = text.split('\n');
  const lines = paragraphs.flatMap((paragraph) => {
    if (!paragraph) {
      return [''];
    }
    return mode === 'budoux'
      ? wrapByBudoux(paragraph, width, fontSize, letterSpacing)
      : wrapByCharacters(paragraph, width, fontSize, letterSpacing);
  });

  return {
    text: lines.join('\n'),
    lineCount: lines.length,
    height: lines.length * fontSize * lineHeight,
    fitsMaxLines: typeof maxLines !== 'number' || lines.length <= maxLines,
  };
};

export type {LineBreakMode};
