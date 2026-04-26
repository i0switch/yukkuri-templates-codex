# CLAUDE.md

この repo で Claude Code が最初に読む運用指示。

## Goal

`workspace/projects/<slug>/` 配下で、次を style ごとに管理する。

1. 台本生成
2. 台本検証
3. NotebookLM への投入
4. 素材生成とダウンロード
5. 最終台本作成
6. 監査

## Priority

1. `run_state.json` を真実源として扱う
2. 台本はエージェントが直接生成する
3. NotebookLM 成功を勝手に仮定しない
4. 監査レポートなしで完了扱いにしない

## Required Reads For Script Generation

台本を作る前に必ず読む。

- `ゆっくり.txt`
- `ずんだもん.txt`
- `templates/yukkuri-template.md`
- `templates/zundamon-metan-template.md`
- `templates/asset-marker-spec.md`
- `config/characters.json`
- `config/quality-criteria.json`
- `prompts/script-generation-prompt.md`

## Commands

- `/generate-script`
  - `request.yaml` と `project_brief.md` を同期
  - `script_v1.md` を生成
  - `python scripts/validate_script.py --script <path>` で検証
  - `script_generation.status` を更新
- `/prepare-assets`
  - manifest 作成
  - marker 同期
- `nlm login --check`
- `nlm setup list`
- notebook 作成
- source upload
- `SLIDE` は取得後に PNG 化する
- `/fetch-assets`
  - marker ごとに artifact create
  - `nlm studio status --json` で待機
  - 成功物だけ保存
  - `final_script_v1.md` を生成
- `/audit`
  - script / final / state / generated を付き合わせてレポート化
- `/run-all`
  - 上記を順に呼ぶ

## State Rules

`workspace/projects/<slug>/<style>/state/run_state.json` は必ず次を持つ。

- `notebook.id`, `notebook.title`, `notebook.status`
- `stages.*.status`
- `stages.*.started_at`
- `stages.*.finished_at`
- `stages.*.last_error`
- `stages.*.next_action`
- `markers[].artifact_id`
- `markers[].status`
- `markers[].local_path`
- `markers[].reason`
- `markers[].retry_count`

## NotebookLM Rules

- 認証確認: `nlm login --check`
- setup 確認: `nlm setup list`
- Claude Code 未設定なら `nlm setup add claude-code`
- Codex は repo 直下 `mcp.json` を参照する前提
- 失敗時は `materials/notebooklm/runbook.md` に復旧手順を残す

## Output Rules

成果物は次に固定する。

- `script/script_v1.md`
- `materials/manifest/asset_manifest.yaml`
- `materials/notebooklm/runbook.md`
- `materials/generated/*`
- `final/final_script_v1.md`
- `materials/audit/audit_report_v1.md`

## Asset Language Rule

- 図内テキストは原則日本語
- 英語見出しや英語ラベルが出た素材は再生成候補

## Stop Conditions

次のどれかが起きたら成功扱いにせず止まる。

- 台本検証 NG
- `nlm login --check` 失敗
- `nlm setup list` 失敗
- notebook 作成失敗
- source upload 失敗

その場合は `run_state.json` と `runbook.md` に次アクションを書く。
