# script_prompt_pack_template_analysis.md

使用元: _reference/script_prompt_pack/02_template_analysis_prompt.md

## Result

PASS

## Evidence

このepisodeは1動画1テンプレートのv2方針に従い、`meta.layout_template: Scene02` を単一テンプレートとして採用した。`meta.scene_template` と `scenes[].scene_template` は生成していない。Scene02は本文main枠へ16:9画像を入れ、subは`kind: bullets`として視聴者補助情報を表示する方針に合う。

## Episode

ep950-rm-wifi-slow-fix

## Checked YAML excerpt

```yaml
meta:
  id: ep950-rm-wifi-slow-fix
  layout_template: Scene02
  pair: RM
  voice_engine: aquestalk
  target_duration_sec: 300
```
