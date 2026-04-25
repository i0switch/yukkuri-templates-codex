---
description: 台本から素材要求プロンプトを生成し、NotebookLM にアップロード
argument-hint: <slug>（省略時は最新生成の台本を使用）
---

# /prepare-assets

## 実行手順

1. 引数 `$ARGUMENTS` から slug を取得（無ければ `output/final/` で最も新しいメタを探す）
2. `<slug>-meta.json` を読み込み、前工程が `done` か確認
3. `workflows/02-notebooklm-upload.md` に従って進める：
   - `nlm` のセットアップ状態・認証確認
   - `notebook_create` で NotebookLM にノート作成
   - `source_add` で台本をテキストソースとして投入
   - 参考資料URLがあれば最大3件まで URL ソースとして投入
4. 台本からマーカーを抽出（正規表現は `templates/asset-marker-spec.md` 参照）
5. 各マーカーに対応する素材生成プロンプトを `prompts/asset-request-prompt.md` のテンプレから作成
6. メタJSONの `markers` 配列にプロンプトとオプションを格納
7. メタJSONの `stages.notebooklm_upload.status = "done"` にする

## 引数

$ARGUMENTS

## 前提

- `nlm` コマンドが使える状態
- NotebookLM 認証済み

認証に問題がある場合：
```
nlm login --check   # 状態確認
nlm login           # 再認証
```

## 出力

- NotebookLM 側にノートブックとソースが作成される
- `<slug>-meta.json` の `notebook_id` と各マーカーの `prompt` が更新される

完了時は次の手順を簡潔に伝える：
```
次のステップ: /fetch-assets <slug>
```
