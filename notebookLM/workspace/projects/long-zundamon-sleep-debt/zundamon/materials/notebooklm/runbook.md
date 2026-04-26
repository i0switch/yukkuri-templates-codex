# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\long-zundamon-sleep-debt\zundamon\script\script_v1.md
- notebook_title: long-zundamon-sleep-debt-zundamon
- notebook_id: 352d7f41-007d-41d9-81a0-724f27385ac3

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create long-zundamon-sleep-debt-zundamon
- nlm source add 352d7f41-007d-41d9-81a0-724f27385ac3 --file C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\long-zundamon-sleep-debt\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): 寝不足で判断が崩れる全体像
- INFO:1 (infographic): 睡眠圧とアデノシンの流れ
- INFO:2 (infographic): 前頭前野と判断力低下
- INFO:3 (infographic): 感情制御と報酬バイアス
- INFO:4 (infographic): マイクロスリープと自覚のズレ
- SLIDE:1 (slide_deck): 寝不足で判断が崩れる3要点
