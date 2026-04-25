$ErrorActionPreference = "Stop"

Write-Host "== NotebookLM CLI / MCP セットアップ =="

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "uv が見つかりません。先に uv をインストールしてください。"
    exit 1
}

uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp

Write-Host "完了。Claude Code 側でこのフォルダを開いてください。"
