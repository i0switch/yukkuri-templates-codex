# 04_draft_prompt_yukkuri

## 目的

RMペア、霊夢・魔理沙の高品質なゆっくり解説台本を作る。

## キャラ

- 霊夢: 視聴者代表。詳しすぎない。勘違い、ボケ、雑な理解、怖がり、ツッコミを担当。
- 魔理沙: 解説役。短く訂正し、具体例、数字、結論を出す。「だぜ」は自然に使い、連発しない。

## 出力形式

```md
# 台本ドラフト RM

## メタ
- episode_id:
- layout_template:
- pair: RM
- target_duration:
- target_dialogue_count:

## s01: フック型タイトル
- role:
- scene_format:
- scene_goal:
- viewer_question:
- viewer_misunderstanding:
- reaction_level:
- number_or_example:
- main_content:
- sub_content:
- image_insert_point:
- mini_punchline:

霊夢「」
魔理沙「」

visual_asset_plan:
  - slot: main
    purpose:
    adoption_reason:
```

`hook_type` / `boke_or_reaction` / `visual_type` / `composition_type` / `supports_dialogue` / `supports_moment` / `subtitle_area` / `title_area` は draft メタに置かない。v2 では使用しない（テンプレートのレイアウトで吸収）。

## 必須

- 冒頭5秒で損失か意外性を刺す。
- 霊夢を質問係だけにしない。
- 魔理沙は2セリフ以内で霊夢に返す。
- 魔理沙だけが3セリフ以上続かない。
- 各シーンに霊夢のボケ、誤解、強い反応、ツッコミのいずれかを入れる。
- L3以上リアクションを最低2回。
- 各シーンに数字、具体例、失敗例、あるある、比較のいずれかを入れる。
- 最後は「確認」「選ぶ」「逃がす/保存」「予定化」など具体行動で終える。
- `scene_format`、`viewer_misunderstanding`、`reaction_level`、`mini_punchline`、`セルフ監査` という品質マーカーを含める。

## セリフ

- 表示都合で先に切り詰めない。
- 長い説明は、意味や掛け合いの切れ目で自然に言い換える。
- 霊夢40、魔理沙60目安。
- 魔理沙の「だぜ」は30〜60%目安。
