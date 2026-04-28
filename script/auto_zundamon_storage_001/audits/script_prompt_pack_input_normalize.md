# Script Prompt Pack Evidence: input_normalize

prompt_file: 01_input_normalize_prompt.md
episode_id: auto_zundamon_storage_001
verdict: PASS

## Normalized Input

- theme: スマホの容量がすぐ埋まる本当の理由
- hook: 写真を消しても容量が減らない理由、知ってる？
- target_duration: 5分程度
- target_duration_sec: 300
- character_pair: ZM
- selected_template: Scene21 / templates/scene-21_ui-decoration.md
- audience: 写真を消してもスマホ容量が減らず困っている人
- tone: 生活ハック・スマホ整理・不安解消
- must_use_source: _reference/script_prompt_pack/local_canonical/zundamon_master.md

## Assumptions

ユーザーは「シナリオなどはすべてあなたに任せます。完成まで自動で決定して進めて」と指定しているため、episode_id、scene構成、台本の具体展開、画像方針、BGM moodはClaude側で決定する。既存台本は流用しない。テンプレートはScene21を厳守する。HD指定があるため、出力解像度は1280x720にする。

## Stop Reason

missing_itemsなし。キャラペア、テンプレート、尺、画像生成、動画出力条件が揃っているため、template_analysisへ進行可能。
