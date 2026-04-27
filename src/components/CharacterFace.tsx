import React from 'react';
import {Img, staticFile} from 'remotion';
import {CHARACTER_METRICS, EXPRESSION_FILE} from '../design-tokens';
import type {CharacterName, Expression} from '../design-tokens';

type Props = {
  character: CharacterName;
  expression?: Expression | string;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  fullBody?: boolean;
  isSpeaking?: boolean;
  speakingFrame?: number;
};

const EXPRESSION_ALIASES: Record<string, Expression> = {
  normal: 'neutral',
  surprise: 'happy',
  shock: 'laugh',
  wry: 'smirk',
  confused: 'smirk',
  confident: 'smile',
  smug: 'smirk',
  surprised: 'happy',
  shocked: 'laugh',
  puzzled: 'smirk',
  worried: 'calm',
  serious: 'smirk',
};

const normalizeExpression = (expression: Expression | string | undefined): Expression => {
  if (expression && expression in EXPRESSION_FILE) {
    return expression as Expression;
  }

  if (expression && expression in EXPRESSION_ALIASES) {
    return EXPRESSION_ALIASES[expression];
  }

  return 'neutral';
};

const SPEAKING_BOUNCE_PERIOD_FRAMES = 12;
const SPEAKING_BOUNCE_MAX_Y = 8;
const SPEAKING_BOUNCE_MAX_SCALE = 0.012;

export const CharacterFace: React.FC<Props> = ({
  character,
  expression = 'neutral',
  x,
  y,
  scale = 0.55,
  flip = false,
  fullBody = false,
  isSpeaking = false,
  speakingFrame = 0,
}) => {
  const metrics = CHARACTER_METRICS[character];
  const normalizedExpression = normalizeExpression(expression);
  const expressionFile = EXPRESSION_FILE[normalizedExpression];
  const renderMetrics = metrics;
  const file = expressionFile;
  const src = staticFile(`${metrics.composeDir}/${file}`);

  const faceHeight = metrics.imgH * metrics.faceHeightRatio;
  const displayFaceHeight = faceHeight * scale;
  const displayImageHeight = displayFaceHeight / metrics.faceHeightRatio;
  const displayImageWidth = renderMetrics.imgW * (displayImageHeight / renderMetrics.imgH);

  const faceCenterInImageY = displayImageHeight * renderMetrics.faceCenterRatio.y;
  const normalizedSpeakingFrame = Math.max(0, speakingFrame);
  const bounceProgress =
    isSpeaking
      ? (normalizedSpeakingFrame % SPEAKING_BOUNCE_PERIOD_FRAMES) / SPEAKING_BOUNCE_PERIOD_FRAMES
      : 0;
  const bounceAmount = Math.sin(bounceProgress * Math.PI);
  const bounceY = -SPEAKING_BOUNCE_MAX_Y * bounceAmount;
  const speakingScale = 1 + SPEAKING_BOUNCE_MAX_SCALE * bounceAmount;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - displayImageWidth / 2,
        top: y - faceCenterInImageY,
        width: displayImageWidth,
        height: fullBody ? displayImageHeight : displayFaceHeight,
        overflow: fullBody ? 'visible' : 'hidden',
        pointerEvents: 'none',
        transform: isSpeaking ? `translateY(${bounceY}px) scale(${speakingScale})` : undefined,
        transformOrigin: 'center bottom',
      }}
    >
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: displayImageWidth,
          height: displayImageHeight,
          transform: flip ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};
