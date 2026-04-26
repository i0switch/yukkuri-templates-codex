# 02_draft_prompt

## 目的

`01_plan_prompt.md` で作ったプランをもとに、会話台本の初稿を作る。
必ず `00_MASTER_SCRIPT_RULES.md` と生成済みプランを読む。

## 入力

```text
台本生成プラン：
キャラペア：RM / ZM
使用テンプレート：SceneXX
想定尺：
追加要望：
```

## やること

- プランの構成を大きく崩さず台本化する。
- 冒頭5秒に強い疑問、損失、意外性、誤解訂正、数字のいずれかを置く。
- 各シーンの冒頭1から2セリフで小さなフックを作る。
- 各シーンに最低1回、誤解・ボケ・雑な解決策・極端な発想のいずれかを入れる。
- 各シーンにボケ→ツッコミ、または誤解→訂正の流れを入れる。
- 解説役は2セリフ以内で一度、視聴者代表キャラに返す。
- 解説役だけが3セリフ以上続かないようにする。
- ずんだもん、霊夢を単なる質問係にしない。
- 章タイトルは必ずフック型にする。
- 各シーンに数字・具体例・あるあるのいずれかを入れる。
- 3から5シーンに1回、短い例え話や小ネタを入れる。
- L3以上のリアクションを動画全体で2回以上入れる。
- 同じ強度の反応や同じ語尾を3連続させない。
- 想定尺に合う本文量を確保する。5分前後なら10〜12シーン、90〜130セリフを目安にする。
- 5分前後で8シーン以下、70セリフ未満の初稿は作らない。
- 各シーンは原則8〜12セリフにし、6セリフ固定で終わらせない。
- 各シーンに最低1回、追加の深掘り往復を入れる。
- ZMでは、ずんだもんの「なのだ」「のだ」を20〜40%目安にする。50%以上は過剰、10%未満はキャラ性不足。
- 1セリフは25文字以内を安全上限にする。
- 各シーンにテンプレート枠メモを入れる。
- 各シーンに `scene_format`、`hook_type`、`viewer_misunderstanding`、`number_or_example` を入れる。
- 各シーンに `visual_asset_plan`、`image_direction`、具体的な `imagegen_prompt` を入れる。
- `imagegen_prompt` は `image_direction` から展開し、GPT-Image-2向け完成プロンプト形式で書く。
- `visual_asset_plan` には `supports_dialogue`、`supports_moment`、`visual_type`、`composition_type` を必ず入れる。
- `imagegen_prompt` には scene_id、slot、main/sub の役割、字幕帯とキャラ位置を避ける余白を必ず入れる。
- `imagegen_prompt` には、台本内のどの掛け合いを補強するか、前景/中景/背景、Remotionで文字を重ねる場所を必ず入れる。
- 画像内文字は原則なし。入れる場合も日本語3〜6文字までにし、細かい説明文はセリフへ逃がす。
- episode共通の `meta.image_style` を決め、全シーンの `imagegen_prompt` の絵柄と色味を揃える。
- BGM、SE、字幕装飾、ズームなどの確定演出は書かない。
- 台本末尾にセルフチェックを追加する。
- 最終シーンは「見るだけ」で終わらせず、確認、1つ選ぶ、保存/逃がす/テンプレ化、予定化などから最低2アクションを含める。
- 章タイトルがテーマ語彙から浮いていないか、各シーン生成時に確認する。
- ZMではずんだもんの「なのだ」「のだ」20〜40%、RMでは魔理沙の「だぜ」30〜60%を目安にする。
- 台本を書き終えたら、助詞抜け・誤字っぽい語尾・不自然な口語を必ず直す。
- セルフ監査では軽微な改善余地を最低1つ書き、安易に「Blocking Issuesなし」としない。

## 会話の作り方

各本編シーンは、原則として次の順で作る。

1. 視聴者代表キャラが浅い理解、勘違い、雑な解決策、極端な発想を言う。
2. 解説役が短くツッコむ、または短く訂正する。
3. 日常の具体例、数字、あるあるで補足する。
4. 視聴者代表キャラが驚く、疑う、言い換える、ボケる。
5. 解説役が短く結論を置く。

禁止:

- 質問、回答、質問、回答だけで進める。
- 解説役が先生のように説明し続ける。
- 視聴者代表キャラが「なるほど」「怖い」「そうなのだ」だけで返す。
- 箇条書き説明をそのまま読み上げる。

## 尺・密度の作り方

想定尺に対して、本文量が不足しないように作る。

- 3分前後：6〜8シーン、60〜80セリフ。
- 5分前後：10〜12シーン、90〜130セリフ。
- 8分前後：14〜18シーン、150〜220セリフ。

5分前後の場合は次を守る。

- 本編10シーン以上。
- 本編90セリフ以上。
- 各シーン8〜12セリフ。
- 40〜60%地点に中盤再フックを置く。
- 章メタ情報で水増しせず、本編会話を増やす。

## 最終行動の作り方

ラストは視聴者が今すぐ動ける形にする。
「容量一覧を見る」「1作業を選ぶ」のような確認だけで終わらせず、次の2段以上にする。

例:

- 確認する → 一番重いものを1つ選ぶ → 逃がし先を決める
- 作業を1つ選ぶ → 3行テンプレにする → 保存する
- バックアップ状態を見る → 未確認のものを保留する → 月1予定を入れる

NG:

- 今日見るだけ
- いつか整理する
- まず考える
- 全部頑張る

## 章タイトル・自然文チェック

本文完成後、次を必ず行う。

- 章タイトルにテーマ外の単語が混ざっていないか確認する。
- 章タイトルが本文内容とズレていないか確認する。
- 誤字ではないが誤字に見えるセリフを直す。
- 助詞が抜けたセリフを直す。
- キャラ語尾が不自然に衝突したセリフを直す。

例:

- NG: 別端末で開けるかよ
- OK: 別端末で開けるか確認よ

## 出力形式

```md
# 台本初稿

## 1. 基本情報
- テーマ：
- 想定尺：
- キャラペア：
- layout_template：
- 企画角度：
- 掛け合い方針：
- 目標シーン数：
- 目標本編セリフ数：

## 2. タイトル案
1.
2.
3.
4.
5.

## 3. サムネ文言案
- 
- 
- 

## 4. 本編台本

### s01: フック型シーンタイトル
- scene_goal：
- scene_format：
- hook_type：
- viewer_question：
- viewer_misunderstanding：
- boke_or_reaction：
- reaction_level：
- number_or_example：
- target_dialogue_count：
- depth_round：
- mini_punchline：
- main_content：
- sub_content：
- subtitle_area：
- title_area：
- visual_role：
- image_insert_point：
- asset_path：
- visual_asset_plan：
  - slot：
  - purpose：
  - supports_dialogue：
  - supports_moment：
  - visual_type：
  - composition_type：
  - insert_timing：
  - asset_path：
  - image_direction：
    - dialogue_role：
    - scene_emotion：
    - image_should_support：
    - key_visual_sentence：
    - main_subject：
    - foreground：
    - midground：
    - background：
    - color_palette：
    - text_strategy：
    - layout_safety：
    - must_not_include：
    - quality_bar：
  - imagegen_prompt：
    ゆっくり解説 / ずんだもん解説動画のSceneXX main/sub枠で使う高品質ビジュアル素材。
    この画像は、台本内の「補強する掛け合い」を視覚的に補強する。
    visual_typeは「...」、composition_typeは「...」。
    画面構図：
    デザイン：
    文字方針：
    禁止：
  - audit_points：
- reference_style：
- reference_beat：
- curiosity_gap：
- evidence_role：
- next_reason：

話者：セリフ
話者：セリフ
話者：セリフ

- ミニオチ／小結論：

## 5. 必要素材リスト
| scene_id | slot | 用途 | asset_path | imagegen_prompt要約 |
|---|---|---|---|---|

## 6. コメント誘導
- 

## 7. 締めの具体行動
- 

## 8. セルフチェック
- ボケ→ツッコミ、または誤解→訂正が各シーンにある：YES / NO
- 視聴者代表キャラが相槌だけの反応になっていない：YES / NO
- L3以上のリアクションが2回以上ある：YES / NO
- 数字・具体例・あるあるが各シーンにある：YES / NO
- 章タイトルが説明目次になっていない：YES / NO
- 口癖が偏りすぎていない：YES / NO
- ZMの場合、「なのだ」「のだ」率が20〜40%目安：YES / NO / 対象外
- 解説役の3セリフ以上の独演がない：YES / NO
- シーン形式が3種類以上ある：YES / NO
- 例え話または小ネタが2回以上ある：YES / NO
- visual_asset_plan と imagegen_prompt を維持している：YES / NO
- image_direction があり会話の補強瞬間が明確：YES / NO
- visual_type と composition_type が適切：YES / NO
- imagegen_prompt がGPT-Image-2向け完成形式を満たしている：YES / NO
- imagegen_prompt に scene_id、slot、テンプレート枠、字幕帯/キャラ回避がある：YES / NO
- imagegen_prompt に補強する掛け合い、前景/中景/背景、Remotion重ね文字の余白がある：YES / NO
- 画像内文字が0文字または日本語3〜6文字以内になっている：YES / NO
- episode全体の image_style と各画像プロンプトの絵柄が揃っている：YES / NO
- 最終行動が2アクション以上で具体的：YES / NO
- 章タイトルがテーマ語彙から浮いていない：YES / NO
- 不自然な日本語・誤字っぽい語尾が残っていない：YES / NO
- RMの場合、魔理沙の「だぜ」率が目安内：YES / NO
- 軽微な改善余地を1つ以上検討した：YES / NO
- 想定尺に対して本編シーン数が足りている：YES / NO
- 想定尺に対して本編セリフ数が足りている：YES / NO
- 各シーンが6セリフ固定で単調になっていない：YES / NO
- 中盤再フックがある：YES / NO
```
