# script_prompt_pack_template_analysis.md

使用元: _reference/script_prompt_pack/02_template_analysis_prompt.md

## Result

PASS

## Evidence

このepisodeは1動画1テンプレートのv2方針に従い、`meta.layout_template: Scene02` を単一テンプレートとして採用した。`meta.scene_template` と `scenes[].scene_template` は生成していない。Scene02は本文main枠へ16:9画像を入れ、subは`null`として、会話字幕だけをRemotion側で描画するため、本文枠の説明文・箇条書き・画像キャプションを新規生成しない方針に合う。ペアはZM（ずんだもん：left、めたん：right）、voicevox、width:1280、height:720。

## Episode

ep963-zm-smartphone-notification-battery-save

## Checked YAML excerpt

```yaml
meta:
  id: ep963-zm-smartphone-notification-battery-save
  layout_template: Scene02
  pair: ZM
  fps: 30
  width: 1280
  height: 720
  voice_engine: voicevox
  target_duration_sec: 319
characters:
  left:
    character: zundamon
    voicevox_speaker_id: 3
  right:
    character: metan
    voicevox_speaker_id: 2
```
