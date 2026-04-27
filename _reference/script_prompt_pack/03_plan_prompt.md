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
- 冒頭の文脈ブリッジ:  # s01の最初の1〜3発話で置く日常の状況、視聴者がやりがちな行動、なぜ今この話をするか
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
- sub枠方針: sub枠ありテンプレートでは全sceneの `sub_role` に実際の表示内容を入れる。sub枠なしテンプレートでは `sub: null`。
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
- s01 は `scene_goal` を「リスクを刺す」だけにしない。最初の1〜3発話で視聴者の現在地を置く `intro_context` 相当の文脈を設計する。
- s01 の冒頭は、日常の状況、視聴者がやりがちな行動、なぜ今この話をするかのどれかから入り、その後に損失や危険性へ接続する。
- 各本編シーンに数字、具体例、失敗例、あるある、比較のいずれかを入れる。
- 3分は6〜8シーン、60〜80セリフ。
- 5分は10〜12シーン、90〜130セリフ。
- 中盤40〜60%に再フックを入れる。
- sub枠ありテンプレートでは、各sceneの `sub_role` を空欄にしない。詳しい補足、注意点、小見出し、4〜6項目チェック、NG/OK、手順現在地、次にやることのいずれかにする。
- `sub_role` には、YAML化時に `sub.kind: bullets` なら4〜6項目、推奨6項目へ展開できるだけの材料を書く。`sub.kind: text` 想定なら4〜6行ぶんの補足観点を書く。
- 3項目だけのsub設計は、締め・要約・最終行動など情報を絞る意図が明確なsceneに限定する。
