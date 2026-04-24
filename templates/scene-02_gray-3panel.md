# Scene 02: Gray 3 Panel（グレー3分割）

## 背景
`public/backgrounds/bg-02.jpeg`

## 特徴
- 背景が既に3エリア枠を持っている
  - 左上: 大きな中間グレー枠（メインコンテンツ用）
  - 右上: 縦長白枠（サブコンテンツ用）
  - 下部: 全幅白帯（字幕エリア用）

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-02.jpeg',
  theme: 'dark' as const,
  main: { x: 40, y: 30, w: 1300, h: 800 },
  sub:  { x: 1390, y: 30, w: 490, h: 800 },
  subtitle: {
    kind: 'overlay' as const,  // 背景の白帯の中にテキストを直接配置
    x: 30, y: 880, w: 1860, h: 190,
  },
  leftChar:  { x: 120,  y: 970, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1800, y: 970, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- サブエリアを有効化する（コメントアウト解除）
- 字幕は背景の白帯の上に AreaLabel（theme=dark）or SubtitleBar（bg=transparent）を重ねる
- キャラは字幕白帯の左右端に被せる
