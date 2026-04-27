# 11_final_episode_audit

## 目的

台本、画像プロンプト、`script.yaml`、監査証跡が揃っているか最終確認する。

## チェック（必須）

- `planning.md` がある。
- `script_draft.md` がある。
- `script_final.md` がある。
- `script_final.md` のCodexレビュー（`audits/script_final_review.md`）が完了している。
- s01 の最初の3発話に、日常の状況、視聴者がやりがちな行動、なぜ今この話をするかのいずれかがあり、視聴者の現在地が置かれている。
- `script.yaml` が既存スキーマに合っている。
- `meta.layout_template` が `Scene01`〜`Scene21` のいずれか1つ。
- `meta.scene_template` / `scenes[].scene_template` がない。
- `main.kind` は `image`。
- sub枠ありテンプレート（`Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14`）では、全シーンの `sub.kind` が `text` または `bullets`。
- sub枠ありテンプレートで `sub: null` / `sub.kind: image` がない。
- sub枠なしテンプレートでは `sub: null`。
- `main.caption` / `main.text` / `main.items` / `sub.caption` がない。
- `dialogue[].text` が `script_final.md` の自然な発話単位を維持している。
- 表示都合の機械分割がない。
- `visual_asset_plan[].imagegen_prompt` が直投げ型（対象シーン全文＋固定文＋作風）。
- s01 が 0〜5秒の強フック、5〜10秒のあるある、10〜15秒の視聴理由の順になっている。
- 各本編シーンに、視聴者代表の誤解/ボケ/雑な解釈、解説役の短いツッコミ、数字/具体例/失敗例/比較、視聴者代表の反応、解説役の小結論がある。
- 会話体験スコアが5点満点で4点以上。Q&Aだけ、説明文読み上げ、解説役の独演があればFAIL。
- 40〜60%地点の再フックに、誤解反転、犯人言い切り、強い数字、失敗例、L3以上リアクション、短い断言のうち2つ以上がある。
- ラストが「今日やる行動」1つに絞られ、ラスト30秒以内に答えやすいコメント誘導がある。
- `motion_mode` が全sceneにあり、中盤再フックとラスト行動が `normal` ではない。
- s01、中盤再フック、ラスト行動に `dialogue[].emphasis` があり、`se` が `none` ではない。
- `visual_asset_plan[].image_role` と `composition_type` が全sceneにあり、3シーン連続で同じ `composition_type` になっていない。
- 画像プロンプトが「正しいだけの汎用図解」ではなく、台本のあるある、失敗例、ボケ/ツッコミ、山場のどれかを視覚化している。

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
  "conversation_experience_score": 4,
  "watchability_checks": {
    "opening_15s": "PASS",
    "midpoint_rehook": "PASS",
    "final_action": "PASS",
    "comment_prompt": "PASS",
    "motion_emphasis": "PASS"
  },
  "blocking_issues": [],
  "checked_files": [],
  "checked_at": ""
}
```
