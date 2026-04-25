import tempfile
import unittest
from pathlib import Path
import json

from scripts.validate_script import validate_script


VALID_SCRIPT = """---
title: カフェインの仕組み
style: zundamon
slug: caffeine-demo
created: 2026-04-24
duration_target_min: 8
---

# カフェインの仕組み

## ツカミ（0:00–0:30）

**ずんだもん**：ボク、カフェインってなんで眠気が飛ぶのか気になるのだ？
**めたん**：順番に見るとかなりわかりやすいですわ。

[FIG:1] 全体像

## セクション1：受容体（0:30–2:00）

**ずんだもん**：ボク、まず何が止まるのだ？
**めたん**：眠気を伝えるアデノシン受容体ですわ。
**ずんだもん**：ボク、それがブロックされると眠気が届きにくいのだ？
**めたん**：そういう理解で大丈夫ですわ。

[INFO:1] 受容体ブロック

## セクション2：神経伝達（2:00–4:00）

**ずんだもん**：ボク、次は脳の反応なのだ？
**めたん**：覚醒寄りの神経活動が目立ちやすくなるのですわ。
**ずんだもん**：ボク、だから集中した気になるのだ？
**めたん**：ただし無限に元気になるわけではないですわ。

[MAP:1] 関係図

## セクション3：注意点（4:00–6:00）

**ずんだもん**：ボク、飲みすぎるとどうなるのだ？
**めたん**：動悸や睡眠悪化につながることがありますわ。
**ずんだもん**：ボク、タイミング管理が大事なのだ。
**めたん**：その通りですわ。

[INFO:2] 注意点

## まとめ（6:00–7:00）

**ずんだもん**：ボク、結局は眠気の信号を弱めるってことなのだ！
**めたん**：要点を3つで整理すると理解しやすいですわ。

[SLIDE:1] 要点3つ
"""


class ValidateScriptTests(unittest.TestCase):
    def _quality_path(self, root: Path) -> Path:
        path = root / "quality.json"
        path.write_text(json.dumps({
            "script_quality": {
                "min_chars": 200,
                "max_chars": 10000,
                "min_sections": 3,
                "max_sections": 8,
                "min_markers": 4,
                "min_markers_per_minute": 0.5,
                "long_form_threshold_min": 10,
                "long_form_min_markers_per_content_section": 2,
                "max_consecutive_lines_per_character": 3,
                "mandatory_markers": ["FIG:1", "SLIDE:1"],
            },
            "character_consistency": {
                "yukkuri": {"banned_speakers": ["ずんだもん", "めたん"]},
                "zundamon": {
                    "banned_speakers": ["霊夢", "魔理沙"],
                    "zundamon_first_person_required": "ボク",
                },
            },
            "asset_quality": {"min_file_size_kb": 1, "failed_marker_max_ratio": 0.3, "mime_type_check": True},
            "retry_limits": {},
            "timeouts": {},
            "budget": {},
        }, ensure_ascii=False), encoding="utf-8")
        return path

    def test_validate_script_accepts_valid_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script_v1.md"
            script_path.write_text(VALID_SCRIPT, encoding="utf-8")
            result = validate_script(script_path, quality_path=self._quality_path(root))
            self.assertTrue(result["ok"])

    def test_validate_script_rejects_wrong_speaker(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script_v1.md"
            script_path.write_text(VALID_SCRIPT.replace("**めたん**", "**魔理沙**", 1), encoding="utf-8")
            result = validate_script(script_path, quality_path=self._quality_path(root))
            self.assertFalse(result["ok"])
            self.assertTrue(any("style に合わない話者" in line or "禁止話者" in line for line in result["errors"]))

    def test_validate_script_rejects_long_form_with_too_few_markers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            script_path = root / "script_v1.md"
            script_path.write_text(VALID_SCRIPT.replace("duration_target_min: 8", "duration_target_min: 15"), encoding="utf-8")
            result = validate_script(script_path, quality_path=self._quality_path(root))
            self.assertFalse(result["ok"])
            self.assertTrue(any("尺に対してマーカー数が不足" in line for line in result["errors"]))
            self.assertTrue(any("各本編セクションに最低" in line for line in result["errors"]))


if __name__ == "__main__":
    unittest.main()
