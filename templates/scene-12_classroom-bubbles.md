# Scene 12: Classroom Speech Bubbles（教室＋吹き出し×2）

## 背景
`public/backgrounds/bg-12.jpeg`

## 特徴
- 教室ホワイトボード＋左上タイトル吹き出し（背景に描かれている）＋下部右側に字幕吹き出し
- 吹き出しの位置は背景に既にあるので、その内側にラベルを配置するだけ

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-12.jpeg',
  theme: 'dark' as const,
  title:    { x: 40, y: 10, w: 780, h: 80 },       // 左上吹き出し内
  main:     { x: 130, y: 140, w: 1660, h: 600 },   // ホワイトボード内
  subtitle: {
    kind: 'overlay' as const,
    x: 620, y: 880, w: 1260, h: 160,
  },
  leftChar:  { x: 170,  y: 960, scale: 0.55, expression: 'happy' as const },
  rightChar: { x: 490,  y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- title エリア有効化
- subtitle は背景にすでに吹き出しが描かれているので overlay でラベルのみ
- キャラは下部左寄りに2体並べる（パターンC）。字幕吹き出しとキャラで横並び
