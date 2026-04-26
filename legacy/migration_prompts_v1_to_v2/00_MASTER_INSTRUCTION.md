# 00_MASTER_INSTRUCTION: パイプライン全面改善マスター指示

あなたは、`i0switch/yukkuri-templates-codex` の動画生成パイプラインを全面改善するAIエージェントです。

このフォルダ内のプロンプトを、ファイル番号順に実行してください。

## 絶対ルール

1. 番号順に実行すること。
2. フェーズを勝手にスキップしないこと。
3. 各フェーズ完了後、必ず以下を報告すること。
   - 変更したファイル
   - 追加したファイル
   - 削除/無効化した旧ルール
   - 未完了事項
   - 次フェーズでやること
4. 既存ファイルは削除・移動せず、`legacy/` にコピーしてバックアップしてから編集すること。
5. `script.yaml` を直接生成する旧方式に戻さないこと。
6. Draft段階で表示都合で先に切り詰めないこと。
7. 画像生成プロンプトに `hook_type`, `visual_type`, `myth_vs_fact`, `boke_or_reaction` などの抽象メタタグをそのまま入れないこと。
8. 画像内の日本語長文・表・チェックリスト・矢印・金額は画像生成ではなくRemotion描画に寄せること。
9. 台本Draft監査JSONを生成しないこと。Codexレビュー対象は `script_final.md` のみ。
10. OCR / Vision API が利用できない場合は、成功扱いせず `NOT_AVAILABLE` として明記し、`human_review_required: true` を付けること。
11. 再生成は1シーン最大3回。3回FAILしたら停止し、`regeneration_plan` を書くこと。
12. 「やったことにする」ことを禁止する。実装できていないものは未実装として明記すること。

## 実行順

以下を順番に実行してください。

1. `01_REPOSITORY_AUDIT.md`
2. `02_ARCHITECTURE_DOCS.md`
3. `03_AGENT_RULES_REWRITE.md`
4. `04_PROMPT_PACK_REBUILD.md`
5. `05_AUDIT_SCRIPTS.md`
6. `06_PIPELINE_ORCHESTRATOR.md`
7. `07_SAMPLE_REAUDIT.md`
8. `08_SAMPLE_REGENERATION.md`
9. `09_FINAL_CHECKLIST.md`

## 最優先ゴール

動画生成の完全自動成功よりも、まず以下を優先してください。

- 台本が短文羅列になる構造を排除する
- テンプレ穴埋め型プロンプトを排除する
- 画像生成がテーマからズレる原因を排除する
- 実物を見ない監査を排除する
- AIエージェントが毎回全ファイルを読まなくてもよい入口ドキュメントを作る

## 新パイプラインの正準フロー

```text
planning.md
→ script_draft.md
→ script_final.md
→ Codex review of script_final.md
→ script.yaml
→ visual_plan.md
→ image_prompt_v2.md / remotion_card_plan.md
→ assets生成または素材設計
→ visual_audit.md / image_audit.json
→ render前チェック
```

## 完了時の報告形式

最後に以下を出力してください。

```md
# 完了報告

## 変更ファイル一覧

## 追加ファイル一覧

## 無効化した旧ルール

## 新しい生成フロー

## 台本生成の改善点

## 画像生成の改善点

## 監査の改善点

## ep1201 / ep1202 の結果

## 未完了・NOT_AVAILABLE

## 次に人間が確認すべきこと
```
