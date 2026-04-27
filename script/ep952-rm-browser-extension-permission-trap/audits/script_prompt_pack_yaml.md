# yaml

- episode_id: ep952-rm-browser-extension-permission-trap
- prompt pack source: 10_yaml_prompt.md

- script_final.md の発話単位を維持して script.yaml へ変換。
- meta.layout_template: Scene02
- meta.pair: RM
- main.kind: image
- sub.kind: bullets
- audio_playback_rate: 使用しない
- visual_asset_plan[].imagegen_prompt: 対象シーン全文 + 固定プロンプト + 雰囲気指定
- 変換時の確認:
  - script_final.md の順番、ボケ、ツッコミ、再フック、最終行動を削らない
  - scenes[].dialogue[].text は自然な発話単位のまま残す
  - Scene02 の右sub枠には会話の再掲ではなく、注意点と行動チェックを置く
  - BGMは後段の select:bgm で正式選定し、bgm/track.mp3 と meta.json に同期する
