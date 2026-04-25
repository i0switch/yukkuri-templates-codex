import unittest
from pathlib import Path

from scripts.notebooklm_runner import (
    build_download_artifact_command,
    parse_created_artifact_id,
    parse_created_notebook_id,
    parse_setup_allows_claude_code,
    parse_studio_status_payload,
)


class NotebookLmCliRuntimeTests(unittest.TestCase):
    def test_parse_created_notebook_id(self):
        output = "✓ Created notebook: demo\n  ID: abc-123\n"
        self.assertEqual(parse_created_notebook_id(output), "abc-123")

    def test_parse_created_artifact_id(self):
        output = "✓ Infographic generation started\n  Artifact ID: art-1\n"
        self.assertEqual(parse_created_artifact_id(output), "art-1")

    def test_parse_setup_allows_claude_code_for_connected_or_unknown(self):
        setup_output = "Claude Code | Anthropic CLI | ? | claude mcp list\n"
        self.assertTrue(parse_setup_allows_claude_code(setup_output, claude_mcp_output="notebooklm-mcp: notebooklm-mcp - ✓ Connected"))
        self.assertFalse(parse_setup_allows_claude_code(setup_output, claude_mcp_output="context7: connected"))

    def test_parse_studio_status_payload_accepts_list_output(self):
        payload = parse_studio_status_payload('[{"id":"art-1","type":"infographic","status":"completed"}]')
        self.assertEqual(payload["artifacts"][0]["id"], "art-1")

    def test_build_download_artifact_command_uses_id_flag(self):
        self.assertEqual(
            build_download_artifact_command("slide_deck", "demo-notebook", "artifact-1", Path("slides.pdf")),
            ["nlm", "download", "slide-deck", "demo-notebook", "--id", "artifact-1", "--output", "slides.pdf"],
        )

    def test_parse_created_notebook_id_returns_none_without_match(self):
        self.assertIsNone(parse_created_notebook_id("no id here"))


if __name__ == "__main__":
    unittest.main()
