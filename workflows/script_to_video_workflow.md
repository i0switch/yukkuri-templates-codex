# テンプレート認識付き 台本生成・素材生成・動画化ワークフロー

## 目的

ユーザーから台本生成依頼が来たときに、使用テンプレートの表示枠を認識したうえで、台本、素材、画像挿入ポイント、演出加工、動画生成までつなぐ。

このワークフローは Claude Code / Codex 共通で使う。

## 1. 依頼受付

台本生成依頼が来たら、まず次を確認する。

- 作りたいテーマ
- ざっくり入れたい内容
- 想定尺
- 使用テンプレート（1動画につき1つだけ）
- キャラペア: `RM` 霊夢・魔理沙 / `ZM` ずんだもん・めたん

テンプレート未指定の場合は、`00_START_HERE.md` と `templates/` の一覧をもとに候補を提示し、選択を待つ。

受付後は、別Codex監査で「入力条件、テンプレート選定、キャラペア、想定尺に矛盾がないか」を確認する。
FAIL の場合は不足情報を補い、同じ監査を再実行してから次へ進む。

## 2. テンプレート読込

このプロジェクトでは、1本の動画につき `Scene01`〜`Scene21` のテンプレートを1つだけ使う。
テンプレートは動画の見た目スキンであり、`scenes[]` は時間ブロックである。
シーンごとにテンプレートを切り替える運用は禁止。

使用テンプレートが決まったら、必ず次を読む。

- 選択された `templates/scene-XX_*.md`
- `06_scene-layout-guide.md`
- 必要に応じて `00_START_HERE.md`

読み取り結果として、次を作業メモに整理する。

```text
layout_template:
main_content:
sub_content:
subtitle_area:
title_area:
character_layout:
avoid_area:
```

`layout_template` は動画全体のテンプレートとして作業メモ段階でも `Scene01`〜`Scene21` の形式で書く。
`scene-01`、`scene-XX`、`01` はレンダーで読めないため使わない。

テンプレート読込後は、別Codex監査で main/sub/subtitle/title/avoid_area の読み違いを確認する。
PASS するまで台本生成へ進まない。

## 3. 台本生成

台本生成元は `_reference/script_prompt_pack/` のフェーズ別プロンプトを使う。

- 正本: `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`
- 企画・構成: `_reference/script_prompt_pack/01_plan_prompt.md`
- 台本初稿: `_reference/script_prompt_pack/02_draft_prompt.md`
- 監査: `_reference/script_prompt_pack/03_audit_prompt.md`
- 修正: `_reference/script_prompt_pack/04_rewrite_prompt.md`
- YAML変換: `_reference/script_prompt_pack/05_yaml_prompt.md`

`00_MASTER_SCRIPT_RULES.md` に含まれる「画面・演出」「BGM」「SE」「テロップ」系の分離ルールに従い、台本段階では素材候補メモとして扱う。
実際の演出指定は後続の `02_演出編集プロンプト.md` で行う。

台本は、動画全体で固定した `scene_template` の表示枠に合わせて作る。
各 scene は `main` / `sub` / `title_text` / `dialogue` の中身だけを変える。
`scenes[].scene_template` は書かない。

参照動画、ミステリー系、事件系、疑惑系、長尺深掘り系の依頼では、テンプレートとは別に `reference_style` を選ぶ。

- `listicle_mystery`: 未解明の謎○選型
- `scandal_case`: 疑惑・炎上・噂紹介型
- `crime_timeline`: 事件経緯・人物像深掘り型
- `deep_mystery`: 人類・歴史・科学ミステリー深掘り型

### 台本品質ゲート

- 冒頭5秒以内に、損失、意外性、誤解訂正、または強い疑問を置く
- 1シーン1役割にし、各シーンに `scene_goal`、`viewer_question`、`visual_role` を持たせる
- 同じ結論文、同じ注意喚起、同じ箇条書きを複数シーンで使い回さない
- 解説役だけが3セリフ以上続く独演を避け、視聴者役の疑問、誤解、反論、ツッコミを挟む
- 3〜5シーンごとに、疑問、失敗例、比較、手順、まとめなど視点を切り替える
- 最後は「今日やること」が1つわかる具体行動で終える
- 参照動画型では、冒頭2シーン以内に強い謎、疑惑、違和感を置く
- 参照動画型では、中盤40〜60%地点に `reference_beat: midpoint_rehook` を入れる
- 参照動画型では、終盤に `reference_beat: summary` を置いて冒頭の疑問へ戻る
- 事件・疑惑・実在人物を扱う場合、注意書きと断定回避を入れる

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

### 視覚素材密度

台本生成時点で `visual_asset_plan` を必ず作る。

- 本編シーンは原則 `main.kind: image` とし、最低1枚の main 画像を要求する
- 選択テンプレートが sub枠を持つ `Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14` の場合は、sub に補足、比較、注意点、チェックリスト用の画像または短い補助図を優先する
- 長尺動画では 45〜60秒ごとに最低1つ、新しい視覚素材を入れる
- 画像を入れない本編シーンは、`visual_asset_plan` に「なぜ画像なしでも成立するか」を書く
- 字幕枠や小さい sub枠には、細かい文字や複雑な図を詰め込まない

## 4. 台本に入れるテンプレート対応情報

動画全体にはテンプレートを1つだけ指定し、各シーンまたは各画像挿入ポイントには枠利用情報を入れる。

```yaml
meta:
  layout_template: "Scene02"

scene:
  main_content: "メイン枠に置く内容"
  sub_content: "サブ枠に置く内容 / sub_contentなし"
  subtitle_area: "字幕枠の使い方"
  title_area: "タイトル枠の使い方 / title_areaなし"
  image_insert_point: "どのセリフの前後に入れるか"
  asset_path: "script/{episode_id}/assets/xxx.png"
  scene_goal: "このシーンで理解させること"
  viewer_question: "視聴者役が抱く疑問"
  visual_role: "main/sub が何を担当するか"
  reference_style: "listicle_mystery"
  reference_beat: "numbered_case"
  hook_type: "unresolved_question"
  curiosity_gap: "なぜ今も正体が分からないのか"
  evidence_role: "background"
  next_reason: "次の事例では別の未解明点を見る"
  visual_asset_plan:
    - slot: "main"
      purpose: "この素材で理解させること"
      insert_timing: "どのセリフの前後に入れるか"
      imagegen_prompt: |
        【用途】scene_id と slot、視聴者に何を一瞬で理解させる素材か
        【主題】画面の中心に置く具体物、図解対象、象徴モチーフ
        【構図】主役オブジェクト、補助オブジェクト、視線誘導、前景/背景、左右下部の空け方
        【テンプレート枠】SceneXX の main/sub/title/subtitle/キャラ位置を避ける指示
        【色】背景色、主色、アクセント色、警告色の使いどころ
        【情報量】1枚1メッセージ。入れる文字は0文字、または日本語3〜6文字まで
        【絵柄】meta.image_style と一致する、ゆっくり/ずんだもん解説向けの太線フラット図解
        【禁止】実在人物、既存キャラクター、ブランドロゴ、実在UI模写、英語UI、細かい文字、密な表、写真風人物
      audit_points:
        - "1枚1メッセージになっている"
        - "テンプレート枠に収まる"
        - "細かい文字やロゴがない"
```

`image_insert_point` と `asset_path` は台本メモ用。
動画用の `script.yaml` では次の形へ変換する。

```yaml
meta:
  layout_template: "Scene02"
scenes:
- id: s01
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

生成後、`_reference/script_prompt_pack/03_audit_prompt.md` の観点で確認する。

必ず見る項目:

- 冒頭フックが弱くないか
- 同じセリフ、同じ結論、同じ箇条書きが過剰に反復していないか
- 各シーンの `scene_goal`、`viewer_question`、`visual_role` が具体的か
- キャラの役割が崩れていないか
- テンプレートの表示枠に合っているか
- サブコンテンツエリアの有無が反映されているか
- 字幕が長すぎないか
- 全 `dialogue[].text` が25文字以内か
- `meta.layout_template` が `Scene01`〜`Scene21` 形式か
- `scenes[].scene_template` を使っていないか
- 画像素材が `main.asset` / `sub.asset` に変換されているか
- 素材候補が具体的か
- `visual_asset_plan` が全シーンにあり、本編シーン中心に画像が十分か
- 画像素材に `asset_requirements.imagegen_prompt` があり、テンプレート枠に合わせた図解指示になっているか
- `asset_requirements.imagegen_prompt` に、シーン目的、動画トーン、テンプレート枠、構図、色、余白、禁止要素、文字有無があるか
- `asset_requirements.imagegen_prompt` が【用途】【主題】【構図】【テンプレート枠】【色】【情報量】【絵柄】【禁止】の8項目で書かれているか
- `asset_requirements.imagegen_prompt` に scene_id、slot、字幕帯/キャラ位置回避、画像内文字0文字または日本語3〜6文字以内の指示があるか
- 参照動画型では、80%以上のシーンに `reference_style`、`reference_beat`、`hook_type`、`curiosity_gap`、`evidence_role`、`next_reason` があるか
- 参照動画型では、`midpoint_rehook` と `summary` があるか
- `scandal_case` / `crime_timeline` では注意書き、反論、限界説明があるか
- 画像挿入ポイントが明確か

問題がある場合は、台本全体を作り直さず、該当箇所だけ修正する。

自己監査後は、別Codex監査で台本ドラフト、素材密度、`visual_asset_plan`、imagegen_prompt 品質を確認する。
FAIL の場合は指摘箇所だけ修正し、同じ監査が PASS するまで素材生成へ進まない。

### 5.1 別Codex監査ログ

各工程の完了前に、別Codex監査の結果を `script/{episode_id}/audits/` に保存する。

必須ステップ:

- `reference_analysis`
- `profile_design`
- `prompt_update`
- `schema_update`
- `quality_audit_update`
- `sample_episode`
- `final_reference_fit`

形式:

```json
{
  "step": "script_generation",
  "verdict": "PASS",
  "blocking_issues": [],
  "required_fixes": [],
  "reviewer": "second-codex",
  "checked_at": "2026-04-25T00:00:00.000Z"
}
```

検証:

```powershell
node scripts/verify-second-codex-audits.mjs <episode_id>
```

`verdict: PASS` の監査ログが揃っていない場合、次工程へ進めない。

## 6. 素材生成

### Codexの場合

Codexでは、台本から画像生成プロンプトを作り、挿入画像を必ず image gen スキルで生成する。
Codex動画生成では NotebookLM、フリー素材、licensed download、local card、fallback、placeholder を挿入画像の代替手段や合格ルートとして使わない。
image gen スキルが使えない場合は、動画生成完了ではなく「素材生成未完了」として停止する。

画像生成プロンプトは「それっぽい大判イラスト」ではなく、動画内で見やすい素材セットとして書く。

- main枠: 1メッセージ、中央主題、余白あり、文字なしまたは最小限
- sub枠: 3項目以内、細かい文字禁止
- 章切り替え用: 章の見出しを支える抽象背景または短い象徴図
- 比較用: 左右差が一目で分かるが、文字に頼りすぎない
- まとめ用: 3項目以内の要点回収カード
- 選択テンプレートが `Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14` の場合は main と sub の役割を必ず分ける
- `asset_requirements.imagegen_prompt` に、シーン目的、動画トーン、テンプレート枠、主題、構図、色、余白、禁止要素、文字有無を書く
- episode 共通の `meta.image_style` と、各シーン固有の `imagegen_prompt` を組み合わせて絵柄を揃える
- 実在人物、既存キャラクター、ブランドロゴ、細かいUI文字は入れない

`imagegen_prompt` は次の8項目フォーマットで固定する。

```text
【用途】scene_id と slot、視聴者に何を一瞬で理解させる素材か
【主題】画面の中心に置く具体物、図解対象、象徴モチーフ
【構図】主役オブジェクト、補助オブジェクト、視線誘導、前景/背景、左右下部の空け方
【テンプレート枠】SceneXX の main/sub/title/subtitle/キャラ位置を避ける指示
【色】背景色、主色、アクセント色、警告色の使いどころ
【情報量】1枚1メッセージ。入れる文字は0文字、または日本語3〜6文字まで
【絵柄】meta.image_style と一致する、ゆっくり/ずんだもん解説向けの太線フラット図解
【禁止】実在人物、既存キャラクター、ブランドロゴ、実在UI模写、英語UI、細かい文字、密な表、写真風人物
```

main枠は中央主題を大きく見せ、sub枠は3項目以内の補足だけにする。
サブ枠や字幕帯に細かい文字を入れない。
「フラットな図解」「わかりやすいカード」「中央に主題、余白多め」だけの抽象プロンプトは再生成前に差し戻す。

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
画像生成に失敗した素材は、該当素材だけ image gen プロンプトを修正して再生成する。
再生成しても採用できない場合は素材生成未完了として停止し、NotebookLM、download、text退避を Codex の動画生成完了条件にしない。

台本には、生成した画像の挿入ポイントと画像パスを追記する。
`meta.json` には、`file`、`source_site`、`source_type`、`imagegen_prompt`、`imagegen_model`、`scene_id`、`slot`、`purpose`、`adoption_reason`、`license` を記録する。
画像の `source_site` または `source_type` は image gen / image_gen / OpenAI image generation 系だと分かる値にする。

素材生成後は、別Codex監査で生成素材の採用可否、動画トーンとの一致、meta.json 記録、未解決素材を確認する。
FAIL の場合は再生成または素材計画の修正を行い、PASS まで次へ進まない。

### Claude Codeの場合

Claude Codeでは `notebookLM/` を使う。
この章は Claude Code 環境用の例外運用であり、Codex動画生成では使わない。

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

演出加工後は、別Codex監査で「台本内容を壊していないか」「画像の見せ場が45〜60秒以上空いていないか」「素材が多すぎて読みにくくなっていないか」を確認する。

台本の内容自体は大幅に変えない。

## 8. 動画生成

動画生成まで依頼されている場合は、既存の `script/{episode_id}/script.yaml` 形式に合わせる。

最低限そろえるもの:

- `script/{episode_id}/script.yaml`
- `script/{episode_id}/assets/`
- `script/{episode_id}/bgm/`
- `script/{episode_id}/se/` 必要な場合のみ
- `script/{episode_id}/meta.json`

テンプレート指定は `meta.layout_template` に1回だけ入れる。`scenes[].scene_template` は使用禁止。
素材パスは動画生成時に参照できる形にする。

レンダー前に、次を確認する。

- `meta.layout_template` が `Scene01`〜`Scene21`
- `scenes[].scene_template` が存在しない
- `dialogue[].text` がすべて25文字以内
- `main.kind: image` / `sub.kind: image` の `asset` が `assets/...` 相対パス
- サブ枠がないテンプレートの `sub` が `null`
- 本編シーン中心に十分な画像があり、`node scripts/audit-episode-quality.mjs <episode_id>` が PASS する
- Codex動画生成の画像素材が image gen 生成として `meta.json` に記録されている
- Codex動画生成の画像素材が NotebookLM、licensed download、fallback、placeholder、local card、copied asset ではない
- 画像ファイルが実体検査に通る（小さすぎるカード画像や検査不能ファイルは不可）
- 機械的な語尾変換や不自然な台詞が残っていない

非破壊チェック:

```powershell
npm run gate:episode -- <episode_id>
```

`script.yaml` と build/render 前チェックは別Codex監査を通す。FAIL の場合は YAML、素材、meta.json の該当箇所を修正する。

動画生成コマンド:

原則として、直接 `npx remotion render` を実行しない。
検証飛ばしを防ぐため、pre-render gate 付きラッパーを使う。

推奨:

```powershell
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
```

従来の分解実行も可能だが、`build-episode.mjs` は内部で `audit-episode-quality.mjs` を必ず実行する。
そのため、gate に通らない episode は音声生成前に停止する。

```powershell
node scripts/build-episode.mjs <episode_id>
node scripts/generate-episode-compositions.mjs
npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4
```

生成後は、MP4の存在、音声、字幕同期、素材表示、ライセンス記録を確認する。
最終MP4監査後も別Codex監査を実施し、PASS した場合だけ納品扱いにする。

## 9. 完了条件

完了は次を満たしたときだけ。

- テンプレート仕様を読んでいる
- 台本がメイン枠、サブ枠、字幕枠、タイトル枠に対応している
- サブ枠がないテンプレートでサブ素材を無理に要求していない
- 字幕がテンプレートの枠に収まる長さになっている
- 画像挿入ポイントと画像パスが台本に反映されている
- `script.yaml` が `meta.layout_template: Scene01`〜`Scene21`、`assets/...`、25文字制限に合っている
- 演出加工済み台本がある
- 動画生成まで依頼された場合は、出力ファイルまたは失敗理由が明確













