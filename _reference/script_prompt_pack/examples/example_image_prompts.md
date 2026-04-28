# example_image_prompts

このファイルは人間監査や追加学習用の補助資料であり、通常生成の必読入力ではない。

詳しいサンプルは次を参照。

- `script/ep950-rm-storage-first-step-sample/audits/script_prompt_pack_image_prompts.md`
- `script/ep951-zm-frozen-rice-sample/audits/script_prompt_pack_image_prompts.md`

必須要素:

- ChatGPT Images 2.0へそのまま渡せる自然言語
- Sceneテンプレート
- main/sub枠
- 補強するセリフ
- 補強する感情
- foreground / midground / background
- 画像内テキストを使う場合は日本語のみ
- 下部に白帯、入力欄、チャット欄、テキストボックス風の余白を作らない
- 字幕やキャラに重なる位置へ重要情報を置かない
- 1枚ずつ生成（同一コマンド内で他画像と同時に出力させない／別 Codex プロセスでの並列起動は許可）
