# plan

使用prompt: 03_plan_prompt.md
episode_id: ep-hd-zm-notification-focus
verdict: PASS
checked_at: 2026-04-27T10:52:21.755Z

# planning

episode_id: ep-hd-zm-notification-focus
title: スマホ通知で集中力が削られる本当の理由
pair: ZM
layout_template: Scene05
resolution: 1280x720
target_duration_sec: 300

## 視聴者体験設計
- 視聴者が最初に思っていそうなこと: 通知は見てもすぐ戻れる
- それが危ない/損する理由: 通知の確認時間より復帰コストが大きく、集中が細切れになる
- 最後に持って帰らせる行動: 不要アプリ3つのバッジを切る

## 感情曲線
- s01: 自分ごと化
- s02-s03: 誤解の破壊
- s04-s05: 危機感と中盤再フック
- s06-s08: 解決できそう感
- s09-s10: 今日やる行動

## キャラ役割
- left: 視聴者代表。勘違い、本音、怖がり、言い換え、軽いボケを担当。
- right: 解説役。短いツッコミ、具体例、結論を担当。

## 勝ち筋
- 一番強いフック: 通知1回で集中は割れる
- 中盤の再フック: 中盤の犯人は反応待ち
- コメント欄で答えさせる一言: 一番見てしまう通知
- 最後にやらせる行動: 今日の作業は不要アプリ3つのバッジを切る


確認内容:
- docs/pipeline_contract.md の順序に従った。
- 既存台本は流用していない。
- Scene05 / ZM / 1280x720 / target_duration_sec 300 を固定した。
- script_final.md を品質正本として作成した。
- imagegen_prompt は各scene本文を入力にした直投げ型にした。
- sub枠なしテンプレートのため全scene sub: null にした。
- audio_playback_rate は使っていない。
