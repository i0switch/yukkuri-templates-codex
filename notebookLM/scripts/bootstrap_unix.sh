#!/usr/bin/env bash
set -euo pipefail
uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp
echo "NotebookLM setup complete."
