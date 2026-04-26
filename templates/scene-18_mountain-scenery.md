---
template_id: Scene18
sub: no
title: no
subtitle:
  kind: bar
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - intro
  - summary
  - cta
fits_content_types:
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - ぼかし山海風景＋下部グレー机のシンプル構成
  - メインは風景上半分。空領域にラベルが乗るよう位置調整
  - 字幕は机領域に透明背景バーで白文字
---

# Scene 18: Mountain Scenery（山海ぼかし＋机）

## 背景
`public/backgrounds/bg-18.jpeg`

## 特徴
- 山海風景（ぼかし）＋下部グレー机
- main は風景領域（全面）、字幕なし（机の上でテキスト重ねる想定）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-18.jpeg',
  theme: 'dark' as const,
  main: { x: 40, y: 40, w: 1840, h: 600 },  // 風景領域
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 840, w: 1920, h: 240,
    bg: 'rgba(0,0,0,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 200,  y: 920, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1720, y: 920, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- main はぼかし風景全体。風景の空部分にラベルがくるように位置調整
- 字幕は机領域（下部）に透明背景で配置
