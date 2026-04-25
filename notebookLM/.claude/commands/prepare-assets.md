---
description: style ごとの Scene 分割と NotebookLM 投入準備を行う
argument-hint: <slug> [style:yukkuri|zundamon|both]
---

# /prepare-assets

1. 引数から slug と対象 style を決める。
2. 対象 style ごとに `workspace/projects/<slug>/<style>/script/script_v1.md` と `run_state.json` を読む。
3. `python scripts/validate_script.py --script "<script_path>"` を実行して台本契約を確認する。
4. `python scripts/build_asset_manifest.py --script "<script_path>"` を実行して `materials/manifest/asset_manifest.yaml` を生成する。
5. `sync_markers_from_script()` で marker を `run_state.json` に同期する。
6. `nlm login --check` を実行する。
7. `nlm setup list` を実行する。
8. 認証または setup に失敗したら `materials/notebooklm/runbook.md` を書き、復旧コマンドを残して止まる。
9. 通ったら Notebook title を `<slug>-<style>` に決め、必要なら `nlm notebook create` を実行する。
10. `nlm source add <notebook_id> --file <script_path> --wait` を実行する。
11. `stages.asset_planning` と `stages.notebooklm_upload` を更新し、`runbook.md` に実行内容を残す。
12. 完了時は `/fetch-assets <slug>` を案内する。
