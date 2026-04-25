# 画像密度・ImageGenプロンプト・Codex監査強化 設計

## 背景

台本生成から動画化までの現在の運用では、`main.kind: image` と `text` / `bullets` が混在しており、エピソードによって画像密度にばらつきがある。素材が少ない回は画面変化が弱く、視聴者にとって見やすさや面白さが落ちやすい。

また、`imagegen_prompt` は構図・スタイル・色・アスペクト・文字禁止を指示しているが、動画全体のトーンやテンプレートの表示領域に合わせる指示が弱い。今後は、素材数を増やしつつ、画像の雰囲気を動画ごとに統一し、主要フェーズごとに別Codex監査を挟む。

## 目的

- 台本生成時点で、画像化しやすい素材ポイントを多く用意する。
- bodyシーンでは原則として `main.kind: image` を使う。
- mainコンテンツエリア内の文字・ラベル・数字を禁止する。
- `imagegen_prompt` を動画トーンとテンプレート領域に合わせて改善する。
- 台本生成後から動画生成前まで、主要フェーズごとに別Codex監査を必須化する。

## 非目的

- すべてのsub枠を画像化すること。
- OP/EDを必ず画像にすること。
- 画像内に説明文や図解ラベルを直接入れること。
- 画像生成が失敗している状態で動画生成へ進むこと。
- 既存の動画レンダースキーマを別方式へ置き換えること。

## 画像密度ルール

1. `body` ロールのシーンは、原則として `main.kind: image` にする。
2. `intro` / `summary` / `outro` は、テンプレートや内容に応じて `text` / `bullets` を許可する。
3. ただし、フック・比較・仕組み説明・意外性の提示に効く場合は、OP/EDでも画像を優先する。
4. `sub` は画像必須にしない。補足図、比較図、注意点、チェックリスト、手順など、情報補助に向く場合だけ画像化する。
5. main画像では、文字・ラベル・数字・吹き出し・UI文字・字幕・ロゴを要求しない。
6. 文字で説明したい内容は、`title_text`、`dialogue[].text`、`sub.items` に分離する。
7. 3分前後の短尺では、main画像8〜12枚程度を目安にする。長尺では章数とbodyシーン数に応じて増やす。

## ImageGenプロンプト設計

`imagegen_prompt` は、現在の「構図 → スタイル → 色 → アスペクト → 文字なし → negative」から、次の順序へ強化する。

1. 動画トーン
   - 例: `少し怖いが実用的`, `知的で落ち着いた`, `コミカルで明るい`
2. テンプレート適合
   - main枠で見切れないように、重要被写体は中央寄せ、余白多めにする。
3. 構図
   - 中央、左右、奥行き、視線誘導を指定する。
4. 被写体数
   - 主役は1〜2要素に絞り、詰め込みすぎない。
5. スタイル
   - フラット図解、教育イラスト、ポップなアイコン、ダーク寄り図解などを明示する。
6. 色・質感
   - `meta.image_style` または入力された動画の雰囲気と揃える。
7. アスペクト
   - `16:9` / `4:3` / `1:1` などを明示する。
8. 文字禁止
   - 画像内に文字、ラベル、数字、吹き出し、UI文字、字幕を入れないと明記する。
9. negative
   - `文字, typography, logo, watermark, caption, label, number` を標準の禁止語として含める。

## asset_requirements拡張

`codex-imagegen` 経路の `asset_requirements` には、従来の `imagegen_prompt` / `style` / `aspect` / `negative` に加えて、画像の役割と雰囲気を明示する。

```yaml
main:
  kind: image
  asset: assets/s02_main.png
  caption: "通知で眠気が消える仕組み"
  asset_requirements:
    visual_role: "仕組み説明"
    mood: "少し怖いが実用的"
    imagegen_prompt: |
      少し怖いが実用的な睡眠解説動画向けのフラット図解。
      mainコンテンツエリアで見切れないよう、重要要素は中央寄せで余白を広めに取る。
      中央に暗い寝室のベッド、右側に光るスマホ通知、奥に眠気が逃げていく抽象的な波を配置する。
      主役はスマホ通知と眠れない人のシルエットの2要素に絞る。
      暗すぎない青紫系、清潔な教育イラスト、16:9。
      画像内に文字、ラベル、数字、吹き出し、UI文字、字幕を入れない。
    style: "フラット図解、暗すぎない青紫系"
    aspect: "16:9"
    negative: "文字、ラベル、数字、ロゴ、透かし、字幕、UI文字、人物の顔、typography, watermark, caption, label, number"
```

## 主要フェーズ別Codex監査

各監査は毎回別のCodexセッションへ依頼する。NGが出た場合は、そのフェーズを修正してから次へ進む。

### 1. 台本生成後監査

- 会話が面白く、章立てが自然か。
- 冒頭・中盤・締めに視聴維持のフックがあるか。
- bodyシーンに画像化できる素材ポイントが十分あるか。
- 素材候補が抽象的すぎず、画像生成へ渡しやすいか。

### 2. asset_requirements作成後監査

- bodyシーンの `main.kind: image` が原則守られているか。
- `visual_role`、`mood`、`imagegen_prompt`、`negative` が不足していないか。
- main画像内に文字、ラベル、数字、UI文字を要求していないか。
- 動画トーンと `imagegen_prompt` が一致しているか。
- 重要被写体がmain枠で見切れない指定になっているか。

### 3. 画像生成後監査

- 生成ファイルが存在するか。
- 画像内に文字、ラベル、ロゴ、数字、透かしが入っていないか。
- 雰囲気、色味、スタイルが動画全体で揃っているか。
- main枠で被写体が見切れないか。
- 失敗画像を放置していないか。

### 4. script.yaml / meta.json変換後監査

- `meta.layout_template` が1回だけ存在するか。
- 各sceneに `scene_template` が残っていないか。
- `main.asset` / `sub.asset` が `assets/...` 相対パスになっているか。
- `meta.json` の `assets[]` に `generator`、`imagegen_prompt`、`imagegen_model`、`license` が記録されているか。
- text-fallbackへ縮退したシーンがある場合、その理由が妥当か。

### 5. 動画生成前監査

- Stop Conditionsを満たしていない項目が残っていないか。
- `dialogue[].text` が25文字以内か。
- 画像生成失敗や連続text-fallbackが放置されていないか。
- validate/build/renderへ進める状態か。

## 変更対象

### `CLAUDE.md`

- 画像密度ルールを追加する。
- main画像内文字NGを明記する。
- 主要フェーズ別Codex監査を必須フローとして追加する。
- Stop Conditionsへ画像密度、文字混入、監査未実施を追加する。
- 現行の `meta.layout_template` 方式と矛盾しないように書く。

### `21_prompt_codex.md`

- `imagegen_prompt` 設計原則を強化する。
- `visual_role` / `mood` を `asset_requirements` の例へ追加する。
- bodyシーンのmain画像を原則必須にする指示を追加する。
- 画像内文字禁止のnegative例を強化する。

### `_reference/script_prompt_pack/01_台本生成プロンプト.md`

- 素材候補メモを「各bodyシーンで画像化しやすい素材候補を出す」方向へ強化する。
- 画像内文字を前提にしない素材メモを書くようにする。
- 説明文は台詞、タイトル、sub bulletsに分離する指示を追加する。

### `_reference/script_prompt_pack/台本監査_改善プロンプト.md`

- 画像密度の監査観点を追加する。
- main画像内文字NGの監査観点を追加する。
- 動画トーンと `imagegen_prompt` の一致を監査する。
- 主要フェーズ別Codex監査の観点を追加する。

## 成功条件

- 新規台本生成時、bodyシーンの `main.kind: image` が原則必須になる。
- `asset_requirements` に `visual_role` と `mood` が入る。
- `imagegen_prompt` が動画トーンとテンプレート枠に合わせて書かれる。
- main画像内に文字、ラベル、数字を要求しない。
- 主要フェーズごとに別Codex監査を挟む指示が明文化される。
- 現行の `meta.layout_template` 方式と矛盾しない。
- 画像生成失敗、監査未実施、連続text-fallbackを成功扱いしない。

## 実装後の確認

- 関連Markdownに矛盾する旧ルールが残っていないか確認する。
- `scene_template` 前提の説明を増やさず、`meta.layout_template` 前提に合わせる。
- `imagegen_prompt` の例に文字・ラベル・数字の要求が混ざっていないか確認する。
- 監査フローが「毎回別Codex」であることを明記する。
