# Script Prompt Pack Evidence

- prompt_file: _reference/script_prompt_pack/11_final_episode_audit.md
- episode: ep914-rm-browser-tabs-focus-leak
- input_conditions: theme, template, duration, character pair were fixed before generation.

## Output

最終確認チェック。`planning.md` / `script_draft.md` / `script_final.md` / `script.yaml` の4段階成果物がそろっている。`audits/script_final_review.md` のCodexレビューが完了し verdict は PASS。`meta.layout_template` は Scene11 の1つのみ、`meta.scene_template` と `scenes[].scene_template` は無し。`main.kind` は image、`sub` は null、`main.caption` / `sub.caption` / `main.text` / `sub.text` / `bullets` は使用なし。`dialogue[].text` は `script_final.md` の自然な発話単位を維持し、機械分割なし。`visual_asset_plan[].imagegen_prompt` は対象シーン全文＋固定文＋作風キーワードの直投げ型で、抽象タグ（hook_type / visual_type / composition_type / supports_*）は本文に混入なし。画像プロンプト監査と生成後画像監査は任意（非ブロッキング）であり、未実施でもレンダー前ゲートを止めない。画像生成は image gen で実行済み（`assets/s01_main.png` 〜 `s10_main.png`）。`script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` / `remotion_card_plan.md` は生成していない。

## Verdict

verdict: PASS

この証跡は prompt pack 実行記録であり、Codexレビュー監査ではない。Codexレビュー監査は `audits/script_final_review.md` の1ファイルのみで行う。
