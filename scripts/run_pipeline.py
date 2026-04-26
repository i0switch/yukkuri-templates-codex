#!/usr/bin/env python3
"""v2 pipeline orchestrator skeleton.

This runner records the v2 flow. Draft audit JSON generation was removed;
Codex review is scoped to script_final.md.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--episode", required=True, help="Episode directory, e.g. script/ep1201")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-image-generation", action="store_true")
    parser.add_argument("--human-review-required", action="store_true")
    return parser.parse_args()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_if_missing(path: Path, content: str, dry_run: bool) -> bool:
    if path.exists():
        return False
    if dry_run:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True


def main() -> int:
    args = parse_args()
    episode_dir = Path(args.episode)
    audits_dir = episode_dir / "audits"
    audits_dir.mkdir(parents=True, exist_ok=True)

    files = {
        "planning": episode_dir / "planning.md",
        "draft": episode_dir / "script_draft.md",
        "final": episode_dir / "script_final.md",
        "yaml": episode_dir / "script.yaml",
        "visual_plan": episode_dir / "visual_plan.md",
        "image_prompt": episode_dir / "image_prompt_v2.md",
        "report": audits_dir / "v2_pipeline_report.json",
        "summary": audits_dir / "v2_pipeline_summary.md",
    }

    created = []
    if write_if_missing(files["planning"], "# planning.md\n\nNOT_AVAILABLE: planning generation requires an LLM step.\n", args.dry_run):
        created.append(str(files["planning"]))
    if write_if_missing(files["draft"], "# script_draft.md\n\nNOT_AVAILABLE: script draft generation requires an LLM step.\n", args.dry_run):
        created.append(str(files["draft"]))
    if write_if_missing(files["final"], "# script_final.md\n\nNOT_AVAILABLE: final script requires Codex review of script_final.md.\n", args.dry_run):
        created.append(str(files["final"]))
    if write_if_missing(files["yaml"], "# script.yaml\n# NOT_AVAILABLE: YAML conversion requires script_final.md.\n", args.dry_run):
        created.append(str(files["yaml"]))
    if write_if_missing(files["visual_plan"], "# visual_plan.md\n\nNOT_AVAILABLE: visual planning requires script_final.md.\n", args.dry_run):
        created.append(str(files["visual_plan"]))
    if write_if_missing(files["image_prompt"], "# image_prompt_v2.md\n\nNOT_AVAILABLE: image prompt generation requires visual_plan.md.\n", args.dry_run):
        created.append(str(files["image_prompt"]))

    steps = []
    human_review_required = args.human_review_required

    if not files["final"].exists():
        steps.append({
            "step": "codex_review_script_final",
            "status": "NOT_AVAILABLE",
            "reason": "script_final.md missing",
            "target": str(files["final"]),
        })
        human_review_required = True
    else:
        steps.append({
            "step": "codex_review_script_final",
            "status": "REQUIRED",
            "target": str(files["final"]),
            "reason": "Codex review is scoped to script_final.md only; draft audit JSON is not generated",
        })

    if args.skip_image_generation or args.dry_run:
        steps.append({
            "step": "image_generation",
            "status": "NOT_AVAILABLE",
            "reason": "Skipped by --skip-image-generation or --dry-run",
        })
        human_review_required = True
    else:
        steps.append({
            "step": "image_generation",
            "status": "NOT_AVAILABLE",
            "reason": "No image generation adapter is implemented in run_pipeline.py",
        })
        human_review_required = True

    report = {
        "episode": str(episode_dir),
        "checked_at": utc_now(),
        "dry_run": args.dry_run,
        "skip_image_generation": args.skip_image_generation,
        "script_draft_audit": "REMOVED",
        "codex_review_target": str(files["final"]),
        "created_files": created,
        "steps": steps,
        "pass": False,
        "verdict": "NOT_READY",
        "human_review_required": human_review_required,
        "reason": "External generation/image services are not configured; pipeline skeleton records state only. Draft audit JSON is removed.",
    }

    if not args.dry_run:
        files["report"].write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        files["summary"].write_text(
            "# v2 Pipeline Summary\n\n"
            f"- episode: `{episode_dir}`\n"
            f"- verdict: `NOT_READY`\n"
            f"- human_review_required: `{str(human_review_required).lower()}`\n"
            f"- codex_review_target: `{files['final']}`\n"
            "- script_draft_audit: `REMOVED`\n"
            "- reason: External generation/image services are not configured.\n",
            encoding="utf-8",
        )

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
