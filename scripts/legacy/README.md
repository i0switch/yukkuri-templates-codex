# scripts/legacy

ここに置かれた script は **本番の台本生成・動画生成パイプラインから切り離された遺物**。
品質ガード `scripts/validate-script-generation-route.mjs` も、`scripts/legacy/` 以下は走査対象外として扱う。

## 含まれているもの

- `generate-single-template-episodes.mjs`
  - 21テンプレ動作確認用の24秒テスト動画 21 本を一気に生成するためのスクリプト。
  - `topics` 配列に各シーンのセリフをハードコードしている（`_reference/script_prompt_pack` を経由しない）。
  - 本番の解説動画台本には**使ってはいけない**。テンプレートの見た目確認 / Remotion 検証用に限定する。

## 本番ルートとの関係

本番の台本生成は次に従う：

1. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
2. `01_plan_prompt.md` → `02_draft_prompt.md` → `03_audit_prompt.md` → 必要なら `04_rewrite_prompt.md` → PASS 後 `05_yaml_prompt.md`
3. `node scripts/validate-script-generation-route.mjs <episode_id>` （プリゲート）
4. `node scripts/audit-script-quality.mjs <episode_id>` （品質監査）
5. `node scripts/build-episode.mjs <episode_id>` 以降の動画化フロー

`scripts/legacy/` 配下のスクリプトはこのフローに含めない。
新しい解説動画用の台本やシーンをハードコードしたくなったら、まず prompt pack をベースにすること。
