import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.notebooklm_runner import (
    NotebookLmCommandError,
    build_add_file_source_command,
    build_artifact_create_command,
    build_artifact_creation_plan,
    build_auth_check_command,
    build_create_notebook_command,
    build_download_artifact_command,
    build_prepare_runbook,
    build_setup_add_claude_code_command,
    build_setup_list_command,
    build_studio_status_command,
    build_download_plan,
    build_notebook_title,
    extract_script_markers,
    mark_download_failed,
    mark_downloaded,
    mark_generation_requested,
    merge_studio_artifacts,
    parse_created_artifact_id,
    parse_created_notebook_id,
    parse_setup_allows_claude_code,
    parse_studio_status_payload,
    run_artifact_creation_plan,
    sync_markers_from_script,
    update_notebook_status,
    update_stage_status,
)


class NotebookLmRunnerTests(unittest.TestCase):
    def test_build_auth_check_command(self):
        self.assertEqual(build_auth_check_command(), ["nlm", "login", "--check"])

    def test_build_setup_list_command(self):
        self.assertEqual(build_setup_list_command(), ["nlm", "setup", "list"])

    def test_build_setup_add_claude_code_command(self):
        self.assertEqual(build_setup_add_claude_code_command(), ["nlm", "setup", "add", "claude-code"])

    def test_build_create_notebook_command(self):
        self.assertEqual(
            build_create_notebook_command("demo-zundamon"),
            ["nlm", "notebook", "create", "demo-zundamon"],
        )

    def test_build_add_file_source_command(self):
        self.assertEqual(
            build_add_file_source_command("demo-notebook", Path("script.md")),
            ["nlm", "source", "add", "demo-notebook", "--file", "script.md", "--wait"],
        )

    def test_build_artifact_create_command(self):
        self.assertEqual(
            build_artifact_create_command("mind_map", "demo-notebook"),
            ["nlm", "mindmap", "create", "demo-notebook", "--confirm"],
        )
        self.assertEqual(
            build_artifact_create_command("infographic", "demo-notebook", "受容体の図"),
            ["nlm", "infographic", "create", "demo-notebook", "--orientation", "landscape", "--language", "ja", "--confirm", "--focus", "受容体の図"],
        )

    def test_build_studio_status_command(self):
        self.assertEqual(
            build_studio_status_command("demo-notebook"),
            ["nlm", "studio", "status", "demo-notebook", "--json"],
        )

    def test_build_download_artifact_command(self):
        self.assertEqual(
            build_download_artifact_command("slide_deck", "demo-notebook", "artifact-1", Path("slides.pdf")),
            ["nlm", "download", "slide-deck", "demo-notebook", "--id", "artifact-1", "--output", "slides.pdf"],
        )

    def test_parse_created_notebook_id(self):
        self.assertEqual(parse_created_notebook_id("✓ Created notebook: demo\n  ID: abc-123\n"), "abc-123")

    def test_parse_created_artifact_id(self):
        self.assertEqual(parse_created_artifact_id("✓ Infographic generation started\n  Artifact ID: art-1\n"), "art-1")

    def test_parse_setup_allows_claude_code(self):
        self.assertTrue(
            parse_setup_allows_claude_code(
                "Claude Code | Anthropic CLI | ? | claude mcp list\n",
                claude_mcp_output="notebooklm-mcp: notebooklm-mcp - ✓ Connected",
            )
        )
        self.assertFalse(parse_setup_allows_claude_code("Claude Code | Anthropic CLI | ? | claude mcp list\n", claude_mcp_output="context7: connected"))

    def test_parse_studio_status_payload_accepts_list_output(self):
        payload = parse_studio_status_payload('[{"id":"art-1","type":"infographic","status":"completed"}]')
        self.assertEqual(payload["artifacts"][0]["id"], "art-1")

    def test_extract_script_markers(self):
        with tempfile.TemporaryDirectory() as tmp:
            script_path = Path(tmp) / "script.md"
            script_path.write_text("[FIG:1] 全体像\n本文\n[SLIDE:1] まとめ\n", encoding="utf-8")
            markers = extract_script_markers(script_path)
            self.assertEqual(markers[0]["id"], "FIG:1")
            self.assertEqual(markers[0]["kind"], "infographic")
            self.assertEqual(markers[0]["output_name"], "fig_1.png")
            self.assertEqual(markers[1]["output_name"], "slide_1.pdf")

    def test_sync_markers_from_script_preserves_existing_fields(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            script_path.write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            state_path = root / "run_state.json"
            state_path.write_text(json.dumps({
                "slug": "demo",
                "style": "zundamon",
                "markers": [{
                    "id": "INFO:1",
                    "status": "downloaded",
                    "artifact_id": "artifact-1",
                    "local_path": "../materials/generated/info_1.png"
                }],
                "stages": {}
            }, ensure_ascii=False), encoding="utf-8")
            markers = sync_markers_from_script(state_path, script_path)
            self.assertEqual(markers[0]["status"], "downloaded")
            self.assertEqual(markers[0]["artifact_id"], "artifact-1")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["script_path"], str(script_path))

    def test_build_notebook_title(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({"slug": "demo", "style": "yukkuri"}, ensure_ascii=False), encoding="utf-8")
            self.assertEqual(build_notebook_title(state_path), "demo-yukkuri")

    def test_build_prepare_runbook_contains_recovery_commands(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            state_path = root / "run_state.json"
            script_path.write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            state_path.write_text(json.dumps({
                "slug": "demo",
                "style": "zundamon",
                "notebook": {"id": None, "title": None, "status": "pending"},
                "markers": [{"id": "INFO:1", "kind": "infographic", "desc": "仕組みの図"}],
                "stages": {}
            }, ensure_ascii=False), encoding="utf-8")
            runbook = build_prepare_runbook(state_path, script_path)
            self.assertIn("nlm login", runbook)
            self.assertIn("nlm setup add claude-code", runbook)
            self.assertIn("nlm notebook create demo-zundamon", runbook)

    def test_update_stage_status(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({"stages": {"asset_generation": {"status": "pending"}}}), encoding="utf-8")
            update_stage_status(state_path, "asset_generation", "done")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["stages"]["asset_generation"]["status"], "done")

    def test_update_notebook_status(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({"notebook": {"id": None, "title": None, "status": "pending"}}, ensure_ascii=False), encoding="utf-8")
            update_notebook_status(state_path, "ready", notebook_id="nb-1", title="demo-zundamon")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["notebook"]["id"], "nb-1")
            self.assertEqual(payload["notebook"]["title"], "demo-zundamon")
            self.assertEqual(payload["notebook"]["status"], "ready")

    def test_merge_studio_artifacts_updates_markers_and_stage(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [
                    {"id": "FIG:1", "kind": "infographic", "seq": 1, "status": "pending"},
                    {"id": "SLIDE:1", "kind": "slide_deck", "seq": 1, "status": "pending"},
                ],
                "stages": {"asset_generation": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            merge_studio_artifacts(state_path, {
                "artifacts": [
                    {"id": "art-1", "type": "infographic", "created_at": "2026-04-22T10:00:00Z", "status": "completed"},
                    {"id": "art-2", "type": "slide-deck", "created_at": "2026-04-22T10:01:00Z", "status": "failed", "message": "boom"},
                ]
            })
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["artifact_id"], "art-1")
            self.assertEqual(payload["markers"][0]["status"], "completed")
            self.assertEqual(payload["markers"][1]["status"], "failed_permanent")
            self.assertEqual(payload["stages"]["asset_generation"]["status"], "partial")

    def test_merge_studio_artifacts_limits_updates_to_target_markers(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [
                    {"id": "FIG:1", "kind": "infographic", "seq": 1, "status": "downloaded", "artifact_id": "art-1", "local_path": "../materials/generated/fig_1.png"},
                    {"id": "SLIDE:1", "kind": "slide_deck", "seq": 1, "status": "pending", "artifact_id": "art-2"},
                ],
                "stages": {"asset_generation": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            merge_studio_artifacts(
                state_path,
                {
                    "artifacts": [
                        {"id": "art-1", "type": "infographic", "created_at": "2026-04-22T10:00:00Z", "status": "completed"},
                        {"id": "art-2", "type": "slide-deck", "created_at": "2026-04-22T10:01:00Z", "status": "completed"},
                    ]
                },
                target_marker_ids={"SLIDE:1"},
            )
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "downloaded")
            self.assertEqual(payload["markers"][1]["status"], "completed")

    def test_build_artifact_creation_plan_uses_pending_markers(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "notebook": {"id": "nb-1"},
                "markers": [
                    {"id": "INFO:1", "kind": "infographic", "status": "pending", "desc": "仕組みの図"},
                    {"id": "SLIDE:1", "kind": "slide_deck", "status": "downloaded", "desc": "まとめ"},
                ]
            }, ensure_ascii=False), encoding="utf-8")
            plan = build_artifact_creation_plan(state_path)
            self.assertEqual(len(plan), 1)
            self.assertEqual(plan[0]["id"], "INFO:1")
            self.assertEqual(plan[0]["command"][:4], ["nlm", "infographic", "create", "nb-1"])
            self.assertEqual(plan[0]["fallback_kind"], "slide_deck")

    def test_build_download_plan_uses_completed_markers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            state_path = root / "run_state.json"
            generated_dir = root / "generated"
            state_path.write_text(json.dumps({
                "notebook": {"id": "nb-1"},
                "markers": [
                    {"id": "INFO:1", "kind": "infographic", "artifact_id": "art-1", "status": "completed", "output_name": "info_1.png"},
                    {"id": "SLIDE:1", "kind": "slide_deck", "artifact_id": "art-2", "status": "failed_permanent", "output_name": "slide_1.pdf"},
                ]
            }, ensure_ascii=False), encoding="utf-8")
            plan = build_download_plan(state_path, generated_dir)
            self.assertEqual(len(plan), 1)
            self.assertEqual(plan[0]["id"], "INFO:1")
            self.assertEqual(plan[0]["local_path"], "../materials/generated/info_1.png")
            self.assertEqual(plan[0]["command"][:4], ["nlm", "download", "infographic", "nb-1"])

    def test_build_download_plan_skips_already_downloaded_without_retry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            state_path = root / "run_state.json"
            generated_dir = root / "generated"
            state_path.write_text(json.dumps({
                "notebook": {"id": "nb-1"},
                "markers": [
                    {
                        "id": "INFO:1",
                        "kind": "infographic",
                        "artifact_id": "art-1",
                        "status": "downloaded",
                        "output_name": "info_1.png",
                        "local_path": "../materials/generated/info_1.png"
                    }
                ]
            }, ensure_ascii=False), encoding="utf-8")
            plan = build_download_plan(state_path, generated_dir)
            self.assertEqual(plan, [])

    def test_build_download_plan_uses_slide_output_for_slide_fallback(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            state_path = root / "run_state.json"
            generated_dir = root / "generated"
            state_path.write_text(json.dumps({
                "notebook": {"id": "nb-1"},
                "markers": [
                    {
                        "id": "INFO:1",
                        "kind": "infographic",
                        "artifact_kind": "slide_deck",
                        "artifact_id": "art-1",
                        "status": "completed",
                        "output_name": "info_1.png"
                    }
                ]
            }, ensure_ascii=False), encoding="utf-8")
            plan = build_download_plan(state_path, generated_dir)
            self.assertEqual(plan[0]["kind"], "slide_deck")
            self.assertTrue(str(plan[0]["output_path"]).endswith("info_1.pdf"))

    def test_mark_generation_requested_updates_retry_count(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [{"id": "INFO:1", "status": "failed_permanent", "retry_count": 1}],
                "stages": {"asset_generation": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            mark_generation_requested(state_path, "INFO:1")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "pending")
            self.assertEqual(payload["markers"][0]["retry_count"], 2)

    @patch("scripts.notebooklm_runner.run_cli_command")
    def test_run_artifact_creation_plan_falls_back_to_slide_deck(self, mock_run_cli):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [{"id": "INFO:1", "status": "pending"}],
                "stages": {"asset_generation": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")

            class _Result:
                def __init__(self, stdout: str):
                    self.stdout = stdout

            mock_run_cli.side_effect = [
                NotebookLmCommandError(["nlm"], 1, "boom", ""),
                _Result("Artifact ID: slide-1\n"),
            ]

            result = run_artifact_creation_plan(
                state_path,
                [
                    {
                        "id": "INFO:1",
                        "command": ["nlm", "infographic", "create"],
                        "kind": "infographic",
                        "fallback_kind": "slide_deck",
                        "fallback_command": ["nlm", "slides", "create"],
                    },
                ],
            )

            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "pending")
            self.assertEqual(payload["markers"][0]["artifact_id"], "slide-1")
            self.assertEqual(payload["markers"][0]["artifact_kind"], "slide_deck")
            self.assertEqual(result[0]["artifact_id"], "slide-1")

    def test_mark_downloaded_updates_marker_and_stage(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [{"id": "INFO:1", "status": "completed", "artifact_id": "art-1"}],
                "stages": {"asset_download": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            mark_downloaded(state_path, "INFO:1", "../materials/generated/info_1.png")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "downloaded")
            self.assertEqual(payload["markers"][0]["local_path"], "../materials/generated/info_1.png")
            self.assertEqual(payload["stages"]["asset_download"]["status"], "done")

    def test_mark_download_failed_updates_reason(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [{"id": "INFO:1", "status": "completed", "artifact_id": "art-1"}],
                "stages": {"asset_download": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            mark_download_failed(state_path, "INFO:1", "network")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "download_failed")
            self.assertEqual(payload["markers"][0]["reason"], "network")
            self.assertEqual(payload["stages"]["asset_download"]["status"], "partial")

    def test_mark_download_failed_done_not_counted_as_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({
                "markers": [
                    {"id": "INFO:1", "status": "completed", "artifact_id": "art-1"},
                    {"id": "INFO:2", "status": "completed", "artifact_id": "art-2"}
                ],
                "stages": {"asset_download": {"status": "pending"}}
            }, ensure_ascii=False), encoding="utf-8")
            mark_downloaded(state_path, "INFO:1", "../materials/generated/info_1.png")
            mark_download_failed(state_path, "INFO:2", "timeout")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["stages"]["asset_download"]["status"], "partial")
            self.assertEqual(payload["stages"]["asset_download"]["failed"], 1)
            self.assertEqual(payload["stages"]["asset_download"]["completed"], 1)
            self.assertEqual(payload["stages"]["asset_download"]["total"], 2)


if __name__ == "__main__":
    unittest.main()
