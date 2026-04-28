import React from 'react';
import type {TimedDialogueLine} from './Lipsync';
import {FONT_FAMILIES, TEXT_STROKE} from '../design-tokens';
import {AutoFitText} from './AutoFitText';
import {extractVisualEmphasisText} from './subtitleSegments';

type Props = {
  activeLine: TimedDialogueLine | null;
  frame: number;
  fps: number;
  width: number;
  height: number;
  color?: string;
  sceneGoal?: string;
};

const EMPHASIS_DURATION_SEC = 0.9;

const resolveVisualEmphasisProgress = (
  activeLine: TimedDialogueLine | null,
  frame: number,
  fps: number,
) => {
  if (!activeLine || fps <= 0 || !extractVisualEmphasisText(activeLine.text)) {
    return null;
  }

  const currentSec = frame / fps;
  const lineStart = activeLine.start_sec;
  const lineEnd = activeLine.end_sec;
  const emphasisEnd = Math.min(lineEnd, lineStart + EMPHASIS_DURATION_SEC);
  if (currentSec < lineStart || currentSec > emphasisEnd) {
    return null;
  }

  const duration = Math.max(0.001, emphasisEnd - lineStart);
  return Math.min(1, Math.max(0, (currentSec - lineStart) / duration));
};

export const isVisualEmphasisActive = (
  activeLine: TimedDialogueLine | null,
  frame: number,
  fps: number,
) => resolveVisualEmphasisProgress(activeLine, frame, fps) !== null;

export const VisualEmphasisLayer: React.FC<Props> = ({
  activeLine,
  frame,
  fps,
  width,
  height,
  color,
}) => {
  const progress = resolveVisualEmphasisProgress(activeLine, frame, fps);
  const emphasisText = extractVisualEmphasisText(activeLine?.text ?? '');
  if (progress === null || !emphasisText) {
    return null;
  }

  const bounce = Math.sin(Math.min(1, progress * 1.35) * Math.PI);
  const scale = 0.86 + bounce * 0.14 + Math.min(1, progress * 2.5) * 0.08;
  const translateY = -12 * bounce;
  const opacity = progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) / 0.18) : 1;
  const text = emphasisText.toLocaleUpperCase('ja-JP');
  const textColor = color ?? '#FFE86A';

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width,
          height,
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.34))',
        }}
      >
        <AutoFitText
          text={text}
          width={width}
          height={height}
          minFontSize={18}
          maxFontSize={Math.min(86, Math.max(32, height * 0.68))}
          lineHeight={1.02}
          fontFamily={FONT_FAMILIES.gothic}
          fontWeight={900}
          color={textColor}
          textAlign="center"
          textShadow="0 0 16px rgba(255,210,54,0.82), 0 4px 0 rgba(0,0,0,0.18)"
          textStrokeColor={TEXT_STROKE.title.color}
          textStrokeWidth={Math.max(5, TEXT_STROKE.title.width)}
          maxLines={2}
        />
      </div>
    </div>
  );
};
