episode_id: ep984-rm-free-app-data
prompt_source: 10_yaml_prompt.md
theme: 無料アプリはなぜ無料で使えるのか
hook: 無料の代金は、お金じゃなくてデータです
pair: RM
layout_template: Scene12
resolution: 1280x720
既存台本流用: なし。ユーザー指定テーマから新規作成。

YAML化。script_final.md の自然発話単位を維持し、meta.layout_template、voice_engine、pair、width、height、fps、target_duration_secを固定した。audio_playback_rateは使わない。Scene21/Scene12はいずれもsubなしなので、全sceneでmain.kind image、sub nullにした。ZMはvoicevox speaker idをずんだもん3、めたん2に固定し、RMはaquestalk presetだけを使う。motion_modeとemphasisはs01、中盤再フック、最終行動でnon-normalかつSEありにして視聴維持gateへ対応した。

判定: PASS
blocking_issues: なし
品質メモ: フック、再フック、今日やる行動が明確で、説明bot化を避けるため各sceneに反応と具体例を入れている。
