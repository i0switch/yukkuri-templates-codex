---
template_id: Scene06
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
  - メインは中央メカ板の内側のみ（外側のパネル装飾を覆わない）
  - 字幕は下部金属帯に overlay として重ねる
  - スチームパンク/SF系のテーマに合わせやすい
---

# Scene 06: Mech Panel（メカ世界＋中央板）

## 背景
`public/backgrounds/bg-06.jpeg`

## 特徴
- スチームパンク的メカ背景＋中央の金属板＋下部金属帯

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-06.jpeg',
  theme: 'dark' as const,
  main: { x: 400, y: 80, w: 1120, h: 670 },  // 中央金属板の内側
  subtitle: {
    kind: 'overlay' as const,
    x: 240, y: 820, w: 1440, h: 180,
  },
  leftChar:  { x: 160,  y: 910, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1760, y: 910, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- メインエリアは中央メカ板の内側のみ。外のメカパネル装飾に被らない
- 字幕は背景の下部金属帯に重ねる
