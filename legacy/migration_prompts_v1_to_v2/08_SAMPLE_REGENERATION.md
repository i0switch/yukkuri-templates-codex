# 08_SAMPLE_REGENERATION: 新方式でサンプル再生成

## 目的

新パイプラインに基づいて `ep1201` / `ep1202` のv2生成物を作る。

## 対象

- `ep1201-rm-travel-battery-panic`
- `ep1202-zm-convenience-spending-trap`

## 生成するファイル

各エピソード配下に以下を作成してください。

```text
planning_v2.md
script_draft_v2.md
script_final_v2.md
script_v2.yaml
visual_plan_v2.md
image_prompt_v2.md
remotion_card_plan_v2.md
audits/v2_pass_report.md
```

画像生成が可能な場合:

```text
assets/v2/s01_main.png
...
assets/v2/s10_main.png
```

画像生成が不可能な場合:

```text
assets/v2/README_NOT_GENERATED.md
```

に理由と、生成に使うべきプロンプトを残してください。

## 台本生成ルール

- 1シーン6〜12発話
- Draft段階で表示都合で先に切り詰めない
- 1発話は自然な長さ
- YAML変換時も自然な発話単位を維持
- 全シーン同じ構造にしない
- 役割を揺らす
- 具体例、数字、場所、失敗談、あるあるを入れる
- 小オチまたは次への引きを入れる

## 画像/素材設計ルール

- 日本語説明・数字・表・矢印・チェックリストはRemotion描画へ
- AI画像は背景・情景・物体・雰囲気に限定
- 画像内日本語は原則禁止
- テーマキーワードを具体物として入れる
- `visual_type` などの抽象タグをプロンプトに入れない

## 比較レポート

`docs/v1_vs_v2_comparison.md` を作成してください。

内容:

```md
# v1 vs v2 Comparison

## 対象エピソード

## 台本比較

| 指標 | v1 | v2 | 改善内容 |
|---|---:|---:|---|

指標例:
- 平均セリフ長
- セリフ長標準偏差
- 代表語尾出現率
- 具体例数
- シーンパターン分布
- 小オチ/引きの数

## 画像比較

| 指標 | v1 | v2 | 改善内容 |
|---|---:|---:|---|

指標例:
- テーマ一致率
- 画像内日本語量
- 誤字/意味不明語
- Remotion描画へ分離した情報数

## 残課題

## 次の改善案
```

## 注意

- 画像生成APIがない場合、画像生成を成功扱いしない。
- `v2_pass_report.md` は、実際にPASSしたものだけPASSと書く。
- Codexレビュー対象は `script_final.md` のみ。台本Draft監査JSONやクロス審査は作らない。
