# Script Prompt Pack Evidence: template_analysis

prompt_file: 02_template_analysis_prompt.md
episode_id: auto_yukkuri_convenience_001
verdict: PASS

## Template Analysis

layout_template: Scene12
template_file: templates/scene-12_classroom-bubbles.md

## Main Content

- exists: true
- role: ホワイトボード内に、各sceneの要点を表す1枚のmain画像を配置する
- readable_density: タイトル枠とmain画像が共存するため、画像内見出しは短く太くし、主役ビジュアルを1つに絞る
- safe_area: 1920x1080基準で x=130, y=140, w=1660, h=600 のホワイトボード内

## Sub Content

- exists: false
- sub_required: false
- sub_content_style: none
- canonical_empty_value: null
- rule: 全sceneで `sub: null` とする。sub用画像や補足テキストは作らない。

## Subtitle Area

- exists: true
- kind: overlay_dark
- position: bottom
- line_break_policy: budoux_rendering
- avoid_notes: 画像プロンプトでは下部字幕吹き出しに重要情報を置かない。重要要素はホワイトボード中央から上部へ寄せる。

## Title Area

- exists: true
- use_title_text: true
- fallback: scene titleを`title_text`として使う。画像内にも対象シーンタイトルを大きい見出しとして入れるが、scene idは入れない。

## Character Layout

- character_layout: layout
- notes: キャラは下部左寄りに2体並び、字幕は下部右側の吹き出し。main画像は教室ホワイトボードに合う図解・状況ビジュアルにする。

## Script Rules

- sub_policy: sub枠なしのため全scene `sub: null`
- title_policy: Scene12のtitle areaに短いフック型title_textを入れる
- dialogue_policy: 表示都合で短文化せず、自然な発話単位を保持する
