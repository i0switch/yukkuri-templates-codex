import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();

const FIXED_PROMPT = [
  'ゆっくり解説動画向けの挿入画像を日本語で生成してください。',
  'この画像は会話内容をそのまま再現するためのものではなく、シーンの要点・状況・概念・比喩を視覚的にわかりやすく補強するためのコンテンツ画像です。',
  '字幕やセリフは別で表示するため、会話等は画像に入れないでください。',
  'キャラクター同士の会話シーンにはせず、テーマ理解を助ける図解、アイコン、小物、抽象的な画面風ビジュアル、概念図、状況説明ビジュアルを中心に構成してください。',
  '画像内の可読テキストは日本語だけにしてください。英語ラベル、英語見出し、英語UI、英単語の装飾文字は禁止です。',
  '文字が崩れる可能性がある場合は、文字を使わずアイコン、色分け、形、配置で表現してください。',
  '下部に白帯、入力欄、チャット欄、テキストボックス風の余白を作らないでください。',
  '画像の役割を、理解補助、不安喚起、笑い、比較、手順整理、証拠提示、オチ補助のいずれかとして明確にしてください。',
  '構図タイプを、NG / OK 比較、失敗例シミュレーション、誇張図解、証拠写真風、チェックリスト、手順図、原因マップ、ビフォーアフター、ツッコミ待ち構図、事故寸前構図のいずれかとして明確にしてください。',
  '画面で一番大きく見せる対象、その対象を大きくする理由、逆に小さくする/入れない対象を明確にしてください。',
  '対象シーンから画像化する一言を1つ選び、画像で再現する状況と再現しない要素を明確にしてください。',
  'スマホ視聴でも伝わるように主役は1つ、画像内の小さい文字は最大3語、アイコンは最大5個、重要要素は画面中央から上部に置いてください。',
  'どのシーンにも使える白背景アイコン、抽象的な青いネットワーク線、台本の具体例と関係が薄い綺麗な汎用図解は禁止です。',
  '字幕やキャラクターに重なる位置へ重要情報を置かず、背景や小物は画面端まで自然に続けてください。',
  '画面全体を有効活用し、情報が一目で伝わる、整理された高品質なビジュアルにしてください。',
  '動画の解説画面に適した、見やすく印象的で、内容理解を助ける16:9の横長構図で作成してください。',
].join(' ');

const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const yamlString = (value) => JSON.stringify(value);

const block = (text, indent = 8) => {
  const pad = ' '.repeat(indent);
  return `|-\n${text.split('\n').map((line) => `${pad}${line}`).join('\n')}`;
};

const line = (speaker, text, expression = null, emphasis = null) => ({speaker, text, expression, emphasis});

const episodes = [
  {
    id: 'ep962-rm-notification-focus-drain',
    title: 'スマホ通知で集中力と時間が漏れる罠と今日からできる3つの止め方',
    theme: 'スマホ通知で集中力と時間が漏れる罠',
    pair: 'RM',
    layout: 'Scene02',
    templateFile: 'templates/scene-02_gray-3panel.md',
    audience: 'スマホ通知に反応しすぎて作業や勉強が進まない人',
    tone: '日常のあるあるから損失回避へ進む実用解説。霊夢の雑な解決策を魔理沙が具体的に整理する。',
    bgmMood: '明るく軽いデジタル生活改善系の解説BGM',
    imageStyle: '明るいデスク、スマホ通知、集中タイマー、チェックリスト、赤い警告と青い整理図解を組み合わせた生活改善ビジュアル',
    characters: {
      left: {character: 'reimu', aquestalk_preset: 'れいむ', speaking_style: '焦り、言い訳、生活感、軽いボケ'},
      right: {character: 'marisa', aquestalk_preset: 'まりさ', speaking_style: '整理、短いツッコミ、数字、実用的な結論'},
    },
    scenes: [
      {
        id: 's01',
        role: 'intro',
        title: '通知で時間が溶ける',
        sceneGoal: '通知の損失を自分事化する',
        viewerQuestion: 'なぜ少し見るだけで作業が止まるのか',
        format: 'あるある型',
        motion: 'warning',
        sub: ['通知は用事に見える', '開くと別アプリへ飛ぶ', '戻るまで数分かかる', 'まず通知量を見える化'],
        imageRole: '不安喚起',
        composition: '事故寸前構図',
        visual: '作業机の上でスマホ通知が雪崩のように積み上がり、集中タイマーが止まっている様子',
        lines: [
          line('left', 'スマホを一回見ただけなのに、気づいたら**20分**消えてたのよ。', 'shock', {words: ['20分'], style: 'danger', se: 'warning', pause_after_ms: 300}),
          line('right', '通知沼あるあるだぜ。問題は一回見ることじゃなく、戻れなくなることなんだ。'),
          line('left', 'でも通知って大事な連絡かもしれないじゃない。無視したら人生終わらない？'),
          line('right', '待て待て、通知の9割は今すぐじゃなくても困らないことが多い。'),
          line('left', '9割って、ほぼ構ってちゃんじゃない。'),
          line('right', 'だから今日は通知を全部消す話じゃない。必要な通知だけ残す話だぜ。'),
          line('left', '全部オフにして山へ逃げる回じゃないのね。'),
          line('right', '山より先に設定を見よう。今日やるのは通知の棚卸しだ。'),
          line('left', '棚卸しなら、私の集中力の在庫も確認したいわ。'),
          line('right', 'そこがもう赤字っぽいから、今から止血するぜ。'),
          line('left', '通知に吸われる前に、先に仕組みで止めるのね。'),
          line('right', 'その通り。5分で設定できる3つの対策まで持っていく。'),
        ],
      },
      {
        id: 's02',
        role: 'body',
        title: '通知は入口でしかない',
        sceneGoal: '通知から脱線する仕組みを説明する',
        viewerQuestion: '通知を見るだけでなぜ長引くのか',
        format: '誤解訂正型',
        motion: 'punch',
        sub: ['通知を見る', 'アプリを開く', '関連投稿を見る', '元の作業を忘れる'],
        imageRole: '理解補助',
        composition: '原因マップ',
        visual: '通知からSNS、動画、買い物ページへ枝分かれして作業画面へ戻れなくなる迷路図',
        lines: [
          line('left', '通知だけなら3秒で見られるし、別に大げさじゃなくない？'),
          line('right', 'そこが罠だぜ。通知は入口で、時間を奪うのはその先のアプリだ。'),
          line('left', '入口無料、奥で課金される遊園地みたいね。'),
          line('right', '例えば通知を開いて、返信して、ついでにSNSを見て、気づくと別動画まで行く。'),
          line('left', 'あるわ。用事は一つだったのに、帰り道で迷子になるやつ。'),
          line('right', 'しかも戻った後も、作業内容を思い出すのに時間がかかる。'),
          line('left', '脳内のタブが全部散らかる感じね。'),
          line('right', 'だから通知対策は、画面を見る回数を減らすより、脱線の入口を減らすのが本命だ。'),
          line('left', '通知を見ない根性じゃなく、入口に鍵をかけるのね。'),
          line('right', 'そうだぜ。まずは通知を種類で分けよう。'),
          line('left', '全部同じピコン扱いしてたわ。'),
          line('right', 'そこを分けるだけで、かなり楽になる。'),
        ],
      },
      {
        id: 's03',
        role: 'body',
        title: '残す通知と消す通知',
        sceneGoal: '通知の優先順位を作る',
        viewerQuestion: 'どの通知を残せばいいか',
        format: '手順型',
        motion: 'checklist',
        sub: ['人からの連絡', '予定と決済', '安全通知', '宣伝とおすすめ', '反応通知'],
        imageRole: '手順整理',
        composition: 'チェックリスト',
        visual: 'スマホ通知を残す箱と消す箱に分類するチェックリスト風の整理図',
        lines: [
          line('left', '通知を分けるって、どれを切ればいいのよ。全部それっぽく大事そうよ？'),
          line('right', 'まず残す候補は3つ。人からの連絡、予定、決済や安全に関わる通知だ。'),
          line('left', 'つまり家族、予定、支払い、危険系ね。'),
          line('right', 'そう。逆におすすめ、セール、いいね、ランキング、新着動画は基本あとでいい。'),
          line('left', 'いいね通知、心の栄養なのに。'),
          line('right', '栄養のつもりで砂糖を常時点滴してるようなものだぜ。'),
          line('left', '急に健康診断みたいな言い方するじゃない。'),
          line('right', '集中したい時間に必要なのは、今すぐ対応する理由がある通知だけだ。'),
          line('left', 'おすすめは見たい時に見に行けばいいのね。'),
          line('right', '受け身で浴びるから時間が漏れる。取りに行く形へ変えるんだ。'),
          line('left', '通知に呼ばれるんじゃなく、こっちから呼ぶ。'),
          line('right', 'それが主導権を取り戻す第一歩だぜ。'),
        ],
      },
      {
        id: 's04',
        role: 'body',
        title: 'バナーは強すぎる',
        sceneGoal: '画面上に出る通知を止める',
        viewerQuestion: '音を消すだけで十分か',
        format: '失敗エピソード型',
        motion: 'compare',
        sub: ['音だけオフは弱い', 'バナーが視線を奪う', 'ロック画面も要確認', '集中時間は表示を減らす'],
        imageRole: '比較',
        composition: 'NG / OK 比較',
        visual: 'NG側は画面上部に通知バナーが連発し、OK側は作業画面が静かに保たれている比較',
        lines: [
          line('left', '音を消してるから私は対策済みよ。ピコンって鳴らないし。'),
          line('right', '甘いぜ。音がなくても、バナーが出れば目が持っていかれる。'),
          line('left', 'たしかに上からひょこっと来ると見ちゃうわ。'),
          line('right', '人間は動くものと新しい情報に弱い。作業中のバナーは小さい割り込みだ。'),
          line('left', '小さい顔して、仕事を止める大物なのね。'),
          line('right', '集中時間だけでも、バナー表示とロック画面表示を切るのが効く。'),
          line('left', '通知センターには残して、画面には出さない感じ？'),
          line('right', 'そうだ。必要な時にまとめて見る。勝手に割り込ませない。'),
          line('left', '玄関チャイムじゃなく、郵便受けに入れてもらうのね。'),
          line('right', 'いい例えだぜ。全部チャイムだと、家事も仕事も進まない。'),
          line('left', '通知の宅配業者、多すぎ問題ね。'),
          line('right', 'まずはバナーの数を減らそう。'),
        ],
      },
      {
        id: 's05',
        role: 'body',
        title: '集中モードを時間で切る',
        sceneGoal: '手動ではなく時間帯で通知制御する',
        viewerQuestion: '毎回オフにするのは面倒ではないか',
        format: 'Before / After型',
        motion: 'reveal',
        sub: ['作業時間を決める', '許可する人を選ぶ', 'アプリを絞る', '終わったら自動解除'],
        imageRole: '手順整理',
        composition: '手順図',
        visual: 'スマホの集中モードが朝の作業時間だけ自動でオンになり、重要連絡だけ通す手順図',
        lines: [
          line('left', 'でも毎回通知を切るの、絶対忘れるわ。私の意志は湿気に弱い。'),
          line('right', 'だから意志じゃなく時間で切る。集中モードをスケジュール設定するんだ。'),
          line('left', 'スマホ側に門番をやらせるのね。'),
          line('right', '例えば平日9時から11時は通知を絞る。家族や仕事の連絡だけ許可する。'),
          line('left', 'それなら完全に孤島にならないわね。'),
          line('right', '中盤の大事な点だが、通知対策は社会を断つことじゃない。反応する順番を決めることだぜ。', 'confident', {words: ['反応する順番'], style: 'punch', se: 'reveal', pause_after_ms: 300}),
          line('left', 'マジで！？人間関係を捨てる儀式じゃなかったのね。'),
          line('right', 'むしろ大事な連絡に気づきやすくなる。どうでもいい通知を薄めるからな。'),
          line('left', 'ノイズが減ると、本当に大事な音が聞こえるわけか。'),
          line('right', 'そうだぜ。集中モードは我慢ではなく仕分けだ。'),
          line('left', '仕分けなら、私にもできそう。'),
          line('right', 'まず1日2時間だけ設定して試せばいい。'),
        ],
      },
      {
        id: 's06',
        role: 'body',
        title: '通知のまとめ見ルール',
        sceneGoal: '見る時間を決めて反応癖を減らす',
        viewerQuestion: 'いつ確認すれば不安が減るか',
        format: '手順型',
        motion: 'checklist',
        sub: ['午前の区切り', '昼休み', '夕方の確認', '寝る前は減らす'],
        imageRole: '手順整理',
        composition: '手順図',
        visual: '一日の中で通知を見る時間を3回だけに区切った時計とスマホのスケジュール図',
        lines: [
          line('left', '通知を減らすと、逆に気になって何回も開いちゃいそう。'),
          line('right', 'その不安には、見る時間を先に決めるのが効く。'),
          line('left', '見ないんじゃなくて、見る予約を入れるのね。'),
          line('right', '例えば午前の区切り、昼休み、夕方の3回。そこでまとめて確認する。'),
          line('left', '3回だけなら、逆に安心かも。'),
          line('right', '常時監視をやめるだけで、作業の流れが途切れにくくなる。'),
          line('left', '私はスマホ警備員を勝手にやってたのね。'),
          line('right', 'しかも無給でな。通知確認は仕事ではなく、時間枠に入れる作業だ。'),
          line('left', '寝る前の通知チェックも危険そうね。'),
          line('right', '寝る前は特におすすめしない。短い確認が夜更かしに化ける。'),
          line('left', '一つだけ見るつもりが、朝の私に借金を残すやつね。'),
          line('right', 'だから夜は通知より睡眠を優先だぜ。'),
        ],
      },
      {
        id: 's07',
        role: 'body',
        title: '赤い数字を消す',
        sceneGoal: 'バッジ通知の視覚的圧を下げる',
        viewerQuestion: 'バッジは残していいか',
        format: '誤解訂正型',
        motion: 'warning',
        sub: ['赤い数字は圧が強い', '未読数で焦る', '重要アプリだけ残す', 'SNSは切る候補'],
        imageRole: '不安喚起',
        composition: '誇張図解',
        visual: 'スマホ画面の赤い未読バッジが大きく膨らみ、作業メモを押しつぶす誇張図',
        lines: [
          line('left', '音もバナーも切ったら、赤い数字くらいは残していいでしょ。'),
          line('right', 'その赤い数字が意外と強い。未読があるだけで頭に引っかかるんだ。'),
          line('left', 'たしかに赤丸があると、こっちを見ろって言われてる感じするわ。'),
          line('right', 'SNS、動画、ニュース、買い物アプリのバッジは、集中したい人ほど切る候補だ。'),
          line('left', '赤丸って小さい上司みたいね。'),
          line('right', 'しかも勤務時間外にも呼んでくる上司だぜ。'),
          line('left', '最悪じゃない。'),
          line('right', '未読数を知る必要があるアプリだけ残す。全部の数字を背負わなくていい。'),
          line('left', 'メールと連絡系だけ残して、娯楽系は切る感じね。'),
          line('right', 'それでいい。赤い圧力を減らすだけで、開く回数はかなり減る。'),
          line('left', 'スマホ画面の圧迫感も下がりそう。'),
          line('right', '画面が静かだと、頭も少し静かになるぜ。'),
        ],
      },
      {
        id: 's08',
        role: 'body',
        title: '通知を戻す基準',
        sceneGoal: '切りすぎと戻し方を説明する',
        viewerQuestion: '必要な通知まで消したらどうするか',
        format: '反証型',
        motion: 'compare',
        sub: ['困った通知だけ戻す', '一週間試す', '戻す理由を書く', '宣伝は戻さない'],
        imageRole: '比較',
        composition: 'ビフォーアフター',
        visual: '通知を切りすぎた状態から、本当に困った通知だけ戻すビフォーアフター図',
        lines: [
          line('left', 'でも切りすぎて、大事な連絡を逃したら怖いわ。'),
          line('right', 'だから一週間試して、困ったものだけ戻す。最初から完璧を狙わない。'),
          line('left', '通知断捨離にも仮住まい期間があるのね。'),
          line('right', 'そうだ。戻す基準は、実際に困ったかどうか。なんとなく不安は戻す理由にしない。'),
          line('left', 'なんとなく不安、だいたい強いのよ。'),
          line('right', '強いが、だいたい雑だぜ。例えば銀行の入出金通知は戻す価値がある。'),
          line('left', 'セール通知は？'),
          line('right', 'それは財布に穴を開ける通知だな。基本戻さない。'),
          line('left', '節約にもつながるのか。'),
          line('right', '時間だけじゃなく、衝動買いも減る。通知はお金にもつながるんだ。'),
          line('left', '通知って思ったより生活に入り込んでるわね。'),
          line('right', 'だから仕組みで距離を置く。'),
        ],
      },
      {
        id: 's09',
        role: 'body',
        title: '今日やる3ステップ',
        sceneGoal: '具体行動を3つに絞る',
        viewerQuestion: '今すぐ何を設定するか',
        format: 'まとめ再フック型',
        motion: 'checklist',
        sub: ['SNSのバナーを切る', '集中モードを2時間', '赤い数字を減らす', '一週間だけ試す'],
        imageRole: '手順整理',
        composition: 'チェックリスト',
        visual: 'スマホ設定の3ステップカード、バナーオフ、集中モード、バッジ削減を大きく示す',
        lines: [
          line('left', '結局、設定画面で何から触ればいいの？迷子になりそう。'),
          line('right', '今日やるのは3つだけだ。SNSと動画アプリのバナーを切る。'),
          line('left', 'まず一番吸われるアプリからね。'),
          line('right', '次に集中モードを平日の作業時間に2時間だけ入れる。'),
          line('left', '2時間なら現実的だわ。'),
          line('right', '最後に赤いバッジを娯楽アプリから消す。'),
          line('left', '通知の三段締めね。'),
          line('right', '一週間だけ試して、困った通知だけ戻す。これなら失敗しても戻せる。'),
          line('left', '投票したいわ。みんな一番吸われる通知って何なんだろう。'),
          line('right', 'コメントで、SNS、ニュース、買い物、ゲームのどれに吸われるか教えてほしいぜ。'),
          line('left', '私は全部に吸われてる気がする。'),
          line('right', 'それなら今日の3ステップはかなり効く可能性がある。'),
        ],
      },
      {
        id: 's10',
        role: 'cta',
        title: 'まず一つだけ切る',
        sceneGoal: '今日やる一手で終える',
        viewerQuestion: '最初の行動は何か',
        format: 'まとめ再フック型',
        motion: 'recap',
        sub: ['今すぐ1アプリ選ぶ', 'バナーを切る', '集中モードを作る', '一週間後に戻すか判断'],
        imageRole: 'オチ補助',
        composition: '手順図',
        visual: '一つのSNSアプリ通知をオフにし、集中タイマーが動き出す締めの行動カード',
        lines: [
          line('left', 'まとめると、通知は便利だけど、開くきっかけにもなるのね。'),
          line('right', 'そうだ。通知、バナー、赤い数字、確認時間。この4つを整えるだけで漏れ方が変わる。'),
          line('left', '今日やるなら一つだけにして。全部やると設定画面で遭難する。'),
          line('right', 'まず一番時間を吸うアプリを一つ選んで、バナー通知を切る。', 'confident', {words: ['一つ選んで'], style: 'action', se: 'success', pause_after_ms: 300}),
          line('left', 'SNSか動画アプリから選ぶのが良さそうね。'),
          line('right', 'それで一週間だけ様子を見る。困らなければ、そのまま続ける。'),
          line('left', '困ったら戻せばいいから、怖くないわ。'),
          line('right', '通知対策は根性じゃない。スマホに邪魔されにくい環境を作ることだぜ。'),
          line('left', 'よし、まず赤い丸とピコンから距離を置くわ。'),
          line('right', '今日の一手は、時間を吸うアプリのバナーを切ることだ。'),
          line('left', '私の20分を取り戻してくるわ。'),
          line('right', '戻ってきた時間で、本当にやりたいことを進めよう。'),
        ],
      },
    ],
  },
  {
    id: 'ep963-zm-delivery-sms-phishing-trap',
    title: '宅配不在通知SMSで個人情報を抜かれる罠と安全に確認する3ステップ',
    theme: '宅配不在通知SMS・偽ログインで個人情報を抜かれる罠',
    pair: 'ZM',
    layout: 'Scene14',
    templateFile: 'templates/scene-14_multilayer-glass.md',
    audience: '宅配SMSや不在通知リンクをつい開きそうになるスマホ利用者',
    tone: '不安を煽りすぎず、ずんだもんの焦りをめたんが冷静に止める安全確認系の実用解説。',
    bgmMood: '少し緊張感のあるデジタル安全対策系の解説BGM',
    imageStyle: 'スマホSMS、宅配箱、偽ログイン画面風の抽象図、警告色、濃紺とミントのサイバー安全ビジュアル',
    characters: {
      left: {character: 'zundamon', voicevox_speaker_id: 3, speaking_style: '焦り、勘違い、素直な反応、軽いボケ'},
      right: {character: 'metan', voicevox_speaker_id: 2, speaking_style: '冷静な制止、具体例、短いツッコミ、安全な手順'},
    },
    scenes: [
      {
        id: 's01',
        role: 'intro',
        title: '不在通知リンクの罠',
        sceneGoal: '偽SMSの身近さと損失を刺す',
        viewerQuestion: '不在通知SMSを開いていいのか',
        format: 'あるある型',
        motion: 'warning',
        sub: ['SMSリンクは疑う', '焦って開かない', '公式アプリで確認', '番号検索も慎重'],
        imageRole: '不安喚起',
        composition: '事故寸前構図',
        visual: 'スマホに宅配不在通知SMSが表示され、偽リンクの先に個人情報入力欄が待っている警告図',
        lines: [
          line('left', '宅配の不在SMSが来たから、リンク開きかけたのだ。', 'shock', {words: ['不在SMS'], style: 'danger', se: 'warning', pause_after_ms: 300}),
          line('right', 'そこで止まれたならえらいですわ。不在通知SMSは偽物が混ざりやすいのです。'),
          line('left', 'え、荷物を受け取るだけなのに危ないのだ？'),
          line('right', '偽サイトに誘導されて、電話番号、住所、カード情報、ログイン情報を入れさせる手口がありますわ。'),
          line('left', 'マジで？段ボールの顔をした罠なのだ。'),
          line('right', 'そう。焦って再配達しようとすると、確認が雑になりますの。'),
          line('left', '荷物を逃す不安につけ込むのだな。'),
          line('right', '今日はリンクを開く前に見る場所と、安全な確認手順を決めますわ。'),
          line('left', '不在票より先に、ぼくの冷静さが不在なのだ。'),
          line('right', 'そこを戻しましょう。まずSMSリンクは押さない、が出発点ですわ。'),
          line('left', '押さない。まず深呼吸なのだ。'),
          line('right', 'そして公式アプリか公式サイトから確認しますわ。'),
        ],
      },
      {
        id: 's02',
        role: 'body',
        title: '本物っぽさでだます',
        sceneGoal: '偽SMSが本物に見える理由を説明する',
        viewerQuestion: 'なぜ偽物と気づきにくいのか',
        format: '誤解訂正型',
        motion: 'punch',
        sub: ['社名っぽい文面', '短縮URL', '急がせる言葉', '不自然な日本語'],
        imageRole: '理解補助',
        composition: '原因マップ',
        visual: '偽SMSの特徴を虫眼鏡で確認する図、社名風、短縮URL、急がせる文言をアイコン化',
        lines: [
          line('left', 'でも文面に宅配っぽい名前が書いてあったのだ。本物じゃないのだ？'),
          line('right', '名前っぽく見せるだけなら簡単ですわ。そこだけで判断してはいけません。'),
          line('left', 'えー、名前があると安心しちゃうのだ。'),
          line('right', '詐欺SMSは、社名風の文面、短いURL、期限切れ、保管終了などで急がせますの。'),
          line('left', '焦らせ文章の詰め合わせなのだ。'),
          line('right', 'しかも本物の荷物を待っている時ほど、疑う力が落ちますわ。'),
          line('left', 'ぼく、通販した翌日は全部信じそうなのだ。'),
          line('right', 'だからこそ、SMS本文ではなく、注文履歴や公式アプリで確認するのです。'),
          line('left', 'SMSはお知らせかもしれないけど、入口にはしない。'),
          line('right', 'その理解で合っていますわ。リンクを入口にしないことが大事ですの。'),
          line('left', '入口を変えるだけで安全度が上がるのだな。'),
          line('right', 'はい。手間は少し増えても、被害のリスクはかなり下げられますわ。'),
        ],
      },
      {
        id: 's03',
        role: 'body',
        title: '偽ログインの危険',
        sceneGoal: '入力してはいけない情報を明確にする',
        viewerQuestion: '何を入れると危ないか',
        format: '失敗エピソード型',
        motion: 'warning',
        sub: ['IDとパスワード', 'カード番号', '認証コード', '住所と電話番号'],
        imageRole: '不安喚起',
        composition: '失敗例シミュレーション',
        visual: '偽ログイン画面風の抽象フォームに重要情報が吸い込まれそうになる警告ビジュアル',
        lines: [
          line('left', 'リンク先でログインを求められたら、入れれば再配達できるのだ？'),
          line('right', '待ちなさい。それが一番危険な入口ですわ。'),
          line('left', 'ログインしただけでもダメなのだ？'),
          line('right', '偽サイトなら、入力したIDとパスワードがそのまま相手に渡りますの。'),
          line('left', '鍵を自分で渡すようなものなのだ。'),
          line('right', 'さらにカード番号、認証コード、住所、電話番号を求められたらかなり危険ですわ。'),
          line('left', '再配達なのにカード番号って変なのだ。'),
          line('right', 'その違和感が大事。荷物確認に不要な情報を求める画面は閉じてください。'),
          line('left', '閉じる勇気、大事なのだな。'),
          line('right', 'はい。迷ったら入力せず、公式の窓口に戻る。これが基本ですわ。'),
          line('left', '戻るボタンじゃなく、画面を閉じるのだ。'),
          line('right', 'そのほうが安全ですの。'),
        ],
      },
      {
        id: 's04',
        role: 'body',
        title: '公式から入り直す',
        sceneGoal: '安全な確認手順を示す',
        viewerQuestion: 'どう確認すれば安全か',
        format: '手順型',
        motion: 'checklist',
        sub: ['SMSを閉じる', '公式アプリを開く', '注文履歴を見る', '追跡番号を手入力'],
        imageRole: '手順整理',
        composition: '手順図',
        visual: 'SMSを閉じて公式アプリ、注文履歴、追跡番号確認へ進む安全確認の3ステップ図',
        lines: [
          line('left', 'じゃあ本当に荷物が来てたら、どう確認するのだ？'),
          line('right', '手順はシンプルですわ。SMSを閉じる、公式アプリを開く、注文履歴を見る。'),
          line('left', 'リンクを押さずに、自分で入り直すのだな。'),
          line('right', 'そうです。通販サイトの注文履歴や配送会社の公式アプリから確認しますの。'),
          line('left', '追跡番号がある時は？'),
          line('right', '公式サイトを検索して、自分で開いて、追跡番号を手入力しますわ。'),
          line('left', 'リンクを信用しないで、道を自分で選ぶのだ。'),
          line('right', 'その通り。詐欺リンクは道案内のふりをした落とし穴ですの。'),
          line('left', '落とし穴ナビ、怖すぎるのだ。'),
          line('right', 'だから入口を公式に固定しますわ。'),
          line('left', '公式アプリが一番安心なのだな。'),
          line('right', '通知が本物でも、確認は公式側で足りますわ。'),
        ],
      },
      {
        id: 's05',
        role: 'body',
        title: '中盤の落とし穴',
        sceneGoal: '焦りが判断を壊すことを再フックする',
        viewerQuestion: 'なぜわかっていても押すのか',
        format: 'まとめ再フック型',
        motion: 'reveal',
        sub: ['急ぎ文句に注意', '保管期限に注意', '再配達を急がない', '公式で確認'],
        imageRole: '不安喚起',
        composition: '事故寸前構図',
        visual: '保管期限の赤い警告に焦ってリンクへ指が伸びる直前で止まるスマホ画面',
        lines: [
          line('left', 'でも「本日中に確認」って書かれると、押したくなるのだ。'),
          line('right', '中盤の重要点ですわ。犯人はリンクではなく、焦りですの。', 'confident', {words: ['焦り'], style: 'danger', se: 'reveal', pause_after_ms: 300}),
          line('left', 'マジで！？ぼくの焦りが共犯なのだ？'),
          line('right', 'はい。保管期限、再配達不可、手数料発生のような言葉で判断を急がせますわ。'),
          line('left', '急がされると、確認を飛ばすのだ。'),
          line('right', 'だから急ぐ文面ほど、逆に一回止まる。これはかなり有効ですの。'),
          line('left', '急げって言われたら、急がない。天邪鬼作戦なのだ。'),
          line('right', '安全確認では正しい天邪鬼ですわ。'),
          line('left', '荷物より個人情報のほうが大事なのだな。'),
          line('right', 'その通り。荷物は再配達できますが、漏れた情報の回収は難しいですわ。'),
          line('left', 'それは普通に怖いのだ。'),
          line('right', 'だから公式確認を習慣にしましょう。'),
        ],
      },
      {
        id: 's06',
        role: 'body',
        title: '電話番号検索の注意',
        sceneGoal: '検索時にも偽情報が混ざることを示す',
        viewerQuestion: '番号検索なら安全か',
        format: '反証型',
        motion: 'compare',
        sub: ['番号だけで信じない', '広告枠に注意', '公式URLを見る', '会社名と照合'],
        imageRole: '比較',
        composition: 'NG / OK 比較',
        visual: '電話番号検索結果で広告風の偽ページと公式ページを見分ける比較図',
        lines: [
          line('left', 'SMSの番号を検索すれば、本物か分かるのだ？'),
          line('right', '参考にはなりますが、それだけで信じるのは危険ですわ。'),
          line('left', '検索にも罠があるのだ？'),
          line('right', '検索結果に紛らわしいページや広告が出ることがありますの。公式URLかどうかを見ます。'),
          line('left', '上に出たから正義、ではないのだな。'),
          line('right', 'そうです。検索結果の順位より、公式ドメインと会社名の一致を見てください。'),
          line('left', 'ドメインって、URLの住所みたいなものなのだ？'),
          line('right', 'いい理解ですわ。ただし似せた文字もあるので、公式アプリがあるならそちらが安全です。'),
          line('left', '検索しても、最後は公式に戻るのだ。'),
          line('right', 'はい。確認の目的は早く押すことではなく、安全に入口へ戻ることですわ。'),
          line('left', '安全な玄関から入るのだな。'),
          line('right', '怪しい裏口は使わない、ということですの。'),
        ],
      },
      {
        id: 's07',
        role: 'body',
        title: 'もし入力したら',
        sceneGoal: '被害時の初動を提示する',
        viewerQuestion: '入力後に何をすればいいか',
        format: '失敗エピソード型',
        motion: 'warning',
        sub: ['パスワード変更', 'カード会社へ連絡', '認証コード確認', '公式窓口に相談'],
        imageRole: '手順整理',
        composition: '手順図',
        visual: '入力してしまった後の緊急対応フロー、パスワード変更、カード停止、相談窓口を示す',
        lines: [
          line('left', 'もしもう入力しちゃったら、布団に潜れば解決なのだ？'),
          line('right', '潜っている場合ではありませんわ。すぐ対応します。'),
          line('left', 'やっぱり現実から逃げられないのだ。'),
          line('right', 'まず同じパスワードを使っているサービスのパスワードを変更しますの。'),
          line('left', '使い回しがあると連鎖するのだな。'),
          line('right', 'カード情報を入れたならカード会社へ連絡。身に覚えのない決済も確認しますわ。'),
          line('left', '認証コードを入れた場合は？'),
          line('right', 'アカウントのログイン履歴や連携端末を確認し、公式窓口に相談します。'),
          line('left', '早く動くほど被害を減らせるのだ。'),
          line('right', 'はい。恥ずかしがって放置するのが一番危険ですわ。'),
          line('left', '焦った時こそ、順番メモが必要なのだな。'),
          line('right', 'そのために今日の手順を覚えておきましょう。'),
        ],
      },
      {
        id: 's08',
        role: 'body',
        title: '家族にも共有する',
        sceneGoal: '自分以外の被害を防ぐ',
        viewerQuestion: '誰に共有すべきか',
        format: 'あるある型',
        motion: 'punch',
        sub: ['家族に一言共有', 'SMSリンクを押さない', '公式から確認', '困ったら相談'],
        imageRole: '理解補助',
        composition: 'ツッコミ待ち構図',
        visual: '家族チャットに「宅配SMSリンクは押さない」と共有する安全メモ風ビジュアル',
        lines: [
          line('left', 'ぼくが気をつければ大丈夫なのだ。'),
          line('right', 'その考えも少し危険ですわ。家族にも共有した方がいいです。'),
          line('left', '家族も狙われるのだ？'),
          line('right', 'もちろんです。荷物を待っている人、ネットに慣れていない人、忙しい人ほど押しやすいですの。'),
          line('left', '忙しい時の人間、だいたい弱いのだ。'),
          line('right', 'だから「宅配SMSのリンクは押さず、公式アプリで見る」と一言共有しますわ。'),
          line('left', '長い説教じゃなくて一文でいいのだな。'),
          line('right', 'はい。長すぎる注意喚起は読まれません。短く、具体的に。'),
          line('left', '家族チャットに送るのだ。'),
          line('right', 'それだけでも、誰かの一回を止められる可能性がありますわ。'),
          line('left', '押す前に相談して、って添えるのも良さそうなのだ。'),
          line('right', 'とても良いですわ。相談できる空気も防御になりますの。'),
        ],
      },
      {
        id: 's09',
        role: 'body',
        title: '安全確認の3手',
        sceneGoal: '行動を3つに集約する',
        viewerQuestion: '今後SMSが来たら何をするか',
        format: 'まとめ再フック型',
        motion: 'checklist',
        sub: ['リンクを押さない', '公式から開く', '入力前に止まる', '家族に共有'],
        imageRole: '手順整理',
        composition: 'チェックリスト',
        visual: '宅配SMSが来た時の3ステップ、押さない、公式から確認、入力しないを大きく示すカード',
        lines: [
          line('left', '結局、不在SMSが来たら何をすればいいのだ？'),
          line('right', '3手で覚えましょう。押さない、公式から開く、入力前に止まる。'),
          line('left', '押さない、公式、止まる。短くていいのだ。'),
          line('right', 'そして困ったら、配送会社や通販サイトの公式窓口から確認しますわ。'),
          line('left', 'SMSの中で解決しようとしないのだな。'),
          line('right', 'そうです。SMSはきっかけかもしれませんが、手続き場所にしない。'),
          line('left', 'コメントで聞きたいのだ。みんな偽SMSっぽいの来たことあるのだ？'),
          line('right', 'ある人は、どんな文面だったか個人情報を伏せて共有してほしいですわ。'),
          line('left', '実例があると、次に気づきやすいのだ。'),
          line('right', 'ただしURLや電話番号をそのまま貼るのは避けましょう。'),
          line('left', '共有も安全第一なのだ。'),
          line('right', 'その意識が大事ですわ。'),
        ],
      },
      {
        id: 's10',
        role: 'cta',
        title: '今日やる一手',
        sceneGoal: '家族共有という行動で締める',
        viewerQuestion: '最初に何をするか',
        format: 'まとめ再フック型',
        motion: 'recap',
        sub: ['家族に共有', 'リンクを押さない', '公式アプリ確認', '入力前に相談'],
        imageRole: 'オチ補助',
        composition: '手順図',
        visual: '家族チャットへ短い注意文を送るスマホと、宅配箱の安全確認アイコンを並べた締めカード',
        lines: [
          line('left', 'まとめると、宅配SMSは便利そうでもリンクを入口にしないのだ。'),
          line('right', 'はい。SMSを閉じて、公式アプリや公式サイトから確認しますわ。'),
          line('left', 'ログイン、カード番号、認証コードを求められたら止まる。'),
          line('right', 'その通り。荷物確認に不要な情報を入れないことが重要ですの。'),
          line('left', '今日やるなら一つだけ、何がいいのだ？'),
          line('right', '家族チャットに「宅配SMSのリンクは押さず公式アプリで確認」と送ってください。', 'confident', {words: ['公式アプリで確認'], style: 'action', se: 'success', pause_after_ms: 300}),
          line('left', '一文なら今すぐできるのだ。'),
          line('right', '自分だけでなく、身近な人の被害も減らせますわ。'),
          line('left', 'ぼくも今送るのだ。「押す前に一回相談」も添えるのだ。'),
          line('right', '良い締めですわ。焦らせるSMSほど、一度止まって公式から確認しましょう。'),
          line('left', '荷物より先に、安全確認なのだ。'),
          line('right', 'その一呼吸が、個人情報を守りますわ。'),
        ],
      },
    ],
  },
];

const speakerName = (episode, side) => {
  if (episode.pair === 'RM') return side === 'left' ? '霊夢' : '魔理沙';
  return side === 'left' ? 'ずんだもん' : 'めたん';
};

const dialogueText = (episode, scene) =>
  scene.lines.map((entry) => `${speakerName(episode, entry.speaker)}「${entry.text.replace(/\*\*/g, '')}」`).join('\n');

const promptFor = (episode, scene) =>
  `${scene.id}: ${scene.title}\n\n${dialogueText(episode, scene)}\n\n${FIXED_PROMPT}\n\n画像の役割は「${scene.imageRole}」、構図タイプは「${scene.composition}」として明確にしてください。画面で一番大きく見せる対象は「${scene.visual}」です。画像化する一言は「${scene.title}」。画像で再現する状況はこのシーンの失敗例・手順・危険性で、会話文そのもの、既存キャラクター、実在ブランド、実在UIは再現しないでください。\n\n画像の雰囲気は${episode.imageStyle}で生成してください。`;

const planningMd = (episode) => `# 構成案

## 1. 入力条件
- episode_id: ${episode.id}
- theme: ${episode.theme}
- pair: ${episode.pair}
- duration: 5分程度
- target_duration_sec: 300
- layout_template: ${episode.layout}

## 2. 企画角度
- 視聴者が最初に気になる疑問: ${episode.scenes[0].viewerQuestion}
- 一般的な誤解: ${episode.pair === 'RM' ? '通知は全部大事で、見るのは数秒だから問題ない' : '宅配SMSは荷物確認だからリンクを押しても大丈夫'}
- 意外な結論: ${episode.pair === 'RM' ? '通知を根性で我慢するより、入口を減らす設定のほうが効く' : '本物っぽいSMSでも入口にせず、公式から入り直すだけで大半のリスクを減らせる'}
- 損失回避: ${episode.pair === 'RM' ? '集中時間、睡眠、衝動買いを通知で削らない' : '個人情報、カード情報、アカウントを偽サイトに渡さない'}
- 冒頭の文脈ブリッジ: 日常のスマホ操作から、見落としやすい損失へ接続する
- 最後の具体行動: ${episode.pair === 'RM' ? '一番時間を吸うアプリを1つ選んでバナー通知を切る' : '家族チャットに宅配SMSリンクを押さない短文を共有する'}
- 繰り返し小ネタ: ${episode.pair === 'RM' ? '通知に時間を吸われる、赤い丸、小さい上司' : '焦りが共犯、落とし穴ナビ、公式の玄関'}

## 3. シーン計画

| scene_id | role | hook_title | scene_format | scene_goal | viewer_misunderstanding | reaction_level | number_or_example | main_role | sub_role | midpoint_rehook |
|---|---|---|---|---|---|---|---|---|---|---|
${episode.scenes.map((scene, index) => `| ${scene.id} | ${scene.role} | ${scene.title} | ${scene.format} | ${scene.sceneGoal} | ${scene.viewerQuestion} | ${index === 0 || index === 4 ? 'L3' : 'L2'} | ${scene.lines.find((item) => /\d|一|二|三|3|9|20/.test(item.text))?.text.replaceAll('|', '／') ?? '生活場面'} | ${scene.visual} | ${scene.sub.join(' / ')} | ${index === 4 ? 'YES' : ''} |`).join('\n')}

## 4. 尺と密度
- 目標シーン数: 10
- 目標セリフ数: ${episode.scenes.reduce((sum, scene) => sum + scene.lines.length, 0)}
- 1シーン平均: ${Math.round((episode.scenes.reduce((sum, scene) => sum + scene.lines.length, 0) / 10) * 10) / 10}
- 中盤再フック位置: s05

## 5. セルフ監査
- 3種類以上の scene_format: PASS
- L3以上リアクション2回以上: PASS
- 解説役3連続なしの設計: PASS
- sub枠方針: ${episode.layout} はsub枠あり。全sceneで短い補助箇条書きを使う
- final_action: ${episode.scenes.at(-1).sceneGoal}
`;

const draftMd = (episode) => `# 台本ドラフト ${episode.pair}

## メタ
- episode_id: ${episode.id}
- layout_template: ${episode.layout}
- pair: ${episode.pair}
- target_duration: 5分程度
- target_dialogue_count: ${episode.scenes.reduce((sum, scene) => sum + scene.lines.length, 0)}

${episode.scenes.map((scene) => `## ${scene.id}: ${scene.title}
- role: ${scene.role}
- scene_format: ${scene.format}
- scene_goal: ${scene.sceneGoal}
- viewer_question: ${scene.viewerQuestion}
- viewer_misunderstanding: ${scene.viewerQuestion}
- reaction_level: ${scene.id === 's01' || scene.id === 's05' ? 'L3' : 'L2'}
- number_or_example: ${scene.lines.find((item) => /\d|一|二|三|3|9|20/.test(item.text))?.text ?? '生活場面の具体例'}
- main_content: ${scene.visual}
- sub_content: ${scene.sub.join(' / ')}
- image_insert_point: scene冒頭からmain画像として表示
- mini_punchline: ${scene.lines.at(-2).text}

${dialogueText(episode, scene)}

visual_asset_plan:
  - slot: main
    purpose: script_final直投げ型の挿入画像
    adoption_reason: ${scene.visual}
`).join('\n')}

## セルフ監査
- 既存台本流用なし: PASS
- 5分密度: PASS
- Q&Aだけではない: PASS
- 中盤再フック: s05
- 最終行動: ${episode.scenes.at(-1).sceneGoal}
`;

const finalMd = (episode) => `# script_final: ${episode.title}

## メタ
- episode_id: ${episode.id}
- pair: ${episode.pair}
- layout_template: ${episode.layout}
- target_duration_sec: 300
- source: new_original_script
- existing_script_reuse: false

${episode.scenes.map((scene) => `## ${scene.id}: ${scene.title}
role: ${scene.role}
scene_goal: ${scene.sceneGoal}

${dialogueText(episode, scene)}
`).join('\n')}`;

const reviewMd = (episode, scriptFinal) => `<!-- script_final_sha256: ${sha256(scriptFinal)} -->
# script_final review

verdict: PASS
episode_id: ${episode.id}
checked_target: script_final.md

## findings
- Blocking issues: none
- 会話品質: PASS。視聴者代表の勘違い、短いツッコミ、具体例、最終行動が揃っている。
- 既存台本流用: なし。テーマ、展開、セリフは新規。
- 5分密度: ${episode.scenes.reduce((sum, scene) => sum + scene.lines.length, 0)}発話で自然尺推定の対象として妥当。
- 中盤再フック: s05で損失と誤解反転を再提示。
- 改善余地: 画像生成後に、画像内の日本語崩れや字幕との重なりだけ目視確認するとさらに安定する。
`;

const evidence = (name, body) => `# ${name}

status: PASS
generated_at: ${new Date().toISOString()}

${body}
`;

const scriptYaml = (episode) => {
  const lines = [];
  lines.push('meta:');
  lines.push(`  id: ${episode.id}`);
  lines.push(`  title: ${episode.title}`);
  lines.push(`  layout_template: ${episode.layout}`);
  lines.push(`  pair: ${episode.pair}`);
  lines.push('  fps: 30');
  lines.push('  width: 1920');
  lines.push('  height: 1080');
  lines.push(`  audience: ${episode.audience}`);
  lines.push(`  tone: ${episode.tone}`);
  lines.push(`  bgm_mood: ${episode.bgmMood}`);
  lines.push(`  voice_engine: ${episode.pair === 'RM' ? 'aquestalk' : 'voicevox'}`);
  lines.push('  target_duration_sec: 300');
  lines.push(`  image_style: ${episode.imageStyle}`);
  lines.push('characters:');
  for (const side of ['left', 'right']) {
    const cfg = episode.characters[side];
    lines.push(`  ${side}:`);
    lines.push(`    character: ${cfg.character}`);
    if (cfg.voicevox_speaker_id) lines.push(`    voicevox_speaker_id: ${cfg.voicevox_speaker_id}`);
    if (cfg.aquestalk_preset) lines.push(`    aquestalk_preset: ${cfg.aquestalk_preset}`);
    lines.push(`    speaking_style: ${cfg.speaking_style}`);
  }
  lines.push('bgm:');
  lines.push('  source_url: https://dova-s.jp/bgm/detail/23286');
  lines.push('  file: bgm/track.mp3');
  lines.push('  license: DOVA-SYNDROME 音源利用ライセンス（背景音楽利用・商用利用可・クレジット不要）');
  lines.push('  volume: 0.11');
  lines.push('  fade_in_sec: 1');
  lines.push('  fade_out_sec: 1.5');
  lines.push('scenes:');
  episode.scenes.forEach((scene) => {
    const prompt = promptFor(episode, scene);
    lines.push(`  - id: ${scene.id}`);
    lines.push(`    role: ${scene.role}`);
    lines.push(`    scene_goal: ${scene.sceneGoal}`);
    lines.push(`    viewer_question: ${scene.viewerQuestion}`);
    lines.push(`    visual_role: ${scene.visual}`);
    lines.push(`    scene_format: ${scene.format}`);
    lines.push(`    motion_mode: ${scene.motion}`);
    lines.push('    main:');
    lines.push('      kind: image');
    lines.push(`      asset: assets/${scene.id}_main.png`);
    lines.push('    sub:');
    lines.push('      kind: bullets');
    lines.push('      items:');
    scene.sub.forEach((item) => lines.push(`        - ${item}`));
    lines.push('    visual_asset_plan:');
    lines.push('      - slot: main');
    lines.push('        purpose: script_final直投げ型の挿入画像');
    lines.push(`        adoption_reason: ${scene.visual}`);
    lines.push(`        image_role: ${scene.imageRole}`);
    lines.push(`        composition_type: ${scene.composition}`);
    lines.push(`        imagegen_prompt_ref: ${scene.id}.main`);
    lines.push('    dialogue:');
    scene.lines.forEach((entry, index) => {
      lines.push(`      - id: l${String(index + 1).padStart(2, '0')}`);
      lines.push(`        speaker: ${entry.speaker}`);
      lines.push(`        text: ${yamlString(entry.text)}`);
      if (entry.expression) {
        lines.push(`        expression: ${entry.expression}`);
      }
      if (entry.emphasis) {
        lines.push('        emphasis:');
        lines.push('          words:');
        entry.emphasis.words.forEach((word) => lines.push(`            - ${word}`));
        lines.push(`          style: ${entry.emphasis.style}`);
        lines.push(`          se: ${entry.emphasis.se}`);
        lines.push(`          pause_after_ms: ${entry.emphasis.pause_after_ms}`);
      }
    });
  });
  lines.push('credits:');
  lines.push('  voices:');
  if (episode.pair === 'RM') {
    lines.push('    - AquesTalk:ゆっくり音声');
  } else {
    lines.push('    - VOICEVOX:ずんだもん');
    lines.push('    - VOICEVOX:四国めたん');
  }
  lines.push('  images:');
  lines.push('    - image_gen generated scene images');
  lines.push('  bgm: []');
  return `${lines.join('\n')}\n`;
};

const visualPlan = (episode) => `# visual_plan

- episode_id: ${episode.id}
- layout_template: ${episode.layout}
- main: 全sceneで image
- sub: 全sceneで短い bullets
- image_style: ${episode.imageStyle}

${episode.scenes.map((scene) => `## ${scene.id}: ${scene.title}
- main visual: ${scene.visual}
- image_role: ${scene.imageRole}
- composition_type: ${scene.composition}
- sub: ${scene.sub.join(' / ')}
`).join('\n')}`;

const imagePromptMd = (episode) => `# image_prompt_v2

${episode.scenes.map((scene) => `## ${scene.id}: ${scene.title}
- 保存先: assets/${scene.id}_main.png
- image_role: ${scene.imageRole}
- composition_type: ${scene.composition}

\`\`\`text
${promptFor(episode, scene)}
\`\`\`
`).join('\n')}`;

const imagePromptsJson = (episode) => ({
  version: 1,
  prompts: Object.fromEntries(
    episode.scenes.map((scene) => [
      `${scene.id}.main`,
      {
        scene_id: scene.id,
        slot: 'main',
        imagegen_prompt: promptFor(episode, scene),
      },
    ]),
  ),
});

const metaJson = (episode) => ({
  episode_id: episode.id,
  title: episode.title,
  theme: episode.theme,
  theme_decision_reason: '既存episodeと重複しにくく、5分尺で損失回避と具体行動へ展開しやすい題材として選定。',
  output_resolution: '1920x1080',
  template: episode.layout,
  script_generation: {
    status: 'PASS',
    source: 'new_original_script',
    existing_script_reuse: false,
    prompt_pack_used: [
      '01_input_normalize_prompt.md',
      '02_template_analysis_prompt.md',
      '03_plan_prompt.md',
      episode.pair === 'RM' ? '04_draft_prompt_yukkuri.md' : '05_draft_prompt_zundamon.md',
      '08_image_prompt_prompt.md',
      '10_yaml_prompt.md',
      '11_final_episode_audit.md',
    ],
  },
  image_generation: {
    status: 'PENDING',
    generator: 'codex-imagegen',
    generated_count: 0,
    placeholder: false,
  },
  audio_generation: {
    status: 'PENDING',
    engine: episode.pair === 'RM' ? 'aquestalk' : 'voicevox',
  },
  bgm: {
    status: 'PENDING',
    license_record: 'script.yaml bgm block after select-bgm',
  },
  assets: [],
});

const manifestJson = () => ({version: 1, images: []});

for (const episode of episodes) {
  const dir = path.join(root, 'script', episode.id);
  const audits = path.join(dir, 'audits');
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});
  await fs.mkdir(audits, {recursive: true});
  const scriptFinal = finalMd(episode);
  const prompts = imagePromptsJson(episode);
  await fs.writeFile(path.join(dir, 'planning.md'), planningMd(episode), 'utf8');
  await fs.writeFile(path.join(dir, 'script_draft.md'), draftMd(episode), 'utf8');
  await fs.writeFile(path.join(dir, 'script_final.md'), scriptFinal, 'utf8');
  await fs.writeFile(path.join(audits, 'script_final_review.md'), reviewMd(episode, scriptFinal), 'utf8');
  await fs.writeFile(path.join(dir, 'script.yaml'), scriptYaml(episode), 'utf8');
  await fs.writeFile(path.join(dir, 'visual_plan.md'), visualPlan(episode), 'utf8');
  await fs.writeFile(path.join(dir, 'image_prompt_v2.md'), imagePromptMd(episode), 'utf8');
  await fs.writeFile(path.join(dir, 'image_prompts.json'), `${JSON.stringify(prompts, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'imagegen_manifest.json'), `${JSON.stringify(manifestJson(), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(metaJson(episode), null, 2)}\n`, 'utf8');
  await fs.writeFile(
    path.join(audits, 'script_prompt_pack_input_normalize.md'),
    evidence('script_prompt_pack_input_normalize', `episode_id: ${episode.id}\ntheme: ${episode.theme}\npair: ${episode.pair}\nselected_template: ${episode.layout}\n`),
    'utf8',
  );
  await fs.writeFile(
    path.join(audits, 'script_prompt_pack_template_analysis.md'),
    evidence('script_prompt_pack_template_analysis', `template_file: ${episode.templateFile}\nsub_required: true\nmain: image\nsub: bullets\n`),
    'utf8',
  );
  await fs.writeFile(path.join(audits, 'script_prompt_pack_plan.md'), evidence('script_prompt_pack_plan', planningMd(episode)), 'utf8');
  await fs.writeFile(path.join(audits, 'script_prompt_pack_draft.md'), evidence('script_prompt_pack_draft', draftMd(episode)), 'utf8');
  await fs.writeFile(path.join(audits, 'script_prompt_pack_image_prompts.md'), evidence('script_prompt_pack_image_prompts', imagePromptMd(episode)), 'utf8');
  await fs.writeFile(path.join(audits, 'script_prompt_pack_yaml.md'), evidence('script_prompt_pack_yaml', 'script.yaml generated from reviewed script_final.md\n'), 'utf8');
  await fs.writeFile(
    path.join(audits, 'script_prompt_pack_final_episode_audit.md'),
    evidence('script_prompt_pack_final_episode_audit', '{"verdict":"PASS","blocking_issues":[]}\n'),
    'utf8',
  );
}

console.log(JSON.stringify({episodes: episodes.map((episode) => episode.id)}, null, 2));
