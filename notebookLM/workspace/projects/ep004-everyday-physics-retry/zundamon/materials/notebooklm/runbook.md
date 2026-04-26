# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep004-everyday-physics-retry\zundamon\script\script_v1.md
- notebook_title: ep004-everyday-physics-retry-zundamon
- notebook_id: a85a21ca-1f98-4842-9f0c-d29d9b8d4412

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create ep004-everyday-physics-retry-zundamon
- nlm source add a85a21ca-1f98-4842-9f0c-d29d9b8d4412 --file C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep004-everyday-physics-retry\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): 白背景に小さな物理アイコンを中央へ置き、周囲に6つの丸い点を並べたフラット図。青緑系で文字なし。
- INFO:5 (infographic): 細い線の束と上向きの青い流れを示す白背景フラット図。緑と青で文字なし。
- INFO:6 (infographic): コップと細い棒、下向き矢印と上向きの液体を示す白背景フラット図。青系で文字なし。
- INFO:7 (infographic): 細くなる管と伸びる青い流れを示す白背景フラット図。青系で文字なし。
- INFO:8 (infographic): 小さなノズルと青い霧、吸い上がる液体を示す白背景フラット図。青系で文字なし。
- INFO:9 (infographic): 回転する羽根の周囲に小さな泡を置いた白背景フラット図。青系で文字なし。
- INFO:10 (infographic): 夜空と地面、上向きの熱の流れを示す白背景フラット図。紺系で文字なし。
- SLIDE:1 (slide_deck): 6つの丸いアイコンを横並びにし、すべてに小さなチェック印を置いた白背景フラット図。緑強調で文字なし。
