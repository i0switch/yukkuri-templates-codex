# 台本完成版 RM

## メタ
- episode_id: ep970-rm-cashless-autocharge-trap
- layout_template: Scene02
- pair: RM
- target_duration: 5分程度
- target_dialogue_count: 120
- theme: キャッシュレスのオートチャージと少額決済で月末にお金が消える罠

## s01: 8,000円が静かに消える
- role: intro
- scene_format: あるある型
- scene_goal: オートチャージと少額決済の痛みを自分ごと化する
- viewer_question: 小さい支払いなら影響は小さい
- viewer_misunderstanding: 小さい支払いなら影響は小さい
- reaction_level: L3
- number_or_example: 8,000円、毎月、1回
- main_content: スマホ残高の急減と小さな決済が積み上がる図
- sub_content: 残高が減る原因を分ける / オートチャージを疑う / 少額決済を束で見る / 今日1回だけ確認
- image_insert_point: scene main
- mini_punchline: 残高が静かに消える

霊夢「オートチャージで、今月の残高が8,000円消えてたわ。」
魔理沙「毎月、ついタッチする人ほど見落とすやつだぜ。」
霊夢「今日はその小さい支払いを一回見える化するのね。」
魔理沙「そうだ。犯人は大きな買い物だけじゃない。」
霊夢「コンビニのコーヒーが忍者だったってこと？」
魔理沙「忍者より静かに残高を削るんだぜ。」
霊夢「マジで！？節約してるつもりだったのに。」
魔理沙「だから最初に決済の通り道を見る。」
霊夢「家計簿より先に通り道ね。」
魔理沙「見る場所は3つだけでいい。」
霊夢「それなら今夜できそう。」
魔理沙「放置しない入口を作るんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 小さい支払いが大きな損失に見えるため

## s02: オートチャージの見えない請求
- role: body
- scene_format: 誤解訂正型
- scene_goal: 自動補充は便利だが支出感覚を薄くすることを示す
- viewer_question: 自動で足されるなら安心
- viewer_misunderstanding: 自動で足されるなら安心
- reaction_level: L2
- number_or_example: 3,000円、5,000円、月2回
- main_content: 自動補充ONと通知ONの比較画面風図
- sub_content: 設定金額を確認 / 発動条件を見る / 月の回数を数える / 通知の有無を見る
- image_insert_point: scene main
- mini_punchline: 自動補充は見えにくい

霊夢「自動で足されるなら安心でしょ。」
魔理沙「そこが落とし穴だ。」
霊夢「え、足りない時に助けてくれるんじゃない？」
魔理沙「3,000円補充が月2回なら6,000円だぜ。」
霊夢「小さい救急車が何台も来てるわ。」
魔理沙「しかも補充は支払いの感覚が薄い。」
霊夢「払った感じがしないのが怖いわね。」
魔理沙「設定金額と発動条件をまず見る。」
霊夢「5,000円以下で発動、みたいな設定ね。」
魔理沙「そう。金額、回数、通知の3点だ。」
霊夢「自動だからこそ手動で確認ね。」
魔理沙「便利は見える場所に置くんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 便利と危険の差を一目で見せるため

## s03: 少額決済の束が重い
- role: body
- scene_format: 失敗エピソード型
- scene_goal: 数百円決済が月合計で大きくなることを理解させる
- viewer_question: 300円くらいならノーカウント
- viewer_misunderstanding: 300円くらいならノーカウント
- reaction_level: L3
- number_or_example: 300円、20回、6,000円
- main_content: 300円決済が20本集まり6,000円になる図
- sub_content: 300円も回数で見る / 週ではなく月で見る / 固定費と混ぜない / レシートなしに注意
- image_insert_point: scene main
- mini_punchline: 300円が束になる

霊夢「300円くらいなら全部ノーカウントでしょ。」
魔理沙「会計からは消えない。」
霊夢「マジで？気持ちだけ無料枠だったわ。」
魔理沙「300円を20回なら6,000円なんだぜ。」
霊夢「ちりつもが急に筋肉質ね。」
魔理沙「少額は1回より月の本数で見る。」
霊夢「毎回は軽いのに、束になると重い。」
魔理沙「レシートが残らない決済ほど危ない。」
霊夢「スマホだけで終わると忘れるわ。」
魔理沙「履歴でカテゴリを一つ作る。」
霊夢「少額決済箱を作る感じね。」
魔理沙「箱に入れると量が見えるんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 少額の束を視覚化するため

## s04: 交通系とコンビニの合わせ技
- role: body
- scene_format: あるある型
- scene_goal: 複数決済の分散で合計が見えない問題を刺す
- viewer_question: 決済手段が分かれていれば管理できている
- viewer_misunderstanding: 決済手段が分かれていれば管理できている
- reaction_level: L2
- number_or_example: 3種類、週5回、月20回
- main_content: 交通系、QR、クレカの3本が同じ出費へ合流する図
- sub_content: 決済手段を並べる / 同じ用途をまとめる / 週5回を月換算 / 一番多い場所を探す
- image_insert_point: scene main
- mini_punchline: 支払い先は別でも財布は同じ

霊夢「決済手段を分ければ管理できるじゃない。」
魔理沙「分けるだけでは見えない。」
霊夢「つまり財布が3つに分身してるの？」
魔理沙「交通系、QR、クレカが同じ食費を削る。」
霊夢「コンビニ支出が三方向から攻めてくるわ。」
魔理沙「週5回なら月20回近い。」
霊夢「1回が軽いと全部別物に見えるのね。」
魔理沙「用途でまとめる。昼食、飲み物、移動だ。」
霊夢「支払い方法じゃなく使い道で見る。」
魔理沙「そこが家計の地図になる。」
霊夢「地図なしで迷子だったわ。」
魔理沙「まず一番多い用途を探すんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 分散した出費の合計を見せるため

## s05: 通知オフが一番危ない
- role: body
- scene_format: 反証型
- scene_goal: 通知を消すと心理的な痛みも消える危険を説明する
- viewer_question: 通知はうるさいから全部消す
- viewer_misunderstanding: 通知はうるさいから全部消す
- reaction_level: L3
- number_or_example: 1秒、1通知、月末
- main_content: 通知オフのスマホと見えない支払いが積もる影
- sub_content: 決済通知は残す / 補充通知も残す / 音は小さくてよい / 月末だけ見ない
- image_insert_point: scene main
- mini_punchline: 静かすぎる支払い

霊夢「通知は全部オフで静かなら最強よ。」
魔理沙「静かすぎるのも危険だ。」
霊夢「マジで！？平和なスマホが裏切るの？」
魔理沙「1通知は支払いのブレーキにもなるんだぜ。」
霊夢「うるさいだけじゃなかったのね。」
魔理沙「特に決済通知と補充通知は残したい。」
霊夢「音は小さくても、存在だけでいいわね。」
魔理沙「いい。見た瞬間に回数を思い出す。」
霊夢「月末にまとめて見るより痛みが小さいわ。」
魔理沙「その小さい痛みが使いすぎを止める。」
霊夢「通知は敵じゃなく監視員ね。」
魔理沙「決済だけは見えるようにするんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 通知を切る怖さを伝えるため

## s06: 犯人は支払いではなく回数
- role: body
- scene_format: まとめ再フック型
- scene_goal: 中盤で犯人を金額から回数へ反転させる
- viewer_question: 高い買い物だけ見ればいい
- viewer_misunderstanding: 高い買い物だけ見ればいい
- reaction_level: L4
- number_or_example: 100円、50回、5,000円
- main_content: 高額1回より少額50回が重くなる天秤
- sub_content: 金額より回数を見る / 100円も50回で重い / 用途別に回数を数える / 犯人は習慣か確認
- image_insert_point: scene main
- mini_punchline: 犯人は回数
- reference_beat: midpoint_rehook: 中盤再フック。犯人は金額ではなく回数だとひっくり返す

霊夢「高い買い物だけ疑えばいいでしょ。」
魔理沙「実は犯人は回数だ。」
霊夢「それは詰む。100円も逃げられないじゃない。」
魔理沙「100円を50回なら5,000円なんだぜ。」
霊夢「小銭の軍団、普通に強いわ。」
魔理沙「高額は記憶に残る。少額は習慣に隠れる。」
霊夢「記憶にない出費が一番怖い。」
魔理沙「だから用途別に回数を数える。」
霊夢「飲み物、移動、お菓子、アプリ課金ね。」
魔理沙「多い場所が削る候補になる。」
霊夢「犯人探しが急に現実的。」
魔理沙「金額より先に回数を見るんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 誤解をひっくり返す中盤の山場のため

## s07: チャージ上限は安全柵
- role: body
- scene_format: 手順型
- scene_goal: 上限設定で被害を止める具体策へ進める
- viewer_question: 上限を下げると不便になる
- viewer_misunderstanding: 上限を下げると不便になる
- reaction_level: L2
- number_or_example: 1日、1週間、5,000円
- main_content: チャージ上限を安全柵として置く手順カード
- sub_content: 1日の上限を見る / 週の上限を決める / 自動補充を低めにする / 困る場面だけ例外
- image_insert_point: scene main
- mini_punchline: 上限は安全柵

霊夢「上限を下げると不便じゃない？」
魔理沙「不便ではなく安全柵だ。」
霊夢「つまり財布にガードレールを付けるのね。」
魔理沙「1日、1週間、1回の上限を見るんだぜ。」
霊夢「いきなり全部止めなくていいのね。」
魔理沙「まず週5,000円みたいに仮で決める。」
霊夢「足りなければ理由を見て変える。」
魔理沙「そう。困る場面だけ例外にする。」
霊夢「雑に広げるとまた消えるわ。」
魔理沙「上限は生活に合わせて小さく始める。」
霊夢「小さく締めて、必要なら少し開く。」
魔理沙「それが続く設定だぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 行動に移せる設定変更を見せるため

## s08: 履歴を見る日は固定する
- role: body
- scene_format: 手順型
- scene_goal: 週1回の履歴確認で自動支出を早く発見する
- viewer_question: 月末にまとめて見ればいい
- viewer_misunderstanding: 月末にまとめて見ればいい
- reaction_level: L2
- number_or_example: 週1回、5分、3項目
- main_content: 週1回5分の履歴確認チェックカード
- sub_content: 週1回だけ見る / 5分で終える / 補充回数を見る / 上位3用途だけ残す
- image_insert_point: scene main
- mini_punchline: 週1回5分

霊夢「月末にまとめて見ればいいじゃない。」
魔理沙「月末だと手遅れになりやすい。」
霊夢「え、反省会だけ立派になるやつ？」
魔理沙「週1回、5分でいいんだぜ。」
霊夢「5分なら歯磨きの延長ね。」
魔理沙「見るのは補充回数、少額決済、上位3用途。」
霊夢「全部を完璧に分類しないのね。」
魔理沙「完璧より早く気づくことが大事だ。」
霊夢「月末の絶望より週末の軽傷。」
魔理沙「いい言い方だな。軽傷で止める。」
霊夢「日曜夜に見る枠を作るわ。」
魔理沙「固定すると忘れにくいぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 習慣化の負担を小さく見せるため

## s09: やめる順番を間違えない
- role: body
- scene_format: Before / After型
- scene_goal: 突然全部やめずに影響が少ないところから止める
- viewer_question: 怖いから全部止める
- viewer_misunderstanding: 怖いから全部止める
- reaction_level: L3
- number_or_example: 3段階、1週間、1つ
- main_content: 全部停止の混乱と段階停止の安定を比べる図
- sub_content: 全部止めない / まず通知を残す / 次に上限を下げる / 最後に自動補充を見直す
- image_insert_point: scene main
- mini_punchline: 止め方にも順番

霊夢「怖いから全部止めれば最強じゃない。」
魔理沙「極端すぎる。」
霊夢「マジで！？止めてもダメなの？」
魔理沙「必要な支払いまで止まると生活が詰む。」
霊夢「改札で詰んだら悲しすぎるわ。」
魔理沙「まず通知を残す。次に上限を下げる。」
霊夢「最後に自動補充を見直す。」
魔理沙「1週間に1つずつ変えると原因も分かる。」
霊夢「全部同時だと何が効いたか不明ね。」
魔理沙「家計改善も実験と同じだ。」
霊夢「焦って全消ししないわ。」
魔理沙「順番を守れば戻しやすいんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 極端な対策で挫折しないため

## s10: 今日やるのは通知と上限
- role: cta
- scene_format: まとめ再フック型
- scene_goal: 今日の一手とコメント誘導で締める
- viewer_question: 結局なにからやるか曖昧
- viewer_misunderstanding: 結局なにからやるか曖昧
- reaction_level: L2
- number_or_example: 今日、1回、5分
- main_content: 通知ON、上限確認、確認日の3つを並べた行動カード
- sub_content: 決済通知をON / チャージ上限を確認 / 週1回の確認日を決める / コメントは一番多い決済
- image_insert_point: scene main
- mini_punchline: 今日5分で見る

霊夢「つまり放置が一番まずいのね。」
魔理沙「そう。小さい支払いほど静かに増える。」
霊夢「今日やるなら一つだけでいい？」
魔理沙「決済通知をONにして上限を見る。」
霊夢「5分でできる現実的なやつね。」
魔理沙「余裕があれば週1回の確認日も決める。」
霊夢「日曜夜に残高チェック、これで行くわ。」
魔理沙「コメントで一番使ってる決済も教えてくれ。」
霊夢「交通系、QR、クレカ、どれが多いか気になるわ。」
魔理沙「多い場所が次の見直し候補だぜ。」
霊夢「まずスマホの通知から確認するわ。」
魔理沙「今日の一回が月末の後悔を減らすんだぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 最後の行動を迷わず実行させるため

## セルフ監査
- scene_format: 全sceneに記載
- viewer_misunderstanding: 全sceneに記載
- reaction_level: L3以上を複数配置
- number_or_example: 全sceneに数字または具体例を配置
- mini_punchline: 全sceneに配置
- 解説役3連続なし: PASS
- 最終行動: PASS
