# rewrite_notes.md

## 変更意図

`_reference/script_prompt_pack/` の指示に従いつつ、CLAUDE.md / AGENTS.md / docs/architecture_v2.md の v2 方針に整合させる。

## 現状

`_reference/script_prompt_pack/` の v5（v2整合済み）が参考実装として存在する。互換 stub 4本は `legacy/` に退避済みで、新 Canonical Flow は次のとおり。

1. `00_MASTER_SCRIPT_RULES.md`
2. `01_input_normalize_prompt.md`
3. `02_template_analysis_prompt.md`
4. `03_plan_prompt.md`
5. `04_draft_prompt_yukkuri.md` または `05_draft_prompt_zundamon.md`
6. `07_rewrite_prompt.md`（必要時のみ）
7. `08_image_prompt_prompt.md`
8. `09_image_prompt_audit.md`（任意・非ブロッキング）
9. `10_yaml_prompt.md`
10. `11_final_episode_audit.md`

`package.json` の主要スクリプト:

- `gate:prompt-pack`
- `test:script-prompt-pack-evidence`
- `gate:episode`
- `audit:script-quality`
- `audit:image-prompts`
- `audit:video`

## 証跡 vs 監査の分離

`script/{episode_id}/audits/` に保存する `script_prompt_pack_*.md` は **prompt pack 実行証跡 (evidence)** であり、Codexレビュー監査ではない。

- Codexレビュー監査: `audits/script_final_review.md` の1ファイルのみ。`script_final.md` だけを対象にする。
- 実行証跡: `audits/script_prompt_pack_*.md` 群（`scripts/validate-script-prompt-pack-evidence.mjs` の期待ファイル名）。
- 禁止生成物: `script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` / `remotion_card_plan.md`。

## 完成条件（v2）

完成と言ってよいのは次が**全部**揃った場合だけ。

- `planning.md` / `script_draft.md` / `script_final.md` / `script.yaml` 実在
- `audits/script_final_review.md` がPASS
- `assets/sNN_main.png` が実 image gen 済み
- `npm run gate:episode -- <episode_id>` PASS
- `out/videos/<episode_id>.mp4` 実在
- video audit 実施記録

## 任意（非ブロッキング）

- `audits/image_prompt_audit.json`
- `audits/image_result_audit.json`
- `audits/script_prompt_pack_*.md`
- `audits/yaml_conversion_v2.md`

これらは `pre-render-gate` / `build-episode` の停止条件にしない。

## よく使うコマンド

```powershell
npm run gate:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
node scripts/validate-script-prompt-pack-evidence.mjs <episode_id>
```
