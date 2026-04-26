# Yukkuri NotebookLM Runtime Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining executable runtime layer so `/prepare-assets`, `/fetch-assets`, and `/run-all` are backed by concrete Python entrypoints instead of command docs alone.

**Architecture:** Keep the existing helper-centric design. Add thin Python runners that orchestrate current helpers in `scripts/notebooklm_runner.py`, `scripts/build_asset_manifest.py`, `scripts/resolve_script_markers.py`, and `scripts/build_audit_report.py`. Preserve the current recovery contract: stop on auth/setup problems, write actionable runbooks, and keep `run_state.json` as the source of truth.

**Tech Stack:** Python 3.11, `unittest`, `notebooklm-mcp-cli`, existing root command docs, JSON/YAML/Markdown project outputs.

---

## File Structure

### Modify
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py` — keep pure state/command planning helpers focused on NotebookLM runtime bookkeeping
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md` — reflect the executable runner entrypoints
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md` — align with real runner path
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md` — align with real runner path
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md` — align with real runner path

### Create
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/prepare_assets.py` — concrete `prepare-assets` runtime
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/fetch_assets.py` — concrete `fetch-assets` runtime
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/run_all.py` — concrete top-level orchestrator
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_prepare_assets.py` — prepare-assets runner tests
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_fetch_assets.py` — fetch-assets runner tests
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_run_all.py` — run-all runner tests

---

### Task 1: Add the prepare-assets runtime entrypoint

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/prepare_assets.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_prepare_assets.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md`

- [ ] Write failing tests for marker sync, runbook output, notebook metadata update, and auth-stop behavior.
- [ ] Implement a thin runner that resolves style paths, builds the manifest, syncs markers into state, writes `materials/notebooklm/runbook.md`, and only marks `notebooklm_upload` as done when auth/setup are valid and notebook/source steps succeed.
- [ ] Run only the prepare-assets tests until they pass.
- [ ] Ask Codex to audit this phase before moving on.

### Task 2: Add the fetch-assets runtime entrypoint

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/fetch_assets.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_fetch_assets.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md`

- [ ] Write failing tests for artifact creation planning, status merge, download bookkeeping, retry targeting, and final script generation.
- [ ] Implement a thin runner that uses the existing helper plans, runs `nlm studio status --json`, updates marker states, downloads completed artifacts, writes the final script, and leaves placeholders for failures.
- [ ] Run only the fetch-assets tests until they pass.
- [ ] Ask Codex to audit this phase before moving on.

### Task 3: Add the run-all orchestrator and finish validation

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/run_all.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_run_all.py`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md`
- Modify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md`

- [ ] Write failing tests for stop-on-recovery semantics and end-to-end sequencing across generated slug/style outputs.
- [ ] Implement a small orchestrator that runs the existing steps in order and stops early when prepare-assets reports a manual recovery requirement.
- [ ] Run the full unified test suite.
- [ ] Ask Codex to audit the final phase and then apply any needed fixes.
