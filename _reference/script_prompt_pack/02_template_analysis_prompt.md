# 02_template_analysis_prompt

## 目的

選択テンプレートを読み、台本と画像プロンプトが守る画面制約を確定する。

## この工程で読む

- 選択された `templates/scene-XX_*.md`
- `docs/pipeline_contract.md` のテンプレート、main/sub、字幕、画像プロンプト契約に関係する箇所

`AI_VIDEO_GENERATION_GUIDE.md`、退避済みの `legacy/docs_archive/**`、`06_scene-layout-guide.md`、`00_START_HERE.md` は通常生成の必読入力にしない。矛盾時は `docs/pipeline_contract.md` と選択テンプレートを優先する。

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
    sub_required: true | false
    sub_content_style: text | bullets | none
    role_if_exists:
    max_items:
    safe_area:
    canonical_empty_value: null
  subtitle_area:
    exists: true | false
    narrow: true | false
    line_break_policy: budoux_rendering
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
- sub枠ありテンプレートでは `sub_required: true` とし、全sceneで `sub.kind: text` または `sub.kind: bullets` を使う。
- `sub_content_style` は、詳しい補足や注意点なら `text`、小見出し・4〜6項目チェック・NG/OK・手順現在地なら `bullets` にする。
- 新規動画で `sub.kind: image` は使わない。
- `sub.kind: bullets` は原則4〜6項目、推奨6項目にする。3項目だけにするのは締め・要約・最終行動など情報を絞る意図が明確な場合だけ。
- `sub.kind: text` は4〜6行の短い補足文を改行区切りで出す。
- sub枠が小さい場合でも、短い4〜6項目チェック、NG/OK、注意点、現在地として収める。
- sub枠なしテンプレートでは `sub: null` を正準にする。
- タイトル枠なしテンプレートでは、`title_text` に頼らず、必要なら画像内短語またはsub枠へ逃がす。
- 画像プロンプトには、字幕欄とキャラ配置を避ける指示を必ず入れる。
- 字幕欄の制約を理由に、台本発話へ文字数上限を置かない。長い解説セリフも自然な発話単位で保持し、表示時の折り返しはRemotion側のBudouX + AutoFitTextに任せる。
