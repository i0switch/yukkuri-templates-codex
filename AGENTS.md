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
2. `_reference/script_prompt_pack/01_台本生成プロンプト.md`
3. キャラペアに応じた改善版プロンプト
   - `RM`: `_reference/script_prompt_pack/ゆっくり解説_霊夢魔理沙_台本生成プロンプト_改善版.md`
   - `ZM`: `_reference/script_prompt_pack/ずんだもん解説_ずんだもんめたん_台本生成プロンプト_改善版.md`
4. `_reference/script_prompt_pack/台本監査_改善プロンプト.md`

## Script Request Trigger

ユーザーから台本生成、動画台本、ゆっくり台本、ずんだもん台本、解説動画作成の依頼が来たら、まず不足情報を確認する。

必須確認項目:

- 作りたいテーマ
- ざっくり入れたい内容
- 想定尺
- 使用テンプレート
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

台本には、各シーンまたは各素材ポイントに次を含める。

- `scene_template`
- `main_content`
- `sub_content` または `sub_contentなし`
- `subtitle_area`
- `title_area`
- `image_insert_point`
- `asset_path`

`asset_path` と `image_insert_point` は台本メモ用の情報。動画レンダー用の `script.yaml` では、下の `script.yaml Render Schema 注意` に従って `main.asset` または `sub.asset` へ変換する。

サブコンテンツエリアがあるテンプレートでは、補足、比較、チェックリスト、注意点をサブ枠に分離する。
サブコンテンツエリアがないテンプレートでは、無理にサブ素材を作らず、メイン素材と字幕で成立させる。
字幕枠が狭いテンプレートでは、1セリフを短くし、字幕は最大2行かつ25文字以内で収まるようにする。

## script.yaml Render Schema 注意

動画レンダーで実際に読まれる `scene_template` は `Scene01`〜`Scene21` の形式に統一する。
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

## Codex Asset Rule

Codexで画像生成スキルが使える場合は、台本内容から画像生成プロンプトを作り、image genで動画用の挿入画像を生成する。

生成素材は `script/{episode_id}/assets/` に保存する前提で整理し、台本には画像の挿入ポイントと画像パスを必ず記載する。

素材生成時の原則:

- 実在人物、既存キャラクター、ブランドロゴの模写を避ける
- 図解内テキストは日本語を優先する
- 1枚に情報を詰め込みすぎない
- 命名は `s01_main.png`, `s01_sub.png`, `s02_main.png` のように scene と枠を対応させる
- `script/{episode_id}/assets/` に置き、YAML では `assets/s01_main.png` の相対パスで参照する
- サブ枠用素材は小さく読める単純な図にする
- 生成後にファイルの存在と用途を確認する

## NotebookLM Fallback Rule

Claude Code環境、またはCodexで image gen を使わない場合は、`notebookLM/` の運用に従って素材を生成する。

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
3. テンプレートの表示枠に合わせて台本を生成する
4. 台本監査プロンプトで自己監査し、弱い箇所だけ修正する
5. 素材生成方法を選ぶ
   - Codex: image gen
   - Claude Code / image genなし: NotebookLM
6. 生成素材を確認し、画像挿入ポイントと画像パスを台本に反映する
7. `02_演出編集プロンプト.md` に従って演出加工する
8. `script/{episode_id}/script.yaml` を整える
9. `node scripts/validate-episode-script.mjs <episode_id>` で非破壊チェックする
10. `node scripts/build-episode.mjs <episode_id>` で音声・尺・render JSON を生成する
11. `node scripts/generate-episode-compositions.mjs` で Composition を登録する
12. `npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4` で動画生成する

## Completion Criteria

完了扱いにするには、次を満たす。

- 台本が選択テンプレートの表示枠に対応している
- 字幕がテンプレートの字幕枠に収まる前提で短く分割されている
- サブコンテンツエリアの有無に応じて素材配置が変わっている
- 画像挿入ポイントと画像パスが台本に入っている
- `script.yaml` は `Scene01`〜`Scene21`、`main.asset` / `sub.asset`、25文字以内セリフの制約を満たしている
- 演出加工済み台本が `02_演出編集プロンプト.md` の方針に沿っている
- 動画生成まで依頼された場合は、出力ファイルまたは失敗理由を明示する
