# Dual Episode Generation Design

このファイルは過去の設計ログであり、通常生成の必読入力ではない。
現行の解像度、episode id、テンプレート、成果物、停止条件は `docs/pipeline_contract.md` と `docs/agent_fast_path.md` を優先する。

## Goal

Create two new approximately five-minute HD videos as fully separate episodes, without reusing existing scripts.

- Yukkuri episode: Reimu and Marisa, `Scene12`, HD `1280x720`
- Zundamon episode: Zundamon and Shikoku Metan, `Scene21`, HD `1280x720`
- Both episodes must include new planning, draft, final script, Codex review, YAML, visual plan, image prompts, Codex imagegen assets, metadata, gate result, rendered MP4, and video audit.

## Recommended approach

Use two independent episode directories and run the canonical pipeline for each. This avoids accidental script reuse, keeps template-specific constraints clear, and lets Codex/review subagents review each script independently while Claude directly creates and validates the artifacts.

## Episode concepts

### Yukkuri / RM / Scene12

Episode id: `auto_rm_photo_cleanup_001`

Theme: smartphone photo cleanup traps before deleting photos.

Working title: `スマホ写真を消す前に見るべき罠`

Reasoning: `Scene12` has a classroom and whiteboard layout, so it fits a lesson-style explanation with cause maps, NG/OK comparisons, and concrete action steps about photo deletion, backup status, shared albums, and recovery windows.

### Zundamon / ZM / Scene21

Episode id: `auto_zm_notification_focus_001`

Theme: smartphone notifications and settings that quietly melt focus.

Working title: `スマホ通知と設定で集中力が溶ける罠`

Reasoning: `Scene21` has smartphone UI decoration around the central content area, so it fits a digital habits topic and visualizations of notification traps, app loops, home screen friction, and focus settings.

## Pipeline and artifacts

For each episode, create the canonical files under `script/{episode_id}/`:

1. `planning.md`
2. `script_draft.md`
3. `script_final.md`
4. `audits/script_final_review.md`
5. `script.yaml`
6. `visual_plan.md`
7. `image_prompt_v2.md`
8. `image_prompts.json`
9. `imagegen_manifest.json`
10. `assets/sNN_main.png`
11. `meta.json`
12. `audits/pre_render_gate.json`
13. `out/videos/{episode_id}.mp4`

`script_final.md` is the script source of truth. `script.yaml` is render input only and must preserve the natural dialogue units from `script_final.md`.

## Script requirements

- 10 to 12 scenes per episode.
- Estimated natural duration target: 270 to 330 seconds.
- Do not adjust speech speed for duration.
- Each script starts with viewer context, loss, surprise, misconception correction, or a strong everyday hook.
- Midpoint must include a re-hook with new information, not a recap.
- Final scene must end with one concrete action and a comment prompt.
- RM uses Reimu as viewer representative and Marisa as explainer.
- ZM uses Zundamon as viewer representative and Metan as explainer.

## Template requirements

### Scene12

- `meta.layout_template: Scene12`
- `meta.pair: RM`
- `meta.voice_engine: aquestalk`
- `meta.width: 1280`
- `meta.height: 720`
- `title_text` may be used because the template has a title area.
- `sub: null` for all scenes.
- Main content uses `kind: image` only.

### Scene21

- `meta.layout_template: Scene21`
- `meta.pair: ZM`
- `meta.voice_engine: voicevox`
- `meta.width: 1280`
- `meta.height: 720`
- No `title_text` because the template has no title area.
- `sub: null` for all scenes.
- Main content uses `kind: image` only.

## Image generation

Use `codex-imagegen` for formal image generation. Local placeholder images, SVGs, screenshots, or hand-made cards do not count as image generation.

Expected count is about 20 to 24 images across both episodes. At the skill's rough cost range of $0.04 to $0.07 per image, expected image cost is about $0.80 to $1.68. The user explicitly requested image generation and autonomous completion.

For each scene:

- Build the image prompt from the corresponding `script_final.md` scene text.
- Generate one 16:9 main image.
- Save as `script/{episode_id}/assets/sNN_main.png`.
- Record `source_type: imagegen`, `generation_tool: codex-imagegen`, rights confirmation, license, prompt, scene id, and slot in `meta.json`.
- Record file, generation id or source URL, original filename, and prompt hash in `imagegen_manifest.json`.

## Codex usage

Use Codex/review subagents for independent checks, not as the primary implementer.

Required Codex uses:

- Review each `script_final.md` and write `audits/script_final_review.md` with `script_final_sha256` matching the current final script.
- Review final readiness after gate/render/video audit.

## Verification

For each episode, run:

1. `npm run estimate:episode-duration -- <episode_id>`
2. `npm run imagegen:episode -- <episode_id> --dry-run`
3. `npm run imagegen:episode -- <episode_id> --parallel=3`
4. `npm run select:bgm -- <episode_id>`
5. `npm run gate:episode -- <episode_id>`
6. `npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4`
7. `npm run audit:video -- <episode_id>`

Completion can only be reported when both MP4 files exist, both gates pass, and both video audits pass.

## Non-goals

- Do not reuse existing episode scripts.
- Do not create `script_audit.json`, `audit_script_draft.json`, or `script_generation_audit.json`.
- Do not treat image prompt generation as image generation.
- Do not render before Codex script review is complete and hash-matched.
- Do not claim completion if imagegen is unavailable or if video audit fails.
