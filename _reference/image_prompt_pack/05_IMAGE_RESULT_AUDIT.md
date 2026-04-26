# 05_IMAGE_RESULT_AUDIT

## 目的

生成後画像を見て、台本と会話補強に合っているかを監査する。
FAIL時は同じプロンプトで再生成しない。

## 監査表

| scene_id | 台本一致 | 会話補強 | 視認性 | 画面映え | 汎用感の低さ | Scene適合 | 判定 | 再生成方針 |
|---|---:|---:|---:|---:|---:|---:|---|---|

## FAIL条件

- 汎用アイコン素材に見える
- 台本のボケやツッコミと関係ない
- 何の話か分からない
- 低品質なストック素材風
- 字幕やキャラと被る
- 画像内文字が崩れている
- 他シーンと似すぎ
- 見ても感情が動かない

## 記録場所

生成後監査は `script/{episode_id}/audits/image_result_audit.json` に保存する。
各画像ごとに `scene_id`、`slot`、`asset`、6項目スコア、`verdict`、FAIL時の `regeneration_plan` を残す。

## JSON形式

`audit-generated-images.mjs` が読む正準キーは次の英語キー。
日本語の監査表を作った場合も、保存時はこのキーへ写す。

```json
{
  "images": [
    {
      "scene_id": "s01",
      "slot": "main",
      "asset": "assets/s01_main.png",
      "script_match": 8,
      "dialogue_support": 8,
      "visibility": 8,
      "screen_appeal": 8,
      "low_generic_feel": 8,
      "scene_fit": 8,
      "verdict": "PASS",
      "regeneration_plan": ""
    }
  ]
}
```

日本語キーで記録する場合の対応:

- `台本一致` -> `script_match`
- `会話補強` -> `dialogue_support`
- `視認性` -> `visibility`
- `画面映え` -> `screen_appeal`
- `汎用感の低さ` -> `low_generic_feel`
- `Scene適合` -> `scene_fit`
- `判定` -> `verdict`
- `再生成方針` -> `regeneration_plan`
