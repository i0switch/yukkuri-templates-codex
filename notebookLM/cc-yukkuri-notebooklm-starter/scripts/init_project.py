#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import shutil
import sys
import textwrap


ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"
PROJECTS = ROOT / "workspace" / "projects"


def slugify(value: str) -> str:
    cleaned = []
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


def ensure_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="新規案件フォルダを初期化します。")
    parser.add_argument("--slug", help="案件スラッグ。未指定なら title から自動生成。")
    parser.add_argument("--title", required=True, help="案件タイトル")
    parser.add_argument("--theme", required=True, help="テーマ")
    args = parser.parse_args()

    slug = args.slug or slugify(args.title)
    project_dir = PROJECTS / slug
    project_dir.mkdir(parents=True, exist_ok=True)

    dirs = [
        project_dir / "research",
        project_dir / "script",
        project_dir / "materials" / "generated",
        project_dir / "materials" / "raw",
        project_dir / "materials" / "notebooklm",
        project_dir / "materials" / "audit",
        project_dir / "downloads",
        project_dir / "tmp",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)

    brief_template = (TEMPLATES / "project_brief.template.md").read_text(encoding="utf-8")
    brief_content = brief_template.replace("- slug:", f"- slug: {slug}")
    brief_content = brief_content.replace("- タイトル:", f"- タイトル: {args.title}")
    brief_content = brief_content.replace("- テーマ:", f"- テーマ: {args.theme}")
    ensure_file(project_dir / "project_brief.md", brief_content)

    ensure_file(
        project_dir / "research" / "research_notes.md",
        "# リサーチメモ\n\n- 参考URL\n- 競合の気づき\n- NotebookLM に入れたい補助情報\n",
    )
    ensure_file(
        project_dir / "materials" / "asset_manifest.yaml",
        (
            (TEMPLATES / "asset_manifest.schema.yaml")
            .read_text(encoding="utf-8")
            .replace("sample-project", slug)
            .replace("サンプル案件", args.title)
        ),
    )
    ensure_file(
        project_dir / "materials" / "notebooklm" / "runbook.md",
        "# NotebookLM 実行ランブック\n\n- ここに Claude Code が実行計画やコマンド列を書く\n",
    )
    ensure_file(
        project_dir / "script" / "README.md",
        textwrap.dedent(
            """\
            # script

            ここに台本を保存します。

            推奨ファイル名:
            - yukkuri_script_v1.md
            - zundamon_metan_script_v1.md
            """
        ),
    )

    print(f"Initialized project: {project_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
