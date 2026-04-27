# 台本ドラフト ZM

## メタ
- episode_id: ep971-zm-qr-code-phishing-trap
- layout_template: Scene02
- pair: ZM
- target_duration: 5分程度
- target_dialogue_count: 120
- theme: QRコード決済や宅配通知の偽QRでアカウントとお金を取られる罠

## s01: 貼り替えQRで支払いが消える
- role: intro
- scene_format: あるある型
- scene_goal: QR読み取りの油断を自分ごと化する
- viewer_question: QRは読み取れれば正しい
- viewer_misunderstanding: QRは読み取れれば正しい
- reaction_level: L3
- number_or_example: 1枚、数秒、ログイン
- main_content: 貼り替えられたQRシールを読み取りそうなスマホ
- sub_content: 読み取り前に周囲を見る / 通知リンクを急いで開かない / 公式アプリから確認 / ログイン画面で止まる
- image_insert_point: scene main
- mini_punchline: そのQR、本物？

ずんだもん「宅配のQRを読んだら、危険なログイン画面が出てきたのだ。」
めたん「毎日スマホで読む人ほど、そこで止まるべきですわ。」
ずんだもん「今日は偽QRでお金とアカウントを取られない確認をするのだ。」
めたん「QRは便利だけど、見た目では行き先が読めませんの。」
ずんだもん「黒い四角が全部まじめに見えるのだ。」
めたん「だから読み取った後の画面で判断しますわ。」
ずんだもん「マジで？読み取る前じゃなく後も大事なのだ？」
めたん「前、直後、入力前の3か所で止まるの。」
ずんだもん「3回ブレーキなのだな。」
めたん「急がせる画面ほど疑うべきですわ。」
ずんだもん「ぼく、急げって言われると走るタイプなのだ。」
めたん「そこを今日は止めますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 日常のQRが危険に変わる瞬間を見せるため

## s02: 偽QRは上から貼れる
- role: body
- scene_format: 失敗エピソード型
- scene_goal: 店舗やポスターのQRが貼り替えられる可能性を知る
- viewer_question: 店に貼ってあれば本物
- viewer_misunderstanding: 店に貼ってあれば本物
- reaction_level: L3
- number_or_example: 1枚、数秒、上貼り
- main_content: ポスターのQRに上貼りシールが少し浮いている様子
- sub_content: シールの浮きを見る / 印刷とズレを確認 / 店員に聞く / 読取後のURLを見る
- image_insert_point: scene main
- mini_punchline: 上から貼れる

ずんだもん「店に貼ってあるなら本物でしょなのだ。」
めたん「そこが油断ですわ。」
ずんだもん「え、店の壁まで疑うのだ？」
めたん「QRは上から偽シールを貼れますの。」
ずんだもん「マジで！？悪い工作がアナログなのだ。」
めたん「角が浮く、印刷とズレる、質感が違う。」
ずんだもん「スマホの前に目視チェックなのだな。」
めたん「迷ったら店員に確認するのが早いですわ。」
ずんだもん「聞くの恥ずかしいけど、盗られるよりマシなのだ。」
めたん「支払い前の数秒で守れることがありますの。」
ずんだもん「QRの角を見る癖をつけるのだ。」
めたん「小さい違和感を拾いましょう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 物理的な貼り替えが起きると理解させるため

## s03: 宅配通知の急がせ文句
- role: body
- scene_format: 誤解訂正型
- scene_goal: SMSやメールの偽QRが急がせる心理を使うと示す
- viewer_question: 期限がある通知は急ぐべき
- viewer_misunderstanding: 期限がある通知は急ぐべき
- reaction_level: L2
- number_or_example: 本日中、24時間、再配達
- main_content: 本日中と強調された偽宅配通知と公式アプリの比較
- sub_content: 本日中に注意 / SMS内リンクを押さない / 公式アプリで確認 / 荷物番号を別入力
- image_insert_point: scene main
- mini_punchline: 急がせる通知

ずんだもん「本日中なら急ぐべきでしょ。」
めたん「急がせる時点で警戒ですわ。」
ずんだもん「つまり焦らせるのが罠なのだ？」
めたん「24時間、再配達、保管期限はよく使われますの。」
ずんだもん「宅配っぽい言葉だと信じちゃうのだ。」
めたん「SMS内リンクではなく公式アプリで見る。」
ずんだもん「荷物番号も自分で入れるのだな。」
めたん「リンク先で入れると相手に渡すだけですわ。」
ずんだもん「それ普通にヤバいのだ。」
めたん「急ぐ時ほど、入口を変えるの。」
ずんだもん「通知からじゃなく公式から入るのだ。」
めたん「それだけでかなり避けられますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 急かす文句に反応する危険を見せるため

## s04: URL短縮と変なドメイン
- role: body
- scene_format: 反証型
- scene_goal: 読み取り後のURL確認を習慣化する
- viewer_question: QRならURLは見なくていい
- viewer_misunderstanding: QRならURLは見なくていい
- reaction_level: L2
- number_or_example: 1秒、短縮URL、公式名
- main_content: 安全そうなQRから怪しいURLへ伸びる矢印
- sub_content: 短縮URLに注意 / 公式名の綴りを見る / 余計な記号を見る / 開く前に止まる
- image_insert_point: scene main
- mini_punchline: QRの中身はURL

ずんだもん「QRならURLを見なくていいでしょ。」
めたん「そこを見ますの。」
ずんだもん「え、黒い四角の正体はURLなのだ？」
めたん「そう。短縮URLや変なドメインは警戒ですわ。」
ずんだもん「公式っぽい名前でも油断するのだ。」
めたん「1文字違い、余計な記号、長すぎる文字列を見る。」
ずんだもん「読むの面倒だけど、開く前の1秒なのだ。」
めたん「その1秒がログイン情報を守るのです。」
ずんだもん「急いで開くほど相手の思うつぼなのだ。」
めたん「URL確認はブレーキですわ。」
ずんだもん「開く前に一呼吸なのだ。」
めたん「怪しければ閉じて公式から入り直すの。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: QRの中身はURLだと理解させるため

## s05: ログイン画面で止まる
- role: body
- scene_format: 手順型
- scene_goal: IDやパスワード入力前に確認する癖を作る
- viewer_question: ログインを求められたら入れる
- viewer_misunderstanding: ログインを求められたら入れる
- reaction_level: L3
- number_or_example: ID、パスワード、認証コード
- main_content: 偽ログイン画面の手前で止まる指
- sub_content: ログイン要求で止まる / 認証コードを入れない / 公式アプリへ戻る / 画面を閉じる勇気
- image_insert_point: scene main
- mini_punchline: 入力前に止まる

ずんだもん「ログインを求められたら入れるしかないでしょ。」
めたん「そこで止まりますわ。」
ずんだもん「マジで？ログイン画面がゴールじゃないのだ？」
めたん「偽サイトの目的はID、パスワード、6桁コードですの。」
ずんだもん「認証コードまで入れたら終わるのだ。」
めたん「コードは鍵です。人に渡してはいけませんわ。」
ずんだもん「画面に言われても渡さないのだな。」
めたん「公式アプリを開き直して確認する。」
ずんだもん「面倒でも閉じる勇気なのだ。」
めたん「閉じても荷物や支払いは逃げませんの。」
ずんだもん「焦りだけが逃げ道を狭くするのだ。」
めたん「入力前に止まる。それが一番強いですわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 入力直前が最大の防衛点だと見せるため

## s06: 犯人はQRではなく入口
- role: body
- scene_format: まとめ再フック型
- scene_goal: 中盤でQR全般を怖がるのでなく入口確認へ再整理する
- viewer_question: QRは全部危険
- viewer_misunderstanding: QRは全部危険
- reaction_level: L4
- number_or_example: 3入口、公式、現物
- main_content: 危険な入口と安全な公式入口の分岐ゲート
- sub_content: QR全部を怖がらない / 入口を確認する / 現物の貼り替えを見る / 公式から入り直す
- image_insert_point: scene main
- mini_punchline: 犯人は入口
- reference_beat: midpoint_rehook: 中盤再フック。QR自体ではなく入口の信頼確認が犯人だと反転する

ずんだもん「もうQRは全部怖いのだ。」
めたん「実は犯人はQRではなく入口ですわ。」
ずんだもん「それは詰む。黒い四角を全部敵にしてたのだ。」
めたん「見るのは3入口。現物、読み取り後URL、入力前ですの。」
ずんだもん「QRそのものより、どこへ入るかを見るのだな。」
めたん「公式から入り直せるなら、そちらを使う。」
ずんだもん「偽QRは入口をすり替える罠なのだ。」
めたん「その理解なら怖がり方が正しくなりますわ。」
ずんだもん「怖がるより、止まる場所を決めるのだ。」
めたん「その通り。止まる場所を3つ持つ。」
ずんだもん「現物、URL、入力前。覚えやすいのだ。」
めたん「そこを越えなければ被害は大きく減りますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 怖がる対象をQRから入口確認へ変えるため

## s07: 支払い前の金額確認
- role: body
- scene_format: 手順型
- scene_goal: QR決済では支払い先と金額を確認する
- viewer_question: 読み取れたら支払い先も正しい
- viewer_misunderstanding: 読み取れたら支払い先も正しい
- reaction_level: L2
- number_or_example: 支払い先、金額、1回
- main_content: 支払い前画面で支払い先と金額を確認するチェック
- sub_content: 支払い先名を見る / 金額を確認 / 店名と照合 / 違和感なら中止
- image_insert_point: scene main
- mini_punchline: 払う前に見る

ずんだもん「読み取れたら支払い先も正しいでしょ。」
めたん「決済前に見ますわ。」
ずんだもん「つまり最後のボタン前が関所なのだ？」
めたん「支払い先名、金額、店名の3つですの。」
ずんだもん「知らない名前なら中止なのだな。」
めたん「金額が違う時も止める。少額でも同じですわ。」
ずんだもん「少額だと見逃しがちなのだ。」
めたん「1回通すと相手を信用しやすくなるの。」
ずんだもん「最初の1回が大事なのだな。」
めたん「決済ボタンは確認後に押すものですわ。」
ずんだもん「勢いで押さないのだ。」
めたん「支払い先と金額を声に出すくらいでいいわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 決済前に止まる具体行動を示すため

## s08: スクショ保存で証拠を残す
- role: body
- scene_format: 手順型
- scene_goal: 不審時のスクショと連絡先確認を促す
- viewer_question: 怪しい画面はすぐ消せば終わり
- viewer_misunderstanding: 怪しい画面はすぐ消せば終わり
- reaction_level: L2
- number_or_example: スクショ、日時、連絡先
- main_content: 怪しい画面のスクショと公式窓口へ相談する流れ
- sub_content: 怪しい画面を保存 / 日時を残す / 公式窓口を探す / 画面内番号に電話しない
- image_insert_point: scene main
- mini_punchline: 証拠を残す

ずんだもん「怪しい画面はすぐ消せば終わりなのだ。」
めたん「消す前に残しますわ。」
ずんだもん「え、証拠写真みたいに撮るのだ？」
めたん「スクショ、日時、どこから開いたかを残す。」
ずんだもん「パニックだと忘れそうなのだ。」
めたん「だから支払い前に保存する癖が役立ちますの。」
ずんだもん「連絡先は画面の番号にしがちなのだ。」
めたん「それも罠かもしれない。公式サイトから探すの。」
ずんだもん「罠の中に相談窓口まであるの怖いのだ。」
めたん「閉じて、公式で調べ直す。これが基本ですわ。」
ずんだもん「証拠を残して、公式へ行くのだ。」
めたん「慌てた時ほど順番を固定しますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 被害前後の行動を整理するため

## s09: 読み取らない勇気
- role: body
- scene_format: Before / After型
- scene_goal: 迷ったら読み取らない、別ルートを選ぶ判断を教える
- viewer_question: 読まないと損する
- viewer_misunderstanding: 読まないと損する
- reaction_level: L3
- number_or_example: 1分、公式検索、別ルート
- main_content: 怪しいQRを読む道と公式検索へ戻る道の比較
- sub_content: 迷ったら読まない / 公式検索に切り替え / 店員に確認 / 急ぎほど止まる
- image_insert_point: scene main
- mini_punchline: 読まない勇気

ずんだもん「読まないと損するでしょ。」
めたん「損より被害が大きいですわ。」
ずんだもん「マジで？クーポンより口座が大事なのだ。」
めたん「当たり前ですの。1分かけて公式検索へ切り替える。」
ずんだもん「1分で守れるなら安いのだ。」
めたん「店なら店員に聞く。宅配なら公式アプリ。」
ずんだもん「急いでいる時ほど止まるのだな。」
めたん「急ぎは判断力を削りますわ。」
ずんだもん「焦りは詐欺師の味方なのだ。」
めたん「だから別ルートを持つの。」
ずんだもん「読まない勇気、覚えたのだ。」
めたん「安全確認できないQRは閉じましょう。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 読まない選択が正しい場面を見せるため

## s10: 今日やる3つのブレーキ
- role: cta
- scene_format: まとめ再フック型
- scene_goal: 今日の行動とコメント誘導で締める
- viewer_question: 確認箇所が多くて続かない
- viewer_misunderstanding: 確認箇所が多くて続かない
- reaction_level: L2
- number_or_example: 今日、3つ、1回
- main_content: 現物、URL、入力前の3つのブレーキカード
- sub_content: 現物を見る / URLを見る / 入力前に止まる / コメントは怪しい通知あるある
- image_insert_point: scene main
- mini_punchline: 3つのブレーキ

ずんだもん「まとめると、QR全部を怖がる話じゃないのだな。」
めたん「入口を確認する話ですわ。」
ずんだもん「今日やるなら何からなのだ？」
めたん「現物を見る、URLを見る、入力前に止まる。この3つですの。」
ずんだもん「3つなら覚えられるのだ。」
めたん「宅配通知は公式アプリから確認しましょう。」
ずんだもん「店のQRは角とズレを見るのだ。」
めたん「ログイン画面が出たら閉じて入り直す。」
ずんだもん「コメントで怪しい通知あるあるも教えてほしいのだ。」
めたん「みんなの事例が次の被害防止になりますわ。」
ずんだもん「ぼくは今日から入力前に一回止まるのだ。」
めたん「その一回がアカウントとお金を守りますわ。」

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: 最後に確認ポイントを一枚にまとめるため

## セルフ監査
- scene_format: 全sceneに記載
- viewer_misunderstanding: 全sceneに記載
- reaction_level: L3以上を複数配置
- number_or_example: 全sceneに数字または具体例を配置
- mini_punchline: 全sceneに配置
- 解説役3連続なし: PASS
- 最終行動: PASS
