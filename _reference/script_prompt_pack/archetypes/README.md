# 台本アーキタイプ別テンプレ

ゆっくり解説動画には、構成パターン（アーキタイプ）が大きく3つある。
このディレクトリには、各アーキタイプ用の専用台本テンプレを置く。

`_reference/script_prompt_pack/` 直下の汎用プロンプト群（`01_台本生成プロンプト.md` 等）と組み合わせて使う。
汎用プロンプトが「キャラ・口調・出力形式」を担い、ここのテンプレが「構成・章立て・尺配分」を担う。

## アーキタイプ一覧

| アーキタイプ | ファイル | 適するテーマ | 推奨尺 | 難易度 |
|---|---|---|---|---|
| **リスト型(N選)** | [list-type.md](./list-type.md) | ◯選、ランキング、雑学、暴露、ハウツー | 5〜20分 | ★☆☆ |
| **事件解説型(章立て)** | [case-study-type.md](./case-study-type.md) | 凶悪事件、社会事件、歴史的事件、不祥事 | 15〜30分 | ★★★ |
| **サイエンス問題提起型** | [science-mystery-type.md](./science-mystery-type.md) | 進化、宇宙、古代史、脳科学、パラドクス | 15〜40分 | ★★★ |

## アーキタイプの選び方フローチャート

```
テーマを聞く
   │
   ├── お題を「N個」並べて紹介できるか？
   │     YES → リスト型(list-type.md)
   │
   ├── 1つの事件・事案を多章で深掘りするか？
   │     YES → 事件解説型(case-study-type.md)
   │            ★倫理・法的配慮チェックリストを必ず読む
   │
   └── 1つの大問題を立てて仮説と反証を繰り返すか？
         YES → サイエンス問題提起型(science-mystery-type.md)
                ★長尺退屈防止3原則を必ず読む
```

判定の決め手：
- 「順番を入れ替えても成立するか？」→ YES なら リスト型
- 「実在の人物・事件を扱うか？」→ YES なら 事件解説型
- 「結論が確定していない問いを扱うか？」→ YES なら サイエンス型

## 各アーキタイプ共通の前提

3つのアーキタイプぜんぶに共通する事項：

1. **対話形式**：ゆっくり霊夢・魔理沙ペア(RM) または ずんだもん・四国めたんペア(ZM)
2. **挨拶テンプレ**：冒頭は「ゆっくり◯◯です／ゆっくり◯◯だぜ」型
3. **締めテンプレ**：「最後までご視聴いただきありがとうございました／高評価とチャンネル登録よろしくね」3点セット
4. **字幕25文字制限**：1セリフ(`dialogue[].text`)は25文字以内に収める
5. **1動画1テンプレ固定**：`meta.layout_template` に `Scene01`〜`Scene21` を1つだけ指定し、`scenes[].scene_template` は使わない
6. **画像素材パス**：`script.yaml` では `assets/sXX_main.png` 形式の相対パス（CLAUDE.md の "script.yaml Render Schema 注意" 参照）
7. **Image Engine 解決**：台本生成前に engine を解決（`codex-imagegen` / `notebooklm` / `text-fallback`）し、対応する `asset_requirements` を埋める（詳細はルートの `CLAUDE.md#Image Engine Workflow` と `01_台本生成プロンプト.md` 末尾の「素材要件 (asset_requirements) 記述ルール」）

## 参考動画（4本のYouTube動画分析が出典）

各テンプレの「実例引用」セクションは、以下の参考動画の書き起こしから抽出している。

| アーキタイプ | 参考動画 | URL |
|---|---|---|
| リスト型 | 闇が深すぎる。日本の謎6選Part8（闇世界のツーリスト） | https://www.youtube.com/watch?v=ObAax1Pznb8 |
| リスト型 | 大食いYouTuber4選（ゆっくり闇の界隈） | https://www.youtube.com/watch?v=y_xNvMWqyD4 |
| 事件解説型 | 京都南丹市小5行方不明事件のその後（ゆっくり凶悪事件簿） | https://www.youtube.com/watch?v=uutCkxbz0FQ |
| サイエンス型 | 消えた人類の謎（世界の未解明ミステリー） | https://www.youtube.com/watch?v=_11OxkwLBTI |

引用は「教育目的の引用」として特徴的な構成箇所のみ抜粋。全文転載はしていない。

## ステータス

- [x] `list-type.md`：完成
- [x] `case-study-type.md`：完成
- [x] `science-mystery-type.md`：完成
