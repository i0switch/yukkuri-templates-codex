# script_prompt_pack_template_analysis

## 使用prompt
- `_reference/script_prompt_pack/02_template_analysis_prompt.md`

## 読んだテンプレート
- `templates/scene-01_watercolor-frame.md`

## template_analysis
```yaml
layout_template: Scene01
template_file: templates/scene-01_watercolor-frame.md
main_content:
  exists: true
  role: 16:9のメイン画像。内枠の大部分を使う。
  readable_density: 中程度。細かい文字ではなく状況イメージ向き。
  safe_area: 100,90,1720,780
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
  avoid_notes: 字幕バーは下部 160,900,1600,120。台本は自然発話を維持し、表示調整はRemotion側に任せる。
title_area:
  exists: false
  use_title_text: false
  fallback: 章タイトルはscript_final上の構造用。画面タイトルには頼らない。
character_layout: 左右端配置。leftChar x=180 y=960、rightChar x=1740 y=960。
avoid_area: 外枠を覆わない。内枠 60,60〜1860,1020 内に収める。下部字幕とキャラ周辺を避ける。
subtitle_text_required: true
image_prompt_safety:
  keep_bottom_20_percent_empty: true
  avoid_character_area: true
  avoid_sub_area_overlap: true
script_rules:
  sub_policy: Scene01はsub枠なし。subはnull。
  title_policy: title枠なし。title_textに頼らない。
  dialogue_policy: 自然な発話単位を維持し、機械分割しない。
```

## 判定
- PASS: Scene01の制約に合わせ、subなし、main画像中心、字幕下部回避方針を確定。
