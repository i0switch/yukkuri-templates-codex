episode_id: ep983-zm-point-card-loss
prompt_source: 10_yaml_prompt.md
theme: ポイントカードを増やすほど損する理由
hook: ポイントのために余計な買い物してない？
pair: ZM
layout_template: Scene21
resolution: 1280x720
既存台本流用: なし。ユーザー指定テーマから新規作成。

YAML化。script_final.md の自然発話単位を維持し、meta.layout_template、voice_engine、pair、width、height、fps、target_duration_secを固定した。audio_playback_rateは使わない。Scene21/Scene12はいずれもsubなしなので、全sceneでmain.kind image、sub nullにした。ZMはvoicevox speaker idをずんだもん3、めたん2に固定し、RMはaquestalk presetだけを使う。motion_modeとemphasisはs01、中盤再フック、最終行動でnon-normalかつSEありにして視聴維持gateへ対応した。

判定: PASS
blocking_issues: なし
品質メモ: フック、再フック、今日やる行動が明確で、説明bot化を避けるため各sceneに反応と具体例を入れている。
