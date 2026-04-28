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
import type {EpisodeRenderData, EpisodeScene, MainTimelineEntry, SceneContent, TypographyConfig, TypographyFamily} from '../lib/load-script';
import {AutoFitText} from './AutoFitText';
import {FONT_FAMILIES, FS, SUBTITLE_FONT_SCALE, TEXT_STROKE} from '../design-tokens';
import {SubtitleBar} from './SubtitleBar';
import {resolveSubtitleSegmentText} from './subtitleSegments';
import {resolveOverlaySubtitleLayout} from './subtitleLayout';
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
const SUBTITLE_MAX_LINES = 2;
const CHARACTER_SUBTITLE_COLORS: Record<string, string> = {
  zundamon: '#22C55E',
  metan: '#C2185B',
  reimu: '#E53935',
  marisa: '#FACC15',
};
const scaleSubtitleFontSize = (fontSize: number) => Math.round(fontSize * SUBTITLE_FONT_SCALE);

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

const resolveSubtitleTextColor = (
  activeLine: TimedDialogueLine | null,
  characters: EpisodeRenderData['characters'],
) => {
  if (!activeLine) {
    return undefined;
  }

  const character = characters[activeLine.speaker]?.character;
  return typeof character === 'string' ? CHARACTER_SUBTITLE_COLORS[character] : undefined;
};

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

const renderImage = (
  assetPath: string,
  publicDir: string,
): SlotRenderer => (rect: Rect) => (
  <div
    style={{
      ...cardStyle,
      padding: 18,
      background: 'rgba(255,255,255,0.62)',
      borderColor: 'rgba(10,94,122,0.16)',
      overflow: 'hidden',
    }}
  >
    <Img
      src={staticFile(`${publicDir}/${assetPath.replace(/\\/g, '/')}`)}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: 20,
      }}
    />
  </div>
);

const renderMainContent = (
  content: SceneContent | null | undefined,
  publicDir: string,
  opacity = 1,
): SlotRenderer | null => {
  if (!content) {
    return null;
  }

  // v2 rule: main slot is image-only. text / bullets are not rendered on main.
  if (content.kind === 'image') {
    const imageSlot = renderImage(content.asset, publicDir);
    return (rect: Rect) => (
      <div style={{width: '100%', height: '100%', opacity}}>
        {typeof imageSlot === 'function' ? imageSlot(rect) : imageSlot}
      </div>
    );
  }
  return null;
};

const lineMatchesTimelineEntry = (line: TimedDialogueLine | null, entry: MainTimelineEntry | undefined, lines: TimedDialogueLine[]) => {
  if (!line || !entry) {
    return false;
  }
  if (Array.isArray(entry.line_ids) && entry.line_ids.length > 0) {
    return entry.line_ids.includes(line.id);
  }
  const startIndex = lines.findIndex((candidate) => candidate.id === entry.start_line_id);
  const endIndex = lines.findIndex((candidate) => candidate.id === entry.end_line_id);
  const lineIndex = lines.findIndex((candidate) => candidate.id === line.id);
  return startIndex !== -1 && endIndex !== -1 && lineIndex >= startIndex && lineIndex <= endIndex;
};

const activeMainContentForLine = (scene: EpisodeScene, activeLine: TimedDialogueLine | null, lines: TimedDialogueLine[]): SceneContent => {
  const timeline = Array.isArray(scene.main_timeline) ? scene.main_timeline : [];
  const activeEntry = timeline.find((entry) => lineMatchesTimelineEntry(activeLine, entry, lines));
  if (activeEntry?.asset) {
    return {kind: 'image', asset: activeEntry.asset};
  }
  return scene.main;
};

const renderSubText = (
  text: string,
  fontFamily: string,
  contentStroke: TextStroke,
): SlotRenderer => (rect: Rect) => (
  <div
    style={{
      ...cardStyle,
      padding: '18px 22px',
      background: 'rgba(255,255,255,0.82)',
      alignItems: 'stretch',
    }}
  >
    <AutoFitText
      text={text}
      width={Math.max(1, rect.w - 44)}
      height={Math.max(1, rect.h - 36)}
      minFontSize={13}
      maxFontSize={28}
      lineHeight={1.32}
      fontFamily={fontFamily}
      fontWeight={600}
      color="#1A1A1A"
      textAlign="left"
      textStrokeColor={contentStroke.color}
      textStrokeWidth={contentStroke.width}
    />
  </div>
);

const renderSubBullets = (
  items: string[],
  fontFamily: string,
  contentStroke: TextStroke,
): SlotRenderer => (rect: Rect) => {
  const innerWidth = Math.max(1, rect.w - 36);
  const innerHeight = Math.max(1, rect.h - 32);
  const gap = items.length >= 6 ? 4 : 6;
  const itemHeight = Math.max(22, Math.floor((innerHeight - gap * Math.max(0, items.length - 1)) / Math.max(1, items.length)));
  return (
    <div
      style={{
        ...cardStyle,
        padding: '16px 18px',
        background: 'rgba(255,255,255,0.82)',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}
    >
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap,
        }}
      >
        {items.map((item, index) => (
          <li
            key={`${index}-${item}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              minHeight: itemHeight,
            }}
          >
            <AutoFitText
              text={`・${item}`}
              width={innerWidth}
              height={itemHeight}
              minFontSize={12}
              maxFontSize={24}
              lineHeight={1.22}
              fontFamily={fontFamily}
              fontWeight={600}
              color="#1A1A1A"
              textAlign="left"
              textStrokeColor={contentStroke.color}
              textStrokeWidth={contentStroke.width}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderSubContent = (
  content: SceneContent | null | undefined,
  publicDir: string,
  fontFamily: string,
  contentStroke: TextStroke,
): SlotRenderer | null => {
  if (!content) {
    return null;
  }

  switch (content.kind) {
    case 'text':
      if (typeof content.text !== 'string' || content.text.trim() === '') {
        return null;
      }
      return renderSubText(content.text, fontFamily, contentStroke);
    case 'bullets': {
      const items = Array.isArray(content.items)
        ? content.items.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
        : [];
      if (items.length === 0) {
        return null;
      }
      return renderSubBullets(items, fontFamily, contentStroke);
    }
    case 'image':
      return renderImage(content.asset, publicDir);
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

const renderBarSubtitle = (
  activeLine: TimedDialogueLine | null,
  currentSec: number,
  fontFamily: string,
  stroke: TextStroke,
  textColor: string | undefined,
): SlotRenderer => (rect: Rect) => (
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
    const strokeAllowance = Math.max(0, stroke.width) * 2;
    const horizontalPadding = 34 + strokeAllowance;
    const subtitleText = resolveSubtitleSegmentText({
      line: activeLine,
      currentSec,
      splitOptions: {
        width: Math.max(1, subtitleRect.w - horizontalPadding * 2),
        fontSize: subtitleRect.fontSize ?? FS.subtitle,
        lineHeight: 1.18,
        letterSpacing: 0,
        maxLines: SUBTITLE_MAX_LINES,
      },
    });

    return (
      <SubtitleBar
        text={subtitleText}
        x={0}
        y={0}
        width={subtitleRect.w}
        height={subtitleRect.h}
        bg={subtitleRect.bg}
        borderColor={subtitleRect.borderColor}
        borderWidth={subtitleRect.borderWidth}
        borderRadius={subtitleRect.borderRadius}
        textColor={textColor ?? subtitleRect.textColor}
        textAlign={subtitleRect.textAlign}
        fontSize={subtitleRect.fontSize}
        fontWeight={subtitleRect.fontWeight}
        fontFamily={fontFamily}
        textStrokeColor={stroke.color}
        textStrokeWidth={stroke.width}
        maxLines={SUBTITLE_MAX_LINES}
      />
    );
  })()
);

const renderOverlaySubtitle = (
  template: string,
  activeLine: TimedDialogueLine | null,
  currentSec: number,
  fontFamily: string,
  stroke: TextStroke,
  textColor: string | undefined,
): SlotRenderer => {
  const darkText = DARK_OVERLAY_SUBTITLE_TEMPLATES.has(template);
  return (rect: Rect) => {
    const subtitleRect = rect as Rect & {
      paddingX?: number;
      paddingY?: number;
    };
    const fontSize = darkText ? scaleSubtitleFontSize(34) : scaleSubtitleFontSize(40);
    const layout = resolveOverlaySubtitleLayout({
      rect: subtitleRect,
      strokeWidth: stroke.width,
      fallbackPaddingX: 28,
      fallbackPaddingY: 12,
    });
    const subtitleText = resolveSubtitleSegmentText({
      line: activeLine,
      currentSec,
      splitOptions: {
        width: layout.innerWidth,
        fontSize,
        lineHeight: 1.22,
        letterSpacing: 0,
        maxLines: SUBTITLE_MAX_LINES,
      },
    });

    return (
      <div
        style={{
          width: rect.w,
          height: rect.h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${layout.paddingY}px ${layout.paddingX}px`,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <AutoFitText
          text={subtitleText}
          width={layout.innerWidth}
          height={layout.innerHeight}
          minFontSize={scaleSubtitleFontSize(12)}
          maxFontSize={fontSize}
          lineHeight={1.22}
          fontFamily={fontFamily}
          fontWeight={700}
          color={textColor ?? (darkText ? '#1A1A1A' : '#FFFFFF')}
          textAlign="center"
          textShadow={darkText ? undefined : '0 2px 10px rgba(0,0,0,0.6)'}
          textStrokeColor={stroke.color}
          textStrokeWidth={stroke.width}
          maxLines={SUBTITLE_MAX_LINES}
        />
      </div>
    );
  };
};

export const SceneRenderer: React.FC<{scene: EpisodeScene; script: EpisodeRenderData}> = ({scene, script}) => {
  const sceneTemplate = script.meta.layout_template;
  if (!sceneTemplate) {
    throw new Error('Missing layout template. Use meta.layout_template.');
  }
  const SceneComponent = SCENE_COMPONENTS[sceneTemplate as keyof typeof SCENE_COMPONENTS];
  if (!SceneComponent) {
    throw new Error(`Unknown layout_template "${sceneTemplate}". Use Scene01-Scene21.`);
  }

  const frame = useCurrentFrame();
  const fps = script.meta.fps;
  const currentSec = frame / fps;
  const baseWidth = script.base_layout_width;
  const baseHeight = script.base_layout_height;
  const scale = script.meta.width / baseWidth;
  const lines = scene.dialogue as TimedDialogueLine[];
  const activeLine = findActiveLine(lines, frame, fps);
  const speakingFrame =
    activeLine ? Math.max(0, frame - Math.round(activeLine.start_sec * fps)) : 0;
  const leftIsSpeaking = activeLine?.speaker === 'left';
  const rightIsSpeaking = activeLine?.speaker === 'right';

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

  const useBarSubtitle = BAR_TEMPLATES.has(sceneTemplate);
  const subtitleText = activeLine?.text ?? '';
  const typography = resolveTypography(script.meta.typography, scene.typography, activeLine?.typography);
  const subtitleTextColor = resolveSubtitleTextColor(activeLine, script.characters);
  const activeMainContent = activeMainContentForLine(scene, activeLine, lines);
  const fadeFrames = Math.max(1, Math.round(fps * 0.16));
  const mainOpacity = activeLine ? Math.min(1, Math.max(0, speakingFrame / fadeFrames)) : 1;

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
          leftCharacter={{
            character: script.characters.left.character as never,
            expression: leftExpression as never,
            isSpeaking: leftIsSpeaking,
            speakingFrame: leftIsSpeaking ? speakingFrame : 0,
          }}
          rightCharacter={{
            character: script.characters.right.character as never,
            expression: rightExpression as never,
            isSpeaking: rightIsSpeaking,
            speakingFrame: rightIsSpeaking ? speakingFrame : 0,
          }}
          subtitleText={subtitleText}
          subtitleSlot={
            useBarSubtitle
              ? renderBarSubtitle(activeLine, currentSec, typography.subtitle, typography.subtitleStroke, subtitleTextColor)
              : renderOverlaySubtitle(sceneTemplate, activeLine, currentSec, typography.subtitle, typography.subtitleStroke, subtitleTextColor)
          }
          titleSlot={renderTitle(scene, sceneTemplate, typography.title, typography.titleStroke)}
          mainContentSlot={renderMainContent(activeMainContent, script.public_dir, mainOpacity)}
          subContentSlot={renderSubContent(scene.sub ?? null, script.public_dir, typography.content, typography.contentStroke)}
          showAreaLabels={false}
        />
      </div>
    </AbsoluteFill>
  );
};
