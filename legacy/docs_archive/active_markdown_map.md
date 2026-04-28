# Active Markdown Map

このファイルは人間監査用の地図であり、通常生成の必読ファイルではない。
実行時の単一正本は `docs/pipeline_contract.md`、最短入口は `docs/agent_fast_path.md`。

## 通常生成で読む

```text
docs/pipeline_contract.md
docs/agent_fast_path.md
_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
RMなら _reference/script_prompt_pack/local_canonical/yukkuri_master.md
ZMなら _reference/script_prompt_pack/local_canonical/zundamon_master.md
選択テンプレートの templates/scene-XX_*.md
```

キャラペア未確定時は `01_input_normalize_prompt.md` で `character_pair` を確定してから、対応するローカル正本を1つだけ読む。

## 工程別に読む

- 入力整理: `_reference/script_prompt_pack/01_input_normalize_prompt.md`
- テンプレート制約: `_reference/script_prompt_pack/02_template_analysis_prompt.md`
- 構成: `_reference/script_prompt_pack/03_plan_prompt.md`
- RM台本: `_reference/script_prompt_pack/04_draft_prompt_yukkuri.md`
- ZM台本: `_reference/script_prompt_pack/05_draft_prompt_zundamon.md`
- レビュー後の補修: `_reference/script_prompt_pack/07_rewrite_prompt.md`
- 画像プロンプト: `_reference/script_prompt_pack/08_image_prompt_prompt.md`
- 画像プロンプト確認: `_reference/script_prompt_pack/09_image_prompt_audit.md`
- YAML化: `_reference/script_prompt_pack/10_yaml_prompt.md`
- 最終構造確認: `_reference/script_prompt_pack/11_final_episode_audit.md`

## 通常生成で読まない

- `docs/architecture_v2.md`
- `docs/repository_audit_v2.md`
- `docs/final_checklist_v2.md`
- `docs/v1_vs_v2_comparison.md`
- `docs/reference_style_profile_yukkuri_reference4.md`
- `docs/superpowers/**`
- `prompts/**`
- `legacy/**`
- `notebookLM/**`
- `_reference/script_prompt_pack/legacy/**`
- `_reference/script_prompt_pack/examples/**`
- 過去episodeの `script/**`

これらは過去作業、移行記録、参考資料、または生成物であり、ユーザーが明示した場合だけ読む。
