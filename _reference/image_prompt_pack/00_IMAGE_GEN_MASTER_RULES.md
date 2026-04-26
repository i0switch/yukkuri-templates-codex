# 00_IMAGE_GEN_MASTER_RULES

## 目的

GPT-Image-2で作る画像を、単なる説明アイコンではなく、ゆっくり解説 / ずんだもん解説の会話を補強する視聴維持用ビジュアルとして設計する。

画像生成では、台本から直接 `imagegen_prompt` を作らない。必ず先に `image_direction` を作り、どのセリフ、どのボケ、どのツッコミ、どの誤解訂正、どの行動提示を補強するかを決める。

## 画像の役割

各画像は次のどれかを担当する。

- 冒頭フック画像
- ボケ補強画像
- ツッコミ補強画像
- 誤解訂正画像
- 危険・損失の可視化画像
- Before/After比較画像
- 手順・チェックリスト画像
- 中盤再フック画像
- まとめ・CTA画像

## visual_type

`visual_asset_plan[].visual_type` は次から選ぶ。

```yaml
visual_type_options:
  - hook_poster
  - boke_visual
  - tsukkomi_visual
  - myth_vs_fact
  - danger_simulation
  - before_after
  - three_step_board
  - checklist_panel
  - ranking_board
  - ui_mockup_safe
  - flowchart_scene
  - contrast_card
  - meme_like_diagram
  - mini_story_scene
  - final_action_card
```

## 禁止

- 白背景に中央アイコンだけ
- 無意味な人物シルエット
- 抽象アイコンのみ
- どのシーンにも使える汎用素材
- 全シーン同じ構図
- 実在ブランドUIの模写
- 実在ロゴ
- 既存キャラクターの生成
- 霊夢、魔理沙、ずんだもん、めたん風のキャラを画像内に生成すること
- 写真風の実在人間
- 字幕帯やキャラ位置に重要要素を置くこと
- 長文日本語を画像内に生成させること

## 必須

- シーン固有の状況がある
- 台本のボケ、誤解、ツッコミ、結論のどれを補強するか明確
- 1枚で何の話か分かる
- main枠とsub枠の役割が被らない
- 下部20%は字幕とキャラのために空ける
- 重要テキストはRemotion側で重ねる
- 画像内文字は短語だけにする
- 各シーンで構図を変える
- 画面の情報密度はあるが、ごちゃつかせない

## Scene02 main/sub 役割

Scene02では、mainとsubの役割を分ける。

main:

- 状況
- 感情
- 対比
- ボケ
- ツッコミ
- 危険導線
- Before/After

sub:

- 3項目チェック
- NGワード
- 行動リスト
- 注意点
- まとめ

禁止:

- mainとsubが同じ情報を繰り返す
- mainに細かいチェックリストを入れる
- subに複雑な図解を入れる

## シーン配分

3分動画の目安:

```yaml
three_minute_visual_mix:
  s01: hook_poster
  s02: myth_vs_fact or danger_simulation
  s03: boke_visual or meme_like_diagram
  s04: danger_simulation
  s05: before_after or contrast_card
  s06: checklist_panel
  s07: mini_story_scene
  s08: final_action_card or three_step_board
```

5分動画の目安:

```yaml
five_minute_visual_mix:
  s01: hook_poster
  s02: myth_vs_fact
  s03: boke_visual
  s04: danger_simulation
  s05: before_after
  s06: flowchart_scene
  s07: checklist_panel
  s08: mini_story_scene
  s09: three_step_board
  s10: final_action_card
```

## visual_asset_plan 必須構造

```yaml
visual_asset_plan:
  - slot: main
    supports_dialogue:
      - s01_l01
      - s01_l02
    supports_moment: "霊夢が当選DMに食いつき、魔理沙が止める瞬間"
    visual_type: hook_poster
    composition_type: smartphone_closeup
    purpose: "冒頭フック"
    image_direction:
      scene_id: s01
      dialogue_role: "冒頭フック / ボケ補強 / 誤解訂正 / 手順提示"
      scene_emotion: "焦り / 驚き / 納得 / 危険 / 安心"
      visual_type: hook_poster
      composition_type: smartphone_closeup
      image_should_support: "どの掛け合いを補強するか"
      key_visual_sentence: "1枚で伝える状況"
      main_subject: "主役"
      secondary_subjects:
        - "補助要素"
      foreground: "前景"
      midground: "中景"
      background: "背景"
      color_palette: "色"
      text_strategy:
        image_text_allowed: true
        image_text_max_words: 3
        image_text_examples:
          - STOP
        remotion_overlay_text:
          - "Remotionで重ねる文"
      layout_safety:
        keep_bottom_20_percent_empty: true
        avoid_character_area: true
        avoid_sub_area_overlap: true
      must_not_include:
        - "実在アプリUI"
        - "ブランドロゴ"
        - "既存キャラクター"
        - "写真風人物"
        - "長文日本語"
      quality_bar: "YouTube解説動画の高品質サムネ内スライドとして成立すること"
    imagegen_prompt: |
      ...
```

