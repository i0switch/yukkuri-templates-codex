import React from 'react';
import {COLORS, FONTS, FS, TEXT_STROKE} from '../design-tokens';
import type {LabelTheme} from '../types';
import {AutoFitText} from './AutoFitText';

type Kind = 'main' | 'sub' | 'title' | 'subtitle';

type Props = {
  kind: Kind;
  theme?: LabelTheme;
  label?: string;
  width?: number;
  height?: number;
};

const DEFAULT_LABELS: Record<Kind, string> = {
  main: 'ここはメインコンテンツエリア',
  sub: 'ここはサブコンテンツエリア',
  title: 'ここはタイトルエリア',
  subtitle: 'ここは字幕エリア',
};

export const AreaLabel: React.FC<Props> = ({kind, theme = 'dark', label, width = 400, height = 120}) => {
  const textColor = theme === 'dark' ? COLORS.areaLabelTextDark : COLORS.areaLabelTextLight;
  const bg = theme === 'dark' ? COLORS.areaLabelBgDark : COLORS.areaLabelBgLight;
  const fontSize = kind === 'title' || kind === 'subtitle' ? FS.areaLabelSmall : FS.areaLabel;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        boxSizing: 'border-box',
        pointerEvents: 'none',
        padding: 16,
      }}
    >
      <AutoFitText
        text={label ?? DEFAULT_LABELS[kind]}
        width={Math.max(1, width - 32)}
        height={Math.max(1, height - 32)}
        minFontSize={18}
        maxFontSize={fontSize}
        lineHeight={1.15}
        fontFamily={FONTS.ui}
        fontWeight={700}
        color={textColor}
        textAlign="center"
        textStrokeColor={theme === 'dark' ? COLORS.white : COLORS.black}
        textStrokeWidth={TEXT_STROKE.label.width}
      />
    </div>
  );
};
