from __future__ import annotations

import argparse
import json
from pathlib import Path


def _render_marker_block(marker: dict[str, str]) -> str:
    if marker.get("status") == "downloaded":
        derived_local_paths = marker.get("derived_local_paths") or []
        if derived_local_paths:
            rendered_blocks: list[str] = []
            for derived_path in derived_local_paths:
                stem = Path(derived_path).stem
                if derived_path.endswith(".png"):
                    rendered_blocks.append(f"![{stem}]({derived_path})")
                else:
                    rendered_blocks.append(f"[{Path(derived_path).name}]({derived_path})")
            return "\n\n".join(rendered_blocks)

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
    marker_blocks = {marker["id"]: _render_marker_block(marker) for marker in markers}
    lines: list[str] = []
    for raw_line in script_path.read_text(encoding="utf-8").splitlines():
        lines.append(raw_line)
        if raw_line.startswith("[") and "]" in raw_line:
            marker_id = raw_line.split("]", 1)[0][1:]
            if marker_id in marker_blocks:
                lines.append("")
                lines.append(marker_blocks[marker_id])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Render a final script by resolving marker blocks.")
    parser.add_argument("--script", required=True)
    parser.add_argument("--state", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    state = json.loads(Path(args.state).read_text(encoding="utf-8"))
    render_final_script(
        script_path=Path(args.script),
        output_path=Path(args.output),
        markers=state.get("markers", []),
    )
    print(f"Wrote: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
