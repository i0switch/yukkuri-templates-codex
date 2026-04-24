# 共通デザイントークン

## src/design-tokens.ts

```ts
import { loadFont as loadNotoSans } from '@remotion/google-fonts/NotoSansJP';
import { loadFont as loadMPlus } from '@remotion/google-fonts/MPLUSRounded1c';

// Fonts
const noto = loadNotoSans('normal', { weights: ['400', '500', '700', '900'] });
const mplus = loadMPlus('normal', { weights: ['400', '500', '700', '800'] });
export const NOTO_SANS_JP = noto.fontFamily;
export const M_PLUS = mplus.fontFamily;

export const FONTS = {
  subtitle: NOTO_SANS_JP,
  ui: M_PLUS,
} as const;

// Video
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

// Colors
export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  offWhite: '#F5F5F5',
  // Area label colors
  areaLabelStrokeDark: 'rgba(0,0,0,0.45)',
  areaLabelTextDark:   'rgba(0,0,0,0.65)',
  areaLabelBgDark:     'rgba(255,255,255,0.20)',
  areaLabelStrokeLight: 'rgba(255,255,255,0.60)',
  areaLabelTextLight:   'rgba(255,255,255,0.85)',
  areaLabelBgLight:     'rgba(0,0,0,0.20)',
} as const;

// Font sizes
export const FS = {
  xs: 20, sm: 28, md: 40,
  subtitle: 48, subtitleLg: 56, display: 72,
  areaLabel: 44,
  areaLabelSmall: 32,
} as const;

// Character metrics
export const CHARACTER_METRICS = {
  reimu: {
    composeDir: '/characters/reimu',
    imgW: 400, imgH: 320,
    faceCenterRatio: { x: 0.5, y: 0.5 },
    faceHeightRatio: 1.0,
  },
  marisa: {
    composeDir: '/characters/marisa',
    imgW: 400, imgH: 320,
    faceCenterRatio: { x: 0.5, y: 0.5 },
    faceHeightRatio: 1.0,
  },
  zundamon: {
    composeDir: '/characters/zundamon',
    imgW: 524, imgH: 800,
    faceCenterRatio: { x: 0.5, y: 0.17 },
    faceHeightRatio: 0.30,
  },
  metan: {
    composeDir: '/characters/metan',
    imgW: 475, imgH: 800,
    faceCenterRatio: { x: 0.5, y: 0.17 },
    faceHeightRatio: 0.30,
  },
} as const;

export type CharacterName = keyof typeof CHARACTER_METRICS;

// Character pairs
export const CHARACTER_PAIRS = {
  RM: ['reimu', 'marisa'] as const,
  ZM: ['zundamon', 'metan'] as const,
} as const;

export type PairId = keyof typeof CHARACTER_PAIRS;

// Expression file mapping
export const EXPRESSION_FILE = {
  neutral:   'compose_open_close.png',
  smile:     'compose_open_mid.png',
  happy:     'compose_open_wide.png',
  laugh:     'compose_closed_wide.png',
  calm:      'compose_closed_close.png',
  smirk:     'compose_closed_mid.png',
  talk:      'compose_half_mid.png',
  halfOpen:  'compose_half_open.png',
} as const;

export type Expression = keyof typeof EXPRESSION_FILE;
```

## src/types.ts

```ts
import type { CharacterName, Expression } from './design-tokens';

export interface CharacterSpec {
  character: CharacterName;
  expression?: Expression;
  flip?: boolean;
}

// 全 Scene が受け取る共通 Props
export interface SceneProps {
  leftCharacter?: CharacterSpec;
  rightCharacter?: CharacterSpec;
  subtitleText?: string;
  mainContentSlot?: React.ReactNode;
  subContentSlot?: React.ReactNode;
  titleSlot?: React.ReactNode;
  showAreaLabels?: boolean;
}
```

## 方針

- **座標は各 `SceneXX.tsx` 内で定数として持つ**（このプロジェクトは 22 シーンあり、各シーンで装飾が大きく違うため、中央テーブルに押し込むより各 Scene が自己完結するほうが保守しやすい）。
- ただしシーン内では「定数ブロック」を先頭に集中させる：

```tsx
// src/compositions/SceneXX.tsx の冒頭
const LAYOUT = {
  main:  { x: 100, y: 80,  w: 1720, h: 720 },
  sub:   { x: 1440, y: 80, w: 380, h: 720 },  // あるシーンのみ
  title: { x: 40, y: 20,   w: 600, h: 80 },   // あるシーンのみ
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 960, w: 1920, h: 120,
    bg: '#FFFFFF', border: '#000000', borderWidth: 2,
  },
  leftChar:  { x: 160,  y: 920, scale: 0.55 },
  rightChar: { x: 1760, y: 920, scale: 0.55 },
} as const;
```

これで Scene 実装内で座標がどこにあるか明確になり、Codex 監査時にも読みやすい。
