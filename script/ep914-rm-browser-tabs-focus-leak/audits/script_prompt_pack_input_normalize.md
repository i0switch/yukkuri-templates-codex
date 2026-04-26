# Script Prompt Pack Evidence

- prompt_file: _reference/script_prompt_pack/01_input_normalize_prompt.md
- episode: ep914-rm-browser-tabs-focus-leak
- input_conditions: theme, template, duration, character pair were fixed before generation.

## Output

入力条件を整理した。テーマはブラウザタブを閉じられない人の集中力回収術。視聴者は仕事や勉強でブラウザを使うが、未読タブが30〜100枚たまる人。悩みは作業と関係ないタブが視界に残り、戻るたびに集中が切れること。キャラはRM（霊夢・魔理沙）。テンプレートは Scene11（whiteboard-ui）。尺は300秒前後、10シーン構成、1シーン平均10発話、合計100発話前後。本編は仕分け（今やる/あとで/捨てる）→10秒メモ→置き場固定→作業中タブ三枚→大事な情報は戻れる→終業前リセット→例外ルール→総まとめCTAの流れ。冒頭5秒で「タブの森で集中力が漏れる」というあるある危機感を提示し、終盤は「今のタブを十枚未満にする」具体行動で締める。pre-render-gate の `validate-script-prompt-pack-evidence` の最低字数要件は満たすが、これは「証跡」であり Codex レビュー監査ではない。Codex レビューは `audits/script_final_review.md` の1ファイルだけで行う。

## Verdict

INPUT READY

この証跡は、台本生成を planning -> script_draft -> script_final -> script.yaml -> image prompt の順に進めたことを残す。`script_final.md` の自然な発話単位を維持し、画像は会話字幕と分離した16:9挿入素材として扱う。
