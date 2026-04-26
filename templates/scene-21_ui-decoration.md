---
template_id: Scene21
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
  - single_main_image
  - main_image_with_supplement
sub_recommended_kind:
  - null
notes:
  - 左右にスマホUI装飾（背景の一部）。実装側でUIは描かない
  - メインは中央の白い余白領域のみ
  - キャラはUI装飾に被らないよう中央余白の左右端に配置
---

# Scene 21: UI Decoration（UI装飾＋中央余白＋下字幕）

## 背景
`public/backgrounds/bg-21.jpeg`

## 特徴
- 左右にスマホUI装飾（背景の一部）＋中央に白い余白＋下部字幕枠

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-21.jpeg',
  theme: 'dark' as const,
  main: { x: 400, y: 60, w: 1120, h: 720 },   // 中央の白い余白領域
  subtitle: {
    kind: 'overlay' as const,
    x: 330, y: 820, w: 1260, h: 160,
  },
  leftChar:  { x: 420,  y: 900, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1500, y: 900, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- キャラは左右のUI装飾に被らないよう、中央白余白の左右端に配置
- 左右のUI装飾は背景の一部なので実装で描かない
