# 台本生成プロンプトパック v5

このフォルダは、台本・画像プロンプト・YAML化を工程ごとに実行するための現行Prompt Pack。

動画生成パイプラインの成果物名、順序、停止条件、完了条件、Render schema、画像出所、FullHD既定、review hash、gate条件は `docs/pipeline_contract.md` を単一正本にする。このREADMEは目次であり、契約本文を重複して持たない。

## 最短入口

通常生成では、まず次を読む。

```text
docs/pipeline_contract.md
docs/agent_fast_path.md
_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
```

キャラペアが未確定なら `01_input_normalize_prompt.md` で `character_pair` を確定してから、対応するローカル正本を1つだけ読む。

- RM / ゆっくり解説: `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`
- ZM / ずんだもん解説: `_reference/script_prompt_pack/local_canonical/zundamon_master.md`

RM/ZM両方のローカル正本を同時に読まない。

## Canonical Flow

1. `00_MASTER_SCRIPT_RULES.md`
2. `01_input_normalize_prompt.md`
3. `02_template_analysis_prompt.md`
4. `03_plan_prompt.md`
5. `04_draft_prompt_yukkuri.md` または `05_draft_prompt_zundamon.md`
6. `07_rewrite_prompt.md`（`script_final.md` レビュー後に必要な場合のみ）
7. `08_image_prompt_prompt.md`
8. `09_image_prompt_audit.md`（任意確認。gateではない）
9. `10_yaml_prompt.md`
10. `11_final_episode_audit.md`

## Required Evidence

`script/{episode_id}/audits/` 配下に prompt pack 実行証跡として次を保存する。

- `script_prompt_pack_input_normalize.md`
- `script_prompt_pack_template_analysis.md`
- `script_prompt_pack_plan.md`
- `script_prompt_pack_draft.md`
- `script_prompt_pack_image_prompts.md`
- `script_prompt_pack_yaml.md`
- `script_prompt_pack_final_episode_audit.md`

`script_final.md` のCodexレビュー後に補修した場合だけ、`script_prompt_pack_rewrite.md` も保存する。

台本品質監査は `audits/script_final_review.md` に一本化する。prompt pack 証跡は生成過程の記録であり、品質合否の正本ではない。

## 正本優先順位

矛盾する場合は次の順で優先する。

1. `docs/pipeline_contract.md`
2. `docs/agent_fast_path.md`
3. 対象ペアの `local_canonical/*_master.md`
4. 選択テンプレートの `templates/scene-XX_*.md`
5. このPrompt Packの工程別ファイル

`CLAUDE.md`、`AGENTS.md`、`AI_VIDEO_GENERATION_GUIDE.md`、`prompts/00_core_principles.md`、`legacy/**`、`_reference/script_prompt_pack/legacy/**`、`_reference/script_prompt_pack/examples/**` は通常生成の必読入力にしない。
