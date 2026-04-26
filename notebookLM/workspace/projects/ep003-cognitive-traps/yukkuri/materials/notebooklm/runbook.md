# NotebookLM runbook

- style: yukkuri
- script: C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep003-cognitive-traps\yukkuri\script\script_v1.md
- notebook_title: ep003-cognitive-traps-yukkuri
- notebook_id: e8b06dbf-6474-4eb5-af10-b319ce8960dd

## Preflight
- nlm login --check
- nlm setup list

## Setup warnings
- Codex CLI 側の MCP 設定は確認できていません。必要なら Codex 側で `mcp.json` を参照して手動設定してください。

## Upload
- nlm notebook create ep003-cognitive-traps-yukkuri
- nlm source add e8b06dbf-6474-4eb5-af10-b319ce8960dd --file C:\Users\i0swi\OneDrive\デスクトップ\yukkuri-templates Codex - コピー\notebookLM\workspace\projects\ep003-cognitive-traps\yukkuri\script\script_v1.md --wait

## Recovery
- nlm login
- nlm setup add claude-code
- Codex 側は repo 直下の mcp.json を参照して手動設定

## Markers
- FIG:1 (infographic): 5つの認知の罠の全体像。中央に脳のシルエット、周囲に5つのドットマーカーで「確証バイアス／ゲシュタルト崩壊／カクテルパーティ効果／フォアラー効果／プライミング」を象徴的に配置した白背景フラットイラスト。
- INFO:1 (infographic): 確証バイアスの比喩図。手に持ったふるいから青い玉だけが下に落ち、赤い玉は弾かれる構図。白背景・フラット・青系。文字なし。
- INFO:2 (infographic): 確証バイアス対策の手順視覚化。左右に向かい合う吹き出しアイコン、片方の中に小さな逆三角アイコン1つ（反対意見1個ルール）。緑強調、白背景。文字なし。
- INFO:3 (infographic): ゲシュタルト崩壊の抽象視覚化。中央に文字風の幾何学図形（実在の漢字ではなく抽象的な四角と縦横線の組み合わせ）が分解する様子、周辺に分解線。灰青系・白背景。実在文字なし。
- INFO:4 (infographic): 慣れによる見落としの視覚化。3列のチェック欄アイコン、3列目だけに1つ空白マーク（3周目で抜ける現象）。緑とグレー・白背景。文字なし。
- INFO:5 (infographic): カクテルパーティ効果の視覚化。複数の人影シルエットが点在し、中央から黄色の波紋が広がる構図。青背景に黄アクセント。実在カフェロゴなし、文字なし。
- INFO:6 (infographic): 気づきの偏りの視覚化。机と椅子のアイコン、人影シルエット2、片方にだけ電球アイコン1（一方だけが気づく非対称）。グレーに黄アクセント。文字なし。
- INFO:7 (infographic): 鏡の前の人影と星印で、自分に当てはまる感覚を示す白背景フラット図。紫青系で文字なし。
- INFO:8 (infographic): 三つの書類アイコンと空白枠で、あいまいな評価コメントを示す白背景フラット図。灰色基調で文字なし。
- INFO:9 (infographic): 小さな図形から買い物かごへ矢印が向かう白背景フラット図。青系で文字なし。
- SLIDE:1 (slide_deck): 5つの認知の罠まとめスライド。横並びの5つの円形アイコン（確証バイアス／ゲシュタルト崩壊／カクテルパーティ効果／フォアラー効果／プライミング）と、1つに緑の丸印で囲った「今日選ぶ罠」の表現。最終行動として「1つ確認」「1つ選ぶ」「保存」「翌日見直す」の4ステップを下部に小さく示す。緑強調・白背景。
- INFO:10 (infographic): メモ帳アイコンと翌日カレンダーを矢印でつなぐ白背景フラット図。緑と灰色で文字なし。
