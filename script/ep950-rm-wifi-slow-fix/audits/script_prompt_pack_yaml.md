# script_prompt_pack_yaml.md

使用元: _reference/script_prompt_pack/10_yaml_prompt.md

## Result

PASS

## Evidence

script_final.md のCodexレビューPASS後に script.yaml を生成した。`dialogue[].text` は自然な発話単位と情報順序を維持し、sceneごとのmainは `kind: image` と `assets/sXX_main.png` のみ。subは `kind: bullets`。`meta.layout_template: Scene02` を使い、`meta.scene_template` と `scenes[].scene_template` は使っていない。voice_engine: aquestalk、霊夢/魔理沙の aquestalk_preset を設定。width:1280, height:720 (HD)。

## Episode

ep950-rm-wifi-slow-fix

## YAML excerpt

```yaml
meta:
  id: ep950-rm-wifi-slow-fix
  title: Wi-Fiが急に遅くなる本当の理由と今すぐ直せる3つの対処
  layout_template: Scene02
  pair: RM
  fps: 30
  width: 1280
  height: 720
  voice_engine: aquestalk
  target_duration_sec: 300
characters:
  left:
    character: reimu
    aquestalk_preset: れいむ
  right:
    character: marisa
    aquestalk_preset: まりさ
```
