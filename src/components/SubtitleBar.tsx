import React from 'react';
import {FONTS, FS, TEXT_STROKE} from '../design-tokens';

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
};

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
}) => {
  const strokeWidth = Math.max(0, textStrokeWidth);
  const strokeShadow =
    textStrokeColor && strokeWidth > 0
      ? [
          `${strokeWidth}px 0 0 ${textStrokeColor}`,
          `-${strokeWidth}px 0 0 ${textStrokeColor}`,
          `0 ${strokeWidth}px 0 ${textStrokeColor}`,
          `0 -${strokeWidth}px 0 ${textStrokeColor}`,
          `${strokeWidth}px ${strokeWidth}px 0 ${textStrokeColor}`,
          `-${strokeWidth}px ${strokeWidth}px 0 ${textStrokeColor}`,
          `${strokeWidth}px -${strokeWidth}px 0 ${textStrokeColor}`,
          `-${strokeWidth}px -${strokeWidth}px 0 ${textStrokeColor}`,
        ].join(', ')
      : undefined;
  const strokeStyle: React.CSSProperties =
    textStrokeColor && strokeWidth > 0
      ? {
          WebkitTextStroke: `${strokeWidth}px ${textStrokeColor}`,
          paintOrder: 'stroke fill',
          textShadow: strokeShadow,
        }
      : {};

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
        boxSizing: 'border-box',
        textAlign,
        ...strokeStyle,
      }}
    >
      {text}
    </div>
  );
};
