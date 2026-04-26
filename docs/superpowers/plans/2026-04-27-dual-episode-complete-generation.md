# Dual Episode Complete Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two fully new five-minute episode packages, generate their scene images, render HD MP4s, and pass video audit.

**Architecture:** Build each episode as an isolated `script/{episode_id}/` package following the v2 flow: planning, natural draft, `script_final.md`, review, YAML, visual plan, image prompts, generated assets, gate, render, and audit. Use `Scene02` as a single layout template per episode and keep all render content slots image-only.

**Tech Stack:** Markdown, YAML, JSON metadata, Node/Remotion validation/render scripts, AquesTalk voice generation, DOVA BGM selector, Codex CLI image generation through `codex-imagegen`.

---

## File Structure

Create two new directories only:

- `script/ep920-rm-smartphone-photo-search/` — Yukkuri/Reimu-Marisa episode about smartphone photo and screenshot search chaos.
- `script/ep921-zm-subscription-leak-reset/` — Zundamon/Metan episode about forgotten subscriptions leaking money.

Each directory contains:

- `planning.md`
- `script_draft.md`
- `script_final.md`
- `script.yaml`
- `visual_plan.md`
- `image_prompt_v2.md`
- `meta.json`
- `audits/script_final_review.md`
- `audits/yaml_conversion_v2.md`
- `audits/image_prompt_audit.json`
- `audits/image_generation_status.md`
- `audits/image_result_audit.json`
- generated `assets/s01_main.png` through `assets/s10_main.png`
- generated audio/BGM/render artifacts from repository scripts

## Tasks

### Task 1: Generate source episode files

- [ ] Create both episode directories, `assets/`, and `audits/`.
- [ ] Write `planning.md` for both episodes from original scenarios.
- [ ] Write natural `script_draft.md` and `script_final.md`, 10 scenes each, 8-10 utterances per scene.
- [ ] Write `audits/script_final_review.md` after reviewing only `script_final.md`.
- [ ] Convert each `script_final.md` to `script.yaml` preserving utterance units and using only `meta.layout_template`.
- [ ] Write `visual_plan.md`, `image_prompt_v2.md`, and `meta.json` with asset ledger entries.

### Task 2: Review scripts

- [ ] Dispatch review subagents for both `script_final.md` files.
- [ ] Apply only review issues that improve quality or v2 compliance.
- [ ] Keep YAML conversion after final review.

### Task 3: Generate images

- [ ] Use `codex-imagegen` rules.
- [ ] Generate 20 total images, one Codex process per image, max four concurrent processes.
- [ ] Copy generated PNGs from Codex session directories into episode `assets/`.
- [ ] Update `meta.json` provenance and write `image_generation_status.md`.
- [ ] Inspect generated images and write `image_result_audit.json`.

### Task 4: Validate and render

- [ ] Run `rtk python scripts/run_pipeline.py --episode script/<episode> --dry-run` for both, recording that this skeleton may report NOT_READY.
- [ ] Run `rtk npm run gate:episode -- <episode>` for both.
- [ ] Run `rtk npm run render:episode -- <episode> out/videos/<episode>.mp4` for both.
- [ ] Run `rtk npm run audit:video -- <episode>` for both.
- [ ] Fix any blocking gate/render/audit failures before reporting completion.

## Self-Review

- Spec coverage: covers original scripts, separate RM/ZM episodes, image generation through Codex CLI, HD rendering, gates, and video audit.
- Placeholder scan: no TBD/TODO or unspecified implementation action remains.
- Scope check: focused on two complete episodes; no source-code refactor is planned.
