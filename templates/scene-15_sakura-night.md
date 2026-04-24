# Scene 15: Sakura Night（和風夜桜＋左上タイトル＋下字幕）

## 背景
`public/backgrounds/bg-15.jpeg`

## 特徴
- 紺地＋和風金装飾＋桜の花びら＋左上金枠タイトル＋下部金枠紺字幕帯

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-15.jpeg',
  theme: 'light' as const,  // 紺背景
  title: { x: 30, y: 40, w: 760, h: 130 },    // 左上金枠内
  main:  { x: 60, y: 200, w: 1800, h: 650 },  // 中央夜空領域
  subtitle: {
    kind: 'overlay' as const,
    x: 360, y: 870, w: 1200, h: 180,
  },
  leftChar:  { x: 180,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- theme: 'light'（紺背景だから）
- title と subtitle は背景の金枠を活かすため overlay
- main は桜装飾が少ない中央領域
