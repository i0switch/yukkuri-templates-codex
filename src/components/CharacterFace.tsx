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
};

const EXPRESSION_ALIASES: Record<string, Expression> = {
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

export const CharacterFace: React.FC<Props> = ({
  character,
  expression = 'neutral',
  x,
  y,
  scale = 0.55,
  flip = false,
  fullBody = false,
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
