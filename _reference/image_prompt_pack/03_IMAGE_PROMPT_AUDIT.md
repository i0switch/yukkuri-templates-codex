# 03_IMAGE_PROMPT_AUDIT

ゆっくり解説 / ずんだもん解説動画における **画像プロンプト 生成前監査（55 点ゲート）** 正本。

このファイルは LLM 向けプロンプト仕様書である。
入力（`image_direction` YAML + `imagegen_prompt` YAML + `script.md`）を受け取り、
画像生成エンジン（codex-imagegen / notebooklm）へ投入する **前** に
imagegen_prompt が GPT-Image-2 へ投げるに値する品質か LLM 自身に採点させる。

合格基準: 7 軸 × 各 10 点 = **70 点満点**、**55 点未満は FAIL**。
1 シーンでも FAIL があれば overall FAIL とし、`04_IMAGE_REWRITE_PROMPT.md` に差し戻す。

---

## 0. 役割定義（System Role）

> あなたは、ゆっくり解説 / ずんだもん解説動画の画像プロンプト品質を監査する。
> 各シーンの `image_direction` と `imagegen_prompt` を、
> **会話連動 / 固有性 / 状況性 / 構図差 / ゆっくり適合 / Scene適合 / 生成期待値**
> の 7 軸で各 10 点、合計 70 点満点で採点する。
>
> 55 点未満は FAIL。
> 1 シーンでも FAIL なら overall FAIL を返し、04 リライトへ差し戻す。
>
> 出力は YAML ブロック 1 つに限定する。雑談・前置き・後書きは禁止する。
> 採点は **甘く出さない**。00_IMAGE_GEN_MASTER_RULES.md の禁止事項に該当する記述があれば、
> 該当軸を即 4 点以下にする。

NG な振る舞い:

- 「全シーン PASS」を機械的に出す
- 軸ごとの根拠を書かずに点数だけ出す
- 00_IMAGE_GEN_MASTER_RULES.md の禁止事項を見逃す
- 「概ね問題ない」「だいたい OK」のような曖昧な総評で締める

---

## 1. 入力フォーマット

LLM へ渡す入力は次の構造を取る。

```yaml
inputs:
  episode_id: "ep001-rm-fridge-rotten-pattern"
  layout_template: "Scene04"
  character_pair: "RM"
  image_directions: |
    # 01_IMAGE_DIRECTION_PROMPT.md の出力 YAML をそのまま貼り付ける
    image_directions:
      - scene_id: s01
        dialogue_role: "冒頭フック"
        ...
  imagegen_prompts: |
    # 02_IMAGEGEN_PROMPT_PROMPT.md の出力 YAML をそのまま貼り付ける
    imagegen_prompts:
      - scene_id: s01
        slot: main
        prompt: |
          フラットデザインのイラスト...
        negative: "..."
        ...
  script_md: |
    # 台本 markdown 全文（参照用）
    ## Scene01
    霊夢「冷蔵庫から変な臭いがするのよ……」
    ...
```

**入力読み取りの優先順位**:

1. `image_directions` と `imagegen_prompts` を scene_id でペアリングする
2. `script_md` の該当 Scene を読み、会話の山（ボケ / ツッコミ / 誤解訂正 / 行動）を 1 文で要約する
3. 要約と prompt を突き合わせ、補強関係が成立しているか判定する
4. 00_IMAGE_GEN_MASTER_RULES.md の禁止事項照合を最後に行う

---

## 2. 採点表フォーマット（必ず Markdown テーブル）

採点結果は **Markdown テーブル形式** で出力する。
各列は右寄せ整数、合計列は太字で表記しない（YAML 中で扱うため）。

```markdown
| scene_id | 会話連動 | 固有性 | 状況性 | 構図差 | ゆっくり適合 | Scene適合 | 生成期待値 | 合計 | 判定 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| s01 | 9 | 8 | 9 | 9 | 8 | 9 | 8 | 60 | PASS |
| s02 | 7 | 6 | 7 | 7 | 7 | 7 | 7 | 48 | FAIL |
| s03 | 9 | 9 | 8 | 8 | 9 | 8 | 9 | 60 | PASS |
```

判定列は `PASS` または `FAIL` のいずれか。`仮 PASS` などの中間値は使わない。

---

## 3. 各軸の採点基準

### 3.1 会話連動（10 点）

このシーンの画像が、台本内の **どのセリフ・どの瞬間** を補強しているかを見る軸。

- **9-10 点**: `image_should_support` に台本セリフが具体引用されている。imagegen_prompt の構図が、その引用セリフの瞬間（ボケ / ツッコミ / 誤解訂正 / 行動指示）と直結している。
- **5-7 点**: シーンタイトルから連想された汎用画像。セリフ引用がない、または引用があっても抽象化されていて画像と結びつかない。
- **0-4 点**: caption しか参照していない。セリフを読まずに作っている。

**FAIL 条件**: 会話のどの瞬間を補強するか不明。`image_should_support` が空、または「シーン全体の雰囲気」程度の抽象記述になっている。

### 3.2 固有性（10 点）

このシーンでしか使えないかを見る軸。汎用素材の駆逐が主眼。

- **9-10 点**: このシーンでしか使えない構図。具体的な小物・状況・行動が画像に固定されている。
- **5-7 点**: テーマには合うが、同じ動画内の他シーンでも流用できそう。固有の状況描写が弱い。
- **0-4 点**: 他シーン・他案件でも使える汎用素材。caption をそのまま抽象アイコン化したような記述。

**FAIL 条件**: caption をそのまま抽象アイコン化している、またはどの動画にも入れられそうな汎用素材。

### 3.3 状況性（10 点）

1 枚で「何の話か」「どんな状況か」が分かるかを見る軸。

- **9-10 点**: 1 枚で「何の話か」「どんな状況か」が分かる。前景 / 中景 / 背景がそれぞれ意味を持ち、状況描写が成立している。
- **5-7 点**: 主題は伝わるが、状況の前後関係が読み取れない。
- **0-4 点**: 中央にアイコン 1 つだけ・状況描写なし。背景が無地のまま記号だけ置かれている。

**FAIL 条件**: 中央にアイコン 1 つだけ・状況描写なし。白背景中央アイコンになりそうな構図記述。

### 3.4 構図差（10 点）

前シーン・他シーンと構図が被っていないかを見る軸。

- **9-10 点**: 前シーンと前景 / 中景 / 背景がはっきり違う。1 動画全体で構図が分散している。
- **5-7 点**: visual_type は変わっているが構図ヒントが似ている。色味だけ変えて差別化したつもり。
- **0-4 点**: 他シーンと同じ構図 / 連続して同じ visual_type。

**FAIL 条件**: 他シーンと同じ構図、または直前のシーンと visual_type が同じで構図差別化がない。

### 3.5 ゆっくり適合（10 点）

ゆっくり / ずんだもん解説の画面として面白いかを見る軸。視聴維持の観点。

- **9-10 点**: ゆっくり / ずんだもん解説の画面として面白い、視聴者が画面の前で止まる。ボケ・ツッコミ・誇張・誤解訂正のどれかが画として成立している。
- **5-7 点**: 教科書的すぎ。情報は正確だが画として地味。
- **0-4 点**: 笑いやハッとが無い。ストック素材的。

**FAIL 条件**: 教科書的すぎ・笑いやハッとが無い。ゆっくり解説の画面として面白くない。

### 3.6 Scene 適合（10 点）

選択テンプレ（`meta.layout_template`）の main / sub 役割を理解しているかを見る軸。

- **9-10 点**: 選択テンプレの main / sub 役割を理解している。main と sub の役割が被っていない。`layout_safety` が正しく設定されている。
- **5-7 点**: テンプレは意識しているが main / sub の役割分担が曖昧。
- **0-4 点**: main と sub が同じ情報。サブ枠なしテンプレなのに sub 画像を作っている、またはサブ枠ありテンプレなのに main で全情報を抱え込んでいる。

**FAIL 条件**: main / sub の役割が被っている。

### 3.7 生成期待値（10 点）

imagegen_prompt が GPT-Image-2 に投げて期待通りの画像が出るかを見る軸。

- **9-10 点**: 必須キーワード（前景・中景・背景・下部 20%・Remotion・禁止）すべて含み、文字を Remotion に分離できている。`negative` が具体的に書かれている。
- **5-7 点**: 一部欠ける。前景 / 中景 / 背景のどれかが省略、または negative が薄い。
- **0-4 点**: 文字方針が未定。negative が空。下部 20% の余白指示がない。

**FAIL 条件**: 文字方針が未定、または negative が空、または「文字を Remotion に分離」していない（画像内に長文日本語タイトルを焼き込もうとしている）。

---

## 4. FAIL 条件（合計 55 点未満 OR 以下のいずれか 1 つでも該当）

合計点が 55 点以上でも、次の 8 項目のいずれかに該当した時点で **そのシーンは即 FAIL**。

1. 会話のどの瞬間を補強するか不明
2. caption をそのまま抽象アイコン化している
3. 白背景中央アイコンになりそう
4. 他シーンと同じ構図
5. ゆっくり解説の画面として面白くない
6. main / sub の役割が被っている
7. 文字を Remotion に分離していない
8. シーン固有の小物がない

加えて、00_IMAGE_GEN_MASTER_RULES.md §9 の必須禁止事項（実在ロゴ / 実在 SNS UI 模写 / 既存キャラ生成 / 写真写実 / 同一プロンプト使い回し / meta.json への記録漏れ）に 1 つでも該当した場合も即 FAIL。

---

## 5. 出力フォーマット（必ず YAML、フィールド完全固定）

LLM の出力は次の YAML 構造のみ。**フィールド名・並び順は完全固定**。

```yaml
audit_result:
  total_scenes: 8
  passed: 6
  failed: 2
  overall: FAIL
  table: |
    | scene_id | 会話連動 | 固有性 | 状況性 | 構図差 | ゆっくり適合 | Scene適合 | 生成期待値 | 合計 | 判定 |
    | --- | ---:| ---:| ---:| ---:| ---:| ---:| ---:| ---:| --- |
    | s01 | 9 | 8 | 9 | 9 | 8 | 9 | 8 | 60 | PASS |
    | s02 | 7 | 6 | 7 | 7 | 7 | 7 | 7 | 48 | FAIL |
    | s03 | 9 | 9 | 8 | 8 | 9 | 8 | 9 | 60 | PASS |
    | s04 | 8 | 7 | 8 | 7 | 8 | 8 | 8 | 54 | FAIL |
    | s05 | 9 | 9 | 9 | 8 | 8 | 9 | 8 | 60 | PASS |
    | s06 | 8 | 8 | 9 | 9 | 8 | 8 | 8 | 58 | PASS |
    | s07 | 9 | 8 | 8 | 8 | 9 | 8 | 9 | 59 | PASS |
    | s08 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 63 | PASS |
  failures:
    - scene_id: s02
      total: 48
      issues:
        - "image_should_support に台本セリフ引用がなく、シーンタイトルの抽象化に留まっている"
        - "白背景中央にアイコン 1 つで状況描写がない"
        - "前シーン s01 と composition_type が同じ smartphone_closeup で構図差がない"
      rewrite_hint: "visual_type を hook_poster から myth_vs_fact に変更し、左右 2 分割で誤解訂正の構図にする。image_should_support に魔理沙の『止まれ』セリフを引用する。"
    - scene_id: s04
      total: 54
      issues:
        - "main と sub が同じ情報（危険喚起）を繰り返している"
        - "シーン固有の小物がなく、汎用ストック素材風"
      rewrite_hint: "main を danger_simulation の 4 段階流れ図、sub を checklist_panel の 3 項目チェックに役割分担する。main からチェックリスト要素を取り除く。"
overall_notes:
  - "FAIL 2 件のため 04_IMAGE_REWRITE_PROMPT.md に差し戻す"
  - "PASS 6 件は imagegen 投入を保留し、04 完了後に再監査して全シーン PASS にしてから一括投入する"
  - "visual_type 分散は概ね適切だが、s01 と s02 が hook 系で連続している点に注意"
```

### フィールド意味リファレンス

| フィールド | 役割 | 形式 |
|---|---|---|
| `audit_result.total_scenes` | 監査対象シーン数 | integer |
| `audit_result.passed` | PASS シーン数 | integer |
| `audit_result.failed` | FAIL シーン数 | integer |
| `audit_result.overall` | 全体判定 | `PASS` / `FAIL` |
| `audit_result.table` | Markdown テーブル文字列 | string（YAML block scalar） |
| `audit_result.failures[]` | FAIL シーンの詳細 | 配列 |
| `failures[].scene_id` | 失敗シーン ID | string |
| `failures[].total` | 合計点 | integer |
| `failures[].issues` | 具体的な問題点 | 配列、2〜5 項目 |
| `failures[].rewrite_hint` | 04 リライト時のヒント | string、80〜200 字 |
| `overall_notes` | 全体所感 | 配列、2〜5 項目 |

ルール:

- **1 シーンでも FAIL があれば `overall: FAIL`**。
- `failures[].issues` は **3 項目以上推奨**。1 項目だけで済ませない。
- `failures[].rewrite_hint` は visual_type / composition_type / 補強会話の **どれを変えるか具体的に書く**。
- `overall_notes` には FAIL 件数の対応方針と、PASS シーンも含めた全体傾向を 2〜5 行で書く。

---

## 6. 必須自己チェック（出力前）

LLM は YAML を出力する **直前** に、次のチェックを内部で行う。
1 つでも FAIL があれば、その箇所を書き直してから出力する。

- [ ] 全シーンに対して 7 軸 × 10 点の採点を行った
- [ ] 合計点が 70 点満点を超えていない
- [ ] 55 点未満のシーンは全て `failures[]` に列挙されている
- [ ] §4 の 8 項目 FAIL 条件 / 00 §9 の禁止事項に該当するシーンは合計点に関わらず FAIL にした
- [ ] `failures[].issues` は具体的記述で、抽象的所感（「やや弱い」など）に逃げていない
- [ ] `failures[].rewrite_hint` には visual_type / composition_type / 補強会話のどれを変えるかが書かれている
- [ ] 1 シーンでも FAIL なら `overall: FAIL` にした
- [ ] `audit_result.table` は Markdown テーブルで、列順が指定通り（会話連動 / 固有性 / 状況性 / 構図差 / ゆっくり適合 / Scene 適合 / 生成期待値 / 合計 / 判定）

各セルフチェックは「OK」と返すのではなく、
**該当フィールドの値を一行で要約してから OK にする**（ラベル合わせ防止）。

---

## 7. 後段との接続

- **PASS 時**: `yukkuri-codex-imagegen` skill 起動 → 画像生成 → `05_IMAGE_RESULT_AUDIT.md` で生成後監査
- **FAIL 時**: `04_IMAGE_REWRITE_PROMPT.md` に `failures[]` を渡し、該当シーンのみ image_direction と imagegen_prompt を再生成 → 03 に戻して再監査

再監査ループは **3 周まで**。3 周して PASS にならないシーンは
04 §5 に従って visual_type を `hook_poster` などリスクの低い型に降格、
または該当 scene を `text` / `bullets` に降格する。

---

最終更新: 2026-04-26
