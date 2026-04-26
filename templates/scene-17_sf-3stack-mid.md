---
template_id: Scene17
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
  - Scene16 と類似だが中央メインパネルだけ明るめグレー
  - main の AreaLabel は theme=dark、title/subtitle は theme=light を使い分ける
  - 視認性のため中央に大きめのビジュアルを置く章立てに向く
---

# Scene 17: SF 3-Stack Mid（SF3段パネル中央明）

## 背景
`public/backgrounds/bg-17.jpeg`

## 特徴
- 画像16と酷似、中央パネルだけ明るめグレー
- theme の切り替えだけ注意（中央メインは dark、タイトル/字幕は light）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-17.jpeg',
  theme: 'light' as const,  // デフォルトは黒背景のため light
  title:    { x: 70, y: 20,  w: 1780, h: 100 },
  main:     { x: 70, y: 130, w: 1780, h: 720 },   // 中央は明るめなので、main だけ dark テーマが望ましい
  subtitle: {
    kind: 'overlay' as const,
    x: 70, y: 880, w: 1780, h: 170,
  },
  leftChar:  { x: 70,   y: 960, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1850, y: 960, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- main の AreaLabel は `theme="dark"` を渡す（中央が明るい）
- title と subtitle の AreaLabel は `theme="light"`（黒帯の上）
- Scene 内でラベルごとに theme を切り替える例:

```tsx
<div style={{ position: 'absolute', ...LAYOUT.main }}>
  {mainContentSlot ?? <AreaLabel kind="main" theme="dark" />}
</div>
<div style={{ position: 'absolute', ...LAYOUT.title }}>
  {titleSlot ?? <AreaLabel kind="title" theme="light" />}
</div>
```
