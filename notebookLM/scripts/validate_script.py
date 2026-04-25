from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path
from typing import Any

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", flags=re.DOTALL)
SCENE_RE = re.compile(r"^##\s+(.+?)（([0-9:–〜-]+)）$", flags=re.MULTILINE)
MARKER_RE = re.compile(r"^\[(FIG|INFO|MAP|SLIDE|VIDEO):(\d+)\]\s+(.+)$", flags=re.MULTILINE)
SPEAKER_RE = re.compile(r"^\*\*(.+?)\*\*：(.+)$")


def _root_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def _load_frontmatter(text: str) -> dict[str, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    payload: dict[str, str] = {}
    for raw_line in match.group(1).splitlines():
        if ":" not in raw_line:
            continue
        key, value = raw_line.split(":", 1)
        payload[key.strip()] = value.strip()
    return payload


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _speaker_runs(lines: list[tuple[str, str]]) -> list[tuple[str, int]]:
    runs: list[tuple[str, int]] = []
    current_speaker = None
    current_count = 0
    for speaker, _ in lines:
        if speaker == current_speaker:
            current_count += 1
            continue
        if current_speaker is not None:
            runs.append((current_speaker, current_count))
        current_speaker = speaker
        current_count = 1
    if current_speaker is not None:
        runs.append((current_speaker, current_count))
    return runs


def _parse_duration_target_min(frontmatter: dict[str, str]) -> float | None:
    raw_value = frontmatter.get("duration_target_min")
    if not raw_value:
        return None
    try:
        return float(raw_value)
    except ValueError:
        return None


def _split_sections(text: str) -> list[dict[str, Any]]:
    matches = list(SCENE_RE.finditer(text))
    sections: list[dict[str, Any]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        title = match.group(1).strip()
        sections.append({
            "title": title,
            "timing": match.group(2).strip(),
            "body": body,
            "marker_count": len(MARKER_RE.findall(body)),
        })
    return sections


def _build_speaker_alias_map(characters: dict[str, Any], pairing: list[str]) -> dict[str, str]:
    alias_map: dict[str, str] = {}
    for name in pairing:
        display_name = characters["characters"][name]["display_name"]
        alias_map[display_name] = display_name
        if display_name == "四国めたん":
            alias_map["めたん"] = display_name
    return alias_map


def validate_script(
    script_path: Path,
    *,
    quality_path: Path | None = None,
    characters_path: Path | None = None,
) -> dict[str, Any]:
    root = _root_dir()
    quality_path = quality_path or root / "config" / "quality-criteria.json"
    characters_path = characters_path or root / "config" / "characters.json"

    quality = _load_json(quality_path)
    characters = _load_json(characters_path)
    text = script_path.read_text(encoding="utf-8")
    frontmatter = _load_frontmatter(text)
    style = frontmatter.get("style")
    duration_target_min = _parse_duration_target_min(frontmatter)
    char_count = len(text)
    scenes = list(SCENE_RE.finditer(text))
    markers = list(MARKER_RE.finditer(text))
    sections = _split_sections(text)

    speaker_lines: list[tuple[str, str]] = []
    for raw_line in text.splitlines():
        match = SPEAKER_RE.match(raw_line.strip())
        if match:
            speaker_lines.append((match.group(1), match.group(2).strip()))

    errors: list[str] = []
    warnings: list[str] = []

    required_frontmatter = {"title", "style", "slug"}
    missing_frontmatter = sorted(required_frontmatter - set(frontmatter))
    if missing_frontmatter:
        errors.append(f"frontmatter に必須キーが不足しています: {', '.join(missing_frontmatter)}")

    if not style:
        errors.append("frontmatter の style がありません。")
    elif style not in {"yukkuri", "zundamon"}:
        errors.append(f"style が不正です: {style}")

    script_quality = quality["script_quality"]
    if char_count < int(script_quality["min_chars"]):
        errors.append(f"文字数不足です: {char_count} < {script_quality['min_chars']}")
    if char_count > int(script_quality["max_chars"]):
        errors.append(f"文字数超過です: {char_count} > {script_quality['max_chars']}")

    section_count = len(scenes)
    if section_count < int(script_quality["min_sections"]):
        errors.append(f"Scene 数が不足しています: {section_count} < {script_quality['min_sections']}")
    if section_count > int(script_quality["max_sections"]):
        errors.append(f"Scene 数が多すぎます: {section_count} > {script_quality['max_sections']}")

    marker_ids = [f"{match.group(1)}:{match.group(2)}" for match in markers]
    if len(marker_ids) < int(script_quality["min_markers"]):
        errors.append(f"マーカー数が不足しています: {len(marker_ids)} < {script_quality['min_markers']}")
    min_markers_per_minute = float(script_quality.get("min_markers_per_minute", 0))
    if duration_target_min and min_markers_per_minute > 0:
        required_markers = max(int(script_quality["min_markers"]), math.ceil(duration_target_min * min_markers_per_minute))
        if len(marker_ids) < required_markers:
            errors.append(f"尺に対してマーカー数が不足しています: {len(marker_ids)} < {required_markers}")
    mandatory_markers = set(script_quality["mandatory_markers"])
    missing_markers = sorted(mandatory_markers - set(marker_ids))
    if missing_markers:
        errors.append(f"必須マーカーが不足しています: {', '.join(missing_markers)}")

    long_form_threshold_min = float(script_quality.get("long_form_threshold_min", 0))
    long_form_min_markers = int(script_quality.get("long_form_min_markers_per_content_section", 0))
    if duration_target_min and duration_target_min >= long_form_threshold_min and long_form_min_markers > 0:
        for section in sections:
            title = section["title"]
            if title.startswith("ツカミ") or title.startswith("まとめ") or title.startswith("アウトロ"):
                continue
            if section["marker_count"] < long_form_min_markers:
                errors.append(
                    f"長尺台本では各本編セクションに最低 {long_form_min_markers} マーカー必要です: "
                    f"{title} は {section['marker_count']} 件"
                )

    if not speaker_lines:
        errors.append("話者行が見つかりません。`**話者**：セリフ` 形式が必要です。")

    if style:
        pairing = characters["pairings"].get(style, [])
        alias_map = _build_speaker_alias_map(characters, pairing)
        allowed_speakers = set(alias_map.values())
        banned_speakers = set(quality["character_consistency"][style]["banned_speakers"])

        normalized_speaker_lines = [(alias_map.get(speaker, speaker), line) for speaker, line in speaker_lines]
        found_speakers = {speaker for speaker, _ in normalized_speaker_lines}
        invalid_speakers = sorted({speaker for speaker, _ in speaker_lines if alias_map.get(speaker, speaker) not in allowed_speakers})
        if invalid_speakers:
            errors.append(f"style に合わない話者が含まれています: {', '.join(invalid_speakers)}")
        mixed_speakers = sorted(found_speakers & banned_speakers)
        if mixed_speakers:
            errors.append(f"禁止話者が混入しています: {', '.join(mixed_speakers)}")

        max_consecutive = int(script_quality["max_consecutive_lines_per_character"])
        for speaker, run_length in _speaker_runs(normalized_speaker_lines):
            if run_length > max_consecutive:
                errors.append(f"{speaker} の連続発話が多すぎます: {run_length} > {max_consecutive}")

        if style == "zundamon":
            first_person_required = quality["character_consistency"]["zundamon"]["zundamon_first_person_required"]
            zundamon_lines = [line for speaker, line in normalized_speaker_lines if speaker == "ずんだもん"]
            if zundamon_lines and not any(first_person_required in line for line in zundamon_lines):
                warnings.append(f"ずんだもんの一人称 `{first_person_required}` が見つかりませんでした。")

    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "style": style,
            "duration_target_min": duration_target_min,
            "char_count": char_count,
            "section_count": section_count,
            "marker_count": len(marker_ids),
            "marker_ids": marker_ids,
            "speakers": sorted({speaker for speaker, _ in speaker_lines}),
            "frontmatter": frontmatter,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a generated script against repo rules.")
    parser.add_argument("--script", required=True)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    result = validate_script(Path(args.script))
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("OK" if result["ok"] else "NG")
        for line in result["errors"]:
            print(f"ERROR: {line}")
        for line in result["warnings"]:
            print(f"WARNING: {line}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
