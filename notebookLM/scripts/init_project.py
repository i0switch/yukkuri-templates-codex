from __future__ import annotations

import argparse
import json
from pathlib import Path


def _blank_stage() -> dict:
    return {
        "status": "pending",
        "started_at": None,
        "finished_at": None,
        "last_error": None,
        "next_action": None,
    }


def slugify(value: str) -> str:
    cleaned: list[str] = []
    prev_dash = False
    for ch in value.strip().lower():
        if ch.isalnum():
            cleaned.append(ch)
            prev_dash = False
        elif ch in {" ", "_", "-", "."}:
            if not prev_dash:
                cleaned.append("-")
                prev_dash = True
    slug = "".join(cleaned).strip("-")
    return slug or "new-project"


def _write_if_missing(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def _base_state(slug: str, style: str) -> dict:
    return {
        "slug": slug,
        "style": style,
        "script_path": None,
        "notebook": {"id": None, "title": None, "status": "pending"},
        "stages": {
            "script_generation": _blank_stage(),
            "asset_planning": _blank_stage(),
            "notebooklm_upload": _blank_stage(),
            "asset_generation": _blank_stage(),
            "asset_download": _blank_stage(),
            "audit": _blank_stage(),
        },
        "markers": [],
    }


def initialize_project(root: Path, title: str, theme: str) -> str:
    slug = slugify(title)
    project_dir = root / "workspace" / "projects" / slug

    shared_dirs = [
        project_dir / "research",
    ]
    style_dirs = []
    for style in ("yukkuri", "zundamon"):
        style_dirs.extend([
            project_dir / style / "script",
            project_dir / style / "materials" / "manifest",
            project_dir / style / "materials" / "notebooklm",
            project_dir / style / "materials" / "generated",
            project_dir / style / "materials" / "audit",
            project_dir / style / "final",
            project_dir / style / "state",
        ])

    for directory in [*shared_dirs, *style_dirs]:
        directory.mkdir(parents=True, exist_ok=True)

    _write_if_missing(
        project_dir / "project_brief.md",
        "\n".join([
            "# プロジェクト概要",
            "",
            f"- タイトル: {title}",
            f"- テーマ: {theme}",
            "- 形式: 両方",
            ""
        ]),
    )
    _write_if_missing(
        project_dir / "request.yaml",
        "\n".join([
            f"slug: {slug}",
            f"title: {title}",
            f"theme: {theme}",
            "audience: 初心者",
            "duration_minutes: 8",
            "formats:",
            "  - yukkuri",
            "  - zundamon",
            "must_cover:",
            "  - 基本概念",
            "  - よくある誤解",
            "  - 実践的なポイント",
            "avoid:",
            "  - 不必要に煽る表現",
            "  - 断定しすぎる表現",
            "reference_urls: []",
            "notes: >",
            "  style ごとに台本と素材計画を分けて管理する。",
            ""
        ]),
    )
    _write_if_missing(project_dir / "research" / "research_notes.md", "# research_notes\n")

    for style in ("yukkuri", "zundamon"):
        state_path = project_dir / style / "state" / "run_state.json"
        if not state_path.exists():
            state_path.write_text(
                json.dumps(_base_state(slug, style), ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
    return slug


def main() -> int:
    parser = argparse.ArgumentParser(description="Initialize a unified project workspace.")
    parser.add_argument("--title", required=True)
    parser.add_argument("--theme", required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    slug = initialize_project(root=root, title=args.title, theme=args.theme)
    print(f"Initialized project: {root / 'workspace' / 'projects' / slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
