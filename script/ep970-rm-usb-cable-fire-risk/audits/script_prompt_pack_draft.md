# draft

使用prompt: 04_draft_prompt_yukkuri.md

episode_id: ep970-rm-usb-cable-fire-risk

会話台本を完全新規で作成した。説明文の羅列にせず、霊夢側も勘違い・生活感・ボケ・具体体験・強い反応を出す構成にした。解説役（魔理沙）は一方的な説明botにせず、視聴者が次に何をすればいいかを会話で整理する役にした。script_final.md の品質マーカーとして scene_format / viewer_misunderstanding / reaction_level / mini_punchline / number_or_example / セルフ監査を記録した。

RM向けキャラクタールール適用：
- 霊夢（left）: 焦り・勘違い・生活感・油断からの気づき。各シーン1発話目は実体験・勘違い・強い反応のいずれかで開始。
- 魔理沙（right）: 短いツッコミ・具体的な数字と事例・実用的な結論。だぜ末尾比率30〜60%目標、2連続だぜ末尾なし。
- 霊夢の疑問形: 1シーン最大1個。
- L3リアクション: s05「PSE……？マジで！？そんな基準があったの全然知らなかった！」、s09「マジで！？そう言われると2,700円が急に安く見える……」の2回配置。

発話ターゲット: 60発話（6発話×10シーン）。推定尺: 60 × 5.2秒/発話（AquesTalk係数）= 312秒（目標270〜330秒範囲内）。

各シーン品質マーカー確認：
- s01: reaction_level=L2、mini_punchline=「みんなやってる」が「みんなリスクを抱えてる」に変わる瞬間
- s02: reaction_level=L2、mini_punchline=「見た目は平気」が実は一番見つかりにくい危険サイン
- s03: reaction_level=L2、mini_punchline=「今まで大丈夫」は「ラッキーが続いていた」というだけ
- s04: reaction_level=L2、mini_punchline=外見は同じ、中身は別物
- s05: reaction_level=L3（中盤再フック）、mini_punchline=「充電できる」と「安全」は全く別の話
- s06: reaction_level=L1、mini_punchline=「たぶん大丈夫」のままにしてる人が一番危ない
- s07: reaction_level=L1、mini_punchline=マークがあるかどうかで「安全か」が決まる
- s08: reaction_level=L2、mini_punchline=「ちょっと熱い」を3回見逃すと積み上がるリスク
- s09: reaction_level=L3、mini_punchline=2,700円をケチると、その先に何が待ってるか
- s10: reaction_level=L2、mini_punchline=「全部完璧にやる」より「今夜1本触れる」のほうが価値がある

scene_format多様性: あるある→意外(s01)、あるある型(s02)、誤解訂正型(s03)、反証型(s04)、失敗エピソード型(s05)、手順型(s06/s07/s08)、Before/After型(s09)、まとめ再フック型(s10)の7種類。3種類以上の条件を満たす。s09にコミュニティ要素（コメント誘導2択）を配置。s10に具体的1アクションCTAを配置。

Codexレビュー（script_final_review.md）でRev1・Rev2のFAIL指摘（霊夢疑問形過多・不自然だぜ連結・s08疑問形2個）を全修正し、Rev3でPASS判定を得た。

この証跡は、指定prompt packを使った判断過程と採用理由を残すためのもの。本文は既存script/配下の台本から転記せず、今回のテーマ、視聴者、テンプレート、品質基準に合わせて新規生成した。既存episodeの構造はファイル配置とschema確認だけに使い、本文、比喩、言い回し、シーンタイトル、ネタは流用していない。監査で再確認しやすいよう、採用理由と禁止事項への対応を明文化して残す。
