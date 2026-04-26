# 05_IMAGE_RESULT_AUDIT

ゆっくり解説 / ずんだもん解説動画における **画像生成 後監査（45 点ゲート）** 正本。

このファイルは LLM（vision 対応）または人間レビュア向けの監査仕様書である。
入力（`script.yaml` の各 scene + 生成済み PNG ファイル `script/{episode_id}/assets/sNN_{slot}.png`）を受け取り、
imagegen で生成された画像が **台本意図と直結しているか** を 6 軸で採点する。

合格基準: 6 軸 × 各 10 点 = **60 点満点**、**45 点未満は再生成 or 構図変更**。
1 シーンでも FAIL があれば overall FAIL とし、該当 slot を再生成キューに戻す。

---

## 0. 役割定義（System Role）

> あなたは、生成済み PNG を見て、
> **台本一致 / 会話補強 / 視認性 / 画面映え / 汎用感の低さ / Scene 適合**
> の 6 軸で各 10 点、合計 60 点満点で採点する。
>
> 45 点未満は再生成 or 構図変更。
> 1 シーンでも FAIL なら overall FAIL を返し、該当 slot を再生成 / 構図変更へ差し戻す。
>
> 出力は YAML ブロック 1 つに限定する。雑談・前置き・後書きは禁止する。
> 採点は **甘く出さない**。「なんとなく良さそう」は減点理由になる（汎用感の低さ軸）。

NG な振る舞い:

- 全シーン PASS を機械的に出す
- 画像を見ずに `image_direction` だけで採点する
- ストック素材的でも「無難だから PASS」を出す
- Remotion 重ね領域との衝突を見逃す

---

## 1. 入力フォーマット

LLM / 人間レビュアへ渡す入力は次の構造を取る。

```yaml
inputs:
  episode_id: "ep001-rm-fridge-rotten-pattern"
  layout_template: "Scene04"
  character_pair: "RM"
  scenes:
    - scene_id: s01
      slot: main
      asset_path: "script/ep001-rm-fridge-rotten-pattern/assets/s01_main.png"
      image_should_support: "霊夢の当選 DM への食いつきと、魔理沙の『止まれ』を補強"
      visual_type: "hook_poster"
      composition_type: "smartphone_closeup"
      script_excerpt: |
        霊夢「公式 DM で当選って来たわよ！」
        魔理沙「待て、それ偽物だぜ」
    - scene_id: s01
      slot: sub
      asset_path: "script/ep001-rm-fridge-rotten-pattern/assets/s01_sub.png"
      ...
  template_constraints:
    subtitle_band: "下部 15%（やや狭い）"
    character_area: "左下 25% / 右下 25%（2 キャラ）"
    sub_frame: "右下 25%（あり）"
```

**入力読み取りの優先順位**:

1. 各 PNG を実際に見る（vision LLM の場合）
2. `image_should_support` と `script_excerpt` を突き合わせ、画像が補強している瞬間を特定する
3. `template_constraints` と画像内の重要要素位置を照合し、字幕帯 / キャラ位置 / sub 枠との衝突を確認する
4. visual_type / composition_type 通りの構図になっているかを確認する

---

## 2. 採点表フォーマット（必ず Markdown テーブル）

採点結果は **Markdown テーブル形式** で出力する。
slot 列を含めて 1 シーンに main / sub の 2 行を持つ場合がある。

```markdown
| scene_id | slot | 台本一致 | 会話補強 | 視認性 | 画面映え | 汎用感の低さ | Scene適合 | 合計 | 判定 | 再生成方針 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| s01 | main | 9 | 9 | 8 | 9 | 8 | 9 | 52 | PASS | - |
| s01 | sub | 8 | 8 | 8 | 7 | 7 | 8 | 46 | PASS | - |
| s02 | main | 6 | 6 | 7 | 7 | 5 | 7 | 38 | FAIL | visual_type 変更 |
```

判定列は `PASS` / `FAIL` のみ。中間値なし。
再生成方針列は FAIL 時のみ短語で記入（詳細は `rerender_required[]` に記述）。

---

## 3. 各軸の採点基準

### 3.1 台本一致（10 点）

`image_should_support` のセリフが画像から連想されるかを見る軸。

- **9-10 点**: `image_should_support` のセリフがそのまま画面で連想される。視聴者が画像を見ただけで「ああ、あの場面だ」と分かる。
- **5-7 点**: テーマは合うが、特定セリフとの結びつきが弱い。
- **0-4 点**: 全く別の話題に見える。台本を読まずに作ったように見える。

**FAIL 寄り**: 台本のボケやツッコミと関係ない、何の話か分からない。

### 3.2 会話補強（10 点）

ボケ・ツッコミ・誤解訂正・行動 のどれかを画面で表現しているかを見る軸。

- **9-10 点**: ボケ・ツッコミ・誤解訂正・行動 のどれかを画面で表現。視聴者が「画像が会話を補強している」と感じる。
- **5-7 点**: 状況描写はあるが、会話の山との同期が弱い。
- **0-4 点**: 何も補強していない。中立的なテーマ画像。

**FAIL 寄り**: 見ても感情が動かない、ボケやツッコミと無関係。

### 3.3 視認性（10 点）

1 秒以内に何の話か分かるかを見る軸。

- **9-10 点**: 1 秒以内に何の話か分かる。主役が明確で、副要素が補助に徹している。
- **5-7 点**: 数秒見れば分かるが、主役と副要素の優先度が不明瞭。
- **0-4 点**: ごちゃつき / 主役不明。要素が多すぎて目が泳ぐ。

**FAIL 寄り**: 画像内文字が崩れている、要素過多で主役不明。

### 3.4 画面映え（10 点）

YouTube サムネ / 広告内スライドのレベルに達しているかを見る軸。

- **9-10 点**: 高品質な YouTube サムネ・広告内スライドのレベル。色設計・余白・コントラストが整っている。
- **5-7 点**: 平均的な解説動画素材レベル。映えない。
- **0-4 点**: 低品質ストック素材風。色が濁る / 構図が単調。

**FAIL 寄り**: 低品質なストック素材風、色設計が崩れている。

### 3.5 汎用感の低さ（10 点）

このシーンでしか使えないかを見る軸（03 §3.2 固有性の生成後版）。

- **9-10 点**: このシーンでしか使えない。固有の小物・状況・行動が画面に固定されている。
- **5-7 点**: テーマには合うが、同テーマの別動画でも流用できそう。
- **0-4 点**: どの動画にも入れられそう。汎用アイコン素材に見える。

**FAIL 寄り**: 汎用アイコン素材に見える、他シーンと似すぎ。

### 3.6 Scene 適合（10 点）

字幕枠・キャラ位置と非競合、main / sub 役割が機能しているかを見る軸。

- **9-10 点**: 字幕枠・キャラ位置と非競合、main / sub 役割が機能している。下部 20% / 左右キャラ領域が空いている。
- **5-7 点**: 軽微な競合（重要要素の端が字幕帯にかかる程度）。
- **0-4 点**: キャラと被る / 字幕帯に重要要素 / sub 枠と main が干渉している。

**FAIL 寄り**: 字幕やキャラと被る、Remotion overlay 領域に重要要素が入り込んでいる。

---

## 4. FAIL 条件（合計 45 点未満 OR 以下のいずれか 1 つでも該当）

合計点が 45 点以上でも、次の 8 項目のいずれかに該当した時点で **そのシーンは即 FAIL**。

1. 汎用アイコン素材に見える
2. 台本のボケやツッコミと関係ない
3. 何の話か分からない
4. 低品質なストック素材風
5. 字幕やキャラと被る
6. 画像内文字が崩れている
7. 他シーンと似すぎ
8. 見ても感情が動かない

加えて、00_IMAGE_GEN_MASTER_RULES.md §9 の必須禁止事項（実在ロゴ / 実在 SNS UI 模写 / 既存キャラ生成 / 写真写実 / 同一プロンプト使い回し）に 1 つでも該当した場合も即 FAIL。

---

## 5. FAIL 時の再生成方針（必須 6 項目）

FAIL になった slot に対して、次の 6 項目から **少なくとも 2 つ** を変更してから再生成する。
全項目据え置きで再生成を回すのは禁止（同じプロンプトで再生成しないルール）。

1. **同じプロンプトで再生成しない**
   - GPT-Image-2 はランダム性があるが、同一プロンプトでガチャを回す運用は禁止。

2. **visual_type を変える**
   - 00 §3 の 15 種から異なる候補へ切り替える。

3. **composition_type を変える**
   - 00 §4 の 15 種から異なる候補へ切り替える。

4. **会話内の補強ポイントを変える**
   - `image_should_support` の引用セリフ・引用瞬間を別の dialogue 行へずらす。

5. **前景 / 中景 / 背景を具体化する**
   - 元 prompt の汎用記述（「シンプルなアイコン」「中央配置」など）を排除し、固有の小物・状況・色を割り当て直す。

6. **必要なら「ボケ補強」から「誤解訂正」に変更する**
   - `dialogue_role` 自体を変えて、画像の役割を再定義する。

これらは 04_IMAGE_REWRITE_PROMPT.md §2 と同じ枠組み。
04 を再呼出しして prompt を作り直し、03 で再監査してから 05 へ戻す。

---

## 6. 出力フォーマット（必ず YAML、フィールド完全固定）

LLM の出力は次の YAML 構造のみ。**フィールド名・並び順は完全固定**。

```yaml
result_audit:
  total: 8
  passed: 6
  failed: 2
  overall: FAIL
  table: |
    | scene_id | slot | 台本一致 | 会話補強 | 視認性 | 画面映え | 汎用感の低さ | Scene適合 | 合計 | 判定 | 再生成方針 |
    | --- | --- | ---:| ---:| ---:| ---:| ---:| ---:| ---:| --- | --- |
    | s01 | main | 9 | 9 | 8 | 9 | 8 | 9 | 52 | PASS | - |
    | s01 | sub  | 8 | 8 | 8 | 7 | 7 | 8 | 46 | PASS | - |
    | s02 | main | 6 | 6 | 7 | 7 | 5 | 7 | 38 | FAIL | visual_type 変更 |
    | s03 | main | 9 | 9 | 9 | 8 | 9 | 9 | 53 | PASS | - |
    | s04 | main | 8 | 7 | 7 | 6 | 4 | 7 | 39 | FAIL | composition_type 変更 |
    | s05 | main | 9 | 9 | 9 | 9 | 9 | 9 | 54 | PASS | - |
    | s06 | main | 8 | 8 | 8 | 8 | 7 | 8 | 47 | PASS | - |
    | s07 | main | 9 | 9 | 8 | 9 | 8 | 9 | 52 | PASS | - |
    | s08 | main | 9 | 9 | 9 | 9 | 9 | 9 | 54 | PASS | - |
  rerender_required:
    - scene_id: s02
      slot: main
      total: 38
      reasons:
        - "汎用アイコン素材に見える（汎用感の低さ 5）"
        - "魔理沙の『止まれ』が画面で表現されておらず会話補強が弱い"
        - "前シーン s01 と composition_type が同一で構図差がない"
      change_plan:
        visual_type_from: "hook_poster"
        visual_type_to: "myth_vs_fact"
        composition_type_from: "smartphone_closeup"
        composition_type_to: "split_danger_safe"
        補強会話_from: "l03 霊夢のボケ"
        補強会話_to: "l05 魔理沙のツッコミ"
    - scene_id: s04
      slot: main
      total: 39
      reasons:
        - "低品質なストック素材風（画面映え 6）"
        - "汎用感の低さ 4 で固有の状況描写がない"
        - "字幕帯下部 15% に重要要素（矢印終端）がかかっている"
      change_plan:
        visual_type_from: "danger_simulation"
        visual_type_to: "danger_simulation"
        composition_type_from: "product_shot"
        composition_type_to: "diagonal_flow"
        補強会話_from: "l02 霊夢の油断"
        補強会話_to: "l04 魔理沙の 4 段階解説"
overall_notes:
  - "FAIL 2 件のため 04_IMAGE_REWRITE_PROMPT.md → 03 → 再生成 → 05 のループに戻す"
  - "PASS 6 件は確定として meta.json に記録、script.yaml の main.asset / sub.asset へ反映可"
  - "s02 と s04 は構図差が課題。1 動画全体で composition_type の分散を再点検"
```

### フィールド意味リファレンス

| フィールド | 役割 | 形式 |
|---|---|---|
| `result_audit.total` | 監査対象 slot 数（main / sub 別カウント） | integer |
| `result_audit.passed` | PASS slot 数 | integer |
| `result_audit.failed` | FAIL slot 数 | integer |
| `result_audit.overall` | 全体判定 | `PASS` / `FAIL` |
| `result_audit.table` | Markdown テーブル文字列 | string（YAML block scalar） |
| `result_audit.rerender_required[]` | FAIL slot の再生成計画 | 配列 |
| `rerender_required[].scene_id` | 再生成対象 scene_id | string |
| `rerender_required[].slot` | `main` / `sub` | string |
| `rerender_required[].total` | 合計点 | integer |
| `rerender_required[].reasons` | 失敗理由 | 配列、2〜5 項目 |
| `rerender_required[].change_plan` | 変更計画 | object |
| `change_plan.visual_type_from/to` | visual_type 変更前後 | string |
| `change_plan.composition_type_from/to` | composition_type 変更前後 | string |
| `change_plan.補強会話_from/to` | 補強会話の変更前後 | string |
| `overall_notes` | 全体所感 | 配列、2〜5 項目 |

ルール:

- `change_plan` は visual_type / composition_type / 補強会話 の **3 ペア全て** を埋める。
- 据え置きの場合は `_from` と `_to` を同値にし、別軸を必ず変更する（`同じプロンプトで再生成しない` の遵守）。
- 3 軸全て据え置きは禁止。少なくとも 2 軸が変更されていること。
- **1 slot でも FAIL なら `overall: FAIL`**。

---

## 7. 必須自己チェック（出力前）

LLM / レビュアは YAML を出力する **直前** に、次のチェックを内部で行う。
1 つでも FAIL があれば、その箇所を書き直してから出力する。

- [ ] 全 slot に対して 6 軸 × 10 点の採点を行った
- [ ] 合計点が 60 点満点を超えていない
- [ ] 45 点未満の slot は全て `rerender_required[]` に列挙されている
- [ ] §4 の 8 項目 FAIL 条件 / 00 §9 の禁止事項に該当する slot は合計点に関わらず FAIL にした
- [ ] `rerender_required[].reasons` は具体的記述で、抽象的所感（「やや弱い」など）に逃げていない
- [ ] `rerender_required[].change_plan` の 3 軸のうち少なくとも 2 軸が変更されている
- [ ] 1 slot でも FAIL なら `overall: FAIL` にした
- [ ] `result_audit.table` は Markdown テーブルで、列順が指定通り（台本一致 / 会話補強 / 視認性 / 画面映え / 汎用感の低さ / Scene 適合 / 合計 / 判定 / 再生成方針）
- [ ] PASS slot の `meta.json` 記録項目（generator / imagegen_prompt / imagegen_model）が揃っているかを `overall_notes` で確認した

各セルフチェックは「OK」と返すのではなく、
**該当フィールドの値を一行で要約してから OK にする**（ラベル合わせ防止）。

---

## 8. 後段との接続

- **PASS 時**: 該当 slot を `script.yaml` の `main.asset` / `sub.asset` に反映、`meta.json` の `assets[]` に generator / imagegen_prompt / imagegen_model を記録 → Remotion レンダリングへ
- **FAIL 時**: `rerender_required[]` を `04_IMAGE_REWRITE_PROMPT.md` に渡し → 03 で再監査 → `yukkuri-codex-imagegen` 再生成 → 05 へ戻す
- **3 周 FAIL 継続**: 04 §5 に従い visual_type 降格、または scene を `text` / `bullets` 化

連続して FAIL シーンが多い場合（全シーンの 30% 以上が FAIL）、
台本構成・テンプレ選択 自体を見直すべきサインとして `overall_notes` に明記する。

---

最終更新: 2026-04-26
