# script_prompt_pack_yaml.md

使用元: _reference/script_prompt_pack/10_yaml_prompt.md

## Result

PASS

## Evidence

script_final.md のサブエージェントレビューPASS後に script.yaml を生成した。`dialogue[].text` は自然な発話単位と情報順序を維持し、sceneごとのmainは `kind: image` と `assets/sXX_main.png` のみ、subは`null`。`meta.layout_template: Scene02` を使い、`meta.scene_template` と `scenes[].scene_template` は使っていない。

## YAML excerpt

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
          めたん「今日はその穴をふさぐ話。全部解約しろではなく、使ってるものだけ残す。」
          ずんだもん「楽しみを全部取り上げられる回じゃないなら聞けるのだ。」
          めたん「安心して。便利なものは残す。ただ、忘れてるものを見える場所へ出す。」
          ずんだもん「忘れてるサブスク、心当たりが多すぎて怖いのだ。」
          めたん「怖いなら、まず明細から一緒に見ていきましょう。」
          
          ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、UI、概念図、状況説明ビジュアルを中心に構成してください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 YouTubeの解説動画に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。 Make the aspect ratio 16:9.
          
          画像の雰囲気は明るいスマホ家計管理、サブスク通知、カレンダー、レシート、白と緑を基調にした安心感で生成してください。下部20%は字幕とキャラクター用に余白を残し、実在ブランド、実在UI、会話全文、長文日本語、細かい表、ウォーターマークは入れないでください。
    sub: null
    visual_asset_plan:
      - slot: main
        purpose: script_final直投げ型の挿入画像
        imagegen_prompt: |-
          s01: 少額なのに毎月漏れてる
          
          ずんだもん「やばいのだ。月額三百円くらいのやつが、集まったら普通に外食代になってた。」
          めたん「少額サブスクの群れね。小さい顔して、毎月きっちり来るわ。」
          ずんだもん「一個一個はかわいいのだ。でも合計すると全然かわいくないのだ。」
          めたん「固定費は額より継続が強いのよ。一回契約すると、止めるまで毎月いる。」
          ずんだもん「ぼくの財布に、毎月ちょっとずつ穴が開いてたのだ。」
          めたん「今日はその穴をふさぐ話。全部解約しろではなく、使ってるものだけ残す。」
          ずんだもん「楽しみを全部取り上げられる回じゃないなら聞けるのだ。」
          めたん「安心して。便利な

...snip...

```
