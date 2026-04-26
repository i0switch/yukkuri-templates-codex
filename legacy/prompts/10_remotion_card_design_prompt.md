# 10 Remotion Card Design Prompt

## 廃止

このプロンプトは廃止済み。
本文コンテンツ枠は画像のみで構成し、Remotionで説明カード、要点カード、箇条書き、画像キャプションを描画しない。

## 現行ルール

- 会話字幕だけをRemotion側で表示する
- `main.kind` は原則 `image`
- `sub` は `null` または `image`
- `main.caption` / `sub.caption` は使わない
- `remotion_card_plan.md` は生成しない

## 代替

要点や手順は `prompts/08_image_generation_v2.md` に従い、画像内の短い語句、物体、構図、状況で視覚化する。
