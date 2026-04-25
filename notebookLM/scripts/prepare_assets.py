from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.build_asset_manifest import build_manifest
from scripts.notebooklm_runner import (  # noqa: E402
    NotebookLmCommandError,
    build_prepare_runbook,
    ensure_notebook,
    inspect_setup,
    run_auth_check,
    sync_markers_from_script,
    update_notebook_status,
    update_stage_status,
    upload_script_source,
)
from scripts.validate_script import validate_script  # noqa: E402


def _resolve_paths(project_dir: Path, style: str) -> dict[str, Path]:
    style_dir = project_dir / style
    return {
        "style_dir": style_dir,
        "script_path": style_dir / "script" / "script_v1.md",
        "state_path": style_dir / "state" / "run_state.json",
        "runbook_path": style_dir / "materials" / "notebooklm" / "runbook.md",
    }


def _write_runbook(runbook_path: Path, state_path: Path, script_path: Path, setup_summary: dict[str, Any] | None = None) -> None:
    runbook_path.parent.mkdir(parents=True, exist_ok=True)
    runbook_path.write_text(build_prepare_runbook(state_path, script_path, setup_summary=setup_summary), encoding="utf-8")


def prepare_style_assets(project_dir: Path, style: str) -> dict[str, Any]:
    paths = _resolve_paths(project_dir, style)
    script_path = paths["script_path"]
    state_path = paths["state_path"]
    runbook_path = paths["runbook_path"]

    validation = validate_script(script_path)
    if not validation["ok"]:
        update_stage_status(
            state_path,
            "script_generation",
            "blocked",
            last_error="; ".join(validation["errors"]),
            next_action="台本を修正して再生成し、validate_script を通す",
        )
        update_stage_status(
            state_path,
            "asset_planning",
            "blocked",
            last_error="; ".join(validation["errors"]),
            next_action=f"台本を修正して再度 /generate-script または validate_script を実行: {script_path.name}",
        )
        update_stage_status(
            state_path,
            "notebooklm_upload",
            "blocked",
            last_error="台本検証に失敗しました。",
            next_action="台本を修正後に /prepare-assets を再実行",
        )
        _write_runbook(runbook_path, state_path, script_path)
        return {
            "style": style,
            "needs_manual_recovery": True,
            "runbook_path": runbook_path,
            "reason": "invalid_script",
        }

    update_stage_status(
        state_path,
        "script_generation",
        "done",
        next_action="/prepare-assets の検証を通過",
    )
    build_manifest(script_path)
    sync_markers_from_script(state_path, script_path)
    update_stage_status(state_path, "asset_planning", "done", next_action="/fetch-assets に進んでよい状態です。")
    update_stage_status(state_path, "notebooklm_upload", "running", next_action="NotebookLM の notebook 作成と source upload を実行中")

    auth_summary = run_auth_check(cwd=project_dir)
    if not auth_summary["ok"]:
        update_stage_status(
            state_path,
            "notebooklm_upload",
            "blocked",
            last_error=auth_summary["stderr"] or auth_summary["stdout"] or "NotebookLM 認証確認に失敗しました。",
            next_action="`nlm login` を実行してから /prepare-assets を再実行",
        )
        _write_runbook(runbook_path, state_path, script_path)
        return {
            "style": style,
            "needs_manual_recovery": True,
            "runbook_path": runbook_path,
            "reason": "auth_failed",
        }

    setup_summary = inspect_setup(cwd=project_dir)
    if not setup_summary["ok"]:
        update_stage_status(
            state_path,
            "notebooklm_upload",
            "blocked",
            last_error=setup_summary["stderr"] or setup_summary["stdout"] or "NotebookLM setup list に失敗しました。",
            next_action="`nlm setup list` の失敗原因を直してから /prepare-assets を再実行",
        )
        _write_runbook(runbook_path, state_path, script_path, setup_summary=setup_summary)
        return {
            "style": style,
            "needs_manual_recovery": True,
            "runbook_path": runbook_path,
            "reason": "setup_failed",
        }

    next_action = "/fetch-assets を実行して素材生成に進む"
    if setup_summary["warnings"]:
        next_action = f"{next_action}。補足: {' / '.join(setup_summary['warnings'])}"

    try:
        notebook_id = ensure_notebook(state_path, cwd=project_dir)
        upload_script_source(state_path, script_path, cwd=project_dir)
        update_notebook_status(state_path, "ready", notebook_id=notebook_id, title=f"{project_dir.name}-{style}")
        update_stage_status(state_path, "notebooklm_upload", "done", next_action=next_action)
    except NotebookLmCommandError as exc:
        update_stage_status(
            state_path,
            "notebooklm_upload",
            "blocked",
            last_error=str(exc),
            next_action="runbook に記載された復旧コマンドを実行後、/prepare-assets を再試行",
        )
        _write_runbook(runbook_path, state_path, script_path, setup_summary=setup_summary)
        return {
            "style": style,
            "needs_manual_recovery": True,
            "runbook_path": runbook_path,
            "reason": "upload_failed",
        }

    _write_runbook(runbook_path, state_path, script_path, setup_summary=setup_summary)
    return {
        "style": style,
        "needs_manual_recovery": False,
        "runbook_path": runbook_path,
        "notebook_id": notebook_id,
        "setup_warnings": setup_summary["warnings"],
    }


def _resolve_styles(project_dir: Path, style_arg: str) -> list[str]:
    if style_arg == "both":
        return [name for name in ("yukkuri", "zundamon") if (project_dir / name).exists()]
    return [style_arg]


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare NotebookLM assets for one project style.")
    parser.add_argument("slug")
    parser.add_argument("--style", default="both", choices=["yukkuri", "zundamon", "both"])
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    project_dir = root / "workspace" / "projects" / args.slug
    results = []
    for style in _resolve_styles(project_dir, args.style):
        results.append(prepare_style_assets(project_dir=project_dir, style=style))

    for result in results:
        flag = "manual-recovery" if result["needs_manual_recovery"] else "ready"
        print(f"{result['style']}: {flag} -> {result['runbook_path']}")
    return 0 if all(not result["needs_manual_recovery"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
