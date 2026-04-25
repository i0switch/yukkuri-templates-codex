# テンプレート認識付き 台本生成・素材生成・動画化ワークフロー

## 目的

ユーザーから台本生成依頼が来たときに、使用テンプレートの表示枠を認識したうえで、台本、素材、画像挿入ポイント、演出加工、動画生成までつなぐ。

このワークフローは Claude Code / Codex 共通で使う。

## 1. 依頼受付

台本生成依頼が来たら、まず次を確認する。

- 作りたいテーマ
- ざっくり入れたい内容
- 想定尺
- 使用テンプレート
- キャラペア: `RM` 霊夢・魔理沙 / `ZM` ずんだもん・めたん

テンプレート未指定の場合は、`00_START_HERE.md` と `templates/` の一覧をもとに候補を提示し、選択を待つ。

## 2. テンプレート読込

使用テンプレートが決まったら、必ず次を読む。

- 選択された `templates/scene-XX_*.md`
- `06_scene-layout-guide.md`
- 必要に応じて `00_START_HERE.md`

読み取り結果として、次を作業メモに整理する。

```text
scene_template:
main_content:
sub_content:
subtitle_area:
title_area:
character_layout:
avoid_area:
```

`scene_template` は作業メモ段階でも `Scene01`〜`Scene21` の形式で書く。
`scene-01`、`scene-XX`、`01` はレンダーで読めないため使わない。

## 3. 台本生成

台本生成元は `_reference/script_prompt_pack/` の改善版プロンプトを使う。

- 共通: `_reference/script_prompt_pack/01_台本生成プロンプト.md`
- `RM`: `_reference/script_prompt_pack/ゆっくり解説_霊夢魔理沙_台本生成プロンプト_改善版.md`
- `ZM`: `_reference/script_prompt_pack/ずんだもん解説_ずんだもんめたん_台本生成プロンプト_改善版.md`

改善版プロンプトに含まれる「画面・演出」「BGM」「SE」「テロップ」系の指定は、台本段階では素材候補メモとして扱う。
実際の演出指定は後続の `02_演出編集プロンプト.md` で行う。

台本は、テンプレートの表示枠に合わせて作る。

### サブコンテンツエリアがある場合

- 補足情報、比較、チェックリスト、注意点をサブ枠に分離する
- メイン枠は大きな図解、流れ、主張、具体例を置く
- サブ枠は短い語句、3項目以内の箇条書き、数値比較に使う

### サブコンテンツエリアがない場合

- `sub_contentなし` と明記する
- 1画面に情報を詰め込みすぎない
- メイン素材を分割するか、セリフ側で補足する

### 字幕枠が狭い場合

- 1セリフを短くする
- 1字幕は最大2行、かつ `dialogue[].text` は25文字以内にする
- 長い説明は複数行ではなく複数セリフへ分割する

## 4. 台本に入れるテンプレート対応情報

各シーン、または各画像挿入ポイントには次を入れる。

```yaml
scene_template: "Scene02"
main_content: "メイン枠に置く内容"
sub_content: "サブ枠に置く内容 / sub_contentなし"
subtitle_area: "字幕枠の使い方"
title_area: "タイトル枠の使い方 / title_areaなし"
image_insert_point: "どのセリフの前後に入れるか"
asset_path: "script/{episode_id}/assets/xxx.png"
```

`image_insert_point` と `asset_path` は台本メモ用。
動画用の `script.yaml` では次の形へ変換する。

```yaml
scene_template: "Scene02"
title_text: "短い章タイトル"
main:
  kind: image
  asset: assets/s02_main.png
  caption: "任意"
sub:
  kind: image
  asset: assets/s02_sub.png
  caption: "任意"
dialogue:
  - id: l01
    speaker: left
    text: 25文字以内のセリフ
```

`asset` は `script/{episode_id}/assets/...` ではなく `assets/...` の相対パスにする。
サブコンテンツ枠がないテンプレートでは `sub: null` にする。
タイトル枠がないテンプレートでは `title_text` に頼らず、必要なら `main.text` へ短い見出しを入れる。

## 5. 自己監査

生成後、`_reference/script_prompt_pack/台本監査_改善プロンプト.md` の観点で確認する。

必ず見る項目:

- 冒頭フックが弱くないか
- キャラの役割が崩れていないか
- テンプレートの表示枠に合っているか
- サブコンテンツエリアの有無が反映されているか
- 字幕が長すぎないか
- 全 `dialogue[].text` が25文字以内か
- `scene_template` が `Scene01`〜`Scene21` 形式か
- 画像素材が `main.asset` / `sub.asset` に変換されているか
- 素材候補が具体的か
- 画像挿入ポイントが明確か

問題がある場合は、台本全体を作り直さず、該当箇所だけ修正する。

## 6. 素材生成

### Codexの場合

Codexで image gen が使える場合は、台本から画像生成プロンプトを作り、動画用素材を生成する。

保存先:

```text
script/{episode_id}/assets/
```

命名規則:

```text
s01_main.png
s01_sub.png
s02_main.png
s02_sub.png
```

生成後はファイル存在を確認し、`script.yaml` では `assets/s01_main.png` の相対パスで参照する。
画像生成に失敗した素材は、同じ用途の NotebookLM 生成、または `main.kind: text` / `main.kind: bullets` への縮退を検討する。

台本には、生成した画像の挿入ポイントと画像パスを追記する。

### Claude Codeの場合

Claude Codeでは `notebookLM/` を使う。

参照する入口:

- `notebookLM/README.md`
- `notebookLM/CLAUDE.md`
- `notebookLM/templates/asset-marker-spec.md`
- `notebookLM/prompts/asset-request-prompt.md`

実行順:

```powershell
Push-Location .\notebookLM
python .\scripts\init_project.py --title "<title>" --theme "<theme>"
python .\scripts\prepare_assets.py <slug> --style <style>
python .\scripts\fetch_assets.py <slug> --style <style>
python .\scripts\build_audit_report.py --script workspace/projects/<slug>/<style>/script/script_v1.md --final workspace/projects/<slug>/<style>/final/final_script_v1.md --state workspace/projects/<slug>/<style>/state/run_state.json --assets-dir workspace/projects/<slug>/<style>/materials/generated
Pop-Location
```

NotebookLM素材は、生成済みファイルの存在と内容を確認してから最終台本に反映する。
NotebookLM の `materials/generated/` にある採用素材は、上位repoの `script/{episode_id}/assets/` へコピーし、`script.yaml` では `assets/s01_main.png` のような相対パスに変換する。
NotebookLM版では fallback 画像やローカル生成カードを合格扱いにしない。全 marker が NotebookLM 純正 artifact として生成・取得され、監査が PASS した場合だけ完成とする。

## 7. 演出加工

画像挿入ポイント付き台本ができたら、`02_演出編集プロンプト.md` に従って演出加工する。

この段階で扱うもの:

- 効果音
- BGM
- 字幕表示
- 章切り替え
- メイン画像の見せ方
- サブコンテンツの出し方
- キャラリアクション

台本の内容自体は大幅に変えない。

## 8. 動画生成

動画生成まで依頼されている場合は、既存の `script/{episode_id}/script.yaml` 形式に合わせる。

最低限そろえるもの:

- `script/{episode_id}/script.yaml`
- `script/{episode_id}/assets/`
- `script/{episode_id}/bgm/`
- `script/{episode_id}/se/` 必要な場合のみ
- `script/{episode_id}/meta.json`

テンプレート指定は `scene_template` に入れる。
素材パスは動画生成時に参照できる形にする。

レンダー前に、次を確認する。

- `scene_template` が `Scene01`〜`Scene21`
- `dialogue[].text` がすべて25文字以内
- `main.kind: image` / `sub.kind: image` の `asset` が `assets/...` 相対パス
- サブ枠がないテンプレートの `sub` が `null`

非破壊チェック:

```powershell
node scripts/validate-episode-script.mjs <episode_id>
```

動画生成コマンド:

```powershell
node scripts/build-episode.mjs <episode_id>
node scripts/generate-episode-compositions.mjs
npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4
```

生成後は、MP4の存在、音声、字幕同期、素材表示、ライセンス記録を確認する。

## 9. 完了条件

完了は次を満たしたときだけ。

- テンプレート仕様を読んでいる
- 台本がメイン枠、サブ枠、字幕枠、タイトル枠に対応している
- サブ枠がないテンプレートでサブ素材を無理に要求していない
- 字幕がテンプレートの枠に収まる長さになっている
- 画像挿入ポイントと画像パスが台本に反映されている
- `script.yaml` が `Scene01`〜`Scene21`、`assets/...`、25文字制限に合っている
- 演出加工済み台本がある
- 動画生成まで依頼された場合は、出力ファイルまたは失敗理由が明確
