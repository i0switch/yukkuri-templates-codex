# 06 YAML Conversion Prompt

## 目的

`script_final.md` からレンダー用 `script.yaml` へ変換する。

## ルール

- 意味を壊さない
- キャラ口調を変えない
- 情報順序を変えない
- `script_final.md` の自然な発話単位を維持する
- 表示都合の機械分割をしない
- `meta.layout_template` を使う（`Scene01`〜`Scene21` のいずれか1つ）
- `meta.scene_template` / `scenes[].scene_template` は使わない
- `main.kind` は原則 `image`、`sub` は `null` または `image`
- `main.caption` / `sub.caption` / `main.text` / `sub.text` / `bullets` は使わない
- asset path は `assets/...`
- sub枠なしは `sub: null`

## 出力

- `script.yaml`
- `audits/yaml_conversion_v2.md`（任意の証跡。生成しなくてもレンダーは進む）

## 注意

`script.yaml` は創作用の正本ではない。レンダー表示に合わせた派生物として扱う。

字幕の折り返しはRemotion側の描画で吸収する。長すぎる発話は draft 段階で見直し、YAML変換時には機械分割しない。
