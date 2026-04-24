# Scene 08: Japanese Room with Tag（和室＋タイトル札＋白板）

## 背景
`public/backgrounds/bg-08.jpeg`

## 特徴
- 和室背景＋紅葉外景＋中央白板＋白板上部にタイトル札

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-08.jpeg',
  theme: 'dark' as const,
  title: { x: 860, y: 0, w: 200, h: 80 },     // 札の内側（背景に描かれた位置）
  main:  { x: 300, y: 90, w: 1320, h: 760 },  // 白板の内側
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 220,  y: 960, scale: 0.55, expression: 'laugh' as const },
  rightChar: { x: 1700, y: 960, scale: 0.55, expression: 'laugh' as const },
} as const;
```

## 実装の注意
- タイトルエリアは和風の札サイズに合わせて小さめ
- キャラは机の上パターンB
