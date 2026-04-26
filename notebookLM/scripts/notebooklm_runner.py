from __future__ import annotations

import json
import re
import shutil
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

MARKER_RE = re.compile(r"^\[(FIG|INFO|MAP|SLIDE|VIDEO):(\d+)\]\s+(.+)$")
MARKER_KIND_MAP = {
    "FIG": "infographic",
    "INFO": "infographic",
    "MAP": "mind_map",
    "SLIDE": "slide_deck",
    "VIDEO": "video",
}
MARKER_PREFIX_MAP = {
    "FIG": "fig",
    "INFO": "info",
    "MAP": "map",
    "SLIDE": "slide",
    "VIDEO": "video",
}
MARKER_EXTENSION_MAP = {
    "FIG": "png",
    "INFO": "png",
    "MAP": "json",
    "SLIDE": "pdf",
    "VIDEO": "mp4",
}
ARTIFACT_KIND_ALIASES = {
    "infographic": "infographic",
    "mind-map": "mind_map",
    "mindmap": "mind_map",
    "mind_map": "mind_map",
    "slide-deck": "slide_deck",
    "slides": "slide_deck",
    "slide_deck": "slide_deck",
    "video": "video",
}
PRESERVED_MARKER_FIELDS = (
    "status",
    "artifact_id",
    "artifact_kind",
    "local_path",
    "derived_local_paths",
    "reason",
    "retry_count",
)
TERMINAL_MARKER_STATUSES = {"completed", "failed_permanent", "downloaded", "download_failed"}
TERMINAL_STAGE_STATUSES = {"done", "partial", "blocked", "failed"}


def _is_japanese_text(text: str | None, threshold_ratio: float = 0.4) -> bool:
    if not text:
        return True
    cleaned = "".join(ch for ch in text if not ch.isspace())
    if not cleaned:
        return True
    japanese_count = sum(
        1
        for ch in cleaned
        if "぀" <= ch <= "ゟ"  # ひらがな
        or "゠" <= ch <= "ヿ"  # カタカナ
        or "一" <= ch <= "鿿"  # 漢字（CJK 統合漢字）
    )
    return japanese_count / len(cleaned) >= threshold_ratio


class DescLanguageError(ValueError):
    pass


def validate_marker_descs(
    markers: list[dict[str, Any]],
    retry_marker_id: str | None = None,
) -> None:
    invalid: list[tuple[str, str]] = []
    for marker in markers:
        if retry_marker_id and marker.get("id") != retry_marker_id:
            continue
        if marker.get("status") in {"completed", "downloaded"}:
            continue
        desc = marker.get("desc")
        if desc and not _is_japanese_text(desc):
            invalid.append((str(marker.get("id", "?")), str(desc)))
    if invalid:
        details = "\n".join(f"  - {mid}: {d}" for mid, d in invalid)
        raise DescLanguageError(
            "marker.desc に日本語以外（英文）が混入しています。"
            "NotebookLM が拒否 → fallback の原因になるため、台本の該当 marker を"
            "日本語に修正してください。\n" + details
        )


class NotebookLmCommandError(RuntimeError):
    def __init__(self, command: list[str], returncode: int, stdout: str, stderr: str):
        self.command = command
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        message = (
            f"NotebookLM command failed: {' '.join(command)} "
            f"(code={returncode})\nstdout:\n{stdout}\nstderr:\n{stderr}"
        )
        super().__init__(message)


def _utcnow() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _blank_stage(status: str = "pending") -> dict[str, Any]:
    return {
        "status": status,
        "started_at": None,
        "finished_at": None,
        "last_error": None,
        "next_action": None,
    }


def _load_state(state_path: Path) -> dict[str, Any]:
    payload = json.loads(state_path.read_text(encoding="utf-8"))
    stages = payload.setdefault("stages", {})
    for stage_name in (
        "script_generation",
        "asset_planning",
        "notebooklm_upload",
        "asset_generation",
        "asset_download",
        "audit",
    ):
        stage = stages.setdefault(stage_name, _blank_stage())
        stage.setdefault("status", "pending")
        stage.setdefault("started_at", None)
        stage.setdefault("finished_at", None)
        stage.setdefault("last_error", None)
        stage.setdefault("next_action", None)
    payload.setdefault("markers", [])
    payload.setdefault("notebook", {"id": None, "title": None, "status": "pending"})
    return payload


def _save_state(state_path: Path, payload: dict[str, Any]) -> None:
    state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _normalize_kind(kind: str) -> str:
    return ARTIFACT_KIND_ALIASES.get(kind, kind)


def _extract_artifact_status(artifact: dict[str, Any]) -> str:
    candidates = [
        artifact.get("status"),
        artifact.get("state"),
        artifact.get("details", {}).get("status"),
    ]
    for candidate in candidates:
        if not candidate:
            continue
        normalized = str(candidate).lower()
        if normalized in {"completed", "downloaded"}:
            return "completed"
        if normalized in {"failed", "error"}:
            return "failed_permanent"
        if normalized in {"pending", "running", "queued", "in_progress"}:
            return "pending"
    return "completed" if artifact.get("id") else "pending"


def _artifact_sort_key(artifact: dict[str, Any]) -> tuple[str, str]:
    return (str(artifact.get("created_at", "")), str(artifact.get("id", "")))


def _ensure_stage_metadata(stage: dict[str, Any]) -> None:
    stage.setdefault("status", "pending")
    stage.setdefault("started_at", None)
    stage.setdefault("finished_at", None)
    stage.setdefault("last_error", None)
    stage.setdefault("next_action", None)


def _set_marker_fields(state_path: Path, marker_id: str, **fields: Any) -> None:
    payload = _load_state(state_path)
    for marker in payload.get("markers", []):
        if marker.get("id") == marker_id:
            marker.update(fields)
            break
    _save_state(state_path, payload)


def _refresh_stage_counts(payload: dict[str, Any], stage_name: str, ok_statuses: set[str], failed_statuses: set[str]) -> None:
    markers = payload.get("markers", [])
    stage = payload.setdefault("stages", {}).setdefault(stage_name, _blank_stage())
    _ensure_stage_metadata(stage)
    total = len(markers)
    completed = sum(1 for marker in markers if marker.get("status") in ok_statuses)
    failed = sum(1 for marker in markers if marker.get("status") in failed_statuses)
    if total and completed == total:
        status = "done"
    elif completed or failed:
        status = "partial"
    else:
        status = "pending"
    stage.update({
        "status": status,
        "total": total,
        "completed": completed,
        "failed": failed,
    })
    if status != "pending" and not stage.get("started_at"):
        stage["started_at"] = _utcnow()
    if status in TERMINAL_STAGE_STATUSES:
        stage["finished_at"] = _utcnow()


def build_auth_check_command() -> list[str]:
    return ["nlm", "login", "--check"]


def build_setup_list_command() -> list[str]:
    return ["nlm", "setup", "list"]


def build_setup_add_claude_code_command() -> list[str]:
    return ["nlm", "setup", "add", "claude-code"]


def build_claude_mcp_list_command() -> list[str]:
    return ["claude", "mcp", "list"]


def build_create_notebook_command(title: str) -> list[str]:
    return ["nlm", "notebook", "create", title]


def build_add_file_source_command(notebook_id: str, script_path: Path) -> list[str]:
    return ["nlm", "source", "add", notebook_id, "--file", str(script_path), "--wait"]


def build_artifact_create_command(
    kind: str,
    notebook_id: str,
    focus: str | None = None,
    marker_type: str | None = None,
) -> list[str]:
    if kind == "infographic":
        orientation = "portrait" if marker_type == "INFO" else "landscape"
        command = [
            "nlm", "infographic", "create", notebook_id,
            "--orientation", orientation,
            "--language", "ja",
            "--confirm",
        ]
    elif kind == "slide_deck":
        command = ["nlm", "slides", "create", notebook_id, "--language", "ja", "--confirm"]
    elif kind == "mind_map":
        command = ["nlm", "mindmap", "create", notebook_id, "--confirm"]
    elif kind == "video":
        command = ["nlm", "video", "create", notebook_id, "--format", "explainer", "--style", "classic", "--confirm"]
    else:
        raise ValueError(f"Unsupported artifact kind: {kind}")

    if kind == "mind_map" and focus:
        command.extend(["--title", focus])
    elif focus:
        command.extend(["--focus", focus])
    return command


def build_studio_status_command(notebook_id: str) -> list[str]:
    return ["nlm", "studio", "status", notebook_id, "--json"]


def build_download_artifact_command(kind: str, notebook_id: str, artifact_id: str, output_path: Path) -> list[str]:
    mapping = {
        "infographic": "infographic",
        "slide_deck": "slide-deck",
        "mind_map": "mind-map",
        "video": "video",
    }
    return ["nlm", "download", mapping[kind], notebook_id, "--id", artifact_id, "--output", str(output_path)]


def parse_created_notebook_id(output: str) -> str | None:
    match = re.search(r"^\s*ID:\s*(\S+)\s*$", output, flags=re.MULTILINE)
    return match.group(1) if match else None


def parse_created_artifact_id(output: str) -> str | None:
    match = re.search(r"^\s*Artifact ID:\s*(\S+)\s*$", output, flags=re.MULTILINE)
    return match.group(1) if match else None


def parse_setup_allows_claude_code(setup_output: str, claude_mcp_output: str = "") -> bool:
    for line in setup_output.splitlines():
        if "Claude Code" not in line:
            continue
        if "✓" in line:
            return True
        if "?" in line and "notebooklm-mcp" in claude_mcp_output and "Connected" in claude_mcp_output:
            return True
        return False
    return False


def parse_studio_status_payload(raw_output: str) -> dict[str, Any]:
    payload = json.loads(raw_output)
    if isinstance(payload, list):
        return {"artifacts": payload}
    if isinstance(payload, dict):
        if "artifacts" in payload and isinstance(payload["artifacts"], list):
            return payload
        return {"artifacts": payload.get("items", [])}
    return {"artifacts": []}


def run_cli_command(command: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if check and result.returncode != 0:
        raise NotebookLmCommandError(command, result.returncode, result.stdout, result.stderr)
    return result


def _extract_setup_status_symbol(setup_output: str, client_name: str) -> str | None:
    for line in setup_output.splitlines():
        if client_name not in line:
            continue
        if "✓" in line:
            return "configured"
        if "?" in line:
            return "unknown"
        if " - " in f" {line} " or "│     -      │" in line:
            return "missing"
    return None


def run_auth_check(cwd: Path | None = None) -> dict[str, Any]:
    result = run_cli_command(build_auth_check_command(), cwd=cwd, check=False)
    return {
        "ok": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "command": build_auth_check_command(),
    }


def inspect_setup(cwd: Path | None = None) -> dict[str, Any]:
    command = build_setup_list_command()
    setup_timed_out = False
    timed_out_stdout = ""
    timed_out_stderr = ""
    try:
        result = subprocess.run(
            command,
            cwd=str(cwd) if cwd else None,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=45,
        )
    except subprocess.TimeoutExpired as exc:
        setup_timed_out = True
        timed_out_stdout = exc.stdout or ""
        timed_out_stderr = exc.stderr or ""
        result = None
    summary: dict[str, Any] = {
        "ok": bool(result and result.returncode == 0),
        "stdout": result.stdout if result else timed_out_stdout,
        "stderr": result.stderr if result else timed_out_stderr,
        "command": command,
        "warnings": [],
        "claude_code_status": None,
        "codex_cli_status": None,
        "claude_mcp_output": "",
        "setup_timed_out": setup_timed_out,
    }
    if result and result.returncode != 0:
        return summary

    if result:
        summary["claude_code_status"] = _extract_setup_status_symbol(result.stdout, "Claude Code")
        summary["codex_cli_status"] = _extract_setup_status_symbol(result.stdout, "Codex CLI")

    if shutil.which("claude"):
        claude_result = run_cli_command(build_claude_mcp_list_command(), cwd=cwd, check=False)
        summary["claude_mcp_output"] = f"{claude_result.stdout}\n{claude_result.stderr}".strip()
        if result and parse_setup_allows_claude_code(result.stdout, summary["claude_mcp_output"]):
            summary["claude_code_status"] = "configured"
        elif setup_timed_out and "notebooklm-mcp" in summary["claude_mcp_output"] and "Connected" in summary["claude_mcp_output"]:
            summary["claude_code_status"] = "configured"
            summary["ok"] = True

    if setup_timed_out:
        summary["warnings"].append("`nlm setup list` が 45 秒でタイムアウトしました。Claude Code 側の `claude mcp list` を代替確認として使用しました。")

    if summary["claude_code_status"] != "configured":
        summary["warnings"].append("Claude Code の NotebookLM MCP 設定が未確認です。必要なら `nlm setup add claude-code` を実行してください。")
    if summary["codex_cli_status"] != "configured":
        summary["warnings"].append("Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。")
    return summary


def extract_script_markers(script_path: Path) -> list[dict[str, Any]]:
    markers: list[dict[str, Any]] = []
    for raw_line in script_path.read_text(encoding="utf-8").splitlines():
        match = MARKER_RE.match(raw_line.strip())
        if not match:
            continue
        marker_type, seq_text, desc = match.groups()
        seq = int(seq_text)
        extension = MARKER_EXTENSION_MAP[marker_type]
        prefix = MARKER_PREFIX_MAP[marker_type]
        markers.append({
            "id": f"{marker_type}:{seq_text}",
            "type": marker_type,
            "seq": seq,
            "desc": desc,
            "kind": MARKER_KIND_MAP[marker_type],
            "extension": extension,
            "output_name": f"{prefix}_{seq}.{extension}",
            "status": "pending",
            "artifact_id": None,
            "artifact_kind": None,
            "local_path": None,
            "derived_local_paths": [],
            "reason": None,
            "retry_count": 0,
        })
    return markers


def sync_markers_from_script(state_path: Path, script_path: Path) -> list[dict[str, Any]]:
    payload = _load_state(state_path)
    existing_markers = {marker["id"]: marker for marker in payload.get("markers", [])}
    synced_markers: list[dict[str, Any]] = []
    for marker in extract_script_markers(script_path):
        merged = marker.copy()
        current = existing_markers.get(marker["id"], {})
        for field in PRESERVED_MARKER_FIELDS:
            if field in current:
                merged[field] = current[field]
        synced_markers.append(merged)
    payload["script_path"] = str(script_path)
    payload["markers"] = synced_markers
    _save_state(state_path, payload)
    return synced_markers


def build_notebook_title(state_path: Path) -> str:
    payload = _load_state(state_path)
    return f"{payload['slug']}-{payload['style']}"


def build_prepare_runbook(state_path: Path, script_path: Path, setup_summary: dict[str, Any] | None = None) -> str:
    payload = _load_state(state_path)
    notebook_title = payload.get("notebook", {}).get("title") or build_notebook_title(state_path)
    notebook_ref = payload.get("notebook", {}).get("id") or "<NOTEBOOK_ID>"
    lines = [
        "# NotebookLM runbook",
        "",
        f"- style: {payload.get('style', 'unknown')}",
        f"- script: {script_path}",
        f"- notebook_title: {notebook_title}",
        f"- notebook_id: {notebook_ref}",
        "",
        "## Preflight",
        f"- {' '.join(build_auth_check_command())}",
        f"- {' '.join(build_setup_list_command())}",
    ]
    if setup_summary:
        warnings = setup_summary.get("warnings") or []
        if warnings:
            lines.extend(["", "## Setup warnings", *[f"- {warning}" for warning in warnings]])
    lines.extend([
        "",
        "## Upload",
        f"- {' '.join(build_create_notebook_command(notebook_title))}",
        f"- {' '.join(build_add_file_source_command(notebook_ref, script_path))}",
        "",
        "## Recovery",
        "- nlm login",
        f"- {' '.join(build_setup_add_claude_code_command())}",
        "- Codex 側は repo 直下の mcp.json を参照して手動設定",
    ])
    markers = payload.get("markers", [])
    if markers:
        lines.extend([
            "",
            "## Markers",
            *[f"- {marker['id']} ({marker['kind']}): {marker['desc']}" for marker in markers],
        ])
    return "\n".join(lines) + "\n"


def update_stage_status(
    state_path: Path,
    stage: str,
    status: str,
    *,
    next_action: str | None = None,
    last_error: str | None = None,
) -> None:
    payload = _load_state(state_path)
    stage_payload = payload.setdefault("stages", {}).setdefault(stage, _blank_stage())
    _ensure_stage_metadata(stage_payload)
    previous_status = stage_payload.get("status")
    stage_payload["status"] = status
    if status != "pending" and not stage_payload.get("started_at"):
        stage_payload["started_at"] = _utcnow()
    if status == "running":
        stage_payload["finished_at"] = None
    elif status in TERMINAL_STAGE_STATUSES:
        stage_payload["finished_at"] = _utcnow()
    elif previous_status in TERMINAL_STAGE_STATUSES and status == "pending":
        stage_payload["finished_at"] = None
    stage_payload["last_error"] = last_error
    stage_payload["next_action"] = next_action
    _save_state(state_path, payload)


def update_notebook_status(state_path: Path, status: str, notebook_id: str | None = None, title: str | None = None) -> None:
    payload = _load_state(state_path)
    notebook = payload.setdefault("notebook", {})
    notebook["status"] = status
    notebook["checked_at"] = _utcnow()
    if notebook_id is not None:
        notebook["id"] = notebook_id
    if title is not None:
        notebook["title"] = title
    _save_state(state_path, payload)


def ensure_notebook(state_path: Path, cwd: Path | None = None) -> str:
    payload = _load_state(state_path)
    notebook = payload.setdefault("notebook", {})
    existing_id = notebook.get("id")
    title = notebook.get("title") or build_notebook_title(state_path)
    if existing_id:
        update_notebook_status(state_path, "ready", notebook_id=existing_id, title=title)
        return str(existing_id)

    result = run_cli_command(build_create_notebook_command(title), cwd=cwd)
    notebook_id = parse_created_notebook_id(result.stdout)
    if not notebook_id:
        raise NotebookLmCommandError(build_create_notebook_command(title), 0, result.stdout, "Notebook ID could not be parsed.")
    update_notebook_status(state_path, "ready", notebook_id=notebook_id, title=title)
    return notebook_id


def upload_script_source(state_path: Path, script_path: Path, cwd: Path | None = None) -> None:
    payload = _load_state(state_path)
    notebook_id = payload.get("notebook", {}).get("id")
    if not notebook_id:
        raise RuntimeError("Notebook ID is missing before upload.")
    run_cli_command(build_add_file_source_command(str(notebook_id), script_path), cwd=cwd)


def merge_studio_artifacts(
    state_path: Path,
    status_payload: dict[str, Any],
    *,
    target_marker_ids: set[str] | None = None,
) -> list[dict[str, Any]]:
    payload = _load_state(state_path)
    markers = payload.get("markers", [])
    artifacts = list(status_payload.get("artifacts", []))
    for artifact in artifacts:
        artifact["normalized_kind"] = _normalize_kind(str(artifact.get("type", "")))

    artifacts_by_id = {str(artifact.get("id")): artifact for artifact in artifacts if artifact.get("id")}
    unmatched_artifacts_by_kind: dict[str, list[dict[str, Any]]] = {}
    for artifact in artifacts:
        unmatched_artifacts_by_kind.setdefault(artifact["normalized_kind"], []).append(artifact)
    for entries in unmatched_artifacts_by_kind.values():
        entries.sort(key=_artifact_sort_key)

    for marker in markers:
        if target_marker_ids is not None and marker["id"] not in target_marker_ids:
            continue
        artifact = None
        artifact_id = marker.get("artifact_id")
        if artifact_id and artifact_id in artifacts_by_id:
            artifact = artifacts_by_id[artifact_id]
        else:
            pool = unmatched_artifacts_by_kind.get(marker["kind"], [])
            if pool:
                artifact = pool.pop(0)
        if not artifact:
            continue
        marker["artifact_id"] = artifact.get("id")
        marker["artifact_kind"] = artifact["normalized_kind"]
        marker["status"] = _extract_artifact_status(artifact)
        if marker["status"] == "failed_permanent":
            reason = artifact.get("error") or artifact.get("message") or artifact.get("details", {}).get("error")
            if reason:
                marker["reason"] = str(reason)

    _refresh_stage_counts(payload, "asset_generation", {"completed", "downloaded"}, {"failed_permanent"})
    _save_state(state_path, payload)
    return payload.get("markers", [])


def _marker_type(marker: dict[str, Any]) -> str:
    marker_id = str(marker.get("id", ""))
    return str(marker.get("type") or marker_id.split(":", 1)[0])


def build_artifact_creation_plan(state_path: Path, retry_marker_id: str | None = None) -> list[dict[str, Any]]:
    payload = _load_state(state_path)
    notebook_id = payload.get("notebook", {}).get("id")
    if not notebook_id:
        return []

    validate_marker_descs(payload.get("markers", []), retry_marker_id)

    plan: list[dict[str, Any]] = []
    for marker in payload.get("markers", []):
        if retry_marker_id and marker["id"] != retry_marker_id:
            continue
        if not retry_marker_id and marker.get("status") in {"completed", "downloaded"}:
            continue
        marker_type = _marker_type(marker)
        plan.append({
            "id": marker["id"],
            "kind": marker["kind"],
            "marker_type": marker_type,
            "command": build_artifact_create_command(
                marker["kind"],
                str(notebook_id),
                marker.get("desc"),
                marker_type=marker_type,
            ),
            "desc": marker.get("desc"),
        })
    return plan


def run_artifact_creation_plan(state_path: Path, plan: list[dict[str, Any]], cwd: Path | None = None) -> list[dict[str, Any]]:
    created: list[dict[str, Any]] = []
    for item in plan:
        try:
            result = run_cli_command(item["command"], cwd=cwd)
            artifact_id = parse_created_artifact_id(result.stdout)
            fields: dict[str, Any] = {"status": "pending", "reason": None, "artifact_kind": item["kind"]}
            if artifact_id:
                fields["artifact_id"] = artifact_id
            _set_marker_fields(state_path, item["id"], **fields)
            created.append({"marker_id": item["id"], "artifact_id": artifact_id, "stdout": result.stdout})
        except NotebookLmCommandError as exc:
            _set_marker_fields(
                state_path,
                item["id"],
                status="failed_permanent",
                reason=str(exc),
            )
            created.append({"marker_id": item["id"], "artifact_id": None, "error": str(exc)})
    payload = _load_state(state_path)
    _refresh_stage_counts(payload, "asset_generation", {"completed", "downloaded"}, {"failed_permanent"})
    _save_state(state_path, payload)
    return created


def poll_studio_status(
    state_path: Path,
    *,
    target_marker_ids: set[str],
    poll_interval_seconds: int,
    timeout_seconds: int,
    cwd: Path | None = None,
) -> dict[str, Any]:
    payload = _load_state(state_path)
    notebook_id = payload.get("notebook", {}).get("id")
    if not notebook_id:
        raise RuntimeError("Notebook ID is missing before polling.")

    started = time.time()
    last_payload: dict[str, Any] = {"artifacts": []}
    while True:
        result = run_cli_command(build_studio_status_command(str(notebook_id)), cwd=cwd)
        last_payload = parse_studio_status_payload(result.stdout)
        markers = merge_studio_artifacts(state_path, last_payload, target_marker_ids=target_marker_ids)
        target_markers = [marker for marker in markers if marker["id"] in target_marker_ids]
        if target_markers and all(marker.get("status") in TERMINAL_MARKER_STATUSES for marker in target_markers):
            return last_payload
        if time.time() - started >= timeout_seconds:
            payload = _load_state(state_path)
            for marker in payload.get("markers", []):
                if marker["id"] in target_marker_ids and marker.get("status") not in TERMINAL_MARKER_STATUSES:
                    marker["status"] = "failed_permanent"
                    marker["reason"] = "NotebookLM polling timed out"
            _refresh_stage_counts(payload, "asset_generation", {"completed", "downloaded"}, {"failed_permanent"})
            _save_state(state_path, payload)
            return last_payload
        time.sleep(poll_interval_seconds)


def mark_generation_requested(state_path: Path, marker_id: str) -> None:
    payload = _load_state(state_path)
    for marker in payload.get("markers", []):
        if marker["id"] == marker_id:
            marker["status"] = "pending"
            marker["reason"] = None
            marker["retry_count"] = int(marker.get("retry_count") or 0) + 1
            break
    _refresh_stage_counts(payload, "asset_generation", {"completed", "downloaded"}, {"failed_permanent"})
    _save_state(state_path, payload)


def build_download_plan(state_path: Path, generated_dir: Path, retry_marker_id: str | None = None) -> list[dict[str, Any]]:
    payload = _load_state(state_path)
    notebook_id = payload.get("notebook", {}).get("id")
    if not notebook_id:
        return []

    plan: list[dict[str, Any]] = []
    for marker in payload.get("markers", []):
        if retry_marker_id and marker["id"] != retry_marker_id:
            continue
        if not retry_marker_id and marker.get("status") == "downloaded":
            continue
        if not marker.get("artifact_id"):
            continue
        if marker.get("status") not in {"completed", "download_failed", "downloaded"}:
            continue
        download_kind = marker.get("artifact_kind") or marker["kind"]
        output_name = marker["output_name"]
        output_path = generated_dir / output_name
        if download_kind == "slide_deck":
            output_path = generated_dir / f"{Path(output_name).stem}.pdf"
        plan.append({
            "id": marker["id"],
            "kind": download_kind,
            "command": build_download_artifact_command(download_kind, str(notebook_id), str(marker["artifact_id"]), output_path),
            "output_path": output_path,
            "local_path": f"../materials/generated/{output_path.name}",
        })
    return plan


def mark_downloaded(
    state_path: Path,
    marker_id: str,
    local_path: str,
    derived_local_paths: list[str] | None = None,
) -> None:
    payload = _load_state(state_path)
    for marker in payload.get("markers", []):
        if marker["id"] == marker_id:
            marker["status"] = "downloaded"
            marker["local_path"] = local_path
            if derived_local_paths:
                marker["derived_local_paths"] = derived_local_paths
            marker["reason"] = None
            break
    _refresh_stage_counts(payload, "asset_download", {"downloaded"}, {"failed_permanent", "download_failed"})
    _save_state(state_path, payload)


def mark_download_failed(state_path: Path, marker_id: str, reason: str) -> None:
    payload = _load_state(state_path)
    for marker in payload.get("markers", []):
        if marker["id"] == marker_id:
            marker["status"] = "download_failed"
            marker["reason"] = reason
            break
    _refresh_stage_counts(payload, "asset_download", {"downloaded"}, {"failed_permanent", "download_failed"})
    _save_state(state_path, payload)


def _rasterize_slide_pdf(output_path: Path) -> list[Path]:
    rasterized_paths: list[Path] = []
    try:
        import fitz  # type: ignore
    except Exception:
        fitz = None
    if fitz is not None:
        document = fitz.open(output_path)
        try:
            for page_index in range(document.page_count):
                page = document.load_page(page_index)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                raster_path = output_path.with_name(f"{output_path.stem}_p{page_index + 1:02d}.png")
                pix.save(raster_path)
                rasterized_paths.append(raster_path)
            return rasterized_paths
        finally:
            document.close()

    try:
        import pypdfium2 as pdfium  # type: ignore
    except Exception:
        pdfium = None
    if pdfium is not None:
        document = pdfium.PdfDocument(str(output_path))
        for page_index in range(len(document)):
            page = document[page_index]
            bitmap = page.render(scale=2)
            image = bitmap.to_pil()
            raster_path = output_path.with_name(f"{output_path.stem}_p{page_index + 1:02d}.png")
            image.save(raster_path)
            rasterized_paths.append(raster_path)
        return rasterized_paths

    raise RuntimeError("PDF を画像化できるライブラリが見つかりません。PyMuPDF または pypdfium2 が必要です。")


def download_generated_artifacts(state_path: Path, generated_dir: Path, retry_marker_id: str | None = None, cwd: Path | None = None) -> list[str]:
    generated_dir.mkdir(parents=True, exist_ok=True)
    downloaded_ids: list[str] = []
    for item in build_download_plan(state_path, generated_dir, retry_marker_id=retry_marker_id):
        try:
            run_cli_command(item["command"], cwd=cwd)
            if not item["output_path"].exists():
                raise FileNotFoundError(f"Downloaded file not found: {item['output_path']}")
            derived_local_paths: list[str] | None = None
            local_path = item["local_path"]
            if item["kind"] == "slide_deck" and item["output_path"].suffix.lower() == ".pdf":
                rasterized_paths = _rasterize_slide_pdf(item["output_path"])
                if not rasterized_paths:
                    raise RuntimeError("PDF は取得できましたが画像化結果が 0 枚でした。")
                derived_local_paths = [f"../materials/generated/{path.name}" for path in rasterized_paths]
                local_path = derived_local_paths[0]
            mark_downloaded(state_path, item["id"], local_path, derived_local_paths=derived_local_paths)
            downloaded_ids.append(item["id"])
        except Exception as exc:  # noqa: BLE001
            mark_download_failed(state_path, item["id"], str(exc))
    return downloaded_ids
