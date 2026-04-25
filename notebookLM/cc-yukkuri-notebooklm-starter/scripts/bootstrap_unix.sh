#!/usr/bin/env bash
set -euo pipefail

echo "== NotebookLM CLI / MCP セットアップ =="

if ! command -v uv >/dev/null 2>&1; then
  echo "uv が見つかりません。先に uv をインストールしてください。"
  exit 1
fi

uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp

echo "完了。Claude Code 側でこのフォルダを開いてください。"
