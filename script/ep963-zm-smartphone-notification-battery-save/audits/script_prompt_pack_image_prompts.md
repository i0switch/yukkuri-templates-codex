# script_prompt_pack_image_prompts.md

使用元: _reference/script_prompt_pack/08_image_prompt_prompt.md

## Result

PASS

## Evidence

script_final.mdの各シーン全文を主入力とした直投げ型imagegen_promptをscript.yamlの`visual_asset_plan[0].imagegen_prompt`に記載した。各シーンに画像スロット`main`を1枚確保し、日本語プロンプト＋雰囲気指定（スマートフォン通知設定、電池アイコン、ブルーと緑を基調にした清潔でわかりやすいテック解説）＋禁止事項（実在ブランド、実在UI、会話全文、長文日本語、細かい表、ウォーターマーク）を付与した。

## Image prompt stats

- シーン数: 10
- 画像スロット: main × 10
- 生成ツール: Codex CLI (gpt-image-1)
- 解像度: 1280×720 (16:9)

## Episode

ep963-zm-smartphone-notification-battery-save
