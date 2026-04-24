# Remotion プロジェクト初期化

## 前提
- Node 18 以上 / npm 9 以上

## 1. パッケージインストール

```bash
npm init -y
npm install remotion @remotion/cli @remotion/bundler @remotion/renderer \
  @remotion/google-fonts react react-dom zod
npm install -D typescript @types/react @types/react-dom @types/node
```

## 2. ディレクトリ構成

```
project-root/
├── public/
│   ├── characters/          (配置済み：reimu/marisa/zundamon/metan)
│   └── backgrounds/
│       ├── bg-01.jpeg ... bg-22.jpeg
├── src/
│   ├── index.ts
│   ├── Root.tsx
│   ├── types.ts
│   ├── design-tokens.ts
│   ├── components/
│   │   ├── CharacterFace.tsx
│   │   ├── Background.tsx
│   │   ├── SubtitleBar.tsx
│   │   ├── SpeechBubble.tsx
│   │   └── AreaLabel.tsx
│   └── compositions/
│       ├── Scene01.tsx ... Scene22.tsx
│       └── _DebugChars.tsx
├── out/
├── docs/
├── remotion.config.ts
├── tsconfig.json
└── package.json
```

## 3. 設定ファイル

### remotion.config.ts
```ts
import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```ts
import { registerRoot } from 'remotion';
import { Root } from './Root';
registerRoot(Root);
```

### src/Root.tsx（44 Composition、map()で動的登録）

```tsx
import React from 'react';
import { Composition } from 'remotion';
import { VIDEO, CHARACTER_PAIRS } from './design-tokens';
import { Scene01 } from './compositions/Scene01';
import { Scene02 } from './compositions/Scene02';
import { Scene03 } from './compositions/Scene03';
import { Scene04 } from './compositions/Scene04';
import { Scene05 } from './compositions/Scene05';
import { Scene06 } from './compositions/Scene06';
import { Scene07 } from './compositions/Scene07';
import { Scene08 } from './compositions/Scene08';
import { Scene09 } from './compositions/Scene09';
import { Scene10 } from './compositions/Scene10';
import { Scene11 } from './compositions/Scene11';
import { Scene12 } from './compositions/Scene12';
import { Scene13 } from './compositions/Scene13';
import { Scene14 } from './compositions/Scene14';
import { Scene15 } from './compositions/Scene15';
import { Scene16 } from './compositions/Scene16';
import { Scene17 } from './compositions/Scene17';
import { Scene18 } from './compositions/Scene18';
import { Scene19 } from './compositions/Scene19';
import { Scene20 } from './compositions/Scene20';
import { Scene21 } from './compositions/Scene21';
import { Scene22 } from './compositions/Scene22';
import { DebugChars } from './compositions/_DebugChars';

const common = {
  durationInFrames: 1,
  fps: VIDEO.fps,
  width: VIDEO.width,
  height: VIDEO.height,
};

const SCENE_COMPONENTS = [
  Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08,
  Scene09, Scene10, Scene11, Scene12, Scene13, Scene14, Scene15, Scene16,
  Scene17, Scene18, Scene19, Scene20, Scene21, Scene22,
];

export const Root: React.FC = () => (
  <>
    <Composition id="DebugChars" component={DebugChars} {...common} />
    {SCENE_COMPONENTS.map((SceneComponent, i) => {
      const num = String(i + 1).padStart(2, '0');
      return (
        <React.Fragment key={num}>
          <Composition
            id={`Scene${num}_RM`}
            component={SceneComponent as React.FC<any>}
            {...common}
            defaultProps={{
              leftCharacter:  { character: CHARACTER_PAIRS.RM[0] },
              rightCharacter: { character: CHARACTER_PAIRS.RM[1] },
              subtitleText: 'ここは字幕エリア',
            }}
          />
          <Composition
            id={`Scene${num}_ZM`}
            component={SceneComponent as React.FC<any>}
            {...common}
            defaultProps={{
              leftCharacter:  { character: CHARACTER_PAIRS.ZM[0] },
              rightCharacter: { character: CHARACTER_PAIRS.ZM[1] },
              subtitleText: 'ここは字幕エリア',
            }}
          />
        </React.Fragment>
      );
    })}
  </>
);
```

## 4. package.json scripts（44 個 + 一括）

```json
{
  "scripts": {
    "studio": "remotion studio",
    "render:01-rm": "remotion render Scene01_RM out/scene-01-rm.png --frame=0",
    "render:01-zm": "remotion render Scene01_ZM out/scene-01-zm.png --frame=0",
    "render:02-rm": "remotion render Scene02_RM out/scene-02-rm.png --frame=0",
    "render:02-zm": "remotion render Scene02_ZM out/scene-02-zm.png --frame=0",
    "render:03-rm": "remotion render Scene03_RM out/scene-03-rm.png --frame=0",
    "render:03-zm": "remotion render Scene03_ZM out/scene-03-zm.png --frame=0",
    "render:04-rm": "remotion render Scene04_RM out/scene-04-rm.png --frame=0",
    "render:04-zm": "remotion render Scene04_ZM out/scene-04-zm.png --frame=0",
    "render:05-rm": "remotion render Scene05_RM out/scene-05-rm.png --frame=0",
    "render:05-zm": "remotion render Scene05_ZM out/scene-05-zm.png --frame=0",
    "render:06-rm": "remotion render Scene06_RM out/scene-06-rm.png --frame=0",
    "render:06-zm": "remotion render Scene06_ZM out/scene-06-zm.png --frame=0",
    "render:07-rm": "remotion render Scene07_RM out/scene-07-rm.png --frame=0",
    "render:07-zm": "remotion render Scene07_ZM out/scene-07-zm.png --frame=0",
    "render:08-rm": "remotion render Scene08_RM out/scene-08-rm.png --frame=0",
    "render:08-zm": "remotion render Scene08_ZM out/scene-08-zm.png --frame=0",
    "render:09-rm": "remotion render Scene09_RM out/scene-09-rm.png --frame=0",
    "render:09-zm": "remotion render Scene09_ZM out/scene-09-zm.png --frame=0",
    "render:10-rm": "remotion render Scene10_RM out/scene-10-rm.png --frame=0",
    "render:10-zm": "remotion render Scene10_ZM out/scene-10-zm.png --frame=0",
    "render:11-rm": "remotion render Scene11_RM out/scene-11-rm.png --frame=0",
    "render:11-zm": "remotion render Scene11_ZM out/scene-11-zm.png --frame=0",
    "render:12-rm": "remotion render Scene12_RM out/scene-12-rm.png --frame=0",
    "render:12-zm": "remotion render Scene12_ZM out/scene-12-zm.png --frame=0",
    "render:13-rm": "remotion render Scene13_RM out/scene-13-rm.png --frame=0",
    "render:13-zm": "remotion render Scene13_ZM out/scene-13-zm.png --frame=0",
    "render:14-rm": "remotion render Scene14_RM out/scene-14-rm.png --frame=0",
    "render:14-zm": "remotion render Scene14_ZM out/scene-14-zm.png --frame=0",
    "render:15-rm": "remotion render Scene15_RM out/scene-15-rm.png --frame=0",
    "render:15-zm": "remotion render Scene15_ZM out/scene-15-zm.png --frame=0",
    "render:16-rm": "remotion render Scene16_RM out/scene-16-rm.png --frame=0",
    "render:16-zm": "remotion render Scene16_ZM out/scene-16-zm.png --frame=0",
    "render:17-rm": "remotion render Scene17_RM out/scene-17-rm.png --frame=0",
    "render:17-zm": "remotion render Scene17_ZM out/scene-17-zm.png --frame=0",
    "render:18-rm": "remotion render Scene18_RM out/scene-18-rm.png --frame=0",
    "render:18-zm": "remotion render Scene18_ZM out/scene-18-zm.png --frame=0",
    "render:19-rm": "remotion render Scene19_RM out/scene-19-rm.png --frame=0",
    "render:19-zm": "remotion render Scene19_ZM out/scene-19-zm.png --frame=0",
    "render:20-rm": "remotion render Scene20_RM out/scene-20-rm.png --frame=0",
    "render:20-zm": "remotion render Scene20_ZM out/scene-20-zm.png --frame=0",
    "render:21-rm": "remotion render Scene21_RM out/scene-21-rm.png --frame=0",
    "render:21-zm": "remotion render Scene21_ZM out/scene-21-zm.png --frame=0",
    "render:22-rm": "remotion render Scene22_RM out/scene-22-rm.png --frame=0",
    "render:22-zm": "remotion render Scene22_ZM out/scene-22-zm.png --frame=0",
    "render:rm":  "for i in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22; do npm run render:${i}-rm || exit 1; done",
    "render:zm":  "for i in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22; do npm run render:${i}-zm || exit 1; done",
    "render:all": "npm run render:rm && npm run render:zm"
  }
}
```

※ `render:rm` / `render:zm` / `render:all` は bash 前提。Windows の場合は PowerShell スクリプトに置換。

## 5. .gitignore

```
node_modules/
out/
.cache/
*.log
.DS_Store
```

## 6. 動作確認

```bash
npm run studio
```

ブラウザで以下を確認：
- `DebugChars` で 4 キャラの顔が表示される
- `Scene01_RM` と `Scene01_ZM` が両方プレビューに出ている
- 各シーンに「ここはメインコンテンツエリア」「ここは字幕エリア」等のラベルが表示される
