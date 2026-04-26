# 07 Visual Plan Prompt

## 目的

直投げ型 `imagegen_prompt`（`08_image_generation_v2.md`）を作る前に、各シーンの作風と構図方針を1行ずつメモする。`visual_plan.md` は任意の補助メモであり、ゲートやレンダーの停止条件にしない。

## 責任分離（v2 固定）

- 本文コンテンツ枠は画像のみ
- 字幕（会話）は Remotion 側で固定テンプレ（`Scene01`〜`Scene21`）が描画する
- `main.caption` / `sub.caption` / `main.text` / `sub.text` / `bullets` は使わない
- `remotion_card_plan.md` は生成しない
- 説明文、表、矢印、チェックリスト、金額を画像内に詰めない

## 出力（任意）

`visual_plan.md` を作る場合は、各シーンに次のメモを1行ずつ書く。

- scene_id / title
- 雰囲気: 1〜2行で作風（例: 「暗い照明、湿度感、低彩度」）
- 主役オブジェクト/状況: 何を見せたい一瞬か
- 字幕・キャラとの衝突回避（下部20%安全域）

## NG

- `visual_type` / `composition_type` / `hook_type` / `myth_vs_fact` / `boke_or_reaction` 等の抽象タグを `imagegen_prompt` 本文に混ぜない
- 会話全文を画像内テキストとして並べる指示
- 中間ファイル `image_direction` / `supports_dialogue` / `supports_moment` の必須化

## 正本

直投げ型 `imagegen_prompt` の生成ルールは `prompts/08_image_generation_v2.md` を参照する。本ファイルは事前メモ用。
