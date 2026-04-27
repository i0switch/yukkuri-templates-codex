# script_prompt_pack_yaml

使用prompt: 10_yaml_prompt.md

episode_id: ep971-zm-fridge-cold-air-leak-bill

script_final.md の自然な発話単位を保ったまま YAML 化した。meta.layout_template、visual_asset_plan、main image、sub bullets、bgm block を記録した。

このファイルはprompt pack実行証跡であり、Codexレビュー監査ではない。既存script配下の台本本文は使わず、今回のテーマとテンプレート制約に合わせて新規生成した。


## YAML変換補足

script_final.md の自然な発話単位を dialogue[].text に保持し、字幕表示の都合で機械分割しなかった。meta.layout_template は Scene02 で全10シーン共通指定し、scenes[].scene_template と meta.scene_template は使わない。main.kind は全シーン image、asset は assets/sNN_main.png に統一した。

Scene02 はsub領域を持つため、subには4〜6項目の短い補助箇条書きだけを入れ、mainに説明文やcaptionを入れない。sub: null は使わない（Scene02は常にsub必須）。

ZMエピソード固有の設定: voice_engine: voicevox、aquestalk_presetは記載しない。characters.left（zundamon）は voicevox_speaker_id: 3、characters.right（metan）は voicevox_speaker_id: 2。pair: ZM。

visual_asset_plan[].imagegen_prompt は対象シーンの会話を含む直投げ型にし、main.asset_requirements.imagegen_prompt と整合させた。meta.width と meta.height は HD 1280x720（ユーザーデフォルト）、fpsは30、target_duration_secは300（80発話×3.8秒≈304秒）にした。BGMは dova-s.jp/bgm/detail/23286 を指定し、bgm/track.mp3 として記録。音声durationはbuild-episodeが実測してscript.render.jsonへ反映する。

total_duration_sec: 300 をYAML末尾に記録した。
