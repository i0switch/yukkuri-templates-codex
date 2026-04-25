import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.build_audit_report import build_audit_report
from scripts.fetch_assets import fetch_style_assets
from scripts.init_project import initialize_project
from scripts.prepare_assets import prepare_style_assets


SCRIPT_TEXT = """---
title: テスト案件
style: zundamon
slug: test-project
created: 2026-04-24
duration_target_min: 6
---

# テスト案件

## ツカミ（0:00–0:30）

**ずんだもん**：ボク、この仕組みがどう動くのか知りたいのだ。前提から結果までつながって見えると理解しやすいのだ。
**めたん**：今日は全体像から順番に整理するですわ。どこで判断して何を残すかまで追えば、流れを誤解しにくいのですわ。
**ずんだもん**：ボク、最初の見取り図があると助かるのだ。あとで細かい話が増えても、戻る基準があると迷わないのだ。
**めたん**：まずは流れを俯瞰すると理解しやすいですわ。入力、処理、監査の三層で見ると全体像がかなり安定して見えるのですわ。

この Scene では、あとで細部に入っても迷わないように、最初に全体の地図を視聴者へ渡す。どの段で何を決めるかを先に置くことで、後半の説明が重くなっても理解の軸が残る。

[FIG:1] 全体像

## セクション1：入力（0:30–2:00）

**ずんだもん**：ボク、最初に何が入ってくるのだ？テーマ、視聴者、尺みたいな条件が土台になるのだ？
**めたん**：入力条件と前提情報が最初にそろうのですわ。ここで要求を曖昧にすると、台本も素材も監査も全部ブレやすくなるのですわ。
**ずんだもん**：ボク、そこがズレると後ろも全部ズレるのだ。つまり最初の解像度不足が、そのまま手戻りの原因になるのだ。
**めたん**：その認識で大丈夫ですわ。条件を固める段が大事ですのよ。あとから直すより、最初に必須条件を固定する方がずっと安く済むのですわ。

ここでは、入力条件を確定しないまま先へ進むと、あとで素材差し戻しや台本修正が連鎖することを強調する。動画制作の自動化でも、最初の要求定義が一番コストに効く。

[INFO:1] 入力条件

## セクション2：処理（2:00–4:00）

**ずんだもん**：ボク、処理の中では何が起きるのだ？台本の論点を分けて、素材の置きどころまで先回りする感じなのだ？
**めたん**：情報を分類して、必要なものだけ順に処理するのですわ。Scene ごとに何を見せると理解が進むかまで決めると、NotebookLM への要求も安定するのですわ。
**ずんだもん**：ボク、つまり整理しながら前に進むのだ。ぐちゃっと投げるより、Scene ごとに責務を分けた方が再現しやすいのだ。
**めたん**：そうですわ。途中で監査ポイントも持つのが重要ですのよ。生成前から見る観点を決めておけば、あとで良し悪しを言語化しやすいのですわ。

この Scene の目的は、単に処理が走ることではなく、Scene ごとの意図と素材要求が結びつくことを見せる点にある。後段の監査で困らないように、中間情報を残す意味もここで伝える。

[INFO:2] 処理の流れ

## セクション3：監査（4:00–6:00）

**ずんだもん**：ボク、最後は何を見れば安心なのだ？出力された素材が意図どおりか、リンクが切れていないか、その辺なのだ？
**めたん**：出力の整合性と、抜け漏れがないかを確認するのですわ。台本、state、最終台本、生成物が同じ事実を指している状態を作るのが大事ですわ。
**ずんだもん**：ボク、結果だけじゃなくて根拠も残すのだ。あとで retry するときに、どこで失敗したかすぐわかる方がいいのだ。
**めたん**：その通りですわ。再実行しやすい状態が完成形ですのよ。監査レポートが次の一手まで示してくれると、運用がかなり楽になるのですわ。

この Scene では、成功したかどうかだけでなく、なぜそう判断したかまで残すことが重要だと示す。自動化は一回通すだけでは弱く、再実行しやすい記録まで含めて仕組み化と呼べる。

[INFO:3] 監査観点

## まとめ（6:00–7:00）

**ずんだもん**：ボク、全体像と入力と監査を押さえればいいのだ！最初に条件を固めて、途中で迷わず、最後に整合性を取るのだ。
**めたん**：要点を三つに整理したスライドで締めるのがわかりやすいですわ。視聴者にも制作者にも、何が重要か一目で伝わる締め方になるのですわ。

まとめでは、入力、処理、監査の三段を一本の流れとして回収し、視聴者が動画を見終えたあとに再利用できる判断軸として残す。単なる感想ではなく、次の行動につながる締めにする。
制作側にとっても、どの段で何を確認すれば次の案件で再利用できるかがわかる締め方にして、運用の再現性まで持ち帰れるようにする。ここが最後の回収点なのだ。

[SLIDE:1] 要点3つ
"""


class OfflinePipelineTests(unittest.TestCase):
    def _fake_subprocess(self, command, cwd=None, capture_output=None, text=None, encoding=None, timeout=None):  # noqa: ANN001
        stdout = ""
        returncode = 0
        if command[:3] == ["nlm", "login", "--check"]:
            stdout = "✓ Authentication valid!"
        elif command[:3] == ["nlm", "setup", "list"]:
            stdout = "Claude Code | Anthropic CLI | ? | claude mcp list\nCodex CLI | OpenAI Codex CLI | - | codex mcp list\n"
        elif command[:3] == ["nlm", "notebook", "create"]:
            stdout = "✓ Created notebook: demo\n  ID: nb-offline\n"
        elif command[:3] == ["nlm", "source", "add"]:
            stdout = "✓ Source added\n"
        elif command[:3] == ["nlm", "infographic", "create"]:
            stdout = "✓ Infographic generation started\n  Artifact ID: art-info\n"
        elif command[:3] == ["nlm", "slides", "create"]:
            stdout = "✓ Slide generation started\n  Artifact ID: art-slide\n"
        elif command[:3] == ["nlm", "studio", "status"]:
            stdout = json.dumps([
                {"id": "art-info", "type": "infographic", "status": "completed", "created_at": "2026-04-24T10:00:00Z"},
                {"id": "art-slide", "type": "slide-deck", "status": "completed", "created_at": "2026-04-24T10:01:00Z"},
            ], ensure_ascii=False)
        elif command[:3] == ["nlm", "download", "infographic"]:
            output_path = Path(command[-1])
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(b"x" * 12000)
            stdout = "downloaded infographic"
        elif command[:3] == ["nlm", "download", "slide-deck"]:
            output_path = Path(command[-1])
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(b"x" * 12000)
            stdout = "downloaded slide deck"
        else:
            returncode = 1

        class Result:
            def __init__(self, returncode: int, stdout: str):
                self.returncode = returncode
                self.stdout = stdout
                self.stderr = ""

        return Result(returncode, stdout)

    @patch("scripts.notebooklm_runner.subprocess.run")
    def test_prepare_fetch_audit_pipeline_offline(self, mock_subprocess_run):
        mock_subprocess_run.side_effect = self._fake_subprocess
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            slug = initialize_project(root=root, title="test project", theme="テストテーマ")
            project_dir = root / "workspace" / "projects" / slug
            script_path = project_dir / "zundamon" / "script" / "script_v1.md"
            script_path.write_text(SCRIPT_TEXT, encoding="utf-8")

            prepare_result = prepare_style_assets(project_dir=project_dir, style="zundamon")
            self.assertFalse(prepare_result["needs_manual_recovery"])

            fetch_result = fetch_style_assets(project_dir=project_dir, style="zundamon")
            self.assertFalse(fetch_result["blocked"])

            report_path = build_audit_report(
                script_path=script_path,
                final_path=project_dir / "zundamon" / "final" / "final_script_v1.md",
                state_path=project_dir / "zundamon" / "state" / "run_state.json",
                assets_dir=project_dir / "zundamon" / "materials" / "generated",
            )
            self.assertTrue(report_path.exists())

            state = json.loads((project_dir / "zundamon" / "state" / "run_state.json").read_text(encoding="utf-8"))
            self.assertEqual(state["stages"]["notebooklm_upload"]["status"], "done")
            self.assertIn(state["stages"]["asset_generation"]["status"], {"done", "partial"})
            self.assertIn(state["stages"]["asset_download"]["status"], {"done", "partial"})
            self.assertTrue(any(flag in report_path.read_text(encoding="utf-8") for flag in ("PASS", "WARNING")))


if __name__ == "__main__":
    unittest.main()
