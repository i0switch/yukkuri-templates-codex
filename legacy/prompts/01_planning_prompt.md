# 01 Planning Prompt

## 入力

- theme
- target_viewer
- duration
- character_pair: RM / ZM
- layout_template: Scene01〜Scene21
- reference_style: optional

## 出力

`planning.md` として次を作る。

- 動画タイトル
- 想定視聴者
- 視聴者の悩み
- 冒頭の興味 / 不安
- 最後に得る納得
- 感情曲線
- 各シーンの情報ゴール
- 各シーンの感情ゴール
- シーンパターン割当
- 具体例候補
- NG表現
- YAML変換時に表示上の注意が必要そうな箇所

## ルール

- 1シーン1役割にする
- 同一シーンパターンを3連続させない
- 聞き手と解説役の役割を固定しない
- 画像生成に任せる情報とRemotionで描く情報を早めに分ける
