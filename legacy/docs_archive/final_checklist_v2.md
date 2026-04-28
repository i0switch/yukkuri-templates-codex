# Final Checklist v2

このファイルは過去の移行完了チェックリストであり、通常生成の必読入力ではない。
現行の成果物、停止条件、完了条件は `docs/pipeline_contract.md` を正本にする。

## ドキュメント

- [x] `docs/repository_audit_v2.md`
- [x] `docs/architecture_v2.md`
- [x] `AI_VIDEO_GENERATION_GUIDE.md`
- [x] `CLAUDE.md` v2
- [x] `AGENTS.md` v2
- [x] `legacy/CLAUDE.md.v1`
- [x] `legacy/AGENTS.md.v1`
- [x] v1由来ルートドキュメントを `legacy/v1_root_docs/` に退避
- [x] 修正用プロンプト/ を `legacy/migration_prompts_v1_to_v2/` に退避

## Prompt Pack（移行当時の確認項目）

- [x] `prompts/00_core_principles.md`
- [x] `prompts/01_planning_prompt.md`
- [x] `prompts/02_yukkuri_script_draft_prompt.md`
- [x] `prompts/03_zundamon_script_draft_prompt.md`
- [x] `prompts/05_script_rewrite_prompt.md`
- [x] `prompts/06_yaml_conversion_prompt.md`
- [x] `prompts/07_visual_plan_prompt.md`（直投げ型補助メモに整理）
- [x] `prompts/08_image_generation_v2.md`
- [x] `prompts/09_visual_audit_prompt.md`
- [x] `prompts/10_remotion_card_design_prompt.md`（廃止明記）
- [x] `prompts/character_specs.md`
- [x] `prompts/scene_patterns.md`

## Prompt Pack（参考: _reference/）

- [x] `_reference/script_prompt_pack/` v2整合済み
- [x] `_reference/script_prompt_pack/legacy/` に互換 stub 4本退避
- [x] `_reference/image_prompt_pack/` v2整合済み
- [x] `_reference/image_prompt_pack/01_IMAGE_DIRECTION_PROMPT.md` 廃止リマインダ化
- [x] `legacy/_reference/remotion_image_recreation_guide.md` 退避

## Scripts

- [x] `scripts/audit_image_result.py`
- [x] `scripts/run_pipeline.py`
- [x] `package.json` の v2 コマンド (`gate:episode` / `render:episode`)
- [x] 再生成3回上限と `regeneration_plan` / `human_review_required` の出力
- [x] NOT_AVAILABLEをPASS扱いしない

## エピソード完成定義（v2）

エピソードを「完成」と言ってよいのは、次が**全部**揃った場合だけ。

- [ ] `script/<episode_id>/planning.md`
- [ ] `script/<episode_id>/script_draft.md`
- [ ] `script/<episode_id>/script_final.md`
- [ ] `script/<episode_id>/script.yaml`
- [ ] `script/<episode_id>/audits/script_final_review.md`（Codexレビュー verdict=PASS）
- [ ] `script/<episode_id>/assets/sNN_main.png`（実 image gen 済み）
- [ ] `npm run gate:episode -- <episode_id>` PASS
- [ ] `out/videos/<episode_id>.mp4`
- [ ] video audit 実施記録

## エピソード完成の任意項目（非ブロッキング）

- [ ] `audits/image_prompt_audit.json`
- [ ] `audits/image_result_audit.json`
- [ ] `audits/script_prompt_pack_*.md`（prompt pack 実行証跡）
- [ ] `audits/yaml_conversion_v2.md`（過去項目。現行Gateの必須成果物ではない）

これらは欠けても完成扱いを止めない。`pre-render-gate` / `build-episode` の停止条件にもしない。

## サンプルエピソード

- [x] `script/ep914-rm-browser-tabs-focus-leak/`（4段階揃い）
- [x] `script/ep915-zm-default-app-chaos/`（4段階揃い）
- [ ] ep914 / ep915 の `script.md` から旧抽象タグ清掃
- [ ] ep914 / ep915 の `audits/` 自動生成反復文の清掃

## NOT_AVAILABLE

NOT_AVAILABLE はクラッシュではないが、PASS でもない。次を出力する。

```json
{
  "status": "NOT_AVAILABLE",
  "pass": false,
  "human_review_required": true
}
```

## human_review_required

次の場合は必ず `human_review_required: true` を出す。

- 画像生成 NOT_AVAILABLE またはローカル仮画像のまま終了
- OCR / Vision API NOT_AVAILABLE
- 1シーンで再生成3回連続FAIL
- gate / render / video audit がFAIL
