---
name: yukkuri-notebooklm-orchestrator
description: Orchestrate per-style script generation, asset planning, NotebookLM execution, final merge, and audit inside workspace/projects/<slug>/.
---

# Yukkuri NotebookLM Orchestrator

## Hard Rules

1. Read the root `CLAUDE.md` first.
2. Operate only inside `workspace/projects/<slug>/`.
3. Treat `workspace/projects/<slug>/<style>/state/run_state.json` as the source of truth.
4. Prefer step mode unless the user explicitly requests `/run-all`.
5. Do not claim NotebookLM success unless state, generated files, final output, and audit agree.
6. If `nlm login --check` fails, stop and record the exact recovery command.
7. Fallback / placeholder images are not acceptable completion artifacts.

## Step Mode

Use the thin CLI wrapper from the `notebookLM` directory:

```powershell
python scripts/orchestrator.py <slug> status --style both
python scripts/orchestrator.py <slug> prepare --style yukkuri
python scripts/orchestrator.py <slug> fetch --style yukkuri
python scripts/orchestrator.py <slug> audit --style yukkuri
```

Use `--style zundamon` for the zundamon lane, or `--style both` only when both lanes are intentionally being advanced together.

## Retry Mode

When audit or state identifies one failed marker, retry only that marker:

```powershell
python scripts/orchestrator.py <slug> fetch --style yukkuri --retry INFO:3
python scripts/orchestrator.py <slug> audit --style yukkuri
```

If retry is blocked by English `marker.desc` or repeated NotebookLM rejection, run:

```powershell
python scripts/manual_intervention_helper.py --state workspace/projects/<slug>/<style>/state/run_state.json
```

Then ask the user to approve the desc rewrite or manual intervention. Do not create fallback cards.

## Run-All Mode

Only use run-all when explicitly requested:

```powershell
python scripts/orchestrator.py <slug> run-all --style both
```

`run-all` calls the existing prepare → fetch → audit flow and stops on manual recovery / blocked state.

## Completion Gate

Before reporting completion for a style, verify all of the following:

- `python scripts/orchestrator.py <slug> status --style <style>` shows no failed markers.
- `workspace/projects/<slug>/<style>/final/final_script_v1.md` exists.
- `workspace/projects/<slug>/<style>/materials/generated/` contains the referenced downloaded files.
- `workspace/projects/<slug>/<style>/materials/audit/audit_report_v1.md` exists and reports PASS.
- `run_state.json` stages for planning/upload/generation/download/audit are not blocked/failed.

If any check fails, report the exact blocked stage and the next command from state or audit.
