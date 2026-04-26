# 02_template_analysis_prompt

## 目的

選択テンプレートを読み、台本と画像プロンプトが守る画面制約を確定する。

## 必ず読む

- 選択された `templates/scene-XX_*.md`
- `06_scene-layout-guide.md`
- 必要に応じて `00_START_HERE.md`

## 出力

```yaml
template_analysis:
  layout_template: SceneXX
  template_file:
  main_content:
    exists: true
    role:
    readable_density:
    safe_area:
  sub_content:
    exists: true | false
    role_if_exists:
    max_items:
    safe_area:
    canonical_empty_value: null
  subtitle_area:
    exists: true | false
    narrow: true | false
    max_dialogue_chars: 25
    avoid_notes:
  title_area:
    exists: true | false
    use_title_text: true | false
    fallback:
  character_layout:
  avoid_area:
  subtitle_text_required:
  image_prompt_safety:
    keep_bottom_20_percent_empty: true
    avoid_character_area: true
    avoid_sub_area_overlap:
  script_rules:
    sub_policy:
    title_policy:
    dialogue_policy:
```

## 重要ルール

- `Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14` はsub枠あり。mainとsubを重複させない。
- sub枠が小さい場合は、3項目チェック、NG/OK、注意点、現在地だけにする。
- sub枠なしテンプレートでは `sub: null` を正準にする。
- タイトル枠なしテンプレートでは、`title_text` に頼らず、必要なら `main.text` や画像内短語へ逃がす。
- 画像プロンプトには、字幕欄とキャラ配置を避ける指示を必ず入れる。
