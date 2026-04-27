# script_prompt_pack_draft

## 使用プロンプト
- `_reference/script_prompt_pack/04_draft_prompt_yukkuri.md`

## 生成結果
- 出力先:
  - `script/ep950-rm-free-wifi-trap/script_draft.md`
  - `script/ep950-rm-free-wifi-trap/script_final.md`
- pair: RM
- layout_template: Scene01
- scene_count: 10
- dialogue_count: 100

## draft 実行方針
- 表示都合の機械分割はしない。
- `script_final.md` は自然会話の完成版として作成。
- 画像生成プロンプト、YAML、script_final_review は今回未作成。
- Scene01のため `sub_content: null` / sub: null 方針。
- 既存台本の内容流用はせず、無料Wi-Fiのテーマで新規構成。

## 照合した品質ルール
- `example_bad_vs_good_dialogue.md`
  - 魔理沙3連続なし
  - 霊夢が質問だけにならない
  - Q&Aだけで進めない
  - 数字/具体例/あるある/比較を入れる
  - 「今回は〇〇について解説します」で始めない
- `example_bad_vs_good_structure.md`
  - 章タイトルはフック型
  - 中盤再フックあり
  - 最後は具体行動で締める

## セルフ監査
- シーン数: 10 / PASS
- セリフ数: 100 / PASS
- 霊夢の勘違い・怖がり・ボケ・ツッコミ: PASS
- 魔理沙だけ3連続: なし / PASS
- L3以上リアクション: 複数あり / PASS
- 各シーンの具体補強: PASS
- Scene01 sub null方針: PASS
- YAML/画像生成プロンプト未作成: 要件通り
