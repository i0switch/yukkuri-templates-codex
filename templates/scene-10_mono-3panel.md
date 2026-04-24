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
