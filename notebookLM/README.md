# Yukkuri NotebookLM Unified Factory

`C:\Users\i0swi\Desktop\ゆっくり＆ずんだもん Codex` を本番対象として使う、Claude Code / Codex 向けの統合ワークスペース。
上位の `yukkuri-templates Codex` から呼び出す場合は、このフォルダを NotebookLM 素材生成用サブワークスペースとして扱い、生成済み素材だけを上位の `script/{episode_id}/assets/` へ反映する。

やることは 4 段。

1. テーマから style 別台本を作る
2. 台本を検証して NotebookLM 投入準備をする
3. NotebookLM で素材を生成・取得する
4. 最終台本と監査レポートを作る

## Entrypoints

- Claude Code: `CLAUDE.md` と `.claude/commands/*.md`
- Codex: `AGENTS.md`
- 共通状態管理: `workspace/projects/<slug>/<style>/state/run_state.json`

## Setup

### NotebookLM CLI / MCP

```powershell
uv tool install notebooklm-mcp-cli
nlm login
```

この repo にはローカル設定として `mcp.json` を置いてある。

```json
{
  "mcpServers": {
    "notebooklm-mcp": {
      "command": "notebooklm-mcp"
    }
  }
}
```

### Claude Code 側

```powershell
nlm setup add claude-code
```

`nlm setup list` で `Claude Code` が `?` のままでも、この repo では CLI 実行自体は進められる。
ただし MCP 接続が未確認なので、必要なら `claude mcp list` と合わせて確認する。

### Codex 側

Codex CLI は 2026-04-24 時点の `nlm setup list` では自動登録済み扱いにならない。
そのため Codex ではこの repo の `mcp.json` を参照して手動設定する前提にしている。

## Workflow

### 1. 案件作成

```powershell
python scripts/init_project.py --title "カフェインの仕組み" --theme "カフェインが眠気に与える影響"
```

### 2. 台本生成

台本本文はエージェントが作る。
生成時は必ず次を読む。

- `ゆっくり.txt`
- `ずんだもん.txt`
- `templates/yukkuri-template.md`
- `templates/zundamon-metan-template.md`
- `templates/asset-marker-spec.md`
- `config/characters.json`
- `config/quality-criteria.json`

生成後は機械検証する。

```powershell
python scripts/validate_script.py --script workspace/projects/<slug>/<style>/script/script_v1.md

長尺の visual ルール:

- 1 マーカー = 1 論点
- 60〜90 秒ごとに 1 つ以上の marker を置く
- 15 分前後なら `FIG` と `SLIDE` を含めて 10〜14 マーカーを目安にする
- 1 枚に情報を詰め込みすぎるより、複数画像に分ける
```

### 3. NotebookLM 準備

```powershell
python scripts/prepare_assets.py <slug> --style zundamon
```

やること:

- 台本検証
- marker 同期
- manifest 生成
- `nlm login --check`
- `nlm setup list`
- notebook 作成
- `nlm source add --wait`
- `materials/notebooklm/runbook.md` 更新

### 4. 素材生成と取得

```powershell
python scripts/fetch_assets.py <slug> --style zundamon
python scripts/fetch_assets.py <slug> --style zundamon --retry INFO:2
```

やること:

- 未解決 marker ごとに `nlm infographic|slides|mindmap|video create`
- `nlm studio status --json` でポーリング
- 成功 artifact だけ `materials/generated/` に保存
- `SLIDE` の PDF はダウンロード後に PNG へ画像化し、動画素材として使える形にする
- `final/final_script_v1.md` を再構成

### 5. 監査

```powershell
python scripts/build_audit_report.py --script workspace/projects/<slug>/<style>/script/script_v1.md --final workspace/projects/<slug>/<style>/final/final_script_v1.md --state workspace/projects/<slug>/<style>/state/run_state.json --assets-dir workspace/projects/<slug>/<style>/materials/generated
```

監査では次を見る。

- 台本契約
- キャラ整合
- 必須 marker
- 生成ファイル存在
- 最終台本リンク反映
- 失敗 marker 比率
- retry コマンド

## Slash Commands

- `/generate-script`
- `/prepare-assets`
- `/fetch-assets`
- `/audit`
- `/run-all`

Claude Code では `.claude/commands/*.md` を参照。

## File Contract

- `request.yaml`
  - `theme`, `audience`, `duration_minutes`, `formats`, `must_cover`, `avoid`, `reference_urls`
- `script_v1.md`
  - frontmatter 必須
  - Scene 見出し必須
  - 素材 marker 必須
- `run_state.json`
  - stage, notebook, marker の真実源
- `asset_manifest.yaml`
  - `scene_id`, `scene_title`, `insert_timing`, `intent`, `asset_type`, `must_include`, `avoid`, `audit_points`, `retry_prompt_seed`

## Tests

```powershell
python -m unittest discover -s tests -v
```

オフライン統合テストでは `subprocess.run` をモックして、`prepare-assets -> fetch-assets -> audit` の state 遷移まで確認している。

## Notes

- NotebookLM の実行は CLI 本命。MCP は接続補助として扱う。
- `MAP` は CLI 実体に合わせて `mind-map` の JSON ダウンロードを扱う。
- 画像・スライド内テキストは日本語前提で生成する。
- 監査なしで「完成」とは言わない。
- NotebookLM 版では fallback 画像やローカル生成カードを合格素材として扱わない。全 marker が NotebookLM 純正 artifact として生成・取得できた場合だけ PASS とする。
