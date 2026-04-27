# script_prompt_pack_yaml.md

使用元: _reference/script_prompt_pack/10_yaml_prompt.md

## Result

PASS

## Evidence

script_final.mdの自然な発話単位を維持してscript.yamlに変換した。`meta.layout_template: Scene02`、`sub: null`、`motion_mode`はシーン役割に対応して設定（warning/punch/compare/checklist/reveal/recap）。emphasis指定はs01/s06/s10の強調ワードに適用した。dialogue[].expressionはキャラクター感情に合わせてconfident/confused/surprise/shock/smile/smug/wry/calm/normalを使用した。

## YAML conversion checklist

- [x] layout_template: Scene02
- [x] sub: null (全シーン)
- [x] scenes[].scene_template: 未使用
- [x] meta.scene_template: 未使用
- [x] dialogue[].text: script_final.mdの発話をそのまま維持
- [x] voice_engine: aquestalk
- [x] aquestalk_preset設定済み
- [x] emphasis: 強調ワードに適用
- [x] motion_mode: 全シーン設定済み

## Episode

ep962-rm-creditcard-silent-charge-trap
