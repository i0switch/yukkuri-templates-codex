import React from 'react';

const CJK_CHAR_RE =
  /[\u1100-\u11FF\u2E80-\u2FFF\u3040-\u30FF\u3130-\u318F\u31A0-\u31BF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF01-\uFF60\uFFE0-\uFFE6]/;

type Props = {
  text: string;
  width: number;
  height: number;
  minFontSize?: number;
  maxFontSize: number;
  lineHeight?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'normal' | 'break-word' | 'break-all';
  letterSpacing?: number;
  textShadow?: string;
  style?: React.CSSProperties;
};

type FitResult = {
  fontSize: number;
  lineCount: number;
};

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

const measureLineCount = (
  text: string,
  width: number,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
) => {
  const availableWidth = Math.max(1, width);
  const paragraphs = text.split('\n');
  let lineCount = 0;

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lineCount += 1;
      continue;
    }

    let currentWidth = 0;
    let currentLineHasChars = false;

    for (const char of paragraph) {
      const charWidth = fontSize * getCharWidthRatio(char) + letterSpacing;
      if (currentLineHasChars && currentWidth + charWidth > availableWidth) {
        lineCount += 1;
        currentWidth = charWidth;
        currentLineHasChars = true;
        continue;
      }

      currentWidth += charWidth;
      currentLineHasChars = true;
    }

    lineCount += 1;
  }

  return {
    lineCount,
    height: lineCount * fontSize * lineHeight,
  };
};

const resolveFontSize = ({
  text,
  width,
  height,
  minFontSize,
  maxFontSize,
  lineHeight,
  letterSpacing,
}: {
  text: string;
  width: number;
  height: number;
  minFontSize: number;
  maxFontSize: number;
  lineHeight: number;
  letterSpacing: number;
}): FitResult => {
  const lowerBound = Math.max(6, Math.min(minFontSize, maxFontSize));
  let bestFontSize = lowerBound;
  let bestLineCount = 1;
  let low = lowerBound;
  let high = Math.max(lowerBound, Math.round(maxFontSize));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const measured = measureLineCount(text, width, mid, lineHeight, letterSpacing);

    if (measured.height <= height) {
      bestFontSize = mid;
      bestLineCount = measured.lineCount;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestFontSize === lowerBound) {
    const measured = measureLineCount(text, width, bestFontSize, lineHeight, letterSpacing);
    if (measured.height > height && measured.lineCount > 0) {
      const scaled = Math.max(6, Math.floor((height / (measured.lineCount * lineHeight)) * 10) / 10);
      bestFontSize = Math.min(bestFontSize, scaled);
      bestLineCount = measured.lineCount;
    }
  }

  return {
    fontSize: Math.max(6, bestFontSize),
    lineCount: bestLineCount,
  };
};

export const AutoFitText: React.FC<Props> = ({
  text,
  width,
  height,
  minFontSize = 14,
  maxFontSize,
  lineHeight = 1.25,
  fontFamily,
  fontWeight,
  color,
  textAlign = 'center',
  whiteSpace = 'pre-wrap',
  wordBreak = 'break-all',
  letterSpacing = 0,
  textShadow,
  style,
}) => {
  const fit = resolveFontSize({
    text,
    width,
    height,
    minFontSize,
    maxFontSize,
    lineHeight,
    letterSpacing,
  });

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          fontFamily,
          fontSize: fit.fontSize,
          lineHeight,
          fontWeight,
          color,
          textAlign,
          whiteSpace,
          wordBreak,
          letterSpacing,
          textShadow,
        }}
      >
        {text}
      </div>
    </div>
  );
};
