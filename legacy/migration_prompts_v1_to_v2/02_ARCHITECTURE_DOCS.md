# 02_ARCHITECTURE_DOCS: 新アーキテクチャ文書作成

## 目的

AIエージェントが毎回全ファイルを読まなくてもよいように、新しい正準入口ドキュメントを作る。

## 作成するファイル

1. `docs/architecture_v2.md`
2. `AI_VIDEO_GENERATION_GUIDE.md`

## `docs/architecture_v2.md` に書く内容

```md
# Architecture v2

## なぜv2にするのか

旧方式の問題:
- Draft段階で表示都合で先に切り詰めていた
- テンプレ穴埋め型になっていた
- 会話が短文羅列になっていた
- 画像生成が抽象タグに引っ張られていた
- 監査が実物を見ていなかった

## v2の基本思想

- 創作工程と表示工程を分離する
- 台本はDraftで自然会話として作り、最後にYAMLへ変換する
- 画像生成とRemotion描画の責任を分ける
- 台本レビューはCodexが `script_final.md` だけを見る
- 画像監査は実画像を見て行う

## 正準フロー

planning.md
→ script_draft.md
→ script_final.md
→ Codex review of script_final.md
→ script.yaml
→ visual_plan.md
→ image_prompt_v2.md / remotion_card_plan.md
→ visual_audit

## 台本生成方針

## 画像生成方針

## 監査方針

## 失敗時の扱い

## NOT_AVAILABLEの扱い
```

## `AI_VIDEO_GENERATION_GUIDE.md` に書く内容

```md
# AI Video Generation Guide

## 最初に読むファイル

1. AI_VIDEO_GENERATION_GUIDE.md
2. docs/architecture_v2.md
3. CLAUDE.md
4. AGENTS.md
5. prompts/script_draft_v2.md
6. prompts/image_generation_v2.md

## 動画生成の流れ

## 台本生成の流れ

## script_final.mdレビューの流れ

## YAML変換の流れ

## 画像/素材設計の流れ

## Remotion描画との責任分離

## 画像監査の流れ

## レンダー前チェック

## 絶対禁止事項

## よくある失敗と対策
```

## 注意

- `architecture_v2.md` はこのリポジトリの正準設計書として扱う。
- 既存仕様と矛盾する場合、v2設計を優先する。
