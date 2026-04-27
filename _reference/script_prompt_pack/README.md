# 台本生成プロンプトパック v5

## 目的

テーマを渡すだけで、選択テンプレートに最適化された高品質なゆっくり解説 / ずんだもん解説の台本、画像生成プロンプト、`script.yaml`、監査証跡を安定して作る。

動画生成パイプラインの成果物名、順序、停止条件、完了条件は `docs/pipeline_contract.md` が単一正本。

台本品質の最重要ソースは、ローカル正本の次2ファイル。

- `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`
- `_reference/script_prompt_pack/local_canonical/zundamon_master.md`

このPrompt Packは、上記2ファイルのキャラ設計と掛け合い品質を、既存レンダーシステムの `meta.layout_template` / `visual_asset_plan` / `script/{episode_id}/audits/` 契約へ落とし込む。

## Canonical Flow

1. `00_MASTER_SCRIPT_RULES.md`
2. `01_input_normalize_prompt.md`
3. `02_template_analysis_prompt.md`
4. `03_plan_prompt.md`
5. `04_draft_prompt_yukkuri.md` または `05_draft_prompt_zundamon.md`
6. `07_rewrite_prompt.md`（script_finalレビュー後に必要な場合のみ）
7. `08_image_prompt_prompt.md`
8. `09_image_prompt_audit.md`（任意確認。ゲートではない）
9. `10_yaml_prompt.md`
10. `11_final_episode_audit.md`

## Compatibility Entrypoints (legacy)

旧番号系の互換 stub は番号衝突を避けるため `legacy/` に退避済み。新フローでは使用しない。詳細は `legacy/README.md`。

## Required Evidence

`script/{episode_id}/audits/` 配下に prompt pack 実行証跡として次を保存する。これらは「prompt pack を実行した記録」であり、Codexレビュー監査ではない（Codexレビュー監査は `audits/script_final_review.md` の1ファイルのみ）。

- `script_prompt_pack_input_normalize.md`
- `script_prompt_pack_template_analysis.md`
- `script_prompt_pack_plan.md`
- `script_prompt_pack_draft.md`
- `script_prompt_pack_image_prompts.md`
- `script_prompt_pack_yaml.md`
- `script_prompt_pack_final_episode_audit.md`

`script_final.md` のCodexレビュー後に修正があれば `script_prompt_pack_rewrite.md` も保存する。

`script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` は生成しない。

## Image Generation Policy

画像生成プロンプトは `script_final.md` の対象シーン全文をそのまま主入力にして作る。会話は別で字幕表示するため、画像はコンテンツ部分に挿入する16:9素材として指定する。

作風はLLMが `script_final.md` 全体を読んで判断する。`visual_type`、`supports_dialogue`、`supports_moment`、`hook_type`、`myth_vs_fact`、`boke_or_reaction` は v2 では使用しない。`imagegen_prompt` 本文にも混ぜない。
`visual_asset_plan[].image_role` と `visual_asset_plan[].composition_type` は vNext の公開契約として使う。プロンプト本文には英語キーではなく、日本語の「画像の役割」「構図タイプ」として自然文で入れる。

## Render Schema

- `meta.layout_template`: `Scene01`〜`Scene21`
- `scenes[].scene_template`: 使用禁止
- `meta.scene_template`: 新規使用禁止
- 画像参照: `main.asset`
- asset path: `assets/s01_main.png`
- `main.kind` は `image`
- sub枠ありテンプレート（`Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14`）では、全シーンの `sub` を `kind: text` または `kind: bullets` にする
- `sub.kind: text` は詳しい補足、注意点、4〜6行の短い解説文に使う
- `sub.kind: bullets` は小見出し、4〜6項目チェック、NG/OK、手順現在地、次にやることに使う。情報量があるシーンは6項目推奨で、3項目だけにするのは締め・要約・最終行動などに限定する
- 新規動画で `sub.kind: image` は使わない
- `main.caption` / `main.text` / `main.items` / `sub.caption` は使わない
- 字幕: `dialogue[].text`
- `scenes[].motion_mode`: `normal` / `punch` / `compare` / `warning` / `checklist` / `reveal` / `recap`
- `dialogue[].emphasis`: `words` / `style` / `se` / `pause_after_ms`
- 1セリフ: `script_final.md` の自然な発話単位を維持
- 表示都合の機械分割は禁止
- sub枠なし: `sub: null`

## 正本との関係

このパックは `_reference/` 配下の参考資料です。正準ルールが矛盾する場合は次を優先する。

1. `docs/pipeline_contract.md`
2. `CLAUDE.md`
3. `AGENTS.md`
4. `AI_VIDEO_GENERATION_GUIDE.md`
5. `docs/architecture_v2.md`
6. `prompts/00_core_principles.md`
