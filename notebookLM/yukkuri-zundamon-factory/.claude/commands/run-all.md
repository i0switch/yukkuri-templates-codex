---
description: テーマから最終成果物まで一気通貫で実行（完全自律モード）
argument-hint: テーマ：<自由文> / スタイル：<yukkuri|zundamon> [/ 尺：<分>]
---

# /run-all

## 実行手順

`workflows/00-autonomous-loop.md` に従い、下記を連続実行：

1. `/generate-script` 相当の処理
2. `/prepare-assets` 相当の処理
3. `/fetch-assets` 相当の処理
4. `/audit` 相当の処理

各工程の完了時にメタJSONを更新し、進捗を簡潔に報告：

```
✓ slug生成: protac-tpd
✓ 台本生成完了（4200字、マーカー7個）
✓ NotebookLM ノート作成: xxx-yyy-zzz
✓ 素材生成中... (2/7)
✓ 素材生成中... (7/7)
✓ DL完了: output/assets/protac-tpd/
✓ 監査合格
→ output/final/protac-tpd.md に最終版を出力
```

## 引数

$ARGUMENTS

## 自律判断

- 工程失敗時のリトライは `workflows/00-autonomous-loop.md` の「リトライ＆フォールバック」に従う
- 監査 FAIL 時は最大 2 回まで自動差し戻し
- 無料枠50q/日 を超えそうな場合は中断して翌日への繰り越しを提案

## 中断条件

- `nlm` 未セットアップ / 認証切れ
- NotebookLM レート制限超過
- 同じ工程で 3 回連続失敗
- ディスク容量不足

中断時は `<slug>-retry.md` に再開手順を書き出す。

## 出力

全工程完了後：
- `output/scripts/<slug>.md`
- `output/assets/<slug>/`
- `output/final/<slug>.md`
- `output/final/<slug>-audit.md`
- `output/final/<slug>-meta.json`
