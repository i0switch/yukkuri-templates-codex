---
template_id: Scene05
sub: no
title: no
subtitle:
  kind: overlay
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - intro
  - body
  - cta
fits_content_types:
  - main_image_with_supplement
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - 背景の幾何分割に対し、メインは上半分の広い領域、字幕は下部の白枠に overlay
  - 装飾性が高いのでテキスト過多を避け、ビジュアル中心の場面に向く
---

# Scene 05: Geometric Subtitle（幾何斜め＋下部字幕）

## 背景
`public/backgrounds/bg-05.jpeg`

## 特徴
- クリーム色と薄水色の幾何学斜め分割
- 下部中央寄りに字幕用白枠あり（背景に既に枠が描かれている）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-05.jpeg',
  theme: 'dark' as const,
  main: { x: 60, y: 60, w: 1800, h: 720 },
  subtitle: {
    kind: 'overlay' as const,  // 背景の白枠に重ねる
    x: 300, y: 820, w: 1320, h: 180,
  },
  leftChar:  { x: 150,  y: 920, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1770, y: 920, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- 字幕は背景の白枠内にテキストまたは AreaLabel を重ねる
- キャラは下部中央寄りの字幕枠の左右端
