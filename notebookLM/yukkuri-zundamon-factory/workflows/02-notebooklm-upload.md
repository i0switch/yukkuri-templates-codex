# 02 — NotebookLM 投入

## 🎯 目的

生成した台本とテーマ資料を NotebookLM のノートブックに投入し、
素材生成のベースとする。

---

## 📥 入力

- `output/scripts/<slug>.md`（工程01の出力）
- `<slug>-meta.json`

---

## 📤 出力

- `<slug>-meta.json` の `notebooklm_upload.notebook_id` に UUID を記録
- NotebookLM 側にノートブック + ソース が作成されている

---

## 🧭 手順

### 1. 前提チェック

```bash
# nlm の存在確認
which nlm || (echo "nlm not found"; exit 1)

# 認証状態確認
nlm login --check
```

認証切れ → リュウドウに `nlm login` の実行を依頼。

### 2. ノートブック作成

MCP ツール `notebook_create` を使用：

```
notebook_create(title="<テーマタイトル>")
```

レスポンスの `notebook_id` を `<slug>-meta.json` に記録。

### 3. ソース投入（台本そのもの）

MCP ツール `source_add` で台本をテキストソースとして追加：

```
source_add(
  notebook_id="<取得したID>",
  type="text",
  title="script_<slug>",
  content=<output/scripts/<slug>.md の全文>
)
```

### 4. （任意）参考資料の追加

台本末尾の `## 📚 参考資料` にURLがある場合、各URLを URL ソースとして追加：

```
source_add(
  notebook_id="<ID>",
  type="url",
  url="<参考URL>"
)
```

**無料枠50q/日を考慮**：参考資料は最大 3 つまでに絞る。

### 5. マーカー別プロンプト生成

各マーカー（FIG/INFO/MAP/SLIDE）について、素材生成用プロンプトを `prompts/asset-request-prompt.md` のテンプレートに従って作成し、メタJSONに格納：

```json
{
  "id": "INFO:1",
  "studio_type": "infographic",
  "prompt": "<NotebookLMのstudio_create用プロンプト>",
  "options": { "orientation": "portrait", "style": "professional" }
}
```

### 6. メタ更新

```json
{
  "stages": {
    "notebooklm_upload": {
      "status": "done",
      "notebook_id": "<UUID>",
      "sources_added": 1,
      "timestamp": "<ISO8601>"
    }
  }
}
```

---

## 🚨 エラー処理

| 事象 | 対応 |
|------|------|
| `nlm` 未インストール | `scripts/setup.sh` の実行を提案 |
| 認証エラー | `nlm login` の実行を提案し中断 |
| `notebook_create` 失敗 | 1分待機してリトライ（最大3回） |
| `source_add` が5xxエラー | 30秒待機してリトライ（最大3回） |
| 429レート制限 | 60秒待機して1回だけリトライ、それでもダメなら中断 |
