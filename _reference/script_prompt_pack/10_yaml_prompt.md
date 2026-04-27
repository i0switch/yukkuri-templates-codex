# 10_yaml_prompt

## 目的

Codexレビュー済みの `script_final.md` を、既存レンダーシステムで使える `script.yaml` に変換する。

## 変換ルール

- `meta.id` はepisode_idと一致。
- `meta.layout_template` は `Scene01`〜`Scene21`。
- `meta.pair` は `RM` または `ZM`。
- `scenes[].scene_template` は絶対に書かない。
- `meta.scene_template` は新規で書かない。
- `main.asset` は `assets/s01_main.png` 形式。
- sub枠ありテンプレート（`Scene02` / `Scene03` / `Scene10` / `Scene13` / `Scene14`）では、全sceneの `sub` を `kind: text` または `kind: bullets` にする。
- `sub.kind: bullets` は原則4〜6項目にする。情報量があるsceneは6項目推奨。3項目だけにするのは締め・要約・最終行動など情報を絞る意図が明確な場合だけ。
- `sub.kind: text` は4〜6行の短い補足文にし、改行区切りで読ませる。
- sub枠なしテンプレートでは `sub: null`。
- `dialogue[].text` は `script_final.md` の自然な発話単位を維持する。
- 表示都合の機械分割をしない。
- 字幕の折り返し、縮小、収まりはRemotion側に任せる。
- セリフ順、ボケ、ツッコミ、中盤再フック、最終行動を圧縮で消さない。
- `visual_asset_plan` は各sceneに残す。
- 長文プロンプトは `image_prompts.json` を正本にしてよい。`script.yaml` には `visual_asset_plan[].imagegen_prompt_ref` を置ける。inline `imagegen_prompt` を使う場合も `script_final.md` の対象シーン全文を使った直投げ型プロンプトにする。
- `image_direction`、`visual_type`、`supports_dialogue`、`supports_moment`、`composition_type`、`hook_type`、`myth_vs_fact`、`boke_or_reaction` は v2 では使用しない。`imagegen_prompt` 本文にも混ぜない。
- `main.kind` は `image` のみ。sub枠ありテンプレートの `sub.kind` は `text` / `bullets` のどちらか。
- 新規動画で `sub.kind: image` は使わない。
- `main.caption` / `main.text` / `main.items` / `sub.caption` は使わない。`sub` は補助テキストまたは箇条書きとして使う。
- 画像出所と採用理由は `meta.json` にも記録する。
- `bgm:` ブロックは必須。`audit-video.mjs` が `bgm.file` の存在を要求する。
- `meta.pair: ZM` の場合、必ず `meta.voice_engine: voicevox` にする。
- `meta.pair: ZM` の場合、`characters.left.character: zundamon`、`characters.left.voicevox_speaker_id: 3`、`characters.right.character: metan`、`characters.right.voicevox_speaker_id: 2` にする。
- `meta.pair: ZM` では `aquestalk_preset` を絶対に書かない。AquesTalk指定は gate / build で FAIL になる。
- `meta.pair: RM` の場合、`meta.voice_engine: aquestalk` にする。
- 指定尺に合わせる目的で発話速度を変えてはいけない。`audio_playback_rate` は `meta` / `meta.json` のどちらにも書かない。
- `target_duration_sec` は台本密度の目安として残す。5分指定は `270〜330秒` を許容し、短すぎる/長すぎる場合は台本量で調整する。
- 5分動画は発話数だけで判定しない。RM/AquesTalkは `5.2秒/発話`、ZM/VOICEVOXは `3.8秒/発話` を初期係数として、音声合成前に推定自然音声尺を確認する。
- 最終sceneは必ず `role: cta` にする。`outro` / `ending` / `closing` で締めない。
- title slot がないテンプレートでは `title_text` を書かない。見出しが必要なら画像内短語かsub枠へ逃がす。
- 各sceneに `motion_mode` を必ず書く。値は `normal` / `punch` / `compare` / `warning` / `checklist` / `reveal` / `recap`。
- 60秒以上 `normal` を続けない。中盤再フックとラスト行動は `normal` 禁止。
- s01、中盤再フック、ラスト行動には `dialogue[].emphasis` を最低1つ入れる。
- `dialogue[].emphasis.words` は強調語の配列、`style` は `punch` / `danger` / `surprise` / `number` / `action`、`se` は `pop` / `warning` / `question` / `reveal` / `success` / `fail` / `none`、`pause_after_ms` は `0` / `200` / `300` / `500`。
- `dialogue[].expression` は `normal` / `surprise` / `shock` / `wry` / `confused` / `confident` / `laugh` / `smug` / `smile` / `calm` / `talk` / `neutral` のいずれか。L3以上リアクションや強い断言では `surprise` / `shock` / `confident` / `smug` を優先する。
- 同じキャラの `expression` を3発話以上連続させない。表情指定が不要な通常セリフは `normal` または省略でよい。
- 数字（単位を含む）とテーマの中核キーワードは、1セリフ最大1個まで `**` で囲んでよい。例: `Wi-Fiが**1.2Mbps**しか出てない`。Remotion側は `**` を表示せず、強調表示として扱う。
- `**` 強調を使った場合も、s01、中盤再フック、ラスト行動では `dialogue[].emphasis` を省略しない。`**` は字幕内の語の強調、`dialogue[].emphasis` はSE・間・演出発火の契約として使い分ける。
- 各 `visual_asset_plan` に `image_role` と `composition_type` を必ず書く。

## YAML化禁止

- `script_final.md` のCodexレビューが終わっていない。
- 5分で推定自然音声尺が許容範囲外。
- 3分で60セリフ未満。
- 最終行動が抽象的。
- 章タイトルが説明目次。
- YAML化で表示都合の機械分割が必要になる前提になっている。

## 出力スキーマ

```yaml
meta:
  id:
  title:
  layout_template: Scene02
  pair: RM
  fps: 30
  width: 1920
  height: 1080
  audience:
  tone:
  voice_engine:
  target_duration_sec:
  # audio_playback_rateは禁止。音声速度ではなく台本量で尺を調整する。
  image_style:
characters:
  left:
    character:
    voicevox_speaker_id: # ZMのみ。zundamon=3
    aquestalk_preset: # RMのみ
    speaking_style:
  right:
    character:
    voicevox_speaker_id: # ZMのみ。metan=2
    aquestalk_preset: # RMのみ
    speaking_style:
bgm:
  file: bgm/<選定したBGM>.mp3
  source_url: <配布元URL>
  source_site: <DOVA-SYNDROME 等>
  license: <ライセンス文字列>
  credit_required: true | false
  credit_text: <YouTube 概要欄に書く文字列>
  volume: 0.16
  fade_in_sec: 1.5
  fade_out_sec: 2.0
scenes:
  - id: s01
    role: intro
    scene_goal:
    viewer_question:
    visual_role:
    scene_format:
    motion_mode: warning
    main:
      kind: image
      asset: assets/s01_main.png
    sub:
      kind: bullets
      items:
        - 補足1
        - 補足2
        - 補足3
        - 補足4
        - 補足5
        - 補足6
    visual_asset_plan:
      - slot: main
        purpose:
        adoption_reason:
        image_role: 不安喚起
        composition_type: 事故寸前構図
        imagegen_prompt: |-
          s01: <対象シーンタイトル>

          霊夢「...」
          魔理沙「...」
          （script_final.md の対象シーン全文をそのまま貼り付ける）

          ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、抽象的な画面風ビジュアル、概念図、状況説明ビジュアルを中心に構成してください。 画像内の可読テキストは日本語だけにしてください。英語ラベル、英語見出し、英語UI、英単語の装飾文字は禁止です。 文字が崩れる可能性がある場合は、文字を使わずアイコン、色分け、形、配置で表現してください。 下部に白帯、入力欄、チャット欄、テキストボックス風の余白を作らないでください。 字幕やキャラクターに重なる位置へ重要情報を置かず、背景や小物は画面端まで自然に続けてください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 動画の解説画面に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。

          画像の雰囲気は <台本全体から判断した作風キーワードを2〜4語> で生成してください。
    dialogue:
      - id: l01
        speaker: left
        text: "Wi-Fiが**1.2Mbps**しか出てない"
        expression: shock
        emphasis:
          words:
            - 強調語
          style: danger
          se: warning
          pause_after_ms: 300
  - id: s10
    role: cta
    motion_mode: recap
    scene_goal: 今日やる具体行動へ落とす
    main:
      kind: image
      asset: assets/s10_main.png
    sub: null
    visual_asset_plan:
      - slot: main
        purpose: script_final直投げ型の挿入画像
        adoption_reason: 最終行動を視覚化するため
        imagegen_prompt_ref: s10.main
    dialogue:
      - id: l01
        speaker: left
        text: 今日なにからやればいいのだ？
```

### sub にテキストを置くパターン例（Scene02 / 03 / 10 / 13 / 14 等の sub 枠ありテンプレ）

```yaml
  - id: s02
    main:
      kind: image
      asset: assets/s02_main.png
    sub:
      kind: text
      text: |-
        ここに sub 枠の補足テキスト
```

### sub に箇条書きを置くパターン例

```yaml
  - id: s03
    main:
      kind: image
      asset: assets/s03_main.png
    sub:
      kind: bullets
      items:
        - 1つ目のチェック項目
        - 2つ目のチェック項目
        - 3つ目のチェック項目
        - 4つ目のチェック項目
        - 5つ目のチェック項目
        - 6つ目のチェック項目
```
