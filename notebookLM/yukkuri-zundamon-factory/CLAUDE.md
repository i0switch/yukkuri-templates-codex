# CLAUDE.md — Claude Code メイン指示書

このファイルは Claude Code が最初に読むマスター指示書。
リュウドウがスラッシュコマンドを発行すると、対応する `workflows/` と `prompts/` を
読み込んで自律的に進めること。

---

## 🎯 プロジェクトの目的

ゆっくり解説（霊夢・魔理沙） / ずんだもん＆めたん解説の **台本生成** と
**NotebookLM を使った素材生成** を完全自動化する。

最終成果物：
1. `output/scripts/<slug>.md` — 台本（素材プレースホルダー埋め込み済み）
2. `output/assets/<slug>/` — NotebookLM から取得した素材
3. `output/final/<slug>.md` — 素材パス解決済みの最終台本
4. `output/final/<slug>-audit.md` — 品質監査レポート

---

## 🧭 基本原則（最優先）

1. **捏造禁止**：事実情報はテーマ側の資料 or 公開情報のみを根拠にする。
   推測・創作する場合は台本コメントで `// SPECULATION:` と明示。
2. **キャラ一貫性**：`config/characters.json` の口調ルールを厳守する。
3. **素材プレースホルダー必須**：視覚的に補強すべき箇所には必ず
   `[FIG:n]` `[INFO:n]` `[MAP:n]` `[SLIDE:n]` を埋める。
4. **自律ループ**：工程で失敗しても即停止せず、`workflows/00-autonomous-loop.md`
   のリトライ手順に従う。
5. **監査は最終段で必須**：`workflows/05-audit.md` の全チェックをパスするまで
   終了扱いにしない。

---

## 🗂️ 使うスラッシュコマンド

`.claude/commands/` に定義済み。下記の順に実行される想定。

| コマンド | 役割 | 読み込むワークフロー |
|---------|------|---------------------|
| `/generate-script` | テーマから台本生成 | `workflows/01-script-generation.md` |
| `/prepare-assets` | 台本からNotebookLM用ソース生成 | `workflows/02-notebooklm-upload.md` |
| `/fetch-assets` | NotebookLMで素材生成＆DL | `workflows/03-asset-generation.md` + `04-asset-download.md` |
| `/audit` | 監査レポート生成 | `workflows/05-audit.md` |
| `/run-all` | 上記を一気通貫 | `workflows/00-autonomous-loop.md` |

---

## 🧩 スタイルセレクション

`/generate-script` の引数で下記いずれかを指定：

- **ゆっくり解説** (`style: yukkuri`)
  - 雛形：`templates/yukkuri-template.md`
  - キャラ：霊夢・魔理沙
  - トーン：漫才調、ツッコミ＆ボケ構造
- **ずんだもん＆めたん** (`style: zundamon`)
  - 雛形：`templates/zundamon-metan-template.md`
  - キャラ：ずんだもん（進行）・四国めたん（解説）
  - トーン：フレンドリー解説、ずんだもんが素朴な疑問を出す

---

## 🛠️ NotebookLM MCP の前提

- MCP サーバー名：`notebooklm-mcp`
- セットアップ済みか確認 → `nlm setup list`
- 未セットアップなら → `nlm setup add claude-code` を実行
- 認証未済なら → `nlm login`

### 使う主要ツール

| MCP ツール | 用途 |
|-----------|------|
| `notebook_create` | テーマ別ノートブック作成 |
| `source_add` | 台本をテキストソースとして投入 |
| `studio_create` | インフォグラフィック / マインドマップ / スライド / 動画を生成 |
| `download_artifact` | 生成物をダウンロード |

詳細は `workflows/03-asset-generation.md` 参照。

---

## 📋 出力命名規則

スラッグ = テーマから生成する英数字＋ハイフンの短い識別子。
例：「PROTACによる標的タンパク質分解」→ `protac-tpd`

- 台本：`output/scripts/<slug>.md`
- 素材：`output/assets/<slug>/{fig,info,map,slide}_<n>.<ext>`
- 最終：`output/final/<slug>.md`
- 監査：`output/final/<slug>-audit.md`
- メタ：`output/final/<slug>-meta.json`（生成過程の記録）

---

## ⚠️ エラー時の対応

1. `nlm` コマンドが見つからない → `scripts/setup.sh` を実行
2. 認証エラー → `nlm login` で再認証
3. NotebookLM 生成失敗 → `workflows/00-autonomous-loop.md` のリトライ節
4. レート制限（無料枠50q/日） → 残タスクを `output/final/<slug>-retry.md` に記録して中断

---

## 📝 リュウドウの好み（内部ルール）

- 出力は Markdown / YAML / JSON 中心の構造化。
- 冗長な前置き禁止、情報密度重視。
- ギャル語・フレンドリー調は OK だが、台本・レポート本文はスタイル指定に従う。
- 説明には図解（Mermaid 等）を積極利用。
- 医療・薬理テーマは医師・薬剤師視点での専門解説を優先。

---

必ず上から順にコマンドを実行し、各工程完了時に `output/final/<slug>-meta.json`
を更新すること。
