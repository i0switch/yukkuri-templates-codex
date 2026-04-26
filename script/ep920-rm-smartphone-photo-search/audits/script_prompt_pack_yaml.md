# script_prompt_pack_yaml.md

使用元: _reference/script_prompt_pack/10_yaml_prompt.md

## Result

PASS

## Evidence

script_final.md のサブエージェントレビューPASS後に script.yaml を生成した。`dialogue[].text` は自然な発話単位と情報順序を維持し、sceneごとのmainは `kind: image` と `assets/sXX_main.png` のみ、subは`null`。`meta.layout_template: Scene02` を使い、`meta.scene_template` と `scenes[].scene_template` は使っていない。

## YAML excerpt

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
          魔理沙「今日はその写真迷子を片づけるぞ。ポイントは、思い出を整理するんじゃなくて探せる状態に戻すことだ。」
          霊夢「探せる状態。つまり全部きれいにアルバム分けしなくてもいい？」
          魔理沙「むしろ最初から完璧分類を狙うと、三日で心が折れる。」
          霊夢「よかった。私の分類力、初日で退職するタイプだから。」
          魔理沙「じゃあ、写真が増える理由から分解していこう。」
          
          ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、UI、概念図、状況説明ビジュアルを中心に構成してください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 YouTubeの解説動画に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。 Make the aspect ratio 16:9.
          
          画像の雰囲気は明るい生活空間、スマホ写真フォルダ、スクショ整理、白と水色を基調にした実用解説、安心感で生成してください。下部20%は字幕とキャラクター用に余白を残し、実在ブランド、実在UI、会話全文、長文日本語、細かい表、ウォーターマークは入れないでください。
    sub: null
    visual_asset_plan:
      - slot: main
        purpose: script_final直投げ型の挿入画像
        imagegen_prompt: |-
          s01: その写真、どこに消えた？
          
          霊夢「ちょっと待って、保証書の写真を撮ったはずなのに全然出てこないんだけど。」
          魔理沙「またスマホの写真フォルダで遭難してるのか。」
          霊夢「遭難どころか雪山だよ。料理、猫、スクショ、謎の床、全部混ざってる。」
          魔理沙「謎の床を撮った記憶はあるのか？」
          霊夢「ない。でも私のアルバムには床が五十枚いる。なにこの地味なホラー。」
          魔理沙「今日はその写真迷子を片づけるぞ。ポイントは、思い出を整理するんじゃなくて探せる状態に戻すことだ。」
          霊夢「探せる状態。つまり全部きれいにアルバム分けしなくてもいい？」
          魔理沙「むしろ最初から完璧分類を狙うと、三日で心が折れる。

...snip...

```
