# 台本ドラフト RM

## メタ
- episode_id: ep952-rm-browser-extension-permission-trap
- title: ブラウザ拡張を入れすぎる前に見る権限の罠
- layout_template: Scene02
- pair: RM
- target_duration: 5分程度
- target_dialogue_count: 110
- scene_format: 全シーンに記録
- viewer_misunderstanding: 全シーンに記録
- reaction_level: L3以上を複数回
- mini_punchline: 各シーン末尾付近に配置
- number_or_example: 各シーンに具体例を配置

## s01: 便利な拡張が全部見てる
- role: intro
- scene_format: 誤解訂正型
- scene_goal: 拡張機能の権限放置リスクを冒頭で刺す
- viewer_question: 便利な拡張を入れるだけで何が危ないのか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L3
- number_or_example: ブラウザ画面の上に複数の拡張アイコンが浮かび、閲覧データの流れが警告色で可視化される図解
- main_content: ブラウザ画面の上に複数の拡張アイコンが浮かび、閲覧データの流れが警告色で可視化される図解
- sub_content: 全サイト権限を見る / 使わない拡張を消す / 月1回だけ棚卸し
- image_insert_point: main
- mini_punchline: まず管理画面を開くわ。

霊夢「便利そうな拡張を入れたら最強ね。」
魔理沙「その最強、何でも見る店員かもだぜ。」
霊夢「え、ただの小さいアイコンでしょ？」
魔理沙「開いたページに触れる権限があるんだ。」
霊夢「買い物画面も見えるの？」
魔理沙「全サイト権限なら可能性はあるぜ。」
霊夢「マジで！？家計簿を覗かれる感じ？」
魔理沙「だから今日は消す基準を決める。」
霊夢「アイコンが多いほど強いと思ってたわ。」
魔理沙「まず権限を開いて確認するんだぜ。」
霊夢「まず管理画面を開くわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ブラウザ画面の上に複数の拡張アイコンが浮かび、閲覧データの流れが警告色で可視化される図解

## s02: 全サイト権限は強すぎる
- role: body
- scene_format: 失敗エピソード型
- scene_goal: 権限名を読む重要性を理解させる
- viewer_question: 権限の何を見れば危険度が分かるのか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: 特定サイトだけに鍵が開く許可と、全サイトに大きな扉が開く許可を対比した図解
- main_content: 特定サイトだけに鍵が開く許可と、全サイトに大きな扉が開く許可を対比した図解
- sub_content: 全サイトは慎重に / 必要な時だけ許可 / 権限名を読む
- image_insert_point: main
- mini_punchline: 全サイトって出たら止まるわ。

霊夢「権限って長い表示のやつよね。」
魔理沙「そこに危険度が出るんだぜ。」
霊夢「いつも読まずに許可してた。」
魔理沙「特に全サイトのデータ読み取りは強い。」
霊夢「言葉の圧がすごいわね。」
魔理沙「家の鍵を広く渡すようなものだ。」
霊夢「私、鍵を配りすぎてたかも。」
魔理沙「必要なら特定サイトだけに寄せる。」
霊夢「機能より先に権限を見るのね。」
魔理沙「広い権限ほど慎重に見るんだぜ。」
霊夢「全サイトって出たら止まるわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 特定サイトだけに鍵が開く許可と、全サイトに大きな扉が開く許可を対比した図解

## s03: 使ってない拡張が一番危ない
- role: body
- scene_format: あるある型
- scene_goal: 未使用拡張の放置がリスクになると示す
- viewer_question: 使っていないなら害はないのではないか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: ほこりをかぶった古い拡張アイコンが、裏側で警告マーク付きの通信をしている概念図
- main_content: ほこりをかぶった古い拡張アイコンが、裏側で警告マーク付きの通信をしている概念図
- sub_content: 最終使用日を思い出す / 用途不明は削除 / 必要なら再インストール
- image_insert_point: main
- mini_punchline: 放置アイコンを減らすわ。

霊夢「使ってない拡張なら害はないでしょ？」
魔理沙「権限だけ残るのが危ないんだぜ。」
霊夢「働かないのに鍵だけ持つ人ね。」
魔理沙「古い拡張は中身が変わることもある。」
霊夢「昔のクーポン拡張が別人に？」
魔理沙「ありえる。更新停止や買収もある。」
霊夢「必要ならまた入れればいいか。」
魔理沙「用途を言えないものは削除でいい。」
霊夢「まず放置アイコンを減らすわ。」
魔理沙「使わない拡張は消すのが早いぜ。」
霊夢「放置アイコンを減らすわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ほこりをかぶった古い拡張アイコンが、裏側で警告マーク付きの通信をしている概念図

## s04: レビュー数だけでは守れない
- role: body
- scene_format: 反証型
- scene_goal: 人気やレビューだけに頼る危険を説明する
- viewer_question: レビューが多い拡張なら安全ではないのか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L3
- number_or_example: 星評価の高い拡張カードの横で、権限リストだけ赤く増えている比較図
- main_content: 星評価の高い拡張カードの横で、権限リストだけ赤く増えている比較図
- sub_content: レビュー日付を見る / 更新履歴を見る / 権限増加を見る
- image_insert_point: main
- mini_punchline: 星だけで信じないわ。

霊夢「レビューが多ければ安全じゃない？」
魔理沙「参考にはなるが証明ではないぜ。」
霊夢「星が多くても？」
魔理沙「レビューが古いこともある。」
霊夢「更新後に権限が増えたら怖いわ。」
魔理沙「理由が説明されているか見るんだ。」
霊夢「人気より今の状態を見るのね。」
魔理沙「ここで一度見直そう。権限と更新日だぜ。」
霊夢「昔の星だけで信じないわ。」
魔理沙「人気より今の権限を見るんだぜ。」
霊夢「星だけで信じないわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 星評価の高い拡張カードの横で、権限リストだけ赤く増えている比較図

## s05: 公式っぽい名前に注意
- role: body
- scene_format: 誤解訂正型
- scene_goal: 名前や見た目の紛らわしさに注意させる
- viewer_question: 公式風なら安心してよいか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: 公式風の名前札を付けた拡張アイコンと、本物確認のチェック項目を並べた図解
- main_content: 公式風の名前札を付けた拡張アイコンと、本物確認のチェック項目を並べた図解
- sub_content: 提供元を確認 / 公式サイトから辿る / 名前だけで判断しない
- image_insert_point: main
- mini_punchline: 名前だけで判断しないわ。

霊夢「公式っぽい名前なら本物でしょ？」
魔理沙「名前だけでは分からないんだぜ。」
霊夢「サポートって書いてあると安心する。」
魔理沙「まず提供元を見る。」
霊夢「検索結果から入れるだけじゃ弱い？」
魔理沙「公式サイトから辿る方が安全だ。」
霊夢「制服っぽい知らない人みたい。」
魔理沙「経路と提供元で確認する。」
霊夢「名前だけで判断しないわ。」
魔理沙「提供元まで見るのが大事だぜ。」
霊夢「名前だけで判断しないわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 公式風の名前札を付けた拡張アイコンと、本物確認のチェック項目を並べた図解

## s06: ログイン中のサイトが狙われる
- role: body
- scene_format: Before / After型
- scene_goal: ログイン済みセッションと拡張の関係を説明する
- viewer_question: パスワードを入れなければ安全ではないか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L3
- number_or_example: ログイン済みのタブ群と、拡張アイコンから伸びる注意線を示すセキュリティ図解
- main_content: ログイン済みのタブ群と、拡張アイコンから伸びる注意線を示すセキュリティ図解
- sub_content: ログイン中タブに注意 / 不要時は無効化 / 重要作業は最小構成
- image_insert_point: main
- mini_punchline: 大事な作業前に見直すわ。

霊夢「パスワードを打たなければ平気？」
魔理沙「ログイン中の画面も重要だぜ。」
霊夢「メールやSNSのタブも？」
魔理沙「管理画面やクラウド資料も含む。」
霊夢「画面自体を見られたら困るわ。」
魔理沙「重要作業では不要拡張を無効化する。」
霊夢「ブラウザを軽装にする感じね。」
魔理沙「そう。最小構成が安全だ。」
霊夢「大事な作業前に見直すわ。」
魔理沙「重要作業前は軽装にするんだぜ。」
霊夢「大事な作業前に見直すわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ログイン済みのタブ群と、拡張アイコンから伸びる注意線を示すセキュリティ図解

## s07: 通知が増えたら一度疑う
- role: body
- scene_format: あるある型
- scene_goal: 異変のサインを具体化する
- viewer_question: 何が起きたら削除判断すべきか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: ブラウザに突然増えた通知、広告、検索結果のズレを警告カードで整理した図解
- main_content: ブラウザに突然増えた通知、広告、検索結果のズレを警告カードで整理した図解
- sub_content: 広告増加 / 検索結果の変化 / 勝手な通知
- image_insert_point: main
- mini_punchline: 変な通知が出たら疑うわ。

霊夢「危ない拡張って見た目で分かる？」
魔理沙「完全には無理だがサインはあるぜ。」
霊夢「例えば？」
魔理沙「広告増加、通知、検索結果の変化だ。」
霊夢「ブラウザの機嫌かと思ってた。」
魔理沙「最近入れた拡張から疑う。」
霊夢「一つずつ無効化して比べるのね。」
魔理沙「別ブラウザで比べるのも手だ。」
霊夢「変化が出たら棚卸しするわ。」
魔理沙「変化が出たら一つずつ止めるんだぜ。」
霊夢「変な通知が出たら疑うわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ブラウザに突然増えた通知、広告、検索結果のズレを警告カードで整理した図解

## s08: 消す前に同期アカウントを確認
- role: body
- scene_format: 手順型
- scene_goal: 削除や同期の注意点を示す
- viewer_question: 消すだけなら何も困らないか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: 複数端末に同期された拡張アイコンが、片方で消しても戻る流れを示す図解
- main_content: 複数端末に同期された拡張アイコンが、片方で消しても戻る流れを示す図解
- sub_content: 同期設定を見る / 全端末で棚卸し / 戻る理由を確認
- image_insert_point: main
- mini_punchline: 全端末で見てみるわ。

霊夢「怪しい拡張は削除で終わり？」
魔理沙「同期設定も見ておくんだぜ。」
霊夢「また便利そうで怖いやつね。」
魔理沙「複数端末に拡張が戻ることがある。」
霊夢「消したのに復活するの？」
魔理沙「同期の結果ならありえる。」
霊夢「全端末で同じ棚卸しが必要ね。」
魔理沙「戻る理由も確認するんだ。」
霊夢「一台だけで安心しないわ。」
魔理沙「同期元も忘れず確認するんだぜ。」
霊夢「全端末で見てみるわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 複数端末に同期された拡張アイコンが、片方で消しても戻る流れを示す図解

## s09: 残す拡張は三つに絞る
- role: body
- scene_format: 手順型
- scene_goal: 残す基準をチェックリスト化する
- viewer_question: どの拡張なら残してよいか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: 残す拡張を「用途」「提供元」「権限」の三つのチェックでふるい分ける図解
- main_content: 残す拡張を「用途」「提供元」「権限」の三つのチェックでふるい分ける図解
- sub_content: 用途を言える / 提供元を確認済み / 権限が妥当
- image_insert_point: main
- mini_punchline: 残す席を決めるわ。

霊夢「全部消せば安全？」
魔理沙「不便すぎる。残す基準を作るぜ。」
霊夢「どんな基準？」
魔理沙「用途、提供元、権限の三つだ。」
霊夢「一つでも怪しければ？」
魔理沙「削除か一週間オフで試す。」
霊夢「困らなければ雰囲気で入れてたのね。」
魔理沙「便利の断捨離だぜ。」
霊夢「残す席を決めるわ。」
魔理沙「三つの基準で残すか決めるんだぜ。」
霊夢「残す席を決めるわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 残す拡張を「用途」「提供元」「権限」の三つのチェックでふるい分ける図解

## s10: 今日やる棚卸し
- role: cta
- scene_format: まとめ再フック型
- scene_goal: 具体行動で終える
- viewer_question: 今すぐ何をすればよいか
- viewer_misunderstanding: 実際より安全だと思い込む
- reaction_level: L2
- number_or_example: ブラウザ拡張の管理画面風チェックリストに、削除、無効化、残すの三分類が並ぶ図解
- main_content: ブラウザ拡張の管理画面風チェックリストに、削除、無効化、残すの三分類が並ぶ図解
- sub_content: 3分だけ見る / 不要は削除 / 強権限は確認
- image_insert_point: main
- mini_punchline: まず一つ無効化するわ。

霊夢「拡張は便利だけど鍵でもあるのね。」
魔理沙「全サイト権限と放置拡張を見るんだぜ。」
霊夢「レビューだけで安心しない。」
魔理沙「更新日と提供元も確認する。」
霊夢「今日やるなら？」
魔理沙「拡張管理を開いて用途不明を無効化だ。」
霊夢「月一回、三分ならできそう。」
魔理沙「残す拡張の権限を見て終わりだ。」
霊夢「まずクーポン拡張を取り調べるわ。」
魔理沙「今日三分だけで十分だぜ。」
霊夢「まず一つ無効化するわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ブラウザ拡張の管理画面風チェックリストに、削除、無効化、残すの三分類が並ぶ図解

## セルフ監査
- scene_format: PASS。複数形式を使用。
- viewer_misunderstanding: PASS。全シーンで視聴者側の誤解を設定。
- reaction_level: PASS。L3以上を複数回配置。
- mini_punchline: PASS。各シーンに軽い比喩や小オチを配置。
- number_or_example: PASS。具体例を使用。
- 解説役3連続なし: PASS。
- 最終行動: PASS。最後に今日やる行動へ落とした。
