# Wi-Fiが急に遅くなる本当の理由と今すぐ直せる3つの対処

## メタ
- episode_id: ep960-rm-wifi-slow-fix
- layout_template: Scene02
- pair: RM
- target_duration: 5分前後
- target_dialogue_count: 90

## s01 s01

- role: intro
- scene_format: 手順型
- scene_goal: Wi-Fi遅延の痛みと見る理由を作る
- viewer_question: なぜ急に遅くなるのか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: スマホの速度計測画面風の抽象ビジュアルと、困った表情のない室内ルーター、弱い電波を表す波形
- sub_content: 昼と夜で速度を比べる / 回線だけを犯人にしない / まず家の中を疑う
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「動画が急にカクカクなのよ。」
魔理沙「Wi-Fi遅延あるあるだぜ。」
霊夢「犯人は回線会社でしょ？」
魔理沙「家の中が原因のことも多い。」
霊夢「ルーターの反抗期？」
魔理沙「置き場所、干渉、熱、古さだな。」
霊夢「マジで！？根性じゃないの？」
魔理沙「電波は根性で壁を抜けないぜ。」
魔理沙「まず測って原因を分けよう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: スマホの速度計測画面風の抽象ビジュアルと、困った表情のない室内ルーター、弱い電波を表す波形

## s02 s02

- role: body
- scene_format: 手順型
- scene_goal: ルーター位置の影響を理解させる
- viewer_question: どこに置けばいいか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 部屋の隅や棚の奥で電波が遮られるルーターと、中央付近に移動した改善比較図
- sub_content: 床置きは避ける / 棚の奥に入れない / 金属の近くを避ける
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「ルーターは隅でよくない？」
魔理沙「そこが遅さの入口かもな。」
霊夢「見える場所は生活感が出るわ。」
魔理沙「棚奥だと電波もこもる。」
霊夢「電波の押し入れ暮らしね。」
魔理沙「床、金属、家電裏は避けたい。」
霊夢「うちテレビ台の下だわ。」
魔理沙「まず高く、中央寄りへ出そう。」
魔理沙「無料で試せる改善だぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 部屋の隅や棚の奥で電波が遮られるルーターと、中央付近に移動した改善比較図

## s03 s03

- role: body
- scene_format: 手順型
- scene_goal: 電波の弱い場所を特定する
- viewer_question: 家のどこが弱いか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 家の簡易間取りに電波が強い場所と弱い場所を色分けしたヒートマップ風図解
- sub_content: 玄関付近 / 寝室 / いつも遅い席
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「寝室だけ遅いのよ。」
魔理沙「電波の死角かもしれない。」
霊夢「Wi-Fiにも苦手部屋が？」
魔理沙「壁、水回り、鏡、金属が邪魔する。」
霊夢「寝室、鏡だらけだわ。」
魔理沙「3か所で速度を測ろう。」
霊夢「測るだけで分かる？」
魔理沙「回線か部屋差か切り分けられる。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 家の簡易間取りに電波が強い場所と弱い場所を色分けしたヒートマップ風図解

## s04 s04

- role: body
- scene_format: 手順型
- scene_goal: チャンネル干渉を説明する
- viewer_question: 夜だけ遅い理由は何か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 集合住宅で複数のWi-Fi波形が重なり合い、混雑している様子を抽象化した図解
- sub_content: 夜だけ遅い / 集合住宅で多い / 自動チャンネルを確認
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「夜だけ遅いのは混雑？」
魔理沙「近所の電波干渉もある。」
霊夢「隣のWi-Fiとケンカするの！？」
魔理沙「2.4GHzは特に混みやすい。」
霊夢「電波の満員電車ね。」
魔理沙「管理画面で自動チャンネルを確認。」
霊夢「設定、怖くない？」
魔理沙「変更前にメモすれば戻せる。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 集合住宅で複数のWi-Fi波形が重なり合い、混雑している様子を抽象化した図解

## s05 s05

- role: body
- scene_format: 手順型
- scene_goal: 熱暴走と設置環境を理解させる
- viewer_question: 再起動で直る理由は何か
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 熱がこもった棚の中のルーターと、風通しの良い場所へ移した比較イメージ
- sub_content: 熱い棚に入れない / 布をかぶせない / 通気口を空ける
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「再起動で直る時があるわ。」
魔理沙「熱や処理詰まりの可能性だ。」
霊夢「ルーターも疲れるのね。」
魔理沙「熱がこもると不安定になる。」
霊夢「布をかけてたわ。」
魔理沙「それは通気をふさぐから危険。」
霊夢「ルーターのサウナ禁止ね。」
魔理沙「風通しを確保しよう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 熱がこもった棚の中のルーターと、風通しの良い場所へ移した比較イメージ

## s06 s06

- role: body
- scene_format: 手順型
- scene_goal: 期待値を調整し後半へ引く / 中盤再フック midpoint_rehook
- viewer_question: 対処すれば必ず速くなるか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 契約速度、実測速度、家の中の損失を分けて示すメーター風図解
- sub_content: 契約以上にはならない / 損失を減らすのが目的 / 測定で差を見る
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「全部直せば爆速？」
魔理沙「中盤確認だ。魔法ではない。」
霊夢「宇宙速度は無理？」
魔理沙「契約以上にはならないぜ。」
霊夢「でも止まるのは減る？」
魔理沙「家の中の損失は減らせる。」
霊夢「現実的で助かるわ。」
魔理沙「次は周波数を見よう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 契約速度、実測速度、家の中の損失を分けて示すメーター風図解

## s07 s07

- role: body
- scene_format: 手順型
- scene_goal: 周波数帯の使い分けを説明する
- viewer_question: どちらにつなぐべきか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 5GHzは近距離高速、2.4GHzは遠距離安定として部屋の距離別に示す図解
- sub_content: 近くは5GHz / 遠くは2.4GHz / 壁が多い場所は注意
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「5GHzが常に正義でしょ？」
魔理沙「近いなら強いが壁に弱い。」
霊夢「速いけど近眼なのね。」
魔理沙「遠い部屋は2.4GHzが安定する。」
霊夢「寝室はそっちかも。」
魔理沙「場所ごとに両方試そう。」
霊夢「最高速度だけ見ないのね。」
魔理沙「途切れないことも大事だぜ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 5GHzは近距離高速、2.4GHzは遠距離安定として部屋の距離別に示す図解

## s08 s08

- role: body
- scene_format: 手順型
- scene_goal: ルーターや端末の寿命サインを出す
- viewer_question: 買い替え判断はいつか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 古いルーターのチェック項目、年数、再起動頻度、古い規格を示す診断カード風ビジュアル
- sub_content: 5年以上使っている / 再起動が増えた / 古い規格のまま
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「最後は買い替え？」
魔理沙「すぐではないが古さも見る。」
霊夢「壊れるまで使えば？」
魔理沙「5年以上、再起動頻発はサイン。」
霊夢「うちベテラン箱だわ。」
魔理沙「スマホだけ新しくても詰まる。」
霊夢「順番は無料対策からね。」
魔理沙「それでもダメなら買い替え候補だ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 古いルーターのチェック項目、年数、再起動頻度、古い規格を示す診断カード風ビジュアル

## s09 s09

- role: body
- scene_format: 手順型
- scene_goal: 実践チェックに落とす
- viewer_question: 今すぐ何をするか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: スマホ測定、ルーター移動、通気確認の3ステップを大きく示すチェックリスト
- sub_content: 速度を3か所で測る / ルーターを見通し良く置く / 熱と通気を確認
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「結局何からやるの？」
魔理沙「測る、動かす、熱を見る。」
霊夢「専門家ごっこ不要ね。」
魔理沙「3か所で速度を測る。」
魔理沙「次に棚奥から出す。」
霊夢「最後に熱と通気確認ね。」
魔理沙「改善すれば家の中が原因だ。」
霊夢「怒りの電話は後ね。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: スマホ測定、ルーター移動、通気確認の3ステップを大きく示すチェックリスト

## s10 s10

- role: body
- scene_format: 手順型
- scene_goal: 逆効果の行動を避けさせる
- viewer_question: 何をしてはいけないか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: NGマーク付きで布をかぶせたルーター、適当に置いた中継機、コードだらけの棚を示す注意図
- sub_content: 布で隠さない / 中継機を適当に増やさない / 設定をメモなしで変えない
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「NG行動もある？」
魔理沙「布や箱で隠すのは避ける。」
霊夢「見た目で通信力ダウンね。」
魔理沙「中継機の適当追加も危険。」
霊夢「増やせば勝ちじゃないの！？」
魔理沙「弱い電波を延長するだけもある。」
霊夢「設定変更も一つずつね。」
魔理沙「メモして測る。それが安全だ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: NGマーク付きで布をかぶせたルーター、適当に置いた中継機、コードだらけの棚を示す注意図

## s11 s11

- role: closing
- scene_format: 手順型
- scene_goal: 今日やる一手で締める
- viewer_question: 結局何からやるか
- viewer_misunderstanding: 大きな解決だけで十分だと思い込む
- reaction_level: L2
- number_or_example: 具体例あり
- main_content: 10分タイマー、速度測定、ルーターを棚から出す、通気確認を並べた締めの行動カード
- sub_content: 10分だけ確認 / 棚の奥から出す / 測ってから相談
- image_insert_point: main
- mini_punchline: 短い納得
- セルフ監査: 聞き手が質問だけにならず、解説役が3連続せず、具体例と次への引きを含む。

霊夢「まとめると家の中も見る。」
魔理沙「置き場所、死角、干渉、熱、古さだ。」
霊夢「今日やるなら一つだけ。」
魔理沙「ルーターを棚奥から出す。」
霊夢「前後で速度を測るのね。」
魔理沙「10分で試せて戻せる。」
霊夢「まず押し入れから救出するわ。」
魔理沙「電波の通り道を作ろう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 10分タイマー、速度測定、ルーターを棚から出す、通気確認を並べた締めの行動カード
