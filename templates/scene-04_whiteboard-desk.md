---
template_id: Scene04
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
  - main_image_with_supplement
  - single_main_image
  - title_with_main
sub_recommended_kind:
  - null
notes:
  - 上部にタイトル枠あり。タイトル文を入れて章立てに使うのが自然
  - 下部のグレー机にキャラを乗せる（パターンB）
  - サブ枠は持たない単一メイン構成
---

# Scene 04: Whiteboard with Desk（白ボード＋下部机）

## 背景
`public/backgrounds/bg-04.jpeg`

## 特徴
- 大きな白ボード全面＋上部にタイトルライン＋下部グレー机
- タイトルエリアあり、メインは白板の下半分、下部机にキャラ

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-04.jpeg',
  theme: 'dark' as const,
  title: { x: 100, y: 60, w: 1720, h: 100 },
  main:  { x: 100, y: 180, w: 1720, h: 680 },
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',  // グレー机に対し白文字
  },
  leftChar:  { x: 180,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- タイトルエリアも有効化
- キャラは机の上に乗るパターンB
