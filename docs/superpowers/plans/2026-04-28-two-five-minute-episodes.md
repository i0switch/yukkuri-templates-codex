# Two 5-Minute Episodes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce two separate HD five-minute videos: one ZM smartphone-storage episode using Scene21 and one RM convenience-store episode using Scene12.

**Architecture:** Each episode is an isolated pipeline directory under `script/`, with planning, natural dialogue draft, final script, Codex review, YAML render input, visual prompts, imagegen manifests, meta, generated assets, gate output, rendered MP4, and video audit. Shared repository scripts perform duration estimation, image generation, gate checks, render, and audit; Claude creates artifacts and uses Codex/review subagents only for review and audit opinions.

**Tech Stack:** Markdown, YAML, JSON, Node.js project scripts, Remotion render pipeline, codex-imagegen batch image generation, Codex-style review subagents.

---

## File Structure

### New ZM episode files

- Create: `script/auto_zundamon_storage_001/planning.md` — audience, misconception, emotion curve, scene roles, target duration strategy.
- Create: `script/auto_zundamon_storage_001/script_draft.md` — natural ずんだもん / 四国めたん dialogue, no subtitle-driven splitting.
- Create: `script/auto_zundamon_storage_001/script_final.md` — final dialogue source of truth for Codex review and downstream conversion.
- Create: `script/auto_zundamon_storage_001/audits/script_final_review.md` — only script audit file, including `script_final_sha256` matching the current final script.
- Create: `script/auto_zundamon_storage_001/script.yaml` — HD render input with `meta.layout_template: Scene21`, `meta.width: 1280`, `meta.height: 720`, `meta.pair: ZM`, no `meta.scene_template`, no `scenes[].scene_template`, and `sub: null`.
- Create: `script/auto_zundamon_storage_001/visual_plan.md` — per-scene image role, composition, and prompt intent.
- Create: `script/auto_zundamon_storage_001/image_prompt_v2.md` — per-scene image prompts derived from each final-script scene.
- Create: `script/auto_zundamon_storage_001/image_prompts.json` — machine-readable prompts for `npm run imagegen:episode`.
- Create: `script/auto_zundamon_storage_001/imagegen_manifest.json` — Codex imagegen file ledger.
- Create: `script/auto_zundamon_storage_001/meta.json` — episode and asset metadata with imagegen rights fields.
- Generated: `script/auto_zundamon_storage_001/assets/sNN_main.png` — one main image per scene.
- Generated: `script/auto_zundamon_storage_001/audits/pre_render_gate.json` — gate output.
- Generated: `out/videos/auto_zundamon_storage_001.mp4` — HD video.

### New RM episode files

- Create: `script/auto_yukkuri_convenience_001/planning.md` — audience, misconception, emotion curve, scene roles, target duration strategy.
- Create: `script/auto_yukkuri_convenience_001/script_draft.md` — natural 霊夢 / 魔理沙 dialogue, no subtitle-driven splitting.
- Create: `script/auto_yukkuri_convenience_001/script_final.md` — final dialogue source of truth for Codex review and downstream conversion.
- Create: `script/auto_yukkuri_convenience_001/audits/script_final_review.md` — only script audit file, including `script_final_sha256` matching the current final script.
- Create: `script/auto_yukkuri_convenience_001/script.yaml` — HD render input with `meta.layout_template: Scene12`, `meta.width: 1280`, `meta.height: 720`, `meta.pair: RM`, no `meta.scene_template`, no `scenes[].scene_template`, and `sub: null`.
- Create: `script/auto_yukkuri_convenience_001/visual_plan.md` — per-scene image role, composition, and prompt intent.
- Create: `script/auto_yukkuri_convenience_001/image_prompt_v2.md` — per-scene image prompts derived from each final-script scene.
- Create: `script/auto_yukkuri_convenience_001/image_prompts.json` — machine-readable prompts for `npm run imagegen:episode`.
- Create: `script/auto_yukkuri_convenience_001/imagegen_manifest.json` — Codex imagegen file ledger.
- Create: `script/auto_yukkuri_convenience_001/meta.json` — episode and asset metadata with imagegen rights fields.
- Generated: `script/auto_yukkuri_convenience_001/assets/sNN_main.png` — one main image per scene.
- Generated: `script/auto_yukkuri_convenience_001/audits/pre_render_gate.json` — gate output.
- Generated: `out/videos/auto_yukkuri_convenience_001.mp4` — HD video.

### Existing files to read, not modify unless a blocker proves the pipeline requires it

- Read: `docs/pipeline_contract.md`
- Read: `docs/agent_fast_path.md`
- Read: `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
- Read: `_reference/script_prompt_pack/local_canonical/zundamon_master.md`
- Read: `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`
- Read: `templates/scene-21_ui-decoration.md`
- Read: `templates/scene-12_classroom-bubbles.md`
- Read as needed for schema only: `scripts/pre-render-gate.mjs`, `scripts/estimate-episode-duration.mjs`, `scripts/run-codex-imagegen-batch.mjs`, `scripts/build-episode.mjs`, `scripts/render-episode.mjs`, `scripts/audit-video.mjs`

---

### Task 1: Inspect render schema and create episode directories

**Files:**
- Create directories: `script/auto_zundamon_storage_001/`, `script/auto_zundamon_storage_001/audits/`, `script/auto_zundamon_storage_001/assets/`
- Create directories: `script/auto_yukkuri_convenience_001/`, `script/auto_yukkuri_convenience_001/audits/`, `script/auto_yukkuri_convenience_001/assets/`
- Read schema scripts listed above only enough to confirm required YAML/JSON fields.

- [ ] **Step 1: Inspect schema checks**

Run:

```bash
rtk grep "layout_template|scene_template|image_prompts|source_type|width|height|audio" scripts
```

Expected: compact matches showing how `script.yaml`, `meta.json`, `image_prompts.json`, and audit outputs are consumed.

- [ ] **Step 2: Create episode directories**

Run:

```bash
rtk mkdir -p script/auto_zundamon_storage_001/audits script/auto_zundamon_storage_001/assets script/auto_yukkuri_convenience_001/audits script/auto_yukkuri_convenience_001/assets
```

Expected: command exits successfully.

- [ ] **Step 3: Confirm directories exist**

Run:

```bash
rtk ls script/auto_zundamon_storage_001 && rtk ls script/auto_yukkuri_convenience_001
```

Expected: each directory lists `assets/` and `audits/`.

---

### Task 2: Write the ZM planning and final script artifacts

**Files:**
- Create: `script/auto_zundamon_storage_001/planning.md`
- Create: `script/auto_zundamon_storage_001/script_draft.md`
- Create: `script/auto_zundamon_storage_001/script_final.md`

- [ ] **Step 1: Write ZM planning**

Create `planning.md` with these concrete decisions:

```markdown
# auto_zundamon_storage_001 Planning

## Input

- Pair: ZM / ずんだもん・四国めたん
- Theme: スマホの容量がすぐ埋まる本当の理由
- Hook: 写真を消しても容量が減らない理由、知ってる？
- Template: Scene21 / UI Decoration
- Target: 5 minutes, 270-330 seconds natural duration
- Output: HD 1280x720

## Viewer Misconception

- Viewers think storage shortage is mostly a photo problem.
- This is risky because deleting visible photos can leave LINE attachments, caches, offline videos, and app data untouched.
- Final action: open the phone storage screen, sort by app size, and safely remove one large unnecessary data source.

## Emotion Curve

- s01: 写真を消したのに減らない不気味さで自分ごと化
- s02: 容量の犯人は写真だけではないと誤解を壊す
- s03: LINE添付とトーク内メディアの見落とし
- s04: キャッシュは便利だが膨らむという危機感
- s05: 動画アプリとオフライン保存の重さ
- s06: ダウンロード・スクショ・重複素材の小さな積み上げ
- s07: バックアップ済みでも本体に残る罠
- s08: ストレージ画面で犯人を見つける手順
- s09: 消していいもの・だめなものの線引き
- s10: 今日やる1アクションとコメント誘導

## Character Roles

- ずんだもん: 写真だけ消せばいいと思い込む視聴者代表。焦り、極端な解決、言い換え、行動宣言を担当。
- 四国めたん: 冷静に原因を分解する解説役。断定しすぎず、端末やアプリで差がある点を補足する。

## Strong Beats

- Opening hook: 写真を消しても容量が減らない理由、知ってる？
- Midpoint rehook: 実は一番見えにくい犯人は、アプリの中に溜まる一時データとオフライン保存。
- Comment prompt: いちばん容量を食っていたアプリ名をコメントで教えてもらう。
- Final action: ストレージ画面で上位3アプリを見て、不要なオフライン保存かキャッシュを1つだけ整理する。
```

- [ ] **Step 2: Write ZM draft**

Create `script_draft.md` as a full natural dialogue using 10 scenes and 90-120 dialogue lines. Scene titles must be hook-style and match the planning beats. Preserve natural speech units.

- [ ] **Step 3: Write ZM final script**

Create `script_final.md` by polishing the draft. Requirements:

- 10 scenes.
- Each scene has 6-12 natural dialogue turns.
- No display-driven short splitting.
- Opening first 15 seconds contains loss, relatable situation, and reason to watch.
- 40-60% midpoint contains a rehook about app-internal data and offline video.
- Last 30 seconds has one comment prompt and one action.
- No unsupported hard statistics; use `目安`, `端末やアプリによる`, or `ケースによる` where needed.

---

### Task 3: Write the RM planning and final script artifacts

**Files:**
- Create: `script/auto_yukkuri_convenience_001/planning.md`
- Create: `script/auto_yukkuri_convenience_001/script_draft.md`
- Create: `script/auto_yukkuri_convenience_001/script_final.md`

- [ ] **Step 1: Write RM planning**

Create `planning.md` with these concrete decisions:

```markdown
# auto_yukkuri_convenience_001 Planning

## Input

- Pair: RM / 霊夢・魔理沙
- Theme: なぜコンビニに行くと余計なものを買うのか
- Hook: コンビニで“ついで買い”するの、設計通りです
- Template: Scene12 / Classroom Speech Bubbles
- Target: 5 minutes, 270-330 seconds natural duration
- Output: HD 1280x720

## Viewer Misconception

- Viewers think impulse buying is only a willpower problem.
- This is risky because store flow, shelf placement, register-side goods, limited-time framing, and small-price psychology all make extra buying easier.
- Final action: decide the one intended item before entering and check the basket once before paying.

## Emotion Curve

- s01: ついで買いは自分だけの弱さではないと自分ごと化
- s02: 入口からレジまでの動線で見る商品が増える
- s03: 棚配置で必要品の近くに誘惑が置かれる
- s04: レジ横商品の最後の一押し
- s05: 限定品と新商品の今だけ感
- s06: 小さな金額が痛みを薄める
- s07: 空腹・疲れ・急ぎで判断が緩む
- s08: 中盤再フックとして買いやすさの設計を言い切る
- s09: ついで買いを防ぐ買い方
- s10: 今日やる1アクションとコメント誘導

## Character Roles

- 霊夢: コンビニで余計に買ってしまう視聴者代表。言い訳、ボケ、生活実感、行動宣言を担当。
- 魔理沙: 動線と心理を解説する役。店を悪者にしすぎず、便利さと買いやすさの両面を整理する。

## Strong Beats

- Opening hook: コンビニで“ついで買い”するの、設計通りです。
- Midpoint rehook: 犯人は意志の弱さだけじゃなく、買う理由を増やす並べ方。
- Comment prompt: つい買ってしまうレジ横商品をコメントで聞く。
- Final action: 入店前に買う物を1つ決め、会計前にカゴを一度見る。
```

- [ ] **Step 2: Write RM draft**

Create `script_draft.md` as a full natural dialogue using 10 scenes and 90-120 dialogue lines. Scene titles must be hook-style and match the planning beats. Preserve natural speech units.

- [ ] **Step 3: Write RM final script**

Create `script_final.md` by polishing the draft. Requirements:

- 10 scenes.
- Each scene has 6-12 natural dialogue turns.
- No display-driven short splitting.
- Opening first 15 seconds contains surprise, relatable situation, and reason to watch.
- 40-60% midpoint contains a rehook about purchase flow and willpower not being the only cause.
- Last 30 seconds has one comment prompt and one action.
- Avoid unsupported claims that every store uses the same layout; use `店や時間帯による`, `傾向`, or `買いやすくなる` where needed.

---

### Task 4: Run Codex-style reviews and write script audit files

**Files:**
- Create: `script/auto_zundamon_storage_001/audits/script_final_review.md`
- Create: `script/auto_yukkuri_convenience_001/audits/script_final_review.md`

- [ ] **Step 1: Compute script hashes**

Run:

```bash
rtk node -e "const fs=require('fs'); const crypto=require('crypto'); for (const f of ['script/auto_zundamon_storage_001/script_final.md','script/auto_yukkuri_convenience_001/script_final.md']) console.log(f, crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'))"
```

Expected: one SHA-256 hash per script.

- [ ] **Step 2: Dispatch independent Codex-style reviews**

Use review subagents to inspect only each `script_final.md` for:

- Character role fidelity.
- Hook strength and first 15 seconds.
- 40-60% midpoint rehook.
- Last action and comment prompt.
- Natural dialogue units, no subtitle-driven splitting.
- Unsupported claims or unsafe hard statistics.
- Template fit: ZM Scene21 no title/sub; RM Scene12 title/no sub.

Expected: each review returns either PASS or actionable fixes.

- [ ] **Step 3: Apply fixes if review finds blockers**

If a review finds a blocker, edit only the relevant `script_final.md`, recompute its hash, and run the same review again.

- [ ] **Step 4: Write ZM review file**

Create `script/auto_zundamon_storage_001/audits/script_final_review.md` starting with:

```markdown
<!-- script_final_sha256: <actual ZM hash> -->
# script_final Review: auto_zundamon_storage_001

Status: PASS

## Scope

Reviewed only `script_final.md` for script quality and pipeline blockers.

## Findings

No blocking issues remain.

## Checks

- Character roles: PASS
- First 15 seconds: PASS
- Midpoint rehook: PASS
- Last action and comment prompt: PASS
- Natural dialogue units: PASS
- Unsupported claims: PASS
- Template fit for Scene21: PASS
```

Replace `<actual ZM hash>` with the computed ZM hash.

- [ ] **Step 5: Write RM review file**

Create `script/auto_yukkuri_convenience_001/audits/script_final_review.md` starting with:

```markdown
<!-- script_final_sha256: <actual RM hash> -->
# script_final Review: auto_yukkuri_convenience_001

Status: PASS

## Scope

Reviewed only `script_final.md` for script quality and pipeline blockers.

## Findings

No blocking issues remain.

## Checks

- Character roles: PASS
- First 15 seconds: PASS
- Midpoint rehook: PASS
- Last action and comment prompt: PASS
- Natural dialogue units: PASS
- Unsupported claims: PASS
- Template fit for Scene12: PASS
```

Replace `<actual RM hash>` with the computed RM hash.

---

### Task 5: Convert final scripts to render YAML

**Files:**
- Create: `script/auto_zundamon_storage_001/script.yaml`
- Create: `script/auto_yukkuri_convenience_001/script.yaml`

- [ ] **Step 1: Confirm script review hashes are current**

Run:

```bash
rtk node -e "const fs=require('fs'); const crypto=require('crypto'); for (const ep of ['auto_zundamon_storage_001','auto_yukkuri_convenience_001']) { const s=fs.readFileSync(`script/${ep}/script_final.md`); const h=crypto.createHash('sha256').update(s).digest('hex'); const r=fs.readFileSync(`script/${ep}/audits/script_final_review.md`,'utf8'); console.log(ep, r.includes(h) ? 'HASH_OK' : 'HASH_STALE'); }"
```

Expected: both episodes print `HASH_OK`.

- [ ] **Step 2: Write ZM YAML**

Create `script.yaml` for `auto_zundamon_storage_001` with:

- `meta.episode_id: auto_zundamon_storage_001`
- `meta.pair: ZM`
- `meta.layout_template: Scene21`
- `meta.width: 1280`
- `meta.height: 720`
- 10 scenes using only Scene21.
- `sub: null` for every scene.
- Dialogue text copied from `script_final.md` as natural speech units.
- `motion_mode` and `dialogue[].emphasis` populated so no 60-second normal-only stretch exists.
- No `meta.scene_template` and no `scenes[].scene_template`.

- [ ] **Step 3: Write RM YAML**

Create `script.yaml` for `auto_yukkuri_convenience_001` with:

- `meta.episode_id: auto_yukkuri_convenience_001`
- `meta.pair: RM`
- `meta.layout_template: Scene12`
- `meta.width: 1280`
- `meta.height: 720`
- 10 scenes using only Scene12.
- `sub: null` for every scene.
- Title fields enabled for Scene12 where the schema supports scene title display.
- Dialogue text copied from `script_final.md` as natural speech units.
- `motion_mode` and `dialogue[].emphasis` populated so no 60-second normal-only stretch exists.
- No `meta.scene_template` and no `scenes[].scene_template`.

---

### Task 6: Create visual plans and image prompts

**Files:**
- Create: `script/auto_zundamon_storage_001/visual_plan.md`
- Create: `script/auto_zundamon_storage_001/image_prompt_v2.md`
- Create: `script/auto_zundamon_storage_001/image_prompts.json`
- Create: `script/auto_yukkuri_convenience_001/visual_plan.md`
- Create: `script/auto_yukkuri_convenience_001/image_prompt_v2.md`
- Create: `script/auto_yukkuri_convenience_001/image_prompts.json`

- [ ] **Step 1: Invoke codex-imagegen skill before image work**

Use `codex-imagegen` because image generation is required and the project instruction makes it mandatory when Codex CLI is available.

- [ ] **Step 2: Write ZM visual plan and prompts**

For each of 10 scenes:

- `visual_plan.md` records scene id, title, image role, composition type, and why it fits Scene21 central white area.
- `image_prompt_v2.md` contains a direct prompt based on the full scene dialogue.
- `image_prompts.json` stores matching objects with `scene_id`, `slot: main`, `file: assets/sNN_main.png`, and prompt text.
- Each prompt includes the scene title as a large heading and excludes `sNN` text from the image.

- [ ] **Step 3: Write RM visual plan and prompts**

For each of 10 scenes:

- `visual_plan.md` records scene id, title, image role, composition type, and why it fits Scene12 board area.
- `image_prompt_v2.md` contains a direct prompt based on the full scene dialogue.
- `image_prompts.json` stores matching objects with `scene_id`, `slot: main`, `file: assets/sNN_main.png`, and prompt text.
- Each prompt includes the scene title as a large heading and excludes `sNN` text from the image.

---

### Task 7: Estimate duration and adjust scripts if needed

**Files:**
- Modify if under target: `script/auto_zundamon_storage_001/script_final.md`, then `script.yaml`, review file hash.
- Modify if under target: `script/auto_yukkuri_convenience_001/script_final.md`, then `script.yaml`, review file hash.

- [ ] **Step 1: Estimate ZM duration**

Run:

```bash
rtk npm run estimate:episode-duration -- auto_zundamon_storage_001
```

Expected: estimated natural duration is `270-330` seconds. If below 270 seconds, add dialogue only where it improves understanding, update `script_final.md`, rerun review, update YAML, and re-estimate.

- [ ] **Step 2: Estimate RM duration**

Run:

```bash
rtk npm run estimate:episode-duration -- auto_yukkuri_convenience_001
```

Expected: estimated natural duration is `270-330` seconds. If below 270 seconds, add dialogue only where it improves understanding, update `script_final.md`, rerun review, update YAML, and re-estimate.

---

### Task 8: Generate images and metadata

**Files:**
- Generated: `script/auto_zundamon_storage_001/assets/sNN_main.png`
- Create/update: `script/auto_zundamon_storage_001/imagegen_manifest.json`
- Create/update: `script/auto_zundamon_storage_001/meta.json`
- Generated: `script/auto_yukkuri_convenience_001/assets/sNN_main.png`
- Create/update: `script/auto_yukkuri_convenience_001/imagegen_manifest.json`
- Create/update: `script/auto_yukkuri_convenience_001/meta.json`

- [ ] **Step 1: Dry-run ZM imagegen**

Run:

```bash
rtk npm run imagegen:episode -- auto_zundamon_storage_001 --dry-run
```

Expected: lists 10 main images to generate or confirms existing valid imagegen assets.

- [ ] **Step 2: Generate ZM images**

Run:

```bash
rtk npm run imagegen:episode -- auto_zundamon_storage_001 --parallel=3
```

Expected: creates `assets/s01_main.png` through `assets/s10_main.png`, updates `imagegen_manifest.json`, and records codex-imagegen source metadata.

- [ ] **Step 3: Dry-run RM imagegen**

Run:

```bash
rtk npm run imagegen:episode -- auto_yukkuri_convenience_001 --dry-run
```

Expected: lists 10 main images to generate or confirms existing valid imagegen assets.

- [ ] **Step 4: Generate RM images**

Run:

```bash
rtk npm run imagegen:episode -- auto_yukkuri_convenience_001 --parallel=3
```

Expected: creates `assets/s01_main.png` through `assets/s10_main.png`, updates `imagegen_manifest.json`, and records codex-imagegen source metadata.

- [ ] **Step 5: Retry failed images if needed**

Run for each episode with failures:

```bash
rtk npm run imagegen:episode -- auto_zundamon_storage_001 --retry-failed
rtk npm run imagegen:episode -- auto_yukkuri_convenience_001 --retry-failed
```

Expected: previously failed scene images are generated.

---

### Task 9: Gate, build, render, and audit both episodes

**Files:**
- Generated: `script/auto_zundamon_storage_001/audits/pre_render_gate.json`
- Generated: `script/auto_yukkuri_convenience_001/audits/pre_render_gate.json`
- Generated: `out/videos/auto_zundamon_storage_001.mp4`
- Generated: `out/videos/auto_yukkuri_convenience_001.mp4`

- [ ] **Step 1: Run ZM gate**

Run:

```bash
rtk npm run gate:episode -- auto_zundamon_storage_001
```

Expected: PASS. If FAIL, fix only the reported blocking issue and rerun.

- [ ] **Step 2: Render ZM episode**

Run:

```bash
rtk npm run render:episode -- auto_zundamon_storage_001 out/videos/auto_zundamon_storage_001.mp4
```

Expected: MP4 is written at HD `1280x720`.

- [ ] **Step 3: Audit ZM video**

Run:

```bash
rtk npm run audit:video -- auto_zundamon_storage_001
```

Expected: PASS.

- [ ] **Step 4: Run RM gate**

Run:

```bash
rtk npm run gate:episode -- auto_yukkuri_convenience_001
```

Expected: PASS. If FAIL, fix only the reported blocking issue and rerun.

- [ ] **Step 5: Render RM episode**

Run:

```bash
rtk npm run render:episode -- auto_yukkuri_convenience_001 out/videos/auto_yukkuri_convenience_001.mp4
```

Expected: MP4 is written at HD `1280x720`.

- [ ] **Step 6: Audit RM video**

Run:

```bash
rtk npm run audit:video -- auto_yukkuri_convenience_001
```

Expected: PASS.

---

### Task 10: Final verification and report

**Files:**
- Read/verify: both `script_final.md` files.
- Read/verify: both `audits/script_final_review.md` files.
- Read/verify: both gate outputs.
- Verify existence: both MP4 files.
- Verify audit command output: both video audits PASS.

- [ ] **Step 1: Check final required files**

Run:

```bash
rtk ls script/auto_zundamon_storage_001 script/auto_zundamon_storage_001/audits script/auto_zundamon_storage_001/assets out/videos/auto_zundamon_storage_001.mp4 && rtk ls script/auto_yukkuri_convenience_001 script/auto_yukkuri_convenience_001/audits script/auto_yukkuri_convenience_001/assets out/videos/auto_yukkuri_convenience_001.mp4
```

Expected: all required files exist.

- [ ] **Step 2: Run final gate and audit commands once more if any artifact changed after first pass**

Run:

```bash
rtk npm run gate:episode -- auto_zundamon_storage_001 && rtk npm run audit:video -- auto_zundamon_storage_001 && rtk npm run gate:episode -- auto_yukkuri_convenience_001 && rtk npm run audit:video -- auto_yukkuri_convenience_001
```

Expected: all four checks PASS.

- [ ] **Step 3: Report completion only if all completion criteria pass**

Final report must include:

- ZM MP4 path: `out/videos/auto_zundamon_storage_001.mp4`
- RM MP4 path: `out/videos/auto_yukkuri_convenience_001.mp4`
- Gate status for both episodes.
- Video audit status for both episodes.
- Note that both are HD `1280x720`.

No git commit is performed unless the user explicitly asks for a commit.

---

## Self-Review

- Spec coverage: covered both episode IDs, topics, hooks, required templates, HD output, no script reuse, codex-imagegen images, Codex review, duration estimate, gate, render, and video audit.
- Placeholder scan: no `TBD`, `TODO`, or undefined episode identifiers remain.
- Type consistency: episode IDs, required paths, template names, and command arguments are consistent across tasks.
- Scope check: this is one production pipeline with two isolated episode directories; tasks are split by artifact type and verification stage.
