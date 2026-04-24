# Scene 20: Whiteboard Desk v2（タイトル＋白板＋机）

## 背景
`public/backgrounds/bg-20.jpeg`

## 特徴
- 画像4の類型。タイトルライン＋白板＋下部グレー机

## LAYOUT 定数

```ts
const LAYOUT = {
  bgSrc: '/backgrounds/bg-20.jpeg',
  theme: 'dark' as const,
  title: { x: 100, y: 60, w: 1720, h: 100 },
  main:  { x: 100, y: 180, w: 1720, h: 680 },
  subtitle: {
    kind: 'bar' as const,
    x: 0, y: 880, w: 1920, h: 200,
    bg: 'rgba(255,255,255,0.0)', borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar:  { x: 180,  y: 960, scale: 0.55, expression: 'smile' as const },
  rightChar: { x: 1740, y: 960, scale: 0.55, expression: 'smile' as const },
} as const;
```

## 実装の注意
- Scene 04 とほぼ同じ構造。LAYOUT を流用してOK
