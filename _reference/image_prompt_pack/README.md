# Image Prompt Pack v1

## 用途

ゆっくり解説 / ずんだもん解説の画像を「会話補強用ビジュアル」として体系生成する。
台本生成パック (`_reference/script_prompt_pack/`) と並ぶ姉妹システムとして、画像生成フェーズを 5 段階に分解し、各段階を専用プロンプトで管理する。

このパックの目的は、現状の「白背景＋中央アイコン / シーン固有性なし / 会話と無関係な汎用素材」を完全に駆逐し、台本のセリフ・ボケ・ツッコミ・誤解訂正・最終行動と直結したビジュアルを生成することにある。

## 5 フェーズ構成

| フェーズ | ファイル | 役割 |
|---|---|---|
| 0 | `00_IMAGE_GEN_MASTER_RULES.md` | 禁止 / 必須 / visual_type 15種 / composition_type 15種 / text_strategy / layout_safety を定義する正本ルール |
| 1 | `01_IMAGE_DIRECTION_PROMPT.md` | シーンごとに `image_direction`（visual_type / composition_type / 重点セリフ / 補強する役割）を作る LLM プロンプト |
| 2 | `02_IMAGEGEN_PROMPT_PROMPT.md` | `image_direction` を `imagegen_prompt`（GPT-Image-2 用日本語プロンプト）に変換するプロンプト |
| 3 | `03_IMAGE_PROMPT_AUDIT.md` | 生成前 prompt 監査（55点ゲート）。シーン固有性・visual_type 分散・余白規約・禁止事項衝突をチェック |
| 4 | `04_IMAGE_REWRITE_PROMPT.md` | FAIL 時の構図再設計。問題箇所だけを差分修正し、再監査へ戻す |
| 5 | `05_IMAGE_RESULT_AUDIT.md` | 生成後画像監査。実際に出力された PNG が direction を満たしているか、Remotion 重ね領域と衝突していないかを確認 |

## 運用フロー

```
台本完成 (script.yaml PASS)
   ↓
01_IMAGE_DIRECTION_PROMPT.md
   → 各シーンに image_direction を作成
   ↓
02_IMAGEGEN_PROMPT_PROMPT.md
   → image_direction → imagegen_prompt 変換
   ↓
03_IMAGE_PROMPT_AUDIT.md
   → prompt 監査（55点ゲート）
   ↓
   FAIL → 04_IMAGE_REWRITE_PROMPT.md → 03 へ戻る
   PASS ↓
codex-imagegen 起動（yukkuri-codex-imagegen skill）
   ↓
05_IMAGE_RESULT_AUDIT.md
   → 生成画像監査
   ↓
   FAIL → prompt 修正して再生成
   PASS ↓
script.yaml の main.asset / sub.asset に反映
meta.json に generator / imagegen_prompt / imagegen_model を記録
   ↓
Remotion レンダリングへ
```

## 合格条件 7 項目

1. 画像ごとに image_direction がある
2. 画像が台本内の特定セリフを補強している
3. visual_type がシーンごとに適切に分散している
4. 白背景中央アイコンがない
5. 既存キャラ生成がない
6. Remotion 文字重ね用の余白がある
7. Scene02の字幕帯・キャラ位置と競合しない

この 7 項目すべてを満たさないシーンは PASS 扱いにしない。1 つでも欠けていれば 04_IMAGE_REWRITE_PROMPT.md に戻す。

## 関連ファイル

- `scripts/lib/load-image-prompt-pack.mjs` — このパックの 6 ファイルを読み込む共通ローダ
- `scripts/audit-image-prompts.mjs` — フェーズ 3 の機械監査スクリプト（55点ゲート）
- `scripts/audit-generated-images.mjs` — フェーズ 5 の生成後画像監査スクリプト

## archetypes/

- `archetypes/visual_type_catalog.md` — visual_type 15 種のカタログ。各タイプの用途・典型シーン・構図ヒント・禁止事項を集約
- `archetypes/composition_type_catalog.md` — composition_type 15 種のカタログ。前景 / 中景 / 背景の役割と Remotion overlay 余白の取り方を集約

最終更新: 2026-04-26
