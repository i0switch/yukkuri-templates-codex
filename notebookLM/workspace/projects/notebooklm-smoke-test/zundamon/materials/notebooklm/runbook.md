# NotebookLM runbook

- style: zundamon
- script: C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん\workspace\projects\notebooklm-smoke-test\zundamon\script\script_v1.md
- notebook_title: notebooklm-smoke-test-zundamon

## Preflight
- nlm login --check
- nlm setup list

## Upload
- nlm notebook create notebooklm-smoke-test-zundamon
- nlm source add <NOTEBOOK_ID> --file C:\Users\i0swi\OneDrive\デスクトップ\ゆっくり＆ずんだもん\workspace\projects\notebooklm-smoke-test\zundamon\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code

## Markers
- FIG:1 (infographic): カフェインがアデノシン受容体をふさぐ全体像
- INFO:1 (infographic): アデノシンとカフェインが受容体を取り合う図
- SLIDE:1 (slide_deck): カフェインで目が覚める仕組みの3ポイント
