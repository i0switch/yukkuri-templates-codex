from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.notebooklm_runner import update_stage_status
from scripts.validate_script import validate_script


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _root_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def build_audit_report(script_path: Path, final_path: Path, state_path: Path, assets_dir: Path) -> Path:
    root = _root_dir()
    state = _load_json(state_path)
    quality = _load_json(root / "config" / "quality-criteria.json")
    validation = validate_script(script_path, quality_path=root / "config" / "quality-criteria.json", characters_path=root / "config" / "characters.json")
    final_text = final_path.read_text(encoding="utf-8") if final_path.exists() else ""
    style = state.get("style", "unknown")
    slug = state.get("slug", "unknown")
    markers = state.get("markers", [])

    errors: list[str] = list(validation["errors"])
    warnings: list[str] = list(validation["warnings"])
    marker_lines: list[str] = []
    retry_commands: list[str] = []

    if not final_path.exists():
        errors.append("最終台本 `final_script_v1.md` が存在しません。")

    min_size_bytes = int(quality["asset_quality"]["min_file_size_kb"]) * 1024
    fallback_count_max = int(quality["asset_quality"].get("fallback_count_max", 0))
    failed_markers = 0
    fallback_markers = 0
    downloaded_markers = 0

    for marker in markers:
        marker_id = marker["id"]
        status = marker.get("status", "pending")
        reason = marker.get("reason")
        local_path = marker.get("local_path")
        derived_local_paths = marker.get("derived_local_paths") or []
        marker_summary = f"- {marker_id}: {status}"
        if reason:
            marker_summary += f" ({reason})"

        if status == "downloaded":
            downloaded_markers += 1
            if reason and "fallback" in str(reason).lower():
                errors.append(f"{marker_id} は fallback 経由のため合格扱いにできません。NotebookLM 純正 artifact を取得してください。")
                fallback_markers += 1
            elif local_path and ("fallback" in str(local_path).lower() or "placeholder" in str(local_path).lower()):
                errors.append(f"{marker_id} の local_path が fallback / placeholder 由来です: {local_path}")
                fallback_markers += 1
            if not local_path:
                errors.append(f"{marker_id} は downloaded なのに local_path がありません。")
            else:
                asset_path = (final_path.parent / local_path).resolve()
                if not asset_path.exists():
                    errors.append(f"{marker_id} の生成ファイルが存在しません: {asset_path}")
                else:
                    if asset_path.stat().st_size < min_size_bytes:
                        warnings.append(f"{marker_id} のファイルサイズが小さすぎます: {asset_path.name}")
                expected_paths = derived_local_paths or [local_path]
                if not any(path in final_text for path in expected_paths):
                    errors.append(f"{marker_id} の local_path が final_script_v1.md に反映されていません。")
                if marker.get("kind") == "slide_deck" and not derived_local_paths:
                    warnings.append(f"{marker_id} は slide_deck ですが PNG 化された派生画像が state にありません。")
        elif status in {"failed_permanent", "download_failed"}:
            failed_markers += 1
            retry_commands.append(f"python scripts/fetch_assets.py {slug} --style {style} --retry {marker_id}")
            if marker.get("desc") and marker["desc"] not in final_text:
                warnings.append(f"{marker_id} の placeholder 説明が final_script_v1.md に見つかりません。")
        elif status not in {"completed"}:
            errors.append(f"{marker_id} は未完了状態です: {status}")
            retry_commands.append(f"python scripts/fetch_assets.py {slug} --style {style} --retry {marker_id}")

        marker_lines.append(marker_summary)

    total_markers = len(markers) or 1
    failed_ratio = failed_markers / total_markers
    if failed_ratio > float(quality["asset_quality"]["failed_marker_max_ratio"]):
        errors.append(
            f"失敗マーカー比率が閾値超過です: {failed_markers}/{total_markers} > {quality['asset_quality']['failed_marker_max_ratio']}"
        )
    elif failed_markers:
        warnings.append(f"失敗マーカーがあります: {failed_markers}/{total_markers}")

    if fallback_markers > fallback_count_max:
        errors.append(
            f"fallback マーカーが規定値を超過しています: {fallback_markers} > {fallback_count_max} "
            f"(NotebookLM 純正 artifact のみ合格)"
        )

    if not downloaded_markers:
        warnings.append("ダウンロード済み素材が 1 件もありません。")

    if errors:
        verdict = "FAIL"
    elif warnings:
        verdict = "WARNING"
    else:
        verdict = "PASS"

    if verdict == "PASS":
        next_commands = ["no action required"]
    else:
        next_commands = retry_commands or [
            f"python scripts/fetch_assets.py {slug} --style {style}",
            f"python scripts/build_audit_report.py --script {script_path} --final {final_path} --state {state_path} --assets-dir {assets_dir}",
        ]
    report_path = assets_dir.parent / "audit" / "audit_report_v1.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(
        "\n".join([
            "# 監査レポート",
            "",
            f"- **style**: {style}",
            f"- **slug**: {slug}",
            f"- **script**: {script_path}",
            f"- **final**: {final_path}",
            f"- **assets_dir**: {assets_dir}",
            f"- **総合判定**: {verdict}",
            "",
            "## 台本検証",
            *([f"- ERROR: {line}" for line in validation["errors"]] or ["- ERROR: なし"]),
            *([f"- WARNING: {line}" for line in validation["warnings"]] or ["- WARNING: なし"]),
            "",
            "## マーカー状況",
            *(marker_lines or ["- マーカーなし"]),
            "",
            "## 監査指摘",
            *([f"- ERROR: {line}" for line in errors] or ["- ERROR: なし"]),
            *([f"- WARNING: {line}" for line in warnings] or ["- WARNING: なし"]),
            "",
            "## 次に打つコマンド",
            *[f"- `{command}`" for command in next_commands],
        ]) + "\n",
        encoding="utf-8",
    )

    stage_status = "done" if verdict == "PASS" else "partial" if verdict == "WARNING" else "failed"
    next_action = "監査合格" if verdict == "PASS" else "report を見て retry を実行"
    update_stage_status(
        state_path,
        "audit",
        stage_status,
        last_error="; ".join(errors) if errors else None,
        next_action=next_action,
    )
    return report_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Build an audit report from generated artifacts.")
    parser.add_argument("--script", required=True)
    parser.add_argument("--final", required=True)
    parser.add_argument("--state", required=True)
    parser.add_argument("--assets-dir", required=True)
    args = parser.parse_args()
    report_path = build_audit_report(
        script_path=Path(args.script),
        final_path=Path(args.final),
        state_path=Path(args.state),
        assets_dir=Path(args.assets_dir),
    )
    print(f"Wrote: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
