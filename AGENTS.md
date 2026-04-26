# AGENTS.md

## Purpose

このプロジェクトで Codex が従う運用指示書。
目的は、ゆっくり解説 / ずんだもん解説の台本生成依頼を受けたときに、テンプレートの画面構造を読んだうえで、台本生成、素材生成、画像挿入ポイント付与、演出加工、動画生成まで一貫して進めること。

出力は日本語で統一する。

## Script Prompt Pack Is Mandatory

台本生成では `_reference/script_prompt_pack` の改善版プロンプトを必ず使用する。
ハードコード台本生成（JS 配列にシーン台本を直書きして書き出す）はバイパスとみなし禁止する。

禁止事項：

- 台本本文（`scenes` / `dialogue`）を `.mjs` / `.ts` の中で直接ハードコードして書き出す
- `script.md` を経由せず `script.yaml` を直接作る
- `03_audit_prompt.md` の監査なしで PASS 扱いにする
- FAIL 判定を無視して画像生成や Remotion レンダリングへ進む
- 既存ハードコード生成スクリプトを `scripts/` 直下に新設する

**正しい流れ**：

1. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md` を読む
2. `01_plan_prompt.md` で構成（フック型 / scene_format / boke_or_reaction / reaction_level / 視聴者誤解 / mini_punchline / 数字・具体例）を作る
3. `02_draft_prompt.md` で初稿（`script.md`）を作る
4. `03_audit_prompt.md` で監査（100点満点・Blocking Issues）を実施し、PASS / 仮PASS / FAIL を判定
5. FAIL なら `04_rewrite_prompt.md` で問題箇所だけを差分修正
6. PASS 後に `05_yaml_prompt.md` で `script.yaml` 化
7. `node scripts/validate-script-generation-route.mjs <episode_id>` で生成ルートをゲートチェック
8. `node scripts/audit-script-quality.mjs <episode_id>` で尺・密度・語尾・最終行動の機械監査
9. プリチェック → 素材生成 → `build-episode` → render

ハードコード台本を残しているスクリプトは `scripts/legacy/` または `scripts/experimental/` 配下に隔離する（`scripts/legacy/README.md` 参照）。
通常の動画生成フローから legacy / experimental を呼んではいけない。

## First Read Order

作業開始時は、依頼内容に応じて次を読む。

1. `00_START_HERE.md`
2. `10_video-pipeline.md`
3. `06_scene-layout-guide.md`
4. `02_演出編集プロンプト.md`
5. `workflows/script_to_video_workflow.md`
6. `_reference/script_prompt_pack/README.md`

台本生成依頼の場合は、さらに次を **必ず** 読む（v3 正本パイプライン）。

1. 選択された `templates/scene-XX_*.md`
2. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md`（正本ルール）
3. `_reference/script_prompt_pack/01_plan_prompt.md`（構成）
4. `_reference/script_prompt_pack/02_draft_prompt.md`（初稿）
5. `_reference/script_prompt_pack/03_audit_prompt.md`（監査）
6. 必要に応じて `_reference/script_prompt_pack/04_rewrite_prompt.md`（差分修正）
7. PASS 後 `_reference/script_prompt_pack/05_yaml_prompt.md`（YAML化）

v3 セットに無い RM / ZM 固有指示が必要な場合の **補助のみ**：
- `_reference/script_prompt_pack/ゆっくり解説_霊夢魔理沙_台本生成プロンプト_改善版.md`（RM 補助）
- `_reference/script_prompt_pack/ずんだもん解説_ずんだもんめたん_台本生成プロンプト_改善版.md`（ZM 補助）

下記は **旧版・参考のみ。新規生成では使わない**：
- `_reference/script_prompt_pack/01_台本生成プロンプト.md`（旧版）
- `_reference/script_prompt_pack/台本監査_改善プロンプト.md`（旧版）

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

台本には、動画単位のテンプレートとして `layout_template` を1つだけ含め、各素材ポイントごとに次を含める。

- `layout_template`（動画全体で1つ）
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

動画レンダーで実際に読まれる `layout_template` は `meta.layout_template` に1回だけ置き、`Scene01`〜`Scene21` の形式に統一する。
各 scene に `scene_template` は置かない。`scene-01`、`scene-XX`、`01` は使わない。

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

## Yukkuri / Zundamon Image Direction Rule

ゆっくり解説・ずんだもん解説の画像生成では、単なる説明アイコンではなく、会話のボケ・ツッコミ・誤解訂正・行動提示を補強するビジュアルを作る。

画像生成は次の 5 フェーズパイプラインに従う。**正本は `_reference/image_prompt_pack/`**。

| フェーズ | ファイル | 役割 |
|---|---|---|
| 0 | `00_IMAGE_GEN_MASTER_RULES.md` | マスタールール（visual_type 15 種定義、禁止/必須） |
| 1 | `01_IMAGE_DIRECTION_PROMPT.md` | scene → image_direction |
| 2 | `02_IMAGEGEN_PROMPT_PROMPT.md` | image_direction → imagegen_prompt |
| 3 | `03_IMAGE_PROMPT_AUDIT.md` | 生成前 prompt 監査（55点ゲート） |
| 4 | `04_IMAGE_REWRITE_PROMPT.md` | FAIL 時の構図再設計 |
| 5 | `05_IMAGE_RESULT_AUDIT.md` | 生成後画像監査 |

各画像には必ず `image_direction` を作成し、以下を決める：

- `dialogue_role`（冒頭フック/ボケ補強/ツッコミ補強/誤解訂正/危険喚起/比較提示/手順提示/中盤再フック/まとめ/最終行動）
- `scene_emotion`（焦り/驚き/納得/危険/安心/怒り/混乱/希望/皮肉/ワクワク）
- `visual_type`（hook_poster / boke_visual / tsukkomi_visual / myth_vs_fact / danger_simulation / before_after / three_step_board / checklist_panel / ranking_board / ui_mockup_safe / flowchart_scene / contrast_card / meme_like_diagram / mini_story_scene / final_action_card）
- `composition_type`（smartphone_closeup ほか 15 種、`_reference/image_prompt_pack/archetypes/composition_type_catalog.md` 参照）
- `image_should_support`（台本セリフを具体引用）
- `key_visual_sentence`（30〜60文字、画像を見れば会話の山が分かる）
- `foreground` / `midground` / `background`（それぞれ別の役割）
- `color_palette`（3〜4色、危険部だけ赤など意味付け）
- `text_strategy`（`image_text_max_words: 3` 以下、Remotion overlay へ正確テキスト分離）
- `layout_safety`（`keep_bottom_20_percent_empty: true`、`avoid_character_area: true`）
- `must_not_include`（実在ロゴ / 既存キャラ / 写真風人物 / 長文日本語 を最低限含む）
- `quality_bar`

`imagegen_prompt` は image_direction を `02_IMAGEGEN_PROMPT_PROMPT.md` の手順で展開して作る。本文には必ず「前景」「中景」「背景」「下部20%」「Remotion」「禁止」のキーワードを含める。

禁止：

- 白背景中央アイコン
- 汎用フラット図解
- 既存キャラ（霊夢/魔理沙/ずんだもん/めたん）の生成
- 全シーン同じ構図 / 同じ visual_type の連続使用
- 台本の会話と無関係な素材
- 同一プロンプトで生成した画像を 2 シーン以上で使い回す

機械ゲート：

- `node scripts/audit-image-prompts.mjs <episode_id>` で生成前 prompt 監査（FAIL なら `run-codex-imagegen-pwsh.mjs` が abort）
- `node scripts/validate-image-direction.mjs <episode_id>` で軽量 lint
- `node scripts/audit-generated-images.mjs <episode_id>` で生成後画像メタ監査（PNG サイズ/解像度/重複/`meta.json` 必須フィールド）
- 緊急バイパスは `YUKKURI_SKIP_IMAGE_GATE=1` のみ。サイレント設定禁止

画像生成前後に監査し、汎用アイコン素材に見える場合は再生成ではなく構図から作り直す。

## Codex Asset Rule

Codexで画像生成スキルが使える場合は、上記 Yukkuri / Zundamon Image Direction Rule に従って image_direction → imagegen_prompt を作り、image gen で動画用の挿入画像を生成する。

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
3. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md` を読む
4. `01_plan_prompt.md` で構成を作る
5. `02_draft_prompt.md` で初稿（`script/{episode_id}/script.md`）を作る
6. `03_audit_prompt.md` で監査し、必要なら `04_rewrite_prompt.md` で差分修正
7. PASS 後に `05_yaml_prompt.md` で `script.yaml` を生成する
8. 素材生成方法を選ぶ
    - Codex: image gen（`yukkuri-codex-imagegen` skill）
    - Claude Code / image genなし: NotebookLM
9. 生成素材を確認し、画像挿入ポイントと画像パスを台本に反映する
10. `02_演出編集プロンプト.md` に従って演出加工する
11. **動画生成は `npm run render:episode -- <episode_id>` （または `node scripts/render-episode.mjs <episode_id>`）一発で実行する**。これが gate → audit → lint → validate → build → composition → remotion render を一括で行う正規入口。直接 `build-episode` / `npx remotion` を叩いて bypass しない。

部分実行が必要な場合のみ、以下の個別コマンドを使う：

- `node scripts/validate-script-generation-route.mjs <episode_id>` — prompt pack 経由ゲート
- `node scripts/audit-script-quality.mjs <episode_id>` — 機械監査
- `node scripts/lint-script-pre.mjs <episode_id>` — プリチェック
- `node scripts/validate-episode-script.mjs <episode_id>` — 非破壊チェック
- `node scripts/build-episode.mjs <episode_id>` — 音声・尺・render JSON 生成（冒頭で gate を再呼出するので bypass 不可）
- `node scripts/generate-episode-compositions.mjs` — Composition 登録
- `npx remotion render src/index.ts Video-<episode_id> out/videos/<episode_id>.mp4` — 最終 MP4 生成

## Completion Criteria

完了扱いにするには、次を満たす。

- 台本が選択テンプレートの表示枠に対応している
- 字幕がテンプレートの字幕枠に収まる前提で短く分割されている
- サブコンテンツエリアの有無に応じて素材配置が変わっている
- 画像挿入ポイントと画像パスが台本に入っている
- `script.yaml` は `Scene01`〜`Scene21`、`main.asset` / `sub.asset`、25文字以内セリフの制約を満たしている
- 演出加工済み台本が `02_演出編集プロンプト.md` の方針に沿っている
- `script/{episode_id}/script.md` が prompt pack 02_draft 経由で生成されている
- `node scripts/validate-script-generation-route.mjs <episode_id>` が PASS している
- `node scripts/audit-script-quality.mjs <episode_id>` が PASS している
- 動画生成まで依頼された場合は、出力ファイルまたは失敗理由を明示する
