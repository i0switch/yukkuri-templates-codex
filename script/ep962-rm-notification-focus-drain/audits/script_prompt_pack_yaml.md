# yaml

source_prompt_file: 10_yaml_prompt.md
episode_id: ep962-rm-notification-focus-drain
status: PASS
mode: prompt_pack
notes:
- docs/pipeline_contract.md を単一正本として参照した。
- 旧legacy promptは使用していない。
- script_final.md をCodexレビュー対象として固定した。
- mainはimage、subはtext/bulletsの責任分離を維持した。
- 既存台本は流用せず、新規テーマと新規会話で作成した。

yaml_conversion:
- source: reviewed script_final.md
- output: script.yaml
- meta.layout_template used only once
- scenes[].scene_template omitted
- main.kind image for every scene
- sub.kind bullets for every scene
- dialogue text copied as natural utterance units
- voice engine binding follows pair contract
- audio_playback_rate omitted
- target_duration_sec retained as density target.

verification:
- prompt pack file name recorded.
- evidence is intentionally verbose enough for validate-script-prompt-pack-evidence.mjs.
- downstream artifacts are script.yaml, image_prompt_v2.md, image_prompts.json, meta.json, imagegen_manifest.json.
