# script_prompt_pack_template_analysis.md

使用元: _reference/script_prompt_pack/02_template_analysis_prompt.md

## Result

PASS

## Evidence

このepisodeは1動画1テンプレートのv2方針に従い、`meta.layout_template: Scene02` を単一テンプレートとして採用した。`meta.scene_template` と `scenes[].scene_template` は生成していない。Scene02は本文main枠へ16:9画像を入れ、subは`null`として、会話字幕だけをRemotion側で描画するため、本文枠の説明文・箇条書き・画像キャプションを新規生成しない方針に合う。ペアはRM（霊夢：left、魔理沙：right）、aquestalk、width:1280、height:720。

## Episode

ep962-rm-creditcard-silent-charge-trap

## Checked YAML excerpt

```yaml
meta:
  id: ep962-rm-creditcard-silent-charge-trap
  layout_template: Scene02
  pair: RM
  fps: 30
  width: 1280
  height: 720
  voice_engine: aquestalk
  target_duration_sec: 312
characters:
  left:
    character: reimu
    aquestalk_preset: れいむ
  right:
    character: marisa
    aquestalk_preset: まりさ
```
