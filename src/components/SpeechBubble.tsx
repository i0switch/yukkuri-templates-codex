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
  tailSide?: 'left' | 'right';
  tailSize?: number;
  tailOffset?: number;
  textColor?: string;
  fontSize?: number;
};

export const SpeechBubble: React.FC<Props> = ({
  text,
  x,
  y,
  width,
  height,
  bg = '#FFFFFF',
  borderColor = '#1A1A1A',
  borderWidth = 3,
  borderRadius = 16,
  tailSide = 'left',
  tailSize = 28,
  tailOffset,
  textColor = '#1A1A1A',
  fontSize = FS.subtitle,
}) => {
  const bubbleTailY = tailOffset ?? height / 2;
  const points =
    tailSide === 'left'
      ? `0,${bubbleTailY} ${tailSize},${bubbleTailY - tailSize / 2} ${tailSize},${bubbleTailY + tailSize / 2}`
      : `${width},${bubbleTailY} ${width - tailSize},${bubbleTailY - tailSize / 2} ${width - tailSize},${bubbleTailY + tailSize / 2}`;
  const bodyLeft = tailSide === 'left' ? tailSize - 2 : 0;
  const bodyWidth = width - tailSize + 2;

  return (
    <div style={{position: 'absolute', left: x, top: y, width, height}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect
          x={bodyLeft}
          y={0}
          width={bodyWidth}
          height={height}
          rx={borderRadius}
          ry={borderRadius}
          fill={bg}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
        <polygon points={points} fill={bg} stroke={borderColor} strokeWidth={borderWidth} />
        <line
          x1={tailSide === 'left' ? tailSize : width - tailSize}
          y1={bubbleTailY - tailSize / 2 + borderWidth / 2}
          x2={tailSide === 'left' ? tailSize : width - tailSize}
          y2={bubbleTailY + tailSize / 2 - borderWidth / 2}
          stroke={bg}
          strokeWidth={borderWidth + 1}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: tailSide === 'left' ? tailSize + 20 : 20,
          right: tailSide === 'right' ? tailSize + 20 : 20,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.subtitle,
          fontSize,
          color: textColor,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};
