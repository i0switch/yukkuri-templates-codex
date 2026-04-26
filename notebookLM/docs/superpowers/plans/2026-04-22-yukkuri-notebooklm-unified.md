# Yukkuri NotebookLM Unified Factory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified root-level Claude Code project that generates Yukkuri and Zundamon/Metan scripts, plans NotebookLM assets, downloads generated artifacts, and audits the final output per style.

**Architecture:** Keep the existing two prototype folders untouched and create a new root-level implementation that reuses their best assets. Put long-lived logic in Python scripts, use `.claude/commands` as the operator UI, keep NotebookLM automation CLI-first with optional MCP wiring, and track every style run with a dedicated `run_state.json` inside `workspace/projects/<slug>/<style>/state/`.

**Tech Stack:** Python 3.11, `unittest`, `notebooklm-mcp-cli`, Claude Code command docs, JSON config files, Markdown templates, PowerShell + shell bootstrap scripts.

---

> Note: `C:\Users\i0swi\Desktop\ゆっくり＆ずんだもん` is not a git repository at planning time, so this plan omits commit steps and focuses on runnable file changes and verification commands.

## File Structure

### Create at project root
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/CLAUDE.md` — unified operator instructions for the new root project
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md` — quick-start and workflow overview
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/mcp.json` — NotebookLM MCP server definition
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/pyproject.toml` — Python project settings for the unified root
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.env.example` — NotebookLM-related environment hints
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.gitignore` — unified ignore rules

### Create command and skill assets
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/generate-script.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/audit.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/skills/yukkuri-notebooklm-orchestrator/SKILL.md`

### Create reusable assets
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/characters.json`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/asset-types.json`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/quality-criteria.json`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/project_brief.template.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/script_request.template.yaml`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/yukkuri-template.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/zundamon-metan-template.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/asset-marker-spec.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/script-generation-prompt.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/asset-request-prompt.md`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/audit-prompt.md`

### Create Python logic at the unified root
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/init_project.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_asset_manifest.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_audit_report.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/resolve_script_markers.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_windows.ps1`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_unix.sh`

### Create tests
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_init_project.py`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_asset_manifest.py`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_resolve_script_markers.py`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_runner.py`
- `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_audit_report.py`

---

### Task 1: Scaffold the unified root project

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/CLAUDE.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/mcp.json`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/pyproject.toml`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.env.example`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.gitignore`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/characters.json`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/asset-types.json`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config/quality-criteria.json`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/project_brief.template.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/script_request.template.yaml`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/yukkuri-template.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/zundamon-metan-template.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates/asset-marker-spec.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/script-generation-prompt.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/asset-request-prompt.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts/audit-prompt.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/generate-script.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/prepare-assets.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/fetch-assets.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/audit.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands/run-all.md`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/skills/yukkuri-notebooklm-orchestrator/SKILL.md`

- [ ] **Step 1: Create the root metadata files**

```json
// C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/mcp.json
{
  "mcpServers": {
    "notebooklm-mcp": {
      "command": "notebooklm-mcp"
    }
  }
}
```

```toml
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/pyproject.toml
[project]
name = "yukkuri-notebooklm-unified"
version = "0.1.0"
description = "Unified Claude Code + NotebookLM factory for Yukkuri and Zundamon/Metan scripts"
requires-python = ">=3.11"
dependencies = []

[tool.uv]
package = false
```

```env
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.env.example
NOTEBOOKLM_HL=ja
# NLM_PROFILE=default
# NOTEBOOKLM_QUERY_TIMEOUT=180
```

```gitignore
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.gitignore
__pycache__/
*.pyc
.venv/
.env
workspace/projects/*/downloads/
workspace/projects/*/yukkuri/materials/generated/
workspace/projects/*/zundamon/materials/generated/
workspace/projects/*/tmp/
.notebooklm-mcp-cli/
```

- [ ] **Step 2: Copy and adapt the reusable config/template/prompt assets into the new root**

```bash
mkdir -p "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config" \
  "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/templates" \
  "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/prompts" \
  "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands" \
  "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/skills/yukkuri-notebooklm-orchestrator"
```

```markdown
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/README.md
# Yukkuri NotebookLM Unified Factory

## Quick start
1. `powershell -ExecutionPolicy Bypass -File scripts/bootstrap_windows.ps1`
2. Open this folder in Claude Code
3. Run `/generate-script テーマ：... / スタイル：both`
4. Run `/prepare-assets <slug>`
5. Run `/fetch-assets <slug>`
6. Run `/audit <slug>`

## Modes
- Step mode: `/generate-script` → `/prepare-assets` → `/fetch-assets` → `/audit`
- Auto mode: `/run-all`
```

```markdown
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/CLAUDE.md
# Unified factory instructions

## Purpose
Generate per-style scripts, asset manifests, NotebookLM outputs, and audit reports under `workspace/projects/<slug>/`.

## Rules
- Keep `cc-yukkuri-notebooklm-starter/` and `yukkuri-zundamon-factory/` untouched.
- Write all new outputs to the root-level unified structure.
- Track each style in `workspace/projects/<slug>/<style>/state/run_state.json`.
- Use NotebookLM CLI commands as the source of truth.
- If `nlm login --check` fails, stop and record the recovery step instead of faking success.
```

- [ ] **Step 3: Create the command docs with the new style-aware paths**

```markdown
---
description: テーマから style ごとの台本を生成
argument-hint: テーマ：<自由文> / スタイル：<yukkuri|zundamon|both> [/ 尺：<分>]
---

# /generate-script
1. Parse theme, style, and optional duration.
2. Run `python scripts/init_project.py --title <title> --theme <theme>` if the project does not exist.
3. Generate `workspace/projects/<slug>/yukkuri/script/script_v1.md` and/or `workspace/projects/<slug>/zundamon/script/script_v1.md`.
4. Update `workspace/projects/<slug>/<style>/state/run_state.json`.
```

```markdown
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/skills/yukkuri-notebooklm-orchestrator/SKILL.md
---
name: yukkuri-notebooklm-orchestrator
description: Orchestrate script generation, asset planning, NotebookLM execution, final merge, and audit for per-style projects.
---

Read the root `CLAUDE.md`, then operate only inside `workspace/projects/<slug>/`.
Prefer step mode unless the user explicitly asks for `/run-all`.
Never claim NotebookLM success unless `run_state.json` and the downloaded files agree.
```

- [ ] **Step 4: Verify the scaffold exists before moving to logic**

Run: `rtk ls -la "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん" && rtk ls -la "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/.claude/commands" && rtk ls -la "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/config"`

Expected: The root project files plus `.claude/commands`, `config`, `templates`, and `prompts` all exist.

---

### Task 2: Build the style-aware project initializer

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/init_project.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_init_project.py`

- [ ] **Step 1: Write the failing tests for project creation**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_init_project.py
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest tests/test_init_project.py -v`
Expected: FAIL with `ModuleNotFoundError` or `cannot import name 'initialize_project'`.

- [ ] **Step 3: Write the minimal initializer implementation**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/init_project.py
from __future__ import annotations

import argparse
import json
from pathlib import Path


def slugify(value: str) -> str:
    cleaned: list[str] = []
    prev_dash = False
    for ch in value.strip().lower():
        if ch.isalnum():
            cleaned.append(ch)
            prev_dash = False
        elif ch in {" ", "_", "-", "."}:
            if not prev_dash:
                cleaned.append("-")
                prev_dash = True
    slug = "".join(cleaned).strip("-")
    return slug or "new-project"


def _write_if_missing(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def initialize_project(root: Path, title: str, theme: str) -> str:
    slug = slugify(title)
    project_dir = root / "workspace" / "projects" / slug
    for rel in [
        Path("research"),
        Path("yukkuri/script"),
        Path("yukkuri/materials/manifest"),
        Path("yukkuri/materials/notebooklm"),
        Path("yukkuri/materials/generated"),
        Path("yukkuri/materials/audit"),
        Path("yukkuri/final"),
        Path("yukkuri/state"),
        Path("zundamon/script"),
        Path("zundamon/materials/manifest"),
        Path("zundamon/materials/notebooklm"),
        Path("zundamon/materials/generated"),
        Path("zundamon/materials/audit"),
        Path("zundamon/final"),
        Path("zundamon/state"),
    ]:
        (project_dir / rel).mkdir(parents=True, exist_ok=True)

    _write_if_missing(project_dir / "project_brief.md", f"# プロジェクト概要\n\n- タイトル: {title}\n- テーマ: {theme}\n")
    _write_if_missing(
        project_dir / "request.yaml",
        "\n".join([
            f"slug: {slug}",
            f"title: {title}",
            f"theme: {theme}",
            "audience: 初心者",
            "duration_minutes: 8",
            "formats:",
            "  - yukkuri",
            "  - zundamon",
            "reference_urls: []",
        ]) + "\n",
    )
    _write_if_missing(project_dir / "research" / "research_notes.md", "# research_notes\n")

    base_state = {
        "slug": slug,
        "script_path": None,
        "notebook": {"id": None, "title": None, "status": "pending"},
        "stages": {
            "script_generation": {"status": "pending"},
            "asset_planning": {"status": "pending"},
            "notebooklm_upload": {"status": "pending"},
            "asset_generation": {"status": "pending"},
            "asset_download": {"status": "pending"},
            "audit": {"status": "pending"},
        },
        "markers": [],
    }
    for style in ("yukkuri", "zundamon"):
        state_path = project_dir / style / "state" / "run_state.json"
        if not state_path.exists():
            state = dict(base_state)
            state["style"] = style
            state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return slug


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--theme", required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    slug = initialize_project(root=root, title=args.title, theme=args.theme)
    print(f"Initialized project: {root / 'workspace' / 'projects' / slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m unittest tests/test_init_project.py -v`
Expected: PASS

---

### Task 3: Generate style-specific asset manifests from script files

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_asset_manifest.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_asset_manifest.py`

- [ ] **Step 1: Write the failing tests for scene parsing and manifest output**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_asset_manifest.py
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest tests/test_build_asset_manifest.py -v`
Expected: FAIL with `ModuleNotFoundError` or `cannot import name 'build_manifest'`.

- [ ] **Step 3: Write the manifest builder**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_asset_manifest.py
from __future__ import annotations

import argparse
import re
from pathlib import Path

SCENE_RE = re.compile(r"^##\s+(.+?)（([0-9:–-]+)）$", flags=re.MULTILINE)
MARKER_RE = re.compile(r"^\[(FIG|INFO|MAP|SLIDE|VIDEO):(\d+)\]\s+(.+)$", flags=re.MULTILINE)


def _split_scenes(text: str) -> list[tuple[str, str, str]]:
    matches = list(SCENE_RE.finditer(text))
    scenes: list[tuple[str, str, str]] = []
    for idx, match in enumerate(matches, start=1):
        start = match.end()
        end = matches[idx].start() if idx < len(matches) else len(text)
        header = match.group(1)
        timing = match.group(2)
        body = text[start:end].strip()
        scene_title = header.split("：", 1)[-1] if "：" in header else header
        scenes.append((str(idx).zfill(2), scene_title.strip(), f"{timing}\n{body}"))
    return scenes


def _primary_candidate(scene_body: str) -> str:
    marker_match = MARKER_RE.search(scene_body)
    if not marker_match:
        return "infographic"
    marker_type = marker_match.group(1)
    return {
        "FIG": "infographic",
        "INFO": "infographic",
        "MAP": "mind_map",
        "SLIDE": "slide_deck",
        "VIDEO": "video",
    }[marker_type]


def build_manifest(script_path: Path) -> Path:
    text = script_path.read_text(encoding="utf-8")
    scenes = _split_scenes(text)
    project_style_dir = script_path.parents[1]
    manifest_path = project_style_dir / "materials" / "manifest" / "asset_manifest.yaml"
    lines = [
        "project:",
        f"  slug: {script_path.parents[3].name}",
        f"  style: {project_style_dir.name}",
        "",
        "assets:",
    ]
    for scene_id, scene_title, scene_body in scenes:
        summary = " ".join(line.strip() for line in scene_body.splitlines() if line.strip())[:120].replace('"', "'")
        primary = _primary_candidate(scene_body)
        lines.extend([
            f'  - scene_id: "{scene_id}"',
            f'    scene_title: "{scene_title}"',
            '    insert_timing: "auto"',
            '    intent: "このシーンで視聴者に理解させたい要点"',
            f'    narration_summary: "{summary}"',
            '    asset_type:',
            f'      - {primary}',
            '    notebooklm_candidate:',
            f'      primary: {primary}',
            '      secondary: report',
            '    must_include:',
            f'      - "{scene_title}"',
            '    avoid:',
            '      - "台本の主張とズレる図解"',
            '    audit_points:',
            '      - "Scene の主張と一致しているか"',
            '      - "一目で理解できるか"',
            '    retry_prompt_seed: "この Scene の要点が一目で伝わる構造に修正する"',
        ])
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return manifest_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", required=True)
    args = parser.parse_args()
    manifest_path = build_manifest(Path(args.script).resolve())
    print(f"Wrote: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m unittest tests/test_build_asset_manifest.py -v`
Expected: PASS

---

### Task 4: Resolve markers into final outputs

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/resolve_script_markers.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_resolve_script_markers.py`

- [ ] **Step 1: Write the failing tests for downloaded and failed markers**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_resolve_script_markers.py
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


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest tests/test_resolve_script_markers.py -v`
Expected: FAIL with `ModuleNotFoundError` or `cannot import name 'render_final_script'`.

- [ ] **Step 3: Write the marker resolver**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/resolve_script_markers.py
from __future__ import annotations

from pathlib import Path


def _render_marker_block(marker: dict[str, str]) -> str:
    marker_id = marker["id"]
    if marker["status"] == "downloaded":
        local_path = marker["local_path"]
        stem = Path(local_path).stem
        if local_path.endswith(".png"):
            return f"![{stem}]({local_path})"
        return f"[{Path(local_path).name}]({local_path})"
    desc = marker.get("desc", "手動配置が必要")
    return "\n".join([
        "> ⚠️ **素材生成失敗**：この位置に手動で素材を配置してください。",
        f"> 要求内容：{desc}",
    ])


def render_final_script(script_path: Path, output_path: Path, markers: list[dict[str, str]]) -> None:
    text = script_path.read_text(encoding="utf-8")
    blocks = {marker["id"]: _render_marker_block(marker) for marker in markers}
    lines: list[str] = []
    for raw_line in text.splitlines():
        lines.append(raw_line)
        if raw_line.startswith("[") and "]" in raw_line:
            marker_id = raw_line.split("]", 1)[0][1:]
            if marker_id in blocks:
                lines.append("")
                lines.append(blocks[marker_id])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m unittest tests/test_resolve_script_markers.py -v`
Expected: PASS

---

### Task 5: Add the NotebookLM CLI runner

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_windows.ps1`
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_unix.sh`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_runner.py`

- [ ] **Step 1: Write the failing tests for command construction and state updates**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_runner.py
import json
import tempfile
import unittest
from pathlib import Path

from scripts.notebooklm_runner import build_create_notebook_command, update_stage_status


class NotebookLmRunnerTests(unittest.TestCase):
    def test_build_create_notebook_command(self):
        self.assertEqual(
            build_create_notebook_command("demo-zundamon"),
            ["nlm", "notebook", "create", "demo-zundamon"],
        )

    def test_update_stage_status(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "run_state.json"
            state_path.write_text(json.dumps({"stages": {"asset_generation": {"status": "pending"}}}), encoding="utf-8")
            update_stage_status(state_path, "asset_generation", "done")
            payload = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["stages"]["asset_generation"]["status"], "done")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest tests/test_notebooklm_runner.py -v`
Expected: FAIL with `ModuleNotFoundError` or `cannot import name 'build_create_notebook_command'`.

- [ ] **Step 3: Write the minimal NotebookLM runner module**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/notebooklm_runner.py
from __future__ import annotations

import json
from pathlib import Path


def build_create_notebook_command(title: str) -> list[str]:
    return ["nlm", "notebook", "create", title]


def build_add_text_source_command(notebook_id: str, script_path: Path, title: str) -> list[str]:
    return ["nlm", "source", "add", notebook_id, "--file", str(script_path), "--title", title]


def build_artifact_create_command(kind: str, notebook_id: str) -> list[str]:
    mapping = {
        "infographic": ["nlm", "infographic", "create", notebook_id, "--orientation", "landscape", "--confirm"],
        "slide_deck": ["nlm", "slides", "create", notebook_id, "--confirm"],
        "mind_map": ["nlm", "mindmap", "create", notebook_id, "--confirm"],
        "video": ["nlm", "video", "create", notebook_id, "--format", "explainer", "--style", "classic", "--confirm"],
    }
    return mapping[kind]


def update_stage_status(state_path: Path, stage: str, status: str) -> None:
    payload = json.loads(state_path.read_text(encoding="utf-8"))
    payload.setdefault("stages", {}).setdefault(stage, {})["status"] = status
    state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
```

```powershell
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_windows.ps1
$ErrorActionPreference = "Stop"
uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp
Write-Host "NotebookLM setup complete."
```

```bash
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/bootstrap_unix.sh
#!/usr/bin/env bash
set -euo pipefail
uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp
echo "NotebookLM setup complete."
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m unittest tests/test_notebooklm_runner.py -v`
Expected: PASS

---

### Task 6: Build the audit report generator for final outputs

**Files:**
- Create: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_audit_report.py`
- Test: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_audit_report.py`

- [ ] **Step 1: Write the failing test for a basic audit report**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_audit_report.py
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
                "markers": [{"id": "INFO:1", "status": "downloaded", "local_path": "../assets/demo/info_1.png"}],
            }, ensure_ascii=False), encoding="utf-8")
            report_path = build_audit_report(script_path, final_path, state_path, assets_dir)
            report = report_path.read_text(encoding="utf-8")
            self.assertIn("総合判定", report)
            self.assertIn("INFO:1", report)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m unittest tests/test_build_audit_report.py -v`
Expected: FAIL with `ModuleNotFoundError` or `cannot import name 'build_audit_report'`.

- [ ] **Step 3: Write the audit report builder**

```python
# C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/scripts/build_audit_report.py
from __future__ import annotations

import json
from pathlib import Path


def build_audit_report(script_path: Path, final_path: Path, state_path: Path, assets_dir: Path) -> Path:
    state = json.loads(state_path.read_text(encoding="utf-8"))
    marker_lines = []
    for marker in state.get("markers", []):
        marker_lines.append(f"- {marker['id']}: {marker['status']}")
    summary = "✅ PASS" if final_path.exists() else "❌ FAIL"
    report_path = final_path.parent / "audit_report_v1.md"
    report_path.write_text(
        "\n".join([
            "# 監査レポート",
            "",
            f"- **style**: {state.get('style', 'unknown')}",
            f"- **総合判定**: {summary}",
            "",
            "## マーカー状況",
            *marker_lines,
        ]) + "\n",
        encoding="utf-8",
    )
    return report_path
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m unittest tests/test_build_audit_report.py -v`
Expected: PASS

---

### Task 7: Run the end-to-end offline smoke test

**Files:**
- Verify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_init_project.py`
- Verify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_asset_manifest.py`
- Verify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_resolve_script_markers.py`
- Verify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_notebooklm_runner.py`
- Verify: `C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/tests/test_build_audit_report.py`

- [ ] **Step 1: Run the full unit test suite**

Run: `python -m unittest discover -s tests -v`
Expected: PASS with all five test modules green.

- [ ] **Step 2: Run a real project initialization smoke test**

Run: `python scripts/init_project.py --title "caffeine mechanism" --theme "カフェインが眠気を妨げる仕組み"`
Expected: prints `Initialized project:` and creates `workspace/projects/caffeine-mechanism/`.

- [ ] **Step 3: Run manifest generation against a real script fixture**

Create this fixture first:

```markdown
---
title: カフェインが目を覚ます仕組み
style: zundamon
slug: caffeine-mechanism
created: 2026-04-22
duration_target_min: 8
---

# カフェインが目を覚ます仕組み

## ツカミ（0:00–0:30）

**ずんだもん**：なんでコーヒーで目が覚めるのだ？

[FIG:1] カフェインの全体像

## セクション1：受容体（0:30–2:00）

**めたん**：アデノシン受容体を先取りするのですわ。

[INFO:1] 受容体と競合阻害
```

Save it to:
`C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/workspace/projects/caffeine-mechanism/zundamon/script/script_v1.md`

Then run: `python scripts/build_asset_manifest.py --script "C:/Users/i0swi/Desktop/ゆっくり＆ずんだもん/workspace/projects/caffeine-mechanism/zundamon/script/script_v1.md"`

Expected: writes `workspace/projects/caffeine-mechanism/zundamon/materials/manifest/asset_manifest.yaml`.

- [ ] **Step 4: Note the manual NotebookLM smoke gate**

Run: `nlm login --check`
Expected: either PASS, or a clear authentication failure that the new root `CLAUDE.md` and `README.md` already explain how to recover from.

---

## Self-Review Checklist

### Spec coverage
- Root scaffolding and operator docs: Task 1
- Style-specific project model: Task 2
- Asset manifest generation: Task 3
- Final merge and placeholder behavior: Task 4
- NotebookLM CLI-first execution: Task 5
- Audit generation: Task 6
- Offline verification and smoke testing: Task 7

### Placeholder scan
- No `TODO`, `TBD`, or `implement later`
- No unresolved type names or function names outside these tasks
- No references to git commits, since the target folder is not a git repository

### Type consistency
- `initialize_project`, `build_manifest`, `render_final_script`, `build_create_notebook_command`, `update_stage_status`, and `build_audit_report` are introduced before use and keep the same names throughout the plan
