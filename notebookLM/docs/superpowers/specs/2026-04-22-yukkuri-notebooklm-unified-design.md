# Unified Yukkuri + NotebookLM Factory Design

## Goal

`C:\Users\i0swi\Desktop\ゆっくり＆ずんだもん` を、Claude Code が次の流れを一貫して回せる単一プロジェクトに統合する。

1. テーマから `ゆっくり` / `ずんだもん＆めたん` 台本を生成する
2. 台本ごとにシーン分割・素材挿入箇所・NotebookLM 向け要求を整理する
3. NotebookLM を使って図解 / スライド / マインドマップ / 動画を生成・取得する
4. 生成素材を台本意図と突き合わせて監査し、再生成指示まで残す
5. 日常運用では段階実行と一発完走の両方を選べるようにする

## Existing Assets To Reuse

### Reuse from `cc-yukkuri-notebooklm-starter`
- `scripts/init_project.py` — 案件ひな形作成
- `scripts/build_asset_manifest.py` — Scene 分割と素材台帳生成の土台
- `scripts/build_audit_report.py` — 監査レポート下地生成
- `templates/project_brief.template.md` — 案件概要
- `templates/script_request.template.yaml` — 入力要求の構造化
- `templates/asset_manifest.schema.yaml` — 素材台帳のキー構造
- `scripts/bootstrap_windows.ps1`, `scripts/bootstrap_unix.sh` — セットアップ導線
- `.env.example`, `pyproject.toml`, `.gitignore` — 低依存な Python 土台

### Reuse from `yukkuri-zundamon-factory`
- `.claude/commands/*.md` — Claude Code の入口設計
- `workflows/00-05` — 生成・取得・監査フローの責務分割
- `prompts/script-generation-prompt.md` — 台本生成ルール
- `prompts/asset-request-prompt.md` — NotebookLM Studio 要求テンプレ
- `prompts/audit-prompt.md` — 監査の判定テンプレ
- `templates/asset-marker-spec.md` — マーカー規約
- `templates/yukkuri-template.md`, `templates/zundamon-metan-template.md` — スタイル別台本雛形
- `config/characters.json`, `config/asset-types.json`, `config/quality-criteria.json` — キャラ・素材・品質基準
- `scripts/setup.sh`, `scripts/check-deps.sh`, `scripts/nlm-helpers.sh` — セットアップと CLI 前提の知見
- `examples/` — テーマ例と出力形式例

### Reuse from top-level notes
- `ゆっくり.txt` — ゆっくり話法・構成の元資料
- `ずんだもん.txt` — ずんだもん＆めたん話法・構成の元資料

これらは削除せず、統合版実装の参照元として残す。

## Key Decisions

1. **新規統合ルートを本番とする**
   - 既存 2 サブプロジェクトはそのまま残し、ルート直下に新しい統合版を作る
   - 破壊的な移動や削除は行わない

2. **案件は `workspace/projects/<slug>/` で管理する**
   - style ごとに出力や state が衝突しないよう、各案件の中で `yukkuri/` と `zundamon/` を分ける

3. **NotebookLM 実行は CLI 本命、MCP は接続性のために併設する**
   - 実ワークフローは `notebooklm-mcp-cli` の `nlm` コマンドに寄せる
   - `mcp.json` は Claude Code / 他ツールに NotebookLM MCP を接続しやすくするために置く
   - 日常自動化は CLI ベースなので、MCP ツール名の揺れに依存しない

4. **素材計画は style ごとに分ける**
   - 同一テーマでも `ゆっくり` と `ずんだもん` はセリフ運びと挿入位置が違う
   - そのため asset manifest・NotebookLM notebook・audit report は style 単位で持つ
   - 同一テーマで素材を使い回す最適化は初期実装ではやらない

5. **段階実行を本命にしつつ `/run-all` も提供する**
   - 通常運用は段階実行で復旧しやすくする
   - `/run-all` は同じ処理系を順につなぐ薄いオーケストレータにする

## Unified Project Layout

```text
C:\Users\i0swi\Desktop\ゆっくり＆ずんだもん\
├─ CLAUDE.md
├─ mcp.json
├─ pyproject.toml
├─ .env.example
├─ .gitignore
├─ .claude/
│  ├─ commands/
│  │  ├─ generate-script.md
│  │  ├─ prepare-assets.md
│  │  ├─ fetch-assets.md
│  │  ├─ audit.md
│  │  └─ run-all.md
│  └─ skills/
│     └─ yukkuri-notebooklm-orchestrator/
│        └─ SKILL.md
├─ config/
│  ├─ characters.json
│  ├─ asset-types.json
│  └─ quality-criteria.json
├─ templates/
│  ├─ project_brief.template.md
│  ├─ script_request.template.yaml
│  ├─ yukkuri-template.md
│  ├─ zundamon-metan-template.md
│  └─ asset-marker-spec.md
├─ prompts/
│  ├─ script-generation-prompt.md
│  ├─ asset-request-prompt.md
│  └─ audit-prompt.md
├─ scripts/
│  ├─ init_project.py
│  ├─ build_asset_manifest.py
│  ├─ build_audit_report.py
│  ├─ resolve_script_markers.py
│  ├─ notebooklm_runner.py
│  ├─ bootstrap_windows.ps1
│  └─ bootstrap_unix.sh
├─ tests/
│  ├─ test_init_project.py
│  ├─ test_build_asset_manifest.py
│  ├─ test_resolve_script_markers.py
│  └─ test_notebooklm_runner.py
├─ workspace/
│  └─ projects/
│     └─ <slug>/
│        ├─ project_brief.md
│        ├─ request.yaml
│        ├─ research/
│        │  └─ research_notes.md
│        ├─ yukkuri/
│        │  ├─ script/
│        │  ├─ materials/
│        │  │  ├─ manifest/
│        │  │  ├─ notebooklm/
│        │  │  ├─ generated/
│        │  │  └─ audit/
│        │  ├─ final/
│        │  └─ state/
│        └─ zundamon/
│           ├─ script/
│           ├─ materials/
│           │  ├─ manifest/
│           │  ├─ notebooklm/
│           │  ├─ generated/
│           │  └─ audit/
│           ├─ final/
│           └─ state/
└─ docs/
   └─ superpowers/
      ├─ specs/
      └─ plans/
```

## Command UX

### `/generate-script`
Input:
- `テーマ: <自由文>`
- `スタイル: yukkuri | zundamon | both`
- optional `尺`

Behavior:
1. slug を決める
2. `workspace/projects/<slug>/` を作る（なければ）
3. `project_brief.md` と `request.yaml` を更新する
4. 指定 style ごとに台本を生成して `script/` に保存する
5. style ごとの `state/run_state.json` を初期化する

Output:
- `workspace/projects/<slug>/yukkuri/script/script_v1.md`
- `workspace/projects/<slug>/zundamon/script/script_v1.md`
- style に応じて片方または両方

### `/prepare-assets`
Input:
- `<slug>`
- optional `style: yukkuri | zundamon | both`

Behavior:
1. 台本を Scene 単位で split する
2. style ごとの `asset_manifest.yaml` を生成する
3. NotebookLM に渡す scene brief / runbook を生成する
4. `nlm login --check` と `nlm setup list` を確認する
5. 認証済みなら notebook 作成と source 追加まで自動実行する
6. 未認証なら手動復旧手順を `runbook.md` に書いて止まる

### `/fetch-assets`
Input:
- `<slug>`
- optional `style`
- optional `--retry <MARKER_ID>`

Behavior:
1. state にある notebook 情報と manifest を読む
2. marker ごとに NotebookLM artifact を生成する
3. `nlm studio status --json` で状態を見る
4. 成功 artifact を `materials/generated/` に保存する
5. マーカーを解決した最終台本を `final/` に作る
6. 失敗 marker は placeholder を残し、state に reason を積む

### `/audit`
Behavior:
1. script / final / generated assets / state を読む
2. 構造・キャラ・marker・ファイル整合性を検査する
3. `audit_report_v1.md` を生成する
4. retry すべき marker や台本修正必要箇所を明示する

### `/run-all`
- `/generate-script` → `/prepare-assets` → `/fetch-assets` → `/audit` を順に呼ぶ
- 途中で手動復旧が必要になったら停止し、再開方法を state と report に残す

## Project Data Model

### `request.yaml`
案件の入力条件を保持する。
- theme
- audience
- duration
- formats
- must_cover
- avoid
- reference_urls

### `state/run_state.json`
style ごとの実行状態を保持する。

```json
{
  "slug": "sample-project",
  "style": "zundamon",
  "script_path": "workspace/projects/sample-project/zundamon/script/script_v1.md",
  "notebook": {
    "id": null,
    "title": null,
    "status": "pending"
  },
  "stages": {
    "script_generation": { "status": "done" },
    "asset_planning": { "status": "pending" },
    "notebooklm_upload": { "status": "pending" },
    "asset_generation": { "status": "pending" },
    "asset_download": { "status": "pending" },
    "audit": { "status": "pending" }
  },
  "markers": []
}
```

### `asset_manifest.yaml`
style ごとの Scene と素材要求を持つ。
- scene_id
- scene_title
- insert_timing
- intent
- narration_summary
- asset_type
- notebooklm_candidate
- must_include
- avoid
- audit_points
- retry_prompt_seed

## NotebookLM Integration Design

### Setup files
- `mcp.json`

```json
{
  "mcpServers": {
    "notebooklm-mcp": {
      "command": "notebooklm-mcp"
    }
  }
}
```

- `bootstrap_windows.ps1` / `bootstrap_unix.sh`
  - `uv tool install notebooklm-mcp-cli`
  - `nlm login`
  - `claude mcp add --scope user notebooklm-mcp notebooklm-mcp`

### CLI command strategy
Use documented commands from `notebooklm-mcp-cli`:
- `nlm notebook create`
- `nlm source add`
- `nlm infographic create`
- `nlm slides create`
- `nlm mindmap create`
- `nlm video create`
- `nlm studio status --json`
- `nlm download infographic|slide-deck|mind-map|video`

### Notebook naming
- one NotebookLM notebook per project-style pair
- title pattern: `<slug>-<style>`

### Recovery policy
Only two manual recovery paths are allowed:
1. authentication expired → run `nlm login`
2. MCP/CLI registration missing → run `nlm setup add claude-code` or `claude mcp add --scope user notebooklm-mcp notebooklm-mcp`

Everything else should be expressed as:
- retry in script
- warning in state
- actionable runbook entry

## Style Handling

### Why styles are isolated
`ゆっくり` と `ずんだもん` は構造・話者・挿入テンポが違うため、次を style ごとに完全分離する。
- script
- asset manifest
- notebooklm runbook
- generated assets
- final merged script
- audit report
- run state

### What stays shared at project level
- `project_brief.md`
- `request.yaml`
- `research/research_notes.md`
- reference URLs and must-cover topics

## Error Handling

### Script stage
- invalid template/config path → hard fail
- malformed frontmatter or too few markers → regenerate in same command
- style-specific tone failure → rewrite only affected sections

### NotebookLM stage
- unauthenticated → stop and write manual step
- rate limit warning → mark state and stop before asset generation
- partial asset failures → continue, keep placeholders, expose retry targets

### Merge stage
- if an asset is missing, keep marker line and insert warning block instead of pretending success

### Audit stage
- FAIL for structural or character issues
- WARNING for partial asset failures or missing references
- PASS only when required checks succeed

## Testing Strategy

### Automated tests
- `test_init_project.py`
  - slug generation
  - project folder creation
  - style directory creation
- `test_build_asset_manifest.py`
  - Scene parsing
  - marker extraction
  - manifest output shape
- `test_resolve_script_markers.py`
  - marker-to-path replacement
  - failed marker placeholder insertion
- `test_notebooklm_runner.py`
  - correct CLI command construction
  - state updates for success / partial failure

### Smoke checks
- `python -m unittest discover -s tests -v`
- `python scripts/init_project.py --title ... --theme ...`
- `nlm login --check` when environment is prepared

Live NotebookLM generation is not part of offline test coverage. The code should make it easy to run a real smoke test, but should not fake a successful NotebookLM session.

## Scope Boundaries

### In scope
- unified root project scaffolding
- commands, templates, prompts, configs, scripts, tests
- NotebookLM CLI integration hooks
- MCP config sidecar
- project/style state management
- marker-based final merge and audit

### Out of scope for the first build
- asset reuse across styles
- browser automation fallback for NotebookLM
- media post-processing after download
- GUI front-end
- automatic git initialization

## Recommended Implementation Order

1. root scaffolding and copied/adapted config/template/prompt assets
2. project initialization and style-specific directory model
3. manifest builder and marker resolver
4. NotebookLM CLI runner and state updates
5. command docs and root CLAUDE.md
6. tests and smoke verification

## Migration Notes

- keep `cc-yukkuri-notebooklm-starter/` and `yukkuri-zundamon-factory/` untouched
- create the new unified assets at the root so the old folders remain a readable reference base
- absorb reusable content by copying/adapting, not by live-importing from the old folders at runtime
