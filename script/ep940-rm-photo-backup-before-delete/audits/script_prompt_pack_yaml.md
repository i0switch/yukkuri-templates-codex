# script_prompt_pack_yaml

使用prompt: 10_yaml_prompt.md

episode_id: ep940-rm-photo-backup-before-delete

script_final.md の自然な発話単位を保ったまま YAML 化した。meta.layout_template、visual_asset_plan、main image、sub bullets、bgm block を記録した。

このファイルはprompt pack実行証跡であり、Codexレビュー監査ではない。既存script配下の台本本文は使わず、今回のテーマとテンプレート制約に合わせて新規生成した。


## YAML変換補足
script_final.md の自然な発話単位を dialogue[].text に保持し、字幕表示の都合で機械分割しなかった。meta.layout_template は動画ごとに単一指定し、scenes[].scene_template と meta.scene_template は使わない。main.kind は全シーン image、asset は assets/sNN_main.png に統一した。Scene02/Scene14 はsub領域を持つため、subには短い補助箇条書きだけを入れ、mainに説明文やcaptionを入れない。

visual_asset_plan[].imagegen_prompt は対象シーンの会話を含む直投げ型にし、main.asset_requirements.imagegen_prompt と整合させた。meta.width と meta.height はユーザーの既定に合わせてHD 1280x720、fpsは30、target_duration_secは300にした。BGMはselect-bgmが正式なbgm/track.mp3とmeta.jsonのライセンス台帳を入れる前提で、初期状態ではfile:nullにした。音声durationはbuild-episodeが実測してscript.render.jsonへ反映する。