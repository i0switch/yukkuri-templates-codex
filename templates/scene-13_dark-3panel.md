---
template_id: Scene13
sub: yes
title: no
subtitle:
  kind: overlay
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - body
  - comparison
  - chapter
fits_content_types:
  - main_image_with_supplement
  - 3panel_explanation
sub_recommended_kind:
  - text
  - bullets
  - image
notes:
  - 黒地＋枠線のみの3エリア。theme は light
  - 字幕は中央寄せの背景枠に overlay で重ねる
  - シリアス/SFトーンの比較や章立てに向く
---

# Scene 13: Dark 3 Panel（黒3エリア）

## 背景
`public/backgrounds/bg-13.jpeg`

## 特徴
- 黒地＋枠線のみの3エリア（画像3と同型、字幕は中央寄せ）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-13.jpeg',
  theme: 'light' as const,
  main: { x: 30, y: 20, w: 1260, h: 810 },
  sub:  { x: 1320, y: 20, w: 560, h: 810 },
  subtitle: {
    kind: 'overlay' as const,
    x: 230, y: 870, w: 1460, h: 200,
  },
  leftChar:  { x: 110,  y: 960, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1810, y: 960, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- theme: 'light'
- 字幕は中央寄せ枠の中（背景に既に枠描画あり）
