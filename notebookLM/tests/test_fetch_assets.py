import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.fetch_assets import fetch_style_assets
from scripts.notebooklm_runner import mark_download_failed, mark_downloaded


class FetchAssetsTests(unittest.TestCase):
    def _seed_project(self, root: Path) -> tuple[Path, Path, Path, Path, Path, Path]:
        project_dir = root / "workspace" / "projects" / "demo"
        style_dir = project_dir / "zundamon"
        script_path = style_dir / "script" / "script_v1.md"
        state_path = style_dir / "state" / "run_state.json"
        manifest_path = style_dir / "materials" / "manifest" / "asset_manifest.yaml"
        generated_dir = style_dir / "materials" / "generated"
        final_path = style_dir / "final" / "final_script_v1.md"
        for path in [script_path.parent, state_path.parent, manifest_path.parent, generated_dir, final_path.parent]:
            path.mkdir(parents=True, exist_ok=True)
        script_path.write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
        manifest_path.write_text("project:\n  slug: demo\nassets: []\n", encoding="utf-8")
        state_path.write_text(json.dumps({
            "slug": "demo",
            "style": "zundamon",
            "script_path": str(script_path),
            "notebook": {"id": "nb-123", "title": "demo-zundamon", "status": "ready"},
            "stages": {
                "script_generation": {"status": "done"},
                "asset_planning": {"status": "done"},
                "notebooklm_upload": {"status": "done"},
                "asset_generation": {"status": "pending"},
                "asset_download": {"status": "pending"},
                "audit": {"status": "pending"},
            },
            "markers": [{
                "id": "INFO:1",
                "type": "INFO",
                "seq": 1,
                "desc": "仕組みの図",
                "kind": "infographic",
                "extension": "png",
                "output_name": "info_1.png",
                "status": "pending",
                "artifact_id": None,
                "local_path": None,
            }],
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        return project_dir, style_dir, script_path, state_path, generated_dir, final_path

    def test_fetch_style_assets_blocks_when_notebook_missing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, _, _, state_path, _, final_path = self._seed_project(root)
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            payload["notebook"]["id"] = None
            state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

            result = fetch_style_assets(project_dir=project_dir, style="zundamon")

            self.assertTrue(result["blocked"])
            self.assertFalse(final_path.exists())

    @patch("scripts.fetch_assets.download_generated_artifacts")
    @patch("scripts.fetch_assets.poll_studio_status")
    @patch("scripts.fetch_assets.run_artifact_creation_plan")
    def test_fetch_style_assets_merges_downloads_and_renders_final(self, mock_run_plan, mock_poll_status, mock_download):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, _, _, state_path, generated_dir, final_path = self._seed_project(root)

            def poll_side_effect(*args, **kwargs):
                payload = json.loads(state_path.read_text(encoding="utf-8"))
                payload["markers"][0]["artifact_id"] = "art-1"
                payload["markers"][0]["status"] = "completed"
                payload["stages"]["asset_generation"] = {"status": "done"}
                state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                return {"artifacts": [{"id": "art-1"}]}

            def download_side_effect(*args, **kwargs):
                (generated_dir / "info_1.png").write_bytes(b"x" * 12000)
                mark_downloaded(state_path, "INFO:1", "../materials/generated/info_1.png")
                return ["INFO:1"]

            mock_poll_status.side_effect = poll_side_effect
            mock_download.side_effect = download_side_effect

            result = fetch_style_assets(project_dir=project_dir, style="zundamon")

            self.assertFalse(result["blocked"])
            self.assertEqual(result["creation_ids"], ["INFO:1"])
            self.assertEqual(result["downloaded_ids"], ["INFO:1"])
            self.assertTrue((generated_dir / "info_1.png").exists())
            self.assertTrue(final_path.exists())
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "downloaded")
            self.assertIn("![info_1](../materials/generated/info_1.png)", final_path.read_text(encoding="utf-8"))
            mock_run_plan.assert_called_once()

    @patch("scripts.fetch_assets.download_generated_artifacts")
    @patch("scripts.fetch_assets.poll_studio_status")
    @patch("scripts.fetch_assets.run_artifact_creation_plan")
    def test_fetch_style_assets_marks_failed_download_and_keeps_placeholder(self, mock_run_plan, mock_poll_status, mock_download):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, _, _, state_path, _, final_path = self._seed_project(root)

            def poll_side_effect(*args, **kwargs):
                payload = json.loads(state_path.read_text(encoding="utf-8"))
                payload["markers"][0]["artifact_id"] = "art-1"
                payload["markers"][0]["status"] = "completed"
                payload["stages"]["asset_generation"] = {"status": "done"}
                state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                return {"artifacts": [{"id": "art-1"}]}

            def download_side_effect(*args, **kwargs):
                mark_download_failed(state_path, "INFO:1", "network")
                return []

            mock_poll_status.side_effect = poll_side_effect
            mock_download.side_effect = download_side_effect

            fetch_style_assets(project_dir=project_dir, style="zundamon")

            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["markers"][0]["status"], "download_failed")
            self.assertEqual(payload["markers"][0]["reason"], "network")
            self.assertIn("素材生成失敗", final_path.read_text(encoding="utf-8"))

    @patch("scripts.fetch_assets.download_generated_artifacts")
    @patch("scripts.fetch_assets.poll_studio_status")
    @patch("scripts.fetch_assets.run_artifact_creation_plan")
    def test_fetch_style_assets_retry_targets_only_requested_marker(self, mock_run_plan, mock_poll_status, mock_download):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, _, _, state_path, _, _ = self._seed_project(root)
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            payload["markers"].append({
                "id": "INFO:2",
                "type": "INFO",
                "seq": 2,
                "desc": "耐性の図",
                "kind": "infographic",
                "extension": "png",
                "output_name": "info_2.png",
                "status": "failed_permanent",
                "artifact_id": "art-2",
                "local_path": None,
                "retry_count": 0,
            })
            state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            mock_poll_status.return_value = {"artifacts": []}
            mock_download.return_value = []

            result = fetch_style_assets(project_dir=project_dir, style="zundamon", retry_marker_id="INFO:2")

            self.assertEqual(result["creation_ids"], ["INFO:2"])
            updated = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(updated["markers"][1]["retry_count"], 1)


if __name__ == "__main__":
    unittest.main()
