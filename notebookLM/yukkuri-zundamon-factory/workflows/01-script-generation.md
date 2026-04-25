# 01 — 台本生成

## 🎯 目的

テーマとスタイルから、素材プレースホルダー埋め込み済みの台本を生成する。

---

## 📥 入力

- テーマ（自由文）
- スタイル：`yukkuri` or `zundamon`
- （任意）尺 / 対象視聴者 / 参考URL / 既知の制約

---

## 📤 出力

- `output/scripts/<slug>.md`（YAML フロントマター + 本文）
- `output/final/<slug>-meta.json` を初期化

---

## 🧭 手順

### 1. スラッグ生成
- テーマから 3〜5 単語の英数字＋ハイフン identifier を作る
- 例：「PROTACによる標的タンパク質分解」→ `protac-tpd`
- 既存の `output/scripts/` と重複しないか確認、衝突時は `-v2` サフィックス

### 2. 資料リサーチ（必要に応じて）
- テーマが専門領域（医学・薬理・技術）なら WebSearch で3〜5件の一次情報を確認
- 根拠URLは台本末尾の `## 📚 参考資料` セクションに記載
- **捏造禁止**。不明瞭な箇所は `// NEEDS_VERIFICATION:` コメントで明示

### 3. 雛形読み込み
- `yukkuri` → `templates/yukkuri-template.md`
- `zundamon` → `templates/zundamon-metan-template.md`
- 雛形の「📝 台本フォーマット」セクションをそのまま構造として採用

### 4. 本文生成
- キャラ口調ルール厳守（`config/characters.json` も参照）
- 素材マーカーは `templates/asset-marker-spec.md` に従う
- プロンプトは `prompts/script-generation-prompt.md` を使用

### 5. 自己チェック
雛形の「✅ 生成時チェックリスト」を Claude Code 自身が走らせる。
NG があれば最大 3 回まで自己修正リトライ。

### 6. 保存 & メタ初期化

```bash
# 台本を保存
cat > output/scripts/<slug>.md <<EOF
<生成した台本>
EOF

# メタJSONを初期化
cat > output/final/<slug>-meta.json <<EOF
{
  "slug": "<slug>",
  "title": "<テーマ>",
  "style": "<style>",
  "created_at": "<ISO8601>",
  "updated_at": "<ISO8601>",
  "stages": {
    "script_generation": { "status": "done", "path": "output/scripts/<slug>.md" },
    "notebooklm_upload": { "status": "pending" },
    "asset_generation":  { "status": "pending" },
    "asset_download":    { "status": "pending" },
    "audit":             { "status": "pending" }
  },
  "markers": []
}
EOF
```

### 7. マーカー抽出 → メタに追加

```bash
grep -E '^\[(FIG|INFO|MAP|SLIDE|VIDEO):[0-9]+\]' output/scripts/<slug>.md
```

各マーカーを `markers` 配列に追加：

```json
{
  "id": "INFO:1",
  "type": "INFO",
  "seq": 1,
  "desc": "<要求内容>",
  "status": "pending",
  "path": null
}
```

---

## 🚨 エラー処理

| 事象 | 対応 |
|------|------|
| 雛形ファイルが無い | プロジェクト破損。リュウドウに再DLを依頼 |
| マーカー不足（4個未満） | 自己修正リトライ |
| YAMLフロントマター不正 | 自己修正リトライ |
| キャラ口調崩壊 | 該当セクションだけ再生成 |
| 3回失敗 | `<slug>-retry.md` に失敗ログを書いて中断 |
