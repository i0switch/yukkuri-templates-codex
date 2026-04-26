---
template_id: Scene10
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
  - 背景画像が 1376x768 で寸法違い。cover でフィットするため座標目安はそのまま使える
  - サブ枠は右側縦長
  - モノクロ感を活かしたシリアス/比較話題に向く
---

# Scene 10: Monochrome 3 Panel（モノクロ3エリア）

## 背景
`public/backgrounds/bg-10.jpeg`

## 特徴
- 黒地＋白グレー3エリア構造（画像2と同型、モノクロ版）
- 寸法が他と違う（1376×768）ので cover で拡縮される

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-10.jpeg',
  theme: 'light' as const,
  main: { x: 30, y: 40, w: 1300, h: 820 },
  sub:  { x: 1360, y: 40, w: 520, h: 820 },
  subtitle: {
    kind: 'overlay' as const,
    x: 30, y: 890, w: 1860, h: 170,
  },
  leftChar:  { x: 110,  y: 970, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1810, y: 970, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- 背景が寸法違いなので cover でフィットする。座標目安はそのまま使える
- サブエリア有効化
