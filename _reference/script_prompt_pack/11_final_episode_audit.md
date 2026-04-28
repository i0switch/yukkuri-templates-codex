# 11_final_episode_audit

## 目的

最終確認では、必要ファイル、台本レビューの存在と鮮度、`script.yaml` の構造、レンダー前に必要な素材参照だけを確認する。

詳細な停止条件、禁止生成物、schema、画像出所、voice engine整合は `docs/pipeline_contract.md` を正本にする。このファイルは最終確認の出力形式だけを定義する。

台本の日本語品質、会話の自然さ、同じフレーズの反復、文脈破綻は `audits/script_final_review.md` のLLMレビューで判断する。この最終確認では、機械的な品質スコアや品質マーカー充足を合否条件にしない。

## チェック

- `planning.md` / `script_draft.md` / `script_final.md` がある。
- `audits/script_final_review.md` がある。
- `audits/script_final_review.md` 先頭のhashが現在の `script_final.md` と一致している。
- `script.yaml` が `docs/pipeline_contract.md` の現行契約に合っている。
- `dialogue[].speaker` と `dialogue[].text` があり、空文字ではない。
- `dialogue[].text` に設計メタキー、監査ラベル、未充填プレースホルダが混入していない。
- `main` / `sub` / `visual_asset_plan` / `bgm` が選択テンプレートと正本契約に合っている。
- prompt pack 実行証跡が揃っている。`hybrid_user_script` の場合は、正本契約に従って手動受け入れ証跡で代替してよい。

## 任意確認

生成後画像の目視確認は必要な場合だけ任意で行う。画像プロンプトは生成入力であり、独立した監査工程は置かない。

## 出力

```json
{
  "step": "final_episode_audit",
  "verdict": "PASS",
  "blocking_issues": [],
  "checked_files": [],
  "structural_checks": {
    "required_files": "PASS",
    "script_final_review_hash": "PASS",
    "yaml_contract": "PASS",
    "render_assets": "PASS"
  },
  "script_quality_review": "audits/script_final_review.md",
  "checked_at": ""
}
```
