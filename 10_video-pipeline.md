# 動画化パイプライン仕様書

静止画42枚の基盤から**動画**を生成するための全体仕様。Claude Code / Codex 両方の
プロンプト（`20_prompt_claude-code.md`・`21_prompt_codex.md`）はこの仕様書に従う。

---

## 0. 用語

| 用語 | 意味 |
|---|---|
| 1本 | 1エピソード分の動画（3〜10分想定） |
| 台本 | `script/{episode_id}/script.yaml`（単一の正） |
| 素材 | 画像・BGM・効果音など動画に貼り付けるもの |
| レンダリング | Remotion で MP4 に書き出すこと |
| リップシンク | セリフ再生中だけ `talk` 表情、それ以外は `neutral/smile/calm` にする処理 |

---

## 1. 全体フロー

```
[01 企画] リュウドウがテーマとエピソードIDを指定
        ↓
[02 台本生成] AI が script.yaml を書き出す（シーン割り・セリフ・素材要件まで）
        ↓
[03 素材調達] AI が各 scene の main/sub 用画像を取得（DL or ImageGen）＋ BGM 選定
        ↓
[04 音声合成] VOICEVOX でセリフ WAV を生成・セリフ秒数を計測
        ↓
[05 タイミング確定] セリフ秒数を script.yaml に書き戻して各シーン duration を確定
        ↓
[06 Composition 実装] script.yaml を読む VideoMain を Remotion に実装
        ↓
[07 レンダリング] remotion render で MP4 を書き出し
        ↓
[08 自己チェック] AI が ffprobe で検査（長さ・音量・解像度）
        ↓
[09 納品] out/{episode_id}.mp4 を提示
```

**ポイント**：台本 `script.yaml` が全工程のハブ。セリフ追加も素材差し替えも台本編集→再ビルドで完結。

---

## 2. ディレクトリ構成（動画化で追加される部分）

```
yukkuri-templates/
├── script/                            ← 新規
│   └── {episode_id}/
│       ├── script.yaml                台本（単一の正）
│       ├── audio/
│       │   ├── s01_l01.wav            セリフ音声（sceneID_line番号）
│       │   ├── s01_l02.wav
│       │   └── ...
│       ├── assets/                    動画内に埋め込む画像・図解
│       │   ├── s01_main.png
│       │   ├── s02_main.png
│       │   ├── s02_sub.png
│       │   └── ...
│       ├── bgm/
│       │   └── track.mp3
│       ├── se/                        効果音（任意）
│       │   ├── swoosh.mp3
│       │   └── pop.mp3
│       └── meta.json                  調達ソース・ライセンス記録（必須）
│
├── src/
│   ├── compositions/
│   │   ├── Scene01.tsx ... Scene21.tsx   既存（動画対応に改修）
│   │   └── VideoMain.tsx              ← 新規（script.yaml 駆動）
│   ├── components/
│   │   ├── CharacterFace.tsx          既存
│   │   ├── SubtitleBar.tsx            既存
│   │   ├── Lipsync.tsx                ← 新規
│   │   └── SceneRenderer.tsx          ← 新規（1シーン分の動画描画）
│   └── lib/
│       └── load-script.ts             ← 新規（yaml → typed object）
│
├── scripts/
│   ├── voicevox.mjs                   ← 新規（セリフ WAV 生成・尺計測）
│   ├── fetch-assets.mjs               ← 新規（Claude Code 用・フリー素材DL）
│   └── build-episode.mjs              ← 新規（台本→音声→ビルド→レンダの司令塔）
│
└── out/
    └── videos/
        └── {episode_id}.mp4           最終成果物
```

`script/{episode_id}/meta.json` はライセンス・出典管理の**監査用台帳**。AI は素材をDL or
生成したら必ずここに追記する（詳細は `90_asset-license-memo.md`）。

---

## 3. 台本スキーマ（`script.yaml`）

YAML で書く。JSONより手編集しやすい・コメントが書ける。

```yaml
# script/{episode_id}/script.yaml
meta:
  id: "ep001-synbio-intro"           # ファイル名と一致
  title: "合成生物学ってなに？"
  pair: "ZM"                         # "RM" | "ZM"
  layout_template: "Scene02"          # 動画全体で固定する見た目スキン（Scene01〜Scene21）
  fps: 30
  width: 1920
  height: 1080
  audience: "初心者向け"
  tone: "フレンドリーで知的好奇心を刺激"
  bgm_mood: "穏やか＋好奇心"
  voice_engine: "voicevox"           # "voicevox" (ZMペア) | "aquestalk" (RMペア)
  target_duration_sec: 180           # 目安（厳守ではない）

characters:
  # pair: ZM の例（voice_engine: voicevox）
  left:
    character: "zundamon"
    voicevox_speaker_id: 3           # ずんだもん（ノーマル）
    speaking_style: "語尾に〜なのだ／〜のだ。無邪気で好奇心旺盛。"
  right:
    character: "metan"
    voicevox_speaker_id: 2           # 四国めたん（ノーマル）
    speaking_style: "ですわ／ますわ口調。落ち着いた解説役。"

  # pair: RM の場合（voice_engine: aquestalk）
  # left:
  #   character: "reimu"
  #   aquestalk_voice: { x: 1, r: 100, s: 150, v: 100 }   # 霊夢定番値
  #   speaking_style: "丁寧だが少し怠惰。〜ですわ、は使わない。"
  # right:
  #   character: "marisa"
  #   aquestalk_voice: { x: 0, r: 110, s: 120, v: 100 }   # 魔理沙定番値
  #   speaking_style: "語尾に〜ぜ／〜だぜ。元気で前のめり。"

bgm:
  source_url: "https://dova-s.jp/..."
  file: "bgm/track.mp3"
  license: "DOVA-SYNDROME 標準利用規約・クレジット不要"
  volume: 0.12                       # BGMは小さめ固定推奨
  fade_in_sec: 1.0
  fade_out_sec: 1.5

scenes:
  # シーンの順序＝動画の再生順
  - id: "s01"
    role: "intro"                    # "intro" | "body" | "outro" | "cta"
    title_text: "合成生物学ってなに？"      # titleSlot に入るテキスト（ある場合）
    main:
      kind: "text"                   # "text" | "image" | "bullets"
      text: "生物を『設計』する学問"
    sub: null
    dialogue:
      - id: "l01"
        speaker: "left"              # "left" | "right"
        text: "みんな、こんにちはなのだ！"
        expression: "smile"
        pre_pause_sec: 0.2           # セリフ前の間
        post_pause_sec: 0.3          # セリフ後の間
      - id: "l02"
        speaker: "right"
        text: "今日は合成生物学について解説しますわ"
        expression: "calm"
        pre_pause_sec: 0.1
        post_pause_sec: 0.4
    # duration_sec は [05 タイミング確定] で自動書き戻し

  - id: "s02"
    role: "body"
    main:
      kind: "image"
      asset: "assets/s02_main.png"     # 相対パス
      caption: "DNAを書き換える技術"
      asset_requirements:              # 素材調達用メタ情報（AIが参照）
        description: "DNA二重らせんのわかりやすいイラスト"
        style: "いらすとや風・フラット"
        aspect: "16:9 or 4:3"
    sub:
      kind: "bullets"
      items:
        - "医療への応用"
        - "バイオ燃料"
        - "食料生産"
    dialogue:
      - id: "l01"
        speaker: "left"
        text: "DNAを書き換えちゃうってことなのだ？"
        expression: "halfOpen"
      - id: "l02"
        speaker: "right"
        text: "そのとおりですわ。応用範囲はとても広いの"
        expression: "smile"

  # ... s03, s04, ... sNN

  - id: "s{N}"
    role: "outro"
    main:
      kind: "text"
      text: "ご視聴ありがとうございましたなのだ！"
    dialogue:
      - id: "l01"
        speaker: "left"
        text: "チャンネル登録よろしくなのだ！"
        expression: "happy"
      - id: "l02"
        speaker: "right"
        text: "次回もお楽しみに"
        expression: "smile"
```

### 3.1 シーン長の決定ルール

各シーンの `duration_sec` は以下で自動算出する（`build-episode.mjs` 内）：

```
duration_sec = sum(pre_pause + wav_sec + post_pause for each line)
             + 0.4   # シーン開始・終了の余白
```

切り上げ単位は 0.1秒。fps=30 なら 3フレーム刻み。

### 3.2 `meta.layout_template` の選び方

このプロジェクトでは **1動画につき1テンプレート固定** とする。`Scene01`〜`Scene21` は動画全体の見た目スキンであり、`scenes[]` は時間ブロックである。各 scene は同じ `meta.layout_template` に流し込み、`main` / `sub` / `title_text` / `dialogue` の中身だけを変える。

| 動画全体の用途 | 推奨 layout_template | 理由 |
|---|---|---|
| タイトル表示を重視 | Scene08, Scene15, Scene19, Scene20 | タイトルエリアがある |
| 図解＋補足を両立 | Scene02, Scene03, Scene10, Scene13, Scene14 | main+sub の2枠で整理しやすい |
| メイン1枚を大きく見せる | Scene05, Scene06, Scene07, Scene09, Scene18, Scene21 | 図解/写真を大きく出しやすい |
| UI風・SF風 | Scene11, Scene14, Scene17 | 情報パネル感を出しやすい |
| シンプル会話中心 | Scene01, Scene04 | 見出しと話者だけで成立しやすい |

`scenes[].scene_template` は使用禁止。旧 YAML に残っている場合は validation error とし、`meta.layout_template` へ移す。

---

## 4. Remotion 改修仕様

### 4.1 既存 Scene の改修（静止画→動画対応）

各 `SceneXX.tsx` は現状 props で静的に描画している。以下を足す：

```tsx
// src/compositions/SceneXX.tsx（改修後の骨子）
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from 'remotion';

export interface SceneVideoProps extends SceneProps {
  sceneData: SceneData;           // script.yaml から渡される 1 シーン分
  episodeDir: string;             // 'script/ep001-synbio-intro'
}

export const SceneXX_Video: React.FC<SceneVideoProps> = ({ sceneData, episodeDir, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 各 line の開始フレームを計算
  const lineTimeline = buildLineTimeline(sceneData, fps);

  // 現在のアクティブセリフ
  const activeLine = lineTimeline.find(l => frame >= l.startFrame && frame < l.endFrame);

  return (
    <AbsoluteFill>
      <Background src={LAYOUT.bgSrc} />

      {/* メインコンテンツ（text / image / bullets） */}
      <MainContent data={sceneData.main} layout={LAYOUT.main} episodeDir={episodeDir} />

      {/* サブ（ある場合） */}
      {sceneData.sub && <SubContent data={sceneData.sub} layout={LAYOUT.sub!} />}

      {/* タイトル（ある場合） */}
      {sceneData.title_text && <TitleText text={sceneData.title_text} layout={LAYOUT.title!} />}

      {/* キャラ（リップシンクあり） */}
      <LipsyncCharacter
        side="left"
        character={leftChar.character}
        activeLine={activeLine}
        layout={LAYOUT.leftChar}
      />
      <LipsyncCharacter
        side="right"
        character={rightChar.character}
        activeLine={activeLine}
        layout={LAYOUT.rightChar}
      />

      {/* 字幕（現在のアクティブセリフを表示） */}
      {activeLine && (
        <SubtitleBar text={activeLine.text} {...LAYOUT.subtitle} />
      )}

      {/* 音声 */}
      {lineTimeline.map(l => (
        <Audio
          key={l.id}
          src={staticFile(`${episodeDir}/audio/${sceneData.id}_${l.id}.wav`)}
          startFrom={0}
          trimBefore={l.startFrame}
        />
      ))}
    </AbsoluteFill>
  );
};
```

`SceneXX_Video` は既存 `SceneXX` の横に増設する（静止画用 `SceneXX` は削らない）。

### 4.2 `VideoMain.tsx`（新規・タイムライン全体）

```tsx
// src/compositions/VideoMain.tsx
import { Series, Audio, staticFile, AbsoluteFill } from 'remotion';
import { SceneRenderer } from '../components/SceneRenderer';

export interface VideoMainProps {
  script: Script;
  episodeDir: string;   // 'script/ep001-synbio-intro'
}

export const VideoMain: React.FC<VideoMainProps> = ({ script, episodeDir }) => {
  const { fps } = useVideoConfig();
  const bgm = script.bgm;
  return (
    <AbsoluteFill>
      {/* BGM 通奏 */}
      {bgm && (
        <Audio
          src={staticFile(`${episodeDir}/${bgm.file}`)}
          volume={(f) => {
            const totalFrames = script.total_duration_sec * fps;
            const fadeIn = interpolate(f, [0, bgm.fade_in_sec * fps], [0, bgm.volume], { extrapolateRight: 'clamp' });
            const fadeOut = interpolate(f, [totalFrames - bgm.fade_out_sec * fps, totalFrames], [bgm.volume, 0], { extrapolateLeft: 'clamp' });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}

      <Series>
        {script.scenes.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={Math.ceil(scene.duration_sec * fps)}
          >
            <SceneRenderer scene={scene} script={script} episodeDir={episodeDir} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
```

### 4.3 `Root.tsx` への登録

```tsx
import scriptEp001 from '../script/ep001-synbio-intro/script.yaml';  // yaml-loader 経由

<Composition
  id={`Video-${scriptEp001.meta.id}`}
  component={VideoMain}
  width={scriptEp001.meta.width}
  height={scriptEp001.meta.height}
  fps={scriptEp001.meta.fps}
  durationInFrames={Math.ceil(scriptEp001.total_duration_sec * scriptEp001.meta.fps)}
  defaultProps={{
    script: scriptEp001,
    episodeDir: `script/${scriptEp001.meta.id}`,
  }}
/>
```

### 4.4 リップシンクの仕様（簡易）

音素レベルの厳密なリップシンクはやらない。**セリフが再生されている区間だけ `talk` 表情を維持し、
0.12秒ごとに `talk ⇄ halfOpen` をトグル**する簡易パターンでOK。
非セリフ区間は `sceneData.dialogue[i].expression` で指定された表情を出す。

```tsx
function pickExpression(activeLine, frame, fps, defaultExp) {
  if (!activeLine) return defaultExp;
  if (activeLine.speaker !== mySide) return activeLine.expression ?? 'neutral';
  // 自分が話している区間：口パク
  const toggleFrames = Math.round(fps * 0.12);
  return ((frame - activeLine.startFrame) / toggleFrames | 0) % 2 === 0 ? 'talk' : 'halfOpen';
}
```

---

## 5. 音声合成（VOICEVOX + AquesTalk）

### 5.1 前提（リュウドウ環境）

両方ともローカルに導入済み：
- **VOICEVOX エンジン**：`http://127.0.0.1:50021` で起動（ZMペアのずんだもん・めたん用）
- **AquesTalk 系**（SofTalk / AquesTalk2 CLI / 棒読みちゃん 等）：RMペアの霊夢・魔理沙本人声用

ペアごとの推奨エンジンは以下。`script.yaml` の `meta.voice_engine` で指定する。

| pair | voice_engine | 理由 |
|---|---|---|
| ZM（ずんだもん＋めたん） | `voicevox` | 本人音声が提供されている |
| RM（霊夢＋魔理沙） | `aquestalk` | ゆっくり実況の伝統的音声・本家の音色 |

### 5.2 VOICEVOX 話者 ID（ZMペア用）

| キャラ | 話者名 | speaker_id |
|---|---|---|
| zundamon | ずんだもん（ノーマル） | 3 |
| metan | 四国めたん（ノーマル） | 2 |

`scripts/voicevox.mjs` で `/audio_query` → `/synthesis` の 2 段呼び出し。
詳細は `20_prompt_claude-code.md#4 Phase 3` を参照。

### 5.3 AquesTalk（RMペア用）

SofTalk 等のコマンドライン経由で WAV 生成。霊夢・魔理沙の音色は定番値がある：

| キャラ | 声種 (/X) | 速度 (/R) | 音程 (/S) | 音量 (/V) |
|---|---|---|---|---|
| reimu（霊夢） | 1 | 100 | 150 | 100 |
| marisa（魔理沙） | 0 | 110 | 120 | 100 |

調整余地あり。違和感があれば ±10 ずつ変える。SofTalk 呼び出し例：

```bash
SofTalk.exe /X:1 /R:100 /S:150 /V:100 /W:"こんにちは" /O:out.wav /T:y
```

`scripts/aquestalk.mjs` 実装は `21_prompt_codex.md#4 Step 3.3` を参照。

### 5.4 前処理（両エンジン共通）

セリフ文字列はエンジンに投げる前に軽くサニタイズ：

- `「` `」` を除去
- `？` → `?`、`！` → `!` に正規化（AquesTalk が全角記号を誤読することがある）
- 連続する空白を 1 つに圧縮

### 5.5 `scripts/voicevox.mjs` / `scripts/aquestalk.mjs` の責務

```
入力: script.yaml、話者ID or 声種テーブル
処理:
  1. セリフ前処理（サニタイズ）
  2. エンジン固有の API/CLI で WAV 生成
  3. script/{ep}/audio/{scene_id}_{line_id}.wav に保存
  4. ffprobe で WAV 長さを計測
出力: audio/*.wav + line-durations.json
```

### 5.6 尺計測 → 台本書き戻し

`build-episode.mjs` は音声生成後、`line-durations.json` を読んで
`script.yaml` の各 scene に `duration_sec` を計算して書き戻す（＋ `total_duration_sec`）。

### 5.7 エンジン振り分け（build-episode.mjs）

```javascript
const script = parse(await fs.readFile(scriptPath, 'utf-8'));
const durations = script.meta.voice_engine === 'aquestalk'
  ? await buildAudioForEpisodeRM(episodeDir, script)   // AquesTalk
  : await buildAudioForEpisode(episodeDir);             // VOICEVOX
```

---

## 6. 素材調達の方針

**大原則：使っていい素材かどうかを確認し、記録する。** 詳細ルールは `90_asset-license-memo.md`。

**画像エンジン大原則：Codex CLI 利用可能時は `yukkuri-codex-imagegen` スキル必須。** 失敗時はユーザー確認のうえで `notebooklm` / `text-fallback` へ降格する（サイレント降格は禁止）。

画像素材は **Image Engine** を解決してから振り分ける。Claude Code / Codex どちらで実行する場合でも、まず engine を解決してから対応フローを実行する。判定は `codex login status` ベース（OPENAI_API_KEY は不要）。
解決ロジックと運用詳細は ルートの `CLAUDE.md#Image Engine Workflow` を参照。

| 素材 | engine = codex-imagegen | engine = notebooklm（フォールバック） | engine = text-fallback |
|---|---|---|---|
| メイン画像 | imagegen で自前生成 | NotebookLM artifact として生成 | `main.kind: text` または `bullets` に縮退 |
| サブ画像 | 同上（必要なら） | 同上 | 同上 |
| BGM | DOVA-SYNDROME / 甘茶の音楽工房から選定 | 同左 | 同左 |
| 効果音 | 効果音ラボから選定 | 同左 | 同左 |

写真素材（写実写真）は engine に関わらず外部調達を推奨する（imagegen は写実写真と相性が悪く、NotebookLM も写真生成には向かない）。
イラスト・図解・アイコンは imagegen の出力強度が高い。

---

## 7. 成功条件

1本の動画が納品OKとみなせるのは以下が全部満たせたとき：

- [ ] `out/videos/{episode_id}.mp4` が存在し、解像度 1920×1080、fps=30
- [ ] 音声が全セリフ分途切れなく再生される（ffprobe で 0.5秒以上の無音区間が連続しない）
- [ ] 動画全長が `script.total_duration_sec ±1秒` の範囲
- [ ] BGM が通奏されている（`astats` で平均音量 ≒ volume 設定値）
- [ ] 字幕がセリフに同期している（0.2秒以内のズレ）
- [ ] `meta.json` に全素材のソースURL・ライセンスが記録されている
- [ ] キャラが画面外に出ていない・背景の主要装飾を覆っていない
