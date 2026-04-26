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
import {Scene19} from '../compositions/Scene19';
import {Scene20} from '../compositions/Scene20';
import {Scene21} from '../compositions/Scene21';
import {findActiveLine, pickLipsyncExpression, type TimedDialogueLine} from './Lipsync';
import type {EpisodeRenderData, EpisodeScene, SceneContent, TypographyConfig, TypographyFamily} from '../lib/load-script';
import {AutoFitText} from './AutoFitText';
import {FONT_FAMILIES, TEXT_STROKE} from '../design-tokens';
import {SubtitleBar} from './SubtitleBar';
import type {Rect, SlotRenderer} from '../types';

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
  Scene19,
  Scene20,
  Scene21,
} as const;

const BAR_TEMPLATES = new Set(['Scene01', 'Scene03', 'Scene04', 'Scene08', 'Scene09', 'Scene11', 'Scene18', 'Scene19']);
const LIGHT_TITLE_TEMPLATES = new Set(['Scene15', 'Scene16', 'Scene17']);
const DARK_OVERLAY_SUBTITLE_TEMPLATES = new Set(['Scene12']);

type ResolvedTypography = {
  subtitle: string;
  content: string;
  title: string;
  subtitleStroke: TextStroke;
  contentStroke: TextStroke;
  titleStroke: TextStroke;
};

type TextStroke = {
  color: string;
  width: number;
};

const resolveFamily = (_family: TypographyFamily | undefined) => FONT_FAMILIES.gothic;

const resolveStroke = (
  defaults: TextStroke,
  color: string | undefined,
  width: number | undefined,
): TextStroke => ({
  color: typeof color === 'string' && color.trim() !== '' ? color : defaults.color,
  width: Math.max(1, typeof width === 'number' && Number.isFinite(width) ? width : defaults.width),
});

const resolveTypography = (
  metaTypography: TypographyConfig | undefined,
  sceneTypography: TypographyConfig | undefined,
  lineTypography: Pick<TypographyConfig, 'subtitle_family' | 'subtitle_stroke_color' | 'subtitle_stroke_width'> | undefined,
): ResolvedTypography => ({
  subtitle: resolveFamily(lineTypography?.subtitle_family ?? sceneTypography?.subtitle_family ?? metaTypography?.subtitle_family),
  content: resolveFamily(sceneTypography?.content_family ?? metaTypography?.content_family),
  title: resolveFamily(sceneTypography?.title_family ?? metaTypography?.title_family),
  subtitleStroke: resolveStroke(
    TEXT_STROKE.subtitle,
    lineTypography?.subtitle_stroke_color ?? sceneTypography?.subtitle_stroke_color ?? metaTypography?.subtitle_stroke_color,
    lineTypography?.subtitle_stroke_width ?? sceneTypography?.subtitle_stroke_width ?? metaTypography?.subtitle_stroke_width,
  ),
  contentStroke: resolveStroke(
    TEXT_STROKE.content,
    sceneTypography?.content_stroke_color ?? metaTypography?.content_stroke_color,
    sceneTypography?.content_stroke_width ?? metaTypography?.content_stroke_width,
  ),
  titleStroke: resolveStroke(
    TEXT_STROKE.title,
    sceneTypography?.title_stroke_color ?? metaTypography?.title_stroke_color,
    sceneTypography?.title_stroke_width ?? metaTypography?.title_stroke_width,
  ),
});

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

const renderText = (text: string, fontFamily: string, stroke: TextStroke): SlotRenderer => (rect: Rect) => (
  <div style={cardStyle}>
    <AutoFitText
      text={text}
      width={Math.max(1, rect.w - 68)}
      height={Math.max(1, rect.h - 56)}
      minFontSize={24}
      maxFontSize={54}
      lineHeight={1.32}
      fontFamily={fontFamily}
      fontWeight={800}
      color="#123646"
      textAlign="center"
      textStrokeColor={stroke.color}
      textStrokeWidth={stroke.width}
    />
  </div>
);

const renderBullets = (items: string[], fontFamily: string, stroke: TextStroke): SlotRenderer => (rect: Rect) => (
  <div style={cardStyle}>
    <AutoFitText
      text={items.map((item) => `• ${item}`).join('\n')}
      width={Math.max(1, rect.w - 68)}
      height={Math.max(1, rect.h - 56)}
      minFontSize={20}
      maxFontSize={42}
      lineHeight={1.3}
      fontFamily={fontFamily}
      fontWeight={700}
      color="#123646"
      textAlign="left"
      textStrokeColor={stroke.color}
      textStrokeWidth={stroke.width}
    />
  </div>
);

const renderImage = (
  assetPath: string,
  publicDir: string,
  fontFamily: string,
  stroke: TextStroke,
  caption?: string,
): SlotRenderer => (rect: Rect) => (
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
      <AutoFitText
        text={caption}
        width={Math.max(1, rect.w - 36)}
        height={32}
        minFontSize={16}
        maxFontSize={24}
        lineHeight={1.1}
        fontFamily={fontFamily}
        fontWeight={700}
        color="#0f3d4b"
        textAlign="center"
        textStrokeColor={stroke.color}
        textStrokeWidth={stroke.width}
      />
    ) : null}
  </div>
);

const renderContent = (
  content: SceneContent | null | undefined,
  publicDir: string,
  fontFamily: string,
  stroke: TextStroke,
) => {
  if (!content) {
    return null;
  }

  switch (content.kind) {
    case 'text':
      return renderText(content.text, fontFamily, stroke);
    case 'bullets':
      return renderBullets(content.items, fontFamily, stroke);
    case 'image':
      return renderImage(content.asset, publicDir, fontFamily, stroke, content.caption);
    default:
      return null;
  }
};

const renderTitle = (scene: EpisodeScene, template: string, fontFamily: string, stroke: TextStroke): SlotRenderer | null => {
  if (!scene.title_text) {
    return null;
  }

  const titleText = scene.title_text;
  const textColor = LIGHT_TITLE_TEMPLATES.has(template) ? '#ffffff' : '#153947';
  const shadow = LIGHT_TITLE_TEMPLATES.has(template)
    ? '0 2px 10px rgba(0,0,0,0.45)'
    : '0 2px 8px rgba(255,255,255,0.55)';

  return (rect: Rect) => (
    <AutoFitText
      text={titleText}
      width={Math.max(1, rect.w - 24)}
      height={Math.max(1, rect.h - 8)}
      minFontSize={20}
      maxFontSize={38}
      lineHeight={1.1}
      fontFamily={fontFamily}
      fontWeight={800}
      color={textColor}
      textAlign="center"
      textShadow={shadow}
      textStrokeColor={stroke.color}
      textStrokeWidth={stroke.width}
      style={{padding: '4px 12px', boxSizing: 'border-box'}}
    />
  );
};

const renderBarSubtitle = (text: string, fontFamily: string, stroke: TextStroke): SlotRenderer => (rect: Rect) => (
  (() => {
    const subtitleRect = rect as Rect & {
      bg?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
      textColor?: string;
      textAlign?: 'left' | 'center';
      fontSize?: number;
      fontWeight?: number | string;
    };

    return (
      <SubtitleBar
        text={text}
        x={0}
        y={0}
        width={subtitleRect.w}
        height={subtitleRect.h}
        bg={subtitleRect.bg}
        borderColor={subtitleRect.borderColor}
        borderWidth={subtitleRect.borderWidth}
        borderRadius={subtitleRect.borderRadius}
        textColor={subtitleRect.textColor}
        textAlign={subtitleRect.textAlign}
        fontSize={subtitleRect.fontSize}
        fontWeight={subtitleRect.fontWeight}
        fontFamily={fontFamily}
        textStrokeColor={stroke.color}
        textStrokeWidth={stroke.width}
      />
    );
  })()
);

const renderOverlaySubtitle = (template: string, text: string, fontFamily: string, stroke: TextStroke): SlotRenderer => {
  const darkText = DARK_OVERLAY_SUBTITLE_TEMPLATES.has(template);
  return (rect: Rect) => (
    <AutoFitText
      text={text}
      width={Math.max(1, rect.w - 72)}
      height={Math.max(1, rect.h - 32)}
      minFontSize={18}
      maxFontSize={darkText ? 34 : 40}
      lineHeight={1.35}
      fontFamily={fontFamily}
      fontWeight={700}
      color={darkText ? '#1A1A1A' : '#FFFFFF'}
      textAlign="center"
      textShadow={darkText ? undefined : '0 2px 10px rgba(0,0,0,0.6)'}
      textStrokeColor={stroke.color}
      textStrokeWidth={stroke.width}
      style={{padding: '16px 36px', boxSizing: 'border-box'}}
    />
  );
};

export const SceneRenderer: React.FC<{scene: EpisodeScene; script: EpisodeRenderData}> = ({scene, script}) => {
  const sceneTemplate = scene.scene_template ?? script.meta.layout_template ?? script.meta.scene_template;
  if (!sceneTemplate) {
    throw new Error('Missing layout template. Use meta.layout_template.');
  }
  const SceneComponent = SCENE_COMPONENTS[sceneTemplate as keyof typeof SCENE_COMPONENTS];
  if (!SceneComponent) {
    throw new Error(`Unknown scene_template "${sceneTemplate}". Use Scene01-Scene21.`);
  }

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
  const useBarSubtitle = BAR_TEMPLATES.has(sceneTemplate);
  const typography = resolveTypography(script.meta.typography, scene.typography, activeLine?.typography);

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
          subtitleText={subtitleText}
          subtitleSlot={
            useBarSubtitle
              ? renderBarSubtitle(subtitleText, typography.subtitle, typography.subtitleStroke)
              : renderOverlaySubtitle(sceneTemplate, subtitleText, typography.subtitle, typography.subtitleStroke)
          }
          titleSlot={renderTitle(scene, sceneTemplate, typography.title, typography.titleStroke)}
          mainContentSlot={renderContent(scene.main, script.public_dir, typography.content, typography.contentStroke)}
          subContentSlot={renderContent(scene.sub ?? null, script.public_dir, typography.content, typography.contentStroke)}
          showAreaLabels={false}
        />
      </div>
    </AbsoluteFill>
  );
};













