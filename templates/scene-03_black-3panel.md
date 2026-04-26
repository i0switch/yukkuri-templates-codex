---
template_id: Scene03
sub: yes
title: no
subtitle:
  kind: bar
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
  - 黒地＋白ラインの3枠構造。theme は light で AreaLabel を白系に
  - 字幕は背景下部の枠の中に bar（透明背景＋白文字）
  - サブ枠は右側の縦長領域
---

# Scene 03: Black 3 Panel（黒ライン3エリア）

## 背景
`public/backgrounds/bg-03.jpeg`

## 特徴
- 背景が黒地＋白ラインの3枠構造
- 左上メイン枠、右縦長サブ枠、下部中央寄せの字幕枠

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-03.jpeg',
  theme: 'light' as const,  // 黒背景なので明るいテーマ
  main: { x: 40, y: 30, w: 1280, h: 790 },
  sub:  { x: 1380, y: 30, w: 500, h: 790 },
  subtitle: {
    kind: 'bar' as const,
    x: 180, y: 880, w: 1560, h: 180,
    bg: 'rgba(0,0,0,0.0)',  // 枠は背景側、ここは透明
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 110,  y: 970, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1810, y: 970, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- theme: 'light' で AreaLabel を白系にする
- キャラは下部字幕枠の左右外側（枠に少しかぶる程度）
