# 09 Visual Audit Prompt

## 目的

生成画像または素材設計を実物ベースで監査する。

## 確認

- 台本一致
- テーマ一致
- 日本語破綻なし
- 情報量過多なし
- 下部安全域
- 字幕/キャラ衝突なし
- ゆっくり動画らしさ

## NOT_AVAILABLE

OCR / Vision API / 目視確認が使えない場合はPASS禁止。

```json
{
  "vision_status": "NOT_AVAILABLE",
  "ocr_status": "NOT_AVAILABLE",
  "pass": false,
  "human_review_required": true
}
```
