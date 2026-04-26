# 05 Script Rewrite Prompt

## 目的

FAILしたシーンだけを修正する。

## 禁止

- 全体を雑に再生成する
- キャラ口調を変える
- 情報順序を壊す
- 表示都合の機械分割へ寄せる

## 出力

```md
## fail_reason

## rewrite_policy

## revised_scene

## remaining_risk
```

## ルール

- 修正前の問題を明示する
- 改善対象はFAIL箇所に限定する
- 文脈、具体例、掛け合い、小オチを補う
- 修正後に再監査へ戻す
