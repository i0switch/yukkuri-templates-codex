# Two Episode Script and Image Generation Design

## Goal

Create two new, non-reused 5-minute episode packages:

- RM/Yukkuri: `ep914-rm-receipt-app-trap`
- ZM/Zundamon: `ep915-zm-photo-cleanup-trap`

The deliverable scope is scripts and generated images. Do not call the videos complete unless gate, render, video audit, and second review all pass.

## Episode Concepts

### `ep914-rm-receipt-app-trap`

A Yukkuri explainer about how receipt apps and casual expense tracking can create a false sense of saving. The emotional hook is "I logged everything, so why is money still disappearing?" The practical endpoint is a small weekly review habit: separate fixed costs, impulse buys, and subscriptions before trusting points or app totals.

### `ep915-zm-photo-cleanup-trap`

A Zundamon explainer about photo cleanup mistakes: deleting screenshots, duplicates, and documents too aggressively, then losing evidence or important information. The practical endpoint is a three-step cleanup routine: archive important images, delete obvious junk, then review ambiguous files later.

## Template and Structure

Use `Scene02` for both episodes. It provides a main visual area and sub panel, which fits comparisons, danger simulations, and checklists without switching templates. Each episode targets about 300 seconds, 10-12 scenes, and at least 90 dialogue lines.

Use the repository script prompt pack sequence:

1. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
2. `_reference/script_prompt_pack/01_plan_prompt.md`
3. `_reference/script_prompt_pack/02_draft_prompt.md`
4. `_reference/script_prompt_pack/03_audit_prompt.md`
5. `_reference/script_prompt_pack/04_rewrite_prompt.md` only if audit finds weak or failing parts
6. `_reference/script_prompt_pack/05_yaml_prompt.md` only after audit PASS

Save required evidence under each episode's `audits/` directory, including prompt-pack plan, draft, audit, YAML evidence, and `script_generation_audit.json`.

## Image Workflow

Use the image prompt pack before generation:

- `_reference/image_prompt_pack/00_IMAGE_GEN_MASTER_RULES.md`
- `_reference/image_prompt_pack/01_IMAGE_DIRECTION_PROMPT.md`
- `_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md`
- `_reference/image_prompt_pack/03_IMAGE_PROMPT_AUDIT.md`
- `_reference/image_prompt_pack/05_IMAGE_RESULT_AUDIT.md`

Generate at least 10 main images per episode, one image per scene. Use Codex image generation through the `codex-imagegen` skill if Codex CLI and auth are available. Run one Codex process per image, up to four parallel jobs unless the user approves more.

Generated images must avoid Japanese explanatory text, existing characters, and sheet/grid/batch composition. Explanatory labels, arrows, tables, and checklists belong in Remotion overlays, not image pixels.

## Files to Produce

For each episode:

- `script/{episode_id}/planning.md`
- `script/{episode_id}/script_draft.md`
- `script/{episode_id}/script_audit.md` or `.json`
- `script/{episode_id}/script_final.md`
- `script/{episode_id}/script.yaml`
- `script/{episode_id}/assets/s01_main.png` through at least `s10_main.png`
- `script/{episode_id}/meta.json`
- required files in `script/{episode_id}/audits/`

## Validation

Before reporting completion of the requested script/image package:

- Confirm draft audit PASS before YAML conversion.
- Confirm all `dialogue[].text` entries in YAML are 25 characters or fewer.
- Confirm `meta.layout_template` is `Scene02` and no `scenes[].scene_template` exists.
- Confirm image provenance and prompt metadata exist in `meta.json`.
- Run available script/image audits and report exact PASS/FAIL/NOT_AVAILABLE state.

If cross-review, OCR, image inspection, Codex image generation, or any audit is unavailable, report it as `NOT_AVAILABLE` with `human_review_required: true` instead of calling the package complete.
