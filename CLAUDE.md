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
5. 画像素材を生成する：CodexCLI が使える環境では必ず `codex-imagegen` skill で gpt-image-1 によるバッチ生成を行う（NotebookLM はフォールバック）
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
- `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
- `_reference/script_prompt_pack/01_plan_prompt.md`
- `_reference/script_prompt_pack/02_draft_prompt.md`
- `_reference/script_prompt_pack/03_audit_prompt.md`
- 必要に応じて `_reference/script_prompt_pack/04_rewrite_prompt.md`
- YAML変換時は `_reference/script_prompt_pack/05_yaml_prompt.md`

## Script Prompt Pack Is Mandatory

台本生成、動画台本、ゆっくり台本、ずんだもん台本、解説動画作成、YAML変換を含む依頼では、`_reference/script_prompt_pack/` を必須の正準手順として扱う。
テンプレートの見た目だけを読んで、Claude Code 側の独自判断で台本を組み立てない。

禁止事項:

- `00_MASTER_SCRIPT_RULES.md` を読まずに企画、初稿、監査、YAML変換へ進まない
- `01_plan_prompt.md` を飛ばして、いきなり完成台本を書かない
- `03_audit_prompt.md` の監査 PASS 前に YAML 化しない
- FAIL 箇所を全体作り直しで潰さず、`04_rewrite_prompt.md` で弱い箇所だけ修正する
- `05_yaml_prompt.md` を読まずに `script.yaml` を手書きで整えない
- `scenes[].scene_template` を使わない
- `meta.scene_template` を新規の正準フィールドとして使わない。正準は `meta.layout_template`
- Script Prompt Pack が見つからない、削除されている、または必要ファイルが欠けている状態で、台本生成完了や動画生成完了として報告しない

正しい流れ:

1. 必須確認項目を受け取る
2. 選択テンプレートと `06_scene-layout-guide.md` で表示枠を確定する
3. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md` を読む
4. `_reference/script_prompt_pack/01_plan_prompt.md` で企画、構成、枠利用を確定する
5. `_reference/script_prompt_pack/02_draft_prompt.md` で初稿を作る
6. `_reference/script_prompt_pack/03_audit_prompt.md` で監査する
7. FAIL の場合は `_reference/script_prompt_pack/04_rewrite_prompt.md` で差分修正し、再監査する
8. PASS 後だけ `_reference/script_prompt_pack/05_yaml_prompt.md` で `script.yaml` に変換する

`_reference/script_prompt_pack/` とこのファイルの記述が食い違う場合は、台本生成品質と YAML 構造については Script Prompt Pack を優先する。
ただし Claude Code の NotebookLM 運用、素材確認、動画化の停止条件はこの `CLAUDE.md` のルールも同時に満たす。

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

- `layout_template`
- `main_content`
- `sub_content` または `sub_contentなし`
- `subtitle_area`
- `title_area`
- `image_insert_point`
- `asset_path`

`asset_path` と `image_insert_point` は台本メモ用の情報。
動画レンダー用の `script.yaml` では、`main.asset` または `sub.asset` に変換する。
テンプレート指定は `meta.layout_template` に1回だけ入れ、各 scene には `scene_template` を書かない。

サブコンテンツエリアがある場合は、補足、比較、チェックリスト、注意点をサブ枠に分離する。
サブコンテンツエリアがない場合は、サブ素材を無理に作らず、メイン素材と短い字幕で成立させる。
字幕枠が狭い場合は、1セリフを短くし、2行以内かつ25文字以内で読める長さにする。

## script.yaml Render Schema 注意

動画レンダーで実際に読まれる `meta.layout_template` は `Scene01`〜`Scene21` の形式に統一する。
`scenes[].scene_template` は使用禁止。
`meta.scene_template` は legacy alias のため、新規作成では使わない。
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

## Image Asset Workflow

画像素材は次の優先順位で生成する。

### 第一候補: Codex CLI（`codex-imagegen` skill）

`codex --version` が通り `~/.codex/auth.json` が存在する環境では、必ず Codex CLI の image_gen（gpt-image-1）でバッチ生成する。
詳細手順は global skill `codex-imagegen` の SKILL.md を参照。

このプロジェクトでの典型フロー:

1. 各シーンの `visual_asset_plan[0].imagegen_prompt` を読む
2. 英語ベースのプロンプトに整形（画像内日本語ラベルは引用符と文字数上限で固定）
3. `/c/temp/codex-img-batch/prompt.txt` にバッチプロンプトを書く（ASCII パスから走らせる）
4. `codex exec --full-auto --skip-git-repo-check --color never -C "C:/temp/codex-img-batch" < prompt.txt > log.txt 2>&1` をバックグラウンド実行
5. 完了通知後、`~/.codex/generated_images/{session_id}/` の PNG を mtime 順にソートし、宣言順で `script/{episode_id}/assets/sXX_main.png` にコピー
6. `script.yaml` の `main.kind` を `text` → `image` に切り替え
7. `meta.json` の `assets[]` レジストリにユニーク `source_url`（`codex://generated_images/{session_id}/{filename}`）込みで記録
8. `imagegen_prompt` 末尾に「【トーン】解説動画向け」「【禁止追記】ロゴなし、実在人物なし、既存キャラクターなし、ブランドロゴなし、細かい文字なし、英語UIなし」を入れて audit を通す

### フォールバック: NotebookLM

Codex CLI が無い環境、または Codex で生成できない素材（写真風など）が必要な場合だけ `notebookLM/` フローを使う。

NotebookLM フォールバック時の参照入口:

- `notebookLM/README.md`
- `notebookLM/CLAUDE.md`
- `notebookLM/templates/asset-marker-spec.md`
- `notebookLM/prompts/asset-request-prompt.md`

NotebookLM フォールバック時の基本工程:

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

NotebookLMだけで必要素材が揃わない場合は、足りない素材だけをフリー素材サイトから取得する。
取得素材はライセンス、出典URL、用途、保存先を記録し、NotebookLM素材と混在しても判別できるように整理する。
既存キャラクター、ブランドロゴ、実在人物の権利侵害につながる素材は使わない。

NotebookLM素材の成功を仮定しない。
生成物が存在し、内容が台本の意図に合うことを確認してから反映する。
NotebookLM版では fallback 画像やローカル生成カードを合格扱いにしない。
全 marker が NotebookLM 純正 artifact として生成・取得され、監査が PASS した場合だけ完成とする。

## Video Workflow

画像挿入ポイント付き台本ができたら、`02_演出編集プロンプト.md` に従って演出加工する。

動画生成まで進む場合は、既存の `script/{episode_id}/script.yaml` 形式に合わせる。
テンプレート指定は `meta.layout_template` に反映し、素材パスは `assets/` 配下を参照する。

動画生成コマンド:

```powershell
npm run gate:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
```

## Stop Conditions

次の場合は成功扱いにしない。

- 使用テンプレートが未確定
- 選択テンプレートの仕様を読んでいない
- サブコンテンツエリアの有無を台本に反映していない
- 字幕枠が狭いのに長文セリフのまま
- `dialogue[].text` が25文字を超えている
- `meta.layout_template` が `Scene01`〜`Scene21` 形式ではない
- `scenes[].scene_template` を使っている
- 画像素材が `main.asset` / `sub.asset` に変換されていない
- Codex CLI が使える環境なのに `codex-imagegen` skill を使わず別ルートで生成している
- 生成画像の生成確認（実物の表示・配置範囲・テンプレート枠との衝突）ができていない
- 動画生成に失敗したのに出力完了として報告している
