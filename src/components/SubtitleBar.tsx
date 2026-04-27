import React from 'react';
import {FONTS, FS, TEXT_STROKE} from '../design-tokens';
import {measureLineBreaks, type LineBreakMode} from './subtitleLineBreaks';
import {resolveTextStrokeStyle} from './textStrokeStyle';

type Props = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  textAlign?: 'left' | 'center';
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  lineBreakMode?: LineBreakMode;
  maxLines?: number;
  highlightWords?: string[];
  highlightVariant?: 'punch' | 'danger' | 'surprise' | 'number' | 'action';
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

export const SubtitleBar: React.FC<Props> = ({
  text,
  x,
  y,
  width,
  height,
  bg = '#FFFFFF',
  borderColor,
  borderWidth = 0,
  borderRadius = 8,
  textColor = '#1A1A1A',
  textAlign = 'center',
  fontSize = FS.subtitle,
  fontWeight = 500,
  fontFamily = FONTS.subtitle,
  textStrokeColor = TEXT_STROKE.subtitle.color,
  textStrokeWidth = TEXT_STROKE.subtitle.width,
  lineBreakMode = 'normal',
  maxLines,
  highlightWords = [],
  highlightVariant = 'punch',
}) => {
  const markdown = extractMarkdownHighlights(text);
  const strokeStyle = resolveTextStrokeStyle({
    color: textStrokeColor,
    width: textStrokeWidth,
  });
  const renderedText = measureLineBreaks({
    text: markdown.text,
    width: Math.max(1, width - 80),
    fontSize,
    lineHeight: 1.22,
    letterSpacing: 0,
    mode: lineBreakMode,
    maxLines,
  }).text;
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
  const words = [...new Set([...highlightWords, ...markdown.words].map((word) => word.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  const pattern =
    words.length > 0
      ? new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
      : null;
  const highlightedText = pattern
    ? renderedText.split(pattern).map((part, index) =>
        words.includes(part) ? (
          <span key={`${part}-${index}`} style={highlightStyle}>
            {part}
          </span>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        ),
      )
    : renderedText;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: bg,
        border: borderColor ? `${borderWidth}px solid ${borderColor}` : 'none',
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'center' ? 'center' : 'flex-start',
        padding: '0 40px',
        fontFamily,
        fontSize,
        fontWeight,
        color: textColor,
        lineHeight: 1.22,
        boxSizing: 'border-box',
        textAlign,
        whiteSpace: 'pre-wrap',
        wordBreak: lineBreakMode === 'budoux' ? 'normal' : 'break-all',
        ...strokeStyle,
      }}
    >
      <HighlightBounceKeyframes />
      {highlightedText}
    </div>
  );
};
