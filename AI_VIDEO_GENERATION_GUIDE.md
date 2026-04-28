# AI Video Generation Guide

## 最初に読むファイル

1. `docs/pipeline_contract.md`
2. `docs/agent_fast_path.md`（通常生成の高速入口）
3. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
4. RMなら `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`、ZMなら `_reference/script_prompt_pack/local_canonical/zundamon_master.md`
5. 選択テンプレートの `templates/scene-XX_*.md`
6. 台本生成時: `_reference/script_prompt_pack/01_input_normalize_prompt.md` 〜 `11_final_episode_audit.md` のうち必要工程のファイル
7. 画像生成時: `_reference/script_prompt_pack/08_image_prompt_prompt.md`

キャラペアが未確定なら、`01_input_normalize_prompt.md` で `character_pair` を確定してから対応するローカル正本を1つだけ読む。RM/ZM両方のローカル正本を同時に読まない。

動画生成パイプラインの成果物名、順序、停止条件、完了条件は `docs/pipeline_contract.md` を単一正本にする。

旧 `prompts/01-10` と `_reference/script_prompt_pack/legacy/` は退避資料。新規生成・監査では参照しない。

台本生成時の探索除外は `docs/pipeline_contract.md` の「台本生成時の探索除外」に従う。
`.claude/` は丸ごと禁止しないが、`.claude/worktrees/**` などの複製repo・生成物・依存関係は初動探索で読まない。
`notebookLM/**`、`out/**`、`.remotion-public/**`、`script/**/assets/**`、`script/**/audio/**`、`script/**/bgm/**`、`scripts/oneoff/**` も通常生成の初動では読まない。

## 現行対象外の文書

次は過去作業の記録またはv1退避資料であり、新規生成・監査・修正の正準ルールとして使わない。

- `legacy/`
- `legacy/docs_archive/`（過去の計画・実行ログ。新規実装計画として流用しない。特に解像度、episode id、テンプレート、成果物パスの指定を現行仕様として採用しない）
- `_reference/script_prompt_pack/legacy/`
- v1由来の旧ルート文書名:
  - `00_START_HERE.md`
  - `10_video-pipeline.md`
  - `06_scene-layout-guide.md`
  - `02_演出編集プロンプト.md`
  - `workflows/script_to_video_workflow.md`

これらと現行文書が矛盾する場合は、必ず `docs/pipeline_contract.md` を優先する。
解像度についても同じで、ユーザーが明示しない限り `docs/pipeline_contract.md` の FullHD `1920x1080` を使う。過去ログや既存 episode の `1280x720` は既定値として採用しない。

## 動画生成の流れ

詳細と停止条件は `docs/pipeline_contract.md` を正本にする。

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml（meta.layout_template / bgm 含む）
-> visual_plan.md（任意の補助メモ）
-> imagegen_prompt 生成（script.yaml 内 visual_asset_plan）
-> 画像生成（codex-imagegen）→ assets/sNN_main.png
-> BGM 選定（select:bgm）→ bgm/*.mp3
-> 音声合成（voicevox / aquestalk）→ audio/*.wav
-> gate（pre-render-gate）
-> render（render:episode）
-> video audit（audit:video）
```

## ステップ別実行コマンド

| Step | 成果物 | 実行コマンド | ブロッキング |
|---|---|---|---|
| 1. planning | `script/{ep}/planning.md` | LLMで生成（手動）| - |
| 2. draft | `script/{ep}/script_draft.md` | LLM（04 / 05_draft_prompt）| - |
| 3. script_final | `script/{ep}/script_final.md` | LLM（draftの確定版）| - |
| 4. Codex review | `script/{ep}/audits/script_final_review.md` | Codex で `script_final.md` をレビュー | レビュー完了が次工程の前提 |
| 5. YAML 変換 | `script/{ep}/script.yaml` | LLM（10_yaml_prompt）| - |
| 6. image prompt 生成 | `script.yaml` の `visual_asset_plan[].imagegen_prompt` | LLM（08_image_prompt_prompt）| - |
| 7. image prompt 監査（任意）| `script/{ep}/audits/image_prompt_audit.json` | `npm run audit:image-prompts -- <ep>` | NO（非ブロッキング）|
| 8. BGM 選定 | `script/{ep}/script.yaml` の `bgm:` ブロック | `npm run select:bgm -- <ep>` | YES（audit:video が要求）|
| 9. 画像生成 | `script/{ep}/assets/sNN_main.png` | Codex CLI（codex-imagegen skill）| YES（render に必要）|
| 10. pre-render gate | `script/{ep}/audits/pre_render_gate.json` | `npm run gate:episode -- <ep>` | YES（構造・ファイル・フォーマットのみ） |
| 11. build episode | `script/{ep}/script.render.json`、音声 wav、`public/episodes/{ep}/` | `node scripts/build-episode.mjs <ep>` | YES |
| 12. render | `out/videos/{ep}.mp4` | `npm run render:episode -- <ep> out/videos/{ep}.mp4` | YES |
| 13. video audit | （CLI レポート）| `node scripts/audit-video.mjs <ep>` | YES（完成条件）|

## 補助コマンド

| 用途 | コマンド |
|---|---|
| prompt pack ルートの静的検査（gate に内包）| `node scripts/validate-script-generation-route.mjs` |
| prompt pack 証跡の存在チェック（gate に内包）| `node scripts/validate-script-prompt-pack-evidence.mjs <ep>` |
| episode YAML スキーマ単体検証（gate に内包）| `node scripts/validate-episode-script.mjs <ep>` |
| 最新 `image_prompts.json` の文字化け・旧文言チェック | `npm run audit:latest-image-prompts -- --limit=5` |
| 画像生成対象sceneの非破壊確認 | `npm run imagegen:episode -- <ep> --dry-run` |
| 失敗sceneだけ画像生成を再実行 | `npm run imagegen:episode -- <ep> --retry-failed` |
| 単体テンプレ静止画 | `npm run render:01-rm` 〜 `render:21-zm` |
| テンプレ確認グリッド | `npm run render:test-stills` |
| Remotion Studio | `npm run studio` |

## 解像度とレイアウト

### base layout（内部座標系）
- 全テンプレート（`templates/scene-XX_*.md`、`src/compositions/Scene*.tsx`）は **1920×1080 座標** でレイアウトを記述する。
- これは将来 4K 出力にも耐える共通基盤として固定。
- `scripts/build-episode.mjs` が `script.render.json.base_layout_width: 1920, base_layout_height: 1080` を埋め込む。

### delivery resolution（出力解像度）
- `script.yaml` の `meta.width × meta.height` で指定。
- **デフォルトは FullHD（1920×1080）**。
- ユーザーから明示的な指定があればその解像度を優先（HD 1280×720 / 4K 3840×2160 等）。
- `src/components/SceneRenderer.tsx` が `scale = meta.width / 1920` でレイアウトを縮小/拡大して描画。

### 座標を書く時のルール
- テンプレート md / Scene*.tsx の LAYOUT 定数は **1920×1080 を前提に書く**。
- 出力解像度に応じて自動でスケールされるので、HD 用に座標を別途調整する必要はない。

### audit-video.mjs の挙動
- `meta.width × meta.height` を delivery profile として ffprobe 結果と照合。
- レンダー出力が `meta.width × meta.height` になっていなければ FAIL。

## 台本生成の流れ

最初に表示都合で短く切らない。Draftでは自然会話、文脈、失敗談、具体例、ボケ、ツッコミ、次への引きを優先する。

`script_final.md` のCodexレビューが終わるまで、YAML化、画像生成、音声生成、レンダーへ進まない。

ユーザーが手書き台本を渡す場合は `hybrid_user_script` モードで扱う。
原文は `source_manual_script.md` に保存し、AIが `planning.md` / `script_draft.md` / `script_final.md` へ整える。
`audits/manual_intake.md` に `mode: hybrid_user_script`、`source_script: source_manual_script.md`、`image_source: user_generated`、`rights_confirmed: true` を記録する。
CodexでもClaude Codeでも、この成果物名と停止条件は同じ。

## 台本レビューの流れ

`script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` は生成しない。
Codexレビューは `script_final.md` だけを対象にし、結果は `audits/script_final_review.md` の1ファイルに残す。
レビューでは、魔理沙/めたんの連続解説を機械的に落とさない。根拠説明、手順説明、注意点整理、比較説明として最大4セリフ以内で、具体例・数字・比較・手順・失敗例のうち2つ以上があり、前後に霊夢/ずんだもんの誤解や反応がある場合は許可する。条件なしの抽象独演は落とす。

## YAML変換の流れ

`script_final.md` から `script.yaml` へ変換する。

- 意味を壊さない
- キャラ口調を変えない
- 情報順序を変えない
- `script_final.md` の発話単位を維持する
- 表示調整はRemotionの字幕描画側で行い、YAML変換で機械分割しない
- `meta.layout_template` を使う（`Scene01`〜`Scene21`）
- `scenes[].scene_template` / `meta.scene_template` は使わない
- `bgm:` ブロックを必須で記載
- `dialogue[].text` 内の `**強調語**` は字幕内の数字・中核キーワード強調として使える。`**` 自体は表示せず、Remotion側で色変え・サイズ強調する
- `dialogue[].emphasis` はSE・間・演出発火の契約なので、`**` 強調だけで代替しない

## 画像/素材設計の流れ

画像プロンプトは `script_final.md` の対象シーン全文を主入力にして作る。

会話は別で字幕表示するため、画像はコンテンツ部分に挿入する16:9素材として指定する。
作風はLLMが `script_final.md` 全体から判断して追記する。

ユーザーが外部画像生成ツールで画像を作る場合、AIは `image_prompt_v2.md` に scene ごとのプロンプトと保存先を出す。
ユーザーは `script/{episode_id}/assets/sNN_main.png` に指定名で保存する。
`meta.json` には `source_type: "user_generated"`、`generation_tool`、`rights_confirmed: true`、`license`、`imagegen_prompt` を記録する。

## main / sub 枠の方針

- **main**: `kind: image` のみ（画像専用）。説明テキスト・キャプションは入れない。
- **sub**: sub枠ありテンプレートでは `kind: text` / `kind: bullets` のどちらかを全シーンで必須にする。
  - 対象テンプレート: `Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14`
  - sub にテキスト・箇条書きを入れる用途: 詳しい補足 / 小見出し / 4〜6項目チェック / NG/OK 比較 / 注意点 / 数字補足 / 手順現在地 / 次の行動 / ボケ補助。情報量があるシーンは6項目推奨で、3項目だけにするのは締め・要約・最終行動などに限定する
  - 新規動画で `sub.kind: image` は使わない
  - sub 枠なしテンプレ（Scene01 / Scene04-09 / Scene11-12 / Scene15-21）では `sub: null`

## Remotion描画との責任分離

画像内の日本語テキストは許可する。
対象シーンタイトルは、画像内の大きく目立つ見出しとして必ず入れる。例: `s01: 月580円が年6,960円に化ける` の場合、画像内に入れる見出しは `月580円が年6,960円に化ける` にし、`s01` は入れない。
ただし会話全文を画像内に並べる指示にはしない。

字幕として読ませる会話だけをRemotion側で出す。
sub 枠のテキスト/箇条書きはRemotion側で描画する。
`main.caption` は使わない。`remotion_card_plan.md` は新規生成しない。

## 画像監査の流れ

画像プロンプト監査と生成後画像監査は任意確認にする。
`pre-render-gate` や `build-episode` の停止条件にしない。
exit code は常に 0、issues は report に残るが、レンダー進行を止めない。

## レンダー前チェック

- `script.yaml` が存在する
- `script_final.md` がCodexレビュー済み（`audits/script_final_review.md` あり）
- `meta.layout_template` が `Scene01`〜`Scene21`
- `scenes[].scene_template` / `meta.scene_template` がない
- `bgm.file` が指定されている
- gate が PASS

## 完成条件

次がすべて満たされた時のみ「完成」と報告できる:

- `script/{ep}/script_final.md` がCodexレビュー済み
- `npm run gate:episode -- <ep>` が PASS
- `out/videos/{ep}.mp4` が存在
- `node scripts/audit-video.mjs <ep>` が PASS
- 画像系 audit（image_prompts / generated_images）は **任意**、未実行でも完成ブロッカーにしない

## 絶対禁止事項

- Draft段階から表示都合で短く切る
- `script.yaml` を直接生成して創作完了扱いにする
- 会話全文を画像内テキストとして並べる指示にする
- main 枠の説明文・箇条書き・画像キャプションをRemotionで描画する
- `remotion_card_plan.md` を新規生成する
- `script_draft.md` の監査JSONを必須化する
- `audit_script_draft.json` / `script_audit.json` / `script_generation_audit.json` を生成する
- 3回FAILしたシーンを無限に再生成する
- ローカル仮画像（Pillow / SVG / プレースホルダー）を「画像生成完了」と扱う

## よくある失敗と対策

| 失敗 | 対策 |
|---|---|
| 会話が短文羅列になる | Draftではセリフ長を制限せず、1シーン6〜12発話で文脈を積む |
| 聞き手が質問だけになる | 聞き手にも経験談、反論、小ボケ、納得を持たせる |
| 解説役が訂正だけになる | 解説役にも迷い、例え、失敗回避、軽いツッコミを持たせる |
| 画像がテーマからズレる | script_finalの対象シーン全文と台本全体から作風を再指定する |
| 画像内文字が崩れる | 会話全文を画像内に並べず、字幕はRemotion側に任せる |
| sub 枠を活かせない | テキスト/箇条書きで「4〜6項目チェック / NG-OK / 注意点 / 数字補足」を入れる。情報量があるシーンは6項目推奨 |
| BGM 欠落で audit:video FAIL | `npm run select:bgm -- <ep>` を実行して `bgm:` ブロックを埋める |
