# CLAUDE.md

このリポジトリは、ゆっくり解説 / ずんだもん解説の台本、素材設計、Remotion動画生成までを扱う。

作業時は次を正準入口にする。

1. `docs/pipeline_contract.md`（成果物名、順序、停止条件、完了条件の単一正本）
2. `docs/agent_fast_path.md`（通常生成の高速入口）
3. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`（台本生成ルール）
4. RMなら `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`、ZMなら `_reference/script_prompt_pack/local_canonical/zundamon_master.md`
5. 選択テンプレートの `templates/scene-XX_*.md`
6. 工程に必要な `_reference/script_prompt_pack/*.md`（01〜11）

キャラペアが未確定なら、`01_input_normalize_prompt.md` で `character_pair` を確定してから対応するローカル正本を1つだけ読む。`AGENTS.md`、`AI_VIDEO_GENERATION_GUIDE.md`、`legacy/docs_archive/**`、`prompts/00_core_principles.md` は通常生成の必読入力にしない。

旧 `prompts/01-10` と `_reference/script_prompt_pack/legacy/` は退避資料。新規生成・監査では `_reference/script_prompt_pack/` の非 legacy ファイルを使う。
旧版 docs と過去ログの詳細は `legacy/CLAUDE.md.v1` / `legacy/AGENTS.md.v1` / `legacy/v1_root_docs/` / `legacy/docs_archive/` に退避済み。矛盾する場合は `docs/pipeline_contract.md` を優先する。

台本生成時の探索除外は `docs/pipeline_contract.md` の「台本生成時の探索除外」に従う。
`.claude/` は丸ごと禁止しないが、`.claude/worktrees/**` などの複製repo・生成物・依存関係は初動探索で読まない。
`notebookLM/**`、`out/**`、`.remotion-public/**`、`script/**/assets/**`、`script/**/audio/**`、`script/**/bgm/**`、`scripts/oneoff/**` も通常生成の初動では読まない。

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
   - 表示都合で短く分割しない。長い解説は自然な発話単位で保持し、字幕表示はBudouX折り返しとAutoFitTextに任せる
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
レビュー結果の先頭には `<!-- script_final_sha256: <sha256> -->` を書く。`script_final.md` を後続修正した場合はレビューを更新し、hashを一致させる。

## Duration Estimate Rule

5分動画は発話数だけで判定しない。音声合成前に次を実行し、TTSエンジン別の推定自然音声尺が `270〜330秒` に入るか確認する。

```powershell
npm run estimate:episode-duration -- <episode_id>
```

初期係数は RM/AquesTalk `5.2秒/発話`、ZM/VOICEVOX `3.8秒/発話`。尺が外れる場合は発話量で調整し、音声速度は変えない。
短すぎる場合は `07_rewrite_prompt.md` で不足分だけ `script_final.md` を台本補完し、再レビューしてから進む。
長すぎる場合は自然尺を優先してそのまま使い、短縮目的で台本を削らない。

## Hybrid User Script Rule

ユーザーが手書き台本を渡す場合は `hybrid_user_script` モードで進める。
Claude Codeで実行する場合も、Codexと同じ `script/{episode_id}/...` 成果物名、停止条件、完了条件を使う。

- 原文保存: `script/{episode_id}/source_manual_script.md`
- AI整形後: `planning.md` / `script_draft.md` / `script_final.md`
- レビュー: `audits/script_final_review.md`
- 手動受け入れ証跡: `audits/manual_intake.md`

`manual_intake.md` には `mode: hybrid_user_script`、`source_script: source_manual_script.md`、`image_source: user_generated`、`rights_confirmed: true` を記録する。
このモードでは prompt pack 証跡の代わりに `source_manual_script.md` と `manual_intake.md` を手動受け入れ証跡として扱ってよい。

## Main Content Image Rule

メインコンテンツ画像は、`script_final.md` の対象シーン全文を主入力にした直投げ型 `imagegen_prompt` で作る。

- 会話内容は別で字幕表示する
- 画像はコンテンツ部分に挿入する16:9素材として作る
- 作風はLLMが `script_final.md` 全体から判断して追記する
- 日本語テキストは入れてよい
- 対象シーンタイトルは画像内の大きく目立つ見出しとして必ず入れる。`s01` などの scene id は画像内に入れない
- ただし会話全文を画像内に並べる指示にはしない

ユーザーが画像を外部生成する場合、AI は `image_prompt_v2.md` に scene ごとのプロンプトと保存先を出す。
ユーザーは任意ツールで生成した実画像を `script/{episode_id}/assets/sNN_main.png` に保存する。
`meta.json` では `source_type: "user_generated"`、`generation_tool`、`rights_confirmed: true`、`license`、`imagegen_prompt` を必須にする。
placeholder、fallback、local card、copied、出所不明画像は受け入れない。

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
npm run estimate:episode-duration -- <episode_id>
npm run gate:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
npm run audit:video -- <episode_id>
```

## Completion Rule

「完成」と言ってよいのは、実ファイル、gate、レンダー結果、video audit が揃っている場合だけ。

画像プロンプト監査と生成後画像監査は任意であり、未実行でも完成ブロッカーにしない。
