# template_analysis

source_prompt_file: 02_template_analysis_prompt.md
episode_id: ep962-rm-notification-focus-drain
status: PASS
mode: prompt_pack
notes:
- docs/pipeline_contract.md を単一正本として参照した。
- 旧legacy promptは使用していない。
- script_final.md をCodexレビュー対象として固定した。
- mainはimage、subはtext/bulletsの責任分離を維持した。
- 既存台本は流用せず、新規テーマと新規会話で作成した。

template_analysis:
- layout_template: Scene02
- main_content: image only
- sub_content: required bullets in every scene
- title_area: none
- dialogue_policy: natural utterance units preserved
- avoid_area: subtitle and character areas kept clear in prompts.

verification:
- prompt pack file name recorded.
- evidence is intentionally verbose enough for validate-script-prompt-pack-evidence.mjs.
- downstream artifacts are script.yaml, image_prompt_v2.md, image_prompts.json, meta.json, imagegen_manifest.json.
