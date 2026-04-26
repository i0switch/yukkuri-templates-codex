from __future__ import annotations

import argparse
import re
from pathlib import Path

SCENE_RE = re.compile(r"^##\s+(.+?)（([0-9:–〜-]+)）$", flags=re.MULTILINE)
MARKER_RE = re.compile(r"^\[(FIG|INFO|MAP|SLIDE|VIDEO):(\d+)\]\s+(.+)$", flags=re.MULTILINE)


def _split_scenes(text: str) -> list[tuple[str, str, str, str]]:
    matches = list(SCENE_RE.finditer(text))
    scenes: list[tuple[str, str, str, str]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        header = match.group(1).strip()
        timing = match.group(2).strip()
        body = text[start:end].strip()
        title = header.split("：", 1)[-1].strip() if "：" in header else header
        scenes.append((str(idx + 1).zfill(2), title, timing, body))
    return scenes


def _primary_marker(scene_body: str) -> tuple[str, str]:
    marker_match = MARKER_RE.search(scene_body)
    if not marker_match:
        return "INFO", "infographic"
    marker_type = marker_match.group(1)
    return marker_type, {
        "FIG": "infographic",
        "INFO": "infographic",
        "MAP": "mind_map",
        "SLIDE": "slide_deck",
        "VIDEO": "video",
    }[marker_type]


def _visual_parameters(marker_type: str) -> dict[str, str]:
    return {
        "FIG": {"orientation": "landscape", "detail_level": "standard", "text_density": "low"},
        "INFO": {"orientation": "portrait", "detail_level": "standard", "text_density": "medium"},
        "MAP": {"orientation": "auto", "detail_level": "standard", "text_density": "medium"},
        "SLIDE": {"orientation": "portrait", "detail_level": "concise", "text_density": "low"},
        "VIDEO": {"orientation": "landscape", "detail_level": "standard", "text_density": "low"},
    }[marker_type]


def build_manifest(script_path: Path) -> Path:
    text = script_path.read_text(encoding="utf-8")
    scenes = _split_scenes(text)
    style_dir = script_path.parents[1]
    project_slug = script_path.parents[2].name
    manifest_path = style_dir / "materials" / "manifest" / "asset_manifest.yaml"

    lines = [
        "project:",
        f"  slug: {project_slug}",
        f"  style: {style_dir.name}",
        "",
        "assets:",
    ]

    for scene_id, scene_title, scene_timing, scene_body in scenes:
        summary = " ".join(line.strip() for line in scene_body.splitlines() if line.strip())[:120].replace('"', "'")
        marker_type, primary = _primary_marker(scene_body)
        visual = _visual_parameters(marker_type)
        lines.extend([
            f'  - scene_id: "{scene_id}"',
            f'    scene_title: "{scene_title}"',
            f'    insert_timing: "{scene_timing}"',
            '    intent: "このシーンで視聴者に理解させたい要点"',
            f'    narration_summary: "{summary}"',
            '    asset_type:',
            f'      - {primary}',
            '    notebooklm_candidate:',
            f'      primary: {primary}',
            '      secondary: report',
            '    visual_parameters:',
            f'      marker_type: {marker_type}',
            f'      orientation: {visual["orientation"]}',
            f'      detail_level: {visual["detail_level"]}',
            f'      text_density: {visual["text_density"]}',
            '    must_include:',
            f'      - "{scene_title}"',
            '    avoid:',
            '      - "台本の主張とズレる図解"',
            '      - "英語見出しや英語ラベル"',
            '      - "キャラ立ち位置に重なる構図"',
            '    audit_points:',
            '      - "Scene の主張と一致しているか"',
            '      - "一目で理解できるか"',
            '      - "図内テキストが日本語か"',
            '    retry_prompt_seed: "この Scene の要点が一目で伝わる日本語の単純構造に修正する"',
        ])

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return manifest_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Build an asset manifest from a script file.")
    parser.add_argument("--script", required=True)
    args = parser.parse_args()
    manifest_path = build_manifest(Path(args.script).resolve())
    print(f"Wrote: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
