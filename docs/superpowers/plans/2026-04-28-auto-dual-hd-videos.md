# Auto Dual HD Videos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate two original ~5-minute HD videos: one RM/yukkuri episode on Scene12 and one ZM/zundamon episode on Scene21.

**Architecture:** Create canonical episode artifacts directly under `script/{episode_id}/`, preserving the pipeline contract order. Use Codex only for `script_final.md` review and image generation; use repository validators, gate, renderer, and video audit for completion.

**Tech Stack:** Markdown episode artifacts, YAML render input, Node.js pipeline scripts, Codex CLI image generation, AquesTalk for RM, VOICEVOX for ZM, Remotion render.

---

## File Structure

- Create `script/auto_rm_photo_cleanup_20260428/`: RM episode using `Scene12`, HD 1280x720, AquesTalk.
- Create `script/auto_zm_notification_focus_20260428/`: ZM episode using `Scene21`, HD 1280x720, VOICEVOX.
- Create per episode: `planning.md`, `script_draft.md`, `script_final.md`, `audits/script_final_review.md`, `script.yaml`, `visual_plan.md`, `image_prompt_v2.md`, `image_prompts.json`, `meta.json`, and generated assets.
- Output videos: `out/videos/auto_rm_photo_cleanup_20260428.mp4` and `out/videos/auto_zm_notification_focus_20260428.mp4`.

### Task 1: Generate canonical scripts

**Files:**
- Create: `script/auto_rm_photo_cleanup_20260428/planning.md`
- Create: `script/auto_rm_photo_cleanup_20260428/script_draft.md`
- Create: `script/auto_rm_photo_cleanup_20260428/script_final.md`
- Create: `script/auto_zm_notification_focus_20260428/planning.md`
- Create: `script/auto_zm_notification_focus_20260428/script_draft.md`
- Create: `script/auto_zm_notification_focus_20260428/script_final.md`

- [ ] Write original planning docs with viewer misconception, emotion curve, character roles, and scene roles.
- [ ] Write separate original draft scripts with 10 scenes each and natural dialogue units.
- [ ] Write final scripts from drafts without reusing existing episode text.

### Task 2: Review final scripts with Codex-style review

**Files:**
- Create: `script/auto_rm_photo_cleanup_20260428/audits/script_final_review.md`
- Create: `script/auto_zm_notification_focus_20260428/audits/script_final_review.md`

- [ ] Compute sha256 for each `script_final.md`.
- [ ] Run or delegate review against `script_final.md` only.
- [ ] Write review files with leading `<!-- script_final_sha256: ... -->`, `verdict: PASS`, and `blocking_issues`.

### Task 3: Create render YAML and prompt-pack evidence

**Files:**
- Create: `script/*/script.yaml`
- Create: `script/*/visual_plan.md`
- Create: `script/*/image_prompt_v2.md`
- Create: `script/*/image_prompts.json`
- Create: `script/*/meta.json`
- Create: `script/*/audits/script_prompt_pack_*.md`

- [ ] Build `script.yaml` with `meta.layout_template` set to `Scene12` for RM and `Scene21` for ZM.
- [ ] Set `meta.width: 1280`, `meta.height: 720`, `fps: 30`, `target_duration_sec: 300`.
- [ ] Use image-only `main` per scene, `sub: null`, and required motion/emphasis fields.
- [ ] Generate direct scene-text image prompts and registry JSON.
- [ ] Add prompt-pack evidence files required by `validate-script-prompt-pack-evidence.mjs`.

### Task 4: Generate Codex images

**Files:**
- Create: `script/*/assets/sNN_main.png`
- Modify: `script/*/meta.json`
- Create/Modify: `script/*/imagegen_manifest.json`

- [ ] Run `rtk npm run imagegen:episode -- <episode_id> --dry-run` for both episodes.
- [ ] Run `rtk npm run imagegen:episode -- <episode_id> --parallel=3` for both episodes.
- [ ] Retry failed scenes with `--retry-failed` up to the regeneration limit.

### Task 5: Gate, render, and audit

**Files:**
- Create: `script/*/audits/pre_render_gate.json`
- Create: `script/*/script.render.json`
- Create: `out/videos/*.mp4`

- [ ] Run `rtk npm run estimate:episode-duration -- <episode_id>`.
- [ ] Run `rtk npm run gate:episode -- <episode_id>`.
- [ ] Run `rtk npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4`.
- [ ] Run `rtk npm run audit:video -- <episode_id>`.
- [ ] Report completion only if both audits pass and both MP4 files exist.

## Self-Review

- Spec coverage: covers both requested videos, templates, HD, original scripts, Codex review, Codex image generation, render, and video audit.
- Placeholder scan: no TBD/TODO placeholders remain.
- Scope check: both episodes share the same pipeline and can be generated in one coordinated run.
