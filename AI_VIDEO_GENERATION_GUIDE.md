# AI Video Generation Guide

## 最初に読むファイル

1. `AI_VIDEO_GENERATION_GUIDE.md`
2. `docs/architecture_v2.md`
3. `CLAUDE.md`
4. `AGENTS.md`
5. `prompts/00_core_principles.md`
6. `prompts/01_planning_prompt.md`
7. `prompts/02_yukkuri_script_draft_prompt.md` または `prompts/03_zundamon_script_draft_prompt.md`
8. `prompts/06_yaml_conversion_prompt.md`
9. `prompts/07_visual_plan_prompt.md`
10. `prompts/08_image_generation_v2.md`
11. `prompts/09_visual_audit_prompt.md`
12. _reference\script_prompt_pack
## 動画生成の流れ

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml
-> visual_plan.md
-> image_prompt_v2.md
-> image/visual audit
-> gate
-> render
-> video audit
```

## 台本生成の流れ

最初に表示都合で短く切らない。Draftでは自然会話、文脈、失敗談、具体例、ボケ、ツッコミ、次への引きを優先する。

`script_final.md` のCodexレビューが終わるまで、YAML化、画像生成、音声生成、レンダーへ進まない。

## 台本レビューの流れ

`script_audit.json` と `audit_script_draft.json` は生成しない。
Codexレビューは `script_final.md` だけを対象にし、必要な修正も `script_final.md` に反映する。

## YAML変換の流れ

`script_final.md` から `script.yaml` へ変換する。

- 意味を壊さない
- キャラ口調を変えない
- 情報順序を変えない
- `script_final.md` の発話単位を維持する
- 表示調整はRemotionの字幕描画側で行い、YAML変換で機械分割しない
- `meta.layout_template` を使う
- `scenes[].scene_template` を使わない

## 画像/素材設計の流れ

画像プロンプトは `script_final.md` の対象シーン全文を主入力にして作る。

会話は別で字幕表示するため、画像はコンテンツ部分に挿入する16:9素材として指定する。
作風はLLMが `script_final.md` 全体から判断して追記する。

## Remotion描画との責任分離

画像内の日本語テキストは許可する。
ただし会話全文を画像内に並べる指示にはしない。

字幕として読ませる会話だけをRemotion側で出す。
本文コンテンツ枠は画像のみを標準にし、`main` / `sub` の説明テキスト、箇条書き、画像キャプション、Remotionカードは新規生成しない。

## 画像監査の流れ

画像プロンプト監査と生成後画像監査は任意確認にする。
`pre-render-gate` や `build-episode` の停止条件にしない。

## レンダー前チェック

- `script.yaml` が存在する
- `script_final.md` がCodexレビュー済み
- `meta.layout_template` が `Scene01`〜`Scene21`
- `scenes[].scene_template` がない
- gate が PASS

## 絶対禁止事項

- Draft段階から表示都合で短く切る
- `script.yaml` を直接生成して創作完了扱いにする
- 会話全文を画像内テキストとして並べる指示にする
- 本文枠の説明文、箇条書き、画像キャプションをRemotionで描画する
- `remotion_card_plan.md` を新規生成する
- `script_draft.md` の監査JSONを必須化する
- `audit_script_draft.json` を生成する
- 3回FAILしたシーンを無限に再生成する

## よくある失敗と対策

| 失敗 | 対策 |
|---|---|
| 会話が短文羅列になる | Draftではセリフ長を制限せず、1シーン6〜12発話で文脈を積む |
| 聞き手が質問だけになる | 聞き手にも経験談、反論、小ボケ、納得を持たせる |
| 解説役が訂正だけになる | 解説役にも迷い、例え、失敗回避、軽いツッコミを持たせる |
| 画像がテーマからズレる | script_finalの対象シーン全文と台本全体から作風を再指定する |
| 画像内文字が崩れる | 会話全文を画像内に並べず、字幕はRemotion側に任せる |
