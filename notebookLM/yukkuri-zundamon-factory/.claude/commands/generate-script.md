---
description: テーマから台本（ゆっくり / ずんだもん）を生成
argument-hint: テーマ：<自由文> / スタイル：<yukkuri|zundamon> [/ 尺：<分>]
---

# /generate-script

## 実行手順

1. 引数 `$ARGUMENTS` から `テーマ` `スタイル` `尺` をパース
2. `workflows/01-script-generation.md` を読んで手順に従う
3. `templates/{style}-template.md` を読み込む
4. `config/characters.json` から該当キャラ設定を抽出
5. `prompts/script-generation-prompt.md` のメインプロンプトに変数を展開
6. 台本を生成
7. 雛形の「✅ 生成時チェックリスト」を自分で走らせる
8. NG があれば `prompts/script-generation-prompt.md` の「リトライ用プロンプト」で自己修正（最大3回）
9. `output/scripts/<slug>.md` に保存
10. `output/final/<slug>-meta.json` を初期化（`workflows/01-script-generation.md` 手順6参照）
11. 完了報告（slug、字数、マーカー数）

## 引数

$ARGUMENTS

## 実行前チェック

- `templates/` ディレクトリが存在すること
- `config/characters.json` が存在すること
- `output/scripts/` ディレクトリが存在すること（無ければ作成）

## 出力

- `output/scripts/<slug>.md`
- `output/final/<slug>-meta.json`（初期化済み）

完了時は次の手順を簡潔に伝える：
```
次のステップ: /prepare-assets <slug>
```
