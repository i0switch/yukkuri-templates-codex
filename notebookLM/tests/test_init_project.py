import tempfile
import unittest
from pathlib import Path

from scripts.init_project import initialize_project


class InitProjectTests(unittest.TestCase):
    def test_initialize_project_creates_both_style_trees(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slug = initialize_project(
                root=root,
                title="caffeine mechanism",
                theme="カフェインが眠気を妨げる仕組み",
            )
            self.assertEqual(slug, "caffeine-mechanism")
            self.assertTrue((root / "workspace" / "projects" / slug / "yukkuri" / "state" / "run_state.json").exists())
            self.assertTrue((root / "workspace" / "projects" / slug / "zundamon" / "state" / "run_state.json").exists())

    def test_initialize_project_creates_request_yaml(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slug = initialize_project(root=root, title="sleep mechanism", theme="睡眠の仕組み")
            request_path = root / "workspace" / "projects" / slug / "request.yaml"
            self.assertIn("theme: 睡眠の仕組み", request_path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
