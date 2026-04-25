---
description: NotebookLM 素材生成・取得・最終台本マージ
argument-hint: <slug> [style:yukkuri|zundamon|both] [--retry <MARKER_ID>]
---

# /fetch-assets

1. 引数から slug / style / retry 対象を決める。
2. `run_state.json` を真実源として読む。
3. Notebook ID が未設定なら止まり、`/prepare-assets <slug>` を案内する。
4. `build_artifact_creation_plan()` で未解決 marker を抽出する。
5. retry 指定があるときは対象 marker だけ `mark_generation_requested()` して再生成する。
6. marker ごとに `nlm infographic create` / `nlm slides create` / `nlm mindmap create` / `nlm video create` を実行する。
7. `nlm studio status <notebook_id> --json` をポーリングして、target marker が terminal になるまで待つ。
8. 成功 artifact だけ `materials/generated/` に保存する。
9. `final/final_script_v1.md` を再生成する。
10. 失敗 marker は placeholder を残し、`reason` と `retry_count` を state に積む。
11. 完了時は `/audit <slug>` を案内する。
