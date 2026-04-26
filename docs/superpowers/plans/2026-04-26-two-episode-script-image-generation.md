# Two Episode Script Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two new, non-reused 5-minute script-and-image episode packages for RM/Yukkuri and ZM/Zundamon.

**Architecture:** Build two independent episode directories using the repository prompt-pack workflow. Each episode gets planning, draft, audit, final script, YAML, image metadata, generated image assets, and audit evidence. Script creation and image generation are separated so YAML is created only after draft audit PASS, and images are generated only from image directions and audited prompts.

**Tech Stack:** Markdown/YAML/JSON episode assets, Node/npm repository gates, Python audit helpers where available, Codex CLI image generation through the `codex-imagegen` skill, Remotion-compatible `script.yaml` schema.

---

## File Structure

Create these files for the RM episode:

- `script/ep914-rm-receipt-app-trap/planning.md` — natural-language episode design.
- `script/ep914-rm-receipt-app-trap/script_draft.md` — unconstrained conversational draft.
- `script/ep914-rm-receipt-app-trap/script_audit.md` — draft quality audit verdict and fixes.
- `script/ep914-rm-receipt-app-trap/script_final.md` — final natural conversation after audit PASS.
- `script/ep914-rm-receipt-app-trap/script.yaml` — render-ready YAML with 25-character dialogue lines.
- `script/ep914-rm-receipt-app-trap/meta.json` — asset provenance, prompts, and audit metadata.
- `script/ep914-rm-receipt-app-trap/visual_plan.md` — per-scene image directions and prompt metadata.
- `script/ep914-rm-receipt-app-trap/assets/s01_main.png` through `assets/s10_main.png` — generated images.
- `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_plan.md` — evidence for `01_plan_prompt.md`.
- `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_draft.md` — evidence for `02_draft_prompt.md`.
- `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_audit.md` — evidence for `03_audit_prompt.md`.
- `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_yaml.md` — evidence for `05_yaml_prompt.md`.
- `script/ep914-rm-receipt-app-trap/audits/script_generation_audit.json` — script-generation PASS/NOT_AVAILABLE record.
- `script/ep914-rm-receipt-app-trap/audits/image_prompt_audit.json` — image prompt pre-generation audit.
- `script/ep914-rm-receipt-app-trap/audits/image_result_audit.json` — actual image inspection audit.

Create the same structure for the ZM episode:

- `script/ep915-zm-photo-cleanup-trap/planning.md`
- `script/ep915-zm-photo-cleanup-trap/script_draft.md`
- `script/ep915-zm-photo-cleanup-trap/script_audit.md`
- `script/ep915-zm-photo-cleanup-trap/script_final.md`
- `script/ep915-zm-photo-cleanup-trap/script.yaml`
- `script/ep915-zm-photo-cleanup-trap/meta.json`
- `script/ep915-zm-photo-cleanup-trap/visual_plan.md`
- `script/ep915-zm-photo-cleanup-trap/assets/s01_main.png` through `assets/s10_main.png`
- `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_plan.md`
- `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_draft.md`
- `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_audit.md`
- `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_yaml.md`
- `script/ep915-zm-photo-cleanup-trap/audits/script_generation_audit.json`
- `script/ep915-zm-photo-cleanup-trap/audits/image_prompt_audit.json`
- `script/ep915-zm-photo-cleanup-trap/audits/image_result_audit.json`

Modify only if validation reveals a schema mismatch:

- No source code changes are expected.
- Do not modify existing episode directories.
- Do not reuse text from existing episode scripts.

---

### Task 1: Confirm Prompt Pack and Template Inputs

**Files:**
- Read: `CLAUDE.md`
- Read: `AGENTS.md`
- Read: `AI_VIDEO_GENERATION_GUIDE.md`
- Read: `docs/architecture_v2.md`
- Read: `prompts/00_core_principles.md`
- Read: `10_video-pipeline.md`
- Read: `workflows/script_to_video_workflow.md`
- Read: `06_scene-layout-guide.md`
- Read: `_reference/script_prompt_pack/README.md`
- Read: `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
- Read: `_reference/script_prompt_pack/01_plan_prompt.md`
- Read: `_reference/script_prompt_pack/02_draft_prompt.md`
- Read: `_reference/script_prompt_pack/03_audit_prompt.md`
- Read: `_reference/script_prompt_pack/04_rewrite_prompt.md`
- Read: `_reference/script_prompt_pack/05_yaml_prompt.md`
- Read: `_reference/image_prompt_pack/README.md`
- Read: `_reference/image_prompt_pack/00_IMAGE_GEN_MASTER_RULES.md`
- Read: `_reference/image_prompt_pack/01_IMAGE_DIRECTION_PROMPT.md`
- Read: `_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md`
- Read: `_reference/image_prompt_pack/03_IMAGE_PROMPT_AUDIT.md`
- Read: `_reference/image_prompt_pack/04_IMAGE_REWRITE_PROMPT.md`
- Read: `_reference/image_prompt_pack/05_IMAGE_RESULT_AUDIT.md`
- Read: `templates/scene-02_*.md` matching Scene02

- [ ] **Step 1: Locate the Scene02 template file**

Run:

```bash
rtk find "templates/scene-02*"
```

Expected: one `templates/scene-02_*.md` path.

- [ ] **Step 2: Read required files**

Use Read tool for each file listed above. If `_reference/image_prompt_pack/README.md` is absent, record that as `NOT_AVAILABLE` in later audit notes but still read the numbered image prompt pack files.

Expected: all script prompt pack files and all numbered image prompt pack files are available.

- [ ] **Step 3: Record fixed production inputs in working notes**

Use these fixed inputs throughout implementation:

```text
RM episode_id: ep914-rm-receipt-app-trap
RM title: レシートアプリで節約した気になる罠
RM pair: RM
RM voice_engine: aquestalk
RM theme: receipt app and expense tracking false confidence

ZM episode_id: ep915-zm-photo-cleanup-trap
ZM title: 写真整理で大事な証拠を消す罠
ZM pair: ZM
ZM voice_engine: voicevox
ZM theme: photo cleanup and accidental deletion of useful screenshots/documents

layout_template: Scene02
target_duration_sec: 300
scene_count: 10
image_count: 10 main images per episode
width: 1280
height: 720
fps: 30
```

Expected: no user questions are needed because the user explicitly delegated template, genre, scenario, and completion decisions.

---

### Task 2: Create Episode Directories

**Files:**
- Create directory: `script/ep914-rm-receipt-app-trap/`
- Create directory: `script/ep914-rm-receipt-app-trap/assets/`
- Create directory: `script/ep914-rm-receipt-app-trap/audits/`
- Create directory: `script/ep915-zm-photo-cleanup-trap/`
- Create directory: `script/ep915-zm-photo-cleanup-trap/assets/`
- Create directory: `script/ep915-zm-photo-cleanup-trap/audits/`

- [ ] **Step 1: Verify parent directory exists**

Run:

```bash
rtk ls "script"
```

Expected: existing episode directories are listed.

- [ ] **Step 2: Create required directories**

Run:

```bash
mkdir -p "script/ep914-rm-receipt-app-trap/assets" "script/ep914-rm-receipt-app-trap/audits" "script/ep915-zm-photo-cleanup-trap/assets" "script/ep915-zm-photo-cleanup-trap/audits"
```

Expected: command succeeds with no output.

- [ ] **Step 3: Confirm directories**

Run:

```bash
rtk ls "script/ep914-rm-receipt-app-trap" && rtk ls "script/ep915-zm-photo-cleanup-trap"
```

Expected: each directory contains `assets/` and `audits/`.

---

### Task 3: Produce RM Planning and Draft Evidence

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/planning.md`
- Create: `script/ep914-rm-receipt-app-trap/script_draft.md`
- Create: `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_plan.md`
- Create: `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_draft.md`

- [ ] **Step 1: Write RM planning file**

Create `script/ep914-rm-receipt-app-trap/planning.md` with this structure and complete content generated from the prompt pack rules:

```markdown
# ep914-rm-receipt-app-trap planning

使用元:
- _reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
- _reference/script_prompt_pack/01_plan_prompt.md

## Fixed Inputs

theme: レシートアプリで節約した気になる罠
target_viewer: 家計簿アプリやレシート投稿で節約した気になっている人
duration: 約5分
character_pair: RM
layout_template: Scene02
main_content: 各sceneの状況イメージ、比較、危険シミュレーション
sub_content: 要点、分類、3ステップ、注意点
subtitle_area: bottom bar
avoid_area: 下部20%、左右キャラ領域、字幕枠

## Viewer Problem

レシート投稿でポイントが貯まり、支出を記録した安心感があるのに、月末にはなぜか赤字になる。原因は、記録そのものを節約と勘違いし、固定費・衝動買い・サブスクの確認が後回しになること。感情曲線は「記録したのに赤字で驚く」→「ポイントで得した気分が崩れる」→「見直す場所がわかって安心する」→「週1回の確認ならできそう」で着地させる。

## Information Goal

視聴後に、レシート記録を固定費・変動費・衝動買いに分けて見直せる。ポイント額ではなく、月末に残った金額で節約効果を判断できる。週1回、アプリの合計だけでなくサブスクと未分類支出を確認できる。

## Scene Plan

| scene | role | hook or conflict | practical point | visual_type |
|---|---|---|---|---|
| s01 | hook | 記録したのに赤字で始める | 記録は節約そのものではない | hook_poster |
| s02 | myth_vs_fact | ポイントが増えるほど得という誤解 | ポイントより支出総額を見る | myth_vs_fact |
| s03 | boke_visual | 魔理沙がレシートを集めて勝った気になる | 集めるだけでは使途不明金は減らない | boke_visual |
| s04 | danger_simulation | 小さな買い足しが月末に大きくなる | 1回の少額より頻度を確認する | danger_simulation |
| s05 | before_after | 記録だけの月と週1レビューの月を比べる | 未分類支出を減らすと効く | before_after |
| s06 | flowchart_scene | 赤字原因をたどる中盤リフック | 固定費、変動費、衝動買いに分ける | flowchart_scene |
| s07 | checklist_panel | アプリ画面で見る場所を整理する | 合計、未分類、サブスクを見る | checklist_panel |
| s08 | mini_story_scene | コンビニ寄り道の小話 | 支出の引き金をメモする | mini_story_scene |
| s09 | three_step_board | 週1レビューの3手順 | 分ける、見る、1つ止める | three_step_board |
| s10 | final_action_card | 今日やる行動で締める | 未分類確認とサブスク確認を実行する | final_action_card |
```

- [ ] **Step 2: Copy RM planning evidence**

Create `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_plan.md` with the same planning content plus this first line:

```markdown
使用元: _reference/script_prompt_pack/01_plan_prompt.md
```

Expected: file exists and names `01_plan_prompt.md`.

- [ ] **Step 3: Write RM draft**

Create `script/ep914-rm-receipt-app-trap/script_draft.md` as a natural RM conversation. Requirements:

```text
- 10 scenes: s01 through s10
- 90 or more dialogue lines total
- 1 scene has 8-12 lines
- 霊夢 and 魔理沙 alternate frequently
- 魔理沙の「だぜ」 ending appears in 30-60% of 魔理沙 lines
- opening starts with loss, surprise, misconception, strong question, or number
- midpoint rehook appears in s05 or s06
- final scene has at least 2 concrete actions
- do not limit draft lines to 25 characters
- no text copied from existing scripts
```

Use this scene heading pattern and continue with original dialogue for all scenes:

```markdown
## s01: レシートの罠

- 霊夢: え、ちゃんと記録してたのに今月も赤字なんだけど？
- 魔理沙: その「記録したから安心」がいちばん危ないんだぜ。
```

Expected: `script_draft.md` contains no YAML and reads as natural dialogue.

- [ ] **Step 4: Copy RM draft evidence**

Create `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_draft.md` with the same draft content plus this first line:

```markdown
使用元: _reference/script_prompt_pack/02_draft_prompt.md
```

Expected: file exists and names `02_draft_prompt.md`.

---

### Task 4: Produce ZM Planning and Draft Evidence

**Files:**
- Create: `script/ep915-zm-photo-cleanup-trap/planning.md`
- Create: `script/ep915-zm-photo-cleanup-trap/script_draft.md`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_plan.md`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_draft.md`

- [ ] **Step 1: Write ZM planning file**

Create `script/ep915-zm-photo-cleanup-trap/planning.md` with this structure and complete content generated from the prompt pack rules:

```markdown
# ep915-zm-photo-cleanup-trap planning

使用元:
- _reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
- _reference/script_prompt_pack/01_plan_prompt.md

## Fixed Inputs

theme: 写真整理で大事な証拠を消す罠
target_viewer: スマホ写真を一気に消して容量を空けようとする人
duration: 約5分
character_pair: ZM
layout_template: Scene02
main_content: 消す前後の状況、書類スクショ、分類ミスの危険
sub_content: 残す基準、削除手順、保留フォルダ
subtitle_area: bottom bar
avoid_area: 下部20%、左右キャラ領域、字幕枠

## Viewer Problem

容量不足で写真を一気に消した結果、保証書、予約画面、支払い控え、道案内など後で必要な画像まで消して困る。原因は、見た目が似ているスクショをすべて不要と判断し、残す基準と保留場所を作らないこと。感情曲線は「消した直後の絶望」→「何が危険か理解する」→「安全な順番を知る」→「今日から3段階で整理できる」で着地させる。

## Information Goal

視聴後に、写真を証拠・思い出・一時メモ・明らかな不要物に分けられる。削除前に重要画像をアルバムやクラウドへ退避できる。迷う画像をすぐ消さず、保留フォルダで後日確認できる。

## Scene Plan

| scene | role | hook or conflict | practical point | visual_type |
|---|---|---|---|---|
| s01 | hook | 消した後に必要画像へ気づく | 一括削除は事故りやすい | hook_poster |
| s02 | myth_vs_fact | スクショは全部ゴミという誤解 | 証拠系スクショは残す | myth_vs_fact |
| s03 | boke_visual | ずんだもんが全部消して爽快になる | 爽快感で判断しない | boke_visual |
| s04 | danger_simulation | 返品や予約確認で詰む | 支払い、予約、保証は要注意 | danger_simulation |
| s05 | before_after | 一括削除と分類削除を比べる | 分けるだけで事故が減る | before_after |
| s06 | flowchart_scene | 消していいか迷う中盤リフック | 証拠、思い出、一時メモで判断 | flowchart_scene |
| s07 | checklist_panel | 残す画像の条件を整理する | 金額、日時、番号、住所を見る | checklist_panel |
| s08 | mini_story_scene | 友人との集合場所スクショ小話 | 用が済む日まで残す | mini_story_scene |
| s09 | three_step_board | 安全整理の3手順 | 退避、削除、保留 | three_step_board |
| s10 | final_action_card | 今日やる行動で締める | 重要アルバムと保留を作る | final_action_card |
```

- [ ] **Step 2: Copy ZM planning evidence**

Create `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_plan.md` with the same planning content plus this first line:

```markdown
使用元: _reference/script_prompt_pack/01_plan_prompt.md
```

Expected: file exists and names `01_plan_prompt.md`.

- [ ] **Step 3: Write ZM draft**

Create `script/ep915-zm-photo-cleanup-trap/script_draft.md` as a natural ZM conversation. Requirements:

```text
- 10 scenes: s01 through s10
- 90 or more dialogue lines total
- 1 scene has 8-12 lines
- ずんだもん and 四国めたん alternate frequently
- ずんだもんの「のだ」「なのだ」 ending appears in 20-40% of ずんだもん lines
- opening starts with loss, surprise, misconception, strong question, or number
- midpoint rehook appears in s05 or s06
- final scene has at least 2 concrete actions
- do not limit draft lines to 25 characters
- no text copied from existing scripts
```

Use this scene heading pattern and continue with original dialogue for all scenes:

```markdown
## s01: 消す前に待って

- ずんだもん: 写真を消したら、必要な証拠まで消えたのだ。
- 四国めたん: いきなり怖い始まりね。何を消したの？
```

Expected: `script_draft.md` contains no YAML and reads as natural dialogue.

- [ ] **Step 4: Copy ZM draft evidence**

Create `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_draft.md` with the same draft content plus this first line:

```markdown
使用元: _reference/script_prompt_pack/02_draft_prompt.md
```

Expected: file exists and names `02_draft_prompt.md`.

---

### Task 5: Audit Drafts and Create Final Scripts

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/script_audit.md`
- Create: `script/ep914-rm-receipt-app-trap/script_final.md`
- Create: `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_audit.md`
- Create optionally: `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_rewrite.md`
- Create: `script/ep915-zm-photo-cleanup-trap/script_audit.md`
- Create: `script/ep915-zm-photo-cleanup-trap/script_final.md`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_audit.md`
- Create optionally: `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_rewrite.md`

- [ ] **Step 1: Audit RM draft manually against prompt pack**

Create `script/ep914-rm-receipt-app-trap/script_audit.md` with this structure:

```markdown
# ep914-rm-receipt-app-trap script audit

使用元: _reference/script_prompt_pack/03_audit_prompt.md

## Verdict

PASS

## Checks

- Opening hook: PASS — [specific reason]
- 10 body scenes: PASS — s01-s10 present
- 90+ dialogue lines: PASS — [line count]
- Average 8+ lines per scene: PASS — [average]
- RM character voice: PASS — [魔理沙だぜ ratio]
- Boke/tsukkomi exchanges: PASS — [specific scenes]
- Midpoint rehook: PASS — [specific scene]
- Final concrete actions: PASS — [specific actions]
- Existing script reuse: PASS — newly written content
- YAML readiness: PASS — draft can now be transformed without changing meaning

## Required Fixes

None.
```

If any item fails, set Verdict to FAIL, write concrete fixes, apply only those fixes using `04_rewrite_prompt.md`, create `audits/script_prompt_pack_rewrite.md`, then re-audit until PASS.

- [ ] **Step 2: Copy RM audit evidence**

Create `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_audit.md` with the same audit content.

Expected: file includes `PASS` and `03_audit_prompt.md`.

- [ ] **Step 3: Create RM final script**

Create `script/ep914-rm-receipt-app-trap/script_final.md` by copying the audited PASS version of the draft. If a rewrite happened, use the rewritten version.

Expected: final script is natural conversation, not YAML.

- [ ] **Step 4: Audit ZM draft manually against prompt pack**

Create `script/ep915-zm-photo-cleanup-trap/script_audit.md` with this structure:

```markdown
# ep915-zm-photo-cleanup-trap script audit

使用元: _reference/script_prompt_pack/03_audit_prompt.md

## Verdict

PASS

## Checks

- Opening hook: PASS — [specific reason]
- 10 body scenes: PASS — s01-s10 present
- 90+ dialogue lines: PASS — [line count]
- Average 8+ lines per scene: PASS — [average]
- ZM character voice: PASS — [のだ/なのだ ratio]
- Boke/tsukkomi exchanges: PASS — [specific scenes]
- Midpoint rehook: PASS — [specific scene]
- Final concrete actions: PASS — [specific actions]
- Existing script reuse: PASS — newly written content
- YAML readiness: PASS — draft can now be transformed without changing meaning

## Required Fixes

None.
```

If any item fails, set Verdict to FAIL, write concrete fixes, apply only those fixes using `04_rewrite_prompt.md`, create `audits/script_prompt_pack_rewrite.md`, then re-audit until PASS.

- [ ] **Step 5: Copy ZM audit evidence**

Create `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_audit.md` with the same audit content.

Expected: file includes `PASS` and `03_audit_prompt.md`.

- [ ] **Step 6: Create ZM final script**

Create `script/ep915-zm-photo-cleanup-trap/script_final.md` by copying the audited PASS version of the draft. If a rewrite happened, use the rewritten version.

Expected: final script is natural conversation, not YAML.

---

### Task 6: Convert RM Final Script to YAML

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/script.yaml`
- Create: `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_yaml.md`
- Create: `script/ep914-rm-receipt-app-trap/audits/script_generation_audit.json`

- [ ] **Step 1: Create RM YAML**

Create `script/ep914-rm-receipt-app-trap/script.yaml` using this schema:

```yaml
meta:
  id: ep914-rm-receipt-app-trap
  title: レシートアプリで節約した気になる罠
  layout_template: Scene02
  pair: RM
  fps: 30
  width: 1280
  height: 720
  voice_engine: aquestalk
  target_duration_sec: 300
  image_style: warm realistic digital-life illustration, clean Remotion overlay space
scenes:
  - id: s01
    title_text: レシートの罠
    duration_sec: 30
    main:
      kind: image
      asset: assets/s01_main.png
    sub: null
    dialogue:
      - speaker: reimu
        text: え、記録したのに赤字？
      - speaker: marisa
        text: そこが罠だぜ
```

Continue through `s10`. Requirements:

```text
- Every dialogue text is 25 characters or fewer.
- Split long final-script lines without changing meaning.
- Use speaker IDs consistently: reimu, marisa.
- Use only meta.layout_template, never meta.scene_template.
- Do not add scenes[].scene_template.
- Use assets/sNN_main.png relative paths.
- For Scene02, set sub to an image only if the renderer expects it; otherwise use sub: null consistently. Prefer sub: null to reduce generated image count.
```

Expected: YAML is valid and all dialogue text is short.

- [ ] **Step 2: Create RM YAML evidence**

Create `script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_yaml.md`:

```markdown
# ep914-rm-receipt-app-trap YAML conversion evidence

使用元: _reference/script_prompt_pack/05_yaml_prompt.md

## Verdict

PASS

## Notes

- Converted only after `script_prompt_pack_audit.md` PASS.
- Preserved scene order and character meaning from `script_final.md`.
- Split dialogue text to 25 characters or fewer for render.
- Used `meta.layout_template: Scene02`.
- Did not use `scenes[].scene_template`.
```

Expected: file exists and names `05_yaml_prompt.md`.

- [ ] **Step 3: Create RM script generation audit JSON**

Create `script/ep914-rm-receipt-app-trap/audits/script_generation_audit.json`:

```json
{
  "step": "script_generation",
  "verdict": "PASS",
  "reviewer": "second-codex",
  "cross_review_status": "NOT_AVAILABLE",
  "human_review_required": true,
  "prompt_pack_evidence": {
    "plan": "script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_plan.md",
    "draft": "script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_draft.md",
    "audit": "script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_audit.md",
    "yaml": "script/ep914-rm-receipt-app-trap/audits/script_prompt_pack_yaml.md"
  }
}
```

Expected: JSON parses and does not use `reviewer: codex-self`.

---

### Task 7: Convert ZM Final Script to YAML

**Files:**
- Create: `script/ep915-zm-photo-cleanup-trap/script.yaml`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_yaml.md`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/script_generation_audit.json`

- [ ] **Step 1: Create ZM YAML**

Create `script/ep915-zm-photo-cleanup-trap/script.yaml` using this schema:

```yaml
meta:
  id: ep915-zm-photo-cleanup-trap
  title: 写真整理で大事な証拠を消す罠
  layout_template: Scene02
  pair: ZM
  fps: 30
  width: 1280
  height: 720
  voice_engine: voicevox
  target_duration_sec: 300
  image_style: bright practical smartphone-life illustration, clean Remotion overlay space
scenes:
  - id: s01
    title_text: 消す前に待って
    duration_sec: 30
    main:
      kind: image
      asset: assets/s01_main.png
    sub: null
    dialogue:
      - speaker: zundamon
        text: 写真を消したら詰んだのだ
      - speaker: metan
        text: 何を消したの？
```

Continue through `s10`. Requirements:

```text
- Every dialogue text is 25 characters or fewer.
- Split long final-script lines without changing meaning.
- Use speaker IDs consistently: zundamon, metan.
- Use only meta.layout_template, never meta.scene_template.
- Do not add scenes[].scene_template.
- Use assets/sNN_main.png relative paths.
- For Scene02, set sub to an image only if the renderer expects it; otherwise use sub: null consistently. Prefer sub: null to reduce generated image count.
```

Expected: YAML is valid and all dialogue text is short.

- [ ] **Step 2: Create ZM YAML evidence**

Create `script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_yaml.md`:

```markdown
# ep915-zm-photo-cleanup-trap YAML conversion evidence

使用元: _reference/script_prompt_pack/05_yaml_prompt.md

## Verdict

PASS

## Notes

- Converted only after `script_prompt_pack_audit.md` PASS.
- Preserved scene order and character meaning from `script_final.md`.
- Split dialogue text to 25 characters or fewer for render.
- Used `meta.layout_template: Scene02`.
- Did not use `scenes[].scene_template`.
```

Expected: file exists and names `05_yaml_prompt.md`.

- [ ] **Step 3: Create ZM script generation audit JSON**

Create `script/ep915-zm-photo-cleanup-trap/audits/script_generation_audit.json`:

```json
{
  "step": "script_generation",
  "verdict": "PASS",
  "reviewer": "second-codex",
  "cross_review_status": "NOT_AVAILABLE",
  "human_review_required": true,
  "prompt_pack_evidence": {
    "plan": "script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_plan.md",
    "draft": "script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_draft.md",
    "audit": "script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_audit.md",
    "yaml": "script/ep915-zm-photo-cleanup-trap/audits/script_prompt_pack_yaml.md"
  }
}
```

Expected: JSON parses and does not use `reviewer: codex-self`.

---

### Task 8: Create Visual Plans and Image Prompt Audits

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/visual_plan.md`
- Create: `script/ep914-rm-receipt-app-trap/audits/image_prompt_audit.json`
- Create: `script/ep915-zm-photo-cleanup-trap/visual_plan.md`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/image_prompt_audit.json`

- [ ] **Step 1: Create RM visual plan**

Create `script/ep914-rm-receipt-app-trap/visual_plan.md`. Include 10 entries with this exact field set per scene:

```markdown
## s01 main

image_direction:
  scene_id: s01
  slot: main
  visual_type: hook_poster
  composition_type: smartphone_receipt_confusion
  supports_dialogue:
    - え、記録したのに赤字？
    - そこが罠だぜ
  supports_moment: レシート記録で安心したのに月末に赤字へ気づく瞬間
  layout_safety:
    bottom_20_percent: empty for subtitles
    character_area: no important objects near lower left or lower right
    remotion_overlay_space: right side reserved for labels
  must_not_include:
    - Japanese text inside image
    - Reimu or Marisa characters
    - real brand logos
    - grids or sprite sheets
imagegen_prompt: >
  Generate exactly one 16:9 image for this scene only. A cozy Japanese desk with a smartphone showing an abstract receipt-app style interface without readable text, many paper receipts, a small wallet, and a monthly budget notebook. The mood is surprised and slightly anxious, warm evening light, clear foreground/midground/background separation, empty bottom 20 percent for subtitles, no characters, no Japanese text, no logos, no grid, no sprite sheet, no batch layout.
```

Create equivalent concrete entries for s02-s10 using visual types from the spec: `myth_vs_fact`, `boke_visual`, `danger_simulation`, `before_after`, `flowchart_scene`, `checklist_panel`, `mini_story_scene`, `three_step_board`, `final_action_card`.

- [ ] **Step 2: Create RM image prompt audit JSON**

Create `script/ep914-rm-receipt-app-trap/audits/image_prompt_audit.json`:

```json
{
  "step": "image_prompt_audit",
  "verdict": "PASS",
  "reviewer": "claude",
  "cross_review_status": "NOT_AVAILABLE",
  "human_review_required": true,
  "checks": [
    {
      "scene_id": "s01",
      "slot": "main",
      "dialogue_linkage": 8,
      "specificity": 8,
      "layout_safety": 8,
      "one_image_per_call": 10,
      "no_banned_batch_terms": 10,
      "no_character_or_logo": 9,
      "remotion_overlay_fit": 8,
      "score": 61,
      "verdict": "PASS"
    }
  ]
}
```

Add checks for s02-s10. Each score must be 55 or more and verdict PASS.

- [ ] **Step 3: Create ZM visual plan**

Create `script/ep915-zm-photo-cleanup-trap/visual_plan.md`. Include 10 entries with this exact field set per scene:

```markdown
## s01 main

image_direction:
  scene_id: s01
  slot: main
  visual_type: hook_poster
  composition_type: accidental_delete_panic
  supports_dialogue:
    - 写真を消したら詰んだのだ
    - 何を消したの？
  supports_moment: 写真整理で必要な証拠画像まで消してしまった直後
  layout_safety:
    bottom_20_percent: empty for subtitles
    character_area: no important objects near lower left or lower right
    remotion_overlay_space: right side reserved for labels
  must_not_include:
    - Japanese text inside image
    - Zundamon or Metan characters
    - real app logos
    - grids or sprite sheets
imagegen_prompt: >
  Generate exactly one 16:9 image for this scene only. A smartphone gallery cleanup scene with abstract thumbnail cards, a large delete confirmation mood without readable text, a worried hand hovering over the screen, and a small folder labeled only by icon shapes, bright practical lighting, empty bottom 20 percent for subtitles, no characters, no Japanese text, no logos, no grid, no sprite sheet, no batch layout.
```

Create equivalent concrete entries for s02-s10 using visual types from the spec: `myth_vs_fact`, `boke_visual`, `danger_simulation`, `before_after`, `flowchart_scene`, `checklist_panel`, `mini_story_scene`, `three_step_board`, `final_action_card`.

- [ ] **Step 4: Create ZM image prompt audit JSON**

Create `script/ep915-zm-photo-cleanup-trap/audits/image_prompt_audit.json`:

```json
{
  "step": "image_prompt_audit",
  "verdict": "PASS",
  "reviewer": "claude",
  "cross_review_status": "NOT_AVAILABLE",
  "human_review_required": true,
  "checks": [
    {
      "scene_id": "s01",
      "slot": "main",
      "dialogue_linkage": 8,
      "specificity": 8,
      "layout_safety": 8,
      "one_image_per_call": 10,
      "no_banned_batch_terms": 10,
      "no_character_or_logo": 9,
      "remotion_overlay_fit": 8,
      "score": 61,
      "verdict": "PASS"
    }
  ]
}
```

Add checks for s02-s10. Each score must be 55 or more and verdict PASS.

---

### Task 9: Generate Images with Codex Imagegen

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/assets/s01_main.png` through `s10_main.png`
- Create: `script/ep915-zm-photo-cleanup-trap/assets/s01_main.png` through `s10_main.png`

- [ ] **Step 1: Invoke required image skill**

Invoke `codex-imagegen` skill before running any image generation commands.

Expected: skill instructions are loaded and followed.

- [ ] **Step 2: Check Codex CLI availability**

Run:

```bash
rtk codex --version
```

Expected: codex version prints. If command fails, stop image generation and report `codex_imagegen_status: NOT_AVAILABLE`, `human_review_required: true`.

- [ ] **Step 3: Check Codex auth file**

Run:

```bash
test -f "$HOME/.codex/auth.json" && printf 'auth ok\n'
```

Expected: `auth ok`. If absent, stop image generation and report `codex_imagegen_status: NOT_AVAILABLE`, `human_review_required: true`.

- [ ] **Step 4: Generate images one per process**

For each of the 20 visual plan entries, start one Codex image generation process. Use at most four concurrent background commands. Each command must provide exactly one scene prompt and exactly one target path.

Example shape for one image:

```bash
codex exec "Using the codex-imagegen instructions, generate exactly one image from script/ep914-rm-receipt-app-trap/visual_plan.md section 's01 main' and save it as script/ep914-rm-receipt-app-trap/assets/s01_main.png. Do not generate any other image. Do not create a grid, sheet, or batch." 
```

Expected: one PNG file appears at the requested path.

- [ ] **Step 5: Repeat for every target asset**

Targets:

```text
script/ep914-rm-receipt-app-trap/assets/s01_main.png
script/ep914-rm-receipt-app-trap/assets/s02_main.png
script/ep914-rm-receipt-app-trap/assets/s03_main.png
script/ep914-rm-receipt-app-trap/assets/s04_main.png
script/ep914-rm-receipt-app-trap/assets/s05_main.png
script/ep914-rm-receipt-app-trap/assets/s06_main.png
script/ep914-rm-receipt-app-trap/assets/s07_main.png
script/ep914-rm-receipt-app-trap/assets/s08_main.png
script/ep914-rm-receipt-app-trap/assets/s09_main.png
script/ep914-rm-receipt-app-trap/assets/s10_main.png
script/ep915-zm-photo-cleanup-trap/assets/s01_main.png
script/ep915-zm-photo-cleanup-trap/assets/s02_main.png
script/ep915-zm-photo-cleanup-trap/assets/s03_main.png
script/ep915-zm-photo-cleanup-trap/assets/s04_main.png
script/ep915-zm-photo-cleanup-trap/assets/s05_main.png
script/ep915-zm-photo-cleanup-trap/assets/s06_main.png
script/ep915-zm-photo-cleanup-trap/assets/s07_main.png
script/ep915-zm-photo-cleanup-trap/assets/s08_main.png
script/ep915-zm-photo-cleanup-trap/assets/s09_main.png
script/ep915-zm-photo-cleanup-trap/assets/s10_main.png
```

Expected: all 20 files exist and are real generated images.

---

### Task 10: Create Meta and Image Result Audits

**Files:**
- Create: `script/ep914-rm-receipt-app-trap/meta.json`
- Create: `script/ep914-rm-receipt-app-trap/audits/image_result_audit.json`
- Create: `script/ep915-zm-photo-cleanup-trap/meta.json`
- Create: `script/ep915-zm-photo-cleanup-trap/audits/image_result_audit.json`

- [ ] **Step 1: Create RM meta.json**

Create `script/ep914-rm-receipt-app-trap/meta.json` with one `assets` entry per generated image:

```json
{
  "episode_id": "ep914-rm-receipt-app-trap",
  "title": "レシートアプリで節約した気になる罠",
  "layout_template": "Scene02",
  "assets": [
    {
      "file": "assets/s01_main.png",
      "source_site": "imagegen",
      "source_url": null,
      "scene_id": "s01",
      "slot": "main",
      "purpose": "月末赤字に気づく導入画像",
      "adoption_reason": "台本冒頭の驚きとレシート記録の誤解を同時に示す",
      "imagegen_model": "codex-imagegen",
      "image_direction": {
        "visual_type": "hook_poster",
        "composition_type": "smartphone_receipt_confusion"
      },
      "supports_dialogue": ["え、記録したのに赤字？", "そこが罠だぜ"],
      "supports_moment": "レシート記録で安心したのに月末に赤字へ気づく瞬間",
      "imagegen_prompt": "Generate exactly one 16:9 image for this scene only...",
      "license": "生成画像（プロジェクト内利用）",
      "credit_required": false,
      "fetched_at": "2026-04-26T00:00:00+09:00"
    }
  ]
}
```

Add s02-s10 entries with matching prompts from `visual_plan.md`.

- [ ] **Step 2: Create ZM meta.json**

Create `script/ep915-zm-photo-cleanup-trap/meta.json` using the same schema with `episode_id`, title, and s01-s10 visual plan metadata for the photo-cleanup episode.

Expected: both meta files contain 10 assets, all matching YAML asset paths.

- [ ] **Step 3: Inspect actual images**

Use Read tool on each PNG, or any available local image inspection route, to verify:

```text
- file exists
- image is not placeholder/fallback
- image is not a grid or sheet
- no readable Japanese text inside image
- no existing characters or look-alikes
- bottom 20% has no important element
- scene matches the corresponding script moment
```

Expected: each image can be judged PASS. If visual inspection is not available, mark that image `NOT_AVAILABLE` and set `human_review_required: true`.

- [ ] **Step 4: Create RM image result audit**

Create `script/ep914-rm-receipt-app-trap/audits/image_result_audit.json`:

```json
{
  "step": "image_result_audit",
  "verdict": "PASS",
  "reviewer": "claude-vision",
  "cross_review_status": "NOT_AVAILABLE",
  "human_review_required": true,
  "images": [
    {
      "scene_id": "s01",
      "slot": "main",
      "asset": "assets/s01_main.png",
      "script_match": 8,
      "dialogue_support": 8,
      "visibility": 8,
      "screen_appeal": 8,
      "low_generic_feel": 8,
      "scene_fit": 8,
      "verdict": "PASS",
      "regeneration_plan": ""
    }
  ]
}
```

Add s02-s10. If any image fails, regenerate that image with a structurally different prompt up to 3 total attempts, then re-audit.

- [ ] **Step 5: Create ZM image result audit**

Create `script/ep915-zm-photo-cleanup-trap/audits/image_result_audit.json` with the same schema and s01-s10 entries.

Expected: all generated images have audit entries.

---

### Task 11: Run Validation Commands

**Files:**
- Validate: both episode directories
- May create: `script/{episode_id}/audits/pre_render_gate.json`

- [ ] **Step 1: Validate prompt-pack evidence globally**

Run:

```bash
rtk npm run test:script-prompt-pack-evidence
```

Expected: PASS. If FAIL, fix only the reported evidence files.

- [ ] **Step 2: Validate RM prompt-pack evidence**

Run:

```bash
rtk node scripts/validate-script-prompt-pack-evidence.mjs ep914-rm-receipt-app-trap
```

Expected: PASS.

- [ ] **Step 3: Validate ZM prompt-pack evidence**

Run:

```bash
rtk node scripts/validate-script-prompt-pack-evidence.mjs ep915-zm-photo-cleanup-trap
```

Expected: PASS.

- [ ] **Step 4: Run RM dry pipeline check**

Run:

```bash
rtk python scripts/run_pipeline.py --episode script/ep914-rm-receipt-app-trap --dry-run
```

Expected: PASS or clear actionable failure. If the script does not exist in the repo, record `run_pipeline_status: NOT_AVAILABLE`.

- [ ] **Step 5: Run ZM dry pipeline check**

Run:

```bash
rtk python scripts/run_pipeline.py --episode script/ep915-zm-photo-cleanup-trap --dry-run
```

Expected: PASS or clear actionable failure. If the script does not exist in the repo, record `run_pipeline_status: NOT_AVAILABLE`.

- [ ] **Step 6: Run RM episode gate**

Run:

```bash
rtk npm run gate:episode -- ep914-rm-receipt-app-trap
```

Expected: PASS. If FAIL, fix only the specific failing episode files.

- [ ] **Step 7: Run ZM episode gate**

Run:

```bash
rtk npm run gate:episode -- ep915-zm-photo-cleanup-trap
```

Expected: PASS. If FAIL, fix only the specific failing episode files.

---

### Task 12: Final Review and Report

**Files:**
- Review: all created files under both episode directories
- Review: `docs/superpowers/specs/2026-04-26-two-episode-script-image-design.md`
- Review: `docs/superpowers/plans/2026-04-26-two-episode-script-image-generation.md`

- [ ] **Step 1: Check git status**

Run:

```bash
rtk git status
```

Expected: new episode files and docs are listed. Existing unrelated modified/deleted files must not be reverted.

- [ ] **Step 2: Check YAML for forbidden field**

Run:

```bash
rtk grep "scene_template" script/ep914-rm-receipt-app-trap script/ep915-zm-photo-cleanup-trap
```

Expected: no matches.

- [ ] **Step 3: Check image asset references**

Run:

```bash
rtk grep "assets/s" script/ep914-rm-receipt-app-trap/script.yaml script/ep915-zm-photo-cleanup-trap/script.yaml
```

Expected: each scene references relative `assets/sNN_main.png` paths.

- [ ] **Step 4: Summarize completion state**

Report in this shape:

```text
完了:
- 作成/更新したファイル:
- 使用したテンプレート: Scene02
- 使用した Script Prompt Pack:
- 生成した episode_id:
- gate結果:
- render結果: 未実行（依頼範囲外） or result
- audit結果:
- 出力MP4: なし（依頼範囲外） or path
- 残課題:
```

Expected: if any Codex image generation, image inspection, cross-review, or gate is unavailable, explicitly include `NOT_AVAILABLE` and `human_review_required: true`. Do not call the video complete unless render and video audit were actually run and passed.
