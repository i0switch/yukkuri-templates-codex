# Script Prompt Pack Evidence: yaml

prompt_file: 10_yaml_prompt.md
episode_id: auto_yukkuri_convenience_001
verdict: PASS

## YAML Conversion Inputs

- `script_final.md`: present
- `audits/script_final_review.md`: present with current SHA-256 hash
- `planning.md`: present
- `visual_plan.md` / `image_prompts.json`: planned and generated after prompt step
- `templates/scene-12_classroom-bubbles.md`: read and applied
- `docs/pipeline_contract.md`: used as schema and stop-condition source

## YAML Contract Decisions

- meta.id: auto_yukkuri_convenience_001
- meta.pair: RM
- meta.voice_engine: aquestalk
- meta.layout_template: Scene12
- meta.width: 1280
- meta.height: 720
- meta.fps: 30
- meta.target_duration_sec: 300
- characters.left: reimu / AquesTalk preset 女性１
- characters.right: marisa / AquesTalk preset まりさ
- scenes: 10
- sub policy: `sub: null` for every scene
- title policy: Scene12 title area uses short hook-style `title_text`
- image refs: `assets/sNN_main.png` with `imagegen_prompt_ref: sNN.main`

## Dialogue Conversion

`dialogue[].text` preserves the natural speech units from `script_final.md`. The YAML conversion does not split lines for subtitle display. Motion and emphasis fields were added to pass render schema and to preserve the hook, midpoint rehook, and final action beats.

## Forbidden Fields Check

- `meta.scene_template`: not used
- `scenes[].scene_template`: not used
- `audio_playback_rate`: not used
- `sub.kind: image`: not used

## Self Check

The YAML is ready for mechanical validation by `npm run gate:episode -- auto_yukkuri_convenience_001`. Image files are generated later by codex-imagegen, so prompt-only validation is expected before image generation and full validation after assets exist.
