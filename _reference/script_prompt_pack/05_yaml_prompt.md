# 05_yaml_prompt

## 目的

監査 PASS 済み台本を、動画レンダー用の `script.yaml` に変換する。
必ず `00_MASTER_SCRIPT_RULES.md` と最終台本を読む。

## 入力

```text
最終台本：
episode_id：
使用テンプレート：SceneXX
キャラペア：RM / ZM
```

## 変換ルール

- `meta.layout_template` に `Scene01` から `Scene21` を1つだけ書く。
- `scenes[].scene_template` は絶対に書かない。
- `asset_path: script/{episode_id}/assets/...` は `asset: assets/...` に変換する。
- サブ枠がないテンプレートでは `sub: null` にする。
- サブ枠がある場合でも、サブの `bullets` は3項目以内にする。
- `dialogue[].text` は25文字以内にする。
- 最終台本が尺・密度チェック未PASSの場合は、YAML化せず差し戻す。
- 最終台本の最終行動が「見るだけ」「考えるだけ」で終わっている場合は、YAML化せず差し戻す。
- 最終行動に確認、選択、保存/逃がす/テンプレ化、予定化など2アクション以上があることを確認する。
- 章タイトルにテーマ外単語が混ざっている場合は、YAML化せず差し戻す。
- 不自然な日本語、助詞抜け、誤字っぽい語尾が残っている場合は、YAML化せず差し戻す。
- YAML化時に、最終行動、章タイトル、キャラ口調を勝手に弱めない。
- RMでは魔理沙の「だぜ」、ZMではずんだもんの「のだ」「なのだ」の比率をYAML化で崩さない。
- 5分前後なのに本編70セリフ未満、8シーン以下ならYAML化禁止。
- セリフを結合して25文字超過にしない。
- YAML化時に会話順序や掛け合いを勝手に圧縮しない。
- `dialogue` の順番を保持する。
- ボケ→ツッコミ、誤解→訂正、リアクションの流れを維持する。
- 章タイトルのフック性を失わせない。
- タイトル枠がないテンプレートでは、`title_text` に頼らず `main.text` を使う。
- BGM、SE、確定演出はこの YAML に無理に入れない。
- `visual_asset_plan` はレンダー用表示には使わないが、pre-render gate の監査メタとして `script.yaml` の各 scene に残す。
- `visual_asset_plan` には `image_direction`、`visual_type`、`supports_dialogue`、`supports_moment`、`imagegen_prompt` を残す。
- 生成済み画像の出所と採用理由は、`script.yaml` だけでなく `meta.json` にも同じ画像単位で記録する。
- 生成前監査結果と生成後監査結果は `audits/` に記録する。

## YAML化前の差し戻し条件

以下のどれかがある場合、`script.yaml` を出力せず、差し戻し理由と修正指示だけを返す。

- 監査PASSではない。
- 5分前後で10シーン未満、または90セリフ未満。
- 最終行動が「見るだけ」「考えるだけ」「後でやる」だけ。
- 最終行動に2アクション以上がない。
- 章タイトルにテーマ外の単語が混ざっている。
- 不自然な日本語、助詞抜け、誤字っぽい語尾が残っている。
- `visual_asset_plan` の素材が `main.asset` / `sub.asset` に反映できない。
- `image_direction`、`visual_type`、`supports_dialogue`、`supports_moment` が未作成。
- 生成前画像プロンプト監査が未PASS。
- 生成後画像監査が未PASS。
- YAML化でセリフ数、シーン数、中盤再フック、ボケ→ツッコミが減る可能性がある。

差し戻し例:

```md
YAML化は保留します。
理由:
- s09の章タイトルがテーマから浮いています。
- s10の最終行動が「見るだけ」で弱いです。
- s03に不自然な語尾があります。

修正後に再度YAML化してください。
```

## 出力形式

```yaml
meta:
  episode_id: ""
  layout_template: "Scene01"
  character_pair: "RM"
scenes:
  - id: s01
    title_text: ""
    main:
      kind: image
      asset: assets/s01_main.png
      caption: ""
    sub: null
    visual_asset_plan:
      - slot: main
        purpose: ""
        supports_dialogue:
          - s01_l01
        supports_moment: ""
        visual_type: hook_poster
        composition_type: ""
        image_direction:
          dialogue_role: ""
          scene_emotion: ""
          image_should_support: ""
          key_visual_sentence: ""
          main_subject: ""
          foreground: ""
          midground: ""
          background: ""
          color_palette: ""
          text_strategy:
            image_text_allowed: true
            image_text_max_words: 3
            remotion_overlay_text: []
          layout_safety:
            keep_bottom_20_percent_empty: true
            avoid_character_area: true
            avoid_sub_area_overlap: true
          must_not_include: []
          quality_bar: ""
        imagegen_prompt: ""
    dialogue:
      - id: l01
        speaker: left
        text: ""
```

## 変換後チェック

出力後に次を確認する。

- `meta.layout_template` がある。
- `scenes[].scene_template` がない。
- `asset` が `assets/...` 形式。
- すべての `dialogue[].text` が25文字以内。
- セリフの順番が最終台本と一致している。
- セリフ結合で掛け合いが消えていない。
- 章タイトルが説明目次へ劣化していない。
- 最終台本のシーン数、セリフ数が監査PASS時から減っていない。
- YAML化によって深掘り往復や中盤再フックが消えていない。
- 最終行動が弱体化していない。
- 章タイトルがテーマから浮いていない。
- 不自然な日本語が残っていない。
- キャラ語尾比率がYAML化で崩れていない。
- サブ枠なしテンプレートで `sub: null`。
- 各 scene に監査用 `visual_asset_plan` が残っている。
- `visual_asset_plan` に `image_direction`、`visual_type`、`supports_dialogue`、`supports_moment` がある。
- YAMLとして壊れていない。
