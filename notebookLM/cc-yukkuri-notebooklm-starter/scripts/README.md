# scripts

## 役割
Claude Code がローカルで使いやすい補助スクリプト群。

## 各スクリプト

### init_project.py
新規案件フォルダを初期化する。

例:
```powershell
python scripts/init_project.py --slug zunda-sleep --title "睡眠の仕組み解説" --theme "睡眠の仕組みを初心者向けに解説"
```

### build_asset_manifest.py
台本 Markdown を読んで、Scene ごとの素材台帳の下地を生成する。

例:
```powershell
python scripts/build_asset_manifest.py --script workspace/projects/zunda-sleep/script/zundamon_metan_script_v1.md
```

### build_audit_report.py
asset_manifest を読んで、監査レポートの下地を生成する。

例:
```powershell
python scripts/build_audit_report.py --manifest workspace/projects/zunda-sleep/materials/asset_manifest.yaml
```
