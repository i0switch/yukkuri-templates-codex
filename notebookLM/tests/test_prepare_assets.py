import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.prepare_assets import prepare_style_assets


class PrepareAssetsTests(unittest.TestCase):
    def _seed_project(self, root: Path) -> tuple[Path, Path, Path, Path]:
        project_dir = root / "workspace" / "projects" / "demo"
        style_dir = project_dir / "zundamon"
        script_path = style_dir / "script" / "script_v1.md"
        state_path = style_dir / "state" / "run_state.json"
        manifest_path = style_dir / "materials" / "manifest" / "asset_manifest.yaml"
        for path in [script_path.parent, state_path.parent, manifest_path.parent, style_dir / "materials" / "notebooklm"]:
            path.mkdir(parents=True, exist_ok=True)
        script_path.write_text(
            "---\ntitle: Demo\nstyle: zundamon\nslug: demo\n---\n\n# Demo\n\n## ツカミ（0:00–0:30）\n\n[FIG:1] 全体像\n",
            encoding="utf-8",
        )
        state_path.write_text(json.dumps({
            "slug": "demo",
            "style": "zundamon",
            "script_path": None,
            "notebook": {"id": None, "title": None, "status": "pending"},
            "stages": {
                "script_generation": {"status": "done"},
                "asset_planning": {"status": "pending"},
                "notebooklm_upload": {"status": "pending"},
                "asset_generation": {"status": "pending"},
                "asset_download": {"status": "pending"},
                "audit": {"status": "pending"},
            },
            "markers": [],
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        return project_dir, style_dir, script_path, state_path

    @patch("scripts.prepare_assets.build_manifest")
    @patch("scripts.prepare_assets.validate_script")
    @patch("scripts.prepare_assets.run_auth_check")
    def test_prepare_style_assets_stops_with_recovery_runbook_when_auth_fails(self, mock_auth_check, mock_validate_script, mock_build_manifest):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, style_dir, _, state_path = self._seed_project(root)
            manifest_path = style_dir / "materials" / "manifest" / "asset_manifest.yaml"
            manifest_path.write_text("project:\n  slug: demo\nassets: []\n", encoding="utf-8")
            mock_build_manifest.return_value = manifest_path
            mock_validate_script.return_value = {"ok": True, "errors": [], "warnings": [], "summary": {}}
            mock_auth_check.return_value = {"ok": False, "stdout": "", "stderr": "auth failed"}

            result = prepare_style_assets(project_dir=project_dir, style="zundamon")

            self.assertTrue(result["needs_manual_recovery"])
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["stages"]["asset_planning"]["status"], "done")
            self.assertEqual(payload["stages"]["notebooklm_upload"]["status"], "blocked")
            self.assertEqual(payload["notebook"]["status"], "pending")
            self.assertEqual(payload["markers"][0]["id"], "FIG:1")
            runbook = (style_dir / "materials" / "notebooklm" / "runbook.md").read_text(encoding="utf-8")
            self.assertIn("nlm login", runbook)
            self.assertIn("nlm setup add claude-code", runbook)

    @patch("scripts.prepare_assets.build_manifest")
    @patch("scripts.prepare_assets.validate_script")
    @patch("scripts.prepare_assets.upload_script_source")
    @patch("scripts.prepare_assets.ensure_notebook")
    @patch("scripts.prepare_assets.inspect_setup")
    @patch("scripts.prepare_assets.run_auth_check")
    def test_prepare_style_assets_updates_notebook_when_auth_succeeds(
        self,
        mock_auth_check,
        mock_inspect_setup,
        mock_ensure_notebook,
        mock_upload_script_source,
        mock_validate_script,
        mock_build_manifest,
    ):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir, style_dir, script_path, state_path = self._seed_project(root)
            manifest_path = style_dir / "materials" / "manifest" / "asset_manifest.yaml"
            manifest_path.write_text("project:\n  slug: demo\nassets: []\n", encoding="utf-8")
            mock_build_manifest.return_value = manifest_path
            mock_validate_script.return_value = {"ok": True, "errors": [], "warnings": [], "summary": {}}
            mock_auth_check.return_value = {"ok": True, "stdout": "ok", "stderr": ""}
            mock_inspect_setup.return_value = {"ok": True, "warnings": [], "stdout": "", "stderr": ""}
            mock_ensure_notebook.return_value = "nb-123"

            result = prepare_style_assets(project_dir=project_dir, style="zundamon")

            self.assertFalse(result["needs_manual_recovery"])
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["notebook"]["id"], "nb-123")
            self.assertEqual(payload["notebook"]["title"], "demo-zundamon")
            self.assertEqual(payload["notebook"]["status"], "ready")
            self.assertEqual(payload["stages"]["asset_planning"]["status"], "done")
            self.assertEqual(payload["stages"]["notebooklm_upload"]["status"], "done")
            self.assertEqual(payload["script_path"], str(script_path))
            self.assertTrue((style_dir / "materials" / "notebooklm" / "runbook.md").exists())
            mock_upload_script_source.assert_called_once()


if __name__ == "__main__":
    unittest.main()
