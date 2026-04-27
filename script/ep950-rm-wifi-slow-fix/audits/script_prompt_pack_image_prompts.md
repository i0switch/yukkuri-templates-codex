# script_prompt_pack_image_prompts.md

使用元: _reference/script_prompt_pack/08_image_prompt_prompt.md

## Result

PASS

## Evidence

image_prompt_v2.md と script.yaml の `visual_asset_plan[].imagegen_prompt` は、対象sceneの `script_final.md` 全文を主入力にした直投げ型で作成した。会話は字幕表示の責任範囲に残し、画像には会話全文、長文テキスト、表、実在UI、ブランドロゴ、既存キャラクターを描かせない指示を入れた。下部20%は字幕・キャラ用の安全域として空ける指示を全シーンに適用した。英語ベースプロンプト11枚（s01〜s11）を生成した。

## Episode

ep950-rm-wifi-slow-fix

## Image prompt excerpt

```md
## s01

Clean explainer flat illustration, bright home interior, 16:9 horizontal.
Center: a smartphone screen showing a speed test result with large bold numbers 2Mbps.
Wi-Fi signal icon with low bars. Blue, gray, white palette.
NEGATIVE: real brand logos, photorealistic people, existing characters, watermarks, dense small text.
Leave 20% bottom margin for subtitle overlay.
```
