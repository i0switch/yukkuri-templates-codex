# script_prompt_pack_image_prompts.md

使用元: _reference/script_prompt_pack/08_image_prompt_prompt.md

## Result

PASS

## Evidence

image_prompt_v2.md と script.yaml の `visual_asset_plan[].imagegen_prompt` は、対象sceneの `script_final.md` 全文を主入力にした直投げ型で作成した。会話は字幕表示の責任範囲に残し、画像には会話全文、長文日本語、表、矢印、実在UI、ブランドロゴ、既存キャラクターを描かせない指示を入れた。下部20%は字幕・キャラ用の安全域として空ける。

## Image prompt excerpt

```md
# image_prompt_v2.md

## s01: 少額なのに毎月漏れてる

```text
Create exactly one 16:9 YouTube explainer insert image for scene s01, 少額なのに毎月漏れてる. Theme: サブスクが毎月じわっと漏れる問題を止める. Visual moment: スマホの月額明細に小さな料金が複数並び、合計額だけ大きく見えるコミカルな家計ビジュアル. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s02: サブスクは固定費になる

```text
Create exactly one 16:9 YouTube explainer insert image for scene s02, サブスクは固定費になる. Theme: サブスクが毎月じわっと漏れる問題を止める. Visual moment: 小さな水滴のような月額費用が毎月のバケツに溜まっていく比喩イラスト. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s03: 無料体験は終了日が本体

```text
Create exactly one 16:9 YouTube explainer insert image for scene s03, 無料体験は終了日が本体. Theme: サブスクが毎月じわっと漏れる問題を止める. Visual moment: 無料体験のカレンダーが有料化日に変わり、通知ベルと請求アイコンが並ぶ分かりやすい概念図. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s04: 使った日で残すか決める

```text
Create exactly one 16:9 YouTube explainer insert image for scene s04, 使った日で残すか決める. Theme: サブスクが毎月じわっと漏れる問題を止める. Visual moment: 最近使ったサブスクと使っていないサブスクがカレンダー上で分かれる整理画面風イラスト. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and cha

...snip...

```
