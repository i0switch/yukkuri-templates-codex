---
template_id: Scene09
sub: no
title: no
subtitle:
  kind: bar
  position: bottom
character_layout: edge
coordinate_base: 1920x1080
intended_uses:
  - intro
  - cta
  - summary
fits_content_types:
  - single_main_image
sub_recommended_kind:
  - null
notes:
  - 上下黒帯＋中央ベージュ巻物風帯。シネマ感のある印象的な切り出しに向く
  - メインはベージュ帯の内側のみ。上下黒帯にはキャラもラベルも置かない
  - キャラはベージュ帯の左右端に大きめに配置
---

# Scene 09: Cinema Bar（シネマバー中央ベージュ）

## 背景
`public/backgrounds/bg-09.jpeg`

## 特徴
- 上下黒帯＋中央ベージュ巻物風帯
- シンプル構成。字幕エリアなし（main のみ）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-09.jpeg',
  theme: 'dark' as const,
  main: { x: 80, y: 130, w: 1760, h: 780 },   // 中央ベージュ帯の内側
  subtitle: {
    kind: 'bar' as const,
    x: 240, y: 750, w: 1440, h: 140,
    bg: 'rgba(255,255,255,0.85)', borderWidth: 0, borderRadius: 12,
    textColor: '#1A1A1A',
  },
  leftChar:  { x: 200,  y: 540, scale: 0.60, expression: 'smile' as const },
  rightChar: { x: 1720, y: 540, scale: 0.60, expression: 'smile' as const },
} as const;
```

## 実装の注意
- 中央ベージュ帯が main エリア。字幕は main の下半分に配置
- キャラはベージュ帯の左右端（上下黒帯の上には絶対置かない）
