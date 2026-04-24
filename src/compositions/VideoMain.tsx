import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile, useVideoConfig} from 'remotion';
import {SceneRenderer} from '../components/SceneRenderer';
import type {EpisodeRenderData} from '../lib/load-script';

export const VideoMain: React.FC<{script: EpisodeRenderData}> = ({script}) => {
  const {fps} = useVideoConfig();
  const totalFrames = Math.ceil(script.total_duration_sec * fps);

  return (
    <AbsoluteFill style={{backgroundColor: '#ffffff'}}>
      {script.bgm?.file ? (
        <Audio
          src={staticFile(`${script.public_dir}/${script.bgm.file}`)}
          loop
          volume={(frame) => {
            const fadeInFrames = Math.max(1, Math.round((script.bgm?.fade_in_sec ?? 0) * fps));
            const fadeOutFrames = Math.max(1, Math.round((script.bgm?.fade_out_sec ?? 0) * fps));
            const fadeIn = interpolate(frame, [0, fadeInFrames], [0, script.bgm?.volume ?? 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const fadeOut = interpolate(
              frame,
              [Math.max(0, totalFrames - fadeOutFrames), totalFrames],
              [script.bgm?.volume ?? 0, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              },
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      ) : null}

      <Series>
        {script.scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={Math.ceil(scene.duration_sec * fps)}>
            <SceneRenderer scene={scene} script={script} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
