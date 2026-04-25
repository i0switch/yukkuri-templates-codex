#!/usr/bin/env bash
# Yukkuri × Zundamon Factory — 初期セットアップ

set -e

echo "🎬 Yukkuri × Zundamon Factory — セットアップ開始"
echo ""

# 1. Python & uv 確認
echo "[1/5] Python / uv の確認..."
if ! command -v python3 &> /dev/null; then
    echo "  ❌ python3 が見つかりません。Python 3.10+ をインストールしてください。"
    exit 1
fi
PY_VER=$(python3 --version | awk '{print $2}')
echo "  ✓ Python $PY_VER"

if ! command -v uv &> /dev/null; then
    echo "  ⚠️  uv が見つかりません。インストールを試みます..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi
echo "  ✓ uv $(uv --version)"

# 2. notebooklm-mcp-cli のインストール
echo ""
echo "[2/5] notebooklm-mcp-cli のインストール..."
if ! command -v nlm &> /dev/null; then
    uv tool install notebooklm-mcp-cli
else
    echo "  ✓ nlm 既にインストール済み ($(nlm --version 2>/dev/null || echo '?'))"
fi

# 3. Claude Code のMCPセットアップ
echo ""
echo "[3/5] Claude Code への MCP 登録..."
if command -v nlm &> /dev/null; then
    if nlm setup list 2>/dev/null | grep -q "claude-code"; then
        echo "  ✓ 既に登録済み"
    else
        echo "  → nlm setup add claude-code を実行..."
        nlm setup add claude-code || echo "  ⚠️  Claude Code が未インストール、または設定ファイルが見つかりません"
    fi
fi

# 4. NotebookLM 認証確認
echo ""
echo "[4/5] NotebookLM 認証状態..."
if nlm login --check &> /dev/null; then
    echo "  ✓ 認証済み"
else
    echo "  ⚠️  未認証です。後で手動で実行してください："
    echo "     $ nlm login"
fi

# 5. 出力ディレクトリ作成
echo ""
echo "[5/5] 出力ディレクトリ準備..."
mkdir -p output/scripts output/assets output/final
echo "  ✓ output/{scripts,assets,final} を準備"

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📖 次のステップ："
echo "  1. このディレクトリで Claude Code を起動:  $ claude"
echo "  2. Claude Code 内で台本を生成:  /generate-script テーマ：<お題> / スタイル：zundamon"
echo "  3. もしくは一気通貫:            /run-all テーマ：<お題> / スタイル：zundamon"
echo ""
echo "🔗 参考:"
echo "  - CLAUDE.md      (プロジェクト全体指示)"
echo "  - README.md      (クイックスタート)"
echo "  - examples/      (サンプルテーマ)"
