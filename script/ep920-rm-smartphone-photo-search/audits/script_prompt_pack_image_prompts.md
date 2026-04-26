# script_prompt_pack_image_prompts.md

使用元: _reference/script_prompt_pack/08_image_prompt_prompt.md

## Result

PASS

## Evidence

image_prompt_v2.md と script.yaml の `visual_asset_plan[].imagegen_prompt` は、対象sceneの `script_final.md` 全文を主入力にした直投げ型で作成した。会話は字幕表示の責任範囲に残し、画像には会話全文、長文日本語、表、矢印、実在UI、ブランドロゴ、既存キャラクターを描かせない指示を入れた。下部20%は字幕・キャラ用の安全域として空ける。

## Image prompt excerpt

```md
# image_prompt_v2.md

## s01: その写真、どこに消えた？

```text
Create exactly one 16:9 YouTube explainer insert image for scene s01, その写真、どこに消えた？. Theme: スマホ写真が多すぎて見つからない問題を片づける. Visual moment: スマホ画面に写真サムネイルが大量に並び、保証書らしき画像だけが見つからず焦る生活感ある机. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s02: 写真が増えるのは思い出だけじゃない

```text
Create exactly one 16:9 YouTube explainer insert image for scene s02, 写真が増えるのは思い出だけじゃない. Theme: スマホ写真が多すぎて見つからない問題を片づける. Visual moment: 思い出写真、スクショ、書類写真、一時メモ写真が同じスマホ内で地層のように積み重なる概念ビジュアル. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s03: 残す・消す・探すを分ける

```text
Create exactly one 16:9 YouTube explainer insert image for scene s03, 残す・消す・探すを分ける. Theme: スマホ写真が多すぎて見つからない問題を片づける. Visual moment: スマホ写真を残す、消す、あとで探すの三つのトレイへ整理する明るい図解風イラスト. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty space in the lower 20 percent for subtitles and character overlays. Do not show Reimu, Marisa, Zundamon, Metan, copyrighted characters, real logos, real app UI, readable long text, dialogue, tables, arrows, sprite sheets, grids, watermarks, or photorealistic people. The image should support the scene idea, not reproduce the conversation.
```

## s04: スクショと一時写真から片づける

```text
Create exactly one 16:9 YouTube explainer insert image for scene s04, スクショと一時写真から片づける. Theme: スマホ写真が多すぎて見つからない問題を片づける. Visual moment: 期限切れスクショ、追跡番号、地図メモがスマホから軽く片づいていく爽快な整理シーン. Use a clean semi-flat illustration style, bright everyday Japanese interior, smartphone or household objects as needed, clear foreground/midground/background, plenty of empty spac

...snip...

```
