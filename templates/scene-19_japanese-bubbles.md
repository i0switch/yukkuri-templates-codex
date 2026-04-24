# Scene 19: Japanese Room Bubbles（和室＋吹き出し×2）

## 背景
`public/backgrounds/bg-19.jpeg`

## 特徴
- 和室背景＋左上タイトル吹き出し＋下部中央字幕吹き出し
- 画像12の和室版

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-19.jpeg',
  theme: 'dark' as const,
  title:    { x: 30, y: 10,  w: 780, h: 80 },
  main:     { x: 130, y: 130, w: 1660, h: 620 },
  subtitle: {
    kind: 'overlay' as const,
    x: 380, y: 870, w: 1160, h: 160,
  },
  leftChar:  { x: 200,  y: 980, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1720, y: 980, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- title と subtitle の overlay はそれぞれの吹き出しの内側に配置
- キャラは下部両端（パターンB寄り）
