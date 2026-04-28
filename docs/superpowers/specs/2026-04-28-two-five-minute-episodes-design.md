# Two 5-Minute Episode Generation Design

## Goal

Generate two new, separate 5-minute videos without reusing existing scripts.

Episode IDs:

- ZM: `auto_zundamon_storage_001`
- RM: `auto_yukkuri_convenience_001`

- ZM episode: `スマホの容量がすぐ埋まる本当の理由`
  - Hook: `写真を消しても容量が減らない理由、知ってる？`
  - Character pair: ずんだもん / 四国めたん
  - Required template: `Scene21` from `templates/scene-21_ui-decoration.md`
- RM episode: `なぜコンビニに行くと余計なものを買うのか`
  - Hook: `コンビニで“ついで買い”するの、設計通りです`
  - Character pair: 霊夢 / 魔理沙
  - Required template: `Scene12` from `templates/scene-12_classroom-bubbles.md`

Both videos must be delivered in HD `1280x720` and must satisfy the repository completion rule: current `script_final.md`, Codex review with matching hash, passing gate, rendered MP4, and passing video audit.

## Pipeline

Use the repository contract as the source of truth:

1. Create `planning.md` for each episode.
2. Create `script_draft.md` with natural dialogue and no display-driven splitting.
3. Create `script_final.md` as the script quality source of truth.
4. Run Codex review only against `script_final.md` and write `audits/script_final_review.md` with the current `script_final_sha256`.
5. Only after review passes, create `script.yaml`.
6. Create `visual_plan.md`, `image_prompt_v2.md`, and `image_prompts.json` from the final script.
7. Estimate duration with `npm run estimate:episode-duration -- auto_zundamon_storage_001` and `npm run estimate:episode-duration -- auto_yukkuri_convenience_001`; keep target natural duration in `270-330` seconds where possible.
8. Generate images with `codex-imagegen` through the project imagegen script.
9. Build BGM, voice, render input, and run pre-render gate.
10. Render to `out/videos/auto_zundamon_storage_001.mp4` and `out/videos/auto_yukkuri_convenience_001.mp4` in HD.
11. Run video audit and only call the episode complete if it passes.

## Episode Shape

Each episode should use 10-12 scenes and roughly 90-130 natural dialogue turns, adjusted by the duration estimator rather than by raw line count.

ZM episode scene direction:

- Explain that photos are only one visible part of storage use.
- Cover LINE/media attachments, cache, video apps, downloads, offline content, duplicate screenshots, and backup misunderstandings.
- End with one action: check storage by app and clear/remove the largest unnecessary app data safely.
- Use `Scene21` only. It has no title area and no sub slot. The main image belongs in the central white area; subtitles stay at the bottom overlay.

RM episode scene direction:

- Explain that convenience-store extra purchases are shaped by flow, shelf placement, register-side products, limited-time framing, and small-price psychology.
- Avoid claiming all purchases are manipulation; frame it as design that makes buying easier.
- End with one action: decide one intended item before entering and check the basket before paying.
- Use `Scene12` only. It has a title area, no sub slot, main content on the board area, and subtitles in the bottom-right bubble.

## Visual Assets

For each scene, create one main image prompt based on the full relevant scene from `script_final.md`.

- Do not place full dialogue text in images.
- Include the scene title as a prominent heading, without `sNN` identifiers.
- Use `source_type: imagegen`, `generation_tool: codex-imagegen`, rights confirmation, license, scene id, slot, purpose, adoption reason, and prompt in `meta.json`.
- Record scene id, slot, file, source URL or generation id, original file name, and prompt hash in `imagegen_manifest.json`.

## Parallelization

Use Codex/review agents for independent review and audit work, not as the main implementer.

- Claude produces the episode artifacts and runs commands.
- Codex-style subagents review `script_final.md` quality and can inspect completed steps for issues.
- ZM and RM work can proceed in parallel once the common rules are loaded, but each episode must keep its own directory and evidence.

## Verification

Run the required commands for both episodes:

```powershell
npm run estimate:episode-duration -- auto_zundamon_storage_001
npm run gate:episode -- auto_zundamon_storage_001
npm run render:episode -- auto_zundamon_storage_001 out/videos/auto_zundamon_storage_001.mp4
npm run audit:video -- auto_zundamon_storage_001

npm run estimate:episode-duration -- auto_yukkuri_convenience_001
npm run gate:episode -- auto_yukkuri_convenience_001
npm run render:episode -- auto_yukkuri_convenience_001 out/videos/auto_yukkuri_convenience_001.mp4
npm run audit:video -- auto_yukkuri_convenience_001
```

Use HD output by setting episode metadata to `1280x720` and verifying the rendered MP4 resolution in video audit.

## Non-Goals

- Do not reuse existing scripts.
- Do not use legacy prompt-pack files.
- Do not generate `script_audit.json`, `audit_script_draft.json`, or `script_generation_audit.json`.
- Do not use placeholder, copied, fallback, or untracked local-card images as final assets.
- Do not call either video complete before gate, render, and video audit pass.
