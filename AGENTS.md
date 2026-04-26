# AGENTS.md

このリポジトリで作業するAIエージェント向けの運用ルール。
Codex / Claude Code / その他エージェントは、`AI_VIDEO_GENERATION_GUIDE.md` と `docs/architecture_v2.md` を入口にして作業する。

旧版は `legacy/AGENTS.md.v1` に退避済み。矛盾する場合は、より安全で検証が強い v2 ルールを優先する。

## Mission

ユーザーのテーマから、テンプレート認識付きの高品質なゆっくり解説 / ずんだもん解説動画を生成する。

最終成果物は原則として次。

```text
script/{episode_id}/planning.md
script/{episode_id}/script_draft.md
script/{episode_id}/script_final.md
script/{episode_id}/script.yaml
script/{episode_id}/visual_plan.md
script/{episode_id}/image_prompt_v2.md
script/{episode_id}/assets/
script/{episode_id}/meta.json
script/{episode_id}/audits/
out/videos/{episode_id}.mp4
```

## Required Read Order

作業開始時:

```text
AI_VIDEO_GENERATION_GUIDE.md
docs/architecture_v2.md
CLAUDE.md
AGENTS.md
prompts/00_core_principles.md
```

台本生成時:

```text
prompts/01_planning_prompt.md
prompts/02_yukkuri_script_draft_prompt.md または prompts/03_zundamon_script_draft_prompt.md
prompts/06_yaml_conversion_prompt.md
```

画像/素材設計時:

```text
prompts/07_visual_plan_prompt.md
prompts/08_image_generation_v2.md
prompts/09_visual_audit_prompt.md
```

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

## Template Rule

1本の動画につきテンプレートは1つだけ使う。

正準:

```yaml
meta:
  layout_template: "Scene02"
```

禁止:

```yaml
meta:
  scene_template: "Scene02"
scenes:
  - scene_template: "Scene03"
```

`scenes[]` は時間ブロックであり、テンプレート切替単位ではない。

## Main Content Image Rule

メインコンテンツ画像は、`script_final.md` の対象シーン全文を主入力にした直投げ型 `imagegen_prompt` で作る。

- 会話内容は別で字幕表示する
- 画像はコンテンツ部分に挿入する16:9素材として作る
- 作風はLLMが `script_final.md` 全体から判断して追記する
- 日本語テキストは入れてよい
- ただし会話全文を画像内に並べる指示にはしない

`visual_asset_plan[].imagegen_prompt` を正本にする。
`image_direction`、`visual_type`、`supports_dialogue`、`supports_moment` は必須ではない。

## Main Content Render Rule

本文コンテンツ枠は画像のみで構成する。
会話字幕はRemotion側で表示してよいが、`main` / `sub` の説明テキスト、箇条書き、画像キャプション、Remotionカードは新規生成しない。

- `main.kind` は原則 `image`
- `sub` は `null` または `image`
- `main.caption` / `sub.caption` は使わない
- `remotion_card_plan.md` は生成しない

## Image Generation Completion Rule

ユーザーが「画像を生成して」と依頼した場合、ローカルで作った仮PNG、SVG、図解、プレースホルダー、Pillow/Canvas/HTML等の自作画像を、image gen 済みの成果物として扱ってはいけない。

正式な画像生成として完了扱いできるのは、実際に image gen 機能または明示された画像生成APIで生成し、出力ファイルを `assets/` に保存した場合だけ。

image gen 機能が使えない、失敗した、または未実行の場合は、次のように報告する。

- `imagegen: NOT_AVAILABLE` または `imagegen: FAIL`
- ローカル仮画像を作った場合は `placeholder: true`
- `human_review_required: true`
- 「画像生成完了」「正式画像生成済み」「完成」と言わない

`script.yaml`、gate、画像プロンプト監査、ローカル仮画像の存在は、image gen 実行済みの証拠にならない。

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

## No Fake Completion

次の場合は完成扱い禁止。

- `script_final.md` がない
- `script_final.md` のCodexレビューが未完了
- gate がFAIL
- MP4がない
- video audit が未実行またはFAIL
- 失敗理由をごまかしている

## Final Report Format

```text
完了:
- episode_id:
- 使用テンプレート:
- 変更ファイル:
- 追加ファイル:
- バックアップ:
- script final review:
- image audit: 任意
- gate:
- render:
- video audit:
- NOT_AVAILABLE:
- human_review_required:
- 残課題:
```
