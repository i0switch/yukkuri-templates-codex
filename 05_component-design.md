# コンポーネント設計指針

## 全体像

```
Scene (各シーン固有、22 ファイル)
  ├─ Background         (bg-XX.jpeg をそのまま)
  ├─ (シーン固有の装飾レイヤー：基本なし、背景画像が装飾を持つ)
  ├─ [メインコンテンツエリア]
  │    └─ mainContentSlot ?? <AreaLabel kind="main" />
  ├─ [サブコンテンツエリア] (あるシーンのみ)
  │    └─ subContentSlot ?? <AreaLabel kind="sub" />
  ├─ [タイトルエリア] (あるシーンのみ)
  │    └─ titleSlot ?? <AreaLabel kind="title" />
  ├─ [キャラエリア]
  │    ├─ CharacterFace(left)
  │    └─ CharacterFace(right)
  └─ [字幕エリア]
       └─ SubtitleBar / SpeechBubble / <AreaLabel kind="subtitle" />
```

## 1. CharacterFace（共通コンポーネント）

### 実装（src/components/CharacterFace.tsx）

```tsx
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  CharacterName, Expression,
  CHARACTER_METRICS, EXPRESSION_FILE,
} from '../design-tokens';

interface Props {
  character: CharacterName;
  expression?: Expression;
  x: number;       // 顔中心 x
  y: number;       // 顔中心 y
  scale?: number;
  flip?: boolean;
}

export const CharacterFace: React.FC<Props> = ({
  character, expression = 'neutral',
  x, y, scale = 0.55, flip = false,
}) => {
  const m = CHARACTER_METRICS[character];
  const file = EXPRESSION_FILE[expression];
  const src = staticFile(`${m.composeDir}/${file}`);

  const faceH = m.imgH * m.faceHeightRatio;
  const displayH = faceH * scale;
  const imgDisplayH = displayH / m.faceHeightRatio;
  const imgDisplayW = m.imgW * (imgDisplayH / m.imgH);

  const faceCenterInImgX = m.imgW * m.faceCenterRatio.x;
  const faceCenterInImgY = m.imgH * m.faceCenterRatio.y;
  const scaleRatio = imgDisplayW / m.imgW;

  return (
    <div style={{
      position: 'absolute',
      left: x - imgDisplayW / 2,
      top: y - displayH / 2,
      width: imgDisplayW,
      height: displayH,
      overflow: 'hidden',
    }}>
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: (imgDisplayW / 2) - faceCenterInImgX * scaleRatio,
          top: -faceCenterInImgY * scaleRatio + displayH / 2,
          width: imgDisplayW,
          height: imgDisplayH,
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      />
    </div>
  );
};
```

## 2. Background

```tsx
// src/components/Background.tsx
import React from 'react';
import { Img, staticFile, AbsoluteFill } from 'remotion';

interface Props {
  src: string;                // '/backgrounds/bg-01.jpeg' 等
  fallbackColor?: string;
}

export const Background: React.FC<Props> = ({ src, fallbackColor = '#EEEEEE' }) => (
  <AbsoluteFill style={{ backgroundColor: fallbackColor }}>
    <Img
      src={staticFile(src)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);
```

## 3. SubtitleBar

```tsx
// src/components/SubtitleBar.tsx
import React from 'react';
import { FONTS, FS } from '../design-tokens';

interface Props {
  text: string;
  x: number; y: number; width: number; height: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  textAlign?: 'left' | 'center';
  fontSize?: number;
  fontWeight?: number | string;
}

export const SubtitleBar: React.FC<Props> = ({
  text, x, y, width, height,
  bg = '#FFFFFF',
  borderColor,
  borderWidth = 0,
  borderRadius = 8,
  textColor = '#1A1A1A',
  textAlign = 'center',
  fontSize = FS.subtitle,
  fontWeight = 500,
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width, height,
    background: bg,
    border: borderColor ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: textAlign === 'center' ? 'center' : 'flex-start',
    padding: '0 40px',
    fontFamily: FONTS.subtitle,
    fontSize, fontWeight,
    color: textColor,
    boxSizing: 'border-box',
  }}>{text}</div>
);
```

## 4. SpeechBubble

吹き出し字幕が必要なシーン（12, 19）用。

```tsx
// src/components/SpeechBubble.tsx
import React from 'react';
import { FONTS, FS } from '../design-tokens';

interface Props {
  text: string;
  x: number; y: number; width: number; height: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  tailSide?: 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  tailSize?: number;
  tailOffset?: number;
  textColor?: string;
  fontSize?: number;
}

export const SpeechBubble: React.FC<Props> = ({
  text, x, y, width, height,
  bg = '#FFFFFF',
  borderColor = '#1A1A1A',
  borderWidth = 3,
  borderRadius = 16,
  tailSide = 'left',
  tailSize = 28,
  tailOffset,
  textColor = '#1A1A1A',
  fontSize = FS.subtitle,
}) => {
  // tailSide の実装は簡単のため left/right のみサポート。
  // bottom-*/top-* が必要な場合は Scene 内で SVG 直書きする。
  const tY = tailOffset ?? height / 2;
  const tailPoints = tailSide === 'left'
    ? `0,${tY} ${tailSize},${tY - tailSize / 2} ${tailSize},${tY + tailSize / 2}`
    : `${width},${tY} ${width - tailSize},${tY - tailSize / 2} ${width - tailSize},${tY + tailSize / 2}`;
  const bodyLeft = tailSide === 'left' ? tailSize - 2 : 0;
  const bodyWidth = width - tailSize + 2;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <rect
          x={bodyLeft} y={0}
          width={bodyWidth} height={height}
          rx={borderRadius} ry={borderRadius}
          fill={bg} stroke={borderColor} strokeWidth={borderWidth}
        />
        <polygon points={tailPoints}
          fill={bg} stroke={borderColor} strokeWidth={borderWidth} />
        {/* body と tail の接合線を消す */}
        <line
          x1={tailSide === 'left' ? tailSize : width - tailSize}
          y1={tY - tailSize / 2 + borderWidth / 2}
          x2={tailSide === 'left' ? tailSize : width - tailSize}
          y2={tY + tailSize / 2 - borderWidth / 2}
          stroke={bg} strokeWidth={borderWidth + 1}
        />
      </svg>
      <div style={{
        position: 'absolute',
        left: tailSide === 'left' ? tailSize + 20 : 20,
        right: tailSide === 'right' ? tailSize + 20 : 20,
        top: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONTS.subtitle, fontSize, color: textColor,
        textAlign: 'center',
      }}>{text}</div>
    </div>
  );
};
```

## 5. AreaLabel（新規・重要）

メインコンテンツ / サブコンテンツ / タイトル / 字幕エリアに
**デフォルトで表示されるプレースホルダラベル**。

```tsx
// src/components/AreaLabel.tsx
import React from 'react';
import { FONTS, FS, COLORS } from '../design-tokens';

type Kind = 'main' | 'sub' | 'title' | 'subtitle';
type Theme = 'light' | 'dark';

interface Props {
  kind: Kind;
  theme?: Theme;   // default: 'dark'（白地背景想定）。暗い背景なら 'light' に。
  label?: string;  // 未指定なら kind から自動生成
}

const DEFAULT_LABELS: Record<Kind, string> = {
  main:     'ここはメインコンテンツエリア',
  sub:      'ここはサブコンテンツエリア',
  title:    'ここはタイトルエリア',
  subtitle: 'ここは字幕エリア',
};

export const AreaLabel: React.FC<Props> = ({
  kind, theme = 'dark', label,
}) => {
  const stroke = theme === 'dark' ? COLORS.areaLabelStrokeDark : COLORS.areaLabelStrokeLight;
  const textColor = theme === 'dark' ? COLORS.areaLabelTextDark : COLORS.areaLabelTextLight;
  const bg = theme === 'dark' ? COLORS.areaLabelBgDark : COLORS.areaLabelBgLight;
  const fs = kind === 'title' || kind === 'subtitle' ? FS.areaLabelSmall : FS.areaLabel;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `3px dashed ${stroke}`,
      background: bg,
      color: textColor,
      fontFamily: FONTS.ui,
      fontSize: fs,
      fontWeight: 700,
      letterSpacing: '0.06em',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      textAlign: 'center',
      padding: 16,
    }}>
      {label ?? DEFAULT_LABELS[kind]}
    </div>
  );
};
```

## 6. DebugChars（Phase 0 動作確認用）

```tsx
// src/compositions/_DebugChars.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CharacterFace } from '../components/CharacterFace';

export const DebugChars: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#DDD' }}>
    <CharacterFace character="reimu"    expression="neutral" x={200}  y={540} scale={0.6} />
    <CharacterFace character="marisa"   expression="happy"   x={700}  y={540} scale={0.6} />
    <CharacterFace character="zundamon" expression="smile"   x={1200} y={540} scale={0.6} />
    <CharacterFace character="metan"    expression="laugh"   x={1700} y={540} scale={0.6} />
  </AbsoluteFill>
);
```

## 7. Scene 実装の共通テンプレート

各 `SceneXX.tsx` はこの形をベースにする。定数ブロック（`LAYOUT`）を
各シーン固有に書き換えるだけで基本は動く：

```tsx
// src/compositions/SceneXX.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from '../components/Background';
import { CharacterFace } from '../components/CharacterFace';
import { SubtitleBar } from '../components/SubtitleBar';
import { AreaLabel } from '../components/AreaLabel';
import type { SceneProps } from '../types';

// ─────────────────────────────────────────────
// レイアウト定数（背景画像を見て Claude Code が決める）
// ─────────────────────────────────────────────
const LAYOUT = {
  bgSrc: '/backgrounds/bg-XX.jpeg',
  theme: 'dark' as const, // 背景の明るさで 'dark' or 'light'
  main:  { x: 100, y: 80,  w: 1720, h: 720 },
  // sub:   { x: 1440, y: 80, w: 380, h: 720 },   // 必要なシーンのみ
  // title: { x: 40, y: 20,   w: 600, h: 80 },    // 必要なシーンのみ
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 960, w: 1920, h: 120,
    bg: '#FFFFFF', borderWidth: 0, borderRadius: 0,
    textColor: '#1A1A1A',
  },
  leftChar:  { x: 160,  y: 920, scale: 0.55, expression: 'neutral' as const },
  rightChar: { x: 1760, y: 920, scale: 0.55, expression: 'smile' as const },
} as const;

export const SceneXX: React.FC<SceneProps> = ({
  leftCharacter  = { character: 'reimu'  },
  rightCharacter = { character: 'marisa' },
  subtitleText   = 'ここは字幕エリア',
  mainContentSlot,
  subContentSlot,
  titleSlot,
}) => (
  <AbsoluteFill>
    <Background src={LAYOUT.bgSrc} />

    {/* メインコンテンツエリア */}
    <div style={{
      position: 'absolute',
      left: LAYOUT.main.x, top: LAYOUT.main.y,
      width: LAYOUT.main.w, height: LAYOUT.main.h,
    }}>
      {mainContentSlot ?? <AreaLabel kind="main" theme={LAYOUT.theme} />}
    </div>

    {/* サブコンテンツエリア（あれば） */}
    {/* <div style={{ position: 'absolute', ...LAYOUT.sub }}>
      {subContentSlot ?? <AreaLabel kind="sub" theme={LAYOUT.theme} />}
    </div> */}

    {/* タイトルエリア（あれば） */}
    {/* <div style={{ position: 'absolute', ...LAYOUT.title }}>
      {titleSlot ?? <AreaLabel kind="title" theme={LAYOUT.theme} />}
    </div> */}

    {/* キャラ */}
    <CharacterFace
      character={leftCharacter.character}
      expression={leftCharacter.expression ?? LAYOUT.leftChar.expression}
      x={LAYOUT.leftChar.x} y={LAYOUT.leftChar.y} scale={LAYOUT.leftChar.scale}
      flip={leftCharacter.flip}
    />
    <CharacterFace
      character={rightCharacter.character}
      expression={rightCharacter.expression ?? LAYOUT.rightChar.expression}
      x={LAYOUT.rightChar.x} y={LAYOUT.rightChar.y} scale={LAYOUT.rightChar.scale}
      flip={rightCharacter.flip}
    />

    {/* 字幕 */}
    <SubtitleBar
      text={subtitleText}
      x={LAYOUT.subtitle.x} y={LAYOUT.subtitle.y}
      width={LAYOUT.subtitle.w} height={LAYOUT.subtitle.h}
      bg={LAYOUT.subtitle.bg}
      borderWidth={LAYOUT.subtitle.borderWidth}
      borderRadius={LAYOUT.subtitle.borderRadius}
      textColor={LAYOUT.subtitle.textColor}
    />
  </AbsoluteFill>
);
```

SpeechBubble が必要なシーンや、サブエリア/タイトルエリアが必要なシーンは
コメントアウトされている部分を有効化する。
