# 09_FINAL_CHECKLIST: 完了チェック

## 目的

「やったことにする」を防ぎ、実装済み・未実装・要人間確認を明確にする。

## チェック項目

以下を確認してください。

### ドキュメント

- [ ] `docs/repository_audit_v2.md` がある
- [ ] `docs/architecture_v2.md` がある
- [ ] `AI_VIDEO_GENERATION_GUIDE.md` がある
- [ ] `CLAUDE.md` がv2方針に更新されている
- [ ] `AGENTS.md` がv2方針に更新されている
- [ ] `legacy/CLAUDE.md.v1` がある
- [ ] `legacy/AGENTS.md.v1` がある

### Prompt Pack

- [ ] `prompts/00_core_principles.md` がある
- [ ] `prompts/01_planning_prompt.md` がある
- [ ] `prompts/02_yukkuri_script_draft_prompt.md` がある
- [ ] `prompts/03_zundamon_script_draft_prompt.md` がある
- [ ] `prompts/05_script_rewrite_prompt.md` がある
- [ ] `prompts/06_yaml_conversion_prompt.md` がある
- [ ] `prompts/07_visual_plan_prompt.md` がある
- [ ] `prompts/08_image_generation_v2.md` がある
- [ ] `prompts/09_visual_audit_prompt.md` がある
- [ ] `prompts/10_remotion_card_design_prompt.md` がある
- [ ] `prompts/character_specs.md` がある
- [ ] `prompts/scene_patterns.md` がある

### Scripts

- [ ] `scripts/audit_image_result.py` がある
- [ ] `scripts/run_pipeline.py` がある
- [ ] 再生成3回上限が実装されている
- [ ] NOT_AVAILABLEがPASS扱いされない
- [ ] human_review_requiredが出力される

### Sample Reaudit

- [ ] ep1201 の `audits/v2_failure_summary.md` がある
- [ ] ep1201 の `audits/v2_image_audit.json` がある
- [ ] ep1202 の `audits/v2_failure_summary.md` がある
- [ ] ep1202 の `audits/v2_image_audit.json` がある

### Sample Regeneration

- [ ] ep1201 の `script_draft_v2.md` がある
- [ ] ep1201 の `script_v2.yaml` がある
- [ ] ep1201 の `visual_plan_v2.md` がある
- [ ] ep1202 の `script_draft_v2.md` がある
- [ ] ep1202 の `script_v2.yaml` がある
- [ ] ep1202 の `visual_plan_v2.md` がある
- [ ] `docs/v1_vs_v2_comparison.md` がある

## 最終報告テンプレート

```md
# 完了報告

## 変更ファイル一覧

## 追加ファイル一覧

## バックアップしたファイル

## 削除または無効化した旧ルール

## 新しい動画生成フロー

## 台本生成の改善点

## 画像生成の改善点

## 監査の改善点

## ep1201の結果

## ep1202の結果

## NOT_AVAILABLEだった項目

## human_review_required の項目

## 残課題

## 次に取り組むべき改善案
```

## 注意

- チェックできていない項目は空欄にせず、未完了理由を書く。
- 実装していないものを実装済みと書かない。
- APIや依存不足でできなかったものは、具体的に何が不足しているか書く。
