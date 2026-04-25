# 04 — 素材ダウンロード

## 🎯 目的

NotebookLM で生成した全素材をローカルにダウンロードし、
台本マーカーと紐づけて最終台本を作成する。

---

## 📥 入力

- `<slug>-meta.json`（全マーカーに `job_id` が入っており、多くが `completed`）
- 完了したジョブの `artifact_id`

---

## 📤 出力

- `output/assets/<slug>/` 配下に全素材ファイル
- `output/final/<slug>.md`（マーカーを画像リンクに置換した最終台本）
- `<slug>-meta.json` の `asset_download.status = done`

---

## 🧭 手順

### 1. ダウンロードディレクトリ準備

```bash
mkdir -p output/assets/<slug>
```

### 2. マーカーごとにDL

```
for marker in markers where status == "completed":
    path = f"output/assets/{slug}/{marker.type.lower()}_{marker.seq}.{ext}"
    download_artifact(
        notebook_id=<notebook_id>,
        artifact_id=marker.artifact_id,
        output_path=path
    )
    marker.local_path = path
    marker.status = "downloaded"
```

**拡張子マッピング**：
- `infographic` → `.png`
- `mind_map` → `.png`
- `slides` → `.pdf`
- `video` → `.mp4`

### 3. ファイル検証

各ファイルについて：
- サイズが 0 バイトでない
- 画像なら `file` コマンドで MIME タイプ確認
- PDF なら pdfinfo で 1 ページ以上あるか確認

不正ファイル → 工程03へ戻り該当マーカーを再生成。

### 4. 最終台本の作成

`output/scripts/<slug>.md` をコピーして `output/final/<slug>.md` とし、
各マーカー行を下記形式に置換：

```
# 置換前
[INFO:1] 〜〜〜

# 置換後（画像の場合）
[INFO:1] 〜〜〜

![info_1](../assets/<slug>/info_1.png)

# 置換後（PDFの場合）
[SLIDE:1] 〜〜〜

[📑 slide_1.pdf](../assets/<slug>/slide_1.pdf)
```

マーカー行自体は残す（監査・再生成時の追跡のため）。

### 5. 失敗マーカーのハンドリング

`failed_permanent` のマーカーは、置換時にプレースホルダー画像リンクを入れる：

```markdown
[INFO:2] 〜〜〜

> ⚠️ **素材生成失敗**：この位置に手動で素材を配置してください。
> 要求内容：〜〜〜
```

### 6. メタ更新

```json
{
  "stages": {
    "asset_download": {
      "status": "done",
      "downloaded": 6,
      "failed": 1,
      "total_size_mb": 12.3,
      "timestamp": "<ISO8601>"
    }
  }
}
```

---

## 🚨 エラー処理

| 事象 | 対応 |
|------|------|
| DL 失敗（5xx） | 3回リトライ、それでもダメなら `download_failed` マーク |
| ファイルが 0 バイト | `studio_create` からやり直し（再生成） |
| ディスク容量不足 | 中断してリュウドウに報告 |
| 拡張子不一致 | `file --mime-type` の結果を優先、メタに警告記録 |

---

## 📏 サイズ目安（参考）

- infographic PNG：500KB 〜 3MB
- mind_map PNG：300KB 〜 1.5MB
- slides PDF：1MB 〜 5MB
- video MP4：10MB 〜 50MB

想定外に大きい/小さい場合は監査で警告を出す。
