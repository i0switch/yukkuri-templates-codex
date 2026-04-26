# Repository Audit v2

## 調査対象（現状）

- `CLAUDE.md`
- `AGENTS.md`
- `AI_VIDEO_GENERATION_GUIDE.md`
- `docs/architecture_v2.md`
- `docs/final_checklist_v2.md`
- `prompts/`（v2 正本）
- `_reference/script_prompt_pack/`（参考、v2 整合済み）
- `_reference/image_prompt_pack/`（参考、v2 整合済み）
- `scripts/`（pipeline / gate / audit）
- `templates/`（Remotion `Scene01`〜`Scene21`）
- `script/ep914-rm-browser-tabs-focus-leak/`
- `script/ep915-zm-default-app-chaos/`
- `legacy/`（v1退避先）

## v2 移行で完了済み

- v1 由来ルートドキュメント (`10_video-pipeline.md`, `21_prompt_codex.md`, `02_演出編集プロンプト.md`, `06_scene-layout-guide.md`, `90_asset-license-memo.md`, `00_START_HERE.md`, `workflows/script_to_video_workflow.md`) を `legacy/v1_root_docs/` に退避
- 修正用プロンプト/ を `legacy/migration_prompts_v1_to_v2/` に退避
- `_reference/script_prompt_pack/` の互換 stub 4本 (`01_plan` / `02_draft` / `04_rewrite` / `05_yaml`) を `legacy/` に退避
- `_reference/remotion_image_recreation_guide.md` を `legacy/_reference/` に退避
- `_reference/image_prompt_pack/01_IMAGE_DIRECTION_PROMPT.md` を廃止リマインダ化
- `prompts/00_core_principles.md` のフロー図を 4段階に整理
- `prompts/07_visual_plan_prompt.md` を直投げ型補助メモに書き直し
- 抽象タグ (`hook_type` / `visual_type` / `composition_type` / `boke_or_reaction` / `myth_vs_fact` / `supports_*`) を draft メタと imagegen_prompt 本文から排除

## 残課題

- ep914 / ep915 の `script.md` から旧抽象タグ (`hook_type`, `boke_or_reaction`) を清掃
- `audits/script_prompt_pack_*.md` の自動生成バグ（同一文10〜16回反復）の修正
- 「証跡 (evidence)」と「監査 (audit)」の概念分離を CLAUDE.md / AGENTS.md / docs/architecture_v2.md に明文化
- 5分以上の正式尺で gate / render / video audit を回す

## 維持する既存仕様

- `meta.layout_template` を動画全体で1つだけ使う (`Scene01`〜`Scene21`)
- `scenes[].scene_template` と `meta.scene_template` を禁止
- `script.yaml` はレンダー入力として維持
- `assets/...` の相対パス
- `script/{episode_id}/audits/` に証跡を残す（ファイル名は scripts/validate-script-prompt-pack-evidence.mjs と互換）
- `python scripts/run_pipeline.py --episode script/<episode_id> --dry-run`
- `npm run gate:episode -- <episode_id>`
- `npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4`
- 画像素材の provenance を `meta.json` に残す
- fallback / placeholder / local card を完成素材扱いしない
- 既定解像度は HD (1280×720)
