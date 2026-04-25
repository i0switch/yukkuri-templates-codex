$ErrorActionPreference = "Stop"
uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp
Write-Host "NotebookLM setup complete."
