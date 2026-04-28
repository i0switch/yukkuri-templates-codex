# 10_yaml_prompt

## 目的

Codexレビュー済みの `script_final.md` を、既存レンダーシステムで使える `script.yaml` に変換する。

成果物名、停止条件、Render schema、画像出所、FullHD既定、voice engine整合、sub枠、motion/emphasis、review hashは `docs/pipeline_contract.md` を正本にする。このファイルはYAML化作業の手順だけを持つ。

## 必須入力

- `script_final.md`
- `audits/script_final_review.md`
- `planning.md`
- `visual_plan.md` または同等のscene設計
- `image_prompt_v2.md` または `image_prompts.json`
- 選択テンプレートの `templates/scene-XX_*.md`
- `docs/pipeline_contract.md`

`script_final_review.md` のhashが現在の `script_final.md` と一致しない場合はYAML化しない。

## 変換方針

- `script_final.md` のセリフ順、ボケ、ツッコミ、中盤再フック、最終行動を圧縮で消さない。
- `dialogue[].text` は自然な発話単位を維持し、表示都合で機械分割しない。
- 設計メモ、監査ラベル、未充填プレースホルダをセリフ本文へ混ぜない。
- `main` は画像参照にし、sub枠ありテンプレートでは会話とは別役割の補助情報を `sub` に置く。
- `visual_asset_plan` は各sceneに残し、画像プロンプトは `script_final.md` の対象シーン全文を主入力にする。
- 長文プロンプトは `image_prompts.json` に分離してよい。`script.yaml` 側には `imagegen_prompt_ref` を置ける。
- 5分動画は標準20枚を目安にし、画像枚数のためだけにsceneを増やさない。1シーン内で複数画像が必要な場合は `main_timeline` を使い、原則5発話ごとに `main_01` / `main_02` のようなslotを作る。
- 画像内見出しには対象シーンタイトルだけを使い、scene idや会話全文を画像内文字として並べない。
- BGM、voice engine、speaker id、asset path、provenanceに関する必須項目は `docs/pipeline_contract.md` に従う。
- sceneごとに `motion_mode` と必要な `dialogue[].emphasis` を付け、会話の山場をレンダーへ渡す。

## YAML化禁止

- `script_final.md` のCodexレビューが終わっていない。
- review hashがstale。
- 想定尺に対して自然音声尺が下限未満で、台本補完が未実施。
- 自然音声尺が allowed_max を超えているだけなのに、尺オーバー対策として `script_final.md` を削除、短文化、圧縮しようとしている。
- 最終行動が抽象的。
- 章タイトルが説明目次。
- YAML化で台本の自然さや掛け合いが消える。

## 最小スケルトン

詳細な必須項目と禁止項目は `docs/pipeline_contract.md` を確認して埋める。

```yaml
meta:
  id:
  title:
  layout_template:
  pair:
  fps: 30
  width: 1920
  height: 1080
  voice_engine:
  target_duration_sec:
characters:
  left:
    character:
    speaking_style:
  right:
    character:
    speaking_style:
bgm:
  file:
  source_url:
  source_site:
  license:
  volume:
scenes:
  - id: s01
    role: intro
    scene_goal:
    conversation_entry:
    concrete_scene:
    motion_mode:
    main:
      kind: image
      asset: assets/s01_main.png
    main_timeline:
      - slot: main_01
        slot_group: main
        asset: assets/s01_main_01.png
        start_line_id: l01
        end_line_id: l05
    sub: null
    visual_asset_plan:
      - slot: main_01
        slot_group: main
        purpose:
        adoption_reason:
        image_role:
        composition_type:
        imagegen_prompt_ref:
    dialogue:
      - id: l01
        speaker: left
        text:
        expression:
        emphasis:
          words: []
          style:
          se:
          pause_after_ms:
```

## 自己確認

- `meta.layout_template` は動画全体で1つだけ。
- `meta.pair` と `voice_engine` とcharactersが一致している。
- `dialogue[].text` に設計メタキーが混入していない。
- `script_final.md` の発話を表示都合で細切れにしていない。
- sub枠ありテンプレートのsubが空ではない。
- final sceneが具体行動で終わる。
- 画像プロンプト参照が `image_prompt_v2.md` または `image_prompts.json` と対応している。
