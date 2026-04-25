from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.build_audit_report import build_audit_report
from scripts.fetch_assets import fetch_style_assets
from scripts.prepare_assets import prepare_style_assets


def _resolve_styles(project_dir: Path, style_arg: str) -> list[str]:
    if style_arg == "both":
        return [name for name in ("yukkuri", "zundamon") if (project_dir / name).exists()]
    return [style_arg]



def run_all_project(
    project_dir: Path,
    style_arg: str,
) -> dict[str, Any]:
    styles = _resolve_styles(project_dir, style_arg)
    completed_styles: list[str] = []
    results: list[dict[str, Any]] = []

    for style in styles:
        prepare_result = prepare_style_assets(
            project_dir=project_dir,
            style=style,
        )
        if prepare_result["needs_manual_recovery"]:
            return {
                "stopped": True,
                "reason": "manual_recovery",
                "results": results + [prepare_result],
                "completed_styles": completed_styles,
            }

        fetch_result = fetch_style_assets(project_dir=project_dir, style=style)
        if fetch_result["blocked"]:
            return {
                "stopped": True,
                "reason": fetch_result.get("reason", "blocked"),
                "results": results + [fetch_result],
                "completed_styles": completed_styles,
            }

        style_dir = project_dir / style
        script_path = style_dir / "script" / "script_v1.md"
        final_path = style_dir / "final" / "final_script_v1.md"
        state_path = style_dir / "state" / "run_state.json"
        assets_dir = style_dir / "materials" / "generated"
        audit_path = build_audit_report(script_path, final_path, state_path, assets_dir)

        results.append({
            "style": style,
            "prepare": prepare_result,
            "fetch": fetch_result,
            "audit_path": audit_path,
        })
        completed_styles.append(style)

    return {
        "stopped": False,
        "results": results,
        "completed_styles": completed_styles,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the unified NotebookLM pipeline end-to-end.")
    parser.add_argument("slug")
    parser.add_argument("--style", default="both", choices=["yukkuri", "zundamon", "both"])
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    project_dir = root / "workspace" / "projects" / args.slug
    result = run_all_project(
        project_dir=project_dir,
        style_arg=args.style,
    )
    if result["stopped"]:
        print(f"stopped: {result['reason']}")
    else:
        for style in result["completed_styles"]:
            print(f"completed: {style}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
