# template_analysis

使用prompt: 02_template_analysis_prompt.md

episode_id: ep970-rm-usb-cable-fire-risk

Scene02 を単一テンプレートとして採用した。Scene02のレイアウト仕様：main area=横長コンテンツ画像（16:9、1290×746相当）、sub area=右側bullets枠（468×736）、sub.kind=bulletsを全10シーンで必須とする。titleスロットなし。字幕はオーバーレイ表示。キャラクターと字幕が占める下部20%には重要情報を配置しない方針を画像プロンプト全件に明記した。

sub.kind=bulletsは全シーンで必須（Scene02はsub=nullを使わない）。各シーンのbullets項目数は4〜6件で設計した。main.kind=imageのみ使用。visual_asset_planとmain.asset_requirements.imagegen_promptは同一内容にした。layout_template: Scene02を唯一のテンプレートとし、scenes[].scene_templateおよびmeta.scene_templateは使用禁止ルールを維持した。

この証跡は、指定prompt packを使った判断過程と採用理由を残すためのもの。本文は既存script/配下の台本から転記せず、今回のテーマ、視聴者、テンプレート、品質基準に合わせて新規生成した。既存episodeの構造はファイル配置とschema確認だけに使い、本文、比喩、言い回し、シーンタイトル、ネタは流用していない。監査で再確認しやすいよう、採用理由と禁止事項への対応を明文化して残す。
