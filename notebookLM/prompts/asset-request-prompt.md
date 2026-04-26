# 素材生成プロンプト

NotebookLM に渡す素材生成要求のテンプレ。

## 共通要件
- 台本の Scene 意図に一致すること
- 図内テキストは原則すべて日本語にすること（英文化 → fallback 行きを防ぐため必達）
- 英語見出しや英語ラベルを混ぜないこと
- 著作権侵害や実在人物肖像を要求しないこと
- 一目で伝わる構造を優先すること

## 視認性パラメータ（必達）

scene_template の用途別エリアサイズ（`06_scene-layout-guide.md:127-150` を参照）に応じて、次を満たすこと。

- **余白率**：図要素が canvas の 80% を超えない（min 10% の余白を上下左右に確保）
- **テキストサイズ**：1 文字あたり canvas 短辺の 4% 以上（main 1280×720 想定なら最小 28px 相当）
- **行数**：1 図に 5 行を超えない（超える場合は別 marker に分割）
- **キャラ非干渉**：Scene のキャラ立ち位置（左下／右下）に図要素が重ならない構図
- **コントラスト**：背景と図要素のコントラスト比 4.5:1 以上

## テンプレエリア連動ルール

動画全体で固定された `scene_template` の主要素エリアに合わせて orientation を選ぶ：

| layout_template の主用途 | TYPE | orientation | 補足 |
|---|---|---|---|
| 横長メインエリア（Scene01, 09, 18 等） | FIG | landscape | 全体像のタイトルカード |
| 縦長サブエリア（Scene02, 03, 10, 13, 14） | INFO | portrait | 補足・比較・チェックリスト |
| 中央重視（Scene04, 11, 12 等） | INFO | portrait or square | 図解・因果・比較 |
| まとめ（章末） | SLIDE | portrait | 3 ポイント以内 |

`notebooklm_runner.py` の `build_artifact_create_command` で TYPE 別に orientation を切り替える。INFO marker を landscape で発注すると、テンプレの縦長エリアにフィットせず、視認性が落ちる。

## main / sub の差別化指示

main + sub 構成の layout_template では、main と sub の生成プロンプトを必ず別文に分ける。

- **main 用 prompt**：「<主訴>を 1 つだけ強調する横長の図。背景はクリーン、タイトル文字なし、画面中央に主役オブジェクト。」
- **sub 用 prompt**：「<補完観点>を 3 項目以内のチェックリストまたは比較表で示す縦長の図。各項目は短文（10 字以内）。」

両者の `desc` を別文にすることで、NotebookLM が異なる artifact を返す。

## 失敗時 fallback 禁止

NotebookLM が拒否した marker について、**ローカル fallback 画像（`create_fallback_cards.py`）を採用してはならない**。

- 失敗時は `marker.status = failed_permanent` で残し、retry または手動介入で解決する
- `quality-criteria.json: asset_quality.fallback_count_max = 0` により、fallback が混入した時点で audit が FAIL になる
- retry 上限（既定 3 回）を超えた場合は `manual_intervention_helper.py`（実装予定）で「desc 修正候補」「再投入コマンド」を出力し、人間判断を待つ

## FIG
- タイトルカード
- 横長
- 全体像が一目でわかる構成

## INFO
- セクションの要点を 1 つだけ説明する
- 縦長寄り
- 図解・因果・比較を優先

## MAP
- 概念や関係性を示す
- 中央概念と枝を明確にする

## SLIDE
- まとめ用
- 3つ前後の重要ポイント整理
- 動画素材として使う前提なので、各ページが静止画化されても読めるレイアウトにする

## VIDEO
- 補足説明用の短い動画
- 派手さより説明力を優先
