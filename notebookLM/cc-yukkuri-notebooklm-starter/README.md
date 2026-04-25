# Claude Code × ゆっくり / ずんだもん・めたん × NotebookLM スターター

Claude Code を開いた瞬間から、以下の流れを回しやすくするための土台です。

1. テーマから **ゆっくり解説台本** / **ずんだもん＆めたん解説台本** を生成
2. 台本をシーン分割し、必要素材・挿入箇所・目的を整理
3. NotebookLM に台本や補助資料を投入
4. NotebookLM で **infographic / slide deck / report / video** などの成果物を生成
5. 取得した素材をシーンごとに監査し、再生成指示まで出す
6. 必要なら改善ループを回す

## このスターターで入っているもの

- `CLAUDE.md`
  - Claude Code に「このリポジトリでどう動くか」を教える運用ルール
- `prompts/`
  - 最初に Claude Code に投げる起動プロンプト
  - 単発で使える台本生成 / 素材計画 / 素材監査プロンプト
- `templates/`
  - プロジェクト概要、台本依頼、シーン別素材台帳のテンプレ
- `scripts/`
  - プロジェクト初期化
  - 台本からシーン台帳を作る
  - 素材監査レポートの下地を作る
- `workspace/`
  - 実案件の出力先

## 想定ワークフロー

### 0. 前提

- Python 3.11+
- Claude Code
- NotebookLM 用 CLI / MCP (`notebooklm-mcp-cli`)

### 1. NotebookLM CLI / MCP を入れる

Windows PowerShell:

```powershell
uv tool install notebooklm-mcp-cli
nlm login
claude mcp add --scope user notebooklm-mcp notebooklm-mcp
```

もしくは、このフォルダ内の `scripts/bootstrap_windows.ps1` を参照。

### 2. このフォルダを Claude Code で開く

Claude Code が `CLAUDE.md` を読み、以後はこのリポジトリの運用ルールに沿って作業しやすくなります。

### 3. 最初に投げる

`prompts/00_最初にClaude_Codeへ投げるプロンプト.md` をそのまま投げてください。

### 4. 新規案件を作る

例:

```powershell
python scripts/init_project.py --slug zunda-sleep --title "睡眠の仕組み解説" --theme "睡眠の仕組みを初心者向けに解説"
```

### 5. 台本を書かせる / 置く

出力先の例:

- `workspace/projects/zunda-sleep/script/yukkuri_script_v1.md`
- `workspace/projects/zunda-sleep/script/zundamon_metan_script_v1.md`

### 6. 台本から素材台帳を作る

```powershell
python scripts/build_asset_manifest.py --script workspace/projects/zunda-sleep/script/zundamon_metan_script_v1.md
```

### 7. 素材監査レポートの土台を作る

```powershell
python scripts/build_audit_report.py --manifest workspace/projects/zunda-sleep/materials/asset_manifest.yaml
```

## ディレクトリ構成

```text
cc-yukkuri-notebooklm-starter/
├─ CLAUDE.md
├─ README.md
├─ docs/
├─ prompts/
├─ scripts/
├─ templates/
└─ workspace/
   ├─ projects/
   └─ shared/
```

## NotebookLM を使うときの方針

このスターターでは、NotebookLM の成果物を次のように扱います。

- **infographic**: 1テーマ1枚の図解素材候補
- **slide_deck**: シーンごとの視覚素材候補
- **report**: 追加情報の構造化素材
- **video**: 補助的な絵コンテ / 演出素材候補

NotebookLM 側の出力は、テーマ理解や図解化には強い一方で、動画用の「厳密な1カット素材」を直接保証するものではありません。  
そのため、このスターターでは **シーン台帳 → NotebookLM生成 → 監査 → 再生成指示** という前提で組んでいます。

## ありがちな運用ルール

- 1案件につき、まず **ゆっくり版** と **ずんだもん＆めたん版** を別々に作る
- 台本は `## Scene 01` のような見出しで区切る
- 素材は「何を説明するための素材か」を必ず記録する
- NotebookLM へは台本全文だけでなく、必要なら参考URL・補助メモも追加する
- 生成結果は即採用せず、必ず `materials/audit/` に監査ログを残す

## 補足

- NotebookLM CLI / MCP は公式 API ではなく、ブラウザ認証ベースです。
- 認証切れ時は `nlm login` を再実行してください。
- Claude Code が MCP を使えない場合でも、このスターターのテンプレとローカルスクリプトだけで下地作成は進められます。
