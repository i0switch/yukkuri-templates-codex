import tempfile
import unittest
from pathlib import Path

from scripts.build_asset_manifest import build_manifest


SCRIPT_TEXT = """---
title: テスト
style: zundamon
slug: test
created: 2026-04-22
duration_target_min: 8
---

# テスト

## ツカミ（0:00–0:30）

**ずんだもん**：はじまりなのだ。

[FIG:1] タイトルカード

## セクション1：仕組み（0:30–2:00）

**めたん**：解説ですわ。

[INFO:1] 仕組みの図解
"""


class BuildAssetManifestTests(unittest.TestCase):
    def test_build_manifest_creates_asset_manifest_yaml(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "workspace" / "projects" / "demo" / "zundamon" / "script" / "script_v1.md"
            script_path.parent.mkdir(parents=True, exist_ok=True)
            script_path.write_text(SCRIPT_TEXT, encoding="utf-8")
            manifest_path = build_manifest(script_path)
            text = manifest_path.read_text(encoding="utf-8")
            self.assertIn('scene_id: "01"', text)
            self.assertIn('scene_title: "ツカミ"', text)
            self.assertIn('primary: infographic', text)


if __name__ == "__main__":
    unittest.main()
