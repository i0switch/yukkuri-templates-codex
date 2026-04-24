import React from 'react';
import {Img, staticFile} from 'remotion';
import {CHARACTER_METRICS, EXPRESSION_FILE} from '../design-tokens';
import type {CharacterName, Expression} from '../design-tokens';

type Props = {
  character: CharacterName;
  expression?: Expression;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  fullBody?: boolean;
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
  const renderMetrics = fullBody && 'fullBody' in metrics && metrics.fullBody ? metrics.fullBody : metrics;
  const file = fullBody && 'file' in renderMetrics ? renderMetrics.file : EXPRESSION_FILE[expression];
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
