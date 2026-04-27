# script_prompt_pack_draft

## 使用prompt
- `_reference/script_prompt_pack/05_draft_prompt_zundamon.md`
- `_reference/script_prompt_pack/examples/example_bad_vs_good_dialogue.md`
- `_reference/script_prompt_pack/examples/example_bad_vs_good_structure.md`

## 実行結果
- `script_draft.md` を作成。
- `script_final.md` はdraftを自然会話として整えた完成版。
- 画像生成プロンプト、YAML、script_finalレビューは本担当範囲外のため未作成。

## 照合結果
- 解説役3セリフ以上連続: PASS（めたん3連続なし）
- ずんだもんが質問だけ: PASS（勘違い、焦り、ボケ、ツッコミを配置）
- Q&Aだけで進む単調往復: PASS（誤解、失敗例、比較、手順、再フックを混在）
- 「そうなのだ」系ばかり: PASS（「じゃん」「マジで」「かな」「だね」を混在）
- 数字/具体例/あるある/比較不足: PASS（全シーンに補強あり）
- 章タイトルが説明目次: PASS（フック型タイトル）
- 冒頭の解説宣言: PASS（「今回は」開始なし）
- 中盤再フック: PASS（s05、s06）
- 最後の具体行動: PASS（今日15分でメール変更と管理アプリ登録）
- Scene01 sub方針: PASS（sub_content: null）

## 自己判定
- PASS
- 軽微な改善余地: YAML化時に字幕表示が長く見える箇所があっても、台本側では機械分割せずRemotion側の表示調整に任せる。
