# Yukkuri Scene Templates — プロジェクト開始ガイド

## 目的

21 種類の背景画像 × 2 キャラペア（RM / ZM）= **42 枚の静止画 PNG** を Remotion で生成する。
将来的に動画化する前提で、各背景に対して以下を配置する：

- **背景**: 画像をそのまま丸ごと使う（加工しない）
- **キャラ**: 背景の空きスペースを見て Claude Code が最適位置を決める
- **メインコンテンツエリア**: 説明画像・図解が入る領域（動画化時に差し替え）
- **サブコンテンツエリア**: 注釈・補足が入る領域（必要な背景のみ）
- **字幕エリア**: セリフ字幕が入る領域

各エリアには静止画生成時、プレースホルダとして
「ここはメインコンテンツエリア」等のラベルを描画する。

**監査は Codex が担当する**。このプロジェクトで Claude Code は生成のみを行い、監査ループは回さない。

## キャラペア

| ペアID | 左キャラ | 右キャラ |
|---|---|---|
| `RM` | reimu（霊夢） | marisa（魔理沙） |
| `ZM` | zundamon（ずんだもん） | metan（めたん） |

## 背景画像

プロジェクトルートに `public/backgrounds/bg-{01..21}.jpeg` として配置する。
リュウドウから配布された 21 枚を**そのまま**使用（加工禁止）。

| # | 画像 | 想定エリア構成 |
|---|---|---|
| 01 | 水彩外枠＋クリーム内側 | main のみ（全面） |
| 02 | グレー3分割（左上メイン・右サブ・下字幕） | main + sub + subtitle |
| 03 | 黒ライン3エリア | main + sub + subtitle |
| 04 | 白ボード＋下部机（タイトルライン付き） | title + main + char机 |
| 05 | 幾何斜め＋下部中央字幕帯 | main + subtitle |
| 06 | メカ世界＋中央板＋下部字幕帯 | main + subtitle |
| 07 | 研究室＋ガラス板＋下部字幕 | main + subtitle |
| 08 | 和室＋タイトル札＋白板＋机 | title + main + char机 |
| 09 | シネマバー（中央ベージュ帯） | main のみ |
| 10 | モノクロ3エリア | main + sub + subtitle |
| 11 | 白ボード＋右上アイコン＋下部机 | main + subUI + char机 |
| 12 | 教室＋タイトル吹出＋字幕吹出 | title吹出 + main + subtitle吹出 |
| 13 | 黒3エリア（字幕中央寄せ） | main + sub + subtitle |
| 14 | 多層ガラスUI（5枠） | main + sub + subtitle + charSlot×2 |
| 15 | 和風夜桜＋左上タイトル＋下字幕 | title + main + subtitle |
| 16 | SF3段パネル（暗） | title + main + subtitle |
| 17 | SF3段パネル（中央明） | title + main + subtitle |
| 18 | 山海ぼかし＋下部机 | main + char机 |
| 19 | タイトル＋白ボード＋机 | title + main + char机 |
| 20 | 虹色光線＋中央ガラス＋下字幕 | main + subtitle |
| 21 | UI装飾＋中央余白＋下字幕 | main + subtitle (+ 装飾UIは背景の一部) |

詳細は `templates/scene-XX_*.md` を参照。

## ディレクトリ構成（現行）

```
yukkuri-templates/
├── 00_START_HERE.md                  (このファイル)
├── CLAUDE.md                         運用指示書（最新フローはここを参照）
├── 02_演出編集プロンプト.md          演出加工プロンプト
├── 06_scene-layout-guide.md          各背景のエリア判定指針
├── 10_video-pipeline.md              動画生成パイプライン
├── 21_prompt_codex.md                Codex 用マスタープロンプト
├── 90_asset-license-memo.md          素材ライセンス管理
├── _reference/
│   ├── script_prompt_pack/           台本生成プロンプト正本
│   ├── image_prompt_pack/            画像生成プロンプト正本
│   └── remotion_image_recreation_guide.md
├── templates/
│   └── scene-01_*.md ～ scene-21_*.md  各背景の個別指示書（21 ファイル）
├── workflows/
│   └── script_to_video_workflow.md
├── src/                              Remotion 実装
├── scripts/                          npm script 群
├── script/{episode_id}/              エピソードごとの台本・素材
└── public/                           backgrounds, characters, fonts, episodes
```

> 静止画 42 枚生成フェーズ（Phase 0–2）は完了済み。現在は台本→動画生成フローが正本。
> 詳細フローは `CLAUDE.md` と `workflows/script_to_video_workflow.md` を参照。

## 重要な方針変更点（前版との差分）

| 項目 | 前版 | 今版 |
|---|---|---|
| 背景 | 厳密再現不要・差し替え可 | **画像そのまま使う・加工禁止** |
| エリア座標 | 仕様書で全指定 | **Claude Code が背景を見て判断**（範囲指針あり） |
| シーン数 | 10 シーン | **21 シーン** |
| サブエリア | なし | **対応（必要な背景のみ）** |
| 監査 | Claude Code が自律ループ | **Codex に委ねる** |
| 生成数 | 20 枚 | **42 枚** |

## 禁止事項

- ❌ 背景画像を加工・変形する（そのまま使う）
- ❌ RM だけ生成して ZM を後回しにする
- ❌ エリアラベル（「ここはメインコンテンツエリア」等）を削る
- ❌ `full_a.png` を使う（必ず `compose_*.png`）
- ❌ 監査ループを Claude Code 内で回す（監査は Codex 担当）
- ❌ キャラを背景の主要な装飾要素（例: 画像6 のメカパネル）の上に重ねる
