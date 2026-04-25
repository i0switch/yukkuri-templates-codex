import tempfile
import unittest
from pathlib import Path

from scripts.resolve_script_markers import render_final_script


class ResolveScriptMarkersTests(unittest.TestCase):
    def test_render_final_script_inserts_asset_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            script_path.write_text("[INFO:1] 仕組みの図\n", encoding="utf-8")
            output_path = root / "final.md"
            render_final_script(
                script_path=script_path,
                output_path=output_path,
                markers=[{"id": "INFO:1", "status": "downloaded", "local_path": "../assets/demo/info_1.png"}],
            )
            self.assertIn("![info_1](../assets/demo/info_1.png)", output_path.read_text(encoding="utf-8"))

    def test_render_final_script_keeps_warning_for_failed_marker(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            script_path.write_text("[INFO:2] 耐性の図\n", encoding="utf-8")
            output_path = root / "final.md"
            render_final_script(
                script_path=script_path,
                output_path=output_path,
                markers=[{"id": "INFO:2", "status": "failed_permanent", "desc": "耐性の図"}],
            )
            self.assertIn("素材生成失敗", output_path.read_text(encoding="utf-8"))

    def test_render_final_script_inserts_multiple_derived_images(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script.md"
            script_path.write_text("[SLIDE:1] まとめ\n", encoding="utf-8")
            output_path = root / "final.md"
            render_final_script(
                script_path=script_path,
                output_path=output_path,
                markers=[{
                    "id": "SLIDE:1",
                    "status": "downloaded",
                    "local_path": "../assets/demo/slide_1_p01.png",
                    "derived_local_paths": ["../assets/demo/slide_1_p01.png", "../assets/demo/slide_1_p02.png"],
                }],
            )
            text = output_path.read_text(encoding="utf-8")
            self.assertIn("slide_1_p01", text)
            self.assertIn("slide_1_p02", text)


if __name__ == "__main__":
    unittest.main()
