# 04_PROMPT_PACK_REBUILD: Prompt Pack再設計

## 目的

旧来のテンプレ穴埋め型プロンプトをやめ、感情曲線・情報設計・自然会話・監査・画像責任分離に基づくPrompt Packへ作り直す。

## 作成するファイル

`prompts/` 配下に以下を作成してください。

```text
prompts/
├── 00_core_principles.md
├── 01_planning_prompt.md
├── 02_yukkuri_script_draft_prompt.md
├── 03_zundamon_script_draft_prompt.md
├── 05_script_rewrite_prompt.md
├── 06_yaml_conversion_prompt.md
├── 07_visual_plan_prompt.md
├── 08_image_generation_v2.md
├── 09_visual_audit_prompt.md
├── 10_remotion_card_design_prompt.md
├── character_specs.md
└── scene_patterns.md
```

## `00_core_principles.md`

必ず入れる内容:

- テンプレ穴埋め禁止
- DraftとYAMLを分ける
- YAML変換時も発話単位を維持する
- キャラの役割固定禁止
- 語尾だけでキャラを立てない
- 画像生成とRemotion描画を分ける
- 実物監査を行う

## `01_planning_prompt.md`

出力させるもの:

- 動画タイトル
- 想定視聴者
- 視聴者の悩み
- 冒頭の興味/不安
- 最後に得る納得
- 感情曲線
- 各シーンの情報ゴール
- 各シーンの感情ゴール
- シーンパターン割当
- 具体例候補
- NG表現

## `02_yukkuri_script_draft_prompt.md`

霊夢/魔理沙用。

必須ルール:

- `script.yaml`を直接書かない
- 1シーン6〜12発話
- Draft段階で表示都合で先に切り詰めない
- 誤解→訂正だけを連発しない
- 霊夢を質問マシンにしない
- 魔理沙を訂正マシンにしない
- ボケ膨張、ツッコミ、具体例、小オチ、次への引きを入れる
- 魔理沙の「だぜ」連発禁止

## `03_zundamon_script_draft_prompt.md`

ずんだもん/めたん用。

必須ルール:

- ずんだもんを「なのだ」だけのキャラにしない
- めたんを説明マシンにしない
- 質問→回答だけの構造を連発しない
- 生活感、失敗談、皮肉、共感を入れる

## 台本レビュー

`script_audit.json` / `audit_script_draft.json` は生成しない。
Codexレビュー対象は `script_final.md` のみ。

## `05_script_rewrite_prompt.md`

FAILしたシーンを修正するためのプロンプト。

出力:

- fail_reason
- rewrite_policy
- revised_scene
- remaining_risk

## `06_yaml_conversion_prompt.md`

`script_final.md` から `script.yaml` へ変換。

ルール:

- 意味を壊さない
- キャラ口調を変えない
- 情報順序を変えない
- 発話単位を維持
- 分割しても短文羅列にしない

## `07_visual_plan_prompt.md`

各シーンごとに以下を出す。

- scene_goal
- visual_goal
- AI画像で作るもの
- Remotionで描画するもの
- フリー素材で探すもの
- 画面下部20%安全域
- 字幕・キャラとの衝突回避

## `08_image_generation_v2.md`

AI画像生成プロンプト作成用。

禁止:

- `hook_type`, `visual_type`, `myth_vs_fact`, `before_after` などの抽象タグ混入
- 日本語長文
- 表
- 矢印
- チェックリスト
- 金額

必須:

- 具体的な場所
- 具体的な物体
- 人物の状況
- 感情
- 見せたい一瞬
- 余白
- main枠での見やすさ

## `09_visual_audit_prompt.md`

画像監査用。

確認:

- 台本一致
- テーマ一致
- 日本語破綻なし
- 情報量過多なし
- 下部安全域
- 字幕/キャラ衝突なし
- ゆっくり動画らしさ

## `10_remotion_card_design_prompt.md`

Remotion説明カード設計。

用途:

- 金額
- 数字
- 比較表
- チェックリスト
- フローチャート
- 矢印
- 注意喚起

AI画像ではなくRemotion描画すべきものを明確化する。

## `character_specs.md`

霊夢、魔理沙、ずんだもん、めたんの仕様を書く。

## `scene_patterns.md`

以下4パターンを書く。

- A: 誤解→訂正
- B: 経験談→補強
- C: 解説者が逆に詰まる
- D: 2人で気づく

同一パターン3連続禁止。
