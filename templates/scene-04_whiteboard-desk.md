# Scene 04: Whiteboard with Desk（白ボード＋下部机）

## 背景
`public/backgrounds/bg-04.jpeg`

## 特徴
- 大きな白ボード全面＋上部にタイトルライン＋下部グレー机
- タイトルエリアあり、メインは白板の下半分、下部机にキャラ

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-04.jpeg',
  theme: 'dark' as const,
  title: { x: 100, y: 60, w: 1720, h: 100 },
  main:  { x: 100, y: 180, w: 1720, h: 680 },
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',  // グレー机に対し白文字
  },
  leftChar:  { x: 180,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- タイトルエリアも有効化
- キャラは机の上に乗るパターンB
