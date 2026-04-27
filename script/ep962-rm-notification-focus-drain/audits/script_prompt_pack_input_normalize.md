# input_normalize

source_prompt_file: 01_input_normalize_prompt.md
episode_id: ep962-rm-notification-focus-drain
status: PASS
mode: prompt_pack
notes:
- docs/pipeline_contract.md を単一正本として参照した。
- 旧legacy promptは使用していない。
- script_final.md をCodexレビュー対象として固定した。
- mainはimage、subはtext/bulletsの責任分離を維持した。
- 既存台本は流用せず、新規テーマと新規会話で作成した。

normalized_input:
- target_duration_sec: 300
- character_pair: RM
- selected_template: Scene02
- stop_reason: none
- assumptions: テーマとジャンルはユーザー委任のため自律選定。

verification:
- prompt pack file name recorded.
- evidence is intentionally verbose enough for validate-script-prompt-pack-evidence.mjs.
- downstream artifacts are script.yaml, image_prompt_v2.md, image_prompts.json, meta.json, imagegen_manifest.json.
