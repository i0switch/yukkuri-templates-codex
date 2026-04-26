---
template_id: Scene16
sub: no
title: yes
subtitle:
  kind: overlay
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - chapter
  - body
  - summary
fits_content_types:
  - title_with_main
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - 上下に黒系のタイトル/字幕帯、中央に大きなメインパネル
  - 全体 theme: light（黒背景）
  - キャラは画面端ギリギリに配置するためサイドの装飾と被らないよう注意
---

# Scene 16: SF 3-Stack Dark（SF3段パネル暗）

## 背景
`public/backgrounds/bg-16.jpeg`

## 特徴
- SF風パネル3段（全部黒系）
  - 上部タイトル帯
  - 中央メインパネル
  - 下部字幕帯

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-16.jpeg',
  theme: 'light' as const,
  title:    { x: 70, y: 20,  w: 1780, h: 100 },
  main:     { x: 70, y: 130, w: 1780, h: 720 },
  subtitle: {
    kind: 'overlay' as const,
    x: 70, y: 880, w: 1780, h: 170,
  },
  leftChar:  { x: 70,   y: 960, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1850, y: 960, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- キャラは字幕帯の左右外側の端（画面端ギリギリ）
- 全エリア theme: 'light'（黒背景）
