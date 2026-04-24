import React from 'react';
import {COLORS, FONTS, FS} from '../design-tokens';
import type {LabelTheme} from '../types';

type Kind = 'main' | 'sub' | 'title' | 'subtitle';

type Props = {
  kind: Kind;
  theme?: LabelTheme;
  label?: string;
};

const DEFAULT_LABELS: Record<Kind, string> = {
  main: 'ここはメインコンテンツエリア',
  sub: 'ここはサブコンテンツエリア',
  title: 'ここはタイトルエリア',
  subtitle: 'ここは字幕エリア',
};

export const AreaLabel: React.FC<Props> = ({kind, theme = 'dark', label}) => {
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
        color: textColor,
        fontFamily: FONTS.ui,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.06em',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        textAlign: 'center',
        padding: 16,
      }}
    >
      {label ?? DEFAULT_LABELS[kind]}
    </div>
  );
};
