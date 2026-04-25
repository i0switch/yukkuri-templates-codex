# 🎬 Yukkuri × Zundamon Factory

ゆっくり霊夢・魔理沙 と ずんだもん・四国めたん の解説台本 & NotebookLM 素材を
Claude Code に自動生成させるためのプロジェクト土台。

## ✨ できること

1. **テーマを渡すだけで台本生成**
   - ゆっくり解説（霊夢・魔理沙）
   - ずんだもん＆めたん解説
2. **台本から素材プレースホルダーを自動抽出**
   - `[FIG:n]` `[INFO:n]` `[MAP:n]` `[SLIDE:n]` 形式
3. **NotebookLM MCP で素材自動生成 & 取得**
   - インフォグラフィック / マインドマップ / スライド / 動画
4. **素材の挿入箇所マッピング & 品質監査**
   - 欠落・重複・テーマ不一致を自動検知

## 🚀 クイックスタート

```bash
# 1. 依存インストール確認
bash scripts/setup.sh

# 2. Claude Code をこのディレクトリで起動
claude

# 3. Claude Code のセッションで以下を順に実行
> /generate-script テーマ：PROTACによる標的タンパク質分解の仕組み / スタイル：ずんだもん
> /prepare-assets
> /fetch-assets
> /audit
```

## 📂 ディレクトリ構成

```
.
├── CLAUDE.md                    # ← Claude Code のメイン指示書（最初に読む）
├── .claude/commands/            # スラッシュコマンド定義
├── templates/                   # 台本の雛形（ゆっくり / ずんだもん&めたん）
├── workflows/                   # 工程別ワークフロー（00〜05）
├── prompts/                     # 生成・監査用の再利用プロンプト
├── config/                      # キャラ設定・素材タイプ・品質基準
├── scripts/                     # セットアップ・ヘルパー
├── examples/                    # サンプルテーマ
└── output/
    ├── scripts/                 # 生成された台本
    ├── assets/                  # NotebookLM から取得した素材
    └── final/                   # マッピング済み最終台本
```

## 🔧 前提環境

- Claude Code（最新版）
- Python 3.10+（`uv` 推奨）
- `notebooklm-mcp-cli`（v0.2.0 以上）
- NotebookLM アカウント（無料 / Pro いずれも可）

## 📖 ドキュメント

- 全体指示 → [`CLAUDE.md`](./CLAUDE.md)
- 自律ループ → [`workflows/00-autonomous-loop.md`](./workflows/00-autonomous-loop.md)
- 雛形仕様 → [`templates/`](./templates/)
- 素材マーカー仕様 → [`templates/asset-marker-spec.md`](./templates/asset-marker-spec.md)

## 🔖 ライセンス

MIT
