---
description: 台本・素材・最終成果物の品質監査レポートを生成
argument-hint: <slug>
---

# /audit

## 実行手順

1. 引数から slug を取得
2. `workflows/05-audit.md` の全チェック項目を実行
3. `prompts/audit-prompt.md` に従って判定
4. `output/final/<slug>-audit.md` にレポート出力
5. メタJSONの `stages.audit.status` を更新

## 引数

$ARGUMENTS

## 自動修正モード

- FAIL が検出されたら、該当工程に自動差し戻し（最大 2 回）
- 2 回試しても合格しなければ中断してリュウドウに手動介入を依頼

## 出力

- `output/final/<slug>-audit.md`（監査レポート Markdown）
- メタJSON の `stages.audit`：
  ```json
  {
    "status": "pass" | "warning" | "fail",
    "pass_count": 18,
    "warning_count": 2,
    "fail_count": 0,
    "report_path": "output/final/<slug>-audit.md",
    "timestamp": "<ISO8601>"
  }
  ```

## 判定

- **PASS**：全必須項目 OK、完了
- **WARNING**：軽微な警告のみ、完了扱いだがレポートに注意点
- **FAIL**：必須項目 NG、自動修正試行 or 手動介入

完了時は監査結果サマリと最終成果物パスを報告：
```
✅ PASS
- 台本: output/scripts/<slug>.md
- 最終台本: output/final/<slug>.md
- 素材: output/assets/<slug>/ (6 files)
- レポート: output/final/<slug>-audit.md
```
