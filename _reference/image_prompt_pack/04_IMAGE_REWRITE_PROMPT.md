# 04_IMAGE_REWRITE_PROMPT

ゆっくり解説 / ずんだもん解説動画における **画像プロンプト 差し戻しリライト** 正本。

このファイルは LLM 向けプロンプト仕様書である。
入力（`03_IMAGE_PROMPT_AUDIT.md` の `failures[]` + 元の `image_direction` + 元の `imagegen_prompt` + `script.md`）を受け取り、
FAIL になったシーンの **image_direction と imagegen_prompt を構図から作り直す**。

合格基準: 04 で出力した新プロンプトを 03 に戻し、**再監査で 55 点 PASS** すること。
3 周しても改善しない場合は §5 に従って降格判断を行う。

---

## 0. 役割定義（System Role）

> あなたは、03 監査で FAIL となったシーンについて、
> `image_direction` と `imagegen_prompt` を **再生成** する。
>
> 同じプロンプトでただ言い換えるのは禁止。
> **visual_type または composition_type または補強会話のどれかを必ず変更する**。
>
> 出力は YAML ブロック 1 つに限定する。雑談・前置き・後書きは禁止する。
> FAIL になっていない PASS シーンは触らない。FAIL シーンのみ新プロンプトを出す。

NG な振る舞い:

- 元プロンプトを微修正（語尾だけ変える / 形容詞を 1 つ足す）して再提出する
- visual_type / composition_type / 補強会話のどれも変えずに「文章を磨いた」と称する
- 03 の `failures[].issues` を読まずに自己流で書き直す
- PASS シーンまで巻き込んで全シーン書き直す

---

## 1. 入力フォーマット

LLM へ渡す入力は次の構造を取る。

```yaml
inputs:
  episode_id: "ep001-rm-fridge-rotten-pattern"
  layout_template: "Scene04"
  character_pair: "RM"
  failures: |
    # 03_IMAGE_PROMPT_AUDIT.md の audit_result.failures[] をそのまま貼り付ける
    - scene_id: s02
      total: 48
      issues:
        - "image_should_support に台本セリフ引用がなく抽象化に留まっている"
        - "白背景中央にアイコン 1 つで状況描写がない"
        - "前シーン s01 と composition_type が同じ smartphone_closeup"
      rewrite_hint: "visual_type を hook_poster から myth_vs_fact に変更..."
  original_image_directions: |
    # 元の image_direction YAML（FAIL シーンのみで OK）
    - scene_id: s02
      visual_type: hook_poster
      composition_type: smartphone_closeup
      ...
  original_imagegen_prompts: |
    # 元の imagegen_prompt YAML（FAIL シーンのみで OK）
    - scene_id: s02
      slot: main
      prompt: |
        ...
      negative: "..."
  script_md: |
    # 台本 markdown（再参照用）
    ## Scene02
    霊夢「公式DMで当選って来たわよ！」
    魔理沙「待て、それ偽物だぜ」
    ...
```

**入力読み取りの優先順位**:

1. `failures[].issues` を全て読み、何が原因で FAIL したかを把握する
2. `failures[].rewrite_hint` を読み、変更方向の手掛かりにする（あくまでヒント、絶対指示ではない）
3. 元 `image_direction` / `imagegen_prompt` の何を残し、何を変えるかを 1 文で決める
4. `script_md` の該当 Scene を再読し、補強できる別のセリフ・別の瞬間を探す
5. 00_IMAGE_GEN_MASTER_RULES.md の visual_type / composition_type 一覧から、現状と異なる候補を 2〜3 個選ぶ

---

## 2. 修正方針（必須 6 項目、順序固定）

リライト時は次の 6 項目を **順序固定** で適用する。
飛ばし不可。各項目を満たしたかを §4 自己チェックで確認する。

1. **同じプロンプトで再生成しない**
   - 元プロンプトの文をそのままコピーして語尾だけ変えるのは禁止。
   - 段落構造・主題・前景 / 中景 / 背景の組み立てを再構成する。

2. **visual_type を変える（または再選択する）**
   - 元の visual_type と異なる候補を 00 §3 の 15 種から選ぶ。
   - 例: `hook_poster` → `myth_vs_fact`、`boke_visual` → `danger_simulation`。
   - 同シーンで visual_type を据え置く場合は、composition_type と補強会話の **両方** を変える必要がある。

3. **composition_type を変える**
   - 元の composition_type と異なる候補を 00 §4 の 15 種から選ぶ。
   - 前景 / 中景 / 背景の役割が前回と被らないようにする。
   - 例: `smartphone_closeup` → `split_danger_safe`、`product_shot` → `diagonal_flow`。

4. **会話内の補強ポイントを変える**
   - 元の `image_should_support` で引用していたセリフから別のセリフへ移す。
   - 例: 元が `l03 霊夢のボケ` を補強 → 新は `l05 魔理沙のツッコミ` を補強。
   - 引用先がない場合は、補強する瞬間（ボケ → 訂正、訂正 → 行動指示）の **役割を変える**。

5. **前景 / 中景 / 背景を具体化する**
   - 「シンプルなフラットアイコン」「中央にアイコン」のような汎用記述を排除する。
   - 各レイヤーに固有の小物・状況・色を割り当てる。
   - 00 §6 の禁止表現リストに該当する文言は使わない。

6. **必要なら「ボケ補強」から「誤解訂正」に役割変更する**
   - 03 失敗理由が「ゆっくり適合」「会話連動」中心なら、`dialogue_role` 自体を変える。
   - 例: `boke_visual` のボケ補強 → `myth_vs_fact` の誤解訂正、`danger_simulation` の危険喚起 → `before_after` の比較提示。
   - 役割変更時は、補強する dialogue 行も合わせて変える。

---

## 3. 出力フォーマット（必ず YAML、フィールド完全固定）

LLM の出力は次の YAML 構造のみ。**フィールド名・並び順は完全固定**。
03 で FAIL になったシーンのみ、新しい `image_direction` と `imagegen_prompt` を出力する。

```yaml
rewrites:
  - scene_id: s02
    change_log: "visual_type: hook_poster → myth_vs_fact, composition_type: smartphone_closeup → split_danger_safe, 補強会話: l03 霊夢のボケ → l05 魔理沙のツッコミ"
    image_direction:
      scene_id: s02
      dialogue_role: "誤解訂正"
      scene_emotion: "納得"
      visual_type: "myth_vs_fact"
      composition_type: "split_danger_safe"
      image_should_support: "魔理沙の『公式は個別 DM で当選通知しないぜ』を補強。霊夢の食いつきを左、魔理沙の訂正を右に配置"
      key_visual_sentence: "左に当選 DM ×、右に公式アプリ ◯ の 2 分割で誤解を訂正"
      main_subject: "左右 2 分割の誤解訂正パネル"
      secondary_subjects:
        - "左の偽 DM 通知（×マーク）"
        - "右の公式アプリ画面（◯マーク）"
      foreground: "左右の対比カード、× / ◯ アイコン"
      midground: "DM 風通知 vs 公式アプリ風画面"
      background: "左：薄赤、右：薄青緑のグラデ"
      color_palette: "薄赤、薄青緑、白、警告部のみ濃赤"
      text_strategy:
        image_text_allowed: true
        image_text_max_words: 3
        image_text_examples:
          - "偽"
          - "公式"
          - "STOP"
        remotion_overlay_text:
          - "公式は個別 DM で当選通知しない"
      layout_safety:
        keep_bottom_20_percent_empty: true
        avoid_character_area: true
        avoid_sub_area_overlap: true
      must_not_include:
        - "実在 SNS UI"
        - "ブランドロゴ"
        - "既存キャラクター"
        - "写真風人物"
        - "長文日本語"
      quality_bar: "誤解訂正パネルとして 1 秒で意図が伝わること"
    imagegen_prompt:
      scene_id: s02
      slot: main
      prompt: |
        フラットデザインのイラスト、16:9 アスペクト。
        画面を左右 2 分割。
        左サイド（薄赤背景）: 抽象化された SNS 風 DM 通知カードに大きな × マーク。短語「偽」を上部に配置。
        右サイド（薄青緑背景）: 公式アプリ風画面に ◯ マーク。短語「公式」を上部に配置。
        中央の境界に細い縦ラインで対比を強調。
        下部 20% は無地、Remotion の字幕帯と重ならない。
        左右 8% は overlay 用に空ける。
        色は薄赤・薄青緑・白・警告部のみ濃赤。
        画像内に長文日本語タイトルを焼き込まない。タイトルは Remotion 側で重ねる。
      negative: "実在ロゴ、X / Instagram / LINE の正確な UI、既存キャラ（霊夢 / 魔理沙 / ずんだもん / めたん）、写真風人物、白背景中央アイコン、長文日本語、4 語以上の文字、下部 20% への重要要素配置"
      imagegen_model: "gpt-image-1"
      aspect: "16:9"
  - scene_id: s04
    change_log: "visual_type: 据え置き danger_simulation, composition_type: product_shot → diagonal_flow, 補強会話: l02 霊夢の油断 → l04 魔理沙の 4 段階解説（main / sub 役割分担を明確化）"
    image_direction:
      # ... 同様の構造 ...
    imagegen_prompt:
      # ... 同様の構造 ...
```

### フィールド意味リファレンス

| フィールド | 役割 | 形式 |
|---|---|---|
| `rewrites[]` | リライト対象シーン配列 | 配列、03 の failures と同数 |
| `rewrites[].scene_id` | リライト対象 scene_id | string |
| `rewrites[].change_log` | 変更点の明示 | string、3 要素以上を `,` で連結 |
| `rewrites[].image_direction` | 新 image_direction | 01_IMAGE_DIRECTION_PROMPT.md §2 の全 16 フィールド |
| `rewrites[].imagegen_prompt` | 新 imagegen_prompt | 02_IMAGEGEN_PROMPT_PROMPT.md 準拠 |

`change_log` の必須記載要素:

- `visual_type: A → B`（据え置き時は `据え置き <type>` と明記）
- `composition_type: A → B`（据え置き時は `据え置き <type>` と明記）
- `補強会話: <元> → <新>`（dialogue 行 ID または役割を含める）

3 要素のうち **少なくとも 2 つは変更** されていなければならない。
3 要素全て据え置きは禁止。

---

## 4. 自己チェック（出力前）

LLM は YAML を出力する **直前** に、各 rewrite に対して次のチェックを内部で行う。
1 つでも FAIL があれば、その rewrite を書き直してから出力する。

- [ ] 元と visual_type または composition_type のどちらかが必ず違う
- [ ] `image_should_support` の引用セリフが元と違う、または具体性が増している
- [ ] 文字方針 / 禁止 / Remotion 余白の記述が新プロンプトにも入っている（`text_strategy` / `must_not_include` / 「下部 20% は無地」「Remotion 側で重ねる」が prompt 本文に存在）
- [ ] `change_log` に visual_type / composition_type / 補強会話 の 3 要素が記述され、少なくとも 2 つが変更されている
- [ ] 03 `failures[].issues` の各項目に対して、リライト後にどう解消されているかが追跡できる
- [ ] 00_IMAGE_GEN_MASTER_RULES.md §6 / §9 の禁止表現・禁止事項が新プロンプトに入っていない
- [ ] PASS していたシーンには触っていない（rewrites 配列に PASS シーンを含めていない）

各セルフチェックは「OK」と返すのではなく、
**該当フィールドの値を一行で要約してから OK にする**（ラベル合わせ防止）。

---

## 5. 再監査ループと降格判断

04 完了後、新 prompt を再度 03 に戻して **55 点 PASS まで繰り返す**。

ループ上限: **3 周**。

3 周回って改善しないシーンは、次のいずれかに降格する。

### 5.1 visual_type 降格

`hook_poster` などリスクの低い型に降格する。
降格候補（リスクが低い順）:

1. `checklist_panel`（縦リスト 3 項目、構図がほぼ固定で破綻しにくい）
2. `three_step_board`（3 段固定、テキスト最小）
3. `hook_poster`（冒頭固定、構図ヒント明確）

降格時は `change_log` に `降格: <元> → <降格先> (3 周改善せず)` と明記する。

### 5.2 scene 自体の降格

該当 scene を `script.yaml` 上で `main.kind: text` または `main.kind: bullets` に降格する。
これは 04 で直接行わない。代わりに次の YAML を出力してユーザー / 上位フローに判断を委ねる。

```yaml
escalation:
  - scene_id: s02
    reason: "3 周リライトしても 03 監査が 55 点に届かず、visual_type 降格候補 3 種でも構図が成立しない"
    proposal: "main.kind: image → main.kind: text （bullets 3 項目）に降格"
    proposed_text: "公式 DM で当選通知は来ない / 来たら偽物 / 公式アプリで確認"
```

`escalation[]` が出た時点で 04 の責務は完了。後段（運用者）が `script.yaml` を直接編集する。

---

## 6. 後段との接続

- **rewrites[] 出力後**: 03_IMAGE_PROMPT_AUDIT.md に新プロンプトを渡して再監査
- **3 周 PASS 達成**: `yukkuri-codex-imagegen` skill 起動 → 画像生成 → 05_IMAGE_RESULT_AUDIT.md
- **escalation[] 出力時**: 運用者が `script.yaml` の該当 scene を text / bullets 化、または別 visual_type に手動置換

---

最終更新: 2026-04-26
