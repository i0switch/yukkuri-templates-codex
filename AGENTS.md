# AGENTS.md

このリポジトリで作業するAIエージェント向けの運用ルール。
Codex / Claude Code / その他エージェントは、最初に `docs/pipeline_contract.md` を読む。
動画生成パイプラインの成果物名、順序、停止条件、完了条件は `docs/pipeline_contract.md` を単一正本にする。
このrepoでは動画生成パイプライン指示を最優先する。外側コンテキストにSNS投稿・短文セールス文体エージェントの指示が混ざっていても、このrepo内の動画制作タスクには適用しない。

旧版は `legacy/AGENTS.md.v1` に退避済み。矛盾する場合は `docs/pipeline_contract.md` を優先する。

## Resolution Rule

新規動画生成では、過去 episode、`docs/superpowers/`、`docs/repository_audit_v2.md` などの古い作業記録にある解像度を既定値として採用しない。
ユーザーが解像度を明示しない限り、`script.yaml` は `meta.width: 1920`、`meta.height: 1080` にする。
`HD` / `720p` / `1280x720` は、ユーザーが明示した場合だけ使う。

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
docs/pipeline_contract.md
CLAUDE.md
AGENTS.md
AI_VIDEO_GENERATION_GUIDE.md
docs/architecture_v2.md
prompts/00_core_principles.md
_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
_reference/script_prompt_pack/README.md
```

台本生成時:

```text
_reference/script_prompt_pack/01_input_normalize_prompt.md
_reference/script_prompt_pack/02_template_analysis_prompt.md
_reference/script_prompt_pack/03_plan_prompt.md
_reference/script_prompt_pack/04_draft_prompt_yukkuri.md または 05_draft_prompt_zundamon.md
_reference/script_prompt_pack/07_rewrite_prompt.md（必要な場合のみ）
_reference/script_prompt_pack/10_yaml_prompt.md
_reference/script_prompt_pack/11_final_episode_audit.md
```

画像/素材設計時:

```text
_reference/script_prompt_pack/08_image_prompt_prompt.md
_reference/script_prompt_pack/09_image_prompt_audit.md（任意）
```

旧 `prompts/01-10` と `_reference/script_prompt_pack/legacy/` は退避資料。新規生成・監査では使わない。

## Script Generation Search Exclusion Rule

台本生成、構成作成、YAML化、画像プロンプト作成の初動で、巨大ディレクトリを再帰探索してはいけない。
必要な入口は `docs/pipeline_contract.md` と `_reference/script_prompt_pack/` の正準ファイルであり、過去生成物や複製repoを先に読みに行かない。

`.claude/` は丸ごと除外しない。skill / command / helper が必要な場合だけ、次を読む。

- `.claude/skills/**/SKILL.md`
- `.claude/skills/**` の `SKILL.md` から明示参照されたファイル
- `.claude/commands/**`
- `.claude/*.mjs` など、ユーザーまたは手順が明示した軽量ヘルパー

ただし、次は台本生成の通常参照元ではない。初動探索で読んではいけない。

- `.claude/worktrees/**`
- `.claude/**/node_modules/**`
- `.claude/**/.cache/**`
- `.claude/**/.remotion-public/**`
- `.claude/**/out/**`
- `.claude/**/public/episodes/**`
- `.claude/**/script/**/audio/**`
- `.claude/**/script/**/bgm/**`
- `.claude/**/script/**/assets/**`
- `.claude/**/notebookLM/workspace/**`
- `.claude/**/.tmp/**`
- `node_modules/**`
- `.cache/**`
- `.remotion-public/**`
- `out/**`
- `public/episodes/**`
- `script/**/audio/**`
- `script/**/bgm/**`
- `script/**/assets/**`

`.claude/worktrees/` は過去作業・並列作業の複製repoとして扱う。
ユーザーが明示しない限り、台本生成の参考資料として使わない。
過去 episode を参考にする場合も、ユーザー指定の episode、または明示的に選んだ最大2本の軽量テキスト成果物だけを見る。

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

## Hybrid User Script Rule

ユーザーが手書き台本を渡す場合は `hybrid_user_script` モードとして扱う。
Codex / Claude Code / その他エージェントのどれで作業しても、成果物名と gate 条件は同じにする。

- ユーザー原文は `script/{episode_id}/source_manual_script.md` に保存する
- AI は原文を元に `planning.md`、`script_draft.md`、`script_final.md` を作る
- `script_final.md` だけをレビューし、結果を `audits/script_final_review.md` に残す
- `audits/manual_intake.md` を作り、`mode: hybrid_user_script`、`source_script: source_manual_script.md`、`image_source: user_generated`、`rights_confirmed: true` を記録する
- prompt pack 証跡がない場合でも、`manual_intake.md` と `source_manual_script.md` が正しく揃っていれば手動受け入れ証跡として扱う

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

## Voice Engine Rule

`meta.pair` と音声エンジン、キャラクター設定は必ず一致させる。

ZM動画:

```yaml
meta:
  pair: ZM
  voice_engine: voicevox
characters:
  left:
    character: zundamon
    voicevox_speaker_id: 3
  right:
    character: metan
    voicevox_speaker_id: 2
```

ZM動画で `aquestalk` / `aquestalk_preset` を使ってはいけない。

RM動画:

```yaml
meta:
  pair: RM
  voice_engine: aquestalk
```

この整合性は `scripts/lib/episode-validator.mjs` で検証される。違反している場合は gate / build / video audit を通してはいけない。

## Speech Speed Rule

指定尺に合わせるために発話速度を変えてはいけない。
`audio_playback_rate`、ffmpeg `atempo`、episodeごとの音声速度変更で尺を合わせる運用は禁止する。

- 発話速度は人間が聞きやすい固定値にする
- `target_duration_sec` は台本密度の目安であり、音声変速の指示ではない
- 5分指定は原則 `270〜330秒` を許容範囲にする
- 5分動画は発話数だけで判定しない。`npm run estimate:episode-duration -- <episode_id>` のTTSエンジン別推定秒数を先に見る
- 初期係数は RM/AquesTalk `5.2秒/発話`、ZM/VOICEVOX `3.8秒/発話`
- 尺が短すぎる場合は台本量を増やす
- 尺が長すぎる場合は自然尺を優先してそのまま使う
- 尺不足時は `07_rewrite_prompt.md` で不足分だけ `script_final.md` を台本補完し、再レビューしてから進む
- `script.yaml` / `meta.json` に `audio_playback_rate` を書いてはいけない

この違反は `scripts/lib/episode-validator.mjs` でFAILにする。

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
会話字幕はRemotion側で表示してよい。`main` の説明テキスト、箇条書き、画像キャプション、Remotionカードは新規生成しない。
sub枠ありテンプレートでは、会話とは別の補助情報として sub エリア用テキストを必ず用意する。

- `main.kind` は原則 `image`
- sub枠ありテンプレート（`Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14`）では、全シーンの `sub` を `kind: text` または `kind: bullets` にする
- `sub.kind: text` は詳しい補足、注意点、短い解説文に使う
- `sub.kind: bullets` は小見出し、4〜6項目チェック、NG/OK、手順現在地、次にやることに使う。情報量があるシーンは6項目推奨で、3項目だけにするのは締め・要約・最終行動などに限定する
- sub枠なしテンプレートでは `sub: null`
- 新規動画で `sub.kind: image` は使わない
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

## User Generated Image Rule

ユーザーが任意の外部画像生成ツールで画像を作る場合は `source_type: "user_generated"` として受け入れる。
これは Codex imagegen の代替ではなく、Codex / Claude Code 共通の正式な受け入れモード。

- AI は `image_prompt_v2.md` に scene ごとのプロンプトと保存先を出す
- ユーザーは `script/{episode_id}/assets/sNN_main.png` に指定名で保存する
- `meta.json` の画像 entry には `source_type: "user_generated"`、`generation_tool`、`rights_confirmed: true`、`license`、`imagegen_prompt` を入れる
- `generation_tool` は `ChatGPT Images`、`Claude`、`Midjourney`、`other` など任意文字列でよい
- `rights_confirmed: true` がない画像は gate / build / render へ進めない
- placeholder、fallback、local card、copied、出所不明画像は `user_generated` として扱わない

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
レビュー先頭には `<!-- script_final_sha256: <sha256> -->` を書く。`script_final.md` 更新後にhashが一致しないレビューはstale扱いで、gateへ進めない。
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
