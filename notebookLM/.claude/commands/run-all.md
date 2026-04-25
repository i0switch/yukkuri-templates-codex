---
description: 台本生成から監査まで一気通貫で実行
argument-hint: テーマ：<自由文> / スタイル：<yukkuri|zundamon|both> [/ 尺：<分>]
---

# /run-all

次の順で連続実行する。

1. `/generate-script`
2. `python scripts/run_all.py <slug> --style <style>`
3. その中で `/prepare-assets` → `/fetch-assets` → `/audit` 相当を順に回す

途中で `prepare-assets` が `needs_manual_recovery` を返した場合は、その場で止まり、`materials/notebooklm/runbook.md` を再開ガイドとして案内する。

成功時は style ごとの次を短く伝える。

- `final/final_script_v1.md`
- `materials/audit/audit_report_v1.md`
