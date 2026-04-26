---
template_id: Scene11
sub: no
title: no
subtitle:
  kind: bar
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
  - メインは白ボード内。右上UIアイコン領域を避けて幅をやや狭めに取る
  - サブ枠なし（右上UIが背景描画されているため）
  - 字幕は透明背景バーで黒机の上に白文字
---

# Scene 11: Whiteboard with UI Icons（白ボード＋右上UI）

## 背景
`public/backgrounds/bg-11.jpeg`

## 特徴
- 近未来白ボード＋右上に時計/共有アイコン（背景に既にある）＋下部黒机

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-11.jpeg',
  theme: 'dark' as const,
  main: { x: 80, y: 40, w: 1640, h: 820 },  // 白ボード内（右上UIは避ける）
  // sub を書いても背景にアイコンが既にあるため冗長。スキップ
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 200,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1720, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- main は右上UIアイコンを避けるために幅を少し狭める
- キャラは下部黒机の上パターンB
