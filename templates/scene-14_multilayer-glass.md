---
template_id: Scene14
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
  - summary
fits_content_types:
  - main_image_with_supplement
  - 3panel_explanation
sub_recommended_kind:
  - text
  - bullets
  - image
notes:
  - 5エリア構成（main/sub/subtitle/左キャラ枠/右キャラ枠）の最多レイアウト
  - キャラは左右の小スロットに収めるため scale 0.45 と小さめ
  - 情報密度を高めたい場面、ダッシュボード的な見せ方に向く
---

# Scene 14: Multilayer Glass UI（多層ガラスUI・最多5エリア）

## 背景
`public/backgrounds/bg-14.jpeg`

## 特徴
- 5 エリア構成（このプロジェクトで最も複雑）
  - 中央大: メインコンテンツ
  - 右縦長: サブコンテンツ
  - 下部中央: 字幕
  - 下部左端小枠: 左キャラスロット
  - 下部右端小枠: 右キャラスロット

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-14.jpeg',
  theme: 'dark' as const,
  main: { x: 160, y: 60, w: 1420, h: 780 },
  sub:  { x: 1620, y: 60, w: 280, h: 780 },
  subtitle: {
    kind: 'overlay' as const,
    x: 180, y: 860, w: 1420, h: 200,
  },
  // キャラは左右下部の小枠の中心に配置
  leftChar:  { x: 80,   y: 960, scale: 0.45, expression: 'smile' as const },
  rightChar: { x: 1840, y: 960, scale: 0.45, expression: 'smile' as const },
} as const;
```

## 実装の注意
- キャラは小スロットに収めるため scale 0.45 と小さめ
- 全エリアのラベルが表示されることを確認
