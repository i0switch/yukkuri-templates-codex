import React from 'react';
import {measureLineBreaks} from './subtitleLineBreaks';
import {stripVisualEmphasisMarkers} from './subtitleSegments';
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
  style?: React.CSSProperties;
};

type FitResult = {
  fontSize: number;
  lineCount: number;
  text: string;
};

const stripLegacyMarkdownEmphasis = (value: string) => value.replace(/\*\*([^*\n][^*]*?)\*\*/g, '$1');
const stripSubtitleMarkup = (value: string) => stripVisualEmphasisMarkers(stripLegacyMarkdownEmphasis(value));


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
  style,
}) => {
  const plainText = stripSubtitleMarkup(text);
  const fit = resolveFontSize({
    text: plainText,
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

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
        boxSizing: 'border-box',
        ...style,
        overflow: 'hidden',
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
          overflow: 'hidden',
          ...strokeStyle,
          textShadow: resolvedTextShadow,
        }}
      >
        {fit.text}
      </div>
    </div>
  );
};
