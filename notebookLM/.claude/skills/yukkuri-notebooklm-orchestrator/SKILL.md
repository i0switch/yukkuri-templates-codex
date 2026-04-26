---
name: yukkuri-notebooklm-orchestrator
description: Orchestrate per-style script generation, asset planning, NotebookLM execution, final merge, and audit inside workspace/projects/<slug>/.
---

1. Read the root `CLAUDE.md` first.
2. Operate only inside `workspace/projects/<slug>/`.
3. Treat `workspace/projects/<slug>/<style>/state/run_state.json` as the source of truth.
4. Prefer step mode unless the user explicitly requests `/run-all`.
5. Do not claim NotebookLM success unless state, generated files, and final output agree.
6. If `nlm login --check` fails, stop and record the exact recovery command.
