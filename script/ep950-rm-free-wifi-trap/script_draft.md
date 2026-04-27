# 台本ドラフト RM

## メタ
- episode_id: ep950-rm-free-wifi-trap
- layout_template: Scene01
- pair: RM
- target_duration: 5分想定
- target_dialogue_count: 100
- sub_policy: Scene01 のため全シーン sub: null

## s01: その無料Wi-Fi、入口が違うかも
- role: 冒頭フック
- scene_format: 失敗エピソード型
- scene_goal: 無料Wi-Fiの便利さより先に、損失リスクを刺す
- viewer_question: カフェやホテルのWi-Fiは店名っぽければ安全なのか
- viewer_misunderstanding: 店名入りSSIDなら本物で安全
- reaction_level: L3
- number_or_example: 1回のログインからメール、通販、SNSへ波及
- main_content: 偽Wi-Fiとログイン画面の罠
- sub_content: null
- image_insert_point: カフェの席でスマホに似たSSIDが表示される瞬間
- mini_punchline: 無料の玄関マットでも、踏む前に靴底を見る

霊夢「魔理沙、カフェの無料Wi-Fiって、つないだら得した気分になるよね」
魔理沙「得した気分のままログインすると、損する入口を踏むことがあるぜ」
霊夢「え、コーヒーより高いWi-Fi代を払う展開？」
魔理沙「違う。パスワードやカード情報を盗まれると、被害は数千円どころじゃない」
霊夢「マジで！？店名っぽいWi-Fiなら安全だと思ってた」
魔理沙「そこが罠だぜ。店名に似せた偽Wi-Fiは、見た目だけならそれっぽく作れる」
霊夢「じゃあ私、無料の玄関マットに土足で飛び込んでたかも」
魔理沙「その例えは変だが、踏む前に確認する感覚は合ってる」
霊夢「今日は無料Wi-Fiの見分け方ってこと？」
魔理沙「見分け方だけじゃない。危ない使い方をやめて、安全な逃がし方まで作るぜ」

visual_asset_plan:
  - slot: main
    purpose: カフェの無料Wi-Fiに接続する直前の不安を示す
    adoption_reason: 冒頭で損失と日常感を同時に出せる

## s02: 鍵マークは安全保証じゃない
- role: 誤解訂正
- scene_format: 誤解訂正型
- scene_goal: 鍵付きWi-Fiと安全保証を分ける
- viewer_question: 鍵マークがあれば暗号化されて安全ではないのか
- viewer_misunderstanding: 鍵付きなら何をしても安心
- reaction_level: L2
- number_or_example: 店内の全員が同じパスワードを知っている
- main_content: 共有パスワードの限界
- sub_content: null
- image_insert_point: 鍵マーク付きWi-Fiを選ぶスマホ画面
- mini_punchline: 鍵はあるが、合鍵を持つ人が多い

霊夢「でも鍵マークが付いてるWi-Fiなら、守られてるってことじゃないの？」
魔理沙「鍵があるのと、全部が安全なのは別だぜ」
霊夢「え、鍵マークって安心シールじゃないの？」
魔理沙「共有パスワードの場合、店内の客みんなが同じ鍵を持ってる状態なんだ」
霊夢「合鍵を配りまくった家みたいで、急に怖いわね」
魔理沙「そう。通信自体が一定守られても、接続先や入力先を間違えたら意味がない」
霊夢「つまり、鍵付きでも偽サイトに入ったらアウト？」
魔理沙「その通り。Wi-Fiの鍵は万能バリアじゃなく、入口の一部にすぎないぜ」
霊夢「鍵マークだけでドヤ顔してた私、ちょっと恥ずかしい」
魔理沙「恥ずかしがるより、今日から見る場所を増やせばいい」

visual_asset_plan:
  - slot: main
    purpose: 鍵マークに安心しきる誤解を視覚化する
    adoption_reason: 鍵マークだけでは足りないという結論が伝わる

## s03: 似た名前の入口が一番怖い
- role: 偽SSIDの説明
- scene_format: あるある型
- scene_goal: SSIDの見た目だけで選ばない癖を作る
- viewer_question: 店名っぽいWi-Fiが複数ある時にどうするのか
- viewer_misunderstanding: 電波が強いSSIDを選べば正解
- reaction_level: L3
- number_or_example: Cafe_Free / Cafe_Free_5G / Cafe-Free のような紛らわしさ
- main_content: 偽SSIDのあるある
- sub_content: null
- image_insert_point: 似たSSIDが3つ並ぶスマホ画面
- mini_punchline: 一番元気な偽物もいる

霊夢「Wi-Fi一覧に店名っぽいのが3つ出たら、一番電波強いやつでいいよね？」
魔理沙「待て待て霊夢、一番元気な偽物もいるぜ」
霊夢「元気な偽物って何よ。Wi-Fi界のなりすまし店員？」
魔理沙「そんな感じだ。Cafe_Free、Cafe_Free_5G、Cafe-Freeみたいに似せられる」
霊夢「マジで！？ハイフン違いとか、絶対ぼんやり押すじゃん」
魔理沙「だから店内の掲示、スタッフ、公式案内でSSIDを確認する」
霊夢「Wi-Fi名を聞くの、ちょっと恥ずかしくない？」
魔理沙「パスワードを盗まれるよりはずっと安い恥だぜ」
霊夢「たしかに。見栄で偽Wi-Fiに入るの、損すぎる」
魔理沙「迷ったら使わない。これも立派な防御だ」

visual_asset_plan:
  - slot: main
    purpose: 似たSSIDが並ぶ混乱と危険を示す
    adoption_reason: 視聴者の実体験に近いあるあるとして刺さる

## s04: Wi-Fi上で入れる情報が本体
- role: 入力情報の危険整理
- scene_format: 反証型
- scene_goal: 無料Wi-Fiで避けるべき入力を具体化する
- viewer_question: HTTPSなら買い物やログインも平気ではないのか
- viewer_misunderstanding: きれいな画面なら入力していい
- reaction_level: L3
- number_or_example: パスワード、認証コード、カード情報、本人確認書類
- main_content: 入力フォーム前で止まる判断
- sub_content: null
- image_insert_point: ログインフォームを前に手が止まる瞬間
- mini_punchline: 見た目が高級ホテルでも入口が裏口なら危ない

霊夢「でも最近のサイトってHTTPSって出るし、買い物くらい大丈夫じゃない？」
魔理沙「HTTPSは大事だけど、偽の入口で本物の情報を入れたら終わりだぜ」
霊夢「本物の情報って、パスワードとか？」
魔理沙「そう。パスワード、認証コード、カード情報、本人確認書類。この4つは特に重い」
霊夢「マジで！？認証コードって数字だけなのに？」
魔理沙「数字だけでも、一回きりの鍵だ。渡したら本人確認を突破されることがある」
霊夢「きれいなログイン画面だと、つい信用しちゃうんだよね」
魔理沙「見た目じゃなく、今どの回線で、どの入口から開いたかを見るんだぜ」
霊夢「無料Wi-Fi中は、重要な入力をしないのが基本？」
魔理沙「基本はそれ。必要ならモバイル回線に切り替えてから入力する」

visual_asset_plan:
  - slot: main
    purpose: 重要情報入力前に止まる必要を表す
    adoption_reason: 被害の中心が入力行動だと伝わる

## s05: 本当の犯人は自動接続
- role: 中盤再フック
- scene_format: Before / After型
- scene_goal: 自分で選んだつもりがない接続リスクを刺す
- viewer_question: 自分で選ばなければ危なくないのか
- viewer_misunderstanding: Wi-Fiは手動で選んだ時だけつながる
- reaction_level: L4
- number_or_example: 駅、ホテル、空港、カフェで過去接続が残る
- main_content: 自動接続と履歴削除
- sub_content: null
- image_insert_point: 自動接続がオンの設定画面
- mini_punchline: スマホが勝手に無料の玄関マットへ走る

霊夢「じゃあ私が慎重に選べばいいんでしょ。押さなければ勝ち」
魔理沙「中盤の落とし穴はそこだ。スマホが勝手につなぐことがある」
霊夢「それは詰む。私よりスマホのほうが行動力あるじゃん」
魔理沙「過去につないだ駅、ホテル、空港、カフェのWi-Fiが自動接続になることがある」
霊夢「マジで！？知らない間に無料の玄関マットへ走ってるの？」
魔理沙「そうだぜ。特に旅行先や仕事先で、気づいたらWi-Fi表示になってるケースはある」
霊夢「私、節約のためにWi-Fiオン固定してた」
魔理沙「節約はいいが、自動接続は見直せ。使わないWi-Fiは削除、接続前に確認だ」
霊夢「過去の便利設定が、未来の罠になるのね」
魔理沙「その通り。無料Wi-Fi対策は、つなぐ瞬間より前の設定が勝負なんだぜ」

visual_asset_plan:
  - slot: main
    purpose: 中盤で自動接続という新しい危険を提示する
    adoption_reason: 視聴者が自分の設定を確認したくなる

## s06: 買い物と銀行はモバイル回線へ逃がす
- role: 安全な使い分け
- scene_format: 手順型
- scene_goal: 無料Wi-Fiでやること、やらないことを分ける
- viewer_question: VPNがあれば全部Wi-Fiで済ませてよいのか
- viewer_misunderstanding: VPNを入れれば銀行も買い物も安全
- reaction_level: L2
- number_or_example: 読み物はWi-Fi、決済は4G/5G
- main_content: 用途別の回線切り替え
- sub_content: null
- image_insert_point: Wi-Fiとモバイル回線を選ぶ分岐
- mini_punchline: 重要作業だけ有料道路に乗せる

霊夢「VPNを入れれば全部解決って聞いたことあるんだけど」
魔理沙「VPNは役立つが、万能免罪符じゃないぜ」
霊夢「免罪符じゃないの？じゃあ高級なお守り？」
魔理沙「近いけど、お守りを持ってても危ない店には入らないだろ」
霊夢「たしかに。じゃあ無料Wi-Fiで何ならしていいの？」
魔理沙「ニュースを見る、地図を見る、動画を見るくらいなら比較的リスクは低い」
霊夢「買い物、銀行、仕事のログインは？」
魔理沙「そこはモバイル回線へ逃がす。4Gや5Gに切り替えてからやるのが安全だぜ」
霊夢「重要作業だけ有料道路に乗せる感じね」
魔理沙「そう。全部を怖がるより、危ない作業を分けるのが現実的だ」

visual_asset_plan:
  - slot: main
    purpose: 用途ごとに回線を分ける判断を見せる
    adoption_reason: 対策を怖さではなく行動に落とせる

## s07: 同じパスワードは一枚倒れると全部倒れる
- role: 使い回しリスク
- scene_format: 失敗エピソード型
- scene_goal: 無料Wi-Fi被害が別サービスへ広がる理由を説明する
- viewer_question: 1サイトのパスワードが漏れても、そのサイトだけではないのか
- viewer_misunderstanding: 同じパスワードでも覚えやすければ便利
- reaction_level: L3
- number_or_example: メール、通販、SNSで同じパスワード
- main_content: アカウント連鎖被害
- sub_content: null
- image_insert_point: アカウントのドミノ倒し
- mini_punchline: 覚えやすさは犯人にも優しい

霊夢「正直、パスワードって全部同じにしたくなるのよ。覚えやすいし」
魔理沙「覚えやすさは、犯人にも優しいんだぜ」
霊夢「うわ、言い方が刺さる」
魔理沙「無料Wi-Fi経由でどこかのログイン情報を取られた時、使い回しだと他も試される」
霊夢「メール、通販、SNSが同じパスワードだったら？」
魔理沙「一枚倒れると全部倒れる。特にメールを取られると、再設定メールまで狙われる」
霊夢「マジで！？メールって親玉じゃん」
魔理沙「そうだ。だから重要サービスだけでも別パスワード、できればパスワード管理アプリを使う」
霊夢「全部いきなり変えるのは無理でも、メールと決済からならできそう」
魔理沙「それでいい。被害が広がる道を先に切るんだぜ」

visual_asset_plan:
  - slot: main
    purpose: 使い回しパスワードの連鎖被害を表現する
    adoption_reason: 単なる注意喚起ではなく損失の広がりが見える

## s08: 共有と近距離設定も入口になる
- role: 端末設定の確認
- scene_format: 誤解訂正型
- scene_goal: Wi-Fi接続中に端末側の共有設定も見直す
- viewer_question: スマホだけなら共有設定は関係ないのか
- viewer_misunderstanding: 公共Wi-Fiで危ないのは通信だけ
- reaction_level: L2
- number_or_example: ファイル共有、AirDrop、近距離共有、プリンタ共有
- main_content: 公共ネットワーク時の共有OFF
- sub_content: null
- image_insert_point: 端末の共有設定をオフにする場面
- mini_punchline: 玄関だけ閉めて窓を開けるな

霊夢「Wi-Fiの話って、通信だけ見ればいいんじゃないの？」
魔理沙「通信だけじゃない。端末の共有設定も見ておきたいぜ」
霊夢「共有設定？私のスマホ、勝手におすそ分けしてるの？」
魔理沙「設定次第だな。ファイル共有、AirDrop、近距離共有、プリンタ共有みたいな入口がある」
霊夢「そんなに入口あるの？小さな商店街じゃん」
魔理沙「公共の場所では、知らない人に見える設定を減らすのが基本だ」
霊夢「家では便利でも、外では閉めるってことね」
魔理沙「そうだぜ。家のWi-Fiと、カフェのWi-Fiは同じ扱いにしない」
霊夢「玄関だけ閉めて窓全開、みたいなのは避けたい」
魔理沙「その感覚でいい。外では共有を絞る、これも地味に効く」

visual_asset_plan:
  - slot: main
    purpose: 公共Wi-Fi時に端末設定を切り替える必要を示す
    adoption_reason: 通信以外の見落としを補える

## s09: 押した後の初動で被害を減らす
- role: 入力後のリカバリー
- scene_format: 手順型
- scene_goal: もし入力した後でも行動できるようにする
- viewer_question: 入力したらもう終わりなのか
- viewer_misunderstanding: やらかしたら隠して祈るしかない
- reaction_level: L4
- number_or_example: 10分以内のパスワード変更、カード停止、強制ログアウト
- main_content: 被害を広げない初動
- sub_content: null
- image_insert_point: 緊急対応リストを見る手元
- mini_punchline: 祈るより先に切断

霊夢「もし無料Wi-Fiでパスワード入れちゃったら、もう終わり？」
魔理沙「終わりじゃない。初動が早いほど被害を減らせるぜ」
霊夢「まず何するの？スマホを冷蔵庫に封印？」
魔理沙「封印するな。まずモバイル回線に切り替えて、該当サービスのパスワードを変える」
霊夢「カード情報を入れた場合は？」
魔理沙「カード会社へ連絡、利用停止や再発行を相談。認証コードを渡したなら公式サポートへ連絡だ」
霊夢「それは詰む前に動くやつね。10分以内にやりたい」
魔理沙「そう。時間、接続したWi-Fi名、入力した内容、届いたメールも記録する」
霊夢「証拠を消したくなるけど、説明材料として残すのか」
魔理沙「その通り。祈るより先に切断、変更、連絡だぜ」

visual_asset_plan:
  - slot: main
    purpose: 入力後でも取れる初動を見せる
    adoption_reason: 不安を煽るだけで終わらせず行動につなげる

## s10: 今日消すのは不安じゃなく自動接続
- role: 行動締め
- scene_format: まとめ再フック型
- scene_goal: 今日やる最小アクションに落とす
- viewer_question: 対策が多すぎて何からやればいいのか
- viewer_misunderstanding: 全部完璧にしないと意味がない
- reaction_level: L2
- number_or_example: 自動接続OFF、重要ログインはモバイル回線、2段階認証
- main_content: 最小3アクション
- sub_content: null
- image_insert_point: スマホ設定の最終チェック
- mini_punchline: 無料の玄関マットは踏む前に見る

霊夢「無料Wi-Fi、怖すぎてもう外でスマホを開けないかも」
魔理沙「そこまで怖がらなくていい。使い方を分ければいいんだぜ」
霊夢「今日やることを1個に絞るなら？」
魔理沙「まず自動接続を確認。使わない公共Wi-Fiは削除する」
霊夢「2個目は、銀行や買い物はモバイル回線へ逃がす」
魔理沙「いいな。3個目は、メールと決済のパスワード使い回しをやめて、2段階認証を入れる」
霊夢「全部を完璧にじゃなく、被害が大きい場所から閉めるのね」
魔理沙「その通り。無料Wi-Fiは敵じゃないが、入口を間違えると危ない」
霊夢「無料の玄関マットは、踏む前に靴底を見る」
魔理沙「変な締めだが覚えやすい。今日、設定の自動接続だけでも確認してくれだぜ」

visual_asset_plan:
  - slot: main
    purpose: 視聴後すぐ設定確認する行動へつなげる
    adoption_reason: 最終アクションが明確になる

## セルフ監査
- シーン数: 10
- セリフ数: 100
- 5分条件: 90〜110セリフ内、10シーンでOK
- Scene01: sub_content は全シーン null 方針でOK
- 霊夢の役割: 質問だけでなく、勘違い、怖がり、ボケ、ツッコミを配置
- 魔理沙3連続: なし
- 各シーンの具体補強: 数字、具体例、失敗例、あるある、比較を各シーンに配置
- 画像生成プロンプト/YAML: 未作成
