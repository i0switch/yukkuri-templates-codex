# CLAUDE.md

このプロジェクトで Claude Code が最初に読む運用指示書。
目的は、ゆっくり解説 / ずんだもん解説の台本生成依頼を、テンプレート認識付きで動画化までつなぐこと。

出力は日本語で統一する。

## Goal

ユーザーが台本生成を依頼したら、次を順番に実行する。

1. 必須情報を確認する
2. 使用テンプレートの画面構造を読む
3. Image Engine を解決する（`codex-imagegen` / `notebooklm` / `text-fallback`）
4. テンプレートと engine に合わせた台本を生成する（`asset_requirements` に engine ごとのメタ情報を埋める）
5. 解決した engine で素材を生成する
6. 最終台本へ素材パスを反映する
7. `02_演出編集プロンプト.md` で演出加工する
8. 指定テンプレートで動画生成へ進める

## Script Prompt Pack Is Mandatory

台本生成では `_reference/script_prompt_pack` の改善版プロンプトを必ず使用する。
ハードコード台本生成（JS 配列にシーン台本を直書きして `script.yaml` を吐く）はバイパスとみなし禁止する。

禁止事項：

- 台本本文（`scenes` / `dialogue`）を `.mjs` / `.ts` の中で直書きして本番 `script.yaml` を生成する
- `script.md` を経由せず `script.yaml` を直接作る
- `03_audit_prompt.md` の監査なしで PASS 扱いにする
- FAIL 判定を無視して画像生成 / Remotion レンダリングへ進む
- ハードコード生成スクリプトを `scripts/` 直下に新設する

正しい流れ：

1. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md` を読む
2. `01_plan_prompt.md` で構成（フック型 / scene_format / boke_or_reaction / reaction_level / 視聴者誤解 / mini_punchline / 数字・具体例）を作る
3. `02_draft_prompt.md` で初稿（`script/{episode_id}/script.md`）を作る
4. `03_audit_prompt.md` で監査する（100点満点・Blocking Issues / 尺密度 / 最終行動 / 章タイトル整合）
5. FAIL なら `04_rewrite_prompt.md` で問題箇所だけを差分修正
6. PASS 後に `05_yaml_prompt.md` で `script.yaml` を生成
7. `node scripts/validate-script-generation-route.mjs <episode_id>` で生成ルートをゲートチェック（prompt pack 存在 / ハードコード生成検出 / script.md 経由確認）
8. `node scripts/audit-script-quality.mjs <episode_id>` で機械監査（尺・密度・語尾・最終行動・中盤再フック）
9. 素材生成 → render JSON → 動画生成

ハードコード台本を残しているスクリプトは `scripts/legacy/` または `scripts/experimental/` 配下に隔離し、通常の動画生成フローから呼ばない。詳細は `scripts/legacy/README.md` を参照。

## Script Prompt Set v3（最優先・正本）

ゆっくり解説 / ずんだもん解説の台本生成は、次の5フェーズパイプラインに従う。
**リポジトリ内正本は `_reference/script_prompt_pack/`** に置く（v3 6ファイルが揃っている）。
`scripts/lib/load-script-prompt-pack.mjs` も `_reference/script_prompt_pack/` を読むので、ここが単一の真実の出所。
過去の個人作業パス `C:\Users\i0swi\Downloads\05_yaml_prompt\` は v3 オリジナル原稿の保管庫として残してよいが、**運用は repo 内 `_reference/script_prompt_pack/` に従う**。差分があったら repo 側を優先する。

| フェーズ | ファイル | 役割 |
|---|---|---|
| 0 | `00_MASTER_SCRIPT_RULES.md` | 正本ルール。台本生成時に最初に必ず読む |
| 1 | `01_plan_prompt.md` | 企画・構成・テンプレ枠・掛け合い設計のみ |
| 2 | `02_draft_prompt.md` | プランから会話台本初稿を作る |
| 3 | `03_audit_prompt.md` | 100点満点で監査。PASS / 仮PASS / FAIL を判定 |
| 4 | `04_rewrite_prompt.md` | 監査結果に基づき問題箇所だけを差分修正 |
| 5 | `05_yaml_prompt.md` | 監査PASS済み台本を `script.yaml` に変換 |

運用フロー: 依頼受領 → `00_MASTER` 読込 → `01_plan` → `02_draft` → `03_audit` → 必要なら `04_rewrite` → PASS 後 `05_yaml`。

v3 で追加された最終ゲート（特に注意）:

- 最終行動: 「見るだけ / 考えるだけ / 後でやる」終了は差し戻し。確認・選択・保存/逃がす/テンプレ化・予定化から2アクション以上必須
- 語尾バランス: ZM ずんだもん「のだ / なのだ」20〜40%、RM 魔理沙「だぜ」30〜60%。0% / 過剰 / 3連続は修正対象
- 章タイトルのテーマ整合: フック型でもテーマ外単語が混ざれば修正
- 自然文・誤字チェック: 助詞抜け、口語違和感、キャラ語尾衝突は修正対象
- セルフ監査の減点強制: 90点以上や Blocking なし判定を甘く出さない
- YAML化前差し戻し条件: 弱点を抱えたまま `script.yaml` 化しない

詳細は `CHANGELOG_v3.md` を参照。

## Required Reads

作業開始時は、依頼に応じて次を読む。

- `00_START_HERE.md`
- `10_video-pipeline.md`
- `06_scene-layout-guide.md`
- `02_演出編集プロンプト.md`
- `workflows/script_to_video_workflow.md`
- `_reference/script_prompt_pack/README.md`
- `21_prompt_codex.md`（imagegen 用台本フォーマットと設計原則）
- `notebookLM/CLAUDE.md`（フォールバック engine として参照する場合）

台本生成時は、必ず次を追加で読む。

- 選択された `templates/scene-XX_*.md`
- `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`（正本・最優先）
- 該当フェーズの `_reference/script_prompt_pack/01_plan_prompt.md` / `02_draft_prompt.md` / `03_audit_prompt.md` / `04_rewrite_prompt.md` / `05_yaml_prompt.md`
- v3 セット側に存在しない RM / ZM 固有指示が必要な場合のみ、補助として下記を参照する:
  - `_reference/script_prompt_pack/ゆっくり解説_霊夢魔理沙_台本生成プロンプト_改善版.md`（RM 補助）
  - `_reference/script_prompt_pack/ずんだもん解説_ずんだもんめたん_台本生成プロンプト_改善版.md`（ZM 補助）
  - `_reference/script_prompt_pack/01_台本生成プロンプト.md`（旧版・参考のみ）
  - `_reference/script_prompt_pack/台本監査_改善プロンプト.md`（旧版・参考のみ）

加えて、テーマからアーキタイプを判定し、該当する構成テンプレを必ず読む。
判定フローと一覧は `_reference/script_prompt_pack/archetypes/README.md` を参照。

- リスト型(◯選/ランキング/雑学/暴露): `_reference/script_prompt_pack/archetypes/list-type.md`
- 事件解説型(凶悪事件/社会事件/歴史的事件): `_reference/script_prompt_pack/archetypes/case-study-type.md`
- サイエンス問題提起型(進化/宇宙/古代史/脳科学): `_reference/script_prompt_pack/archetypes/science-mystery-type.md`

アーキタイプが判定できない場合はユーザーに確認する。アーキタイプ未読のまま台本を生成しない。

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

台本には、動画単位のテンプレートとして `layout_template` を1つだけ含め、各素材ポイントごとに次を含める。

- `layout_template`（動画全体で1つ）
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

動画レンダーで実際に読まれる `layout_template` は `meta.layout_template` に1回だけ置き、`Scene01`〜`Scene21` の形式に統一する。
各 scene に `scene_template` は置かない。`scene-01`、`scene-XX`、`01` は使わない。

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

## Image Engine Workflow

画像素材は engine を解決してから生成する。Engine は 3 種類：

1. **codex-imagegen**（**必須・第一選択**）: Codex CLI 経由で imagegen スキルを呼び出して自前生成
2. **notebooklm**（フォールバック）: `notebookLM/` フローで生成
3. **text-fallback**（最終退避）: `main.kind: text` または `bullets` に縮退

### 強制ルール（最優先）

- 動画生成 / scene 画像生成タスクでは、最初に Codex CLI 利用可否を判定する。判定なしで画像生成を始めない。
- 利用可能と判定された場合、**`yukkuri-codex-imagegen` スキルを Skill ツールで起動して画像生成する**。
- バッチ生成は **必ず `scripts/run-codex-imagegen-pwsh.mjs` を使う**。Node→`pwsh.exe`(windowsHide:true)→`codex exec --dangerously-bypass-approvals-and-sandbox` の3段で cmd ポップアップなし。
- **`codex-companion.mjs` 経由（`run-codex-imagegen-batch.mjs` / `drain-imagegen-tasks.mjs` / `relaunch-missing-scenes.mjs` / `imagegen-single-test.mjs`）は使用禁止**。Windows で cmd ウィンドウがユーザー画面に visible でポップアップする問題があり、`windowsHide: true` を指定しても防げない（2026-04-26 確認）。
- 利用不可、または imagegen が3回リトライしても失敗した場合は、**ユーザーに通知して降格可否を確認してから** notebooklm へ降格する。サイレント降格・自動降格は禁止。
- notebooklm も使えない場合のみ text-fallback。

### Engine 解決手順

動画作成タスクの開始時、Bash で次を順に判定する。`OPENAI_API_KEY` の有無は使わない（ChatGPT OAuth 認証で動作するため）。

```bash
# 軽量判定（推奨）: codex CLI が呼べて、ChatGPT OAuth ログイン済みか
# 注: codex login status は判定文字列を stderr に出すため 2>&1 で結合する
codex --version >/dev/null 2>&1 && codex login status 2>&1 | grep -q "Logged in" && echo "codex-imagegen"
```

判定スクリプトが整備されている場合は次を使う。

```bash
node scripts/resolve-image-engine.mjs
# stdout: "codex-imagegen" | "notebooklm" | "text-fallback"
```

判定タイムアウトは 3 秒上限。失敗時はユーザーに降格可否を確認する。サイレント降格は禁止。

### codex-imagegen の場合

**Skill ツールで `yukkuri-codex-imagegen` スキルを起動する**。スキル内部に Hard Rules（multi-line stdin 必須・`--fresh` 必須・Windows shell コピー回避など）が集約されているため、これを必ず通す。

**imagegen_prompt は `_reference/image_prompt_pack/` 経由で作る**（caption から直接書くのは禁止）。フロー：

1. 台本完成後、`_reference/image_prompt_pack/01_IMAGE_DIRECTION_PROMPT.md` で各 image scene に `image_direction` を作る
2. `_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md` で `image_direction` を `imagegen_prompt` 文字列に展開
3. `_reference/image_prompt_pack/03_IMAGE_PROMPT_AUDIT.md` で生成前 LLM 監査（55点ゲート、FAIL なら `04_IMAGE_REWRITE_PROMPT.md` で構図変更）
4. PASS で `node scripts/audit-image-prompts.mjs <episode_id>` 機械監査 → `run-codex-imagegen-pwsh.mjs` 起動（内部で audit gate を再呼出するので bypass 不可）
5. 生成後 `node scripts/audit-generated-images.mjs <episode_id>` と `_reference/image_prompt_pack/05_IMAGE_RESULT_AUDIT.md` で監査

各シーンの `main.kind: image` / `sub.kind: image` をループし、Codex CLI へ画像生成タスクを委譲する。台本側 `script.yaml` の各 image slot には `image_direction`（必須・16フィールド）と `asset_requirements.imagegen_prompt`（image_prompt_pack で作ったもの）を入れる。

```yaml
main:
  kind: image
  asset: assets/s02_main.png
  caption: "DNA を切り貼りする分子ハサミ"
  image_direction:
    scene_id: s02
    dialogue_role: 誤解訂正
    scene_emotion: 納得
    visual_type: myth_vs_fact
    composition_type: split_danger_safe
    image_should_support: "霊夢の『遺伝子は読むだけ』という誤解を、魔理沙が『書き換える時代』と訂正する瞬間"
    key_visual_sentence: "DNAの二重らせんを分子ハサミが切り、横に新しい配列が差し込まれる"
    main_subject: "DNA二重らせんと分子ハサミ"
    foreground: "分子ハサミの刃と切断面"
    midground: "DNA二重らせん"
    background: "薄い青緑のグリッド"
    color_palette: "青緑、白、薄グレー、変更箇所だけアクセントの黄"
    text_strategy:
      image_text_allowed: false
      image_text_max_words: 0
    layout_safety:
      keep_bottom_20_percent_empty: true
      avoid_character_area: true
      avoid_sub_area_overlap: true
    must_not_include: ["写真風人物", "実在ロゴ", "既存キャラクター", "長文日本語"]
    quality_bar: "教科書ではなくサイエンス番組のオープニング画面のレベル"
  asset_requirements:
    imagegen_prompt: |
      ゆっくり解説のScene02メイン枠で使う、myth_vs_fact 型ビジュアル。
      台本「遺伝子は読むだけ → いや、書き換える時代」を補強する。
      前景には分子ハサミの刃と切断面、中景にはDNA二重らせん、
      背景には薄い青緑のグリッド。視線は刃から DNA 切断点へ流れる。
      下部20%は字幕とキャラ用に空ける。Remotion で正確日本語タイトルを重ねる余白を上部左に確保。
      文字方針：画像内文字は最大3語まで。長文は入れない。
      禁止：白背景に中央アイコンだけ、汎用素材、実在ロゴ、実在UI、既存キャラクター、写真風人物、長文テキスト、細かい表。
    style: "フラット・サイエンス研究室風"
    aspect: "16:9"
    negative: "写真風、リアル調、文字、ロゴ、人物の顔"
    nlm_marker_id: "[FIG:2]"   # フォールバック用、任意
```

`imagegen_prompt` 設計原則は `_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md`（旧仕様 `21_prompt_codex.md#2 Step 2.1` を image_prompt_pack に統合したもの）に準拠：構図 → スタイル → 色 → アスペクト → 文字方針 → 禁止 の固定順、必須キーワード「前景・中景・背景・下部20%・Remotion・禁止」をすべて本文に含む。

バッチ実行コマンド（推奨・cmd ポップアップなし）:

```bash
# 1〜複数 episode を直列で生成、既存 assets はスキップ
node scripts/run-codex-imagegen-pwsh.mjs <episode_id> [<episode_id>...]
```

このスクリプトは：
- Node から `pwsh.exe` を `windowsHide: true` で spawn
- pwsh が一時 .ps1 ファイルを `-File` で読んで実行
- ps1 が prompt を here-string で `codex exec --dangerously-bypass-approvals-and-sandbox` に pipe
- codex が `~/.codex/generated_images/<session>/ig_*.png` に画像を生成
- output から path 抽出 or mtime ベースで最新画像を `script/<episode>/assets/<scene>_<slot>.png` に copy
- すべて hidden console で動作するため cmd ポップアップは1回も出ない

`codex-companion.mjs` 経由のスクリプト（`run-codex-imagegen-batch.mjs` 等）は使用禁止（cmd ポップアップ問題）。

最大 3 回まで再試行（プロンプト最小化、negative 強化）。それでも失敗する場合は **ユーザーに通知し、`notebooklm` へ降格してよいか確認** する。確認なしの自動降格は禁止。

### notebooklm の場合（フォールバック）

参照する入口は `notebookLM/` 配下：

- `notebookLM/README.md`
- `notebookLM/CLAUDE.md`
- `notebookLM/templates/asset-marker-spec.md`
- `notebookLM/prompts/asset-request-prompt.md`

基本工程：

1. 台本内に素材マーカー（`[FIG:N]` `[INFO:N]` `[SLIDE:N]` 等）を置く
2. `cd notebookLM` で NotebookLM サブワークスペースへ移動する
3. `python .\scripts\init_project.py --title "<title>" --theme "<theme>"` で案件を作る
4. `python .\scripts\prepare_assets.py <slug> --style <style>` で NotebookLM 投入準備を行う
5. `python .\scripts\fetch_assets.py <slug> --style <style>` で素材生成・取得する
6. `python .\scripts\build_audit_report.py ...` で監査レポートを作る
7. 上位 repo へ戻り、採用素材を `script/{episode_id}/assets/` へコピーする
8. `script.yaml` では `assets/s01_main.png` のような相対パスに変換する
9. 生成素材を確認する
10. 画像パスと挿入ポイントを最終台本に反映する

NotebookLM 素材の成功を仮定しない。生成物が存在し、内容が台本の意図に合うことを確認してから反映する。
fallback 画像やローカル生成カードを合格扱いにしない。
全 marker が NotebookLM 純正 artifact として生成・取得され、監査が PASS した場合だけ完成とする。

### text-fallback の場合（最終退避）

imagegen / notebooklm 共に失敗した場合、該当シーンを `main.kind: text` または `bullets` に縮退する。
連続で text 退避が発生したら、台本構成自体を見直してユーザーに報告する。

### meta.json への記録

engine に関わらず、`script/{episode_id}/meta.json` の `assets[]` に必ず以下を記録する。

- `file`: アセット相対パス
- `license`: ライセンス文字列
- 経路ごとの最低限：
  - **codex-imagegen**: `generator: "Codex (imagegen)"`, `imagegen_prompt`, `imagegen_model`
  - **notebooklm**: `generator: "NotebookLM"`, `source_type: "notebooklm"` または `source_url`
  - **text-fallback**: 該当シーンに対応するアセットレコードは作らず、`script.yaml` 側を `text/bullets` に変更

## Video Workflow

画像挿入ポイント付き台本ができたら、`02_演出編集プロンプト.md` に従って演出加工する。

動画生成まで進む場合は、既存の `script/{episode_id}/script.yaml` 形式に合わせる。
テンプレート指定は `meta.layout_template` に1回だけ反映し、素材パスは `assets/` 配下を参照する。

**動画生成は単一の正規入口 `render:episode` から呼ぶ**。直接 `build-episode` / `generate-episode-compositions` / `npx remotion` を叩くと品質ゲートを bypass してしまうので避ける。

```powershell
# 正規入口（推奨・gate → audit → lint → validate → build → composition → render を一括）
npm run render:episode -- <episode_id>
node scripts/render-episode.mjs <episode_id>
```

部分実行や手動デバッグ時は個別呼出も可能：

```powershell
node scripts/validate-script-generation-route.mjs <episode_id>   # prompt pack 経由ゲート（必須）
node scripts/audit-script-quality.mjs <episode_id>                # 機械監査ゲート（必須）
node scripts/lint-script-pre.mjs <episode_id>
node scripts/validate-episode-script.mjs <episode_id>
node scripts/build-episode.mjs <episode_id>                       # 冒頭で gate を再呼出するため bypass 不可
node scripts/generate-episode-compositions.mjs
npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4
```

`gate:prompt-pack` / `audit:script-quality` も npm scripts から：

```powershell
npm run gate:prompt-pack -- <episode_id>
npm run audit:script-quality -- <episode_id>
```

緊急バイパス（**ユーザー承認必須**）：`YUKKURI_SKIP_QUALITY_GATE=1` 環境変数で gate を WARNING 付きでスキップ。サイレント設定禁止。

## Stop Conditions

次の場合は成功扱いにしない。

- 使用テンプレートが未確定
- 選択テンプレートの仕様を読んでいない
- サブコンテンツエリアの有無を台本に反映していない
- 字幕枠が狭いのに長文セリフのまま
- `dialogue[].text` が25文字を超えている
- `_reference/script_prompt_pack` の必須6ファイルを読まずに台本生成した
- `script.md` を経由せず `script.yaml` を直接生成した
- `03_audit_prompt.md` の監査を通さず PASS 扱いにした
- `node scripts/validate-script-generation-route.mjs <episode_id>` が FAIL のまま進めた
- `node scripts/audit-script-quality.mjs <episode_id>` が FAIL のまま進めた
- 台本本文（`scenes` / `dialogue`）を `.mjs` / `.ts` の中で直書きして本番 `script.yaml` を生成した
- `scripts/legacy/` 配下のハードコード生成スクリプトを通常の動画生成フローから呼んだ
- `meta.layout_template` が `Scene01`〜`Scene21` 形式ではない、または各 scene に `scene_template` が残っている
- 画像素材が `main.asset` / `sub.asset` に変換されていない
- Image Engine の解決を行わずに台本生成・動画生成を進めた
- engine 判定で `codex login status` を確認しなかった、または ChatGPT OAuth ログイン状態を見ずに NotebookLM 降格した
- Codex CLI が利用可能と判定されたのに `yukkuri-codex-imagegen` スキルを Skill ツールで起動せず、NotebookLM / text-fallback / codex-companion 直叩きに流した
- バッチ画像生成で `scripts/run-codex-imagegen-pwsh.mjs` 以外（`run-codex-imagegen-batch.mjs` / `drain-imagegen-tasks.mjs` / `relaunch-missing-scenes.mjs` / `imagegen-single-test.mjs` 等の codex-companion 経由）を使った
- image scene に `image_direction`（16フィールド）がない、または `asset_requirements.imagegen_prompt` を `_reference/image_prompt_pack/` 経由で作っていない
- `node scripts/validate-image-direction.mjs <episode_id>` または `node scripts/audit-image-prompts.mjs <episode_id>` が FAIL のまま画像生成へ進めた
- 生成後に `node scripts/audit-generated-images.mjs <episode_id>` と `_reference/image_prompt_pack/05_IMAGE_RESULT_AUDIT.md` の監査を行っていない
- imagegen 失敗時にユーザー確認を取らず notebooklm / text-fallback へ自動降格した
- 選択した engine（codex-imagegen / notebooklm）の生成確認ができていない
- imagegen 失敗を放置して MP4 生成を進めた
- `meta.json` に engine ごとの必須フィールド（imagegen 経路の `imagegen_prompt` / `imagegen_model` / `generator` など）が記録されていない
- text-fallback で縮退したシーンが連続してテーマが崩れているのに進めた
- 動画生成に失敗したのに出力完了として報告している
