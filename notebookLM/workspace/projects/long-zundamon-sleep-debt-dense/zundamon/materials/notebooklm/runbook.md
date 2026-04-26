# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\long-zundamon-sleep-debt-dense\zundamon\script\script_v1.md
- notebook_title: long-zundamon-sleep-debt-dense-zundamon
- notebook_id: cf966954-7c9e-405a-a901-204e91cc668b

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create long-zundamon-sleep-debt-dense-zundamon
- nlm source add cf966954-7c9e-405a-a901-204e91cc668b --file C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん Codex\workspace\projects\long-zundamon-sleep-debt-dense\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): 寝不足で判断が崩れる全体像
- INFO:1 (infographic): 寝不足日に出やすい判断ミス
- INFO:2 (infographic): 起床時間と睡眠圧の蓄積
- INFO:3 (infographic): アデノシンが眠気を強める流れ
- INFO:4 (infographic): 前頭前野の役割
- INFO:5 (infographic): 見積もりが甘くなる流れ
- INFO:6 (infographic): 確認工程を飛ばす連鎖
- INFO:7 (infographic): 不快刺激が増幅する
- INFO:8 (infographic): 目先報酬に流れる判断
- INFO:9 (infographic): マイクロスリープの瞬間
- INFO:10 (infographic): 自覚のズレの危険サイン
- INFO:11 (infographic): 立て直しの優先順位
- SLIDE:1 (slide_deck): 寝不足で判断が崩れる3要点
