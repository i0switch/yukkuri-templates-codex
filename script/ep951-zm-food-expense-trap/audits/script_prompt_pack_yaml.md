# script_prompt_pack_yaml.md

使用元: _reference/script_prompt_pack/10_yaml_prompt.md

## Result

PASS

## Evidence

script_final.md のCodexレビューPASS後に script.yaml を生成した。`dialogue[].text` は自然な発話単位と情報順序を維持し、sceneごとのmainは `kind: image` と `assets/sXX_main.png` のみ。subは `kind: bullets`。`meta.layout_template: Scene02` を使い、`meta.scene_template` と `scenes[].scene_template` は使っていない。voice_engine: voicevox、ずんだもん(speaker_id:3)・めたん(speaker_id:2)を設定。aquestalk_preset は使っていない。width:1280, height:720 (HD)。

## Episode

ep951-zm-food-expense-trap

## YAML excerpt

```yaml
meta:
  id: ep951-zm-food-expense-trap
  title: 食費が月1万円下がる！買い物の罠と3つの直し方
  layout_template: Scene02
  pair: ZM
  fps: 30
  width: 1280
  height: 720
  voice_engine: voicevox
  target_duration_sec: 300
characters:
  left:
    character: zundamon
    voicevox_speaker_id: 3
  right:
    character: metan
    voicevox_speaker_id: 2
```
