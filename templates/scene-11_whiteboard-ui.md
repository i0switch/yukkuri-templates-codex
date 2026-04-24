# Scene 11: Whiteboard with UI Icons（白ボード＋右上UI）

## 背景
`public/backgrounds/bg-11.jpeg`

## 特徴
- 近未来白ボード＋右上に時計/共有アイコン（背景に既にある）＋下部黒机

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-11.jpeg',
  theme: 'dark' as const,
  main: { x: 80, y: 40, w: 1640, h: 820 },  // 白ボード内（右上UIは避ける）
  // sub を書いても背景にアイコンが既にあるため冗長。スキップ
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 200,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1720, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- main は右上UIアイコンを避けるために幅を少し狭める
- キャラは下部黒机の上パターンB
