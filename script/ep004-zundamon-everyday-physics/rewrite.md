# 台本修正版

## 1. 修正概要
| 修正対象 | 修正理由 | 対応内容 |
|---|---|---|
| 全ずんだもん発話 | 「のだ／なのだ」率が約92.5%で基準外 | 強い反応・ボケ・締めだけに残し、それ以外を「だね」「かな」「じゃん」「マジで？」へ分散 |
| s01 | RM名の混入 | ずんだもん単独の挨拶へ修正 |
| s04 | 飛行機翼の断定感 | コアンダ単独で浮く印象を避け、空気が面に沿う例に限定 |
| s05 | 25字超過 | 26字セリフを2セリフへ分割 |
| s08〜s10 | 「5選」が6項目に見える | 4つ目をベンチュリ効果に統合し、キャビテーションは補足例扱い |
| s09/s10 | 沸騰とキャビテーションの混同 | s09を霧吹き応用へ差し替え、s10は圧力低下による泡の別例として短く整理 |
| s12 | 行動がやや多い | 「思い出す→1つ選ぶ→翌日観察」の3手を主軸に整理 |

## 2. 修正後の該当箇所

### s01: シャワーの水が曲がる理由
- scene_goal：寸劇導入
- scene_format：寸劇あるある型
- hook_type：あるある型
- viewer_question：何の話が始まる？
- viewer_misunderstanding：物理は日常と無関係
- boke_or_reaction：ずんだもん「ボクすごい発見したのだ」L2
- reaction_level：L2
- number_or_example：シャワーの水が手にまとわりつく現象
- target_dialogue_count：6
- depth_round：1
- mini_punchline：めたん「それ全部物理現象よ」
- main_content：シャワー水流が手のシルエットに巻き付く図
- sub_content：—
- subtitle_area：bar 字幕
- title_area：上部タイトルライン
- visual_role：寸劇ビジュアル
- image_insert_point：開幕直後
- asset_path：script/ep004-zundamon-everyday-physics/assets/s01_main.png
- visual_asset_plan：
  - slot：main
  - purpose：寸劇導入の比喩視覚
  - insert_timing：scene 序盤
  - asset_path：assets/s01_main.png
  - imagegen_prompt：フラットなアイコンスタイルのイラスト、白背景。シャワーヘッドから水流が手のシルエットへ巻き付く構図。色は水色系。16:9。文字なし。
  - audit_points：実在ブランド禁止。文字なし。手は抽象シルエット。
- reference_style：N/A
- reference_beat：opening
- curiosity_gap：何が物理？
- evidence_role：—
- next_reason：何の話が始まる？

ずんだもん：ずんだもんなのだ。
めたん：わたくしが四国めたんですわ。
ずんだもん：シャワーの水って、手にまとわりつくね。
めたん：それ、名前のある物理現象よ。
ずんだもん：えっ、毎日のあれが？
めたん：今日は身近な物理現象を5つ紹介するわ。

- ミニオチ／小結論：日常も全部物理という前提を提示

### s02: 物理は毎日触ってる5つある
めたん：物理は学校で終わったと思った？
ずんだもん：思ってた、もう関係ないじゃん。
めたん：目安として、1日に何十回か触れてるのよ。
ずんだもん：えっ、毎日？！
めたん：今日紹介する5つは全部、毎日のあれよ。
ずんだもん：ボクの日常、物理だらけなのだ？
めたん：ええ。全部に名前があるの。
ずんだもん：早く知りたいな。

- ミニオチ／小結論：日常 = 物理 だと先出し

### s03: 水は壁に沿って流れたがる
めたん：1つ目はコアンダ効果よ。
ずんだもん：ボク、知ってた気がする。
めたん：本当に？説明できる？
ずんだもん：……名前だけ知ってたのだ。
めたん：水は壁に沿って流れたがる現象なの。
ずんだもん：スプーン裏で水が逃げないやつ？
めたん：そう、蛇口の水を指で受けたら沿うでしょ？
ずんだもん：本当に身近すぎるね。
めたん：これ、もっと大きな場所でも使われてるのよ。

- ミニオチ／小結論：水は壁に沿いたがる

### s04: 飛行機の翼にも使われてる
- scene_goal：コアンダ効果の応用（飛行機）
- scene_format：Before/After型
- hook_type：損失型
- viewer_question：飛行機にも？
- viewer_misunderstanding：飛行機は単に風で浮く
- boke_or_reaction：ずんだもん「えっ、飛行機？！」L3
- reaction_level：L3
- number_or_example：翼の表面を空気が沿う応用例（断定回避）
- target_dialogue_count：9
- depth_round：1
- mini_punchline：めたん「身近な台所も飛行機も同じ原理の一部」
- main_content：翼の断面と上面を流れる風の流線
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：応用例
- image_insert_point：line 1 直後
- asset_path：assets/s04_main.png
- visual_asset_plan：
  - slot：main
  - purpose：飛行機翼の流線視覚化
  - insert_timing：scene 序盤
  - asset_path：assets/s04_main.png
  - imagegen_prompt：フラットなアイコン、白背景。翼の断面に上面を流れる風の流線。色は青系。16:9。文字なし。
  - audit_points：実在航空機ブランド禁止。文字なし。
- reference_style：N/A
- reference_beat：item-1-impact
- curiosity_gap：飛行機にも？
- evidence_role：応用例として（断定回避）
- next_reason：2つ目は何？

めたん：応用例の1つが飛行機の翼よ。
ずんだもん：えっ、飛行機？！
めたん：翼の表面に空気が沿う一例ね。
ずんだもん：台所から空までつながるのだ？
めたん：揚力は複数の説明が重なるの。
ずんだもん：ひとつだけで決まらないんだね。
めたん：でも、流れが面に沿う見方は大事よ。
ずんだもん：めたん、これ覚えとく。
めたん：では2つ目に進みましょう。

- ミニオチ／小結論：身近〜大規模まで同じ原理の一部が見える

### s05: タオルが水を吸い上げる謎
- scene_goal：毛細管現象の導入
- scene_format：あるある型
- hook_type：あるある型
- viewer_question：重力に逆らう？
- viewer_misunderstanding：重力に逆らうのは魔法
- boke_or_reaction：ずんだもん「タオルが宇宙のもの吸ってるのだ」L2
- reaction_level：L2
- number_or_example：タオル端を水につけると上に染みる例
- target_dialogue_count：9
- depth_round：1
- mini_punchline：ずんだもん極端ボケ → めたん「宇宙までは無理よ」
- main_content：タオルが水を吸い上げ、矢印で上向き
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：毛細管視覚化
- image_insert_point：line 1 直後
- asset_path：assets/s05_main.png
- visual_asset_plan：
  - slot：main
  - purpose：タオル吸い上げ視覚化
  - insert_timing：scene 序盤
  - asset_path：assets/s05_main.png
  - imagegen_prompt：フラット、白背景。タオルが水を吸い上げ、上向き矢印。色は青系。16:9。文字なし。
  - audit_points：実在タオルブランド禁止。文字なし。
- reference_style：N/A
- reference_beat：item-2
- curiosity_gap：重力に勝ってる？
- evidence_role：日常例
- next_reason：これも名前ある？

めたん：2つ目は毛細管現象よ。
ずんだもん：タオル、宇宙のもの吸ってるのだ。
めたん：宇宙までは無理よ、地球の中だけね。
ずんだもん：あっ、ちょっと残念。
めたん：細い隙間があると水が登るの。
ずんだもん：細いと、水がはい上がるんだ？
めたん：重力に勝つというより、表面張力と濡れね。
ずんだもん：ボクも何か染みてみたいな。
めたん：そこは染みなくていいわ。

- ミニオチ／小結論：細いと水が登る

### s06: 細い隙間が水を引っ張る
めたん：植物の根が水を吸うのも、これと同じ仕組みよ。
ずんだもん：えっ、植物もこれ？！
めたん：細い管が中にたくさん通ってるからよ。
ずんだもん：ボクの観葉植物、頑張ってたね。
めたん：木の幹も同じ。何メートルも上に水が登るの。
ずんだもん：木って、しれっと物理してるのだ。
めたん：紙ナプキンに水がにじむのも同じ仕組みよ。
ずんだもん：身の回り、毛細管だらけじゃん。
めたん：3つ目は飲み物のあのやつね。

- ミニオチ／小結論：身の回りに毛細管が満ちてる

### s07: ストローで吸うときの不思議
めたん：ここまで2つ。3つ目は飲み物のあれよ。
ずんだもん：ストロー！？毎日吸ってる。
めたん：そう。でも実は吸ってるんじゃないのよ。
ずんだもん：えっ、ボク吸ってるじゃん！
めたん：あなたが口の中の圧を下げる。
ずんだもん：そしたら何が起きるの？
めたん：周りの大気圧が水面を押し上げてるの。
ずんだもん：吸ってるんじゃなく押されてるのだ？
めたん：そう。あなたは引っ張ってないのよ。
ずんだもん：ボクの世界観、揺らいだ。

- ミニオチ／小結論：吸ってるは大気圧で押されてる

### s08: 細いところで速く流れる仕組み
- scene_goal：ベンチュリ効果の導入
- scene_format：反証型
- hook_type：誤解訂正型
- viewer_question：細いと速い？
- viewer_misunderstanding：細いと流れにくくなる
- boke_or_reaction：ずんだもん「狭いと詰まるはずなのだ」L4
- reaction_level：L4
- number_or_example：ホースの口を細めると水が遠くまで飛ぶ
- target_dialogue_count：9
- depth_round：1
- mini_punchline：めたん「ベンチュリ効果という現象よ」
- main_content：ホース図、口が細く絞られて水流が伸びる
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：ベンチュリ視覚化
- image_insert_point：line 1 直後
- asset_path：assets/s08_main.png
- visual_asset_plan：
  - slot：main
  - purpose：絞り口の流速視覚化
  - insert_timing：scene 序盤
  - asset_path：assets/s08_main.png
  - imagegen_prompt：フラット、白背景。ホース、口が絞られて水流が長く伸びる構図。色は青系。16:9。文字なし。
  - audit_points：実在園芸ブランド禁止。文字なし。
- reference_style：N/A
- reference_beat：item-4
- curiosity_gap：細いと速い？
- evidence_role：ホースのあるある
- next_reason：4つ目の応用は？

めたん：4つ目はベンチュリ効果よ。
ずんだもん：狭いと詰まるはずなのだ。
めたん：それが意外と逆なの。
ずんだもん：嘘でしょ、流れにくくなるじゃん。
めたん：ホースの口を指で絞ると、水が遠くまで飛ぶでしょ？
ずんだもん：あ、めっちゃ飛ぶ。
めたん：細い場所では流れが速くなるの。
ずんだもん：知らずに毎回やってたのだ。
めたん：次はその応用例ね。

- ミニオチ／小結論：細いほど流れは速い

### s09: 霧吹きが液体を吸い出す理由
- scene_goal：ベンチュリ効果の応用（霧吹き）
- scene_format：誤解訂正型
- hook_type：あるある型
- viewer_question：霧吹きにも？
- viewer_misunderstanding：霧吹きは単に押し出している
- boke_or_reaction：ずんだもん「押してるだけじゃないの？」L2
- reaction_level：L2
- number_or_example：霧吹きで液体が細かく出る例
- target_dialogue_count：10
- depth_round：1
- mini_punchline：めたん「速い流れが周りを引き込むの」
- main_content：霧吹きノズル、速い空気流と吸い上がる液体
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：ベンチュリ応用視覚化
- image_insert_point：line 1 直後
- asset_path：assets/s09_main.png
- visual_asset_plan：
  - slot：main
  - purpose：霧吹きで液体が引き込まれる視覚
  - insert_timing：scene 序盤
  - asset_path：assets/s09_main.png
  - imagegen_prompt：フラット、白背景。霧吹きノズルの断面、速い空気流と下から吸い上がる液体を矢印で示す。色は青系。16:9。文字なし。
  - audit_points：実在製品ブランド禁止。危険行為なし。文字なし。
- reference_style：N/A
- reference_beat：item-4-impact
- curiosity_gap：押してるだけじゃない？
- evidence_role：霧吹きのあるある
- next_reason：速すぎる流れの弱点は？

めたん：霧吹きも、この応用例よ。
ずんだもん：押してるだけじゃないの？
めたん：速い空気の流れが、液体を引き込むの。
ずんだもん：空気が液体を連れてくるのだ？
めたん：そう。圧が下がる場所へ液体が上がるの。
ずんだもん：ホースと霧吹きが仲間なんだ。
めたん：細い口、速い流れ、圧の変化がセットね。
ずんだもん：家の道具、急に賢く見える。
めたん：ただし速い流れには弱点もあるわ。
ずんだもん：え、物理に副作用あるの？

- ミニオチ／小結論：速い流れは周りを引き込む

### s10: 速すぎる流れは泡も作る
- scene_goal：ベンチュリ効果から圧力低下の補足（キャビテーション）
- scene_format：失敗エピソード型
- hook_type：損失型
- viewer_question：泡まで出る？
- viewer_misunderstanding：速い流れは便利なだけ
- boke_or_reaction：ずんだもん「ボクのお風呂でも起きるの？」L3
- reaction_level：L3
- number_or_example：船のスクリュー周辺で水が気化する例
- target_dialogue_count：9
- depth_round：1
- mini_punchline：めたん「便利な流れにも損失がある」
- main_content：スクリュー周辺の小さな気泡
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：圧力低下の補足視覚化
- image_insert_point：line 1 直後
- asset_path：assets/s10_main.png
- visual_asset_plan：
  - slot：main
  - purpose：速い流れで気泡が生じる補足視覚
  - insert_timing：scene 序盤
  - asset_path：assets/s10_main.png
  - imagegen_prompt：フラット、白背景。船のスクリュー周辺に小さな気泡が発生する図。色は青系。16:9。文字なし。
  - audit_points：実在船舶ブランド禁止。危険な実験描写なし。文字なし。
- reference_style：N/A
- reference_beat：item-4-impact
- curiosity_gap：泡まで出る？
- evidence_role：船プロペラの補足例
- next_reason：最後は空を見る

めたん：圧が下がりすぎると、水に泡が生まれることもあるの。
ずんだもん：泡まで？ボクのお風呂でも起きるのだ？
めたん：お風呂の規模では、ほぼ起きないわ。
ずんだもん：よかった、入浴が無事だった。
めたん：船のスクリューでは金属を傷めることがあるの。
ずんだもん：速い流れ、便利だけど怖いね。
めたん：これはキャビテーションと呼ばれる損失現象よ。
ずんだもん：4つ目の裏側まで見えた。
めたん：では最後、空と地面の話に行くわよ。

- ミニオチ／小結論：圧力低下は便利さだけでなく損失も生む

### s11: 雲ない夜が一番寒くなる理由
めたん：5つ目は放射冷却よ。
ずんだもん：これも知らない、難しそう。
めたん：地面の熱が宇宙へ逃げる現象よ。
ずんだもん：宇宙へ？でも雲があるじゃん。
めたん：雲は布団なの。雲があると逃げにくい。
ずんだもん：雲は寒さのバリアじゃないのだ？
めたん：逆ね。晴れた夜のほうが冷えるの。
ずんだもん：布団も宇宙へ熱逃げるの？
めたん：布団は逃さないのよ。ありがたいわね。
ずんだもん：めたん、今日めっちゃ詳しい。

- ミニオチ／小結論：雲は布団、晴れる夜は冷える

### s12: 日常の見え方が変わる
- scene_goal：まとめ＋最終行動2アクション以上＋締め
- scene_format：まとめ再フック型
- hook_type：行動型
- viewer_question：今日何をする？
- viewer_misunderstanding：知っても日常は変わらない
- boke_or_reaction：ずんだもん「全部に名前があるのだ」L2
- reaction_level：L2
- number_or_example：「思い出す」「1つ選ぶ」「翌日観察」（3アクション）
- target_dialogue_count：14
- depth_round：1
- mini_punchline：めたん「気づく目線こそ得るもの」
- main_content：5アイコン横並び、1つに丸印
- sub_content：—
- subtitle_area：bar 字幕
- title_area：章タイトル
- visual_role：行動視覚化
- image_insert_point：line 1 直後
- asset_path：assets/s12_main.png
- visual_asset_plan：
  - slot：main
  - purpose：1個選ぶ視覚化
  - insert_timing：scene 序盤
  - asset_path：assets/s12_main.png
  - imagegen_prompt：フラット、白背景。5円形アイコン横並び、1つに緑の丸印。色は緑強調。16:9。文字なし。
  - audit_points：実在UI禁止。文字なし。
- reference_style：N/A
- reference_beat：summary
- curiosity_gap：今すぐ何する？
- evidence_role：3ステップ行動
- next_reason：（締め）

めたん：5つの現象、まとめましょう。
ずんだもん：全部に名前があるのだ。
めたん：気づく目線こそが、得るものよ。
ずんだもん：今日からどうすればいい？
めたん：まず今日触った1つを思い出す。
ずんだもん：シャワーかストローかな。
めたん：次に、気になる現象を1つ選ぶ。
ずんだもん：ボクはコアンダ効果がいい。
めたん：そして明日もう一度観察するの。
ずんだもん：3手ならすぐできそうだね。
めたん：コメントでは、気づいた現象を1つ教えてね。
ずんだもん：みんなの発見も見たいのだ。
めたん：今日の動画はここまでよ。最後までご視聴ありがとう。
ずんだもん：高評価とチャンネル登録、よろしくなのだ。

- ミニオチ／小結論：思い出す＋選ぶ＋翌日観察 = 3アクション

## 3. 変更しなかった箇所
- 維持した理由：シーン数、会話量、中盤再フック、Scene04の白板main運用、s02/s03/s06/s07の論旨と素材計画は基準を満たしていたため、語尾以外の構成は維持した。

## 4. 修正後ジャンル適合スコア
| 観点 | 点数 | 判定 | コメント |
|---|---:|---|---|
| 冒頭フック | 14/15 | OK | RM名混入を削り、シャワーあるあるを維持 |
| ボケ→ツッコミのリズム | 18/20 | OK | 全シーンで誤解訂正またはボケ返しあり |
| リアクション強度 | 14/15 | OK | L3以上が複数あり、発見の山も残る |
| 数字・具体性 | 9/10 | OK | 1日何十回、何メートル、3手順などを維持 |
| 章タイトルのフック力 | 9/10 | OK | s09/s10を本文整合のある題に変更 |
| 例え話・小ネタ | 9/10 | OK | 宇宙、布団、お風呂ネタを維持 |
| キャラ立ち | 9/10 | OK | ずんだもん語尾を自然範囲へ圧縮 |
| シーン形式のバリエーション | 10/10 | OK | 9種類を維持 |

## 5. 修正後尺・密度チェック
| 項目 | 基準 | 結果 | 判定 |
|---|---|---|---|
| 本編シーン数 | 想定尺に対して十分 | 12 | OK |
| 本編セリフ数 | 想定尺に対して十分 | 112 | OK |
| 1シーン平均 | 5分前後なら8以上 | 9.33 | OK |
| 中盤再フック | あり | s07、58% | OK |
| メタ水増し | なし | 本文会話量十分 | OK |

## 6. 修正後セルフチェック
- Blocking Issues 解消：YES
- ボケ→ツッコミ、または誤解→訂正が各シーンにある：YES
- 視聴者代表キャラが質問係で終わっていない：YES
- L3以上のリアクションが2回以上ある：YES
- 数字・具体例・あるあるが各本編シーンにある：YES
- 章タイトルがフック型：YES
- 口癖の偏りなし：YES
- ZMの場合「なのだ」「のだ」率20〜40%目安：YES
- 想定尺に対して本文量が十分：YES
- 5分前後の場合90セリフ以上：YES
- 中盤再フックあり：YES
- 最終行動が2アクション以上：YES
- 章タイトルがテーマから浮いていない：YES
- 不自然な日本語が残っていない：YES
- 軽微な改善余地を検討した：YES（s04の揚力説明は動画内ではさらに短くしてもよい）
- 解説役の独演なし：YES
- 25文字以内：YES
- テンプレート枠適合：YES
- visual_asset_plan 維持：YES
- imagegen_prompt 具体性：YES
- 判定：PASS
