# script_prompt_pack_template_analysis

使用prompt: 02_template_analysis_prompt.md

episode_id: ep971-zm-fridge-cold-air-leak-bill

Scene02 を単一テンプレートとして全10シーンに採用。Scene02はsub領域（箇条書き補助）を持つため、全シーンにsub: bullets（4〜6項目）を配置する。main は画像のみ（kind: image）。scenes[].scene_template は使わない。meta.scene_template も使わない。

motion_mode は s01=warning、s02=checklist、s03=warning、s04=punch、s05=reveal（中盤再フック）、s06=checklist、s07=checklist、s08=checklist、s09=compare、s10=recap で設定した。s01・s05・s10 の3シーンに emphasis を付与する。

このファイルはprompt pack実行証跡であり、Codexレビュー監査ではない。既存script配下の台本本文は使わず、今回のテーマとテンプレート制約に合わせて新規生成した。
