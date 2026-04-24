# Yukkuri Scene Templates — プロジェクト開始ガイド

## 目的

22 種類の背景画像 × 2 キャラペア（RM / ZM）= **44 枚の静止画 PNG** を Remotion で生成する。
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

プロジェクトルートに `public/backgrounds/bg-{01..22}.jpeg` として配置する。
リュウドウから配布された 22 枚を**そのまま**使用（加工禁止）。

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
| 19 | 和室＋タイトル吹出＋字幕吹出 | title吹出 + main + subtitle吹出 |
| 20 | タイトル＋白ボード＋机 | title + main + char机 |
| 21 | 虹色光線＋中央ガラス＋下字幕 | main + subtitle |
| 22 | UI装飾＋中央余白＋下字幕 | main + subtitle (+ 装飾UIは背景の一部) |

詳細は `templates/scene-XX_*.md` を参照。

## ディレクトリ構成

```
yukkuri-templates/
├── 00_START_HERE.md                  (このファイル)
├── 01_generation-guide.md             生成プロセスの進め方（監査なしフロー）
├── 02_background-setup.md             22 枚の背景配置ガイド
├── 03_remotion-project-setup.md       Remotion 初期化（44 Composition）
├── 04_common-design-tokens.md         design-tokens.ts の実装
├── 05_component-design.md             共通コンポーネント設計
├── 06_scene-layout-guide.md           各背景のエリア判定指針（Claude Code が参照）
├── 07_codex-audit-brief.md            Codex に渡す監査依頼書
├── _reference/
│   └── remotion_image_recreation_guide.md
└── templates/
    ├── scene-01_*.md ～ scene-22_*.md    各背景の個別指示書（22 ファイル）
```

## 進行順

### Phase 0: 共通基盤
1. `03_remotion-project-setup.md` に従って Remotion プロジェクトを初期化。
2. `02_background-setup.md` に従って背景画像 22 枚を配置。
3. `04_common-design-tokens.md` の `design-tokens.ts` を実装。
4. `05_component-design.md` の共通コンポーネント 5 種を実装：
   - `CharacterFace`
   - `Background`
   - `SubtitleBar`
   - `SpeechBubble`
   - `AreaLabel` (new)
5. `src/compositions/_DebugChars.tsx` で 4 キャラ動作確認。

### Phase 1: 全シーン実装（22 × 2 = 44 枚）

**重要：各シーンは `templates/scene-XX_*.md` の指示に従って実装する。**
その指示書には「背景画像の空きスペースを見て、キャラ位置とコンテンツエリア位置を決める」という
判断を Claude Code 自身に委ねる箇所がある。判断指針は `06_scene-layout-guide.md` に記載。

各シーンで：
1. `src/compositions/SceneXX.tsx` を実装（props で両ペア対応）。
2. `src/Root.tsx` に `SceneXX_RM` と `SceneXX_ZM` の 2 Composition を登録。
3. `npm run render:XX-rm` と `npm run render:XX-zm` で PNG 2 枚を出力。
4. 出力を Codex 監査用ディレクトリにまとめる。
5. **監査は Codex が担当**。Claude Code は監査ループを回さない。

### Phase 2: Codex 監査フェーズ

44 枚の生成が終わったら、`07_codex-audit-brief.md` の内容を Codex に渡して監査させる。
Codex が NG を出したら、該当シーンだけ修正して再生成する。

## 重要な方針変更点（前版との差分）

| 項目 | 前版 | 今版 |
|---|---|---|
| 背景 | 厳密再現不要・差し替え可 | **画像そのまま使う・加工禁止** |
| エリア座標 | 仕様書で全指定 | **Claude Code が背景を見て判断**（範囲指針あり） |
| シーン数 | 10 シーン | **22 シーン** |
| サブエリア | なし | **対応（必要な背景のみ）** |
| 監査 | Claude Code が自律ループ | **Codex に委ねる** |
| 生成数 | 20 枚 | **44 枚** |

## 禁止事項

- ❌ 背景画像を加工・変形する（そのまま使う）
- ❌ RM だけ生成して ZM を後回しにする
- ❌ エリアラベル（「ここはメインコンテンツエリア」等）を削る
- ❌ `full_a.png` を使う（必ず `compose_*.png`）
- ❌ 監査ループを Claude Code 内で回す（監査は Codex 担当）
- ❌ キャラを背景の主要な装飾要素（例: 画像6 のメカパネル）の上に重ねる
