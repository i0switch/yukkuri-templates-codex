import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Scene01} from '../compositions/Scene01';
import {Scene02} from '../compositions/Scene02';
import {Scene03} from '../compositions/Scene03';
import {Scene04} from '../compositions/Scene04';
import {Scene05} from '../compositions/Scene05';
import {Scene06} from '../compositions/Scene06';
import {Scene07} from '../compositions/Scene07';
import {Scene08} from '../compositions/Scene08';
import {Scene09} from '../compositions/Scene09';
import {Scene10} from '../compositions/Scene10';
import {Scene11} from '../compositions/Scene11';
import {Scene12} from '../compositions/Scene12';
import {Scene13} from '../compositions/Scene13';
import {Scene14} from '../compositions/Scene14';
import {Scene15} from '../compositions/Scene15';
import {Scene16} from '../compositions/Scene16';
import {Scene17} from '../compositions/Scene17';
import {Scene18} from '../compositions/Scene18';
import {Scene20} from '../compositions/Scene20';
import {Scene21} from '../compositions/Scene21';
import {Scene22} from '../compositions/Scene22';
import {findActiveLine, pickLipsyncExpression, type TimedDialogueLine} from './Lipsync';
import type {EpisodeRenderData, EpisodeScene, SceneContent} from '../lib/load-script';

const SCENE_COMPONENTS = {
  Scene01,
  Scene02,
  Scene03,
  Scene04,
  Scene05,
  Scene06,
  Scene07,
  Scene08,
  Scene09,
  Scene10,
  Scene11,
  Scene12,
  Scene13,
  Scene14,
  Scene15,
  Scene16,
  Scene17,
  Scene18,
  Scene20,
  Scene21,
  Scene22,
} as const;

const BAR_TEMPLATES = new Set(['Scene01', 'Scene03', 'Scene04', 'Scene08', 'Scene09', 'Scene11', 'Scene18', 'Scene20']);
const LIGHT_TITLE_TEMPLATES = new Set(['Scene15', 'Scene16', 'Scene17']);
const DARK_OVERLAY_SUBTITLE_TEMPLATES = new Set(['Scene12']);

const cardStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '28px 34px',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.78)',
  border: '2px solid rgba(10,94,122,0.16)',
  borderRadius: 26,
  boxShadow: '0 20px 48px rgba(8,58,78,0.12)',
};

const renderText = (text: string) => (
  <div
    style={{
      ...cardStyle,
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: 54,
      lineHeight: 1.32,
      fontWeight: 800,
      textAlign: 'center',
      color: '#123646',
      letterSpacing: '0.02em',
    }}
  >
    {text}
  </div>
);

const renderBullets = (items: string[]) => (
  <div
    style={{
      ...cardStyle,
      alignItems: 'flex-start',
      gap: 18,
      justifyContent: 'center',
      fontFamily: '"Noto Sans JP", sans-serif',
      color: '#123646',
    }}
  >
    {items.map((item) => (
      <div
        key={item}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        <span style={{color: '#1aa0b8', fontSize: 48}}>•</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const renderImage = (assetPath: string, publicDir: string, caption?: string) => (
  <div
    style={{
      ...cardStyle,
      padding: 18,
      gap: 12,
      background: 'rgba(255,255,255,0.62)',
    }}
  >
    <Img
      src={staticFile(`${publicDir}/${assetPath.replace(/\\/g, '/')}`)}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: caption ? '88%' : '100%',
        objectFit: 'contain',
        borderRadius: 20,
      }}
    />
    {caption ? (
      <div
        style={{
          fontFamily: '"Noto Sans JP", sans-serif',
          fontSize: 24,
          fontWeight: 700,
          color: '#0f3d4b',
          textAlign: 'center',
        }}
      >
        {caption}
      </div>
    ) : null}
  </div>
);

const renderContent = (content: SceneContent | null | undefined, publicDir: string) => {
  if (!content) {
    return null;
  }

  switch (content.kind) {
    case 'text':
      return renderText(content.text);
    case 'bullets':
      return renderBullets(content.items);
    case 'image':
      return renderImage(content.asset, publicDir, content.caption);
    default:
      return null;
  }
};

const renderTitle = (scene: EpisodeScene) => {
  if (!scene.title_text) {
    return null;
  }

  const textColor = LIGHT_TITLE_TEMPLATES.has(scene.scene_template) ? '#ffffff' : '#153947';
  const shadow = LIGHT_TITLE_TEMPLATES.has(scene.scene_template)
    ? '0 2px 10px rgba(0,0,0,0.45)'
    : '0 2px 8px rgba(255,255,255,0.55)';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 28px',
        boxSizing: 'border-box',
        fontFamily: '"M PLUS Rounded 1c", sans-serif',
        fontSize: 38,
        fontWeight: 800,
        color: textColor,
        textAlign: 'center',
        letterSpacing: '0.04em',
        textShadow: shadow,
      }}
    >
      {scene.title_text}
    </div>
  );
};

const renderOverlaySubtitle = (template: string, text: string) => {
  const darkText = DARK_OVERLAY_SUBTITLE_TEMPLATES.has(template);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 36px',
        boxSizing: 'border-box',
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: darkText ? 34 : 40,
        fontWeight: 700,
        lineHeight: 1.35,
        textAlign: 'center',
        color: darkText ? '#1A1A1A' : '#FFFFFF',
        textShadow: darkText ? 'none' : '0 2px 10px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  );
};

export const SceneRenderer: React.FC<{scene: EpisodeScene; script: EpisodeRenderData}> = ({scene, script}) => {
  const SceneComponent = SCENE_COMPONENTS[scene.scene_template as keyof typeof SCENE_COMPONENTS];
  const frame = useCurrentFrame();
  const fps = script.meta.fps;
  const baseWidth = script.base_layout_width;
  const baseHeight = script.base_layout_height;
  const scale = script.meta.width / baseWidth;
  const lines = scene.dialogue as TimedDialogueLine[];
  const activeLine = findActiveLine(lines, frame, fps);

  const leftExpression = pickLipsyncExpression({
    side: 'left',
    lines,
    activeLine,
    frame,
    fps,
  });
  const rightExpression = pickLipsyncExpression({
    side: 'right',
    lines,
    activeLine,
    frame,
    fps,
  });

  const subtitleText = activeLine?.text ?? '';
  const useBarSubtitle = BAR_TEMPLATES.has(scene.scene_template);

  return (
    <AbsoluteFill>
      {lines.map((line) => (
        <Sequence
          key={line.id}
          from={Math.round(line.start_sec * fps)}
          durationInFrames={Math.max(1, Math.ceil(line.wav_sec * fps))}
        >
          <Audio src={staticFile(`${script.public_dir}/audio/${scene.id}_${line.id}.wav`)} />
        </Sequence>
      ))}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <SceneComponent
          leftCharacter={{character: script.characters.left.character as never, expression: leftExpression as never}}
          rightCharacter={{character: script.characters.right.character as never, expression: rightExpression as never}}
          subtitleText={useBarSubtitle ? subtitleText : ''}
          subtitleSlot={useBarSubtitle ? undefined : renderOverlaySubtitle(scene.scene_template, subtitleText)}
          titleSlot={renderTitle(scene)}
          mainContentSlot={renderContent(scene.main, script.public_dir)}
          subContentSlot={renderContent(scene.sub ?? null, script.public_dir)}
          showAreaLabels={false}
        />
      </div>
    </AbsoluteFill>
  );
};
