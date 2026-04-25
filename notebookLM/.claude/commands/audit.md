---
description: style ごとの最終成果物を監査してレポート化
argument-hint: <slug> [style:yukkuri|zundamon|both]
---

# /audit

1. `workspace/projects/<slug>/<style>/script/script_v1.md` を読む。
2. `workspace/projects/<slug>/<style>/final/final_script_v1.md` を読む。
3. `workspace/projects/<slug>/<style>/state/run_state.json` を読む。
4. `workspace/projects/<slug>/<style>/materials/generated/` を読む。
5. `python scripts/build_audit_report.py --script "<script_path>" --final "<final_path>" --state "<state_path>" --assets-dir "<assets_dir>"` を実行する。
6. `materials/audit/audit_report_v1.md` を出力する。
7. `PASS / WARNING / FAIL` を確認し、必要なら retry marker と次コマンドをそのまま案内する。
