# 販売用ZIP作成履歴

- 作成日時: 2026-04-28 20:44:39 +09:00
- ZIP名: yukkuri-templates-codex-sale-20260428-204432.zip
- ZIPパス: C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex\distribution\yukkuri-templates-codex-sale-20260428-204432.zip
- SHA256: C29667344CA0C2BFC69F24E9CF7892D6A614A4E83FF0D1FCCF27FDB52D890E36
- ZIPサイズ: 95.32 MB
- ステージング元サイズ: 98.85 MB
- ファイル数: 305
- 対象: 本体のみ

## 含めた主な範囲

- src/（ZIP内のみ src/generated/episode-compositions.ts は空登録へ調整）
- scripts/（scripts/oneoff/ は除外）
- templates/
- _reference/
- public/（public/episodes/ と characters/*_raw/ は除外）
- template-guide/
- tests/
- package.json / package-lock.json / tsconfig.json / remotion.config.ts
- AGENTS.md / AI_VIDEO_GENERATION_GUIDE.md / MAC_PIPELINE_SETUP.md
- docs/pipeline_contract.md / docs/agent_fast_path.md / docs/RUNBOOK_VIDEO_GENERATION.md / docs/manual_user_workflows.html / docs/all-scenes-*.png
- keifont.ttf

## 除外理由

詳細は excluded.txt を参照。

## Git状態

```text
## codex/llm-script-review-gate
 M AGENTS.md
 M _reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
 M _reference/script_prompt_pack/03_plan_prompt.md
 M _reference/script_prompt_pack/04_draft_prompt_yukkuri.md
 M _reference/script_prompt_pack/05_draft_prompt_zundamon.md
 M _reference/script_prompt_pack/07_rewrite_prompt.md
 M _reference/script_prompt_pack/10_yaml_prompt.md
 M _reference/script_prompt_pack/11_final_episode_audit.md
 M docs/pipeline_contract.md
 D lp_mockup.html
 M scripts/lib/episode-validator.mjs
 M scripts/pre-render-gate.mjs
 M scripts/test-duration-guards.mjs
 M scripts/test-expression-guards.mjs
 M scripts/test-imagegen-guards.mjs
 M scripts/test-motion-emphasis-guards.mjs
 M scripts/test-pipeline-hardening.mjs
 M scripts/test-script-prompt-pack-evidence.mjs
 M scripts/test-sub-content-guards.mjs
 M scripts/test-subtitle-segments.mjs
 M scripts/test-visual-emphasis-layer.mjs
 M scripts/test-voice-engine-guards.mjs
 M scripts/validate-script-final-review.mjs
 M scripts/validate-script-prompt-pack-evidence.mjs
 M src/components/AutoFitText.tsx
 M src/components/SceneRenderer.tsx
 M src/components/SubtitleBar.tsx
 M src/components/subtitleSegments.ts
 M src/lib/load-script.ts
?? MAC_PIPELINE_SETUP.md
?? distribution/
?? distribution_history/
?? docs/superpowers/plans/2026-04-28-beginner-distribution-guide.md
?? docs/superpowers/specs/2026-04-28-beginner-distribution-guide-design.md
?? src/components/subtitleLayout.ts
```
