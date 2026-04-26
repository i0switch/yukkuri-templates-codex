# CLAUDE.md

このリポジトリは、ゆっくり解説 / ずんだもん解説の台本、素材設計、Remotion動画生成までを扱う。

作業時は次を正準入口にする。

1. `AI_VIDEO_GENERATION_GUIDE.md`
2. `docs/architecture_v2.md`
3. `AGENTS.md`
4. `prompts/00_core_principles.md`（v2 思想サマリ）
5. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`（実行用プロンプト正本）
6. 必要な `_reference/script_prompt_pack/*.md`（00〜11）

旧 `prompts/01-10` は `legacy/prompts/` に退避済み。新規生成・監査では `_reference/script_prompt_pack/` を使う。
旧版 docs の詳細は `legacy/CLAUDE.md.v1` / `legacy/AGENTS.md.v1` 等に退避済み。矛盾する場合は v2 方針を優先する。

## Critical Script Quality Rule

台本生成時は、最初から表示都合の短文にしない。
`script.yaml` 変換時も発話を機械分割しない。

必ず次の段階を分ける。

1. `planning.md`
   - 視聴者、悩み、感情曲線、情報ゴール、シーン役割を設計する
2. `script_draft.md`
   - 自然な会話
   - 文脈、ボケ、ツッコミ、具体例を優先
   - セリフ長は制限しない
   - 実用上は1発話12〜40字程度で揺らす
   - 1シーン6〜12発話
3. `script_final.md`
   - Codexレビュー対象の自然会話の完成版
   - レビューはこのファイルだけを対象にする
   - 必要な修正はこの段階で反映する
4. `script.yaml`
   - レンダー用
   - `dialogue[].text` は `script_final.md` の自然な発話単位を維持する
   - draftの意味、キャラ口調、情報順序を壊さない

`script_final.md` のCodexレビューが終わるまで、YAML化、画像生成、音声生成、レンダーへ進んではいけない。

## Main Content Image Rule

メインコンテンツ画像は、`script_final.md` の対象シーン全文を主入力にした直投げ型 `imagegen_prompt` で作る。

- 会話内容は別で字幕表示する
- 画像はコンテンツ部分に挿入する16:9素材として作る
- 作風はLLMが `script_final.md` 全体から判断して追記する
- 日本語テキストは入れてよい
- ただし会話全文を画像内に並べる指示にはしない

## Image Audit Is Non-Blocking

画像プロンプト監査と生成後画像監査は任意確認にする。
`pre-render-gate` や `build-episode` の停止条件にしない。

必要な場合だけ以下を確認する。

- 台本sceneの内容と一致しているか
- テーマからズレていないか
- 画像内テキストに誤字、意味不明語がないか
- キャラや字幕と被らないか
- ゆっくり/ずんだもん動画のメイン画像として自然か

## Script Final Review

台本のCodexレビューは `script_final.md` だけを対象にする。
レビュー結果は `audits/script_final_review.md` の1ファイルにだけ書く。
`script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` は生成しない。

## Evidence vs Audit

`script/{episode_id}/audits/` 配下のファイルには2種類ある。混同しない。

- **監査 (audit)**: `audits/script_final_review.md` の1ファイルのみ。Codexレビューの結果。
- **証跡 (evidence)**: `audits/script_prompt_pack_*.md` 群。prompt pack の実行記録。`scripts/validate-script-prompt-pack-evidence.mjs` が期待するファイル名で残す。

`script_prompt_pack_draft.md` などは「draft段階の監査」ではなく「prompt pack 実行証跡」として扱う。

## Regeneration Limit

1シーンあたり再生成は最大3回。
3回連続FAILした場合は作業停止し、`regeneration_plan` と `human_review_required: true` を出力する。

## Render Schema

既存レンダー契約は維持する。

- `meta.layout_template`: `Scene01`〜`Scene21`
- `scenes[].scene_template`: 使用禁止
- `meta.scene_template`: 新規使用禁止
- asset path: `assets/s01_main.png`
- `script.yaml` はレンダー入力であり、創作Draftではない
- sub枠なしテンプレートでは `sub: null`

## Required Commands

```powershell
python scripts/run_pipeline.py --episode script/<episode_id> --dry-run
npm run gate:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
```

## Completion Rule

「完成」と言ってよいのは、実ファイル、gate、レンダー結果、video audit が揃っている場合だけ。

画像プロンプト監査と生成後画像監査は任意であり、未実行でも完成ブロッカーにしない。
