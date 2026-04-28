# Dual Episode Generation Implementation Plan

このファイルは過去の実行計画ログであり、通常生成の必読入力ではない。
現行の解像度、episode id、テンプレート、成果物、停止条件は `docs/pipeline_contract.md` と `docs/agent_fast_path.md` を優先する。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate two complete HD videos as separate new episodes: RM/Yukkuri `auto_rm_photo_cleanup_001` using `Scene12`, and ZM/Zundamon `auto_zm_notification_focus_001` using `Scene21`.

**Architecture:** Each episode is an independent directory under `script/{episode_id}/` and follows the canonical pipeline from planning to video audit. Claude writes the core artifacts directly, Codex/review subagents provide independent script and readiness review, and `codex-imagegen` generates formal scene images with metadata.

**Tech Stack:** Markdown, YAML, JSON, Node/npm pipeline scripts, Codex CLI image generation, AquesTalk for RM, VOICEVOX for ZM, Remotion render pipeline.

---

## File Structure

### Created episode directories

- `script/auto_rm_photo_cleanup_001/`
  - RM/Yukkuri episode, `Scene12`, HD `1280x720`, AquesTalk.
- `script/auto_zm_notification_focus_001/`
  - ZM/Zundamon episode, `Scene21`, HD `1280x720`, VOICEVOX.

### Created files per episode

- `planning.md`: viewer experience design and scene roles.
- `script_draft.md`: natural conversation draft.
- `script_final.md`: final script source of truth.
- `audits/script_final_review.md`: Codex review with matching `script_final_sha256`.
- `script.yaml`: render input preserving final script dialogue units.
- `visual_plan.md`: scene-by-scene visual plan.
- `image_prompt_v2.md`: human-readable image prompts and save paths.
- `image_prompts.json`: structured prompt data for imagegen pipeline.
- `imagegen_manifest.json`: generated image provenance.
- `assets/sNN_main.png`: formal generated scene images.
- `meta.json`: asset metadata and rights/provenance.
- `audits/pre_render_gate.json`: gate output.
- `script.render.json`: build/render input output.
- `audio/`, `bgm/`: generated audio and selected BGM.

### Created output files

- `out/videos/auto_rm_photo_cleanup_001.mp4`
- `out/videos/auto_zm_notification_focus_001.mp4`

---

## Task 1: Prepare directories and script artifacts

**Files:**
- Create: `script/auto_rm_photo_cleanup_001/planning.md`
- Create: `script/auto_rm_photo_cleanup_001/script_draft.md`
- Create: `script/auto_rm_photo_cleanup_001/script_final.md`
- Create: `script/auto_zm_notification_focus_001/planning.md`
- Create: `script/auto_zm_notification_focus_001/script_draft.md`
- Create: `script/auto_zm_notification_focus_001/script_final.md`
- Create: `script/*/audits/script_prompt_pack_*.md`

- [ ] Create the episode directories and `audits/` / `assets/` subdirectories.
- [ ] Write RM planning, draft, and final script for `スマホ写真を消す前に見るべき罠`.
- [ ] Write ZM planning, draft, and final script for `スマホ通知と設定で集中力が溶ける罠`.
- [ ] Write prompt-pack evidence files for input normalization, template analysis, planning, draft, YAML, image prompts, and final episode audit.

---

## Task 2: Review final scripts before YAML

**Files:**
- Create: `script/auto_rm_photo_cleanup_001/audits/script_final_review.md`
- Create: `script/auto_zm_notification_focus_001/audits/script_final_review.md`

- [ ] Compute SHA-256 for each `script_final.md`.
- [ ] Use Codex/review subagents to review each `script_final.md` only.
- [ ] Write each review with `<!-- script_final_sha256: <hash> -->` as the first line.
- [ ] Fix blocking script issues if reviewers find any, then recompute hashes and refresh reviews.

---

## Task 3: Create render YAML and visual prompt artifacts

**Files:**
- Create: `script/auto_rm_photo_cleanup_001/script.yaml`
- Create: `script/auto_rm_photo_cleanup_001/visual_plan.md`
- Create: `script/auto_rm_photo_cleanup_001/image_prompt_v2.md`
- Create: `script/auto_rm_photo_cleanup_001/image_prompts.json`
- Create: `script/auto_zm_notification_focus_001/script.yaml`
- Create: `script/auto_zm_notification_focus_001/visual_plan.md`
- Create: `script/auto_zm_notification_focus_001/image_prompt_v2.md`
- Create: `script/auto_zm_notification_focus_001/image_prompts.json`

- [ ] Write RM YAML with `pair: RM`, `voice_engine: aquestalk`, `layout_template: Scene12`, `width: 1280`, `height: 720`, `sub: null`, `main.kind: image`, and natural dialogue units.
- [ ] Write ZM YAML with `pair: ZM`, `voice_engine: voicevox`, `layout_template: Scene21`, `width: 1280`, `height: 720`, VOICEVOX speaker ids, `sub: null`, `main.kind: image`, no `title_text`, and natural dialogue units.
- [ ] Add `motion_mode` and `dialogue[].emphasis` so watchability gates can pass.
- [ ] Write visual plans and per-scene image prompts derived from each scene's full final script text.
- [ ] Write structured `image_prompts.json` with `scene_id`, `slot`, `file`, `image_role`, `composition_type`, and prompt.

---

## Task 4: Estimate duration and repair if needed

**Files:**
- Modify if needed: `script/*/script_final.md`
- Modify if needed: `script/*/audits/script_final_review.md`
- Modify if needed: `script/*/script.yaml`

- [ ] Run `rtk npm run estimate:episode-duration -- auto_rm_photo_cleanup_001`.
- [ ] Run `rtk npm run estimate:episode-duration -- auto_zm_notification_focus_001`.
- [ ] If an episode is below 270 seconds, add natural dialogue to `script_final.md`, refresh review/hash, update YAML, and rerun estimate.

---

## Task 5: Generate formal images with codex-imagegen

**Files:**
- Create: `script/*/assets/sNN_main.png`
- Create: `script/*/imagegen_manifest.json`
- Create: `script/*/meta.json`

- [ ] Run imagegen dry-run for both episodes.
- [ ] Generate scene images with `codex-imagegen` / `npm run imagegen:episode -- <episode_id> --parallel=3`.
- [ ] Retry failed images with `--retry-failed`, stopping after 3 failures per scene.
- [ ] Verify `imagegen_manifest.json` and `meta.json` contain formal `source_type: imagegen` provenance.

---

## Task 6: BGM, gate, render, and audit

**Files:**
- Modify: `script/*/script.yaml`
- Create: `script/*/bgm/*.mp3`
- Create: `script/*/audio/*.wav`
- Create: `script/*/script.render.json`
- Create: `script/*/audits/pre_render_gate.json`
- Create: `out/videos/auto_rm_photo_cleanup_001.mp4`
- Create: `out/videos/auto_zm_notification_focus_001.mp4`

- [ ] Run `rtk npm run select:bgm -- auto_rm_photo_cleanup_001`.
- [ ] Run `rtk npm run select:bgm -- auto_zm_notification_focus_001`.
- [ ] Run `rtk npm run gate:episode -- auto_rm_photo_cleanup_001`.
- [ ] Run `rtk npm run gate:episode -- auto_zm_notification_focus_001`.
- [ ] Run `rtk npm run render:episode -- auto_rm_photo_cleanup_001 out/videos/auto_rm_photo_cleanup_001.mp4`.
- [ ] Run `rtk npm run render:episode -- auto_zm_notification_focus_001 out/videos/auto_zm_notification_focus_001.mp4`.
- [ ] Run `rtk npm run audit:video -- auto_rm_photo_cleanup_001`.
- [ ] Run `rtk npm run audit:video -- auto_zm_notification_focus_001`.

---

## Task 7: Final readiness review and report

**Files:**
- Read: `script/*/audits/pre_render_gate.json`
- Read: `out/videos/*.mp4`

- [ ] Use a Codex/review subagent to verify no existing scripts were reused, templates and HD are correct, script review hashes match, formal imagegen assets were used, gates passed, renders exist, and video audits passed.
- [ ] Report completion only if both episodes satisfy all completion conditions.

---

## Self-Review

Spec coverage: covered both independent episodes, HD output, template pairing, no script reuse, Codex review, codex-imagegen, duration estimate, gate, render, and video audit.

Placeholder scan: no TBD/TODO/placeholders remain.

Type and naming consistency: episode IDs, file paths, template names, voice engines, and command arguments are consistent across tasks.
