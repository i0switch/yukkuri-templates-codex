# 生成プロセス（監査なしフロー）

## 全体像

```
[Phase 0]                   [Phase 1]                      [Phase 2]
共通基盤実装       →       シーン 01〜21 順次生成    →    Codex 監査
  ↑ 1 回のみ                各 RM/ZM ペア生成              (別 AI が担当)
                             (Claude Code はここで終了)
```

## Phase 1 の進め方

**並行実装は禁止**。シーン 01 から順番に 21 まで進める。
各シーンで以下を実施：

### Step 1: 背景画像の空きスペース分析

`public/backgrounds/bg-XX.jpeg` を Read ツールで開いて目視で以下を判定：

| 判定項目 | 例 |
|---|---|
| メインコンテンツが置けるのはどの範囲か | 「中央の大きな白板の中」「画面全体」 |
| サブコンテンツエリアはあるか | 「右側の縦長パネル」「なし」 |
| 字幕エリアはどこか | 「下部の白帯」「下部の吹き出し」「机領域全体」 |
| キャラを置くとしたら自然なのはどこか | 「下部机の上」「両端下」「字幕帯の左右端」 |

判定には `06_scene-layout-guide.md` と `templates/scene-XX_*.md` を参照。

### Step 2: Scene コンポーネント実装

`src/compositions/SceneXX.tsx` を共通テンプレベースに実装。
エリア座標は該当 scene-XX 仕様書に沿って定数として埋め込む。
エリアラベル（`<AreaLabel />`）を全エリアに配置する。

### Step 3: Root.tsx に登録

```tsx
<Composition id="SceneXX_RM" component={SceneXX} {...common}
  defaultProps={{
    leftCharacter:  { character: 'reimu' },
    rightCharacter: { character: 'marisa' },
    subtitleText: 'ここは字幕エリア',
  }} />
<Composition id="SceneXX_ZM" component={SceneXX} {...common}
  defaultProps={{
    leftCharacter:  { character: 'zundamon' },
    rightCharacter: { character: 'metan' },
    subtitleText: 'ここは字幕エリア',
  }} />
```

### Step 4: レンダリング

```bash
npm run render:XX-rm
npm run render:XX-zm
```

`out/scene-XX-rm.png` と `out/scene-XX-zm.png` が生成される。

### Step 5: 自己チェック（軽く）

以下だけ Claude Code 自身で確認（深追いは Codex に任せる）：
- [ ] 両方の PNG が生成された
- [ ] キャラが画面外に出ていない
- [ ] キャラが背景の重要装飾に完全に重なっていない
- [ ] エリアラベルが全部表示されている
- [ ] zundamon / metan で顔ではなく足先だけ映っている事故がない

問題があれば修正して再生成。問題なければ次のシーンへ進む。

### Step 6: 次シーンへ

`scene-XX+1` の Step 1 に戻る。シーン 21 まで完了したら Phase 2 へ。

## Phase 2: Codex 監査

42 枚生成完了後、以下を Codex に渡す：
- `07_codex-audit-brief.md` の内容
- `テンプレ/1 (X).jpeg` 21 枚（参照画像）
- `out/scene-XX-rm.png` と `out/scene-XX-zm.png` 計 42 枚
- `docs/all-scenes-rm-grid.png`（比較用グリッド）
- `docs/all-scenes-zm-grid.png`

Codex からの監査結果を受け取ったら、指摘された箇所を修正する。

## 最終グリッド画像の生成

全シーン完了後、以下コマンドで比較用グリッドを作る：

```bash
# RM 版 5x5 グリッド（21 枚は 5x5 で 4 枠余る）
ffmpeg -y \
  -i "out/scene-01-rm.png" -i "out/scene-02-rm.png" -i "out/scene-03-rm.png" -i "out/scene-04-rm.png" -i "out/scene-05-rm.png" \
  -i "out/scene-06-rm.png" -i "out/scene-07-rm.png" -i "out/scene-08-rm.png" -i "out/scene-09-rm.png" -i "out/scene-10-rm.png" \
  -i "out/scene-11-rm.png" -i "out/scene-12-rm.png" -i "out/scene-13-rm.png" -i "out/scene-14-rm.png" -i "out/scene-15-rm.png" \
  -i "out/scene-16-rm.png" -i "out/scene-17-rm.png" -i "out/scene-18-rm.png" -i "out/scene-19-rm.png" -i "out/scene-20-rm.png" \
  -i "out/scene-21-rm.png" \
  -filter_complex "
    [0:v]scale=384:216[v0];  [1:v]scale=384:216[v1];  [2:v]scale=384:216[v2];  [3:v]scale=384:216[v3];  [4:v]scale=384:216[v4];
    [5:v]scale=384:216[v5];  [6:v]scale=384:216[v6];  [7:v]scale=384:216[v7];  [8:v]scale=384:216[v8];  [9:v]scale=384:216[v9];
    [10:v]scale=384:216[v10];[11:v]scale=384:216[v11];[12:v]scale=384:216[v12];[13:v]scale=384:216[v13];[14:v]scale=384:216[v14];
    [15:v]scale=384:216[v15];[16:v]scale=384:216[v16];[17:v]scale=384:216[v17];[18:v]scale=384:216[v18];[19:v]scale=384:216[v19];
    [20:v]scale=384:216[v20];
    color=c=black:s=384x216[pad1];color=c=black:s=384x216[pad2];color=c=black:s=384x216[pad3];color=c=black:s=384x216[pad4];
    [v0][v1][v2][v3][v4]hstack=inputs=5[r1];
    [v5][v6][v7][v8][v9]hstack=inputs=5[r2];
    [v10][v11][v12][v13][v14]hstack=inputs=5[r3];
    [v15][v16][v17][v18][v19]hstack=inputs=5[r4];
    [v20][pad1][pad2][pad3][pad4]hstack=inputs=5[r5];
    [r1][r2][r3][r4][r5]vstack=inputs=5
  " \
  "docs/all-scenes-rm-grid.png"
```

ZM 版も同様に作る。

## 所要時間の目安

- Phase 0: 30 分〜1 時間（基盤実装）
- Phase 1: 各シーン 10〜15 分 × 21 = 3〜5 時間
- Phase 2: Codex 監査 + 修正ループ（リュウドウ次第）

## Claude Code が迷ったら

- 背景の空きスペースがわからない → 画像を Read して範囲を書き出してから実装
- エリアサイズの判断がつかない → `06_scene-layout-guide.md` の「判断指針テーブル」を参照
- キャラの最適位置がわからない → 下部両端が基本、背景に机があれば机の上
- 2 分割構成で迷ったら → main:sub = 約 2:1 の比率がよく使われる
