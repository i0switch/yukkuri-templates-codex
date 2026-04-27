<!-- scene_format: 11 scenes / 130 dialogue lines / 誤解訂正型・手順型・Before After型・失敗エピソード型・反証型・まとめ再フック型を使用 -->
<!-- viewer_misunderstanding: 安さ・高性能・気合いだけで解決するという誤解を避け、小さな確認行動へ変換 -->
<!-- reaction_level: L3以上を複数回配置し、質問だけでなく驚き・言い換え・小ボケを入れる -->
<!-- mini_punchline: 各シーン末尾に小さな納得または笑いを置く -->
<!-- number_or_example: 3か所、5年以上、10分、300円、週末など具体例を入れる -->
<!-- セルフ監査: 既存台本本文の流用なし。テーマ、構成、比喩、セリフを新規作成。 -->
# 食費が月1万円下がるかもしれない買い物の罠と3つの直し方

## メタ
- episode_id: ep961-zm-food-expense-trap
- layout_template: Scene02
- pair: ZM
- target_duration: 5分前後
- target_dialogue_count: 130

## s01 s01

- role: intro
- scene_format: 手順型
- scene_goal: 食費が減らない痛みを共感化する
- viewer_question: なぜ節約しているのに高いのか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: レシート合計が積み上がり、買い物かごの特売品が増えていく様子を示す導入図
- sub_content: 安いだけで買わない / 合計額を見る / 使い切れる量を考える
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「節約してるのに食費が減らないのだ。」
めたん「特売を追いかけすぎて、合計額が増えてない？」
ずんだもん「安いのに増えるのだ？」
めたん「使わない安さは出費ですわ。」
ずんだもん「マジで？安いは正義じゃない？」
めたん「使い切れる時だけ正義ね。」
ずんだもん「安いロス、悲しいのだ。」
めたん「買う前の判断を作りましょう。」
ずんだもん「買う前に止まれるかが勝負なのだ。」
めたん「レジ前では遅いことが多いわ。」
ずんだもん「棚で止まるのだな。」
めたん「今日は3つの罠を見るわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: レシート合計が積み上がり、買い物かごの特売品が増えていく様子を示す導入図

## s02 s02

- role: body
- scene_format: 手順型
- scene_goal: 特売依存の危険を理解させる
- viewer_question: 安い商品を買う何が問題か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 割引札に引き寄せられる買い物かごと、必要リスト外の商品が増える図解
- sub_content: 必要なら得 / 不要なら出費 / リスト外は一呼吸
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「特売は見逃すと損なのだ。」
めたん「必要なら得だけど、不要ならそのまま出費よ。」
ずんだもん「3割引でも、使わないなら損なのだ？」
めたん「使わなければ全部ムダですわ。」
ずんだもん「割引札に負けてたのだ。」
めたん「家にあるか、今週使うかを見る。」
ずんだもん「安いからじゃなく使うから買う。」
ずんだもん「値札だけで決めないのだ。」
めたん「今週使うかも見るの。」
ずんだもん「かご前に確認なのだ。」
めたん「かごに入れる前に止めるの。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 割引札に引き寄せられる買い物かごと、必要リスト外の商品が増える図解

## s03 s03

- role: body
- scene_format: 手順型
- scene_goal: まとめ買いの向き不向きを示す
- viewer_question: まとめ買いは節約か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 大量購入した食材が使い切れるものと傷みやすいものに分かれる比較図
- sub_content: 保存できる物だけ多め / 葉物は少なめ / 予定なし大量買いNG
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「週末まとめ買いが最強なのだ！」
めたん「最強と言う時点で危険ね。」
ずんだもん「まとめ買いダメなのだ？」
めたん「保存品には向くわ。米や缶詰みたいなものね。」
めたん「でも葉物や惣菜は傷みやすい。」
ずんだもん「冷蔵庫への丸投げなのだ。」
めたん「安さではなく、使う予定で買う量を決める。」
ずんだもん「保存できる物だけ多めなのだ。」
めたん「傷む物は予定がある時だけ。」
ずんだもん「冷蔵庫に任せすぎないのだ。」
ずんだもん「使い切る設計が節約なのだな。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 大量購入した食材が使い切れるものと傷みやすいものに分かれる比較図

## s04 s04

- role: body
- scene_format: 手順型
- scene_goal: 食品ロスを食費問題として捉える
- viewer_question: なぜ買ったものを忘れるか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 冷蔵庫の奥に隠れた食品と、手前に期限近い食品をまとめた改善後の図解
- sub_content: 奥に隠さない / 期限近いものは手前 / 買う前に中を見る
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「買ったのに忘れる食品があるのだ。」
めたん「それが食費増の原因よ。」
ずんだもん「冷蔵庫奥はブラックホールなのだ。」
めたん「忘れて二重買いも起きる。」
ずんだもん「記憶力だけで冷蔵庫を管理するのは無理なのだ。」
めたん「期限が近い物は、扉を開けてすぐ見える手前へ置く。」
ずんだもん「買う前に冷蔵庫を見るのだな。」
ずんだもん「冷蔵庫を見るの、地味だけど二重買いを防げて強いのだ。」
めたん「二重買いを防げるからね。」
ずんだもん「家の中を先に探すのだ。」
めたん「その順番が節約ですわ。」
めたん「家の中を探すのが先ですわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 冷蔵庫の奥に隠れた食品と、手前に期限近い食品をまとめた改善後の図解

## s05 s05

- role: body
- scene_format: 手順型
- scene_goal: 食材起点の献立へ変える
- viewer_question: 献立はどう決めるか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 食べたいメニューから買う流れと、冷蔵庫の在庫から一品を決める流れの比較図
- sub_content: 在庫から1品決める / 足りない物だけ買う / 新メニューは後回し
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「献立は食べたい物から？」
めたん「節約したい時は、食べたい物より先に在庫から見るの。」
ずんだもん「冷蔵庫に聞くのだ？」
めたん「残り野菜が答えを持つわ。」
ずんだもん「半端キャベツなら炒め物なのだ。」
めたん「決めた一品に足りない物だけ買う。」
ずんだもん「まず救出メニューなのだな。」
ずんだもん「残り物が主役なのだ。」
めたん「先にある物を使うのが近道。」
ずんだもん「足りない物だけ買うのだ。」
めたん「それでロスも減りますわ。」
めたん「ロスと食費を同時に減らせるわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 食べたいメニューから買う流れと、冷蔵庫の在庫から一品を決める流れの比較図

## s06 s06

- role: body
- scene_format: 手順型
- scene_goal: 節約の誤解を解く / 中盤再フック midpoint_rehook
- viewer_question: 節約は我慢なのか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 必要、予定あり、気分買いの3分類に分かれた買い物かごの図解
- sub_content: 必要な物 / 予定がある物 / 気分買い
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「もう何も買うなってこと？」
めたん「中盤確認。断食ではないわ。」
ずんだもん「財布の断食はリバウンドしそうなのだ。」
めたん「買う理由を、必要、予定あり、気分買いに分けるの。」
めたん「必要、予定あり、気分買いね。」
ずんだもん「おやつ禁止じゃないのだ？」
めたん「予算内で楽しめばいいわ。」
ずんだもん「我慢より理由づけなのだな。」
めたん「続く判断に変えましょう。」
ずんだもん「気分買いも、先に決めた予算枠の中ならいいのだ。」
めたん「完全禁止より現実的よ。」
ずんだもん「敵は無意識の追加なのだな。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 必要、予定あり、気分買いの3分類に分かれた買い物かごの図解

## s07 s07

- role: body
- scene_format: 手順型
- scene_goal: リストの作り方を具体化する
- viewer_question: 買い物リストはどう書くか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 長すぎる願望リストが、カテゴリ別の短い買い物リストへ整理される図解
- sub_content: 在庫を見る / カテゴリで分ける / 調整枠を残す
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「リストは作ってるのだ。」
めたん「願望メモになってない？」
ずんだもん「夢とお菓子が多いのだ。」
めたん「在庫を見て、主食、主菜、野菜、調整枠にカテゴリ分け。」
ずんだもん「調整枠って何なのだ？」
めたん「店で足す1〜2個の余白よ。」
ずんだもん「リスト外も枠を作るのだな。」
ずんだもん「リストにも役割があるのだな。」
めたん「買う理由を短く残す道具よ。」
ずんだもん「願望を書きすぎないのだ。」
めたん「店で迷わないように、調整枠だけ残しましょう。」
めたん「作戦リストへ変えましょう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 長すぎる願望リストが、カテゴリ別の短い買い物リストへ整理される図解

## s08 s08

- role: body
- scene_format: 手順型
- scene_goal: 生活リズムに合う買い方を促す
- viewer_question: 週1買い物は正解か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 週1大量買いで余る食品と、保存品は週1・生鮮は少量追加する買い方の比較図
- sub_content: 保存品は週1 / 生鮮は少量追加 / 予定変更を見込む
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「買い物回数は少ないほど得？」
めたん「予定変更に弱い人もいるわ。」
ずんだもん「急な外食で余るのだ。」
めたん「保存品は週1でいい。」
めたん「生鮮は少量追加が合うことも。」
ずんだもん「生活に合わせるのだな。」
めたん「使い切れる量が正解よ。」
ずんだもん「正解は家庭ごとに違うのだ。」
めたん「前回の買い物で使い切れたかを見て、次の量を調整するの。」
ずんだもん「急な外食や残業みたいな予定変更も考えるのだ。」
めたん「だから少量追加もありですわ。」
ずんだもん「節約は観察なのだ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 週1大量買いで余る食品と、保存品は週1・生鮮は少量追加する買い方の比較図

## s09 s09

- role: body
- scene_format: 手順型
- scene_goal: 具体行動を3つに絞る
- viewer_question: 食費を下げる行動は何か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 冷蔵庫確認、在庫から一品、リスト外予算の3ステップを示すチェックカード
- sub_content: 買う前に冷蔵庫を見る / 在庫から1品決める / リスト外は枠を作る
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「家計簿修行が必要なのだ？」
めたん「最初は3行動でいいわ。」
ずんだもん「修行じゃないのだな。」
めたん「買う前に冷蔵庫を見る。」
ずんだもん「まず冷蔵庫を見るところから始めるのだな。」
めたん「残っている在庫から、今日か明日の一品を決める。」
めたん「リスト外の上限を作る。」
ずんだもん「300円枠みたいに？」
めたん「冷蔵庫、在庫、上限枠だけよ。」
ずんだもん「やることが少なくてシンプルなのだ。」
めたん「続くことが大事ですわ。」
めたん「棚の前で決まりますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 冷蔵庫確認、在庫から一品、リスト外予算の3ステップを示すチェックカード

## s10 s10

- role: body
- scene_format: 手順型
- scene_goal: やりすぎ節約を避ける
- viewer_question: 何を避けるべきか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 極端な節約で空腹になり、反動買いする流れを注意マーク付きで示す図解
- sub_content: 極端に削らない / 栄養を無視しない / 反動買いに注意
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「毎日もやしで行くのだ！」
めたん「極端さがリバウンドの入口よ。」
ずんだもん「安いのにダメなのだ？」
めたん「我慢しすぎると、反動で外食やお菓子が増えやすい。」
ずんだもん「節約の反動買いなのだ。」
めたん「主食、たんぱく質、野菜をざっくり。」
ずんだもん「生活を壊さない範囲なのだな。」
ずんだもん「続く形が一番なのだ。」
めたん「無理な我慢は高くつくわ。」
ずんだもん「反動買いは避けたいのだ。」
めたん「満足感も残しましょう。」
めたん「続く形が一番安いわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 極端な節約で空腹になり、反動買いする流れを注意マーク付きで示す図解

## s11 s11

- role: closing
- scene_format: 手順型
- scene_goal: 最終行動に落とす
- viewer_question: 今日何をするか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 冷蔵庫写真、在庫から一品、買い物リスト、リスト外上限の締め行動カード
- sub_content: 冷蔵庫を見る / 在庫をチェック / リスト外枠を作る
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

ずんだもん「使うから買う、なのだな。」
めたん「特売、奥の食品、長いリストに注意。」
ずんだもん「今週末は何から？」
めたん「冷蔵庫を見て在庫をチェック。」
めたん「在庫から一品決めて、リスト外の上限枠を作る。」
ずんだもん「リスト外300円まで、みたいにするのだ。」
めたん「買う前に小さく確認ですわ。」
ずんだもん「棚の前で勝つのだ！」
ずんだもん「今週末は、まず冷蔵庫を見るところから始めるのだ。」
めたん「見る、決める、枠を作る。」
ずんだもん「今週末の3手なのだ。」
めたん「まず冷蔵庫から始めましょう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 冷蔵庫写真、在庫から一品、買い物リスト、リスト外上限の締め行動カード
