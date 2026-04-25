#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys
from typing import List, Tuple


SCENE_RE = re.compile(
    r"^##\s*Scene\s*(\d+)\s*[:：]?\s*(.*)$",
    flags=re.MULTILINE,
)


def split_scenes(text: str) -> List[Tuple[str, str, str]]:
    matches = list(SCENE_RE.finditer(text))
    scenes: List[Tuple[str, str, str]] = []
    for index, match in enumerate(matches):
        scene_id = match.group(1).zfill(2)
        title = (match.group(2) or "").strip() or f"Scene {scene_id}"
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        scenes.append((scene_id, title, body))
    return scenes


def summarize_body(body: str, limit: int = 120) -> str:
    compact = " ".join(line.strip() for line in body.splitlines() if line.strip())
    return compact[:limit] + ("..." if len(compact) > limit else "")


def main() -> int:
    parser = argparse.ArgumentParser(description="台本から asset_manifest.yaml を生成します。")
    parser.add_argument("--script", required=True, help="台本 Markdown のパス")
    args = parser.parse_args()

    script_path = Path(args.script).resolve()
    if not script_path.exists():
        print(f"Script not found: {script_path}", file=sys.stderr)
        return 1

    text = script_path.read_text(encoding="utf-8")
    scenes = split_scenes(text)
    if not scenes:
        print("Scene が見つかりません。`## Scene 01:` 形式で書いてください。", file=sys.stderr)
        return 1

    project_dir = script_path.parents[1]
    out_path = project_dir / "materials" / "asset_manifest.yaml"

    lines = [
        "project:",
        f"  slug: {project_dir.name}",
        f"  title: {project_dir.name}",
        "",
        "assets:",
    ]

    for scene_id, title, body in scenes:
        summary = summarize_body(body).replace('"', "'")
        lines.extend(
            [
                f'  - scene_id: "{scene_id}"',
                f'    scene_title: "{title}"',
                '    insert_timing: "TBD"',
                '    intent: "このシーンで視聴者に理解させたいことをここに書く"',
                f'    narration_summary: "{summary}"',
                "    asset_type:",
                "      - infographic",
                "      - slide_deck",
                "    notebooklm_candidate:",
                "      primary: infographic",
                "      secondary: slide_deck",
                "    must_include:",
                '      - "要点を1つ以上記入"',
                "    avoid:",
                '      - "避けたい誤解を記入"',
                "    audit_points:",
                '      - "Scene の主張と一致しているか"',
                '      - "1枚で伝わるか"',
                "    retry_prompt_seed: >",
                '      この Scene の目的に合うように、不要な要素を削り、重要概念が一目でわかる図解に修正する。',
            ]
        )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
