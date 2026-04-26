# 03_IMAGE_PROMPT_AUDIT

## 目的

画像生成前に、`image_direction` と `imagegen_prompt` を監査する。
FAILした画像は生成しない。

## 監査表

| scene_id | 会話連動 | 固有性 | 状況性 | 構図差 | ゆっくり適合 | Scene適合 | 生成期待値 | 判定 |
|---|---:|---:|---:|---:|---:|---:|---:|---|

各10点。合計55点未満ならFAIL。

## FAIL条件

- 会話のどの瞬間を補強するか不明
- captionをそのまま抽象アイコン化している
- 白背景中央アイコンになりそう
- 他シーンと同じ構図
- ゆっくり解説の画面として面白くない
- main/subの役割が被っている
- 文字をRemotionに分離していない
- シーン固有の小物がない
- `imagegen_prompt` に「1枚ずつ生成」「この1枚専用」「他画像と同時生成しない」相当の明示がない
- `grid`、`グリッド`、`8枚`、`sheet`、`sprite`、`batch`、`crop`、`一括生成`、`切り出し` を含む
- `中央に主題、余白多め`、`licensed photo style`、`clean explainer thumbnail` のような低品質・汎用プロンプトになっている
