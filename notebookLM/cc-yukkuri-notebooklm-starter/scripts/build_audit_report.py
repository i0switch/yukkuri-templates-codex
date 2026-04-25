#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys
from datetime import datetime


SCENE_ID_RE = re.compile(r'^\s*-\s*scene_id:\s*"?(?P<id>\d+)"?\s*$', re.MULTILINE)
TITLE_RE = re.compile(r'^\s*scene_title:\s*"?(?P<title>[^"\n]+)"?\s*$')


def parse_manifest(text: str) -> list[tuple[str, str]]:
    scenes: list[tuple[str, str]] = []
    blocks = text.split("\n  - scene_id:")
    if len(blocks) <= 1:
        return scenes

    first = blocks[1:]
    for block in first:
        block = "- scene_id:" + block
        id_match = SCENE_ID_RE.search(block)
        title_match = TITLE_RE.search(block)
        if not id_match:
            continue
        scene_id = id_match.group("id").zfill(2)
        title = title_match.group("title").strip() if title_match else f"Scene {scene_id}"
        scenes.append((scene_id, title))
    return scenes


def main() -> int:
    parser = argparse.ArgumentParser(description="素材監査レポートの下地を作成します。")
    parser.add_argument("--manifest", required=True, help="asset_manifest.yaml のパス")
    args = parser.parse_args()

    manifest_path = Path(args.manifest).resolve()
    if not manifest_path.exists():
        print(f"Manifest not found: {manifest_path}", file=sys.stderr)
        return 1

    text = manifest_path.read_text(encoding="utf-8")
    scenes = parse_manifest(text)
    if not scenes:
        print("manifest から scene を読めませんでした。", file=sys.stderr)
        return 1

    project_dir = manifest_path.parents[1]
    audit_dir = project_dir / "materials" / "audit"
    audit_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = audit_dir / f"audit_report_{timestamp}.md"

    lines = [
        "# 素材監査レポート",
        "",
        f"- 作成日時: {datetime.now().isoformat(timespec='seconds')}",
        f"- 対象案件: {project_dir.name}",
        "",
        "## 判定ルール",
        "- pass: そのまま採用候補",
        "- revise: 軽微修正で再利用可能",
        "- reject: 目的からズレており差し替え推奨",
        "",
    ]

    for scene_id, title in scenes:
        lines.extend(
            [
                f"## Scene {scene_id}: {title}",
                "",
                "- 判定:",
                "- 対象素材:",
                "- Scene との一致度:",
                "- 良い点:",
                "- 問題点:",
                "- 再生成指示:",
                "",
            ]
        )

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
