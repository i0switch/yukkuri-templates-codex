# rewrite

使用prompt: 07_rewrite_prompt.md

episode_id: ep953-zm-password-reuse-account-takeover

人間監査で、s01冒頭が「強いパスワードを使い回せば楽かな？」から始まり、使い回しの前提説明が不足していると指摘された。冒頭1〜3発話を、サイトごとに変える面倒くささという日常前提から連鎖乗っ取りリスクへ接続する流れへ差し替えた。script_final.md、script.yaml、image_prompt_v2.md、script.yaml内のs01 imagegen_promptを同期した。既存画像は概念図として新しい冒頭にも合うため再生成しない。
