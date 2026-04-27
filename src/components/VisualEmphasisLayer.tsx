import React from 'react';
import {interpolate} from 'remotion';
import type {TimedDialogueLine} from './Lipsync';

type Props = {
  activeLine: TimedDialogueLine | null;
  frame: number;
  fps: number;
  width: number;
  height: number;
  sceneGoal?: string;
};

const emphasisProgress = (activeLine: TimedDialogueLine | null, frame: number, fps: number) => {
  if (!activeLine?.emphasis) {
    return null;
  }
  const startFrame = Math.round(activeLine.start_sec * fps);
  const localFrame = Math.max(0, frame - startFrame);
  const duration = Math.max(1, Math.round(fps * 0.5));
  if (localFrame > duration) {
    return null;
  }
  return {
    localFrame,
    duration,
    style: activeLine.emphasis.style,
  };
};

const SpeedLines: React.FC<{opacity: number}> = ({opacity}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      background:
        'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0 42px, rgba(255,255,255,0.42) 44px 47px, rgba(255,255,255,0) 50px 58px)',
      mixBlendMode: 'screen',
      transform: 'scale(1.12)',
      pointerEvents: 'none',
    }}
  />
);

const Sparkles: React.FC<{opacity: number}> = ({opacity}) => (
  <>
    {[
      {left: '18%', top: '24%', size: 38},
      {left: '72%', top: '18%', size: 26},
      {left: '64%', top: '68%', size: 34},
      {left: '30%', top: '72%', size: 24},
    ].map((sparkle, index) => (
      <div
        key={`${sparkle.left}-${sparkle.top}`}
        style={{
          position: 'absolute',
          left: sparkle.left,
          top: sparkle.top,
          width: sparkle.size,
          height: sparkle.size,
          opacity,
          transform: `rotate(${index * 22}deg)`,
          color: '#FACC15',
          fontSize: sparkle.size,
          fontWeight: 900,
          textShadow: '0 0 18px rgba(250,204,21,0.8)',
          pointerEvents: 'none',
        }}
      >
        +
      </div>
    ))}
  </>
);

export const ChapterTitleFlash: React.FC<{frame: number; fps: number; width: number; height: number; text?: string}> = ({
  frame,
  fps,
  width,
  height,
  text,
}) => {
  const duration = Math.max(1, Math.round(fps * 0.5));
  if (!text || frame > duration) {
    return null;
  }

  const opacity = interpolate(frame, [0, Math.round(duration * 0.25), duration], [0, 0.86, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      data-visual-layer="chapter-title-flash"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        opacity,
        background: 'rgba(0,0,0,0.86)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 220px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: '#FFFFFF',
          fontSize: 54,
          lineHeight: 1.18,
          fontWeight: 900,
          textAlign: 'center',
          textShadow: '0 3px 18px rgba(0,0,0,0.7)',
          maxHeight: 180,
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const VisualEmphasisLayer: React.FC<Props> = ({activeLine, frame, fps, width, height, sceneGoal}) => {
  const progress = emphasisProgress(activeLine, frame, fps);
  const layerOpacity = progress
    ? interpolate(progress.localFrame, [0, Math.round(progress.duration * 0.25), progress.duration], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const isFlash = progress && ['danger', 'surprise', 'number'].includes(progress.style);
  const isPunch = progress?.style === 'punch';
  const isAction = progress?.style === 'action';
  const shakeX = isPunch ? interpolate(progress.localFrame % 6, [0, 3, 6], [-8, 8, -8]) : 0;
  const zoomScale = isFlash ? interpolate(progress.localFrame, [0, progress.duration], [1.03, 1.12]) : 1;

  return (
    <div data-visual-layer="visual-emphasis" style={{position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none'}}>
      {isFlash ? (
        <div
          data-visual-effect="flash-zoom"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: layerOpacity * 0.62,
            background: '#FFFFFF',
            transform: `scale(${zoomScale})`,
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
      {isPunch ? (
        <div data-visual-effect="speed-lines-shake" style={{position: 'absolute', inset: 0, transform: `translateX(${shakeX}px)`}}>
          <SpeedLines opacity={layerOpacity * 0.72} />
        </div>
      ) : null}
      {isAction ? <Sparkles opacity={layerOpacity} /> : null}
      <ChapterTitleFlash frame={frame} fps={fps} width={width} height={height} text={sceneGoal} />
    </div>
  );
};
