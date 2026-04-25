import json
import tempfile
import unittest
from pathlib import Path

from scripts.build_audit_report import build_audit_report


class BuildAuditReportTests(unittest.TestCase):
    def test_build_audit_report_writes_summary(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            final_path = root / "final.md"
            state_path = root / "run_state.json"
            assets_dir = root / "generated"
            assets_dir.mkdir()
            (assets_dir / "info_1.png").write_bytes(b"12345678901")
            script_path.write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            final_path.write_text("[INFO:1] 仕組みの図\n\n![info_1](../assets/demo/info_1.png)\n", encoding="utf-8")
            state_path.write_text(json.dumps({
                "style": "zundamon",
                "markers": [{"id": "INFO:1", "status": "downloaded", "local_path": "../assets/demo/info_1.png"}]
            }, ensure_ascii=False), encoding="utf-8")
            report_path = build_audit_report(script_path, final_path, state_path, assets_dir)
            report = report_path.read_text(encoding="utf-8")
            self.assertIn("総合判定", report)
            self.assertIn("INFO:1", report)


if __name__ == "__main__":
    unittest.main()
