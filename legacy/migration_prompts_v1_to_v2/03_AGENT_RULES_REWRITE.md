# 03_AGENT_RULES_REWRITE: CLAUDE.md / AGENTS.md 書き換え

## 目的

AIエージェントがリポジトリを開いたとき、旧パイプラインではなく新パイプラインに従うようにする。

## 事前バックアップ

既存ファイルは削除・移動せず、以下にコピーしてください。

- `legacy/CLAUDE.md.v1`
- `legacy/AGENTS.md.v1`

その後、元の `CLAUDE.md` / `AGENTS.md` を編集してください。

## 追加・更新する正準ルール

以下の内容を必ず入れてください。

```md
# Critical Script Quality Rule

台本生成時は、最初から表示都合で切った短文にしない。
`script.yaml` 変換時も発話単位を維持する。

必ず次の段階を分ける。

1. `planning.md`
   - 視聴者、悩み、感情曲線、情報ゴール、シーン役割を設計する

2. `script_draft.md`
   - 自然な会話
   - 文脈・ボケ・ツッコミ・具体例を優先
   - セリフ長は制限しない
   - 実用上は1発話12〜40字程度で揺らす
   - 1シーン6〜12発話

3. `script_final.md`
   - 自然会話の完成版
   - Codexレビュー対象はこのファイルのみ

4. `script.yaml`
   - レンダー用
   - `dialogue[].text` は自然な発話単位を維持
   - draftの意味・キャラ口調・情報順序を壊さない

`script_audit.json` / `audit_script_draft.json` は生成しない。
`script_final.md` のCodexレビュー前に、YAML化・画像生成・音声生成・レンダーへ進んではいけない。
```

```md
# Main Content Image Rule

メインコンテンツ画像は、完成スライドを画像生成だけで作らない。

- 日本語の説明文・金額・チェックリスト・矢印・表・フローチャートはRemotionで描画する
- 画像生成は「背景」「物体」「雰囲気」「抽象的な情景」に限定する
- 画像内日本語は原則禁止
- 例外的に使う場合は2〜3語まで
- 意味不明な日本語・誤字・台本と違う内容がある画像は即FAIL
- 1枚の中に情報を詰め込みすぎない
```

```md
# Image Audit Must Inspect Actual Image

画像監査はファイル存在確認だけでPASS禁止。

各画像について以下を確認する。

- 台本sceneの内容と一致しているか
- テーマからズレていないか
- 画像内テキストに誤字・意味不明語がないか
- main枠で縮小表示して意味が伝わるか
- 下部20%に重要要素がないか
- キャラや字幕と被らないか
- ゆっくり/ずんだもん動画のメイン画像として自然か

重大NGが1つでもあればFAIL。
```

```md
# Script Final Review

台本のレビューはCodexが `script_final.md` だけを見る。
Draft段階の監査JSONや別モデルクロス審査を必須にしない。
```

```md
# Regeneration Limit

1シーンあたり再生成は最大3回。
3回連続FAILした場合は作業停止し、`regeneration_plan` と `human_review_required: true` を出力する。
```

## 既存記述の扱い

- 新方針と矛盾する旧記述は削除または明確に無効化する。
- ただし、レンダー仕様・ファイル形式・実行コマンドなど必要な既存仕様は残す。
- 表示都合の切り詰めルールは残さず、YAMLでも発話単位を維持する。
