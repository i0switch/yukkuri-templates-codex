# 台本生成プロンプトパック

## 正本ルール

台本品質の正本は `00_MASTER_SCRIPT_RULES.md` です。
キャラ別ルール、参照動画型ルール、監査観点、テンプレート枠対応、画像素材ルールはこの1ファイルに統合しています。

旧プロンプトは `archive/` に退避済みです。通常運用では読まないでください。

## 実行順

1. `00_MASTER_SCRIPT_RULES.md`
2. `01_plan_prompt.md`
3. `02_draft_prompt.md`
4. `03_audit_prompt.md`
5. `04_rewrite_prompt.md`
6. `05_yaml_prompt.md`

## ファイル構成

- `00_MASTER_SCRIPT_RULES.md`
  - 台本生成の唯一の正本。
- `01_plan_prompt.md`
  - 企画、構成、テンプレート枠の使い方を決める。
- `02_draft_prompt.md`
  - プランをもとに会話台本の初稿を作る。
- `03_audit_prompt.md`
  - 台本を監査し、PASS / FAIL を出す。
- `04_rewrite_prompt.md`
  - 監査指摘をもとに問題箇所だけ直す。
- `05_yaml_prompt.md`
  - PASS済み台本を `script.yaml` へ変換する。
- `共通_テーマだけで作るための入力テンプレ.md`
  - ユーザー入力を整理するための補助テンプレート。
- `ClaudeCode_Codex用_実行指示.md`
  - Codex / Claude Code にフェーズ実行させるための短い運用指示。

## 運用原則

- ルールは `00_MASTER_SCRIPT_RULES.md` に集約する。
- 画像生成の詳細ルールは `_reference/image_prompt_pack/` も正準として読む。
- 実作業はフェーズ別に分ける。
- 監査で FAIL の場合、全体を作り直さず `04_rewrite_prompt.md` で該当箇所だけ直す。
- YAML変換は監査 PASS 後だけ行う。
- 画像素材は `image_direction` 作成、生成前監査、image gen生成、生成後監査の順で進める。
- 演出加工はこのパックではなく、上位の `02_演出編集プロンプト.md` に渡す。
