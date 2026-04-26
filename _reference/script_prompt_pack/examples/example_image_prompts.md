# example_image_prompts

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
- 画像内日本語短語
- 下部20%余白
- キャラ位置回避
- 1枚ずつ生成（同一コマンド内で他画像と同時に出力させない／別 Codex プロセスでの並列起動は許可）
