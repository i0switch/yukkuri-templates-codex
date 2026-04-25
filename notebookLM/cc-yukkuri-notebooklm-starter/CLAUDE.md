# Claude Code 運用指示

## このリポジトリの目的

このリポジトリは、Claude Code を使って以下を半自律的に進めるための土台である。

1. テーマから解説台本を作る
2. 台本をシーン単位に分解する
3. シーンごとの必要素材を定義する
4. NotebookLM を使って図解・スライド・補助素材を生成する
5. 素材の適合性を監査し、差し戻し指示まで出す
6. ゆっくり版 / ずんだもん＆めたん版の両方を管理する

## 優先順位

1. `workspace/projects/<slug>/` 配下に成果物を残す
2. 既存ファイルを読んでから追記・更新する
3. 再現しやすい命名を使う
4. 途中経過ではなく、次に人間が触れるべきファイルを明確にする
5. 素材生成後は必ず監査ログを残す

## 初動ルール

新しいテーマが与えられたら、次の順で進める。

### A. 案件の有無を確認
- 対応する `workspace/projects/<slug>/` がなければ作る
- なければ `scripts/init_project.py` を使って初期化してよい

### B. 企画整理
- `project_brief.md` を埋める
- どちらの形式を作るか明記する
  - ゆっくり解説
  - ずんだもん＆めたん解説
  - 両方

### C. 台本生成
- `templates/yukkuri_script_template.md`
- `templates/zundamon_metan_script_template.md`
を参照しつつ、テーマに沿って台本を作る
- 台本は必ず `## Scene 01` 形式で区切る
- 各 Scene に次を含める
  - 目的
  - 話す内容
  - 感情 / ノリ
  - 想定素材
  - 画面上の見せ方メモ

### D. 素材計画
- 台本から `materials/asset_manifest.yaml` を作る
- 必須項目:
  - scene_id
  - scene_title
  - insert_timing
  - intent
  - asset_type
  - notebooklm_candidate
  - must_include
  - avoid
  - audit_points

### E. NotebookLM 連携
NotebookLM 連携は以下の優先順で行う。

#### 第1候補: MCP
NotebookLM MCP が使えるなら、可能な限り MCP を使う。

想定ツール:
- notebook_create
- source_add
- note_create / note_update
- studio_create
- studio_status
- download_artifact

#### 第2候補: CLI
MCP が使えないなら `nlm` CLI を検討する。
ただし、CLI の JSON 出力形式が環境によって確認できない場合は、無理に自動パースせず、人間に見せるコマンド列を生成する。

## NotebookLM の使い分け

### 基本戦略
- 全台本を 1 notebook に入れるだけで終わらせない
- 必要に応じて scene 群ごとに notebook を分ける
- 情報量が多いテーマでは notebook を分割する

### artifact の使い分け
- `infographic`: 1テーマ1枚の図解、概念説明、比較図
- `slide_deck`: シーンごとの静止画候補、構造化説明
- `report`: 事実整理、補助テキスト素材
- `video`: 動画の雰囲気確認用の補助素材

### 生成方針
各素材について、NotebookLM に入れる前に必ず以下を整理する。

- 何を説明する素材か
- どの Scene に入るか
- 視聴者がその素材で何を理解すべきか
- 絶対に入れるべきキーワード
- 入れてはいけない表現やズレ

## 監査ルール

素材生成後は必ず以下を行う。

1. `materials/audit/audit_report_*.md` を作る
2. 各素材を scene ごとに pass / revise / reject で判定する
3. 判定理由を書く
4. 再生成する場合は、差し戻しプロンプトを具体的に書く

### 監査観点
- Scene の意図と一致しているか
- 台本の主張を誤解させないか
- 重要語が落ちていないか
- 画面に入れる価値があるか
- 冗長でないか
- ずんだもん / ゆっくり系のテンポを阻害しないか
- 次のシーンへの接続を邪魔しないか

## 出力ルール

作業時は可能な限り、以下のファイルを更新対象にする。

- `project_brief.md`
- `research/research_notes.md`
- `script/*.md`
- `materials/asset_manifest.yaml`
- `materials/notebooklm/*.md`
- `materials/audit/*.md`

## 人間への返し方

進捗を伝えるときは、次の2点を短く伝える。

- 今わかったこと
- 次にやること

## 禁止事項

- シーン番号を崩す
- 素材の保存先をバラバラにする
- 監査ログなしで「完成」と言う
- NotebookLM の出力を無条件採用する
- テーマと無関係な演出を盛る
