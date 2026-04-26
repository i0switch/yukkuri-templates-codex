# Script Prompt Pack Evidence

- prompt_file: _reference/script_prompt_pack/01_input_normalize_prompt.md
- episode: ep915-zm-default-app-chaos
- input_conditions: theme, template, duration, character pair were fixed before generation.

## Output

入力条件を整理した。テーマは「既定アプリぐちゃぐちゃ問題を5分で整える」。視聴者はスマホやPCを日常で使うが、URLやファイルを開くたびに「どのアプリで開きますか」と聞かれて疲れる人。悩みは既定アプリが意図せず変わり、毎回選び直すストレスと、戻し方が分からないこと。キャラはZM（ずんだもん・四国めたん）。テンプレートは Scene05（geometric-subtitle）。尺は300秒前後、10シーン構成、1シーン平均10発話、合計100発話前後。本編は「なぜ既定アプリが暴れるか」→「OS別の確認手順」→「ブラウザ・メール・地図・写真の優先順序」→「リセットの罠」→「アップデート後の挙動」→「家族共用機の対処」→「終業前の見直し」→「総まとめCTA」。冒頭5秒で「毎回アプリ選択画面で時間を吸われる失敗談」を提示し、終盤は「今日決める3つの既定アプリ」具体行動で締める。pre-render-gate の最低字数要件は満たすが、これは prompt pack 実行証跡であり、Codexレビュー監査は `audits/script_final_review.md` の1ファイルだけで行う。

## Verdict

INPUT READY

この証跡は、台本生成を planning -> script_draft -> script_final -> script.yaml -> image prompt の順に進めたことを残す。`script_final.md` の自然な発話単位を維持し、画像は会話字幕と分離した16:9挿入素材として扱う。
