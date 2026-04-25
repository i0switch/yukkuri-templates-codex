# CLAUDE.md

このプロジェクトで Claude Code が最初に読む運用指示書。
目的は、ゆっくり解説 / ずんだもん解説の台本生成依頼を、テンプレート認識付きで動画化までつなぐこと。

出力は日本語で統一する。

## Goal

ユーザーが台本生成を依頼したら、次を順番に実行する。

1. 必須情報を確認する
2. 使用テンプレートの画面構造を読む
3. テンプレートに合う台本を生成する
4. 素材生成のためのマーカーと挿入位置を作る
5. NotebookLMで素材生成する
6. 最終台本へ素材パスを反映する
7. `02_演出編集プロンプト.md` で演出加工する
8. 指定テンプレートで動画生成へ進める

## Required Reads

作業開始時は、依頼に応じて次を読む。

- `00_START_HERE.md`
- `10_video-pipeline.md`
- `06_scene-layout-guide.md`
- `02_演出編集プロンプト.md`
- `workflows/script_to_video_workflow.md`
- `_reference/script_prompt_pack/README.md`

台本生成時は、必ず次を追加で読む。

- 選択された `templates/scene-XX_*.md`
- `_reference/script_prompt_pack/01_台本生成プロンプト.md`
- `RM` の場合: `_reference/script_prompt_pack/ゆっくり解説_霊夢魔理沙_台本生成プロンプト_改善版.md`
- `ZM` の場合: `_reference/script_prompt_pack/ずんだもん解説_ずんだもんめたん_台本生成プロンプト_改善版.md`
- `_reference/script_prompt_pack/台本監査_改善プロンプト.md`

## Required Questions

台本生成依頼が来たら、次が不足していないか確認する。

- 作りたいテーマ
- ざっくり入れたい内容
- 想定尺
- 使用テンプレート
- キャラペア: `RM` 霊夢・魔理沙 / `ZM` ずんだもん・めたん

テンプレート未指定の場合は、先にテンプレート選択を求める。
テーマだけ渡された場合でも、テンプレートとキャラペアが未確定なら確認する。

## Template Awareness

台本生成前に、選択テンプレートから次を確定する。

- メインコンテンツエリア
- サブコンテンツエリアの有無
- 字幕エリアの有無と狭さ
- タイトルエリアの有無
- キャラ配置
- 背景装飾や重要要素を避ける範囲

台本には、各素材ポイントごとに次を含める。

- `scene_template`
- `main_content`
- `sub_content` または `sub_contentなし`
- `subtitle_area`
- `title_area`
- `image_insert_point`
- `asset_path`

`asset_path` と `image_insert_point` は台本メモ用の情報。
動画レンダー用の `script.yaml` では、`main.asset` または `sub.asset` に変換する。

サブコンテンツエリアがある場合は、補足、比較、チェックリスト、注意点をサブ枠に分離する。
サブコンテンツエリアがない場合は、サブ素材を無理に作らず、メイン素材と短い字幕で成立させる。
字幕枠が狭い場合は、1セリフを短くし、2行以内かつ25文字以内で読める長さにする。

## script.yaml Render Schema 注意

動画レンダーで実際に読まれる `scene_template` は `Scene01`〜`Scene21` の形式に統一する。
`scene-01`、`scene-XX`、`01` は使わない。

画像素材を表示する場合は、台本メモ用の `asset_path` ではなく、レンダー用 YAML に次の形で入れる。

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
サブ枠があるテンプレートでも、`bullets` は3項目以内、画像は小さく読める単純図に限定する。

字幕は `subtitle_area` ではなく `dialogue[].text` から表示される。
1セリフは25文字以内を安全上限にし、長い説明は複数行ではなく複数セリフへ分割する。

タイトルは `title_text` に入れる。
タイトル枠がないテンプレートでは、無理に `title_text` で見せようとせず `main.text` 側に入れる。

## NotebookLM Asset Workflow

Claude Codeでは image gen を前提にしない。
図解や素材が必要な場合は `notebookLM/` のフローを使う。

参照する入口:

- `notebookLM/README.md`
- `notebookLM/CLAUDE.md`
- `notebookLM/templates/asset-marker-spec.md`
- `notebookLM/prompts/asset-request-prompt.md`

基本工程:

1. 台本内に素材マーカーを置く
2. `cd notebookLM` で NotebookLM サブワークスペースへ移動する
3. `python .\scripts\init_project.py --title "<title>" --theme "<theme>"` で案件を作る
4. `python .\scripts\prepare_assets.py <slug> --style <style>` で NotebookLM 投入準備を行う
5. `python .\scripts\fetch_assets.py <slug> --style <style>` で素材生成・取得する
6. `python .\scripts\build_audit_report.py ...` で監査レポートを作る
7. 上位repoへ戻り、採用素材を `script/{episode_id}/assets/` へコピーする
8. `script.yaml` では `assets/s01_main.png` のような相対パスに変換する
9. 生成素材を確認する
10. 画像パスと挿入ポイントを最終台本に反映する

NotebookLM素材の成功を仮定しない。
生成物が存在し、内容が台本の意図に合うことを確認してから反映する。
NotebookLM版では fallback 画像やローカル生成カードを合格扱いにしない。
全 marker が NotebookLM 純正 artifact として生成・取得され、監査が PASS した場合だけ完成とする。

## Video Workflow

画像挿入ポイント付き台本ができたら、`02_演出編集プロンプト.md` に従って演出加工する。

動画生成まで進む場合は、既存の `script/{episode_id}/script.yaml` 形式に合わせる。
テンプレート指定は `scene_template` に反映し、素材パスは `assets/` 配下を参照する。

動画生成コマンド:

```powershell
node scripts/validate-episode-script.mjs <episode_id>
node scripts/build-episode.mjs <episode_id>
node scripts/generate-episode-compositions.mjs
npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4
```

## Stop Conditions

次の場合は成功扱いにしない。

- 使用テンプレートが未確定
- 選択テンプレートの仕様を読んでいない
- サブコンテンツエリアの有無を台本に反映していない
- 字幕枠が狭いのに長文セリフのまま
- `dialogue[].text` が25文字を超えている
- `scene_template` が `Scene01`〜`Scene21` 形式ではない
- 画像素材が `main.asset` / `sub.asset` に変換されていない
- NotebookLM素材の生成確認ができていない
- 動画生成に失敗したのに出力完了として報告している
