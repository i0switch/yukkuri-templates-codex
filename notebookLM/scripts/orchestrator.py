from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.build_audit_report import build_audit_report
from scripts.fetch_assets import fetch_style_assets
from scripts.prepare_assets import prepare_style_assets
from scripts.run_all import run_all_project

STYLES = ("yukkuri", "zundamon")
STEPS = ("prepare", "fetch", "audit", "run-all", "status")


def _project_dir(slug: str) -> Path:
    project_dir = ROOT_DIR / "workspace" / "projects" / slug
    if not project_dir.exists():
        raise FileNotFoundError(f"project not found: {project_dir}")
    return project_dir


def _resolve_styles(project_dir: Path, style_arg: str) -> list[str]:
    if style_arg == "both":
        return [style for style in STYLES if (project_dir / style).exists()]
    return [style_arg]


def _state_path(project_dir: Path, style: str) -> Path:
    return project_dir / style / "state" / "run_state.json"


def _load_state(project_dir: Path, style: str) -> dict[str, Any]:
    path = _state_path(project_dir, style)
    if not path.exists():
        raise FileNotFoundError(f"run_state.json not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _audit_style(project_dir: Path, style: str) -> dict[str, Any]:
    style_dir = project_dir / style
    report_path = build_audit_report(
        script_path=style_dir / "script" / "script_v1.md",
        final_path=style_dir / "final" / "final_script_v1.md",
        state_path=style_dir / "state" / "run_state.json",
        assets_dir=style_dir / "materials" / "generated",
    )
    return {"style": style, "audit_path": str(report_path)}


def _status_style(project_dir: Path, style: str) -> dict[str, Any]:
    state = _load_state(project_dir, style)
    stages = state.get("stages", {})
    markers = state.get("markers", [])
    return {
        "style": style,
        "notebook_status": state.get("notebook", {}).get("status"),
        "stages": {name: stage.get("status") for name, stage in stages.items()},
        "markers": {
            "total": len(markers),
            "downloaded": sum(1 for marker in markers if marker.get("status") == "downloaded"),
            "failed": sum(1 for marker in markers if marker.get("status") in {"failed_permanent", "download_failed"}),
        },
    }


def run_step(slug: str, step: str, style_arg: str, retry_marker_id: str | None = None) -> dict[str, Any]:
    project_dir = _project_dir(slug)
    styles = _resolve_styles(project_dir, style_arg)
    if not styles:
        return {"slug": slug, "step": step, "results": [], "blocked": True, "reason": "no_styles"}

    if step == "run-all":
        result = run_all_project(project_dir=project_dir, style_arg=style_arg)
        return {"slug": slug, "step": step, **result}

    results: list[dict[str, Any]] = []
    blocked = False
    for style in styles:
        if step == "prepare":
            result = prepare_style_assets(project_dir=project_dir, style=style)
            blocked = blocked or bool(result.get("needs_manual_recovery"))
        elif step == "fetch":
            result = fetch_style_assets(project_dir=project_dir, style=style, retry_marker_id=retry_marker_id)
            blocked = blocked or bool(result.get("blocked"))
        elif step == "audit":
            result = _audit_style(project_dir, style)
        elif step == "status":
            result = _status_style(project_dir, style)
        else:
            raise ValueError(f"unknown step: {step}")
        results.append(result)

    return {"slug": slug, "step": step, "results": results, "blocked": blocked}


def main() -> int:
    parser = argparse.ArgumentParser(description="Orchestrate NotebookLM project steps without leaving workspace/projects/<slug>.")
    parser.add_argument("slug")
    parser.add_argument("step", choices=STEPS)
    parser.add_argument("--style", default="both", choices=["yukkuri", "zundamon", "both"])
    parser.add_argument("--retry")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    args = parser.parse_args()

    try:
        result = run_step(args.slug, args.step, args.style, retry_marker_id=args.retry)
    except (FileNotFoundError, ValueError) as exc:
        if args.json:
            print(json.dumps({"slug": args.slug, "step": args.step, "blocked": True, "error": str(exc)}, ensure_ascii=False, indent=2))
        else:
            print(f"blocked: {exc}")
        return 1

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2, default=str))
    else:
        for item in result.get("results", []):
            style = item.get("style", "unknown")
            if args.step == "status":
                print(f"{style}: notebook={item['notebook_status']} markers={item['markers']}")
            elif args.step == "audit":
                print(f"{style}: audit -> {item['audit_path']}")
            else:
                flag = "blocked" if item.get("blocked") or item.get("needs_manual_recovery") else "done"
                print(f"{style}: {flag}")
    return 1 if result.get("blocked") or result.get("stopped") else 0


if __name__ == "__main__":
    raise SystemExit(main())
