# script_prompt_pack_template_analysis.md

使用元: _reference/script_prompt_pack/02_template_analysis_prompt.md

## Result

PASS

## Evidence

このepisodeは1動画1テンプレートのv2方針に従い、`meta.layout_template: Scene02` を単一テンプレートとして採用した。`meta.scene_template` と `scenes[].scene_template` は生成していない。Scene02は本文main枠へ16:9画像を入れ、subは`null`として、会話字幕だけをRemotion側で描画するため、本文枠の説明文・箇条書き・画像キャプションを新規生成しない方針に合う。

## Episode

ep920-rm-smartphone-photo-search

## Checked YAML excerpt

```yaml
meta:
  id: ep920-rm-smartphone-photo-search
  title: スマホ写真が多すぎて見つからない問題を片づける
  layout_template: Scene02
  pair: RM
  fps: 30
  width: 1280
  height: 720
  audience: スマホ写真、スクショ、メモ代わり画像が増えすぎて必要な写真を探すたびに時間を失っている人
  tone: フランクで生活感のあるゆっくり実用解説
  bgm_mood: light_smartphone_organize_explainer
  voice_engine: aquestalk
  target_duration_sec: 300
  image_style: 明るい生活空間、スマホ写真フォルダ、スクショ整理、白と水色を基調にした実用解説、安心感
characters:
  left:
    character: reimu
    aquestalk_preset: れいむ
    speaking_style: 素直、油断、生活感、ツッコミ、納得
  right:
    character: marisa
    aquestalk_preset: まりさ
    speaking_style: 具体化、例え、軽い煽り、行動に落とす
scenes:
  - id: s01
    role: intro
    scene_goal: 必要な写真が見つからない痛みを提示
    viewer_question: 焦りと共感
    visual_role: スマホ画面に写真サムネイルが大量に並び、保証書らしき画像だけが見つからず焦る生活感ある机
    duration_sec: 30
    main:
      kind: image
      asset: assets/s01_main.png
      asset_requirements:
        imagegen_prompt: |-
          s01: その写真、どこに消えた？
          
          霊夢「ちょっと待って、保証書の写真を撮ったはずなのに全然出てこないんだけど。」
          魔理沙「またスマホの写真フォルダで遭難してるのか。」
          霊夢「遭難どころか雪山だよ。料理、猫、スクショ、謎の床、全部混ざってる。」
          魔理沙「謎の床を撮った記憶はあるのか？」
          霊夢「ない。でも私のアルバムには床が五十枚いる。なにこの地味なホラー。」
          魔理沙「今日はその写真迷子を片づけるぞ。ポイントは、思い出を整理するんじゃなくて探せる

...snip...

```
