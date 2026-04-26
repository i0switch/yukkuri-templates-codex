#!/usr/bin/env python3
"""v2 image result audit skeleton.

The script intentionally does not PASS when OCR/Vision are unavailable.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


BANNED_META_TERMS = [
    "hook_type",
    "visual_type",
    "myth_vs_fact",
    "boke_or_reaction",
    "before_after",
    "scene_format",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--visual-plan", required=True)
    parser.add_argument("--meta")
    parser.add_argument("--out")
    return parser.parse_args()


def image_size(path: Path) -> dict:
    try:
        from PIL import Image  # type: ignore

        with Image.open(path) as image:
            return {"status": "OK", "width": image.width, "height": image.height}
    except ImportError:
        return {"status": "NOT_AVAILABLE", "reason": "Pillow is not installed"}
    except Exception as exc:  # pragma: no cover
        return {"status": "ERROR", "reason": str(exc)}


def count_japanese_words(text: str) -> int:
    return len(re.findall(r"[\u3040-\u30ff\u4e00-\u9fff]+", text))


def main() -> int:
    args = parse_args()
    image_path = Path(args.image)
    visual_plan_path = Path(args.visual_plan)
    issues = []
    warnings = []

    if not image_path.exists():
        issues.append({"code": "image_missing", "message": f"{image_path} does not exist"})
    if not visual_plan_path.exists():
        issues.append({"code": "visual_plan_missing", "message": f"{visual_plan_path} does not exist"})

    visual_text = visual_plan_path.read_text(encoding="utf-8") if visual_plan_path.exists() else ""
    banned_hits = [term for term in BANNED_META_TERMS if term in visual_text]
    if banned_hits:
        issues.append({"code": "abstract_meta_terms_in_plan", "terms": banned_hits})

    japanese_word_count = count_japanese_words(visual_text)
    if japanese_word_count > 120:
        warnings.append({"code": "visual_plan_japanese_dense", "count": japanese_word_count})

    size_result = image_size(image_path) if image_path.exists() else {"status": "NOT_RUN"}
    if size_result.get("status") == "ERROR":
        issues.append({"code": "image_open_failed", "reason": size_result.get("reason")})

    report = {
        "verdict": "FAIL",
        "pass": False,
        "image": str(image_path),
        "visual_plan": str(visual_plan_path),
        "meta": str(Path(args.meta)) if args.meta else None,
        "image_size": size_result,
        "ocr_status": "NOT_AVAILABLE",
        "vision_status": "NOT_AVAILABLE",
        "issues": issues,
        "warnings": warnings,
        "human_review_required": True,
        "reason": "OCR/Vision review is not configured; file existence alone cannot pass v2 image audit",
    }

    out_path = Path(args.out) if args.out else visual_plan_path.parent / "audits" / "audit_image_result.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
