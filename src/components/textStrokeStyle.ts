import type {CSSProperties} from 'react';

type TextStrokeOptions = {
  color?: string;
  width?: number;
};

export const resolveTextStrokeStyle = ({color, width = 0}: TextStrokeOptions): CSSProperties => {
  const strokeWidth = Math.max(0, width);
  if (!color || strokeWidth <= 0) {
    return {
      WebkitFontSmoothing: 'antialiased',
      textRendering: 'geometricPrecision',
    };
  }

  return {
    WebkitTextStroke: `${strokeWidth}px ${color}`,
    paintOrder: 'stroke fill',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'geometricPrecision',
    textShadow: `0 0 1px ${color}`,
  };
};
