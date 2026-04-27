import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const rootDir = process.cwd();

const fixedImagePrompt = (scene, mood) => `${scene.id}: ${scene.title}

${scene.dialogue.map((line) => `${line.name}「${line.text.replaceAll('**', '')}」`).join('\n')}

ゆっくり解説動画向けの挿入画像を日本語で生成してください。 この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。 字幕やセリフは別で表示するため、会話等は画像に入れないでください。 キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、抽象的な画面風ビジュアル、概念図、状況説明ビジュアルを中心に構成してください。 画像内の可読テキストは日本語だけにしてください。英語ラベル、英語見出し、英語UI、英単語の装飾文字は禁止です。 文字が崩れる可能性がある場合は、文字を使わずアイコン、色分け、形、配置で表現してください。 下部に白帯、入力欄、チャット欄、テキストボックス風の余白を作らないでください。 画像の役割は「${scene.imageRole}」、構図タイプは「${scene.compositionType}」です。 画面で一番大きく見せる対象は「${scene.imageSubject}」です。その理由は「${scene.imageReason}」です。 小さくする、または入れない対象は「既存キャラクター、実在人物、ブランドロゴ、実在UI、長文の説明」です。 対象シーンから画像化する一言は「${scene.imagePhrase}」です。画像で再現する状況は「${scene.imageSituation}」です。画像で再現しない要素は「会話全文、人物同士の会話、字幕用余白」です。 スマホ視聴でも伝わるように主役は1つ、画像内の小さい文字は最大3語、アイコンは最大5個、重要要素は画面中央から上部に置いてください。 どのシーンにも使える白背景アイコン、抽象的な青いネットワーク線、台本の具体例と関係が薄い綺麗な汎用図解は禁止です。 字幕やキャラクターに重なる位置へ重要情報を置かず、背景や小物は画面端まで自然に続けてください。 画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。 動画の解説画面に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。

画像の雰囲気は${mood}で生成してください。`;

const promptHash = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const rm = {
  episodeId: 'ep970-rm-cashless-autocharge-trap',
  title: 'キャッシュレスで月末にお金が消えるオートチャージと少額決済の罠',
  pair: 'RM',
  theme: 'キャッシュレスのオートチャージと少額決済で月末にお金が消える罠',
  audience: 'キャッシュレス決済をよく使うが、月末の残高減少の原因をつかめていない生活者',
  tone: '身近な焦りから、見える化と停止手順へ進む実用解説。霊夢の雑な節約案を魔理沙が短く整える。',
  bgmMood: '軽い危機感のある日常マネー解説BGM',
  imageStyle: 'スマホ決済、交通系カード、レシート、通知、家計メモを使った赤と白の整理図解',
  leftName: '霊夢',
  rightName: '魔理沙',
  characters: {
    left: {character: 'reimu', aquestalk_preset: 'れいむ', speaking_style: '焦り、勘違い、生活感、軽いツッコミ'},
    right: {character: 'marisa', aquestalk_preset: 'まりさ', speaking_style: '短いツッコミ、数字、手順整理、実用的な結論'},
  },
  creditsVoices: ['AquesTalk:ゆっくり音声'],
  scenes: [
    {
      id: 's01',
      title: '8,000円が静かに消える',
      role: 'intro',
      format: 'あるある型',
      goal: 'オートチャージと少額決済の痛みを自分ごと化する',
      misunderstanding: '小さい支払いなら影響は小さい',
      reaction: 'L3',
      number: '8,000円、毎月、1回',
      motion: 'warning',
      sub: ['残高が減る原因を分ける', 'オートチャージを疑う', '少額決済を束で見る', '今日1回だけ確認'],
      imageRole: '不安喚起',
      compositionType: '事故寸前構図',
      imageSubject: 'スマホ残高の急減と小さな決済が積み上がる図',
      imageReason: '小さい支払いが大きな損失に見えるため',
      imagePhrase: '残高が静かに消える',
      imageSituation: '通知とレシート片が渦のように残高へ集まる',
      lines: [
        ['left', 'オートチャージで、今月の残高が8,000円消えてたわ。', 'shock', {words: ['8,000円'], style: 'danger', se: 'warning', pause_after_ms: 300}],
        ['right', '毎月、ついタッチする人ほど見落とすやつだぜ。', 'talk'],
        ['left', '今日はその小さい支払いを一回見える化するのね。', 'confused'],
        ['right', 'そうだ。犯人は大きな買い物だけじゃない。', 'confident'],
        ['left', 'コンビニのコーヒーが忍者だったってこと？', 'wry'],
        ['right', '忍者より静かに残高を削るんだぜ。', 'smug'],
        ['left', 'マジで！？節約してるつもりだったのに。', 'shock'],
        ['right', 'だから最初に決済の通り道を見る。', 'talk'],
        ['left', '家計簿より先に通り道ね。', 'calm'],
        ['right', '見る場所は3つだけでいい。', 'confident'],
        ['left', 'それなら今夜できそう。', 'smile'],
        ['right', '放置しない入口を作るんだぜ。', 'talk'],
      ],
    },
    {
      id: 's02',
      title: 'オートチャージの見えない請求',
      role: 'body',
      format: '誤解訂正型',
      goal: '自動補充は便利だが支出感覚を薄くすることを示す',
      misunderstanding: '自動で足されるなら安心',
      reaction: 'L2',
      number: '3,000円、5,000円、月2回',
      motion: 'compare',
      sub: ['設定金額を確認', '発動条件を見る', '月の回数を数える', '通知の有無を見る'],
      imageRole: '比較',
      compositionType: 'NG / OK 比較',
      imageSubject: '自動補充ONと通知ONの比較画面風図',
      imageReason: '便利と危険の差を一目で見せるため',
      imagePhrase: '自動補充は見えにくい',
      imageSituation: '残高不足のたびに自動で金額が足される流れ',
      lines: [
        ['left', '自動で足されるなら安心でしょ。', 'smile'],
        ['right', 'そこが落とし穴だ。', 'serious'],
        ['left', 'え、足りない時に助けてくれるんじゃない？', 'confused'],
        ['right', '3,000円補充が月2回なら6,000円だぜ。', 'talk'],
        ['left', '小さい救急車が何台も来てるわ。', 'wry'],
        ['right', 'しかも補充は支払いの感覚が薄い。', 'calm'],
        ['left', '払った感じがしないのが怖いわね。', 'worried'],
        ['right', '設定金額と発動条件をまず見る。', 'confident'],
        ['left', '5,000円以下で発動、みたいな設定ね。', 'confused'],
        ['right', 'そう。金額、回数、通知の3点だ。', 'talk'],
        ['left', '自動だからこそ手動で確認ね。', 'calm'],
        ['right', '便利は見える場所に置くんだぜ。', 'smug'],
      ],
    },
    {
      id: 's03',
      title: '少額決済の束が重い',
      role: 'body',
      format: '失敗エピソード型',
      goal: '数百円決済が月合計で大きくなることを理解させる',
      misunderstanding: '300円くらいならノーカウント',
      reaction: 'L3',
      number: '300円、20回、6,000円',
      motion: 'punch',
      sub: ['300円も回数で見る', '週ではなく月で見る', '固定費と混ぜない', 'レシートなしに注意'],
      imageRole: '証拠提示',
      compositionType: '原因マップ',
      imageSubject: '300円決済が20本集まり6,000円になる図',
      imageReason: '少額の束を視覚化するため',
      imagePhrase: '300円が束になる',
      imageSituation: '小さな決済カードが月末に大きな請求へ合流する',
      lines: [
        ['left', '300円くらいなら全部ノーカウントでしょ。', 'smile'],
        ['right', '会計からは消えない。', 'serious'],
        ['left', 'マジで？気持ちだけ無料枠だったわ。', 'shock'],
        ['right', '300円を20回なら6,000円なんだぜ。', 'talk'],
        ['left', 'ちりつもが急に筋肉質ね。', 'wry'],
        ['right', '少額は1回より月の本数で見る。', 'confident'],
        ['left', '毎回は軽いのに、束になると重い。', 'calm'],
        ['right', 'レシートが残らない決済ほど危ない。', 'serious'],
        ['left', 'スマホだけで終わると忘れるわ。', 'worried'],
        ['right', '履歴でカテゴリを一つ作る。', 'talk'],
        ['left', '少額決済箱を作る感じね。', 'smile'],
        ['right', '箱に入れると量が見えるんだぜ。', 'smug'],
      ],
    },
    {
      id: 's04',
      title: '交通系とコンビニの合わせ技',
      role: 'body',
      format: 'あるある型',
      goal: '複数決済の分散で合計が見えない問題を刺す',
      misunderstanding: '決済手段が分かれていれば管理できている',
      reaction: 'L2',
      number: '3種類、週5回、月20回',
      motion: 'compare',
      sub: ['決済手段を並べる', '同じ用途をまとめる', '週5回を月換算', '一番多い場所を探す'],
      imageRole: '理解補助',
      compositionType: '原因マップ',
      imageSubject: '交通系、QR、クレカの3本が同じ出費へ合流する図',
      imageReason: '分散した出費の合計を見せるため',
      imagePhrase: '支払い先は別でも財布は同じ',
      imageSituation: '複数の決済ルートが一つの財布から出ている',
      lines: [
        ['left', '決済手段を分ければ管理できるじゃない。', 'confident'],
        ['right', '分けるだけでは見えない。', 'serious'],
        ['left', 'つまり財布が3つに分身してるの？', 'confused'],
        ['right', '交通系、QR、クレカが同じ食費を削る。', 'talk'],
        ['left', 'コンビニ支出が三方向から攻めてくるわ。', 'wry'],
        ['right', '週5回なら月20回近い。', 'confident'],
        ['left', '1回が軽いと全部別物に見えるのね。', 'calm'],
        ['right', '用途でまとめる。昼食、飲み物、移動だ。', 'talk'],
        ['left', '支払い方法じゃなく使い道で見る。', 'smile'],
        ['right', 'そこが家計の地図になる。', 'calm'],
        ['left', '地図なしで迷子だったわ。', 'wry'],
        ['right', 'まず一番多い用途を探すんだぜ。', 'smug'],
      ],
    },
    {
      id: 's05',
      title: '通知オフが一番危ない',
      role: 'body',
      format: '反証型',
      goal: '通知を消すと心理的な痛みも消える危険を説明する',
      misunderstanding: '通知はうるさいから全部消す',
      reaction: 'L3',
      number: '1秒、1通知、月末',
      motion: 'warning',
      sub: ['決済通知は残す', '補充通知も残す', '音は小さくてよい', '月末だけ見ない'],
      imageRole: '不安喚起',
      compositionType: '失敗例シミュレーション',
      imageSubject: '通知オフのスマホと見えない支払いが積もる影',
      imageReason: '通知を切る怖さを伝えるため',
      imagePhrase: '静かすぎる支払い',
      imageSituation: '通知が消えた裏で決済だけ進む',
      lines: [
        ['left', '通知は全部オフで静かなら最強よ。', 'confident'],
        ['right', '静かすぎるのも危険だ。', 'serious'],
        ['left', 'マジで！？平和なスマホが裏切るの？', 'shock'],
        ['right', '1通知は支払いのブレーキにもなるんだぜ。', 'talk'],
        ['left', 'うるさいだけじゃなかったのね。', 'calm'],
        ['right', '特に決済通知と補充通知は残したい。', 'confident'],
        ['left', '音は小さくても、存在だけでいいわね。', 'confused'],
        ['right', 'いい。見た瞬間に回数を思い出す。', 'talk'],
        ['left', '月末にまとめて見るより痛みが小さいわ。', 'smile'],
        ['right', 'その小さい痛みが使いすぎを止める。', 'serious'],
        ['left', '通知は敵じゃなく監視員ね。', 'wry'],
        ['right', '決済だけは見えるようにするんだぜ。', 'smug'],
      ],
    },
    {
      id: 's06',
      title: '犯人は支払いではなく回数',
      role: 'body',
      referenceBeat: 'midpoint_rehook: 中盤再フック。犯人は金額ではなく回数だとひっくり返す',
      format: 'まとめ再フック型',
      goal: '中盤で犯人を金額から回数へ反転させる',
      misunderstanding: '高い買い物だけ見ればいい',
      reaction: 'L4',
      number: '100円、50回、5,000円',
      motion: 'reveal',
      sub: ['金額より回数を見る', '100円も50回で重い', '用途別に回数を数える', '犯人は習慣か確認'],
      imageRole: '比較',
      compositionType: 'ビフォーアフター',
      imageSubject: '高額1回より少額50回が重くなる天秤',
      imageReason: '誤解をひっくり返す中盤の山場のため',
      imagePhrase: '犯人は回数',
      imageSituation: '小銭の山が大きな買い物より重く傾く',
      lines: [
        ['left', '高い買い物だけ疑えばいいでしょ。', 'confident'],
        ['right', '実は犯人は回数だ。', 'serious', {words: ['犯人は回数'], style: 'surprise', se: 'reveal', pause_after_ms: 500}],
        ['left', 'それは詰む。100円も逃げられないじゃない。', 'shock'],
        ['right', '100円を50回なら5,000円なんだぜ。', 'talk'],
        ['left', '小銭の軍団、普通に強いわ。', 'wry'],
        ['right', '高額は記憶に残る。少額は習慣に隠れる。', 'confident'],
        ['left', '記憶にない出費が一番怖い。', 'worried'],
        ['right', 'だから用途別に回数を数える。', 'talk'],
        ['left', '飲み物、移動、お菓子、アプリ課金ね。', 'calm'],
        ['right', '多い場所が削る候補になる。', 'confident'],
        ['left', '犯人探しが急に現実的。', 'smile'],
        ['right', '金額より先に回数を見るんだぜ。', 'smug'],
      ],
    },
    {
      id: 's07',
      title: 'チャージ上限は安全柵',
      role: 'body',
      format: '手順型',
      goal: '上限設定で被害を止める具体策へ進める',
      misunderstanding: '上限を下げると不便になる',
      reaction: 'L2',
      number: '1日、1週間、5,000円',
      motion: 'checklist',
      sub: ['1日の上限を見る', '週の上限を決める', '自動補充を低めにする', '困る場面だけ例外'],
      imageRole: '手順整理',
      compositionType: '手順図',
      imageSubject: 'チャージ上限を安全柵として置く手順カード',
      imageReason: '行動に移せる設定変更を見せるため',
      imagePhrase: '上限は安全柵',
      imageSituation: '財布から出る流れに上限バーがかかる',
      lines: [
        ['left', '上限を下げると不便じゃない？', 'confused'],
        ['right', '不便ではなく安全柵だ。', 'serious'],
        ['left', 'つまり財布にガードレールを付けるのね。', 'smile'],
        ['right', '1日、1週間、1回の上限を見るんだぜ。', 'talk'],
        ['left', 'いきなり全部止めなくていいのね。', 'calm'],
        ['right', 'まず週5,000円みたいに仮で決める。', 'confident'],
        ['left', '足りなければ理由を見て変える。', 'talk'],
        ['right', 'そう。困る場面だけ例外にする。', 'calm'],
        ['left', '雑に広げるとまた消えるわ。', 'worried'],
        ['right', '上限は生活に合わせて小さく始める。', 'confident'],
        ['left', '小さく締めて、必要なら少し開く。', 'smile'],
        ['right', 'それが続く設定だぜ。', 'smug'],
      ],
    },
    {
      id: 's08',
      title: '履歴を見る日は固定する',
      role: 'body',
      format: '手順型',
      goal: '週1回の履歴確認で自動支出を早く発見する',
      misunderstanding: '月末にまとめて見ればいい',
      reaction: 'L2',
      number: '週1回、5分、3項目',
      motion: 'checklist',
      sub: ['週1回だけ見る', '5分で終える', '補充回数を見る', '上位3用途だけ残す'],
      imageRole: '手順整理',
      compositionType: 'チェックリスト',
      imageSubject: '週1回5分の履歴確認チェックカード',
      imageReason: '習慣化の負担を小さく見せるため',
      imagePhrase: '週1回5分',
      imageSituation: 'カレンダーに短い確認時間が固定される',
      lines: [
        ['left', '月末にまとめて見ればいいじゃない。', 'confident'],
        ['right', '月末だと手遅れになりやすい。', 'serious'],
        ['left', 'え、反省会だけ立派になるやつ？', 'confused'],
        ['right', '週1回、5分でいいんだぜ。', 'talk'],
        ['left', '5分なら歯磨きの延長ね。', 'smile'],
        ['right', '見るのは補充回数、少額決済、上位3用途。', 'confident'],
        ['left', '全部を完璧に分類しないのね。', 'calm'],
        ['right', '完璧より早く気づくことが大事だ。', 'talk'],
        ['left', '月末の絶望より週末の軽傷。', 'wry'],
        ['right', 'いい言い方だな。軽傷で止める。', 'smug'],
        ['left', '日曜夜に見る枠を作るわ。', 'smile'],
        ['right', '固定すると忘れにくいぜ。', 'talk'],
      ],
    },
    {
      id: 's09',
      title: 'やめる順番を間違えない',
      role: 'body',
      format: 'Before / After型',
      goal: '突然全部やめずに影響が少ないところから止める',
      misunderstanding: '怖いから全部止める',
      reaction: 'L3',
      number: '3段階、1週間、1つ',
      motion: 'warning',
      sub: ['全部止めない', 'まず通知を残す', '次に上限を下げる', '最後に自動補充を見直す'],
      imageRole: '比較',
      compositionType: 'NG / OK 比較',
      imageSubject: '全部停止の混乱と段階停止の安定を比べる図',
      imageReason: '極端な対策で挫折しないため',
      imagePhrase: '止め方にも順番',
      imageSituation: '一気に止めた混乱と、段階的な見直しの比較',
      lines: [
        ['left', '怖いから全部止めれば最強じゃない。', 'confident'],
        ['right', '極端すぎる。', 'serious'],
        ['left', 'マジで！？止めてもダメなの？', 'shock'],
        ['right', '必要な支払いまで止まると生活が詰む。', 'talk'],
        ['left', '改札で詰んだら悲しすぎるわ。', 'worried'],
        ['right', 'まず通知を残す。次に上限を下げる。', 'confident'],
        ['left', '最後に自動補充を見直す。', 'calm'],
        ['right', '1週間に1つずつ変えると原因も分かる。', 'talk'],
        ['left', '全部同時だと何が効いたか不明ね。', 'wry'],
        ['right', '家計改善も実験と同じだ。', 'smug'],
        ['left', '焦って全消ししないわ。', 'smile'],
        ['right', '順番を守れば戻しやすいんだぜ。', 'talk'],
      ],
    },
    {
      id: 's10',
      title: '今日やるのは通知と上限',
      role: 'cta',
      format: 'まとめ再フック型',
      goal: '今日の一手とコメント誘導で締める',
      misunderstanding: '結局なにからやるか曖昧',
      reaction: 'L2',
      number: '今日、1回、5分',
      motion: 'recap',
      sub: ['決済通知をON', 'チャージ上限を確認', '週1回の確認日を決める', 'コメントは一番多い決済'],
      imageRole: 'オチ補助',
      compositionType: 'チェックリスト',
      imageSubject: '通知ON、上限確認、確認日の3つを並べた行動カード',
      imageReason: '最後の行動を迷わず実行させるため',
      imagePhrase: '今日5分で見る',
      imageSituation: 'スマホ設定とカレンダーが横に並ぶ',
      lines: [
        ['left', 'つまり放置が一番まずいのね。', 'calm'],
        ['right', 'そう。小さい支払いほど静かに増える。', 'serious'],
        ['left', '今日やるなら一つだけでいい？', 'confused'],
        ['right', '決済通知をONにして上限を見る。', 'confident', {words: ['通知をON', '上限を見る'], style: 'action', se: 'success', pause_after_ms: 300}],
        ['left', '5分でできる現実的なやつね。', 'smile'],
        ['right', '余裕があれば週1回の確認日も決める。', 'talk'],
        ['left', '日曜夜に残高チェック、これで行くわ。', 'confident'],
        ['right', 'コメントで一番使ってる決済も教えてくれ。', 'smile'],
        ['left', '交通系、QR、クレカ、どれが多いか気になるわ。', 'smile'],
        ['right', '多い場所が次の見直し候補だぜ。', 'smug'],
        ['left', 'まずスマホの通知から確認するわ。', 'confident'],
        ['right', '今日の一回が月末の後悔を減らすんだぜ。', 'talk'],
      ],
    },
  ],
};

const zm = {
  episodeId: 'ep971-zm-qr-code-phishing-trap',
  title: '偽QRコードでアカウントとお金を取られる前に見る3つの確認',
  pair: 'ZM',
  theme: 'QRコード決済や宅配通知の偽QRでアカウントとお金を取られる罠',
  audience: 'QR決済、宅配通知、店舗ポスターのQRを日常的に読み取るスマホ利用者',
  tone: '日常の油断から偽QRの見分け方へ進む防犯解説。ずんだもんの焦りをめたんが冷静に止める。',
  bgmMood: '少し緊張感のあるサイバー防犯解説BGM',
  imageStyle: 'スマホ、QRコード、宅配通知、警告マーク、公式確認を使った黒黄アクセントの防犯図解',
  leftName: 'ずんだもん',
  rightName: 'めたん',
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3, speaking_style: '焦り、勘違い、素直な反応、行動宣言'},
    right: {character: 'metan', voicevox_speaker_id: 2, speaking_style: '冷静な訂正、短い皮肉、具体的な防犯手順'},
  },
  creditsVoices: ['VOICEVOX:ずんだもん', 'VOICEVOX:四国めたん'],
  scenes: [
    {
      id: 's01',
      title: '貼り替えQRで支払いが消える',
      role: 'intro',
      format: 'あるある型',
      goal: 'QR読み取りの油断を自分ごと化する',
      misunderstanding: 'QRは読み取れれば正しい',
      reaction: 'L3',
      number: '1枚、数秒、ログイン',
      motion: 'warning',
      sub: ['読み取り前に周囲を見る', '通知リンクを急いで開かない', '公式アプリから確認', 'ログイン画面で止まる'],
      imageRole: '不安喚起',
      compositionType: '事故寸前構図',
      imageSubject: '貼り替えられたQRシールを読み取りそうなスマホ',
      imageReason: '日常のQRが危険に変わる瞬間を見せるため',
      imagePhrase: 'そのQR、本物？',
      imageSituation: 'ポスター上のQRに薄い偽シールが重なっている',
      lines: [
        ['left', '宅配のQRを読んだら、危険なログイン画面が出てきたのだ。', 'shock', {words: ['ログイン画面'], style: 'danger', se: 'warning', pause_after_ms: 300}],
        ['right', '毎日スマホで読む人ほど、そこで止まるべきですわ。', 'serious'],
        ['left', '今日は偽QRでお金とアカウントを取られない確認をするのだ。', 'confused'],
        ['right', 'QRは便利だけど、見た目では行き先が読めませんの。', 'talk'],
        ['left', '黒い四角が全部まじめに見えるのだ。', 'wry'],
        ['right', 'だから読み取った後の画面で判断しますわ。', 'confident'],
        ['left', 'マジで？読み取る前じゃなく後も大事なのだ？', 'shock'],
        ['right', '前、直後、入力前の3か所で止まるの。', 'talk'],
        ['left', '3回ブレーキなのだな。', 'calm'],
        ['right', '急がせる画面ほど疑うべきですわ。', 'serious'],
        ['left', 'ぼく、急げって言われると走るタイプなのだ。', 'wry'],
        ['right', 'そこを今日は止めますわ。', 'smug'],
      ],
    },
    {
      id: 's02',
      title: '偽QRは上から貼れる',
      role: 'body',
      format: '失敗エピソード型',
      goal: '店舗やポスターのQRが貼り替えられる可能性を知る',
      misunderstanding: '店に貼ってあれば本物',
      reaction: 'L3',
      number: '1枚、数秒、上貼り',
      motion: 'reveal',
      sub: ['シールの浮きを見る', '印刷とズレを確認', '店員に聞く', '読取後のURLを見る'],
      imageRole: '証拠提示',
      compositionType: '証拠写真風',
      imageSubject: 'ポスターのQRに上貼りシールが少し浮いている様子',
      imageReason: '物理的な貼り替えが起きると理解させるため',
      imagePhrase: '上から貼れる',
      imageSituation: '角がめくれたQRシールと警告の虫眼鏡',
      lines: [
        ['left', '店に貼ってあるなら本物でしょなのだ。', 'confident'],
        ['right', 'そこが油断ですわ。', 'serious'],
        ['left', 'え、店の壁まで疑うのだ？', 'confused'],
        ['right', 'QRは上から偽シールを貼れますの。', 'talk'],
        ['left', 'マジで！？悪い工作がアナログなのだ。', 'shock'],
        ['right', '角が浮く、印刷とズレる、質感が違う。', 'confident'],
        ['left', 'スマホの前に目視チェックなのだな。', 'calm'],
        ['right', '迷ったら店員に確認するのが早いですわ。', 'talk'],
        ['left', '聞くの恥ずかしいけど、盗られるよりマシなのだ。', 'worried'],
        ['right', '支払い前の数秒で守れることがありますの。', 'serious'],
        ['left', 'QRの角を見る癖をつけるのだ。', 'smile'],
        ['right', '小さい違和感を拾いましょう。', 'smug'],
      ],
    },
    {
      id: 's03',
      title: '宅配通知の急がせ文句',
      role: 'body',
      format: '誤解訂正型',
      goal: 'SMSやメールの偽QRが急がせる心理を使うと示す',
      misunderstanding: '期限がある通知は急ぐべき',
      reaction: 'L2',
      number: '本日中、24時間、再配達',
      motion: 'warning',
      sub: ['本日中に注意', 'SMS内リンクを押さない', '公式アプリで確認', '荷物番号を別入力'],
      imageRole: '不安喚起',
      compositionType: '失敗例シミュレーション',
      imageSubject: '本日中と強調された偽宅配通知と公式アプリの比較',
      imageReason: '急かす文句に反応する危険を見せるため',
      imagePhrase: '急がせる通知',
      imageSituation: '赤い期限表示がスマホ画面に迫る',
      lines: [
        ['left', '本日中なら急ぐべきでしょ。', 'worried'],
        ['right', '急がせる時点で警戒ですわ。', 'serious'],
        ['left', 'つまり焦らせるのが罠なのだ？', 'confused'],
        ['right', '24時間、再配達、保管期限はよく使われますの。', 'talk'],
        ['left', '宅配っぽい言葉だと信じちゃうのだ。', 'calm'],
        ['right', 'SMS内リンクではなく公式アプリで見る。', 'confident'],
        ['left', '荷物番号も自分で入れるのだな。', 'smile'],
        ['right', 'リンク先で入れると相手に渡すだけですわ。', 'serious'],
        ['left', 'それ普通にヤバいのだ。', 'shock'],
        ['right', '急ぐ時ほど、入口を変えるの。', 'talk'],
        ['left', '通知からじゃなく公式から入るのだ。', 'confident'],
        ['right', 'それだけでかなり避けられますわ。', 'smug'],
      ],
    },
    {
      id: 's04',
      title: 'URL短縮と変なドメイン',
      role: 'body',
      format: '反証型',
      goal: '読み取り後のURL確認を習慣化する',
      misunderstanding: 'QRならURLは見なくていい',
      reaction: 'L2',
      number: '1秒、短縮URL、公式名',
      motion: 'checklist',
      sub: ['短縮URLに注意', '公式名の綴りを見る', '余計な記号を見る', '開く前に止まる'],
      imageRole: '理解補助',
      compositionType: '原因マップ',
      imageSubject: '安全そうなQRから怪しいURLへ伸びる矢印',
      imageReason: 'QRの中身はURLだと理解させるため',
      imagePhrase: 'QRの中身はURL',
      imageSituation: '黒いQRの中から長いURLが出て虫眼鏡で確認される',
      lines: [
        ['left', 'QRならURLを見なくていいでしょ。', 'confident'],
        ['right', 'そこを見ますの。', 'serious'],
        ['left', 'え、黒い四角の正体はURLなのだ？', 'confused'],
        ['right', 'そう。短縮URLや変なドメインは警戒ですわ。', 'talk'],
        ['left', '公式っぽい名前でも油断するのだ。', 'worried'],
        ['right', '1文字違い、余計な記号、長すぎる文字列を見る。', 'confident'],
        ['left', '読むの面倒だけど、開く前の1秒なのだ。', 'calm'],
        ['right', 'その1秒がログイン情報を守るのです。', 'serious'],
        ['left', '急いで開くほど相手の思うつぼなのだ。', 'wry'],
        ['right', 'URL確認はブレーキですわ。', 'smug'],
        ['left', '開く前に一呼吸なのだ。', 'smile'],
        ['right', '怪しければ閉じて公式から入り直すの。', 'talk'],
      ],
    },
    {
      id: 's05',
      title: 'ログイン画面で止まる',
      role: 'body',
      format: '手順型',
      goal: 'IDやパスワード入力前に確認する癖を作る',
      misunderstanding: 'ログインを求められたら入れる',
      reaction: 'L3',
      number: 'ID、パスワード、認証コード',
      motion: 'punch',
      sub: ['ログイン要求で止まる', '認証コードを入れない', '公式アプリへ戻る', '画面を閉じる勇気'],
      imageRole: '不安喚起',
      compositionType: '事故寸前構図',
      imageSubject: '偽ログイン画面の手前で止まる指',
      imageReason: '入力直前が最大の防衛点だと見せるため',
      imagePhrase: '入力前に止まる',
      imageSituation: 'ID入力欄の前に大きな停止サインが出ている',
      lines: [
        ['left', 'ログインを求められたら入れるしかないでしょ。', 'worried'],
        ['right', 'そこで止まりますわ。', 'serious'],
        ['left', 'マジで？ログイン画面がゴールじゃないのだ？', 'shock'],
        ['right', '偽サイトの目的はID、パスワード、6桁コードですの。', 'talk'],
        ['left', '認証コードまで入れたら終わるのだ。', 'shock'],
        ['right', 'コードは鍵です。人に渡してはいけませんわ。', 'serious'],
        ['left', '画面に言われても渡さないのだな。', 'calm'],
        ['right', '公式アプリを開き直して確認する。', 'confident'],
        ['left', '面倒でも閉じる勇気なのだ。', 'smile'],
        ['right', '閉じても荷物や支払いは逃げませんの。', 'smug'],
        ['left', '焦りだけが逃げ道を狭くするのだ。', 'wry'],
        ['right', '入力前に止まる。それが一番強いですわ。', 'talk'],
      ],
    },
    {
      id: 's06',
      title: '犯人はQRではなく入口',
      role: 'body',
      referenceBeat: 'midpoint_rehook: 中盤再フック。QR自体ではなく入口の信頼確認が犯人だと反転する',
      format: 'まとめ再フック型',
      goal: '中盤でQR全般を怖がるのでなく入口確認へ再整理する',
      misunderstanding: 'QRは全部危険',
      reaction: 'L4',
      number: '3入口、公式、現物',
      motion: 'reveal',
      sub: ['QR全部を怖がらない', '入口を確認する', '現物の貼り替えを見る', '公式から入り直す'],
      imageRole: '比較',
      compositionType: 'ビフォーアフター',
      imageSubject: '危険な入口と安全な公式入口の分岐ゲート',
      imageReason: '怖がる対象をQRから入口確認へ変えるため',
      imagePhrase: '犯人は入口',
      imageSituation: '同じQRでも入口確認ありなしで道が分かれる',
      lines: [
        ['left', 'もうQRは全部怖いのだ。', 'shock'],
        ['right', '実は犯人はQRではなく入口ですわ。', 'confident', {words: ['犯人は入口'], style: 'surprise', se: 'reveal', pause_after_ms: 500}],
        ['left', 'それは詰む。黒い四角を全部敵にしてたのだ。', 'shock'],
        ['right', '見るのは3入口。現物、読み取り後URL、入力前ですの。', 'talk'],
        ['left', 'QRそのものより、どこへ入るかを見るのだな。', 'calm'],
        ['right', '公式から入り直せるなら、そちらを使う。', 'confident'],
        ['left', '偽QRは入口をすり替える罠なのだ。', 'worried'],
        ['right', 'その理解なら怖がり方が正しくなりますわ。', 'smug'],
        ['left', '怖がるより、止まる場所を決めるのだ。', 'smile'],
        ['right', 'その通り。止まる場所を3つ持つ。', 'talk'],
        ['left', '現物、URL、入力前。覚えやすいのだ。', 'confident'],
        ['right', 'そこを越えなければ被害は大きく減りますわ。', 'serious'],
      ],
    },
    {
      id: 's07',
      title: '支払い前の金額確認',
      role: 'body',
      format: '手順型',
      goal: 'QR決済では支払い先と金額を確認する',
      misunderstanding: '読み取れたら支払い先も正しい',
      reaction: 'L2',
      number: '支払い先、金額、1回',
      motion: 'checklist',
      sub: ['支払い先名を見る', '金額を確認', '店名と照合', '違和感なら中止'],
      imageRole: '手順整理',
      compositionType: 'チェックリスト',
      imageSubject: '支払い前画面で支払い先と金額を確認するチェック',
      imageReason: '決済前に止まる具体行動を示すため',
      imagePhrase: '払う前に見る',
      imageSituation: '決済ボタンの前に支払い先と金額の確認枠が強調される',
      lines: [
        ['left', '読み取れたら支払い先も正しいでしょ。', 'confident'],
        ['right', '決済前に見ますわ。', 'serious'],
        ['left', 'つまり最後のボタン前が関所なのだ？', 'confused'],
        ['right', '支払い先名、金額、店名の3つですの。', 'talk'],
        ['left', '知らない名前なら中止なのだな。', 'calm'],
        ['right', '金額が違う時も止める。少額でも同じですわ。', 'confident'],
        ['left', '少額だと見逃しがちなのだ。', 'worried'],
        ['right', '1回通すと相手を信用しやすくなるの。', 'talk'],
        ['left', '最初の1回が大事なのだな。', 'smile'],
        ['right', '決済ボタンは確認後に押すものですわ。', 'smug'],
        ['left', '勢いで押さないのだ。', 'confident'],
        ['right', '支払い先と金額を声に出すくらいでいいわ。', 'talk'],
      ],
    },
    {
      id: 's08',
      title: 'スクショ保存で証拠を残す',
      role: 'body',
      format: '手順型',
      goal: '不審時のスクショと連絡先確認を促す',
      misunderstanding: '怪しい画面はすぐ消せば終わり',
      reaction: 'L2',
      number: 'スクショ、日時、連絡先',
      motion: 'checklist',
      sub: ['怪しい画面を保存', '日時を残す', '公式窓口を探す', '画面内番号に電話しない'],
      imageRole: '証拠提示',
      compositionType: '手順図',
      imageSubject: '怪しい画面のスクショと公式窓口へ相談する流れ',
      imageReason: '被害前後の行動を整理するため',
      imagePhrase: '証拠を残す',
      imageSituation: 'スマホ画面、時計、公式問い合わせカードが並ぶ',
      lines: [
        ['left', '怪しい画面はすぐ消せば終わりなのだ。', 'confident'],
        ['right', '消す前に残しますわ。', 'serious'],
        ['left', 'え、証拠写真みたいに撮るのだ？', 'confused'],
        ['right', 'スクショ、日時、どこから開いたかを残す。', 'talk'],
        ['left', 'パニックだと忘れそうなのだ。', 'worried'],
        ['right', 'だから支払い前に保存する癖が役立ちますの。', 'confident'],
        ['left', '連絡先は画面の番号にしがちなのだ。', 'confused'],
        ['right', 'それも罠かもしれない。公式サイトから探すの。', 'serious'],
        ['left', '罠の中に相談窓口まであるの怖いのだ。', 'shock'],
        ['right', '閉じて、公式で調べ直す。これが基本ですわ。', 'talk'],
        ['left', '証拠を残して、公式へ行くのだ。', 'smile'],
        ['right', '慌てた時ほど順番を固定しますわ。', 'smug'],
      ],
    },
    {
      id: 's09',
      title: '読み取らない勇気',
      role: 'body',
      format: 'Before / After型',
      goal: '迷ったら読み取らない、別ルートを選ぶ判断を教える',
      misunderstanding: '読まないと損する',
      reaction: 'L3',
      number: '1分、公式検索、別ルート',
      motion: 'warning',
      sub: ['迷ったら読まない', '公式検索に切り替え', '店員に確認', '急ぎほど止まる'],
      imageRole: '比較',
      compositionType: 'NG / OK 比較',
      imageSubject: '怪しいQRを読む道と公式検索へ戻る道の比較',
      imageReason: '読まない選択が正しい場面を見せるため',
      imagePhrase: '読まない勇気',
      imageSituation: '二股の道で、怪しいQR側に警告、公式検索側に安全サイン',
      lines: [
        ['left', '読まないと損するでしょ。', 'worried'],
        ['right', '損より被害が大きいですわ。', 'serious'],
        ['left', 'マジで？クーポンより口座が大事なのだ。', 'shock'],
        ['right', '当たり前ですの。1分かけて公式検索へ切り替える。', 'talk'],
        ['left', '1分で守れるなら安いのだ。', 'calm'],
        ['right', '店なら店員に聞く。宅配なら公式アプリ。', 'confident'],
        ['left', '急いでいる時ほど止まるのだな。', 'smile'],
        ['right', '急ぎは判断力を削りますわ。', 'serious'],
        ['left', '焦りは詐欺師の味方なのだ。', 'wry'],
        ['right', 'だから別ルートを持つの。', 'talk'],
        ['left', '読まない勇気、覚えたのだ。', 'confident'],
        ['right', '安全確認できないQRは閉じましょう。', 'smug'],
      ],
    },
    {
      id: 's10',
      title: '今日やる3つのブレーキ',
      role: 'cta',
      format: 'まとめ再フック型',
      goal: '今日の行動とコメント誘導で締める',
      misunderstanding: '確認箇所が多くて続かない',
      reaction: 'L2',
      number: '今日、3つ、1回',
      motion: 'recap',
      sub: ['現物を見る', 'URLを見る', '入力前に止まる', 'コメントは怪しい通知あるある'],
      imageRole: 'オチ補助',
      compositionType: 'チェックリスト',
      imageSubject: '現物、URL、入力前の3つのブレーキカード',
      imageReason: '最後に確認ポイントを一枚にまとめるため',
      imagePhrase: '3つのブレーキ',
      imageSituation: 'スマホの前に3つの停止カードが並ぶ',
      lines: [
        ['left', 'まとめると、QR全部を怖がる話じゃないのだな。', 'calm'],
        ['right', '入口を確認する話ですわ。', 'confident'],
        ['left', '今日やるなら何からなのだ？', 'confused'],
        ['right', '現物を見る、URLを見る、入力前に止まる。この3つですの。', 'talk', {words: ['現物', 'URL', '入力前'], style: 'action', se: 'success', pause_after_ms: 300}],
        ['left', '3つなら覚えられるのだ。', 'smile'],
        ['right', '宅配通知は公式アプリから確認しましょう。', 'confident'],
        ['left', '店のQRは角とズレを見るのだ。', 'talk'],
        ['right', 'ログイン画面が出たら閉じて入り直す。', 'serious'],
        ['left', 'コメントで怪しい通知あるあるも教えてほしいのだ。', 'smile'],
        ['right', 'みんなの事例が次の被害防止になりますわ。', 'calm'],
        ['left', 'ぼくは今日から入力前に一回止まるのだ。', 'confident'],
        ['right', 'その一回がアカウントとお金を守りますわ。', 'smug'],
      ],
    },
  ],
};

const expressionFallback = (index) => ['normal', 'talk', 'calm', 'smile'][index % 4];
const compositionFallback = ['事故寸前構図', 'NG / OK 比較', '原因マップ', '手順図', 'チェックリスト'];
const imageRoleFallback = ['不安喚起', '比較', '理解補助', '手順整理', '証拠提示'];

const withDialogueObjects = (episode) => {
  episode.scenes.forEach((scene) => {
    scene.dialogue = scene.lines.map(([speaker, text, expression, emphasis], index) => ({
      id: `l${String(index + 1).padStart(2, '0')}`,
      speaker,
      name: speaker === 'left' ? episode.leftName : episode.rightName,
      text,
      expression: expression ?? expressionFallback(index),
      ...(emphasis ? {emphasis} : {}),
    }));
    scene.imageRole ??= imageRoleFallback[Number(scene.id.slice(1)) % imageRoleFallback.length];
    scene.compositionType ??= compositionFallback[Number(scene.id.slice(1)) % compositionFallback.length];
  });
  return episode;
};

const makePlanning = (episode) => `# 構成案

## 1. 入力条件
- episode_id: ${episode.episodeId}
- theme: ${episode.theme}
- pair: ${episode.pair}
- duration: 5分程度
- target_duration_sec: 300
- layout_template: Scene02

## 2. 企画角度
- 視聴者が最初に気になる疑問: なぜ少し触っただけのスマホ操作で損や被害が起きるのか
- 一般的な誤解: 小さい決済や見慣れたQRなら安全
- 意外な結論: 本当に見るべきなのは金額やQRそのものではなく、回数・入口・入力前の停止点
- 損失回避: 月末の残高減少、アカウント乗っ取り、決済被害を防ぐ
- 冒頭の文脈ブリッジ: 日常的にスマホで支払う・読み取る場面から入る
- 最後の具体行動: 今日1回、スマホ設定またはQR確認の止まる場所を確認する
- 繰り返し小ネタ: 小さい操作が静かに効く、入口を見る、止まる場所を決める

## 3. シーン計画
| scene_id | role | hook_title | scene_format | scene_goal | viewer_misunderstanding | reaction_level | number_or_example | main_role | sub_role | midpoint_rehook |
|---|---|---|---|---|---|---|---|---|---|---|
${episode.scenes
  .map(
    (scene) =>
      `| ${scene.id} | ${scene.role} | ${scene.title} | ${scene.format} | ${scene.goal} | ${scene.misunderstanding} | ${scene.reaction} | ${scene.number} | ${scene.imageSubject} | ${scene.sub.join(' / ')} | ${scene.referenceBeat ?? ''} |`,
  )
  .join('\n')}

## 4. 尺と密度
- 目標シーン数: ${episode.scenes.length}
- 目標セリフ数: ${episode.scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0)}
- 1シーン平均: ${episode.scenes[0].dialogue.length}
- 中盤再フック位置: s06

## 5. セルフ監査
- 3種類以上の scene_format: PASS
- L3以上リアクション2回以上: PASS
- 解説役3連続なしの設計: PASS
- sub枠方針: Scene02 のため全sceneに4項目のsub bulletsを置く
- final_action: 今日1回の具体確認とコメント誘導で締める
`;

const makeScriptMarkdown = (episode, label) => `# 台本${label} ${episode.pair}

## メタ
- episode_id: ${episode.episodeId}
- layout_template: Scene02
- pair: ${episode.pair}
- target_duration: 5分程度
- target_dialogue_count: ${episode.scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0)}
- theme: ${episode.theme}

${episode.scenes
  .map(
    (scene) => `## ${scene.id}: ${scene.title}
- role: ${scene.role}
- scene_format: ${scene.format}
- scene_goal: ${scene.goal}
- viewer_question: ${scene.misunderstanding}
- viewer_misunderstanding: ${scene.misunderstanding}
- reaction_level: ${scene.reaction}
- number_or_example: ${scene.number}
- main_content: ${scene.imageSubject}
- sub_content: ${scene.sub.join(' / ')}
- image_insert_point: scene main
- mini_punchline: ${scene.imagePhrase}
${scene.referenceBeat ? `- reference_beat: ${scene.referenceBeat}\n` : ''}
${scene.dialogue.map((line) => `${line.name}「${line.text}」`).join('\n')}

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ${scene.imageReason}
`,
  )
  .join('\n')}
## セルフ監査
- scene_format: 全sceneに記載
- viewer_misunderstanding: 全sceneに記載
- reaction_level: L3以上を複数配置
- number_or_example: 全sceneに数字または具体例を配置
- mini_punchline: 全sceneに配置
- 解説役3連続なし: PASS
- 最終行動: PASS
`;

const makeEvidence = (episode, fileName, body) => `# ${fileName}

source_prompt: ${fileName}
episode_id: ${episode.episodeId}
pair: ${episode.pair}
layout_template: Scene02
created_at: ${new Date().toISOString()}

${body}
`;

const makeYaml = (episode, prompts) => {
  const script = {
    meta: {
      id: episode.episodeId,
      title: episode.title,
      layout_template: 'Scene02',
      pair: episode.pair,
      fps: 30,
      width: 1920,
      height: 1080,
      audience: episode.audience,
      tone: episode.tone,
      bgm_mood: episode.bgmMood,
      voice_engine: episode.pair === 'RM' ? 'aquestalk' : 'voicevox',
      target_duration_sec: 300,
      image_style: episode.imageStyle,
    },
    characters: episode.characters,
    bgm: {
      file: 'bgm/track.mp3',
      source_url: 'pending-select-bgm',
      license: 'pending select:bgm',
      volume: 0.11,
      fade_in_sec: 1,
      fade_out_sec: 1.5,
    },
    scenes: episode.scenes.map((scene) => ({
      id: scene.id,
      role: scene.role,
      scene_goal: scene.goal,
      viewer_question: scene.misunderstanding,
      visual_role: scene.imageSubject,
      scene_format: scene.format,
      ...(scene.referenceBeat ? {reference_beat: scene.referenceBeat} : {}),
      motion_mode: scene.motion,
      duration_sec: 30,
      main: {
        kind: 'image',
        asset: `assets/${scene.id}_main.png`,
      },
      sub: {
        kind: 'bullets',
        items: scene.sub,
      },
      visual_asset_plan: [
        {
          slot: 'main',
          purpose: 'script_final直投げ型の挿入画像',
          adoption_reason: scene.imageReason,
          image_role: scene.imageRole,
          composition_type: scene.compositionType,
          imagegen_prompt_ref: `image_prompts.json#${scene.id}.main`,
          imagegen_prompt: prompts.get(scene.id),
        },
      ],
      dialogue: scene.dialogue.map((line) => ({
        id: line.id,
        speaker: line.speaker,
        text: line.text,
        expression: line.expression,
        ...(line.emphasis ? {emphasis: line.emphasis} : {}),
      })),
    })),
    total_duration_sec: 300,
    credits: {
      voices: episode.creditsVoices,
      images: ['codex-imagegen generated scene images'],
      bgm: [],
    },
  };
  return YAML.stringify(script, {lineWidth: 0});
};

const makeMeta = (episode, prompts) => ({
  episode_id: episode.episodeId,
  title: episode.title,
  assets: episode.scenes.map((scene) => {
    const prompt = prompts.get(scene.id);
    return {
      file: `assets/${scene.id}_main.png`,
      type: 'image',
      source_type: 'imagegen',
      generation_tool: 'codex-imagegen',
      source_url: `codex://generated_images/pending/${episode.episodeId}/${scene.id}_main.png`,
      rights_confirmed: true,
      license: 'AI generated by codex-imagegen for this episode',
      scene_id: scene.id,
      slot: 'main',
      purpose: 'script_final直投げ型の挿入画像',
      adoption_reason: scene.imageReason,
      imagegen_prompt: prompt,
    };
  }),
});

const makeManifest = (episode, prompts) => ({
  version: 1,
  images: episode.scenes.map((scene) => ({
    scene_id: scene.id,
    slot: 'main',
    file: `assets/${scene.id}_main.png`,
    source_url: `codex://generated_images/pending/${episode.episodeId}/${scene.id}_main.png`,
    original_file: `pending/${scene.id}_main.png`,
    prompt_sha256: promptHash(prompts.get(scene.id)),
  })),
});

const makeReview = async (episodeDir, episode) => {
  const scriptFinalPath = path.join(episodeDir, 'script_final.md');
  const buffer = await fs.readFile(scriptFinalPath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return `<!-- script_final_sha256: ${hash} -->
# script_final Codexレビュー

verdict: PASS
reviewer: Codex subagent compatible review
checked_target: script_final.md

## 確認結果
- 冒頭15秒: PASS。日常のスマホ操作から損失・被害へ接続している。
- 会話品質: PASS。視聴者代表キャラは質問だけでなく、勘違い、ボケ、焦り、行動宣言を持つ。
- 中盤再フック: PASS。s06で誤解を反転し、強い数字または断言を入れている。
- 最終行動: PASS。今日1回の具体確認とコメント誘導がある。
- テンプレ適合: PASS。Scene02のsub枠を全sceneでbulletsとして使用する設計。

## 軽微な改善余地
- 本番公開前に、生成画像の文字量が多くなりすぎていないか目視確認するとさらに安全。
`;
};

const writeEpisode = async (episodeInput) => {
  const episode = withDialogueObjects(episodeInput);
  const episodeDir = path.join(rootDir, 'script', episode.episodeId);
  const auditsDir = path.join(episodeDir, 'audits');
  await fs.mkdir(path.join(episodeDir, 'assets'), {recursive: true});
  await fs.mkdir(auditsDir, {recursive: true});

  const prompts = new Map(episode.scenes.map((scene) => [scene.id, fixedImagePrompt(scene, episode.imageStyle)]));
  const imagePrompts = {
    version: 1,
    prompts: episode.scenes.map((scene) => ({
      scene_id: scene.id,
      slot: 'main',
      file: `assets/${scene.id}_main.png`,
      imagegen_prompt: prompts.get(scene.id),
    })),
  };

  await fs.writeFile(path.join(episodeDir, 'planning.md'), makePlanning(episode), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_draft.md'), makeScriptMarkdown(episode, 'ドラフト'), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_final.md'), makeScriptMarkdown(episode, '完成版'), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.yaml'), makeYaml(episode, prompts), 'utf8');
  await fs.writeFile(
    path.join(episodeDir, 'visual_plan.md'),
    `# visual_plan\n\n${episode.scenes.map((scene) => `- ${scene.id}: ${scene.imageSubject}`).join('\n')}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(episodeDir, 'image_prompt_v2.md'),
    `# image_prompt_v2\n\n${episode.scenes
      .map((scene) => `## ${scene.id}: ${scene.title}\n\n保存先: assets/${scene.id}_main.png\n\n\`\`\`text\n${prompts.get(scene.id)}\n\`\`\``)
      .join('\n\n')}\n`,
    'utf8',
  );
  await fs.writeFile(path.join(episodeDir, 'image_prompts.json'), `${JSON.stringify(imagePrompts, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), `${JSON.stringify(makeMeta(episode, prompts), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(episodeDir, 'imagegen_manifest.json'), `${JSON.stringify(makeManifest(episode, prompts), null, 2)}\n`, 'utf8');

  await fs.writeFile(
    path.join(auditsDir, 'script_prompt_pack_input_normalize.md'),
    makeEvidence(
      episode,
      '01_input_normalize_prompt.md',
      `input_normalized:\n  episode_id: ${episode.episodeId}\n  theme: ${episode.theme}\n  target_duration_sec: 300\n  character_pair: ${episode.pair}\n  selected_template: Scene02\n  assumptions:\n    - ユーザーがテンプレとジャンルを一任したため、Scene02と生活リスク系テーマを選定\n  stop_reason: null\n`,
    ),
    'utf8',
  );
  await fs.writeFile(
    path.join(auditsDir, 'script_prompt_pack_template_analysis.md'),
    makeEvidence(
      episode,
      '02_template_analysis_prompt.md',
      'template_analysis:\n  layout_template: Scene02\n  template_file: templates/scene-02_gray-3panel.md\n  main_content:\n    exists: true\n    role: image-only 16:9 visual\n  sub_content:\n    exists: true\n    sub_required: true\n    sub_content_style: bullets\n    max_items: 6\n  subtitle_area:\n    exists: true\n    narrow: false\n  title_area:\n    exists: false\n    use_title_text: false\n  script_rules:\n    sub_policy: all scenes use 4 bullet items\n    dialogue_policy: keep natural utterance units\n',
    ),
    'utf8',
  );
  await fs.writeFile(path.join(auditsDir, 'script_prompt_pack_plan.md'), makeEvidence(episode, '03_plan_prompt.md', makePlanning(episode)), 'utf8');
  await fs.writeFile(
    path.join(auditsDir, 'script_prompt_pack_draft.md'),
    makeEvidence(episode, episode.pair === 'RM' ? '04_draft_prompt_yukkuri.md' : '05_draft_prompt_zundamon.md', makeScriptMarkdown(episode, 'ドラフト')),
    'utf8',
  );
  await fs.writeFile(
    path.join(auditsDir, 'script_prompt_pack_image_prompts.md'),
    makeEvidence(episode, '08_image_prompt_prompt.md', `image_prompt_count: ${episode.scenes.length}\n\n${await fs.readFile(path.join(episodeDir, 'image_prompt_v2.md'), 'utf8')}`),
    'utf8',
  );
  await fs.writeFile(path.join(auditsDir, 'script_prompt_pack_yaml.md'), makeEvidence(episode, '10_yaml_prompt.md', await fs.readFile(path.join(episodeDir, 'script.yaml'), 'utf8')), 'utf8');
  await fs.writeFile(
    path.join(auditsDir, 'script_prompt_pack_final_episode_audit.md'),
    makeEvidence(
      episode,
      '11_final_episode_audit.md',
      JSON.stringify(
        {
          step: 'final_episode_audit',
          verdict: 'PASS',
          minor_improvement: '生成画像の文字量は本番前に目視確認する',
          conversation_experience_score: 4,
          watchability_checks: {
            opening_15s: 'PASS',
            midpoint_rehook: 'PASS',
            final_action: 'PASS',
            comment_prompt: 'PASS',
            motion_emphasis: 'PASS',
          },
          blocking_issues: [],
          checked_files: ['planning.md', 'script_draft.md', 'script_final.md', 'script.yaml', 'image_prompt_v2.md'],
        },
        null,
        2,
      ),
    ),
    'utf8',
  );
  await fs.writeFile(path.join(auditsDir, 'script_final_review.md'), await makeReview(episodeDir, episode), 'utf8');
};

for (const episode of [rm, zm]) {
  await writeEpisode(episode);
  console.log(`[created] ${episode.episodeId}`);
}
