# 10_yaml_prompt

## 目的

Codexレビュー済みの `script_final.md` を、既存レンダーシステムで使える `script.yaml` に変換する。

## 変換ルール

- `meta.id` はepisode_idと一致。
- `meta.layout_template` は `Scene01`〜`Scene21`。
- `meta.pair` は `RM` または `ZM`。
- `scenes[].scene_template` は絶対に書かない。
- `meta.scene_template` は新規で書かない。
- `main.asset` / `sub.asset` は `assets/s01_main.png` 形式。
- sub枠なしテンプレートでは `sub: null`。
- `dialogue[].text` は `script_final.md` の自然な発話単位を維持する。
- 表示都合の機械分割をしない。
- 字幕の折り返し、縮小、収まりはRemotion側に任せる。
- セリフ順、ボケ、ツッコミ、中盤再フック、最終行動を圧縮で消さない。
- `visual_asset_plan` は各sceneに残す。
- `visual_asset_plan[].imagegen_prompt` には `script_final.md` の対象シーン全文を使った直投げ型プロンプトを残す。
- `image_direction`、`visual_type`、`supports_dialogue`、`supports_moment`、`composition_type`、`hook_type`、`myth_vs_fact`、`boke_or_reaction` は v2 では使用しない。`imagegen_prompt` 本文にも混ぜない。
- `main.kind` は `image` のみ。`sub.kind` は `image` / `text` / `bullets` / `null` のいずれか。
- `main.caption` / `main.text` / `main.items` は使わない。`sub` はテキスト・箇条書きを使ってよい。
- 画像出所と採用理由は `meta.json` にも記録する。
- `bgm:` ブロックは必須。`audit-video.mjs` が `bgm.file` の存在を要求する。

## YAML化禁止

- `script_final.md` のCodexレビューが終わっていない。
- 5分で90セリフ未満。
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
  width: 1280
  height: 720
  audience:
  tone:
  voice_engine:
  target_duration_sec:
  image_style:
characters:
  left:
    character:
    speaking_style:
  right:
    character:
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
    main:
      kind: image
      asset: assets/s01_main.png
    sub: null
    visual_asset_plan:
      - slot: main
        purpose:
        adoption_reason:
        imagegen_prompt: |-
          s01: <対象シーンタイトル>

          霊夢「...」
          魔理沙「...」
          （script_final.md の対象シーン全文をそのまま貼り付ける）

          ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、UI、概念図、状況説明ビジュアルを中心に構成してください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 YouTubeの解説動画に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。 Make the aspect ratio 16:9.

          画像の雰囲気は <台本全体から判断した作風キーワードを2〜4語> で生成してください。
    dialogue:
      - id: l01
        speaker: left
        text:
        expression:
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
```
