import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from './Background';
import {CharacterFace} from './CharacterFace';
import {SubtitleBar} from './SubtitleBar';
import {AreaLabel} from './AreaLabel';
import {CHARACTER_METRICS, FONTS, FS, VIDEO} from '../design-tokens';
import type {SceneLayout, SceneProps} from '../types';

type Props = SceneProps & {
  layout: SceneLayout;
};

const CHARACTER_SCALE_MULTIPLIER = 2.16;
const UNIFIED_CHARACTER_BASE_SCALE = 0.46;
const CHARACTER_EDGE_MARGIN = 4;
const FULL_BODY_Y_LIFT = 40;

const getCharacterPlacementMetrics = (
  character: keyof typeof CHARACTER_METRICS,
  scale: number,
  fullBody: boolean,
) => {
  const metrics = CHARACTER_METRICS[character];
  const renderMetrics = fullBody && 'fullBody' in metrics && metrics.fullBody ? metrics.fullBody : metrics;
  const faceHeight = metrics.imgH * metrics.faceHeightRatio;
  const displayFaceHeight = faceHeight * scale;
  const displayImageHeight = displayFaceHeight / metrics.faceHeightRatio;
  const displayImageWidth = renderMetrics.imgW * (displayImageHeight / renderMetrics.imgH);
  const scaleRatio = displayImageWidth / renderMetrics.imgW;
  const visibleLeft = renderMetrics.visibleBounds.left * scaleRatio;
  const visibleRight = (renderMetrics.imgW - renderMetrics.visibleBounds.right) * scaleRatio;

  return {
    displayImageWidth,
    displayFaceHeight,
    visibleLeft,
    visibleRight,
  };
};

const getSafeFaceY = (y: number, displayFaceHeight: number) =>
  Math.min(y, VIDEO.height - displayFaceHeight / 2 - CHARACTER_EDGE_MARGIN);

const boxStyle = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  width: w,
  height: h,
});

const AUDIT_RED = '#FF2A2A';

const auditBoxStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  border: `8px solid ${AUDIT_RED}`,
  boxSizing: 'border-box',
  pointerEvents: 'none',
};

const auditTextStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  boxSizing: 'border-box',
  color: AUDIT_RED,
  fontFamily: FONTS.ui,
  fontWeight: 800,
  letterSpacing: '0.04em',
  textAlign: 'center',
  textShadow: '0 2px 8px rgba(255,255,255,0.95)',
  pointerEvents: 'none',
};

const renderAuditLabel = (label: string, fontSize: number) => (
  <>
    <div style={auditBoxStyle} />
    <div
      style={{
        ...auditTextStyle,
        fontSize,
      }}
    >
      {label}
    </div>
  </>
);

export const SceneFrame: React.FC<Props> = ({
  layout,
  leftCharacter = {character: 'reimu'},
  rightCharacter = {character: 'marisa'},
  subtitleText = 'ここは字幕エリア',
  subtitleSlot,
  mainContentSlot,
  subContentSlot,
  titleSlot,
  showAreaLabels = false,
}) => {
  const leftCharacterName = leftCharacter.character;
  const rightCharacterName = rightCharacter.character;
  const leftIsFullBody = leftCharacterName === 'zundamon' || leftCharacterName === 'metan';
  const rightIsFullBody = rightCharacterName === 'zundamon' || rightCharacterName === 'metan';
  const unifiedScale = UNIFIED_CHARACTER_BASE_SCALE * CHARACTER_SCALE_MULTIPLIER;
  const leftCharacterSize = getCharacterPlacementMetrics(leftCharacterName, unifiedScale, leftIsFullBody);
  const rightCharacterSize = getCharacterPlacementMetrics(rightCharacterName, unifiedScale, rightIsFullBody);
  const leftCharacterPosition = {
    x: leftCharacterSize.displayImageWidth / 2 + CHARACTER_EDGE_MARGIN - leftCharacterSize.visibleLeft,
    y:
      getSafeFaceY(layout.leftChar.y, leftCharacterSize.displayFaceHeight) -
      (leftIsFullBody ? FULL_BODY_Y_LIFT : 0),
  };
  const rightCharacterPosition = {
    x:
      VIDEO.width -
      rightCharacterSize.displayImageWidth / 2 -
      CHARACTER_EDGE_MARGIN +
      rightCharacterSize.visibleRight,
    y:
      getSafeFaceY(layout.rightChar.y, rightCharacterSize.displayFaceHeight) -
      (rightIsFullBody ? FULL_BODY_Y_LIFT : 0),
  };
  const titleTheme = layout.titleTheme ?? layout.theme;
  const subtitleNode =
    layout.subtitle.kind === 'bar' ? (
      <div
        style={{
          ...boxStyle(layout.subtitle.x, layout.subtitle.y, layout.subtitle.w, layout.subtitle.h),
        }}
      >
        {subtitleSlot ? (
          subtitleSlot
        ) : showAreaLabels ? (
          renderAuditLabel(subtitleText, layout.subtitle.fontSize ?? FS.areaLabelSmall)
        ) : (
          <SubtitleBar
            text={subtitleText}
            x={0}
            y={0}
            width={layout.subtitle.w}
            height={layout.subtitle.h}
            bg={layout.subtitle.bg}
            borderColor={layout.subtitle.borderColor}
            borderWidth={layout.subtitle.borderWidth}
            borderRadius={layout.subtitle.borderRadius}
            textColor={layout.subtitle.textColor}
            textAlign={layout.subtitle.textAlign}
            fontSize={layout.subtitle.fontSize}
            fontWeight={layout.subtitle.fontWeight}
          />
        )}
      </div>
    ) : (
      <div
        style={{
          ...boxStyle(layout.subtitle.x, layout.subtitle.y, layout.subtitle.w, layout.subtitle.h),
        }}
      >
        {subtitleSlot
          ? subtitleSlot
          : showAreaLabels
            ? renderAuditLabel(subtitleText, layout.subtitle.fontSize ?? FS.areaLabelSmall)
            : null}
      </div>
    );

  return (
    <AbsoluteFill>
      <Background
        src={layout.bgSrc}
        scale={layout.bgScale}
        translateX={layout.bgTranslateX}
        translateY={layout.bgTranslateY}
      />

      <div style={boxStyle(layout.main.x, layout.main.y, layout.main.w, layout.main.h)}>
        {mainContentSlot ??
          (showAreaLabels ? renderAuditLabel('ここはメインコンテンツエリア', FS.areaLabel) : null)}
      </div>

      {layout.sub ? (
        <div style={boxStyle(layout.sub.x, layout.sub.y, layout.sub.w, layout.sub.h)}>
          {subContentSlot ??
            (showAreaLabels ? renderAuditLabel('ここはサブコンテンツエリア', FS.areaLabel) : null)}
        </div>
      ) : null}

      {layout.title ? (
        <div style={boxStyle(layout.title.x, layout.title.y, layout.title.w, layout.title.h)}>
          {titleSlot ?? (showAreaLabels ? <AreaLabel kind="title" theme={titleTheme} /> : null)}
        </div>
      ) : null}

      {subtitleNode}

      <CharacterFace
        character={leftCharacterName}
        expression={leftCharacter.expression ?? layout.leftChar.expression}
        x={leftCharacterPosition.x}
        y={leftCharacterPosition.y}
        scale={unifiedScale}
        flip={leftCharacter.flip}
        fullBody={leftIsFullBody}
      />
      <CharacterFace
        character={rightCharacterName}
        expression={rightCharacter.expression ?? layout.rightChar.expression}
        x={rightCharacterPosition.x}
        y={rightCharacterPosition.y}
        scale={unifiedScale}
        flip={rightCharacter.flip}
        fullBody={rightIsFullBody}
      />
    </AbsoluteFill>
  );
};
