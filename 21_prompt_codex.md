# Codex 用マスタープロンプト：動画1本を自律生成する（ImageGen 自前生成版）

このファイルを丸ごと Codex に投入する。
Claude Code 用プロンプト（`20_prompt_claude-code.md`）との違いは **メイン画像を
フリー素材サイトから調達する代わりに、Codex の image gen スキルで自前生成する** 点のみ。

前提：`10_video-pipeline.md` と `90_asset-license-memo.md` を既読であること。

---

## 0. このプロンプトのゴール

指定されたテーマから、**動画 1 本の完全自律生成**を達成する。
成果物は `out/videos/{episode_id}.mp4` と `script/{episode_id}/meta.json`。

Claude Code 版との差分（太字）：

| 工程 | Claude Code 版 | Codex 版 |
|---|---|---|
| メイン画像 | いらすとや・ニコニ・コモンズ | **image gen スキルで自前生成** |
| サブ画像 | 同上 | **同上（image gen）** |
| 写真が必要な素材 | フリー素材サイト | **フリー素材サイト（写真生成は避ける）** |
| BGM | DOVA-SYNDROME | 同左 |
| 効果音 | 効果音ラボ | 同左 |
| 音声合成 | VOICEVOX + AquesTalk | 同左（導入済み） |

---

## 1. インプット

リュウドウから以下が渡される。不足は賢い初期値を置く。

| 項目 | 必須 | 例 |
|---|---|---|
| episode_id | 必須 | `ep002-crispr-basics` |
| theme | 必須 | 「CRISPR ってなに？」 |
| pair | 必須 | `ZM` または `RM` |
| target_duration_sec | 任意（既定180） | 210 |
| audience | 任意 | 「高校生以上・理系興味層」 |
| tone | 任意 | 「知的好奇心を刺激・少しシニカル」 |
| image_style | 任意（既定"フラット・明るい・白背景"） | 「サイバー・青緑系・暗背景」 |

---

## 2. Phase 1 — 台本生成

Claude Code 版 `20_prompt_claude-code.md#2` と完全に同一の手順でやる。差分は以下 1 点のみ：

### 素材要件の記述を ImageGen 向けプロンプトに寄せる

各 scene の `main.kind: image` に `asset_requirements` を書く際、
`search_keywords` の代わりに `imagegen_prompt` を入れる：

```yaml
main:
  kind: image
  asset: assets/s02_main.png
  caption: "DNA を切り貼りする分子ハサミ"
  asset_requirements:
    imagegen_prompt: |
      フラットデザインのイラスト、白背景。
      中央にDNAの二重らせん、その一部を分子ハサミ（はさみ型のアイコン）が
      切り取ろうとしている構図。色は青緑系、線はくっきり。
      16:9 アスペクト比。テキスト・文字は一切入れない。
    style: "フラット・アイコン系"
    aspect: "16:9"
    negative: "写真風、リアル調、文字、ロゴ、人物の顔"
```

**imagegen_prompt の設計原則**：

1. **構図**を最初に言う（中央に〜、左に〜）
2. **スタイル**を明示する（フラット / アイコン / 線画 / 3D / 水彩 ほか）
3. **色**を指定する（台本の image_style と揃える）
4. **アスペクト**を数値で書く（16:9 / 4:3 / 1:1）
5. **文字を含めない**を明記（画像内の文字は読めないゴミになる）
6. **negative** で弾きたい要素を書く

---

## 3. Phase 2 — 素材生成・調達

### Step 2.1: メイン画像・サブ画像を image gen スキルで生成

`script.yaml` の全 scene をループし、`main.kind == 'image'` と `sub.kind == 'image'` のものについて
image gen スキルを呼ぶ。

```
入力: asset_requirements.imagegen_prompt
出力サイズ: 1920×1080（16:9）または 1280×960（4:3）または 1024×1024（1:1）
保存先: script/{ep}/assets/{scene_id}_main.png（or _sub.png）
```

生成後の自己チェック：

- [ ] 出力画像に想定外の文字・ロゴが入っていないか（軽く目視）
- [ ] 指定アスペクトが守られているか
- [ ] メインコンテンツエリアは中央に配置されているか（Remotion 側でフィットさせるため）

**アウトが出た時のリトライ基準**：
- 文字が入っている → `negative` に「文字、タイポグラフィ、ロゴ、署名」を強化して再生成
- 暗すぎる / 明るすぎる → `image_style` の色味指定を強化
- 要素が多すぎる → プロンプトの主語を絞る（「DNA」だけ、など）

最大 3 回まで再試行。それでもダメなら台本の該当シーンを `main.kind: text` にフォールバック。

### Step 2.2: BGM 選定（自前生成しない）

Claude Code 版と同じ。DOVA-SYNDROME でテーマに合うものを選んで DL。
BGM は AI 生成より人間の作曲家の曲のほうがクオリティが安定するので、このフェーズでは image gen は使わない。

### Step 2.3: 効果音（任意）

効果音ラボから必要分を取得。

### Step 2.4: meta.json の記録（ImageGen 版）

```json
{
  "episode_id": "ep002-crispr-basics",
  "generated_at": "2026-04-24T18:00:00+09:00",
  "generator": "Codex (with image gen skill)",
  "assets": [
    {
      "file": "assets/s02_main.png",
      "source_site": "imagegen",
      "source_url": null,
      "imagegen_prompt": "フラットデザインのイラスト、白背景。中央にDNAの...",
      "imagegen_model": "<スキルで使ったモデル名>",
      "license": "生成画像（プロジェクト内利用）",
      "credit_required": false,
      "fetched_at": "2026-04-24T18:02:11+09:00"
    },
    {
      "file": "bgm/track.mp3",
      "source_site": "dova-syndrome",
      "source_url": "https://dova-s.jp/bgm/play12345.html",
      "license": "DOVA-SYNDROME 標準利用規約",
      "credit_required": false,
      "fetched_at": "2026-04-24T18:04:30+09:00"
    }
  ]
}
```

`imagegen_prompt` を必ず記録する。後で同じトーンの素材を追加生成したい時の再現性のため。

---

## 4. Phase 3 — 音声合成（VOICEVOX + AquesTalk）

### Step 3.1: 音声エンジン選択

`script.yaml` の `meta.voice_engine` で決まる：

| pair | 推奨 voice_engine | 理由 |
|---|---|---|
| ZM（ずんだもん・めたん） | `voicevox` | 本人音声あり |
| RM（霊夢・魔理沙） | `aquestalk` | 本家ゆっくり音声 |

### Step 3.2: VOICEVOX 経路（ZMペア）

詳細は `20_prompt_claude-code.md#4 Phase 3` と同じ。`scripts/voicevox.mjs` 実装を使う。

話者 ID：
- ずんだもん（ノーマル）: `3`
- 四国めたん（ノーマル）: `2`

### Step 3.3: AquesTalk 経路（RMペア）

AquesTalk 系（SofTalk・棒読みちゃん・AquesTalk2 CLI）がローカルに入っている前提。
Windows 環境なら SofTalk.exe のコマンドライン経由が最も確実。

`scripts/aquestalk.mjs` を新規作成：

```javascript
// scripts/aquestalk.mjs
import { spawnSync } from 'node:child_process';
import fs from 'fs/promises';
import path from 'path';

// 霊夢・魔理沙のゆっくり音声定番設定
const VOICES = {
  reimu:   { x: 1, r: 100, s: 150, v: 100 },   // /X:1 女性1 /R:速度 /S:音程 /V:音量
  marisa:  { x: 0, r: 110, s: 120, v: 100 },   // /X:0 男性1 のピッチ上げで魔理沙風
  // 本家ゆっくりの魔理沙は AquesTalk2 女声1・ピッチ100〜120 が近い
};

const SOFTALK = process.env.SOFTALK_EXE || 'C:\\Program Files\\SofTalk\\SofTalk.exe';

export async function synthAquesTalk(text, character, outPath) {
  const v = VOICES[character];
  if (!v) throw new Error(`unknown character: ${character}`);
  // SofTalk コマンドラインで WAV 書き出し
  const args = [
    `/X:${v.x}`,
    `/R:${v.r}`,
    `/S:${v.s}`,
    `/V:${v.v}`,
    `/W:${text}`,
    `/O:${outPath}`,
    `/T:y`,
  ];
  const r = spawnSync(SOFTALK, args, { encoding: 'utf-8' });
  if (r.status !== 0) throw new Error(`SofTalk failed: ${r.stderr}`);
  return outPath;
}

export async function buildAudioForEpisodeRM(episodeDir, script) {
  const durations = {};
  for (const scene of script.scenes) {
    for (const line of scene.dialogue) {
      const character = line.speaker === 'left'
        ? script.characters.left.character
        : script.characters.right.character;
      const outFile = path.join(episodeDir, 'audio', `${scene.id}_${line.id}.wav`);
      await synthAquesTalk(line.text, character, outFile);
      durations[`${scene.id}_${line.id}`] = wavSec(outFile);
    }
  }
  await fs.writeFile(path.join(episodeDir, 'line-durations.json'), JSON.stringify(durations, null, 2));
  return durations;
}

function wavSec(filePath) {
  const r = spawnSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0', filePath], { encoding: 'utf-8' });
  return parseFloat(r.stdout.trim());
}
```

**注意点**：

- AquesTalk 由来の音声をそのまま動画化して YouTube にアップロードする場合、
  ライセンス（AquesTalk の利用規約）を必ず確認する。個人・非商用は無料だが、
  商用収益化する場合は AquesTalk の商用ライセンスが必要になるケースがある。
- SofTalk の exe パスは環境によって違う。`SOFTALK_EXE` 環境変数で上書き可能にしておく。
- セリフに記号（`「」？！`）が混じると SofTalk が誤読することがあるので、
  事前に `「` `」` を除去し `？` は `?` に、`！` は `!` に変換する。

### Step 3.4: エンジン振り分け

`scripts/build-episode.mjs` で `voice_engine` を見て呼び分け：

```javascript
import { buildAudioForEpisode as buildVV } from './voicevox.mjs';
import { buildAudioForEpisodeRM as buildAQ } from './aquestalk.mjs';

const script = parse(await fs.readFile(scriptPath, 'utf-8'));
const durations = script.meta.voice_engine === 'aquestalk'
  ? await buildAQ(episodeDir, script)
  : await buildVV(episodeDir);
```

### Step 3.5: 尺確定 → script.yaml 書き戻し

`20_prompt_claude-code.md#4 Step 3.3` と同じ。

---

## 5. Phase 4〜6 — Remotion 実装・レンダリング・自己チェック

`20_prompt_claude-code.md#5` 〜 `#7` と完全に同一。再掲しない。

---

## 6. Phase 7 — 納品

リュウドウへの報告テンプレ（ImageGen 版の差分）：

```markdown
# {episode_id} 動画生成完了

- 成果物: out/videos/{episode_id}.mp4
- 長さ: {DUR}秒（目標 {target_duration_sec}秒）
- シーン数: {N}
- 音声エンジン: {voicevox | aquestalk}
- 主要素材: ImageGen 生成 {N}点 ＋ DOVA-SYNDROME BGM 1点
- ライセンス台帳: script/{episode_id}/meta.json

## 生成画像の品質（自己評価）
- s02_main.png: {OK / 要再生成（理由: ...）}
- s04_main.png: {OK / 要再生成（理由: ...）}
- ...

## 確認してほしいポイント
- [ ] メイン画像のトーン・スタイルが動画全体で統一されているか
- [ ] セリフの口調（left/right）
- [ ] BGM のムード
```

---

## 7. 失敗時のフォールバック（ImageGen 特有）

| 事象 | 一次対処 | 二次対処 |
|---|---|---|
| ImageGen が 3 回連続で要求通りの画像を出さない | プロンプトを最小化（要素を 1 つに絞る） | 該当 scene を `main.kind: text` に退避 |
| ImageGen に文字が入り続ける | negative に「text, typography, logo, signature, watermark, captions, letters, numbers」を追加 | negative 強化でダメなら text 退避 |
| ImageGen の絵柄がシーン間で大きくバラつく | 全 scene の imagegen_prompt を統一プレフィックスで修飾（例：「フラットデザイン・白背景・青緑基調。」を先頭に固定）して再生成 | 既存画像で統一感のないものだけ再生成 |
| AquesTalk が記号で止まる | 記号除去フィルタを通す | SofTalk 側のログを見て該当文字を特定して除去 |
| 霊夢・魔理沙の音声に違和感（高すぎ・低すぎ） | VOICES テーブルの r/s 値を ±10 調整 | 再生成 |

---

## 8. 禁止事項（ImageGen 特有を追加）

- ❌ ImageGen で**写真写実**を生成する（Pexels 等のフリー写真サイトから持ってくる）
- ❌ ImageGen で**既存キャラ・既存IP**を生成する（著作権）
- ❌ 同一プロンプトで生成した画像を 2 シーン以上で使い回す（視聴者に気付かれる）
- ❌ `imagegen_prompt` を `meta.json` に書かないまま次 Phase へ進む

---

## 9. 開始時の最初のメッセージ

Codex は最初に以下を出力してから Phase 1 に入る：

```
動画生成を開始します（ImageGen 自前生成モード）。
- エピソードID: {episode_id}
- テーマ: {theme}
- ペア: {pair}（音声エンジン: {voice_engine}）
- 目標尺: {target_duration_sec}秒
- 画像スタイル: {image_style}

Phase 1（台本生成）から進めます。完了まで途中確認は挟みません。
```
