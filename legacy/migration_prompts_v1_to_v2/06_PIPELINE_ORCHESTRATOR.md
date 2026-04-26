# 06_PIPELINE_ORCHESTRATOR: run_pipeline.py 作成

## 目的

新しい生成フローを1本で実行できるパイプライン骨格を作る。

## 作成するファイル

```text
scripts/run_pipeline.py
```

## 正準フロー

```text
1. episode meta 読み込み
2. planning.md 生成
3. script_draft.md 生成
4. script_final.md 保存
5. Codexレビュー対象として script_final.md を記録
6. script.yaml 変換
7. visual_plan.md 生成
8. image_prompt_v2.md 生成
9. 画像生成または素材設計
10. audit_image_result.py 実行
11. FAILなら画像プロンプト修正/再生成（最大3回）
12. audits/ にレポート保存
```

## 実装要件

- CLI引数でエピソードディレクトリを指定できること

例:

```bash
python scripts/run_pipeline.py --episode script/ep1201-rm-travel-battery-panic
```

- `--dry-run` を用意すること
- `--skip-image-generation` を用意すること
- `--human-review-required` 状態を明確に保存すること
- 再生成回数をJSONに記録すること
- 3回FAILしたら停止すること

## 出力するファイル

エピソード配下に以下を生成:

```text
planning.md
script_draft_v2.md
script_final_v2.md
script_v2.yaml
visual_plan.md
image_prompt_v2.md
remotion_card_plan.md
audits/v2_pipeline_report.json
audits/v2_pipeline_summary.md
```

## 外部APIがない場合

画像生成API、Vision API、別モデルAPIがない場合でも、パイプラインがクラッシュしないようにしてください。

その場合:

- 本生成はスキップ
- `NOT_AVAILABLE` を記録
- `human_review_required: true`
- 成功扱いしない

## 完了報告

以下を出してください。

```md
## run_pipeline.py 実装報告

### 実装した機能

### NOT_AVAILABLE時の挙動

### 実行コマンド

### テスト結果

### 残課題
```
