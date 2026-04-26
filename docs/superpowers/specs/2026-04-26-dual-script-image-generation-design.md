# Dual Script and Image Generation Design

## Goal

Create two new, independent five-minute script-and-image episode packages without reusing existing scripts.

- Yukkuri episode: Reimu / Marisa, theme: smartphone photos accumulating until important photos become impossible to find.
- Zundamon episode: Zundamon / Shikoku Metan, theme: smartphone notifications eroding focus and free time.

The user delegated template, genre, scenario, and detailed creative decisions to Claude, so no additional requirement questions are needed.

## Scope

For each episode, create the standard script package:

- `planning.md`
- `script_draft.md`
- `script_final.md`
- script final review record
- `script.yaml`
- `visual_plan.md`
- `image_prompt_v2.md`
- `assets/`
- relevant audit notes under `audits/`

The request is script and image generation only. Rendering an MP4 and video audit are out of scope, so the final report must not call the videos complete.

## Content Design

### Yukkuri episode

Use a practical daily-life explanatory tone with Reimu and Marisa. Reimu should bring relatable mistakes, impatience, and light jokes. Marisa should explain causes, sorting principles, and concrete recovery actions without becoming a correction-only role.

The episode should move from frustration to relief:

1. Hook: a needed photo cannot be found at the worst moment.
2. Cause: screenshots, duplicates, and temporary photos mix with important memories.
3. Sorting principle: separate deletion, preservation, and searchability.
4. Recovery workflow: album names, favorites, search terms, and scheduled cleanup.
5. Closing: a small habit that prevents the mess from returning.

### Zundamon episode

Use a slightly faster, comic daily-life explanatory tone with Zundamon and Shikoku Metan. Zundamon should embody notification-driven mistakes and excuses. Metan should organize the issue with gentle sarcasm and concrete countermeasures.

The episode should move from chaos to control:

1. Hook: notifications interrupt one simple task until time disappears.
2. Cause: the phone is not one interruption but many small context switches.
3. Misconception: checking quickly still drains attention.
4. Recovery workflow: notification categories, focus mode, app-specific rules, and check windows.
5. Closing: make the phone ask permission before stealing attention.

## Production Rules

Follow the v2 flow:

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml
-> visual_plan.md
-> image_prompt_v2.md
-> image generation
```

Do not generate `script.yaml` directly from the idea. Do not mechanically split dialogue for display. `script.yaml` must preserve the natural utterance units and information order from `script_final.md`.

Use one `meta.layout_template` per episode, selected from `Scene01` to `Scene21`. Do not use `meta.scene_template` or `scenes[].scene_template`.

## Visual Design

Create 16:9 main content images for scenes using direct prompts based on the relevant `script_final.md` scene text.

Images should show scenes, objects, moods, and symbolic situations. Japanese text is allowed only when useful, but do not ask the image model to render full dialogue, long explanations, tables, arrows, checklists, or exact subtitles. Remotion should render dialogue subtitles only; content slots should stay image-only.

Use the `codex-imagegen` skill for image generation when the environment supports Codex CLI. If image generation is not available, record the limitation clearly and do not mark image generation as complete.

## Review and Verification

Use Codex/review-style assistance only for review or independent checking, not as the primary implementation owner.

Before final reporting:

- Confirm both episode directories exist.
- Confirm both `script_final.md` files exist and were reviewed.
- Confirm both `script.yaml` files preserve natural dialogue units.
- Confirm image prompts and image assets exist, or record NOT_AVAILABLE if generation cannot run.
- Do not claim video completion because render and video audit are outside this request.
