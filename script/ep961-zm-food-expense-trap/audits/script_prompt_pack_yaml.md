# yaml

使用prompt: 10_yaml_prompt.md

episode_id: ep961-zm-food-expense-trap

script_final.md の自然な発話単位を維持して script.yaml に変換した。dialogue[].text はコンポーネントへ直書きせず YAML を正本にする。meta.layout_template は Scene02 のみを使い、scenes[] は時間ブロックとして扱う。main.kind は image、sub は bullets、visual_asset_plan[].imagegen_prompt と main.asset_requirements.imagegen_prompt は同一にした。

この証跡は、指定prompt packを使った判断過程と採用理由を残すためのもの。本文は既存script/配下の台本から転記せず、今回のテーマ、視聴者、テンプレート、品質基準に合わせて新規生成した。既存episodeの構造はファイル配置とschema確認だけに使い、本文、比喩、言い回し、シーンタイトル、ネタは流用していない。監査で再確認しやすいよう、採用理由と禁止事項への対応を明文化して残す。
