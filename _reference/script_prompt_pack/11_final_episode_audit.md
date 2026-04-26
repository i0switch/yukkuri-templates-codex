# 11_final_episode_audit

## 目的

台本、画像プロンプト、`script.yaml`、監査証跡が揃っているか最終確認する。

## チェック（必須）

- `planning.md` がある。
- `script_draft.md` がある。
- `script_final.md` がある。
- `script_final.md` のCodexレビュー（`audits/script_final_review.md`）が完了している。
- `script.yaml` が既存スキーマに合っている。
- `meta.layout_template` が `Scene01`〜`Scene21` のいずれか1つ。
- `meta.scene_template` / `scenes[].scene_template` がない。
- `main.kind` は `image`、`sub` は `null` または `image`。
- `main.caption` / `sub.caption` / `main.text` / `sub.text` / `bullets` がない。
- `dialogue[].text` が `script_final.md` の自然な発話単位を維持している。
- 表示都合の機械分割がない。
- `visual_asset_plan[].imagegen_prompt` が直投げ型（対象シーン全文＋固定文＋作風）。

## チェック（任意・非ブロッキング）

次は揃っていれば望ましいが、欠けても完成扱いを止めない。

- 画像プロンプト監査（`audits/image_prompt_audit.json`）の実施記録。
- 生成後画像監査（`audits/image_result_audit.json`）の実施記録。
- prompt pack 実行証跡（`audits/script_prompt_pack_*.md`）。
- `audits/yaml_conversion_v2.md`。

## 禁止生成物

- `script_audit.json`
- `audit_script_draft.json`
- `script_generation_audit.json`
- `remotion_card_plan.md`

## 出力

```json
{
  "step": "final_episode_audit",
  "verdict": "PASS",
  "minor_improvement": "",
  "blocking_issues": [],
  "checked_files": [],
  "checked_at": ""
}
```
