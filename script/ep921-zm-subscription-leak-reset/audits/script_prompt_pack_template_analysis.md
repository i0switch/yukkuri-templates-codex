# script_prompt_pack_template_analysis.md

使用元: _reference/script_prompt_pack/02_template_analysis_prompt.md

## Result

PASS

## Evidence

このepisodeは1動画1テンプレートのv2方針に従い、`meta.layout_template: Scene02` を単一テンプレートとして採用した。`meta.scene_template` と `scenes[].scene_template` は生成していない。Scene02は本文main枠へ16:9画像を入れ、subは`null`として、会話字幕だけをRemotion側で描画するため、本文枠の説明文・箇条書き・画像キャプションを新規生成しない方針に合う。

## Episode

ep921-zm-subscription-leak-reset

## Checked YAML excerpt

```yaml
meta:
  id: ep921-zm-subscription-leak-reset
  title: サブスクが毎月じわっと漏れる問題を止める
  layout_template: Scene02
  pair: ZM
  fps: 30
  width: 1280
  height: 720
  audience: 無料体験、少額サブスク、使っていない有料サービスが積み重なって毎月の支出が見えにくい人
  tone: 少しコミカルで生活感のあるずんだもん実用解説
  bgm_mood: light_money_check_explainer
  voice_engine: aquestalk
  target_duration_sec: 300
  image_style: 明るいスマホ家計管理、サブスク通知、カレンダー、レシート、白と緑を基調にした安心感
characters:
  left:
    character: zundamon
    aquestalk_preset: 女性１
    speaking_style: 勢い、やらかし、言い訳、発見、素直な納得
  right:
    character: metan
    aquestalk_preset: 女性２
    speaking_style: 観察、皮肉、整理、具体例、やさしい刺し返し
scenes:
  - id: s01
    role: intro
    scene_goal: サブスク漏れの痛みを提示
    viewer_question: 驚きと共感
    visual_role: スマホの月額明細に小さな料金が複数並び、合計額だけ大きく見えるコミカルな家計ビジュアル
    duration_sec: 30
    main:
      kind: image
      asset: assets/s01_main.png
      asset_requirements:
        imagegen_prompt: |-
          s01: 少額なのに毎月漏れてる
          
          ずんだもん「やばいのだ。月額三百円くらいのやつが、集まったら普通に外食代になってた。」
          めたん「少額サブスクの群れね。小さい顔して、毎月きっちり来るわ。」
          ずんだもん「一個一個はかわいいのだ。でも合計すると全然かわいくないのだ。」
          めたん「固定費は額より継続が強いのよ。一回契約すると、止めるまで毎月いる。」
          ずんだもん「ぼくの財布に、毎月ちょっとずつ穴が開いてたのだ。」
          めたん「今日はその穴をふさぐ話。全部解約しろではなく、使っ

...snip...

```
