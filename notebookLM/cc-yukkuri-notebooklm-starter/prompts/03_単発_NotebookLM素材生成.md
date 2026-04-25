`materials/asset_manifest.yaml` を読み、NotebookLM で生成すべき素材を整理してください。

やること:
1. Scene ごとに NotebookLM に投入する短い要約文を作る
2. notebook の分け方を決める
3. MCP が使えるなら、実行順に必要な NotebookLM 操作を行う
4. 使えないなら、`nlm` CLI で実行すべきコマンド列を `materials/notebooklm/runbook.md` に書く
5. ダウンロード先を `materials/generated/` 配下に統一する

注意:
- 生成結果は即採用しない
- 必ず後で監査できるよう、Scene ID と成果物を対応づける
