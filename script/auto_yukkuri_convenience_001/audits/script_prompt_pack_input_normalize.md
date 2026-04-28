# Script Prompt Pack Evidence: input_normalize

prompt_file: 01_input_normalize_prompt.md
episode_id: auto_yukkuri_convenience_001
verdict: PASS

## Normalized Input

- theme: なぜコンビニに行くと余計なものを買うのか
- hook: コンビニで“ついで買い”するの、設計通りです
- target_duration: 5分程度
- target_duration_sec: 300
- character_pair: RM
- selected_template: Scene12 / templates/scene-12_classroom-bubbles.md
- audience: コンビニで予定外の買い物をしがちな人
- tone: 生活心理・買い物あるある・軽いツッコミ
- must_use_source: _reference/script_prompt_pack/local_canonical/yukkuri_master.md

## Assumptions

ユーザーは「シナリオなどはすべてあなたに任せます。完成まで自動で決定して進めて」と指定しているため、episode_id、scene構成、台本の具体展開、画像方針、BGM moodはClaude側で決定する。既存台本は流用しない。テンプレートはScene12を厳守する。HD指定があるため、出力解像度は1280x720にする。

## Stop Reason

missing_itemsなし。キャラペア、テンプレート、尺、画像生成、動画出力条件が揃っているため、template_analysisへ進行可能。
