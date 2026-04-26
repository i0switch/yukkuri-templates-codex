# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep004-everyday-physics\zundamon\script\script_v1.md
- notebook_title: ep004-everyday-physics-zundamon
- notebook_id: 0b817a43-ca06-4d7e-8075-46eb312ef411

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create ep004-everyday-physics-zundamon
- nlm source add 0b817a43-ca06-4d7e-8075-46eb312ef411 --file C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep004-everyday-physics\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): シャワーヘッドから水流が手のシルエットへ巻き付く白背景フラット図。水色中心で文字なし。
- INFO:1 (infographic): 中央に抽象的な物理アイコン、周囲に5つの丸い点を置いた白背景フラット図。青緑系で文字なし。
- INFO:2 (infographic): スプーンの裏側に水流が沿って流れる白背景フラット図。水色と銀色で文字なし。
- INFO:3 (infographic): 翼の断面の上面に風の流線が沿う白背景フラット図。青系で文字なし。実在機体なし。
- INFO:4 (infographic): タオルが水を吸い上げ、上向き矢印で水の移動を示す白背景フラット図。青系で文字なし。
- INFO:5 (infographic): 細い管の束の中を水が上昇する白背景フラット図。緑と青系で文字なし。
- INFO:6 (infographic): コップとストロー、外側から水面を押す大気圧の矢印を描いた白背景フラット図。青系で文字なし。
- INFO:7 (infographic): ホースの口が細く絞られ、水流が長く伸びる白背景フラット図。青系で文字なし。
- INFO:8 (infographic): 霧吹きノズルの断面で、速い空気流と下から吸い上がる液体を矢印で示す白背景フラット図。青系で文字なし。
- INFO:9 (infographic): 船のスクリュー周辺に小さな気泡が発生する白背景フラット図。青系で文字なし。危険な実験描写なし。
- INFO:10 (infographic): 夜空と地面、地面から宇宙へ熱が逃げる上向き矢印を置いた白背景フラット図。紺系で文字なし。
- SLIDE:1 (slide_deck): 5つの円形アイコンを横並びにし、1つに緑の丸印を付けた白背景フラット図。緑強調で文字なし。
