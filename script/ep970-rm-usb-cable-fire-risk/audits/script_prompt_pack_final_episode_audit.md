# final_episode_audit

使用prompt: 11_final_episode_audit.md

episode_id: ep970-rm-usb-cable-fire-risk

verdict=PASS

watchability_checks:
- opening_15s: OK（s01で「激安充電器の発火事故、消費者庁に毎年数十件」を15秒以内に提示、見続ける理由あり）
- midpoint_rehook: OK（s05でPSEなし充電器の出火事例と消費者庁データを中盤50%位置で再提示）
- final_action: OK（s10で「今夜は1本だけケーブルを手に取って被覆に触れてみてくれ」の具体的1アクション）
- comment_prompt: OK（s09「コメントで教えてほしいんだけど、みんな今すぐ手元のケーブル確認できる？ひびある人いる？」s10「コメントに「確認した」か「ひびあった」か書いてくれたら嬉しいわ」の2段階誘導）
- motion_emphasis: OK（s01=warning、s05=reveal、s10=recap、emphasis付与3シーン）

conversation_experience_score=4.2

script_final.md は完全新規で、冒頭10秒の見続ける理由（就寝中発火リスク）、各シーンの小さなオチまたは納得（mini_punchline）、実用的な最終行動（1本被覆チェック）を満たす。Codexレビュー（script_final_review.md）でRev1・Rev2のFAIL指摘を全修正しRev3でPASS判定取得済み。画像方針は抽象的な汎用素材へ逃げず、各シーンの行動・概念が一目で分かる直投げ型プロンプトにした。YAMLは単一テンプレートScene02、本文直書きなし、画像1枚/シーンの生成前提で作成した。

この証跡は、指定prompt packを使った判断過程と採用理由を残すためのもの。本文は既存script/配下の台本から転記せず、今回のテーマ、視聴者、テンプレート、品質基準に合わせて新規生成した。既存episodeの構造はファイル配置とschema確認だけに使い、本文、比喩、言い回し、シーンタイトル、ネタは流用していない。監査で再確認しやすいよう、採用理由と禁止事項への対応を明文化して残す。
