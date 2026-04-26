from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def _is_japanese_text(text: str | None, threshold_ratio: float = 0.4) -> bool:
    if not text:
        return True
    cleaned = "".join(ch for ch in text if not ch.isspace())
    if not cleaned:
        return True
    japanese_count = sum(
        1
        for ch in cleaned
        if "぀" <= ch <= "ゟ"
        or "゠" <= ch <= "ヿ"
        or "一" <= ch <= "鿿"
    )
    return japanese_count / len(cleaned) >= threshold_ratio


def _load_state(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _desc_suggestion(marker: dict[str, Any]) -> str:
    marker_type = str(marker.get("type") or str(marker.get("id", "INFO:0")).split(":", 1)[0])
    desc = str(marker.get("desc") or "この場面の要点")
    if _is_japanese_text(desc):
        base = desc[:28]
    else:
        base = "この場面の要点を日本語で図解"
    if marker_type == "FIG":
        return f"{base}の全体像を一枚で示す"
    if marker_type == "INFO":
        return f"{base}を三項目以内で整理"
    if marker_type == "MAP":
        return f"{base}の関係を日本語で示す"
    if marker_type == "SLIDE":
        return f"{base}の重要点を三つに要約"
    if marker_type == "VIDEO":
        return f"{base}を短い説明動画で補足"
    return base


def build_report(state_path: Path) -> str:
    state = _load_state(state_path)
    slug = state.get("slug", state_path.parents[2].name if len(state_path.parents) > 2 else "<slug>")
    style = state.get("style", state_path.parents[1].name if len(state_path.parents) > 1 else "<style>")
    markers = state.get("markers", [])
    failed_statuses = {"failed_permanent", "download_failed"}
    failed = [marker for marker in markers if marker.get("status") in failed_statuses]
    invalid_desc = [marker for marker in markers if not _is_japanese_text(str(marker.get("desc") or ""))]

    lines = [
        "# NotebookLM 手動介入ガイド",
        "",
        f"- slug: {slug}",
        f"- style: {style}",
        f"- state: {state_path}",
        "",
        "## 失敗中 marker",
    ]
    if not failed:
        lines.append("- なし")
    for marker in failed:
        marker_id = marker.get("id", "?")
        lines.extend([
            f"- {marker_id}: {marker.get('status', 'unknown')}",
            f"  - reason: {marker.get('reason') or '未記録'}",
            f"  - current_desc: {marker.get('desc') or '未記録'}",
            f"  - desc_fix_candidate: {_desc_suggestion(marker)}",
            f"  - retry: python scripts/fetch_assets.py {slug} --style {style} --retry {marker_id}",
        ])

    lines.extend(["", "## 日本語 desc 要修正"])
    if not invalid_desc:
        lines.append("- なし")
    for marker in invalid_desc:
        marker_id = marker.get("id", "?")
        lines.extend([
            f"- {marker_id}: {marker.get('desc') or '未記録'}",
            f"  - desc_fix_candidate: {_desc_suggestion(marker)}",
        ])

    lines.extend([
        "",
        "## 方針",
        "- fallback / placeholder 画像は採用しない",
        "- marker.desc は日本語主体に直してから retry する",
        "- NotebookLM 純正 artifact を取得できた marker だけ downloaded にする",
    ])
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build manual intervention guidance for failed NotebookLM markers.")
    parser.add_argument("--state", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()

    report = build_report(Path(args.state).resolve())
    if args.output:
        output_path = Path(args.output).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report, encoding="utf-8")
        print(f"Wrote: {output_path}")
    else:
        print(report, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
