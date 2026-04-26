# 01_IMAGE_DIRECTION_PROMPT

## 目的

台本の会話から、画像生成前の設計書 `image_direction` を作る。

## 入力

```text
対象シーン：
使用テンプレート：
main/sub枠：
台本の該当セリフ：
補強したい瞬間：
```

## やること

1. 画像が補強するセリフIDを `supports_dialogue` に入れる。
2. 補強する瞬間を `supports_moment` に短く書く。
3. `visual_type` を選ぶ。
4. `composition_type` を決める。
5. 前景、中景、背景を具体化する。
6. 画像内文字とRemotion重ね文字を分ける。
7. 下部20%、字幕帯、キャラ位置、sub枠の安全余白を決める。
8. 禁止要素を明記する。

## 出力形式

```yaml
slot:
supports_dialogue:
supports_moment:
visual_type:
composition_type:
purpose:
image_direction:
  scene_id:
  dialogue_role:
  scene_emotion:
  visual_type:
  composition_type:
  image_should_support:
  key_visual_sentence:
  main_subject:
  secondary_subjects:
  foreground:
  midground:
  background:
  color_palette:
  text_strategy:
    image_text_allowed:
    image_text_max_words:
    image_text_examples:
    remotion_overlay_text:
  layout_safety:
    keep_bottom_20_percent_empty:
    avoid_character_area:
    avoid_sub_area_overlap:
  must_not_include:
  quality_bar:
```

