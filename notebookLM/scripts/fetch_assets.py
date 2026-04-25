from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.notebooklm_runner import (  # noqa: E402
    NotebookLmCommandError,
    build_artifact_creation_plan,
    build_download_plan,
    download_generated_artifacts,
    mark_generation_requested,
    poll_studio_status,
    run_artifact_creation_plan,
    update_stage_status,
)
from scripts.resolve_script_markers import render_final_script  # noqa: E402


def _resolve_paths(project_dir: Path, style: str) -> dict[str, Path]:
    style_dir = project_dir / style
    return {
        "script_path": style_dir / "script" / "script_v1.md",
        "state_path": style_dir / "state" / "run_state.json",
        "generated_dir": style_dir / "materials" / "generated",
        "final_path": style_dir / "final" / "final_script_v1.md",
        "quality_path": ROOT_DIR / "config" / "quality-criteria.json",
    }


def _load_state(state_path: Path) -> dict[str, Any]:
    return json.loads(state_path.read_text(encoding="utf-8"))


def fetch_style_assets(
    project_dir: Path,
    style: str,
    retry_marker_id: str | None = None,
) -> dict[str, Any]:
    paths = _resolve_paths(project_dir, style)
    script_path = paths["script_path"]
    state_path = paths["state_path"]
    generated_dir = paths["generated_dir"]
    final_path = paths["final_path"]
    quality = json.loads(paths["quality_path"].read_text(encoding="utf-8"))
    generated_dir.mkdir(parents=True, exist_ok=True)

    state = _load_state(state_path)
    if not state.get("notebook", {}).get("id"):
        update_stage_status(
            state_path,
            "asset_generation",
            "blocked",
            last_error="Notebook ID が存在しません。",
            next_action="/prepare-assets を先に実行して notebook を作成",
        )
        return {
            "style": style,
            "blocked": True,
            "reason": "missing_notebook_id",
            "creation_ids": [],
            "downloaded_ids": [],
        }

    if retry_marker_id:
        mark_generation_requested(state_path, retry_marker_id)

    creation_plan = build_artifact_creation_plan(state_path, retry_marker_id=retry_marker_id)
    creation_ids = [item["id"] for item in creation_plan]
    if creation_plan:
        update_stage_status(
            state_path,
            "asset_generation",
            "running",
            next_action="NotebookLM の artifact 生成ジョブを待機中",
        )
        try:
            creation_results = run_artifact_creation_plan(state_path, creation_plan, cwd=project_dir)
            pollable_creation_ids = [item["marker_id"] for item in creation_results if item.get("artifact_id")]
            if pollable_creation_ids:
                poll_studio_status(
                    state_path,
                    target_marker_ids=set(pollable_creation_ids),
                    poll_interval_seconds=int(quality["timeouts"]["polling_interval_seconds"]),
                    timeout_seconds=int(quality["timeouts"]["notebooklm_job_max_minutes"]) * 60,
                    cwd=project_dir,
                )
            refreshed_state = _load_state(state_path)
            generation_stage = refreshed_state.get("stages", {}).get("asset_generation", {})
            generation_next_action = "ダウンロード処理へ進む"
            if generation_stage.get("status") != "done":
                generation_next_action = "生成失敗マーカーを含むため、ダウンロード後に監査で確認"
            update_stage_status(
                state_path,
                "asset_generation",
                generation_stage.get("status", "partial"),
                last_error=generation_stage.get("last_error"),
                next_action=generation_next_action,
            )
        except NotebookLmCommandError as exc:
            update_stage_status(
                state_path,
                "asset_generation",
                "blocked",
                last_error=str(exc),
                next_action="NotebookLM 側の失敗を確認し、必要なら /fetch-assets --retry <MARKER_ID> を再実行",
            )
            return {
                "style": style,
                "blocked": True,
                "reason": "generation_failed",
                "creation_ids": creation_ids,
                "downloaded_ids": [],
            }
    else:
        update_stage_status(
            state_path,
            "asset_generation",
            "done",
            next_action="未生成マーカーはありません。ダウンロード整合性を確認します。",
        )

    update_stage_status(
        state_path,
        "asset_download",
        "running",
        next_action="生成済み artifact を materials/generated に保存中",
    )
    download_plan = build_download_plan(state_path, generated_dir, retry_marker_id=retry_marker_id)
    downloaded_ids = download_generated_artifacts(state_path, generated_dir, retry_marker_id=retry_marker_id, cwd=project_dir)

    post_state = _load_state(state_path)
    render_final_script(script_path=script_path, output_path=final_path, markers=post_state.get("markers", []))

    stage = post_state.get("stages", {}).get("asset_download", {})
    if download_plan and stage.get("status") == "pending":
        update_stage_status(
            state_path,
            "asset_download",
            "blocked",
            last_error="ダウンロード対象が存在したのに stage 更新が行われませんでした。",
            next_action="NotebookLM 側の artifact 状態を確認して /fetch-assets を再試行",
        )
    elif not download_plan:
        update_stage_status(
            state_path,
            "asset_download",
            "done",
            next_action="/audit を実行して最終監査に進む",
        )
    else:
        refreshed_state = _load_state(state_path)
        refreshed_stage = refreshed_state.get("stages", {}).get("asset_download", {})
        next_action = "/audit を実行して最終監査に進む"
        if refreshed_stage.get("status") != "done":
            next_action = "失敗マーカーがあるため /audit で再生成対象を確認"
        update_stage_status(
            state_path,
            "asset_download",
            refreshed_stage.get("status", "partial"),
            last_error=refreshed_stage.get("last_error"),
            next_action=next_action,
        )

    return {
        "style": style,
        "blocked": False,
        "creation_ids": creation_ids,
        "downloaded_ids": downloaded_ids,
        "final_path": final_path,
    }


def _resolve_styles(project_dir: Path, style_arg: str) -> list[str]:
    if style_arg == "both":
        return [name for name in ("yukkuri", "zundamon") if (project_dir / name).exists()]
    return [style_arg]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch NotebookLM assets for one project style.")
    parser.add_argument("slug")
    parser.add_argument("--style", default="both", choices=["yukkuri", "zundamon", "both"])
    parser.add_argument("--retry")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    project_dir = root / "workspace" / "projects" / args.slug
    results = []
    for style in _resolve_styles(project_dir, args.style):
        results.append(fetch_style_assets(project_dir=project_dir, style=style, retry_marker_id=args.retry))
    for result in results:
        flag = "blocked" if result["blocked"] else "done"
        print(f"{result['style']}: {flag}")
    return 0 if all(not result["blocked"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
