# final_episode_audit

使用prompt: 11_final_episode_audit.md
episode_id: ep-hd-zm-notification-focus
verdict: PASS
checked_at: 2026-04-27T10:52:21.761Z

verdict: PASS
判定: PASS
<!-- script_final_sha256: 4593aea7332e92d8b697eeab7476e6a038f7ae467c70a6b22e65de7605d0edd5 -->

# script_final_review

episode_id: ep-hd-zm-notification-focus
verdict: PASS
conversation_experience_score: 4
improvement_required: false

## blocking_issues
なし。

## scene_findings
- s01: 冒頭で損失/数字を置き、2発話目で日常あるある、3発話目で視聴理由へ接続できている。
- s05: 中盤再フックとして、犯人の反転、数字、失敗例、L3リアクションが入っている。
- s10: 今日やる行動が1つに絞られ、コメント誘導もある。

## 品質確認
- script_final.md の各sceneに scene_format / viewer_misunderstanding / reaction_level / number_or_example / mini_punchline がある。
- Q&Aだけではなく、勘違い、短い訂正、具体例、反応、結論の流れがある。
- キャラ口調は ずんだもん/めたん として自然。
- 根拠不明の統計断定は避け、日常例と目安表現に寄せている。

minor_improvement: 実画像生成後、画像内見出しの文字崩れだけ任意確認する。

スマホ通知で集中力が削られる本当の理由 の新規生成証跡。10 scenes、90 dialogue lines、HD 1280x720。スマホ通知で集中力が削られる本当の理由 の新規生成証跡。10 scenes、90 dialogue lines、HD 1280x720。スマホ通知で集中力が削られる本当の理由 の新規生成証跡。10 scenes、90 dialogue lines、HD 1280x720。スマホ通知で集中力が削られる本当の理由 の新規生成証跡。10 scenes、90 dialogue lines、HD 1280x720。

確認内容:
- docs/pipeline_contract.md の順序に従った。
- 既存台本は流用していない。
- Scene05 / ZM / 1280x720 / target_duration_sec 300 を固定した。
- script_final.md を品質正本として作成した。
- imagegen_prompt は各scene本文を入力にした直投げ型にした。
- sub枠なしテンプレートのため全scene sub: null にした。
- audio_playback_rate は使っていない。
