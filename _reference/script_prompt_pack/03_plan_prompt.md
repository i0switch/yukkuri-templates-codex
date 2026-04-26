# 03_plan_prompt

## 目的

入力整理とテンプレート解析をもとに、台本の構成案を作る。

## 出力

```md
# 構成案

## 1. 入力条件
- episode_id:
- theme:
- pair:
- duration:
- layout_template:

## 2. 企画角度
- 視聴者が最初に気になる疑問:
- 一般的な誤解:
- 意外な結論:
- 損失回避:
- 最後の具体行動:
- 繰り返し小ネタ:

## 3. シーン計画
| scene_id | role | hook_title | scene_format | scene_goal | viewer_misunderstanding | reaction_level | number_or_example | main_role | sub_role | midpoint_rehook |
|---|---|---|---|---|---|---|---|---|---|---|

`hook_type` / `boke_or_reaction` / `visual_type` / `composition_type` / `myth_vs_fact` / `supports_dialogue` / `supports_moment` は構成案テーブルに置かない。これらは v2 では使用しない（`imagegen_prompt` 本文にも混ぜない）。

## 4. 尺と密度
- 目標シーン数:
- 目標セリフ数:
- 1シーン平均:
- 中盤再フック位置:

## 5. セルフ監査
- 3種類以上の scene_format:
- L3以上リアクション2回以上:
- 解説役3連続なしの設計:
- sub枠方針:
- final_action:
```

## scene_format

- 誤解訂正型
- 失敗エピソード型
- Before / After型
- 手順型
- 反証型
- あるある型
- まとめ再フック型

## ルール

- 章タイトルはフック型。
- 各本編シーンに数字、具体例、失敗例、あるある、比較のいずれかを入れる。
- 3分は6〜8シーン、60〜80セリフ。
- 5分は10〜12シーン、90〜130セリフ。
- 中盤40〜60%に再フックを入れる。
