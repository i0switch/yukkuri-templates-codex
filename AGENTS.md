# AGENTS.md

## Purpose

このプロジェクトで Codex が従う運用指示書。
目的は、ゆっくり解説 / ずんだもん解説の台本生成依頼を受けたときに、テンプレートの画面構造を読んだうえで、台本生成、素材生成、画像挿入ポイント付与、演出加工、動画生成まで一貫して進めること。

出力は日本語で統一する。

## First Read Order

作業開始時は、依頼内容に応じて次を読む。

1. `00_START_HERE.md`
2. `10_video-pipeline.md`
3. `06_scene-layout-guide.md`
4. `02_演出編集プロンプト.md`
5. `workflows/script_to_video_workflow.md`
6. `_reference/script_prompt_pack/README.md`

台本生成依頼の場合は、さらに次を読む。

1. 選択された `templates/scene-XX_*.md`
2. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
3. `_reference/script_prompt_pack/01_plan_prompt.md`
4. `_reference/script_prompt_pack/02_draft_prompt.md`
5. `_reference/script_prompt_pack/03_audit_prompt.md`
6. 必要に応じて `_reference/script_prompt_pack/04_rewrite_prompt.md`
7. YAML変換時は `_reference/script_prompt_pack/05_yaml_prompt.md`

## Script Request Trigger

ユーザーから台本生成、動画台本、ゆっくり台本、ずんだもん台本、解説動画作成の依頼が来たら、まず不足情報を確認する。

必須確認項目:

- 作りたいテーマ
- ざっくり入れたい内容
- 想定尺
- 使用テンプレート（1動画につき1つだけ）
- キャラペア: `RM` 霊夢・魔理沙 / `ZM` ずんだもん・めたん

テンプレート未指定の場合は、先にテンプレート選択を求める。
テンプレート名、scene番号、既存ファイル名のどれで指定されてもよい。

## Template-Aware Script Rules

台本生成前に、選択テンプレートと `06_scene-layout-guide.md` を読み、使える表示枠を確定する。

必ず認識する項目:

- メインコンテンツエリア
- サブコンテンツエリアの有無
- 字幕エリアの有無と狭さ
- タイトルエリアの有無
- キャラ配置
- 背景装飾を避けるべき領域

台本には、動画全体のテンプレート情報と、各シーンまたは各素材ポイントの枠利用情報を含める。

- `meta.scene_template`（動画全体で1つだけ）
- `main_content`
- `sub_content` または `sub_contentなし`
- `subtitle_area`
- `title_area`
- `image_insert_point`
- `asset_path`

`asset_path` と `image_insert_point` は台本メモ用の情報。動画レンダー用の `script.yaml` では、下の `script.yaml Render Schema 注意` に従って `main.asset` または `sub.asset` へ変換する。`scene_template` は scene 側ではなく `meta.scene_template` に1回だけ入れる。

動画内の全シーンは同じ `meta.scene_template` を使い、場面変化は main/sub/title/subtitle の中身、画像、字幕、演出で作る。
サブコンテンツエリアがあるテンプレートでは、補足、比較、チェックリスト、注意点をサブ枠に分離する。
サブコンテンツエリアがないテンプレートでは、無理にサブ素材を作らず、メイン素材と字幕で成立させる。
字幕枠が狭いテンプレートでは、1セリフを短くし、字幕は最大2行かつ25文字以内で収まるようにする。

## script.yaml Render Schema 注意

動画レンダーで実際に読まれる `meta.scene_template` は `Scene01`〜`Scene21` の形式に統一する。
`scenes[].scene_template` は使用禁止。
`scene-01`、`scene-XX`、`01` は使わない。

画像素材を表示する場合、台本メモ用の `asset_path` ではなく、レンダー用 YAML では次の形に変換する。

```yaml
main:
  kind: image
  asset: assets/s01_main.png
  caption: 任意

sub:
  kind: image
  asset: assets/s01_sub.png
  caption: 任意
```

`asset` は `script/{episode_id}/assets/...` ではなく `assets/...` の相対パスにする。
`scripts/build-episode.mjs` が `script/{episode_id}/assets/` を `public/episodes/{episode_id}/assets/` にコピーし、Remotion は `public_dir + asset` で読む。

サブ枠がないテンプレートでは `sub: null` にする。
サブ枠があるテンプレートでも、`bullets` は3項目以内、画像は小さく読める単純な図に限定する。

字幕は `subtitle_area` ではなく `dialogue[].text` から表示される。
1セリフは25文字以内を安全上限にし、長い説明は複数行ではなく複数セリフへ分割する。

タイトルは `title_text` に入れる。
タイトル枠がないテンプレートでは、無理に `title_text` で見せようとせず `main.text` 側に入れる。

## Visual Asset Density Rule

5分程度の動画で画像素材が5枚程度しかない構成は、動画として薄すぎるため原則禁止。
素材枚数は validator の最低合格ラインではなく、視聴維持に必要な画面変化量を基準に決める。

目安:

- 3分前後: 最低6枚、推奨7〜8枚
- 5分前後: 最低8枚、推奨10〜12枚
- 8分前後: 最低12枚、推奨14〜18枚

1分1枚ペースを「十分」と判断しない。
45秒以上同じ画像・同じ画面役割が続く場合は、追加の `main` 画像、比較図、チェックリスト、手順図、まとめ図を入れる。

NotebookLMで素材生成する場合も、NotebookLM側 validator の最低マーカー数だけで満足しない。
5分前後なら `FIG:1`、`INFO:1`〜`INFO:8` 以上、`SLIDE:1` を目安に、合計10枚前後の素材 marker を台本へ入れる。
NotebookLMのセクション数制約がある場合でも、1セクションに複数 marker を置いて素材密度を確保する。

素材密度を下げる判断をする場合は、必ず理由を明記する。
「まず通すため」「validator が通るため」「セクション数を減らすため」だけを理由に、画像枚数を減らしてはいけない。

## Codex Asset Rule

Codexで動画生成する場合、挿入画像は必ず image gen スキルで生成する。
Codexでは NotebookLM、フリー素材、licensed download、local card、fallback、placeholder を挿入画像の代替手段や合格ルートとして使わない。
image gen スキルが使えない場合は、動画生成完了ではなく「素材生成未完了」として停止する。

生成素材は `script/{episode_id}/assets/` に保存する前提で整理し、台本には画像の挿入ポイントと画像パスを必ず記載する。
`meta.json.assets[]` の挿入画像には `source_site` または `source_type` に image gen / image_gen / OpenAI image generation 系の出所を記録し、`imagegen_prompt`、`imagegen_model`、`scene_id`、`slot`、`purpose`、`adoption_reason` を必ず入れる。

素材生成時の原則:

- 実在人物、既存キャラクター、ブランドロゴの模写を避ける
- 図解内テキストは日本語を優先する
- 1枚に情報を詰め込みすぎない
- 命名は `s01_main.png`, `s01_sub.png`, `s02_main.png` のように scene と枠を対応させる
- `script/{episode_id}/assets/` に置き、YAML では `assets/s01_main.png` の相対パスで参照する
- サブ枠用素材は小さく読める単純な図にする
- 生成後にファイルの存在と用途を確認する

## NotebookLM Fallback Rule

NotebookLM は Claude Code 環境用の例外運用としてのみ使う。
Codexでは image gen を使わない NotebookLM 素材生成へ切り替えない。

参照する入口:

- `notebookLM/README.md`
- `notebookLM/CLAUDE.md`
- `notebookLM/AGENTS.md`
- `notebookLM/templates/asset-marker-spec.md`

実行順は `init_project.py`、`prepare_assets.py`、`fetch_assets.py`、`build_audit_report.py` を基本とする。
NotebookLMで生成した素材も、内容を確認してから台本に挿入ポイントと画像パスを記載する。
上位repo直下から実行する場合は、先に `cd notebookLM` してから `python scripts/...` を実行する。
採用素材は上位repoへ戻って `script/{episode_id}/assets/` にコピーし、`script.yaml` では `assets/s01_main.png` のような相対パスで参照する。
NotebookLM版では fallback 画像やローカル生成カードを合格扱いにしない。
全 marker が NotebookLM 純正 artifact として生成・取得され、監査が PASS した場合だけ完成とする。

## Execution Order

1. ユーザーから必須確認項目を受け取る
2. 選択テンプレートとレイアウト指針を読む
3. `01_plan_prompt.md` で企画・構成・枠利用を確定する
4. `02_draft_prompt.md` でテンプレートの表示枠に合わせて台本を生成する
5. `03_audit_prompt.md` で監査し、FAIL の場合は `04_rewrite_prompt.md` で弱い箇所だけ修正する
6. 素材生成方法を選ぶ
   - Codex: 必ず image gen
   - Claude Code: image gen が使えない環境では NotebookLM
7. 生成素材を確認し、画像挿入ポイントと画像パスを台本に反映する
8. `02_演出編集プロンプト.md` に従って演出加工する
9. `05_yaml_prompt.md` に従って `script/{episode_id}/script.yaml` を整える
10. `npm run gate:episode -- <episode_id>` で非破壊チェック、素材実体チェック、素材出所チェック、機械変換台詞チェックを通す
11. `npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4` で gate、音声・尺・render JSON、Composition 登録、動画生成まで一括実行する

補足:

- 直接 `npx remotion render` を実行しない。検証飛ばしを防ぐため、必ず `render:episode` を使う。
- `scripts/build-episode.mjs` も内部で `audit-episode-quality.mjs` を実行するため、gate に通らない episode は音声生成前に停止する。
- Codex動画生成では、image gen 以外の挿入画像、fallback / placeholder / local card / copied asset は本番画像として合格扱いにしない。

## Completion Criteria

完了扱いにするには、次を満たす。

- 台本が選択テンプレートの表示枠に対応している
- 字幕がテンプレートの字幕枠に収まる前提で短く分割されている
- サブコンテンツエリアの有無に応じて素材配置が変わっている
- 画像挿入ポイントと画像パスが台本に入っている
- `script.yaml` は `meta.scene_template: Scene01`〜`Scene21`、`main.asset` / `sub.asset`、25文字以内セリフの制約を満たしている
- 演出加工済み台本が `02_演出編集プロンプト.md` の方針に沿っている
- 動画生成まで依頼された場合は、出力ファイルまたは失敗理由を明示する







