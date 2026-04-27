# script_prompt_pack_yaml

source_prompt: 10_yaml_prompt.md
episode_id: ep950-rm-free-wifi-trap
verdict: PASS

## 実行内容
Codexレビュー済みの script_final.md を既存レンダーシステムで使える script.yaml に変換した。meta.id は episode_id と一致させ、meta.layout_template は Scene01 に固定した。1本の動画につきテンプレートは1つだけにし、meta.scene_template と scenes[].scene_template は生成していない。

## 変換方針
- dialogue[].text は script_final.md の自然な発話単位を維持した。
- 表示都合の機械分割は行っていない。
- main.kind は全シーン image にした。
- Scene01 は sub 枠なしのため全シーン sub: null にした。
- main.caption / main.text / main.items / sub.caption は生成していない。
- visual_asset_plan[].imagegen_prompt には各 scene の direct imagegen_prompt を残した。
- meta.voice_engine は pair と一致させた。RM は aquestalk、ZM は voicevox。
- ZM は zundamon speaker 3、metan speaker 2 を指定し、aquestalk_preset は入れていない。
- audio_playback_rate は書いていない。尺は target_duration_sec: 300 と台本密度で管理する。
- bgm は select:bgm 実行前のため bgm/track.mp3 を参照し、後工程で正式選定する。
