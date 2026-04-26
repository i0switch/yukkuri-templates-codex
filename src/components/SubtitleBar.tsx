import React from 'react';
import {FONTS, FS} from '../design-tokens';

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
}) => {
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
      }}
    >
      {text}
    </div>
  );
};
