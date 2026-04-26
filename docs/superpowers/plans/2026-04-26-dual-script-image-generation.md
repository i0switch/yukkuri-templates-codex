# Dual Script and Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two new five-minute episode packages with original scripts and images: one Yukkuri episode and one Zundamon episode.

**Architecture:** Build each episode as a self-contained `script/{episode_id}/` package following the v2 creative flow. Generate natural conversation first, review only `script_final.md`, then derive YAML, visual plans, image prompts, assets, and audit notes without claiming video completion.

**Tech Stack:** Markdown content files, YAML episode schema, Node/Python validation scripts, Codex CLI image generation via `codex-imagegen`.

---

## File Structure

### New Yukkuri episode

Create directory: `script/ep920-rm-smartphone-photo-search/`

Files:

- `planning.md` — audience, emotional arc, information goals, scene roles.
- `script_draft.md` — natural Reimu/Marisa conversation, not display-shortened.
- `script_final.md` — reviewed final script source of truth.
- `script.yaml` — render input preserving `script_final.md` utterance units.
- `visual_plan.md` — scene-by-scene AI image vs Remotion responsibility split.
- `image_prompt_v2.md` — direct scene-text image generation prompts.
- `meta.json` — episode and asset registry.
- `audits/script_final_review.md` — review result for `script_final.md` only.
- `audits/yaml_conversion_v2.md` — YAML conversion check.
- `audits/image_generation_status.md` — image generation status and any NOT_AVAILABLE details.
- `assets/s01_main.png` through `assets/s10_main.png` — 16:9 generated image assets.

Episode metadata:

- `meta.id`: `ep920-rm-smartphone-photo-search`
- `meta.title`: `スマホ写真が多すぎて見つからない問題を片づける`
- `meta.layout_template`: `Scene02`
- `meta.pair`: `RM`
- `meta.width`: `1920`
- `meta.height`: `1080`
- `meta.target_duration_sec`: `300`

### New Zundamon episode

Create directory: `script/ep921-zm-notification-focus-reset/`

Files:

- `planning.md` — audience, emotional arc, information goals, scene roles.
- `script_draft.md` — natural Zundamon/Metan conversation, not display-shortened.
- `script_final.md` — reviewed final script source of truth.
- `script.yaml` — render input preserving `script_final.md` utterance units.
- `visual_plan.md` — scene-by-scene AI image vs Remotion responsibility split.
- `image_prompt_v2.md` — direct scene-text image generation prompts.
- `meta.json` — episode and asset registry.
- `audits/script_final_review.md` — review result for `script_final.md` only.
- `audits/yaml_conversion_v2.md` — YAML conversion check.
- `audits/image_generation_status.md` — image generation status and any NOT_AVAILABLE details.
- `assets/s01_main.png` through `assets/s10_main.png` — 16:9 generated image assets.

Episode metadata:

- `meta.id`: `ep921-zm-notification-focus-reset`
- `meta.title`: `通知で集中が削られる仕組みを止める`
- `meta.layout_template`: `Scene02`
- `meta.pair`: `ZM`
- `meta.width`: `1920`
- `meta.height`: `1080`
- `meta.target_duration_sec`: `300`

## Constraints

- Do not reuse existing script text.
- Do not create `script_audit.json` or `audit_script_draft.json`.
- Do not generate `script.yaml` before `script_final.md` is reviewed.
- Do not use `meta.scene_template` or `scenes[].scene_template`.
- Do not split dialogue mechanically for display.
- Do not claim video completion; render and video audit are outside this request.
- Do not commit unless the user explicitly asks.
- For image generation, use `codex-imagegen` with Codex CLI if available.
- Codex image generation must run from an ASCII path such as `C:/temp/codex-img-batch`.
- Use one Codex process per image; do not batch multiple images into one process.
- Default image generation parallelism is 4. Because this plan needs 20 images, run in waves and confirm cost before starting image generation.

## Task 1: Create Yukkuri episode structure and planning

**Files:**
- Create: `script/ep920-rm-smartphone-photo-search/planning.md`
- Create: `script/ep920-rm-smartphone-photo-search/audits/`
- Create: `script/ep920-rm-smartphone-photo-search/assets/`

- [ ] **Step 1: Create directories**

Run:

```bash
rtk mkdir -p script/ep920-rm-smartphone-photo-search/audits script/ep920-rm-smartphone-photo-search/assets
```

Expected: directories exist. If `rtk mkdir` passes through unsupported, it should still create the directories.

- [ ] **Step 2: Write `planning.md`**

Create `script/ep920-rm-smartphone-photo-search/planning.md` with:

```md
# planning.md

## 動画タイトル

スマホ写真が多すぎて見つからない問題を片づける

## 想定視聴者

スマホ写真、スクショ、メモ代わりの画像が増えすぎて、必要な写真を探すたびに時間を失っている人。

## 視聴者の悩み

- 必要な写真がすぐ見つからない
- スクショ、料理写真、書類写真、思い出写真が混ざる
- 消すのが怖くて全部残してしまう
- アルバム分けを始めても続かない
- 容量不足の通知が来るまで放置する

## 冒頭の興味 / 不安

霊夢が「保証書の写真」を探すだけで数分溶かし、魔理沙が写真整理は思い出整理ではなく検索性の回復だと切り返す。

## 最後に得る納得

写真を全部きれいに分類しなくても、探す写真だけ見つかる状態を作ればよい。削除、保護、検索ワード、月1回の小掃除で散らかりを戻せる。

## 感情曲線

1. 焦り: 必要な写真が見つからない
2. 共感: 写真が増える理由を認める
3. 納得: 問題は枚数ではなく混在
4. 安心: 全部整理しなくていいと分かる
5. 行動: 今日の10分でできる手順に落ちる

## 各シーンの情報ゴール

| scene | 情報ゴール | 感情ゴール | pattern |
|---|---|---|---|
| s01 | 必要な写真が見つからない痛みを提示 | 焦りと共感 | hook |
| s02 | 写真が散らかる原因を分解 | 自分だけではない安心 | cause_reveal |
| s03 | 残す/消す/探すを分ける | 整理のハードルを下げる | classification |
| s04 | スクショと一時写真を先に掃除 | すぐできそうにする | quick_win |
| s05 | 大事な写真は保護してから整理 | 消す怖さを下げる | safety_step |
| s06 | 中盤再フック: アルバム作りすぎ問題 | 失敗あるあるで引き戻す | midpoint_rehook |
| s07 | 検索ワードで探せる状態にする | 未来の自分が楽になる | search_design |
| s08 | 月1回の小掃除ルール | 継続できそうにする | habit_design |
| s09 | 容量不足対策とクラウド依存の注意 | 安心と現実感 | risk_balance |
| s10 | 今日10分の実行手順 | すぐ動ける | cta |

## 具体例候補

- 保証書、駐車場番号、Wi-Fiパスワード、レシート、資料写真
- スクショだけで数千枚ある状態
- 「あとで見る」写真が一生あとで来ない
- アルバムを細かく作りすぎて失敗する

## NG表現

- 写真を全部消せばいい
- クラウドに上げれば絶対安心
- 完璧なアルバム分類を推奨する
- 既存サービス名や実在UIに依存する

## YAML変換時の注意

- `dialogue[].text` は自然な発話単位を維持する
- `meta.layout_template` は `Scene02`
- `scenes[].scene_template` は使わない
- `asset` は `assets/sXX_main.png`
- `sub.kind` は `text`、補助ラベルは短くする
```

- [ ] **Step 3: Check planning file**

Run:

```bash
rtk ls script/ep920-rm-smartphone-photo-search
```

Expected: `planning.md`, `audits/`, and `assets/` are present.

## Task 2: Create Yukkuri draft and final script

**Files:**
- Create: `script/ep920-rm-smartphone-photo-search/script_draft.md`
- Create: `script/ep920-rm-smartphone-photo-search/script_final.md`
- Create: `script/ep920-rm-smartphone-photo-search/audits/script_final_review.md`

- [ ] **Step 1: Write `script_draft.md`**

Create `script/ep920-rm-smartphone-photo-search/script_draft.md` with natural Reimu/Marisa dialogue. Use these exact scenes and keep each scene at 8-10 utterances:

```md
# script_draft.md

## s01: その写真、どこに消えた？

- scene_goal: 必要な写真が見つからない痛みを提示
- emotion_goal: 焦りと共感
- pattern: hook

霊夢「ちょっと待って、保証書の写真を撮ったはずなのに全然出てこないんだけど。」
魔理沙「またスマホの写真フォルダで遭難してるのか。」
霊夢「遭難どころか雪山だよ。料理、猫、スクショ、謎の床、全部混ざってる。」
魔理沙「謎の床を撮った記憶はあるのか？」
霊夢「ない。でも私のアルバムには床が五十枚いる。なにこの地味なホラー。」
魔理沙「今日はその写真迷子を片づけるぞ。ポイントは、思い出を整理するんじゃなくて探せる状態に戻すことだ。」
霊夢「探せる状態。つまり全部きれいにアルバム分けしなくてもいい？」
魔理沙「むしろ最初から完璧分類を狙うと、三日で心が折れる。」
霊夢「よかった。私の分類力、初日で退職するタイプだから。」
魔理沙「じゃあ、写真が増える理由から分解していこう。」

## s02: 写真が増えるのは思い出だけじゃない

- scene_goal: 写真が散らかる原因を分解
- emotion_goal: 自分だけではない安心
- pattern: cause_reveal

霊夢「でも写真って、楽しい思い出が増えてるだけなら悪くないよね。」
魔理沙「思い出だけならな。実際はメモ代わりのスクショ、書類写真、一時的な確認画像も混ざる。」
霊夢「たしかに駐車場の番号とか、店の営業時間とか、あとで見る資料とか撮る。」
魔理沙「その“あとで”が来ないまま、写真フォルダの地層になる。」
霊夢「私のスマホ、考古学の現場だったのか。」
魔理沙「しかも思い出写真と一時写真が同じ場所にいるから、消す判断が怖くなる。」
霊夢「わかる。床の写真は消せるけど、隣に旅行写真があると急に慎重になる。」
魔理沙「だから最初の考え方は、残す写真と探すための写真と捨てる写真を分けることだ。」
霊夢「全部を一軍扱いしないってことか。」
魔理沙「そう。全員ベンチ入りしてるから、必要な選手が見つからないんだ。」

## s03: 残す・消す・探すを分ける

- scene_goal: 残す/消す/探すを分ける
- emotion_goal: 整理のハードルを下げる
- pattern: classification

霊夢「残す、消す、探すってどう分けるの？」
魔理沙「残すは思い出や再発行できないもの。消すは明らかな失敗写真や重複。探すは書類や番号みたいに、あとで使う情報だ。」
霊夢「探す写真って、思い出じゃないけど必要なやつか。」
魔理沙「そう。保証書、Wi-Fiの紙、駐車場番号、提出前の書類。これらは感情じゃなく検索性が命だ。」
霊夢「たしかに思い出補正で駐車場番号を眺めたりしない。」
魔理沙「だから“重要情報”みたいなアルバムを一つだけ作る。細かく分けすぎない。」
霊夢「一つだけでいいの？保証書、書類、番号、レシートって分けたくならない？」
魔理沙「最初から増やすと管理が仕事になる。まずは一つ。続いてから増やせばいい。」
霊夢「アルバム作りで満足して終わる未来が見えたから、一つにする。」
魔理沙「それが正解だな。分類は少ないほど続く。」

## s04: スクショと一時写真から片づける

- scene_goal: スクショと一時写真を先に掃除
- emotion_goal: すぐできそうにする
- pattern: quick_win

霊夢「でも最初にどこから触ればいい？思い出写真を消すのは怖い。」
魔理沙「思い出写真は後回し。まずスクショと一時写真だけ見る。」
霊夢「スクショなら心が痛みにくいかも。たぶん半分くらい期限切れの情報だし。」
魔理沙「セール画面、地図の一時保存、友達に送った確認画像。役目が終わったものが多い。」
霊夢「あるある。なぜか去年の宅配追跡番号が残ってる。」
魔理沙「それはもう荷物じゃなくて化石だな。消していい。」
霊夢「化石認定されると急に消しやすい。」
魔理沙「コツは、思い出に手を出す前に“役目が終わった写真”を減らすことだ。」
霊夢「容量も気持ちも軽くなりそう。」
魔理沙「最初の勝ちを作ると、整理は続きやすい。」

## s05: 大事な写真は先に保護する

- scene_goal: 大事な写真は保護してから整理
- emotion_goal: 消す怖さを下げる
- pattern: safety_step

霊夢「消す作業で一番怖いのは、大事な写真まで消しそうなところなんだよね。」
魔理沙「そこは順番で防げる。消す前に、大事な写真をお気に入りか専用アルバムへ避難させる。」
霊夢「先に避難。災害訓練みたいだ。」
魔理沙「実際、写真整理の避難訓練だな。家族、旅行、書類、二度と撮れないものを先に守る。」
霊夢「守ってからなら、スクショを消すときに手が震えにくい。」
魔理沙「それでも不安なら、今日は削除じゃなく“確認済み”アルバムへ移すだけでもいい。」
霊夢「消さない整理もありなの？」
魔理沙「ありだ。目的は勇気試しじゃない。探せる状態にすることだからな。」
霊夢「写真整理、急にやさしい競技になってきた。」
魔理沙「続くやり方が一番強いんだ。」

## s06: アルバムを作りすぎる罠

- scene_goal: 中盤再フックとしてアルバム作りすぎ問題を扱う
- emotion_goal: 失敗あるあるで引き戻す
- pattern: midpoint_rehook

霊夢「よし、じゃあアルバムを百個作って完璧に分ける。」
魔理沙「待て。今、失敗ルートに足を踏み入れたぞ。」
霊夢「え、細かいほど便利じゃないの？」
魔理沙「最初は便利に見える。でも“これはレシート？書類？買い物？”みたいに迷う分類が増える。」
霊夢「分類するために脳内会議が始まるやつだ。」
魔理沙「その会議が面倒で、結局なにも入れなくなる。」
霊夢「作ったアルバムだけが空っぽで並ぶ未来、見たことある。」
魔理沙「だから最初は“重要情報”“あとで見返す”“思い出”くらいでいい。」
霊夢「ざっくりすぎるくらいが続くのか。」
魔理沙「写真整理は博物館じゃない。日常で探せれば勝ちだ。」

## s07: 検索ワードで未来の自分を助ける

- scene_goal: 検索ワードで探せる状態にする
- emotion_goal: 未来の自分が楽になる
- pattern: search_design

霊夢「アルバム以外に、探しやすくする方法ってある？」
魔理沙「検索で引っかかるようにする。写真に写っているもの、日付、場所を意識するだけでも違う。」
霊夢「でも写真アプリの検索って、たまに賢いけど、たまに迷子になるよね。」
魔理沙「だから重要情報はスクショだけに頼らず、メモアプリにも一言残すのが強い。」
霊夢「保証書、冷蔵庫、2026年、みたいな？」
魔理沙「そう。写真そのものを整理するより、検索の入口を増やす。」
霊夢「未来の私が検索窓で泣かなくて済む。」
魔理沙「あと、書類写真は撮った直後に名前が分かる形でメモしておくといい。」
霊夢「撮った直後なら覚えてるけど、一週間後はただの白い紙だもんね。」
魔理沙「記憶が新しいうちに検索ワードを残す。それだけで探す時間はかなり減る。」

## s08: 月一回の小掃除で戻す

- scene_goal: 月1回の小掃除ルール
- emotion_goal: 継続できそうにする
- pattern: habit_design

霊夢「でも一回きれいにしても、また散らかるよね。」
魔理沙「散らかる前提でいい。だから月一回だけ小掃除する。」
霊夢「毎日じゃなくていいの？」
魔理沙「毎日は続かない人が多い。月一回、スクショと一時写真だけ見る日を作る。」
霊夢「思い出写真には触らない？」
魔理沙「触らない。月一掃除は、役目が終わった写真を下げるだけ。」
霊夢「それなら気楽かも。ゴミ出しの日みたいな感じだね。」
魔理沙「まさに写真のゴミ出し日だ。カレンダーに入れて、五分から十分で終わらせる。」
霊夢「五分ならやれる気がする。たぶん。」
魔理沙「たぶんでいい。ゼロより強い。」

## s09: クラウドと容量不足の落とし穴

- scene_goal: 容量不足対策とクラウド依存の注意
- emotion_goal: 安心と現実感
- pattern: risk_balance

霊夢「容量不足って出たら、クラウドに全部預ければ解決？」
魔理沙「助けにはなる。でも“預けたから整理しなくていい”になると、探せない問題は残る。」
霊夢「倉庫を借りただけで部屋が片づいた気になるやつか。」
魔理沙「そう。容量対策と検索性は別問題だ。」
霊夢「じゃあクラウドはバックアップで、整理はスマホ側でも考える？」
魔理沙「その考え方が安全だな。大事な写真は複数の場所に残す。一時写真は増やし続けない。」
霊夢「消す前にバックアップ確認、増やす前に一時写真削除。」
魔理沙「いい流れだ。容量不足の通知が来てから慌てるより、月一で戻す方が楽だ。」
霊夢「スマホに怒られる前に、自分で先回りするのね。」
魔理沙「それが一番ストレスが少ない。」

## s10: 今日10分でやること

- scene_goal: 視聴後すぐ行動
- emotion_goal: すぐ動ける
- pattern: cta

霊夢「最後に、今日やることを短くまとめて。保証書の写真探しでHPが減ってる。」
魔理沙「十分快速コースでいこう。一つ目、スクショ一覧を開いて、役目が終わったものを十枚だけ消す。」
霊夢「十枚だけならできる。床の写真もそこで成仏させる。」
魔理沙「二つ目、大事な写真を三枚だけお気に入りに入れる。家族、書類、保証書みたいなやつだ。」
霊夢「消す前に守る、だね。」
魔理沙「三つ目、“重要情報”アルバムを一つ作る。細かい分類はまだしない。」
霊夢「欲張らないのが大事か。」
魔理沙「そう。写真整理は一日で終わらせるイベントじゃなく、探す時間を減らす習慣だ。」
霊夢「今日のゴールは、完璧なアルバムじゃなくて、未来の私が迷子にならないこと。」
魔理沙「その通り。まずは写真フォルダの雪山から、保証書を救出しようぜ。」
```

- [ ] **Step 2: Copy draft to `script_final.md`**

Copy the same content from `script_draft.md` into `script_final.md`.

- [ ] **Step 3: Review `script_final.md`**

Write `script/ep920-rm-smartphone-photo-search/audits/script_final_review.md`:

```md
# script_final_review.md

## 対象

`script_final.md`

## 結果

PASS

## 確認項目

- 冒頭に「必要な写真が見つからない」具体的な困りごとがある。
- 霊夢が質問だけでなく、失敗談、ツッコミ、納得を持っている。
- 魔理沙が訂正だけでなく、例え、行動手順、軽いツッコミを持っている。
- 1シーン8〜10発話で、短文羅列になっていない。
- 既存台本の流用ではなく、スマホ写真整理テーマの新規会話になっている。
- `script.yaml` 化前の自然会話として成立している。

## 修正

なし。
```

- [ ] **Step 4: Confirm review gate before YAML**

Run:

```bash
rtk ls script/ep920-rm-smartphone-photo-search/audits
```

Expected: `script_final_review.md` exists before `script.yaml` is created.

## Task 3: Create Yukkuri YAML and support files

**Files:**
- Create: `script/ep920-rm-smartphone-photo-search/script.yaml`
- Create: `script/ep920-rm-smartphone-photo-search/audits/yaml_conversion_v2.md`
- Create: `script/ep920-rm-smartphone-photo-search/visual_plan.md`
- Create: `script/ep920-rm-smartphone-photo-search/image_prompt_v2.md`
- Create: `script/ep920-rm-smartphone-photo-search/meta.json`

- [ ] **Step 1: Create `script.yaml`**

Create YAML with:

- `meta.id: ep920-rm-smartphone-photo-search`
- `meta.title: スマホ写真が多すぎて見つからない問題を片づける`
- `meta.layout_template: Scene02`
- `meta.pair: RM`
- `meta.fps: 30`
- `meta.width: 1920`
- `meta.height: 1080`
- `meta.target_duration_sec: 300`
- `characters.left.character: reimu`
- `characters.right.character: marisa`
- 10 scenes, each `duration_sec: 30`
- Each scene `main.kind: image`, `main.asset: assets/sXX_main.png`
- Each scene `sub: null` unless a generated image asset is used for `sub`
- Each scene `dialogue` preserving the exact utterance text from `script_final.md`

Use these scene image slots:

| scene | main asset |
|---|---|
| s01 | `assets/s01_main.png` |
| s02 | `assets/s02_main.png` |
| s03 | `assets/s03_main.png` |
| s04 | `assets/s04_main.png` |
| s05 | `assets/s05_main.png` |
| s06 | `assets/s06_main.png` |
| s07 | `assets/s07_main.png` |
| s08 | `assets/s08_main.png` |
| s09 | `assets/s09_main.png` |
| s10 | `assets/s10_main.png` |

Do not include `meta.scene_template` or `scenes[].scene_template`.

- [ ] **Step 2: Create YAML conversion audit**

Create `audits/yaml_conversion_v2.md`:

```md
# yaml_conversion_v2.md

## Result

PASS

## Checks

- `script_final.md` was reviewed before YAML conversion.
- `dialogue[].text` preserves natural utterance units from `script_final.md`.
- Information order is unchanged.
- Character tone is unchanged.
- `meta.layout_template` is `Scene02`.
- `meta.scene_template` is not used.
- `scenes[].scene_template` is not used.
- Assets use `assets/sXX_main.png` paths.
```

- [ ] **Step 3: Create visual files**

Create `visual_plan.md` with one section per scene. Each section must include:

```md
## sXX: <scene title>

- scene_goal: <from planning>
- visual_goal: 16:9 main image that shows the situation and emotion, not dialogue text.
- AI画像で作るもの: <specific scene objects>
- Remotionで描画するもの: short sub label and any exact explanatory text.
- フリー素材で探すもの: none.
- 画面下部20%安全域: keep empty for characters and subtitles.
- 字幕・キャラとの衝突回避: keep key objects above center or upper-left/upper-right.
- 画像生成が不要な場合の理由: not applicable.
```

Create `image_prompt_v2.md` with 10 prompts, each directly including the scene dialogue from `script_final.md`. Each prompt should specify:

- 16:9 explainer insert image.
- English prompt body for image stability.
- Optional Japanese label in quotes, max 4 characters.
- No full dialogue text rendered inside the image.
- No real logos, real UI, copyrighted characters, photorealistic people, dense text, tables, arrows, grids, sprite sheets.
- Lower 20% safe area empty.

Do not create `remotion_card_plan.md`. Content slots are image-only; keep any exact explanatory wording in dialogue subtitles or visualized inside the generated image.

- [ ] **Step 4: Create `meta.json`**

Create `meta.json` with:

```json
{
  "id": "ep920-rm-smartphone-photo-search",
  "title": "スマホ写真が多すぎて見つからない問題を片づける",
  "pair": "RM",
  "layout_template": "Scene02",
  "target_duration_sec": 300,
  "width": 1920,
  "height": 1080,
  "assets": [
    {"path": "assets/s01_main.png", "kind": "image", "source_url": "pending-codex-generation-s01"},
    {"path": "assets/s02_main.png", "kind": "image", "source_url": "pending-codex-generation-s02"},
    {"path": "assets/s03_main.png", "kind": "image", "source_url": "pending-codex-generation-s03"},
    {"path": "assets/s04_main.png", "kind": "image", "source_url": "pending-codex-generation-s04"},
    {"path": "assets/s05_main.png", "kind": "image", "source_url": "pending-codex-generation-s05"},
    {"path": "assets/s06_main.png", "kind": "image", "source_url": "pending-codex-generation-s06"},
    {"path": "assets/s07_main.png", "kind": "image", "source_url": "pending-codex-generation-s07"},
    {"path": "assets/s08_main.png", "kind": "image", "source_url": "pending-codex-generation-s08"},
    {"path": "assets/s09_main.png", "kind": "image", "source_url": "pending-codex-generation-s09"},
    {"path": "assets/s10_main.png", "kind": "image", "source_url": "pending-codex-generation-s10"}
  ]
}
```

Replace `source_url` entries with `codex://generated_images/{session_id}/{filename}` after image generation.

- [ ] **Step 5: Validate Yukkuri package before image generation**

Run:

```bash
rtk python scripts/run_pipeline.py --episode script/ep920-rm-smartphone-photo-search --dry-run
rtk npm run gate:episode -- ep920-rm-smartphone-photo-search
```

Expected: validation either passes or reports only missing image assets. If schema errors appear, fix the YAML or metadata before image generation.

## Task 4: Create Zundamon episode structure and planning

**Files:**
- Create: `script/ep921-zm-notification-focus-reset/planning.md`
- Create: `script/ep921-zm-notification-focus-reset/audits/`
- Create: `script/ep921-zm-notification-focus-reset/assets/`

- [ ] **Step 1: Create directories**

Run:

```bash
rtk mkdir -p script/ep921-zm-notification-focus-reset/audits script/ep921-zm-notification-focus-reset/assets
```

Expected: directories exist.

- [ ] **Step 2: Write `planning.md`**

Create `script/ep921-zm-notification-focus-reset/planning.md` with:

```md
# planning.md

## 動画タイトル

通知で集中が削られる仕組みを止める

## 想定視聴者

通知、短い確認、ついでのアプリ起動で作業や休憩時間が細切れになっている人。

## 視聴者の悩み

- 作業中に通知を見ると戻るのが遅い
- 休憩のつもりでスマホを開き、時間が消える
- 通知を全部切るのは不安
- 集中したいのに手が勝手にスマホへ伸びる
- 対策を根性でやろうとして続かない

## 冒頭の興味 / 不安

ずんだもんが「一瞬通知を見ただけ」で作業時間を失い、めたんが通知は十秒ではなく再起動時間を奪うと指摘する。

## 最後に得る納得

通知対策は意志の強さではなく入口設計。人間、仕事生活、娯楽に分け、フォーカス時間、ホーム画面、休憩の終点を決めると集中が戻る。

## 感情曲線

1. 焦り: 一瞬の通知で時間が消える
2. 共感: 自分の意志だけが原因ではない
3. 納得: 通知は中断コストを持つ
4. 安心: 全部オフにしなくても分ければいい
5. 行動: 今日の設定変更へ落ちる

## 各シーンの情報ゴール

| scene | 情報ゴール | 感情ゴール | pattern |
|---|---|---|---|
| s01 | 通知が時間を消す痛みを提示 | 焦りと共感 | hook |
| s02 | 通知の本当のコストを説明 | 納得 | cost_reframe |
| s03 | 全部オフではなく分類する | 安心 | classification |
| s04 | 娯楽通知を入口として扱う | 危機感 | mechanism |
| s05 | フォーカス時間を作る | 実行感 | focus_setup |
| s06 | 中盤再フック: 手が勝手に開く問題 | あるあるで引き戻す | midpoint_rehook |
| s07 | ホーム画面から誘惑を遠ざける | 自分にもできそう | friction_design |
| s08 | 休憩に終点を作る | 安心 | break_design |
| s09 | 例外通知だけ残す | 不安を下げる | exception_rule |
| s10 | 今日10分の設定手順 | すぐ動ける | cta |

## 具体例候補

- 作業中の通知、配送通知、家族連絡、娯楽アプリ通知
- 休憩で開いた動画が終わらない
- ホーム画面のアイコンを見て無意識に開く
- フォーカスモードを時間帯で分ける

## NG表現

- スマホを捨てる
- 通知を全部切るしかない
- 意志が弱い人が悪い
- 実在アプリ名や実在UIに依存する

## YAML変換時の注意

- `dialogue[].text` は自然な発話単位を維持する
- `meta.layout_template` は `Scene02`
- `scenes[].scene_template` は使わない
- `asset` は `assets/sXX_main.png`
- `sub.kind` は `text`、補助ラベルは短くする
```

## Task 5: Create Zundamon draft and final script

**Files:**
- Create: `script/ep921-zm-notification-focus-reset/script_draft.md`
- Create: `script/ep921-zm-notification-focus-reset/script_final.md`
- Create: `script/ep921-zm-notification-focus-reset/audits/script_final_review.md`

- [ ] **Step 1: Write `script_draft.md`**

Create `script/ep921-zm-notification-focus-reset/script_draft.md` with:

```md
# script_draft.md

## s01: 一瞬の通知で時間が消える

- scene_goal: 通知が時間を消す痛みを提示
- emotion_goal: 焦りと共感
- pattern: hook

ずんだもん「やばいのだ。資料を一枚直すだけだったのに、気づいたら三十分消えてた。」
めたん「またスマホに時間を献上したのね。」
ずんだもん「献上したつもりはないよ。通知を一個見ただけなのだ。」
めたん「その“一個だけ”が入口なのよ。通知を見て、ついでに別アプリを開いて、戻る場所を忘れる。」
ずんだもん「戻る場所、たしかに忘れた。資料のどこを直してたっけ。」
めたん「今日はそこを分解するわ。通知は十秒の問題じゃなく、集中の再起動コストなの。」
ずんだもん「十秒じゃないのか。ぼく、通知に利子つきで時間を取られてたのだ。」
めたん「言い方は変だけど合ってる。根性論で終わらせず、入口を設計する。」
ずんだもん「助かるのだ。ぼくの根性、通知音より小さいから。」
めたん「じゃあ、通知が何を奪っているか見ていきましょう。」

## s02: 通知は再起動時間を奪う

- scene_goal: 通知の本当のコストを説明
- emotion_goal: 納得
- pattern: cost_reframe

ずんだもん「でも通知を見るのって、本当に十秒くらいだよ？」
めたん「画面を見る時間だけならね。でも問題は、そのあと作業に戻る時間。」
ずんだもん「作業に戻る時間？」
めたん「今どこを読んでいたか、次に何を書くか、どのファイルを開いていたか。頭の中の作業メモを戻す時間よ。」
ずんだもん「たしかに通知を見たあと、しばらく画面を眺めて固まるのだ。」
めたん「それが再起動時間。通知は情報じゃなく、中断として扱う必要がある。」
ずんだもん「中断って言われると、急に悪者っぽい。」
めたん「全部が悪者じゃないわ。家族や緊急連絡は必要。でも娯楽通知まで同じ扱いにすると、集中が穴だらけになる。」
ずんだもん「ぼくの集中、穴あきチーズだったのだ。」
めたん「まずは穴を増やす通知から分けましょう。」

## s03: 通知は三種類に分ける

- scene_goal: 全部オフではなく分類する
- emotion_goal: 安心
- pattern: classification

ずんだもん「じゃあ通知を全部切るのだ？」
めたん「いきなり全部は続かないし、大事な連絡まで怖くなる人が多いわ。」
ずんだもん「家族の連絡とか配送とか、逃すと困るのだ。」
めたん「だから三種類に分ける。人間、仕事や生活、娯楽。」
ずんだもん「人間は家族とか友達？」
めたん「そう。すぐ反応したい人だけ残す。仕事や生活は時間帯で調整。娯楽は原則オフ。」
ずんだもん「娯楽通知って、動画とかセールとか、誰かが投稿しました系？」
めたん「そう。見たい気持ちは否定しない。でも相手のタイミングで開かないようにする。」
ずんだもん「見るかどうかを自分で決めるってことか。」
めたん「その主導権を取り戻すのが通知整理よ。」

## s04: 娯楽通知は入口になる

- scene_goal: 娯楽通知を入口として扱う
- emotion_goal: 危機感
- pattern: mechanism

ずんだもん「でもセール通知くらいなら、得することもあるのだ。」
めたん「得する時もある。でも毎回開く入口になるなら、時間のほうが高くつくこともあるわ。」
ずんだもん「たしかにセールを見るだけのはずが、レビュー読んで、関連商品見て、なぜか動画まで見てる。」
めたん「通知の中身より、開いた後の寄り道が長いのよ。」
ずんだもん「通知は玄関で、家の中に誘惑が全部いるのだ。」
めたん「うまい例えね。だから玄関を軽くしない。」
ずんだもん「娯楽通知を切るのは、楽しみを捨てることじゃなくて、玄関を勝手に開けさせないこと？」
めたん「そう。見る時間は自分で作る。通知に呼ばれて行かない。」
ずんだもん「ちょっと主導権が戻ってきた気がするのだ。」
めたん「その感覚を設定に落とすわ。」

## s05: フォーカス時間を作る

- scene_goal: フォーカス時間を作る
- emotion_goal: 実行感
- pattern: focus_setup

ずんだもん「設定って、具体的には何からやるのだ？」
めたん「まず一日の中で、通知を減らす時間帯を一つ決める。朝の作業時間、勉強時間、寝る前などね。」
ずんだもん「一日中じゃなくていいの？」
めたん「最初から一日中は反動が来る。まず一時間でいい。」
ずんだもん「一時間ならできそう。たぶん。」
めたん「その時間だけ、許可する通知を人間と本当に必要な生活連絡に絞る。」
ずんだもん「娯楽アプリは黙っててもらうのだ。」
めたん「そう。通知を減らす時間を先に予約する。集中力が残っている時に設定しておくの。」
ずんだもん「集中が切れてから頑張るんじゃ遅いのか。」
めたん「遅いわ。元気な時に、未来の自分の防波堤を作るのよ。」

## s06: 手が勝手にアプリを開く問題

- scene_goal: 中盤再フックとして無意識に開く問題を扱う
- emotion_goal: あるあるで引き戻す
- pattern: midpoint_rehook

ずんだもん「通知を切っても、気づいたら自分でアプリを開いてるのだ。」
めたん「それはホーム画面が入口になってるのよ。」
ずんだもん「アイコンを見ると、開けって言われてる気がする。」
めたん「毎日見る場所に置いてあるなら、毎日誘われるわね。」
ずんだもん「ぼく、誘惑を一等地に住ませてたのだ。」
めたん「だから一軍画面から外す。フォルダの奥、二ページ目、検索しないと出ない場所へ移す。」
ずんだもん「削除じゃなくて、遠ざけるだけ？」
めたん「まずはそれでいい。無意識の操作に一秒の摩擦を入れる。」
ずんだもん「一秒で止まれるのだ？」
めたん「止まれる日が増える。ゼロにするより、戻れる回数を増やすの。」

## s07: ホーム画面に一秒の摩擦を作る

- scene_goal: ホーム画面から誘惑を遠ざける
- emotion_goal: 自分にもできそう
- pattern: friction_design

ずんだもん「一秒の摩擦って、そんなに大事なのだ？」
めたん「大事よ。無意識で開く行動は、少し面倒になるだけで意識に戻りやすい。」
ずんだもん「たしかに探してまで開くなら、今ほんとに見たいのか考えるかも。」
めたん「その考える一瞬が勝ち筋。アプリを消すより先に、場所を変える。」
ずんだもん「ホーム画面には何を置けばいいのだ？」
めたん「時計、メモ、カレンダー、学習や作業に戻るアプリ。開いた後に後悔しにくいもの。」
ずんだもん「ホーム画面を誘惑売り場から作業机に変える感じか。」
めたん「そう。スマホを使わないより、使い始める入口を整える。」
ずんだもん「入口設計、地味だけど効きそうなのだ。」
めたん「地味な設定ほど毎日効くのよ。」

## s08: 休憩には終点を作る

- scene_goal: 休憩に終点を作る
- emotion_goal: 安心
- pattern: break_design

ずんだもん「でも休憩中はスマホを見てもいいよね？」
めたん「見てもいい。ただ、終点を決めない休憩は帰ってこられないことが多いわ。」
ずんだもん「ぼくの休憩、片道切符だったのだ。」
めたん「だから先に終点を作る。五分タイマー、水を飲む、立つ、窓を見る。戻る合図を決める。」
ずんだもん「動画を見るなら？」
めたん「見る時間として予定に入れる。作業の穴埋めで開かない。」
ずんだもん「休憩だからって、無限にスクロールしていいわけじゃないのだ。」
めたん「むしろ休憩は頭を戻す時間。刺激を増やしすぎると、戻る時に重くなる。」
ずんだもん「休憩したのに疲れる理由、それかもしれない。」
めたん「終点がある休憩は、ちゃんと帰ってこられるわ。」

## s09: 例外通知だけ残す

- scene_goal: 例外通知だけ残す
- emotion_goal: 不安を下げる
- pattern: exception_rule

ずんだもん「通知を減らすと、大事な連絡を逃しそうで不安なのだ。」
めたん「だから例外を決める。家族、緊急、今日必要な連絡だけ通す。」
ずんだもん「例外を決めると、全部オフより安心かも。」
めたん「そう。通知整理は我慢大会じゃなく、優先順位の設定よ。」
ずんだもん「仕事の連絡はどうするのだ？」
めたん「時間帯を決める。常に鳴る状態が必要か、朝昼夕の確認で足りるかを分ける。」
ずんだもん「全部リアルタイムにしなくてもいいものがありそう。」
めたん「多いわ。リアルタイムっぽく見えるだけで、本当は待てる通知もある。」
ずんだもん「通知に全部VIP席を渡してたのだ。」
めたん「これからは本当に大事な通知だけVIPにしましょう。」

## s10: 今日10分で設定する

- scene_goal: 視聴後すぐ行動
- emotion_goal: すぐ動ける
- pattern: cta

ずんだもん「最後に、今日やることをまとめてほしいのだ。設定画面で迷子になる前に。」
めたん「十分快速コースね。一つ目、通知一覧を開いて、娯楽アプリの通知を三つだけオフ。」
ずんだもん「三つだけなら怖くないのだ。」
めたん「二つ目、集中したい一時間を決めて、フォーカス設定を入れる。」
ずんだもん「朝の作業時間とか、寝る前とかだね。」
めたん「三つ目、ホーム画面から誘惑アプリを奥へ移す。削除しなくていい。」
ずんだもん「消すんじゃなくて、一秒遠くする。」
めたん「そう。通知対策はスマホを敵にすることじゃない。勝手に時間を取られない入口を作ること。」
ずんだもん「今日から通知に主導権を渡さないのだ。」
めたん「まず三つだけオフ。そこから集中を取り戻しましょう。」
```

- [ ] **Step 2: Copy draft to `script_final.md`**

Copy the same content from `script_draft.md` into `script_final.md`.

- [ ] **Step 3: Review `script_final.md`**

Create `script/ep921-zm-notification-focus-reset/audits/script_final_review.md`:

```md
# script_final_review.md

## 対象

`script_final.md`

## 結果

PASS

## 確認項目

- 冒頭に「一瞬の通知で時間が消える」具体的な困りごとがある。
- ずんだもんが語尾だけでなく、やらかし、言い訳、発見、納得を持っている。
- めたんが説明だけでなく、皮肉、整理、具体策、やさしい刺し返しを持っている。
- 1シーン8〜10発話で、質問回答の連発になっていない。
- 既存台本の流用ではなく、通知と集中テーマの新規会話になっている。
- `script.yaml` 化前の自然会話として成立している。

## 修正

なし。
```

## Task 6: Create Zundamon YAML and support files

**Files:**
- Create: `script/ep921-zm-notification-focus-reset/script.yaml`
- Create: `script/ep921-zm-notification-focus-reset/audits/yaml_conversion_v2.md`
- Create: `script/ep921-zm-notification-focus-reset/visual_plan.md`
- Create: `script/ep921-zm-notification-focus-reset/image_prompt_v2.md`
- Create: `script/ep921-zm-notification-focus-reset/meta.json`

- [ ] **Step 1: Create `script.yaml`**

Create YAML with:

- `meta.id: ep921-zm-notification-focus-reset`
- `meta.title: 通知で集中が削られる仕組みを止める`
- `meta.layout_template: Scene02`
- `meta.pair: ZM`
- `meta.fps: 30`
- `meta.width: 1920`
- `meta.height: 1080`
- `meta.target_duration_sec: 300`
- `characters.left.character: zundamon`
- `characters.right.character: metan`
- 10 scenes, each `duration_sec: 30`
- Each scene `main.kind: image`, `main.asset: assets/sXX_main.png`
- Each scene `sub: null` unless a generated image asset is used for `sub`
- Each scene `dialogue` preserving the exact utterance text from `script_final.md`

Use these scene image slots:

| scene | main asset |
|---|---|
| s01 | `assets/s01_main.png` |
| s02 | `assets/s02_main.png` |
| s03 | `assets/s03_main.png` |
| s04 | `assets/s04_main.png` |
| s05 | `assets/s05_main.png` |
| s06 | `assets/s06_main.png` |
| s07 | `assets/s07_main.png` |
| s08 | `assets/s08_main.png` |
| s09 | `assets/s09_main.png` |
| s10 | `assets/s10_main.png` |

- [ ] **Step 2: Create conversion and visual files**

Create `audits/yaml_conversion_v2.md`, `visual_plan.md`, and `image_prompt_v2.md` using the same structure from Task 3 but with Zundamon scene text and notification/focus visuals. Do not create `remotion_card_plan.md`.

- [ ] **Step 3: Create `meta.json`**

Create `meta.json` with:

```json
{
  "id": "ep921-zm-notification-focus-reset",
  "title": "通知で集中が削られる仕組みを止める",
  "pair": "ZM",
  "layout_template": "Scene02",
  "target_duration_sec": 300,
  "width": 1920,
  "height": 1080,
  "assets": [
    {"path": "assets/s01_main.png", "kind": "image", "source_url": "pending-codex-generation-s01"},
    {"path": "assets/s02_main.png", "kind": "image", "source_url": "pending-codex-generation-s02"},
    {"path": "assets/s03_main.png", "kind": "image", "source_url": "pending-codex-generation-s03"},
    {"path": "assets/s04_main.png", "kind": "image", "source_url": "pending-codex-generation-s04"},
    {"path": "assets/s05_main.png", "kind": "image", "source_url": "pending-codex-generation-s05"},
    {"path": "assets/s06_main.png", "kind": "image", "source_url": "pending-codex-generation-s06"},
    {"path": "assets/s07_main.png", "kind": "image", "source_url": "pending-codex-generation-s07"},
    {"path": "assets/s08_main.png", "kind": "image", "source_url": "pending-codex-generation-s08"},
    {"path": "assets/s09_main.png", "kind": "image", "source_url": "pending-codex-generation-s09"},
    {"path": "assets/s10_main.png", "kind": "image", "source_url": "pending-codex-generation-s10"}
  ]
}
```

- [ ] **Step 4: Validate Zundamon package before image generation**

Run:

```bash
rtk python scripts/run_pipeline.py --episode script/ep921-zm-notification-focus-reset --dry-run
rtk npm run gate:episode -- ep921-zm-notification-focus-reset
```

Expected: validation either passes or reports only missing image assets. If schema errors appear, fix the YAML or metadata before image generation.

## Task 7: Generate images with Codex CLI

**Files:**
- Create/update: `script/ep920-rm-smartphone-photo-search/assets/s01_main.png` through `s10_main.png`
- Create/update: `script/ep921-zm-notification-focus-reset/assets/s01_main.png` through `s10_main.png`
- Modify: both `meta.json` files to replace pending `source_url` values
- Create/update: both `audits/image_generation_status.md`

- [ ] **Step 1: Confirm cost before image generation**

This task generates 20 images. Before running Codex, tell the user:

```text
20枚生成するので、概算コストは1枚あたり$0.04〜$0.07、合計だいたい$0.80〜$1.40くらい。4並列×5波で進めるね。
```

Proceed only after the user approves the cost.

- [ ] **Step 2: Check Codex CLI availability**

Run:

```bash
rtk codex --version
rtk ls ~/.codex/auth.json
```

Expected: Codex version prints, and auth file exists.

If either fails, create `audits/image_generation_status.md` in both episode directories with:

```md
# image_generation_status.md

## status

NOT_AVAILABLE

## pass

false

## human_review_required

true

## reason

Codex CLI or Codex authentication was not available, so image generation could not be completed in this environment.
```

- [ ] **Step 3: Prepare ASCII working directory**

Run:

```bash
rtk mkdir -p /c/temp/codex-img-batch
```

Expected: directory exists.

- [ ] **Step 4: Create one prompt file per image**

For each image, create `/c/temp/codex-img-batch/prompt_ep920_s01.txt` style files. Each prompt must start with:

```text
あなたは画像生成専門アシスタントです。

【厳守】
- 使うツールは image_gen（gpt-image-1）だけ。
- shell / PowerShell / Bash / Read / Write / Apply など他のツールは絶対使わない。
- ファイルコピーや保存先操作はしない。
- プロジェクトファイルを読みに行かない。
- 生成が終わったら最終行に `[ALL_DONE] 1/1` とだけ出力。

【プロンプト】
```

Then include the English image prompt derived from `image_prompt_v2.md`, one image only.

- [ ] **Step 5: Run Codex image generation in waves of 4**

Run four background Bash commands per wave, one command per image:

```bash
codex exec --full-auto --skip-git-repo-check --color never -C "C:/temp/codex-img-batch" < "C:/temp/codex-img-batch/prompt_ep920_s01.txt" > "C:/temp/codex-img-batch/log_ep920_s01.txt" 2>&1
```

Expected per log: final line `[ALL_DONE] 1/1` and one generated PNG in the Codex session directory.

Repeat until all 20 images are generated.

- [ ] **Step 6: Copy generated PNGs into episode assets**

Create a temporary copy script such as `/c/temp/codex-img-batch/copy_codex_images.mjs` that maps each log/session to its destination:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const jobs = [
  ['ep920_s01', 'script/ep920-rm-smartphone-photo-search/assets/s01_main.png'],
  ['ep920_s02', 'script/ep920-rm-smartphone-photo-search/assets/s02_main.png'],
  ['ep920_s03', 'script/ep920-rm-smartphone-photo-search/assets/s03_main.png'],
  ['ep920_s04', 'script/ep920-rm-smartphone-photo-search/assets/s04_main.png'],
  ['ep920_s05', 'script/ep920-rm-smartphone-photo-search/assets/s05_main.png'],
  ['ep920_s06', 'script/ep920-rm-smartphone-photo-search/assets/s06_main.png'],
  ['ep920_s07', 'script/ep920-rm-smartphone-photo-search/assets/s07_main.png'],
  ['ep920_s08', 'script/ep920-rm-smartphone-photo-search/assets/s08_main.png'],
  ['ep920_s09', 'script/ep920-rm-smartphone-photo-search/assets/s09_main.png'],
  ['ep920_s10', 'script/ep920-rm-smartphone-photo-search/assets/s10_main.png'],
  ['ep921_s01', 'script/ep921-zm-notification-focus-reset/assets/s01_main.png'],
  ['ep921_s02', 'script/ep921-zm-notification-focus-reset/assets/s02_main.png'],
  ['ep921_s03', 'script/ep921-zm-notification-focus-reset/assets/s03_main.png'],
  ['ep921_s04', 'script/ep921-zm-notification-focus-reset/assets/s04_main.png'],
  ['ep921_s05', 'script/ep921-zm-notification-focus-reset/assets/s05_main.png'],
  ['ep921_s06', 'script/ep921-zm-notification-focus-reset/assets/s06_main.png'],
  ['ep921_s07', 'script/ep921-zm-notification-focus-reset/assets/s07_main.png'],
  ['ep921_s08', 'script/ep921-zm-notification-focus-reset/assets/s08_main.png'],
  ['ep921_s09', 'script/ep921-zm-notification-focus-reset/assets/s09_main.png'],
  ['ep921_s10', 'script/ep921-zm-notification-focus-reset/assets/s10_main.png']
];

for (const [label, dest] of jobs) {
  const logPath = `C:/temp/codex-img-batch/log_${label}.txt`;
  const log = await fs.readFile(logPath, 'utf8');
  const match = log.match(/session id:\s*([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error(`No session id in ${logPath}`);
  const sessionId = match[1];
  const dir = path.join(os.homedir(), '.codex', 'generated_images', sessionId);
  const pngs = (await fs.readdir(dir)).filter((name) => name.endsWith('.png'));
  if (pngs.length !== 1) throw new Error(`${sessionId}: expected 1 PNG, got ${pngs.length}`);
  await fs.mkdir(path.dirname(dest), {recursive: true});
  await fs.copyFile(path.join(dir, pngs[0]), dest);
  console.log(`${label}: codex://generated_images/${sessionId}/${pngs[0]} -> ${dest}`);
}
```

Run:

```bash
rtk node /c/temp/codex-img-batch/copy_codex_images.mjs
```

Expected: all 20 PNGs copied into the two episode `assets/` directories.

- [ ] **Step 7: Update metadata and image status**

Replace all pending `source_url` entries in both `meta.json` files with the `codex://generated_images/{session_id}/{filename}` values printed by the copy script.

Create `audits/image_generation_status.md` in both episode directories:

```md
# image_generation_status.md

## status

COMPLETED

## pass

true

## generated_assets

- assets/s01_main.png
- assets/s02_main.png
- assets/s03_main.png
- assets/s04_main.png
- assets/s05_main.png
- assets/s06_main.png
- assets/s07_main.png
- assets/s08_main.png
- assets/s09_main.png
- assets/s10_main.png

## note

Images were generated one image per Codex process and copied from Codex generated image session directories.
```

## Task 8: Final validation and report

**Files:**
- Read/check generated episode directories only.

- [ ] **Step 1: Run dry-run and gate for both episodes**

Run:

```bash
rtk python scripts/run_pipeline.py --episode script/ep920-rm-smartphone-photo-search --dry-run
rtk npm run gate:episode -- ep920-rm-smartphone-photo-search
rtk python scripts/run_pipeline.py --episode script/ep921-zm-notification-focus-reset --dry-run
rtk npm run gate:episode -- ep921-zm-notification-focus-reset
```

Expected: both episodes pass or only report intentionally out-of-scope render/video audit items. Fix any script/YAML/schema failures.

- [ ] **Step 2: Confirm no forbidden schema keys**

Run:

```bash
rtk grep "scene_template" script/ep920-rm-smartphone-photo-search script/ep921-zm-notification-focus-reset
```

Expected: no matches inside `script.yaml`. If `scene_template` appears in image prompt prose only, remove it from prompts to align with v2 image rules.

- [ ] **Step 3: Confirm required files exist**

Run:

```bash
rtk ls script/ep920-rm-smartphone-photo-search
rtk ls script/ep920-rm-smartphone-photo-search/assets
rtk ls script/ep920-rm-smartphone-photo-search/audits
rtk ls script/ep921-zm-notification-focus-reset
rtk ls script/ep921-zm-notification-focus-reset/assets
rtk ls script/ep921-zm-notification-focus-reset/audits
```

Expected: all files listed in File Structure exist.

- [ ] **Step 4: Final report**

Report in this format:

```text
完了:
- episode_id: ep920-rm-smartphone-photo-search / ep921-zm-notification-focus-reset
- 使用テンプレート: Scene02
- 変更ファイル: none or list modified existing files
- 追加ファイル: list new episode files and plan/spec docs
- バックアップ: none
- script final review: PASS for both
- image audit: 任意 / image_generation_status.md recorded
- gate: PASS or exact failure summary
- render: 対象外
- video audit: 対象外
- NOT_AVAILABLE: none or exact unavailable item
- human_review_required: false unless image generation unavailable
- 残課題: render/video audit only if user wants MP4 completion
```

## Self-Review

- Spec coverage: The plan covers both requested episode packages, original scripts, script final review, YAML conversion, visual plans, image prompts, Codex image generation, metadata updates, and final validation.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain. The only conditional branch is explicit Codex NOT_AVAILABLE handling.
- Type consistency: Episode IDs, file paths, layout template, pair values, asset paths, and audit filenames are consistent across tasks.
- Scope check: Render and video audit remain out of scope and must not be reported as completed.
