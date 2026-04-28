import React from 'react';
import {FONTS, FS, TEXT_STROKE} from '../design-tokens';
import {AutoFitText} from './AutoFitText';

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
  maxLines?: number;
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
  maxLines,
}) => {
  const strokeAllowance = Math.max(0, textStrokeWidth) * 2;
  const horizontalPadding = 34 + strokeAllowance;
  const verticalPadding = 6 + strokeAllowance;
  const innerWidth = Math.max(1, width - horizontalPadding * 2);
  const innerHeight = Math.max(1, height - verticalPadding * 2);

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
        padding: `${verticalPadding}px ${horizontalPadding}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <AutoFitText
        text={text}
        width={innerWidth}
        height={innerHeight}
        minFontSize={10}
        maxFontSize={fontSize}
        lineHeight={1.18}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        color={textColor}
        textAlign={textAlign}
        textStrokeColor={textStrokeColor}
        textStrokeWidth={textStrokeWidth}
        maxLines={maxLines}
      />
    </div>
  );
};
