# Scene 01: Watercolor Frame（水彩外枠＋クリーム内側）

## 背景
`public/backgrounds/bg-01.jpeg`

## 特徴
- 薄水色の水彩外枠＋中央クリーム色の内枠
- 空きスペースは内枠全体（ほぼ全画面）
- 字幕帯なし。内枠内に全てを配置

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-01.jpeg',
  theme: 'dark' as const,
  main:     { x: 100, y: 90,  w: 1720, h: 780 },
  subtitle: {
    kind: 'bar' as const,
    x: 160, y: 900, w: 1600, h: 120,
    bg: 'rgba(255,255,255,0.88)',
    borderWidth: 0, borderRadius: 12,
    textColor: '#1A1A1A',
  },
  leftChar:  { x: 180,  y: 960, scale: 0.50, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.50, expression: 'smile' as const },
} as const;
```

## 実装の注意
- 背景の外枠は覆わないように、全要素を (60, 60) 〜 (1860, 1020) の内側に収める
- 共通テンプレートそのまま使用可能
