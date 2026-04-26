# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex\notebookLM\workspace\projects\sleep-phone-habit\zundamon\script\script_v1.md
- notebook_title: sleep-phone-habit-zundamon
- notebook_id: 6554c3e8-a6ee-4ff1-a710-26bbbe53dd65

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create sleep-phone-habit-zundamon
- nlm source add 6554c3e8-a6ee-4ff1-a710-26bbbe53dd65 --file C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex\notebookLM\workspace\projects\sleep-phone-habit\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): 寝る前スマホで脳が起きる全体像
- INFO:1 (infographic): 眠気の流れとスマホ刺激の関係
- INFO:2 (infographic): 通知から確認へ進む習慣ループ
- MAP:1 (mind_map): 光、通知、感情、習慣の関係図
- INFO:3 (infographic): 枕元からスマホを離す対策図
- SLIDE:1 (slide_deck): 光より習慣、意思より設計の3点まとめ
