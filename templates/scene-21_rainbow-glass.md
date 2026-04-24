# Scene 21: Rainbow Glass（虹色光線＋中央ガラス＋下字幕）

## 背景
`public/backgrounds/bg-21.jpeg`

## 特徴
- 虹色光線の背景＋中央の大きなガラス枠＋下部字幕枠（背景に既に枠描画）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-21.jpeg',
  theme: 'dark' as const,
  main: { x: 240, y: 30, w: 1440, h: 750 },   // 中央ガラス枠の内側
  subtitle: {
    kind: 'overlay' as const,
    x: 380, y: 810, w: 1160, h: 180,
  },
  leftChar:  { x: 150,  y: 900, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1770, y: 900, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- main はガラス枠の内側のみ
- 字幕は下部字幕枠 overlay
