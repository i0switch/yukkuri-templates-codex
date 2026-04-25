# AGENTS.md

## Purpose

このリポジトリでの Codex 用メイン指示書。
目的は、`workspace/projects/<slug>/` 配下で

1. ゆっくり解説台本
2. ずんだもん＆めたん解説台本
3. NotebookLM 素材生成
4. 最終台本への差し込み
5. 監査レポート作成

までを一貫して進めること。

## First Read Order

作業開始時は次の順で読む。

1. `AGENTS.md`
2. `README.md`
3. `CLAUDE.md`
4. `.claude/commands/*.md`
5. `templates/*.md`
6. `config/characters.json`
7. `config/quality-criteria.json`
8. `ゆっくり.txt`
9. `ずんだもん.txt`

## Operating Rules

- 本番対象はこのフォルダのみ。参照用の子フォルダは直接編集しない。
- 台本本文そのものはエージェントが生成する。SDK を埋め込んで自動生成 API を追加しない。
- `workspace/projects/<slug>/<style>/state/run_state.json` を唯一の真実源にする。
- NotebookLM 実行前に必ず `script_v1.md` を `python scripts/validate_script.py --script <path>` で検証する。
- NotebookLM の成功は、`run_state.json`、`materials/generated/`、`final/final_script_v1.md` の三点一致で判定する。
- `SLIDE` は PDF をそのまま終点にしない。ダウンロード後に PNG 化して動画素材として使える形まで持っていく。
- 図内テキストは原則日本語。英語寄りの素材が出たら再生成対象にする。
- `nlm login --check` や `nlm setup list` が失敗したら成功扱いにしない。`materials/notebooklm/runbook.md` に復旧手順を残して止まる。

## Files To Produce

- 案件共通:
  - `workspace/projects/<slug>/project_brief.md`
  - `workspace/projects/<slug>/request.yaml`
- style 別:
  - `script/script_v1.md`
  - `materials/manifest/asset_manifest.yaml`
  - `materials/notebooklm/runbook.md`
  - `materials/generated/*`
  - `final/final_script_v1.md`
  - `materials/audit/audit_report_v1.md`

## Execution Order

1. `/generate-script`
2. `/prepare-assets`
3. `/fetch-assets`
4. `/audit`

一気通貫なら `/run-all` を使う。

## Completion Criteria

完了は次を全部満たしたときだけ。

- `script_v1.md` が台本契約を満たす
- `run_state.json` の stage が実態と一致する
- ダウンロード済み素材が `materials/generated/` にある
- `final_script_v1.md` が marker 解決済み、または失敗 placeholder 付きで整合している
- `audit_report_v1.md` が生成済み
- 監査結果が `PASS` または、`WARNING/FAIL` の場合は retry コマンドが明記されている
