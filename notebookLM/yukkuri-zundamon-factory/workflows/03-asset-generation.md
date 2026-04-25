# 03 — 素材生成（NotebookLM Studio）

## 🎯 目的

台本内の全マーカーに対応する素材を NotebookLM の Studio で生成する。

---

## 📥 入力

- `<slug>-meta.json`（`markers` 配列に各マーカーのプロンプトが入っている状態）
- NotebookLM 側にソース投入済みのノートブック

---

## 📤 出力

- 各マーカーに `job_id` と `status` を記録
- 全ジョブが `COMPLETED` になったら工程04へ進む

---

## 🧭 マーカータイプ別マッピング

| マーカー | NotebookLM `studio_create` `type` | 追加オプション |
|---------|-----------------------------------|---------------|
| `FIG:n`   | `infographic` | `orientation=landscape, style=professional` |
| `INFO:n`  | `infographic` | `orientation=portrait, style=professional` |
| `MAP:n`   | `mind_map`    | なし |
| `SLIDE:n` | `slides`      | なし |
| `VIDEO:n` | `video`       | `style=classic` |

---

## 🧭 手順

### 1. ジョブ一括発行

メタJSONの `markers` 配列を順に処理：

```
for marker in markers:
    job = studio_create(
        notebook_id=<notebook_id>,
        type=<マッピング表のtype>,
        prompt=marker.prompt,
        options=marker.options or {}
    )
    marker.job_id = job.id
    marker.status = "pending"
```

**レート制限対策**：
- 1ジョブ発行後、最低 2 秒待機
- 無料枠 50q/日 を考慮し、1日のマーカー数が 30 を超えるなら分割実行を提案

### 2. ステータスポーリング

全ジョブが完了するまで30秒おきに確認：

```
while any(m.status in ["pending", "running"] for m in markers):
    sleep 30
    for m in pending_markers:
        status = get_studio_job_status(m.job_id)
        m.status = status  # pending/running/completed/failed
        m.updated_at = now()
        save_meta()
    log_progress(f"{completed}/{total} 完了")
```

### 3. タイムアウト判定

- 1 ジョブあたり最大 10 分待つ
- 10 分超過 → `status = "failed"`, `reason = "timeout"` を記録し次へ

### 4. リトライ戦略

失敗ジョブに対して最大 2 回までリトライ：
1. 同じプロンプトで再実行
2. それでも失敗したら、プロンプトを `prompts/asset-request-prompt.md` の
   「フォールバックプロンプト」に置き換えて再実行
3. それでも失敗したら `status = "failed_permanent"`

### 5. メタ更新

```json
{
  "stages": {
    "asset_generation": {
      "status": "done",       // or "partial" if some failed
      "total": 7,
      "completed": 6,
      "failed": 1,
      "timestamp": "<ISO8601>"
    }
  }
}
```

---

## 🚨 エラー処理

| 事象 | 対応 |
|------|------|
| 全ジョブ失敗 | 中断してリュウドウに報告 |
| 一部ジョブ失敗 | 失敗分だけ `failed_permanent` にして次工程進行、監査で警告 |
| 429レート制限 | ポーリング間隔を60秒に伸ばし継続 |
| NotebookLM側でエラー表示 | スクリーンショット取得を試み、`<slug>-errors.log` に記録 |

---

## 💡 プロンプト品質のコツ

- **具体性**：「〜の図」ではなく「〜の流れを5ステップで矢印付き」のように指示
- **文脈**：台本のセクション名・対象視聴者レベルを含める
- **制約**：文字量、色数、向きを明示
- **禁止事項**：実在人物・ブランドロゴ・著作物の模写を要求しない

詳細テンプレは `prompts/asset-request-prompt.md` 参照。
