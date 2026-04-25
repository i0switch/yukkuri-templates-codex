import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.run_all import run_all_project


class RunAllTests(unittest.TestCase):
    def _seed_project(self, root: Path) -> Path:
        project_dir = root / "workspace" / "projects" / "demo"
        for style in ("yukkuri", "zundamon"):
            style_dir = project_dir / style
            for path in [
                style_dir / "script",
                style_dir / "state",
                style_dir / "materials" / "generated",
                style_dir / "final",
            ]:
                path.mkdir(parents=True, exist_ok=True)
            (style_dir / "script" / "script_v1.md").write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            (style_dir / "final" / "final_script_v1.md").write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            (style_dir / "state" / "run_state.json").write_text(json.dumps({
                "style": style,
                "markers": [{"id": "INFO:1", "status": "downloaded", "local_path": "../materials/generated/info_1.png"}],
                "stages": {},
            }, ensure_ascii=False), encoding="utf-8")
        return project_dir

    @patch("scripts.run_all.build_audit_report")
    @patch("scripts.run_all.fetch_style_assets")
    @patch("scripts.run_all.prepare_style_assets")
    def test_run_all_project_stops_on_manual_recovery(self, mock_prepare, mock_fetch, mock_audit):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir = self._seed_project(root)
            mock_prepare.return_value = {
                "style": "zundamon",
                "needs_manual_recovery": True,
                "runbook_path": project_dir / "zundamon" / "materials" / "notebooklm" / "runbook.md",
            }

            result = run_all_project(project_dir=project_dir, style_arg="zundamon")

            self.assertTrue(result["stopped"])
            self.assertEqual(result["reason"], "manual_recovery")
            mock_fetch.assert_not_called()
            mock_audit.assert_not_called()

    @patch("scripts.run_all.fetch_style_assets")
    @patch("scripts.run_all.prepare_style_assets")
    def test_run_all_project_sequences_styles_and_writes_audits(self, mock_prepare, mock_fetch):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project_dir = self._seed_project(root)

            def prepare_side_effect(project_dir: Path, style: str):
                return {
                    "style": style,
                    "needs_manual_recovery": False,
                    "runbook_path": project_dir / style / "materials" / "notebooklm" / "runbook.md",
                }

            def fetch_side_effect(project_dir: Path, style: str, retry_marker_id: str | None = None):
                final_path = project_dir / style / "final" / "final_script_v1.md"
                final_path.write_text("[INFO:1] 仕組みの図\n\n![info_1](../materials/generated/info_1.png)\n", encoding="utf-8")
                return {
                    "style": style,
                    "blocked": False,
                    "creation_ids": ["INFO:1"],
                    "downloaded_ids": ["INFO:1"],
                    "final_path": final_path,
                }

            mock_prepare.side_effect = prepare_side_effect
            mock_fetch.side_effect = fetch_side_effect

            result = run_all_project(project_dir=project_dir, style_arg="both")

            self.assertFalse(result["stopped"])
            self.assertEqual(result["completed_styles"], ["yukkuri", "zundamon"])
            self.assertEqual(len(result["results"]), 2)
            self.assertTrue((project_dir / "yukkuri" / "materials" / "audit" / "audit_report_v1.md").exists())
            self.assertTrue((project_dir / "zundamon" / "materials" / "audit" / "audit_report_v1.md").exists())


if __name__ == "__main__":
    unittest.main()
