# Yukkuri NotebookLM Multi-Asset Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the unified NotebookLM project reliably generate, download, and merge multiple assets per yukkuri script so a real video-ready script can be produced from markers like `FIG`, `INFO`, `MAP`, and `SLIDE`.

**Architecture:** Keep `prepare_assets.py` and `fetch_assets.py` as thin runners, but move all real CLI-facing logic into `scripts/notebooklm_runner.py` so tests can cover parsing and state transitions without hitting the network. `prepare_assets.py` should perform real auth/setup/notebook/source checks, while `fetch_assets.py` should run multi-artifact create → poll → download → final-script merge using `run_state.json` as the single source of truth.

**Tech Stack:** Python 3.11, `unittest`, `notebooklm-mcp-cli`, existing state/manifest/final-script helpers, Markdown/JSON outputs.

---

## File Structure

### Modify
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py` — add real CLI execution helpers, command output parsers, polling helpers, and state update helpers for multiple artifacts
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/prepare_assets.py` — replace auth flags with real preflight execution and notebook/source creation flow
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/fetch_assets.py` — replace injected fake status/download inputs with real create/status/download orchestration for multiple markers
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/run_all.py` — keep orchestration aligned to the new runner return contracts
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md` — document the multi-asset real execution path and smoke-test workflow
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md` — align command docs with the real prepare runtime
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md` — align command docs with the real multi-asset fetch runtime
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md` — align command docs with the real stop/restart semantics

### Create
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_cli_runtime.py` — parser/polling/state tests for real CLI runtime helpers
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_yukkuri_multi_asset_smoke.py` — project-level smoke test for multi-marker yukkuri flow with mocked CLI boundaries

---

### Task 1: Harden NotebookLM runner for real CLI orchestration

**Files:**
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_cli_runtime.py`

- [ ] **Step 1: Write failing tests for command-output parsing and artifact planning**

```python
import unittest

from scripts.notebooklm_runner import parse_created_notebook_id, parse_created_artifact_id


class NotebookLmCliRuntimeTests(unittest.TestCase):
    def test_parse_created_notebook_id(self):
        output = "✓ Created notebook: demo\n  ID: abc-123\n"
        self.assertEqual(parse_created_notebook_id(output), "abc-123")

    def test_parse_created_artifact_id(self):
        output = "✓ Infographic generation started\n  Artifact ID: art-1\n"
        self.assertEqual(parse_created_artifact_id(output), "art-1")
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_notebooklm_cli_runtime.py" -v`
Expected: FAIL with `cannot import name 'parse_created_notebook_id'`.

- [ ] **Step 3: Implement minimal real-runtime helpers**

```python
def parse_created_notebook_id(output: str) -> str | None:
    for line in output.splitlines():
        if "ID:" in line:
            return line.split("ID:", 1)[1].strip()
    return None


def parse_created_artifact_id(output: str) -> str | None:
    for line in output.splitlines():
        if "Artifact ID:" in line:
            return line.split("Artifact ID:", 1)[1].strip()
    return None
```

- [ ] **Step 4: Extend the same file with the actual runtime helpers**

Add helpers with these responsibilities:
- run `nlm login --check` and return `True/False`
- run `nlm setup list` and treat Claude Code `?` as non-fatal when `claude mcp list` already shows `notebooklm-mcp`
- create notebook if missing and parse its ID from stdout
- upload the script source and parse the source success output
- create one artifact per marker and record `artifact_id`
- poll `nlm studio status --json` until all target markers reach terminal states
- download terminal artifacts with `--id <artifact-id>` (not positional artifact ID)

- [ ] **Step 5: Run the runtime-helper tests until they pass**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_notebooklm_cli_runtime.py" -v`
Expected: PASS

### Task 2: Make prepare-assets perform real preflight and upload

**Files:**
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/prepare_assets.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md`

- [ ] **Step 1: Write a failing test for real preflight branching**

```python
def test_prepare_style_assets_marks_blocked_when_preflight_fails(self):
    result = prepare_style_assets(project_dir=project_dir, style="yukkuri")
    self.assertTrue(result["needs_manual_recovery"])
```

- [ ] **Step 2: Run only the prepare-assets tests**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_prepare_assets.py" -v`
Expected: FAIL because `prepare_style_assets` still requires injected auth flags.

- [ ] **Step 3: Remove the fake flags and call the runtime helpers**

Change `prepare_style_assets(...)` so it:
- runs real auth/setup preflight
- writes `runbook.md` on failure with exact recovery commands
- creates the NotebookLM notebook when missing
- uploads `script_v1.md` with `--wait`
- writes the parsed notebook ID/title into state
- leaves `notebooklm_upload.status = blocked` only on genuine preflight/upload failure

- [ ] **Step 4: Run the prepare-assets tests until they pass**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_prepare_assets.py" -v`
Expected: PASS

### Task 3: Make fetch-assets handle multiple yukkuri markers end-to-end

**Files:**
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/fetch_assets.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_yukkuri_multi_asset_smoke.py`

- [ ] **Step 1: Write a failing yukkuri multi-marker smoke test**

```python
def test_yukkuri_multi_asset_flow_downloads_multiple_markers(self):
    result = fetch_style_assets(project_dir=project_dir, style="yukkuri")
    self.assertEqual(result["downloaded_ids"], ["FIG:1", "INFO:1", "SLIDE:1"])
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_yukkuri_multi_asset_smoke.py" -v`
Expected: FAIL because `fetch_style_assets` still depends on injected `status_payload` and fake downloaded IDs.

- [ ] **Step 3: Replace the injected fake inputs with real orchestration**

Implement `fetch_style_assets(...)` so it:
- builds artifact creation commands for every unresolved marker in the yukkuri script
- runs those commands and records parsed `artifact_id`s
- polls NotebookLM status until the target markers are `completed` or `failed`
- downloads every completed artifact to `materials/generated/`
- updates `run_state.json` for each marker and refreshes stage counts
- renders `final/final_script_v1.md` so successful markers become links and failures remain placeholders

- [ ] **Step 4: Run fetch-assets and yukkuri smoke tests until they pass**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_fetch_assets.py" -v`
Expected: PASS

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -p "test_yukkuri_multi_asset_smoke.py" -v`
Expected: PASS

### Task 4: Validate the real yukkuri multi-asset smoke flow and document it

**Files:**
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/run_all.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md`

- [ ] **Step 1: Add one real smoke scenario to the docs**

Document this operator path in `README.md`:
- initialize a project
- generate a yukkuri script with at least `FIG:1`, `INFO:1`, and `SLIDE:1`
- run `prepare_assets.py`
- run `fetch_assets.py`
- inspect `materials/generated/`, `final/final_script_v1.md`, and `state/run_state.json`

- [ ] **Step 2: Align run-all to the new prepare/fetch contracts**

Ensure `run_all.py` assumes:
- no injected auth flags in the long term
- prepare returns a recovery stop only for real preflight failures
- fetch returns concrete downloaded marker IDs and final path data

- [ ] **Step 3: Run the full test suite**

Run: `rtk python -m unittest discover -s "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests" -t "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" -v`
Expected: PASS

- [ ] **Step 4: Run one real yukkuri smoke execution**

Run these exact steps with a new smoke slug:
1. `rtk python "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/init_project.py" --title "yukkuri multi asset smoke" --theme "カフェインで目が覚める仕組み"`
2. write a yukkuri `script_v1.md` containing `FIG:1`, `INFO:1`, `SLIDE:1`
3. `rtk python "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/prepare_assets.py" yukkuri-multi-asset-smoke --style yukkuri`
4. `rtk python "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/fetch_assets.py" yukkuri-multi-asset-smoke --style yukkuri`

Expected: at least multiple artifacts are generated/downloaded into `materials/generated/`, and `final/final_script_v1.md` contains multiple resolved asset links.
