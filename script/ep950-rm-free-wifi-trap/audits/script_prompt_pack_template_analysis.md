# script_prompt_pack_template_analysis

## 使用プロンプト
- `_reference/script_prompt_pack/02_template_analysis_prompt.md`

## 読み込み対象
- `templates/scene-01_watercolor-frame.md`
- `AI_VIDEO_GENERATION_GUIDE.md`
- `docs/architecture_v2.md`

## template_analysis
```yaml
layout_template: Scene01
template_file: templates/scene-01_watercolor-frame.md
main_content:
  exists: true
  role: 16:9のメイン画像または単一メイン画像を置く
  readable_density: 中程度。水彩外枠と字幕下部を避け、中央の大きな1シーンで見せる
  safe_area: "内枠 60,60〜1860,1020。mainは100,90,1720,780目安"
sub_content:
  exists: false
  sub_required: false
  sub_content_style: none
  role_if_exists: null
  max_items: 0
  safe_area: null
  canonical_empty_value: null
subtitle_area:
  exists: true
  narrow: false
  max_dialogue_chars: 25
  avoid_notes: "下部 y=900〜1020 の字幕バーと左右キャラ位置を避ける"
title_area:
  exists: false
  use_title_text: false
  fallback: "章タイトルはscript_final内の見出しで管理し、Scene01本体ではtitle_textに頼らない"
character_layout: "edge。左キャラ x=180 y=960 scale=0.50、右キャラ x=1740 y=960 scale=0.50"
avoid_area:
  - "外枠の外側"
  - "下部字幕バー"
  - "左右キャラ足元"
subtitle_text_required: true
image_prompt_safety:
  keep_bottom_20_percent_empty: true
  avoid_character_area: true
  avoid_sub_area_overlap: "sub枠なし"
script_rules:
  sub_policy: "Scene01のため全scene sub: null"
  title_policy: "title_areaなし。title_textに頼らない"
  dialogue_policy: "script_final.mdでは自然な発話単位を維持し、表示都合で機械分割しない"
```

## 判定
- Scene01はsub枠なし。今回の台本成果物ではsub用テキストを作らない。
- 画像生成プロンプトとYAMLは今回の担当外のため未作成。
