from __future__ import annotations

import argparse


ERROR_MESSAGE = (
    "fallback 画像生成は無効です。NotebookLM 純正 artifact のみ合格扱いにできます。"
    "失敗 marker は failed_permanent / download_failed のまま残し、"
    "scripts/manual_intervention_helper.py で desc 修正候補と retry コマンドを確認してください。"
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Report that fallback card generation is disabled.")
    parser.add_argument("--output", required=False)
    parser.add_argument("--title", required=False)
    parser.add_argument("--lead", required=False)
    parser.add_argument("--accent", default="#1f8a70")
    parser.add_argument("--bullet", action="append", default=[])
    parser.parse_args()
    print(ERROR_MESSAGE)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
