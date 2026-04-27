# script_prompt_pack_image_prompts

source_prompt: 08_image_prompt_prompt.md
episode_id: ep950-rm-free-wifi-trap
verdict: PASS

## 実行内容
script_final.md の各 scene 見出しと会話全文を抽出し、各 scene の visual_asset_plan[].imagegen_prompt と main.asset_requirements.imagegen_prompt に同一内容として保存した。
固定プロンプトは 08_image_prompt_prompt.md の direct imagegen_prompt 形式を使用した。画像は会話内容そのものを再現するものではなく、シーンの要点、状況、概念、比喩を補強する16:9挿入画像として指定している。

## 適用ルール
- 対象シーンIDとタイトルを先頭に入れた。
- script_final.md の対象シーン会話全文を省略せず入れた。
- 会話全文を画像内に並べないよう固定文で禁止した。
- キャラクター同士の会話シーンにせず、図解、アイコン、小物、UI、概念図、状況説明ビジュアルを中心にした。
- Make the aspect ratio 16:9. を含めた。
- 下部20%は字幕とキャラクター用に余白を残すよう追記した。
- 実在ブランド、実在UI、長文日本語、細かい表、ウォーターマークを避けるよう指定した。

## 対象シーン
s01, s02, s03, s04, s05, s06, s07, s08, s09, s10
