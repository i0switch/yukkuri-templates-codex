---
template_id: Scene07
sub: no
title: no
subtitle:
  kind: overlay
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - body
  - chapter
fits_content_types:
  - main_image_with_supplement
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - メインは中央ガラス板の内側のみに収める
  - 右側に顕微鏡/モニターの装飾があるので右キャラの位置が被らないよう注意
  - 研究/解説/分析系の話題に向く
---

# Scene 07: Laboratory Glass（研究室＋ガラス板）

## 背景
`public/backgrounds/bg-07.jpeg`

## 特徴
- 研究室背景＋中央の半透明ガラス板＋下部字幕枠
- 右側に顕微鏡・モニターなど装飾機材

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-07.jpeg',
  theme: 'dark' as const,
  main: { x: 280, y: 20, w: 1360, h: 700 },  // ガラス板の内側
  subtitle: {
    kind: 'overlay' as const,
    x: 240, y: 760, w: 1440, h: 220,
  },
  leftChar:  { x: 140,  y: 900, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1780, y: 900, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- 右側の顕微鏡・モニター装飾に右キャラが被らないように x 座標を注意
- メインエリアはガラス板の内側のみ
