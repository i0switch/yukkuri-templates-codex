# apply_instruction_files.ps1
# リポジトリルートで実行してください。
# このスクリプトは同じフォルダにある CLAUDE.md / AGENTS.md をルートへ上書きします。

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Get-Location

Copy-Item -Path (Join-Path $scriptDir "CLAUDE.md") -Destination (Join-Path $repoRoot "CLAUDE.md") -Force
Copy-Item -Path (Join-Path $scriptDir "AGENTS.md") -Destination (Join-Path $repoRoot "AGENTS.md") -Force

Write-Host "Updated CLAUDE.md and AGENTS.md" -ForegroundColor Green
Write-Host "Recommended checks:" -ForegroundColor Cyan
Write-Host "  npm run gate:prompt-pack"
Write-Host "  npm run test:script-prompt-pack-evidence"
