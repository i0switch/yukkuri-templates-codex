# ゆっくり/ずんだもん動画生成パイプライン改善プロンプト集

このフォルダは、`i0switch/yukkuri-templates-codex` をAIエージェントで全面改善するためのプロンプト詰め合わせです。

## 使い方

対象リポジトリを Claude Code / Codex / Cursor などのAIエージェントで開き、まず以下を投げてください。

```text
このフォルダ内の `00_MASTER_INSTRUCTION.md` を最初に読み、そこに書かれた順番どおりに `01_` から `08_` までのプロンプトを実行してください。各フェーズ完了後は、変更ファイル・未完了事項・次フェーズでやることを報告してください。勝手にフェーズを飛ばさないでください。
```

## ファイル構成

- `00_MASTER_INSTRUCTION.md`  
  全体の進め方。AIエージェントにはまずこれを読ませる。

- `01_REPOSITORY_AUDIT.md`  
  既存リポジトリの調査と旧ルールの洗い出し。

- `02_ARCHITECTURE_DOCS.md`  
  `docs/architecture_v2.md` と入口ドキュメント作成。

- `03_AGENT_RULES_REWRITE.md`  
  `CLAUDE.md` / `AGENTS.md` の全面更新。

- `04_PROMPT_PACK_REBUILD.md`  
  台本・画像・監査プロンプト群の再設計。

- `05_AUDIT_SCRIPTS.md`  
  台本監査・画像監査・クロスレビューのスクリプト骨格作成。

- `06_PIPELINE_ORCHESTRATOR.md`  
  `run_pipeline.py` の設計と実装。

- `07_SAMPLE_REAUDIT.md`  
  既存サンプル `ep1201` / `ep1202` の失敗分析。

- `08_SAMPLE_REGENERATION.md`  
  新方式でのサンプル再生成と比較レポート作成。

- `09_FINAL_CHECKLIST.md`  
  完了判定チェックリスト。

## 推奨実行方法

一発で全部やらせるより、フェーズごとに止めて確認するのがおすすめです。
ただし、AIにまとめて渡す場合も、`00_MASTER_INSTRUCTION.md` が「順番に実施・各フェーズで報告」するよう制御します。
