# Script Prompt Pack Evidence: image_prompts

prompt_file: 08_image_prompt_prompt.md
episode_id: auto_yukkuri_convenience_001
verdict: PASS

## Image Prompt Plan

Image prompts are generated from `script_final.md` scene text. The image is not a dialogue transcript; the dialogue remains in subtitles. Each prompt instructs codex-imagegen to create one 16:9 main image for Scene12's classroom whiteboard area.

## Required Inputs Used

- episode theme: なぜコンビニに行くと余計なものを買うのか
- script_final.md: full final script, split by scene
- target scene id: s01-s10
- target scene title: each hook title from script_final.md
- target scene dialogue: full scene dialogue included in each prompt
- image atmosphere: convenience-store flow, shelf placement, register-side temptation, limited-time psychology, practical countermeasure

## Prompt Contract

- Each prompt includes the scene title as a large Japanese heading.
- Scene id is not instructed as visible image text.
- Dialogue text is included as source context, not as image text.
- Prompts forbid full dialogue text in the image.
- Prompts avoid actual convenience-store logos, real brand marks, English UI labels, watermarks, subtitle boxes, bottom white bands, and generic icon-only graphics.
- Prompt text is stored in `image_prompt_v2.md` and `image_prompts.json`.
- `script.yaml` references prompts via `imagegen_prompt_ref` such as `s01.main`.

## visual_asset_plan Summary

| scene_id | title | image_role | composition_type |
|---|---|---|---|
| s01 | ついで買いは設計通り | 不安喚起 | 失敗例シミュレーション |
| s02 | 入口からレジまで歩かされる | 理解補助 | 原因マップ |
| s03 | 必要品の近くに誘惑がある | 比較 | NG / OK 比較 |
| s04 | レジ横は最後の関門 | 不安喚起 | 事故寸前構図 |
| s05 | 限定品が今買う理由を作る | 不安喚起 | 誇張図解 |
| s06 | 小さい金額は痛みが薄い | 比較 | 原因マップ |
| s07 | 空腹と疲れで判断が緩む | 不安喚起 | 事故寸前構図 |
| s08 | 意志の弱さだけじゃない | 理解補助 | 原因マップ |
| s09 | カゴを見るだけで戻れる | 手順整理 | 手順図 |
| s10 | 買う物を一つ決める | 手順整理 | チェックリスト |

## Output Files

- `visual_plan.md`
- `image_prompt_v2.md`
- `image_prompts.json`

This evidence will be updated by the actual prompt files and remains a generation-route record, not an image quality audit.
