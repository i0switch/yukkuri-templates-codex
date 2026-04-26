# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\smoke-zundamon-caffeine\zundamon\script\script_v1.md
- notebook_title: smoke-zundamon-caffeine-zundamon
- notebook_id: d206f23e-484f-42a6-9107-ae06c61baf7b

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create smoke-zundamon-caffeine-zundamon
- nlm source add d206f23e-484f-42a6-9107-ae06c61baf7b --file C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\smoke-zundamon-caffeine\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): カフェインが眠気の信号を弱める全体像
- INFO:1 (infographic): アデノシン受容体がブロックされる仕組み
- INFO:2 (infographic): 覚醒感が出る理由と飲みすぎの限界
- SLIDE:1 (slide_deck): カフェインの仕組みと注意点の要点3つ
