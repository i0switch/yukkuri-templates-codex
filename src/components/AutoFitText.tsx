import React from 'react';
import {measureLineBreaks} from './subtitleLineBreaks';
import {resolveTextStrokeStyle} from './textStrokeStyle';

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
  textStrokeColor?: string;
  textStrokeWidth?: number;
  maxLines?: number;
  highlightWords?: string[];
  highlightVariant?: 'punch' | 'danger' | 'surprise' | 'number' | 'action';
  style?: React.CSSProperties;
};

type FitResult = {
  fontSize: number;
  lineCount: number;
  text: string;
};

const extractMarkdownHighlights = (value: string) => {
  const words: string[] = [];
  const text = value.replace(/\*\*([^*\n][^*]*?)\*\*/g, (_match, word: string) => {
    const trimmed = String(word).trim();
    if (trimmed) {
      words.push(trimmed);
    }
    return String(word);
  });
  return {text, words};
};

const HighlightBounceKeyframes = () => (
  <style>
    {`@keyframes subtitle-highlight-bounce {
      0% { transform: scale(1); }
      45% { transform: scale(1.18); }
      100% { transform: scale(1.08); }
    }`}
  </style>
);

const resolveFontSize = ({
  text,
  width,
  height,
  minFontSize,
  maxFontSize,
  lineHeight,
  letterSpacing,
  maxLines,
}: {
  text: string;
  width: number;
  height: number;
  minFontSize: number;
  maxFontSize: number;
  lineHeight: number;
  letterSpacing: number;
  maxLines?: number;
}): FitResult => {
  const lowerBound = Math.max(6, Math.min(minFontSize, maxFontSize));
  let bestFontSize = lowerBound;
  let bestLineCount = 1;
  let bestText = text;
  let low = lowerBound;
  let high = Math.max(lowerBound, Math.round(maxFontSize));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const measured = measureLineBreaks({
      text,
      width,
      fontSize: mid,
      lineHeight,
      letterSpacing,
      maxLines,
    });

    if (measured.height <= height && measured.fitsMaxLines) {
      bestFontSize = mid;
      bestLineCount = measured.lineCount;
      bestText = measured.text;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestFontSize === lowerBound) {
    const measured = measureLineBreaks({
      text,
      width,
      fontSize: bestFontSize,
      lineHeight,
      letterSpacing,
      maxLines,
    });
    if (measured.height > height && measured.lineCount > 0) {
      const scaled = Math.max(6, Math.floor((height / (measured.lineCount * lineHeight)) * 10) / 10);
      bestFontSize = Math.min(bestFontSize, scaled);
      bestLineCount = measured.lineCount;
      bestText = measureLineBreaks({
        text,
        width,
        fontSize: bestFontSize,
        lineHeight,
        letterSpacing,
        maxLines,
      }).text;
    }
  }

  const finalMeasured = measureLineBreaks({
    text,
    width,
    fontSize: bestFontSize,
    lineHeight,
    letterSpacing,
    maxLines,
  });

  return {
    fontSize: Math.max(6, bestFontSize),
    lineCount: finalMeasured.lineCount || bestLineCount,
    text: finalMeasured.text || bestText,
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
  textStrokeColor,
  textStrokeWidth = 0,
  maxLines,
  highlightWords = [],
  highlightVariant = 'punch',
  style,
}) => {
  const markdown = extractMarkdownHighlights(text);
  const fit = resolveFontSize({
    text: markdown.text,
    width,
    height,
    minFontSize,
    maxFontSize,
    lineHeight,
    letterSpacing,
    maxLines,
  });
  const strokeStyle = resolveTextStrokeStyle({
    color: textStrokeColor,
    width: textStrokeWidth,
  });
  const resolvedTextShadow = [textShadow, strokeStyle.textShadow].filter(Boolean).join(', ') || undefined;
  const highlightStyle: React.CSSProperties = {
    color:
      highlightVariant === 'danger'
        ? '#FF2A2A'
        : highlightVariant === 'surprise'
          ? '#7C3AED'
          : highlightVariant === 'number'
            ? '#F59E0B'
            : highlightVariant === 'action'
              ? '#16A34A'
              : '#FACC15',
    fontSize: '1.12em',
    fontWeight: 900,
    textShadow: '0 2px 10px rgba(0,0,0,0.25)',
    display: 'inline-block',
    animation: 'subtitle-highlight-bounce 300ms ease-out both',
    transformOrigin: 'center bottom',
  };

  const renderHighlightedText = (value: string) => {
    const words = [...new Set([...highlightWords, ...markdown.words].map((word) => word.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
    if (words.length === 0) {
      return value;
    }
    const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    return value.split(pattern).map((part, index) =>
      words.includes(part) ? (
        <span key={`${part}-${index}`} style={highlightStyle}>
          {part}
        </span>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      ),
    );
  };

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
      <HighlightBounceKeyframes />
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
          ...strokeStyle,
          textShadow: resolvedTextShadow,
        }}
      >
        {renderHighlightedText(fit.text)}
      </div>
    </div>
  );
};
