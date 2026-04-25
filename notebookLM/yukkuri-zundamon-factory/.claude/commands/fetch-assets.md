---
description: NotebookLM で素材を生成して一括ダウンロード、最終台本をマージ
argument-hint: <slug> [--retry <MARKER_ID>]
---

# /fetch-assets

## 実行手順

### フルモード（通常）

1. 引数から slug を取得、メタJSON を読み込む
2. `workflows/03-asset-generation.md` に従う：
   - 全マーカーに対して `studio_create` を発行
   - 1 ジョブ発行毎に 2 秒待機
   - 30 秒おきにポーリング（最大 10 分）
   - 失敗時は最大 2 回リトライ（2 回目はフォールバックプロンプト）
3. `workflows/04-asset-download.md` に従う：
   - `download_artifact` で `output/assets/<slug>/` に保存
   - ファイル検証（サイズ・MIME）
   - `output/final/<slug>.md` を作成（マーカー → リンク置換）
4. メタJSONを更新

### リトライモード (`--retry <MARKER_ID>`)

1. 指定したマーカーのみ再生成
2. 成功したら対応する素材ファイルを上書き
3. `output/final/<slug>.md` の該当箇所のみ再マージ

## 引数

$ARGUMENTS

## レート制限対策

- 無料枠 50 q/日 を考慮
- マーカー数 > 30 の場合は分割実行を提案
- メタJSON の `stages.asset_generation.query_count` で使用回数を追跡

## エラー処理

- 全ジョブ失敗 → 中断
- 一部失敗 → 該当マーカーを `failed_permanent` にマーク、最終台本にプレースホルダー挿入
- 認証エラー → `nlm login` の実行を依頼

## 出力

- `output/assets/<slug>/` に全素材
- `output/final/<slug>.md`（マージ済み最終台本）
- `<slug>-meta.json` 更新

完了時は次の手順を簡潔に伝える：
```
次のステップ: /audit <slug>
```
