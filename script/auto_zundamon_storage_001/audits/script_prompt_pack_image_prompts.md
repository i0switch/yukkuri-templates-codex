# Script Prompt Pack Evidence: image_prompts

prompt_file: 08_image_prompt_prompt.md
episode_id: auto_zundamon_storage_001
verdict: PASS

## Image Prompt Plan

Image prompts are generated from `script_final.md` scene text. The image is not a dialogue transcript; the dialogue remains in subtitles. Each prompt instructs codex-imagegen to create one 16:9 main image for Scene21's central white area.

## Required Inputs Used

- episode theme: スマホの容量がすぐ埋まる本当の理由
- script_final.md: full final script, split by scene
- target scene id: s01-s10
- target scene title: each hook title from script_final.md
- target scene dialogue: full scene dialogue included in each prompt
- image atmosphere: clear smartphone-storage explainer, app storage maps, warning visuals, checklist visuals

## Prompt Contract

- Each prompt includes the scene title as a large Japanese heading.
- Scene id is not instructed as visible image text.
- Dialogue text is included as source context, not as image text.
- Prompts forbid full dialogue text in the image.
- Prompts avoid actual app logos, real brand marks, English UI labels, watermarks, subtitle boxes, bottom white bands, and generic icon-only graphics.
- Prompt text is stored in `image_prompt_v2.md` and `image_prompts.json`.
- `script.yaml` references prompts via `imagegen_prompt_ref` such as `s01.main`.

## visual_asset_plan Summary

| scene_id | title | image_role | composition_type |
|---|---|---|---|
| s01 | 写真を消したのに減らない | 不安喚起 | 失敗例シミュレーション |
| s02 | 容量はアプリ別に太る | 比較 | 原因マップ |
| s03 | LINEの中に残る写真 | 証拠提示 | 原因マップ |
| s04 | キャッシュは便利な荷物 | 理解補助 | 誇張図解 |
| s05 | 動画アプリのオフライン保存 | 不安喚起 | 証拠写真風 |
| s06 | ダウンロードとスクショの積み重ね | 比較 | チェックリスト |
| s07 | バックアップ済みでも本体に残る | 不安喚起 | 事故寸前構図 |
| s08 | ストレージ画面で犯人を見る | 手順整理 | 手順図 |
| s09 | 消す前に守るデータ | 不安喚起 | 事故寸前構図 |
| s10 | 上位3アプリだけ見る | 手順整理 | チェックリスト |

## Output Files

- `visual_plan.md`
- `image_prompt_v2.md`
- `image_prompts.json`

This evidence will be updated by the actual prompt files and remains a generation-route record, not an image quality audit.
