# Claude Code / Codex 用 実行指示

## 目的

台本生成を一気に混ぜず、品質が落ちにくいフェーズ分割で実行する。

## 実行順

1. `_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md` を読む。
2. `_reference/script_prompt_pack/01_plan_prompt.md` で企画・構成を作る。
3. `_reference/script_prompt_pack/02_draft_prompt.md` で台本初稿を作る。
4. `_reference/script_prompt_pack/03_audit_prompt.md` で監査する。
5. FAIL の場合は `_reference/script_prompt_pack/04_rewrite_prompt.md` で問題箇所だけ修正する。
6. PASS 後に `_reference/script_prompt_pack/05_yaml_prompt.md` で `script.yaml` に変換する。

## 重要ルール

- 台本品質の正本は `00_MASTER_SCRIPT_RULES.md` だけ。
- 旧プロンプトは `archive/` にあるため通常運用では読まない。
- RM / ZM の切り替えは `キャラペア` 入力で行う。
- 参照動画型ルールも `00_MASTER_SCRIPT_RULES.md` に統合済み。
- YAML変換前に必ず監査 PASS を取る。
- 演出加工は `02_演出編集プロンプト.md` に渡す。

## 入力テンプレ

```text
テーマ：
ざっくり入れたい内容：
想定尺：
使用テンプレート：
キャラペア：RM / ZM
想定視聴者：
方向性：
避けたい表現：
参考資料：
```
