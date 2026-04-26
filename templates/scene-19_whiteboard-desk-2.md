---
template_id: Scene19
sub: no
title: yes
subtitle:
  kind: bar
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - body
  - chapter
  - summary
fits_content_types:
  - title_with_main
  - main_image_with_supplement
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - Scene04 とほぼ同構造（タイトル＋白板＋下部机）
  - 字幕は透明背景バー＋白文字を机の上に
  - 章立てや要点提示など定番用途に使いやすい
---

# Scene 19: Whiteboard Desk v2（タイトル＋白板＋机）

## 背景
`public/backgrounds/bg-19.jpeg`

## 特徴
- 画像4の類型。タイトルライン＋白板＋下部グレー机

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-19.jpeg',
  theme: 'dark' as const,
  title: { x: 100, y: 60, w: 1720, h: 100 },
  main:  { x: 100, y: 180, w: 1720, h: 680 },
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 180,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- Scene 04 とほぼ同じ構造。LAYOUT を流用してOK
