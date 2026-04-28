# Script Prompt Pack Evidence: template_analysis

prompt_file: 02_template_analysis_prompt.md
episode_id: auto_zundamon_storage_001
verdict: PASS

## Template Analysis

layout_template: Scene21
template_file: templates/scene-21_ui-decoration.md

## Main Content

- exists: true
- role: 中央の白い余白領域に、各sceneの要点を表す1枚のmain画像を配置する
- readable_density: 見出し1つと主役ビジュアル1つを中心にし、細かい文字は避ける
- safe_area: 1920x1080基準で x=400, y=60, w=1120, h=720 の中央領域

## Sub Content

- exists: false
- sub_required: false
- sub_content_style: none
- canonical_empty_value: null
- rule: 全sceneで `sub: null` とする。sub用画像や補足テキストは作らない。

## Subtitle Area

- exists: true
- kind: overlay
- position: bottom
- line_break_policy: budoux_rendering
- avoid_notes: 画像プロンプトでは下部に白帯、入力欄、字幕欄風余白を作らない。重要要素は中央から上部へ寄せる。

## Title Area

- exists: false
- use_title_text: false
- fallback: scene titleは画像内の大きい見出しとして入れる。script.yamlのtitle_textに依存しない。

## Character Layout

- character_layout: edge
- notes: 左右UI装飾は背景の一部。キャラは中央余白の左右端。画像は中央白領域に合う図解・概念図・状況ビジュアルにする。

## Script Rules

- sub_policy: sub枠なしのため全scene `sub: null`
- title_policy: タイトル枠なしのため、scene idを除いた見出しを画像内にだけ入れる
- dialogue_policy: 表示都合で短文化せず、自然な発話単位を保持する
