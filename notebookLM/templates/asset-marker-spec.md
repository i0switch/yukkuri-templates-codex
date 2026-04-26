# 素材プレースホルダー仕様

台本内に埋め込む視覚素材マーカーの定義。
Claude Code はこの仕様に従って台本から素材要求を抽出し、NotebookLM で生成・取得・マッピングする。

## マーカー書式

```text
[<TYPE>:<n>] <要求内容1行説明>
```

- 行頭に配置する
- `<n>` は各 TYPE ごとに 1 から連番
- 説明文は 40 字以内

## タイプ一覧

| TYPE | 用途 |
|------|------|
| `FIG` | タイトルカード・全体像 |
| `INFO` | セクション内詳細図解 |
| `MAP` | 概念関係図（mind-map JSON） |
| `SLIDE` | まとめスライド |
| `VIDEO` | 補足動画 |

## 配置ルール

1. イントロに `[FIG:1]` 必須
2. 各本編セクションに最低 1 つの素材マーカー
3. まとめに `[SLIDE:1]` 必須
4. 同一発話内に複数マーカーを入れない
5. 連続するマーカーの間に最低 1 発話を挟む
6. 1 マーカー = 1 論点を原則にする
7. 1 枚に「仕組み + 影響 + 対策」を詰め込まない
8. 長尺動画では 60〜90 秒ごとに 1 つ以上のマーカーを置く
9. 3 項目以上の説明は、比較図・流れ図・チェックリストに分割して別マーカーへ逃がす

## 分割の目安

- 「全体像」は `FIG`
- 「1つの仕組み」は `INFO`
- 「比較」は 1 比較につき 1 `INFO`
- 「原因と結果」は分けられるなら 2 枚に分ける
- 「危険サイン」「チェックリスト」「対処法」は別 `INFO` にする
- 15 分前後の長尺では `FIG:1` と `SLIDE:1` を含めて 10〜14 マーカーを目安にする

## マッピング

```text
[FIG:1]   -> fig_1.png
[INFO:1]  -> info_1.png
[MAP:1]   -> map_1.json
[SLIDE:1] -> slide_1.pdf
[VIDEO:1] -> video_1.mp4
```

## 言語ルール（必達）

`<要求内容1行説明>`（marker.desc）は **日本語のみ**で記述する。

- 英文（ASCII alphabet のみで構成された語、空白除去後 60% 以上が ASCII alphabet）が含まれる desc は NotebookLM が拒否しやすく、結果として fallback 画像が生成される原因になる
- 固有名詞・専門用語の英語ラベル（例：`CRISPR`、`DNA`、`NotebookLM`）は許容するが、説明文の地文は必ず日本語で書く
- desc は `notebooklm_runner.py` の `build_artifact_create_command` の `--focus` 引数として渡される。この引数は NotebookLM 内部で図内文言の生成シードとして使われるため、日本語でないと図内が英文化する

## main / sub 差別化要件

scene_template が main + sub 構成（`Scene02 / 03 / 10 / 13 / 14`）の場合、main 用と sub 用は別 marker として分け、内容を差別化する：

- **main**：そのシーンの主訴を 1 つだけ。横長レイアウトに耐える構図。タイトル要素なし
- **sub**：main を補完する観点（比較・チェックリスト・注意点・補足）。3 項目以内の小要素だけ。文字主体

main marker と sub marker の `desc` 内容が同一だと NotebookLM が同じ artifact を返してしまい main/sub 同一画像になる。`desc` 文言を必ず変える。

## 失敗時の挙動

- NotebookLM が拒否（kind=infographic で生成失敗）した場合、**fallback 画像（`create_fallback_cards.py` 由来）を採用しない**
- 失敗 marker は `status = failed_permanent` または `download_failed` で残し、retry または手動介入で解決する
- `quality-criteria.json` の `asset_quality.fallback_count_max: 0` により、fallback が混入した時点で audit が FAIL になる
