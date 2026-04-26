import fs from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';

const rootDir = process.cwd();

const episodes = [
  {
    id: 'ep904-rm-scam-dm-stop',
    title: '詐欺DM、開く前に止まれ',
    videoType: 'ゆっくり解説',
    pair: 'RM',
    layoutTemplate: 'Scene02',
    voiceEngine: 'aquestalk',
    generatedSheet:
      'C:/Users/i0swi/.codex/generated_images/019dc756-3372-7a43-b2c7-3581f8f5e21c/ig_04049fd89926097c0169ed6756dbb08191a39a50176ac4eb6f.png',
    imageStyle: '太線フラット図解。白背景、青緑基調、警告だけ赤、文字なし。',
    characters: {
      left: {
        character: 'reimu',
        aquestalk_preset: 'れいむ',
        speaking_style: '視聴者代表。焦り、雑な理解、ツッコミを担当。',
      },
      right: {
        character: 'marisa',
        aquestalk_preset: 'まりさ',
        speaking_style: '解説役。短く訂正し、自然に「だぜ」を混ぜる。',
      },
    },
    templateMemo: {
      main_content: '左上の大きいmain枠に詐欺DMの図解を表示',
      sub_content: '右上のsub枠に3項目以内の確認メモ',
      subtitle_area: '下部白帯。25文字以内の短文字幕',
      title_area: 'title_areaなし。見出しはmain.captionで補助',
      character_layout: '下部左右端。字幕帯の左右に重ねる',
      avoid_area: '右sub枠、下字幕帯、左右キャラ領域に重要物を置かない',
    },
    scenes: [
      {
        id: 's01',
        role: 'intro',
        caption: '怪しい通知で止まる',
        sub: ['開かない', '押さない', '急がない'],
        goal: '怪しいDMは開く前に止まる必要があると刺す',
        question: '急ぎの通知は開いてよいのか',
        visual: 'mainは警告つき通知、subは最初の停止ルール',
        description: '不審なスマホ通知と警告マークを、開く前に止まる図解で示す',
        dialogue: [
          ['left', '当選DM来た、勝った？', 'happy'],
          ['right', 'まず開くな、止まれだぜ', 'serious'],
          ['left', 'え、見るだけもダメ？', 'surprise'],
          ['right', 'リンク先で誘導される', 'calm'],
          ['left', '急げって書いてあるよ', 'worry'],
          ['right', '急がせるのが手口だ', 'serious'],
          ['left', 'もう怖くなってきた', 'worry'],
          ['right', '今日は見分け方を話すぜ', 'smile'],
          ['left', '開く前に知りたい', 'calm'],
          ['right', '最初の数秒が勝負だ', 'calm'],
        ],
      },
      {
        id: 's02',
        role: 'body',
        caption: '急かす文面は疑う',
        sub: ['期限', '停止', '今すぐ'],
        goal: '期限や停止を強調する文面ほど一度止まると理解させる',
        question: '急ぎなら本物ではないのか',
        visual: 'mainはカウントダウン罠、subは危険語の例',
        description: '急かすカウントダウン通知と焦る導線を、罠として示す',
        dialogue: [
          ['left', '今日中に停止だって', 'worry'],
          ['right', '典型的な焦らせ方だぜ', 'calm'],
          ['left', '本物なら急ぐでしょ', 'worry'],
          ['right', '本物でも別経路で見られる', 'calm'],
          ['left', 'DMから行かない？', 'surprise'],
          ['right', '公式アプリから開くんだ', 'smile'],
          ['left', '一手間ふえるなあ', 'worry'],
          ['right', '事故より安い一手間だぜ', 'smile'],
          ['left', '急ぐほど遠回りね', 'calm'],
          ['right', 'それが安全な順番だ', 'calm'],
        ],
      },
      {
        id: 's03',
        role: 'body',
        caption: '当選と無料は釣り針',
        sub: ['高額当選', '無料', '手数料'],
        goal: 'うますぎる話は個人情報や手数料へ誘導されると示す',
        question: '当選DMはどこが危険か',
        visual: 'mainは賞品箱と釣り針、subはよくある誘い文句',
        description: '無料賞品の箱と釣り針を組み合わせ、うますぎる話の危険を表す',
        dialogue: [
          ['left', '無料ギフトは嬉しいよ', 'smile'],
          ['right', '無料ほど入口に注意だぜ', 'serious'],
          ['left', '送料だけなら安い？', 'worry'],
          ['right', 'カード情報を狙うことがある', 'calm'],
          ['left', 'それは詰みじゃん', 'surprise'],
          ['right', '少額で油断させるんだ', 'calm'],
          ['left', '釣り針が小さいのね', 'worry'],
          ['right', 'そう、見えにくい針だぜ', 'smile'],
          ['left', '当選より確認が先', 'calm'],
          ['right', '喜ぶ前に止まるんだ', 'calm'],
        ],
      },
      {
        id: 's04',
        role: 'body',
        caption: 'リンクは迷路になる',
        sub: ['短縮URL', '別サイト', '入力画面'],
        goal: 'DM内リンクを押さず、入力画面へ進まない判断を作る',
        question: 'リンクを押すだけなら安全か',
        visual: 'mainはリンクから危険迷路へ入る図、subは危険な遷移',
        description: 'リンクが迷路に変わり、入力画面へ誘導される危険を表す',
        dialogue: [
          ['left', '押すだけなら平気？', 'worry'],
          ['right', 'そこから迷路に入るぜ', 'serious'],
          ['left', '迷路って何？', 'worry'],
          ['right', '別サイトへ飛ばされる', 'calm'],
          ['left', '見た目が本物なら？', 'worry'],
          ['right', '見た目は真似できる', 'serious'],
          ['left', 'うわ、信用できない', 'surprise'],
          ['right', 'だから入口を変えるんだ', 'smile'],
          ['left', '公式から入り直す', 'calm'],
          ['right', 'その癖が守ってくれる', 'calm'],
        ],
      },
      {
        id: 's05',
        role: 'body',
        caption: '公式ルートで確認',
        sub: ['検索しない', '公式アプリ', '通知欄'],
        goal: '安全確認はDMではなく公式アプリやブックマークから行うと示す',
        question: '安全に確認する経路は何か',
        visual: 'mainは危険リンクと公式ルートの分岐、subは確認手順',
        description: '危険な近道と安全な公式ルートを分ける分岐図',
        dialogue: [
          ['left', 'じゃあ何で確認する？', 'worry'],
          ['right', '公式アプリから見るだぜ', 'calm'],
          ['left', '検索でもいい？', 'worry'],
          ['right', '広告や偽サイトもある', 'serious'],
          ['left', '安全ルート意外と狭い', 'surprise'],
          ['right', '登録済みアプリが無難だ', 'calm'],
          ['left', 'ブックマークもあり？', 'smile'],
          ['right', '自分で保存した物ならな', 'smile'],
          ['left', 'DMは入口にしない', 'calm'],
          ['right', 'これが中盤の結論だぜ', 'smile'],
        ],
      },
      {
        id: 's06',
        role: 'body',
        caption: '個人情報は盾で守る',
        sub: ['住所', 'カード', '認証コード'],
        goal: '入力してはいけない情報を3つに絞る',
        question: '何を入力すると危険か',
        visual: 'mainは個人情報を守る盾、subは入力禁止の代表例',
        description: '住所、カード、認証コードを盾で守る抽象図解',
        dialogue: [
          ['left', '名前くらいなら平気？', 'worry'],
          ['right', '情報はつながるんだぜ', 'serious'],
          ['left', 'つながる？', 'worry'],
          ['right', '住所やカードへ進む', 'calm'],
          ['left', '認証コードは？', 'worry'],
          ['right', '絶対に渡さない', 'serious'],
          ['left', 'それは鍵そのものね', 'surprise'],
          ['right', 'まさに最後の鍵だぜ', 'calm'],
          ['left', '聞かれたら閉じる', 'calm'],
          ['right', '入力前に相談でいい', 'smile'],
        ],
      },
      {
        id: 's07',
        role: 'outro',
        caption: '支払い前に確認する',
        sub: ['家族', '友人', '公式窓口'],
        goal: '支払い前に第三者確認を入れることで被害を止める',
        question: '不安なとき誰に聞くか',
        visual: 'mainは支払い前の確認フロー、subは相談先',
        description: '支払いボタンの前で第三者確認を挟む安全フロー',
        dialogue: [
          ['left', '支払い前なら遅い？', 'worry'],
          ['right', 'そこで止まれば間に合う', 'calm'],
          ['left', '誰に聞けばいい？', 'worry'],
          ['right', '家族か公式窓口だぜ', 'smile'],
          ['left', '恥ずかしい気もする', 'worry'],
          ['right', '被害よりずっと軽い', 'calm'],
          ['left', 'たしかに安い相談だ', 'calm'],
          ['right', '焦りは外に出すんだ', 'smile'],
          ['left', '一人で決めない', 'calm'],
          ['right', 'それだけで防げる', 'calm'],
        ],
      },
      {
        id: 's08',
        role: 'cta',
        caption: '止まる、確認、ブロック',
        sub: ['止まる', '公式確認', 'ブロック'],
        goal: '視聴後に実行する3手順へ落とす',
        question: '今日なにをすればよいか',
        visual: 'mainは止まる確認ブロックの3ステップ、subは最終行動',
        description: '止まる、公式確認、ブロックの3ステップ行動図',
        dialogue: [
          ['left', '今日やることは？', 'worry'],
          ['right', '怪しいDMを一つ見る', 'calm'],
          ['left', '開かずに確認？', 'calm'],
          ['right', '公式アプリから見るだぜ', 'smile'],
          ['left', '不要ならブロック', 'calm'],
          ['right', '通報もできるならやる', 'calm'],
          ['left', '家族にも共有する', 'smile'],
          ['right', 'それで次の被害も減る', 'smile'],
          ['left', '止まる癖をつけるわ', 'happy'],
          ['right', '急ぐDMほど止まろう', 'smile'],
        ],
      },
    ],
  },
  {
    id: 'ep905-zm-ai-copy-trust',
    title: 'AI文章コピペで信頼を落とす理由',
    videoType: 'ずんだもん解説',
    pair: 'ZM',
    layoutTemplate: 'Scene10',
    voiceEngine: 'voicevox',
    generatedSheet:
      'C:/Users/i0swi/.codex/generated_images/019dc756-3372-7a43-b2c7-3581f8f5e21c/ig_04049fd89926097c0169ed66e7a15881919d553d23610bd7cb.png',
    imageStyle: '太線フラット図解。モノクロ背景でも読める高コントラスト、緑と青緑をアクセント、文字なし。',
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '視聴者代表。浅い理解、驚き、ボケを担当。語尾は自然にのだ。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '解説役。冷静に刺し、対処まで落とす。',
      },
    },
    templateMemo: {
      main_content: '左上のmain枠にAI文章と信頼低下の図解を表示',
      sub_content: '右上のsub枠に3項目以内の確認メモ',
      subtitle_area: '下部字幕枠。25文字以内の短文字幕',
      title_area: 'title_areaなし。見出しはmain.captionで補助',
      character_layout: '下部左右端。字幕帯左右に重ねる',
      avoid_area: '右sub枠、下字幕帯、左右キャラ領域に重要物を置かない',
    },
    scenes: [
      {
        id: 's01',
        role: 'intro',
        caption: 'コピペ文章で信頼が落ちる',
        sub: ['そのままNG', '違和感', '信用低下'],
        goal: 'AI文の丸写しが信頼低下につながると刺す',
        question: 'AI文をそのまま使ってよいのか',
        visual: 'mainはAI文と警告、subは最初の論点',
        description: 'AI生成文をそのまま投稿して警告サインが出る図解',
        dialogue: [
          ['left', 'AI文そのまま出すのだ', 'smile'],
          ['right', 'それ、信頼を落とすわ', 'serious'],
          ['left', 'え、時短なのに？', 'surprise'],
          ['right', '読者は違和感に気づくの', 'calm'],
          ['left', 'そんなにバレるのだ？', 'worry'],
          ['right', '同じ匂いが出るのよ', 'calm'],
          ['left', '匂いって怖いのだ', 'worry'],
          ['right', '今日は直し方まで話すわ', 'smile'],
          ['left', 'コピペ卒業なのだ', 'calm'],
          ['right', 'そこが入口ね', 'calm'],
        ],
      },
      {
        id: 's02',
        role: 'body',
        caption: '同じ型が並ぶ',
        sub: ['一般論', '同じ結論', '薄い具体例'],
        goal: 'AI丸写しは同じ構成になりやすいと示す',
        question: 'なぜAI文は似るのか',
        visual: 'mainは同じ投稿が並ぶ複製イメージ、subは似る原因',
        description: '似た投稿が横並びになり、複製感が出る図解',
        dialogue: [
          ['left', 'なんで似るのだ？', 'worry'],
          ['right', '一般論で整うからよ', 'calm'],
          ['left', '整うなら良くない？', 'worry'],
          ['right', '整いすぎると弱いわ', 'serious'],
          ['left', '個性が消えるのだ', 'surprise'],
          ['right', '経験が見えないのよ', 'calm'],
          ['left', '誰でも言えそうだね', 'worry'],
          ['right', 'そこが信頼を削るの', 'serious'],
          ['left', '具体例が必要なのだ', 'calm'],
          ['right', '自分の文脈が大事ね', 'smile'],
        ],
      },
      {
        id: 's03',
        role: 'body',
        caption: '信頼メーターが下がる',
        sub: ['誰向け不明', '根拠なし', 'CTA弱い'],
        goal: '読者の信頼が下がる具体要因を3つに分ける',
        question: 'どこで信頼を失うのか',
        visual: 'mainは信頼メーター低下、subは低下要因',
        description: '読者の信頼メーターが下がる抽象図解',
        dialogue: [
          ['left', 'どこで信頼が落ちるのだ？', 'worry'],
          ['right', '誰向けかぼやける時ね', 'calm'],
          ['left', 'みんな向けはダメ？', 'worry'],
          ['right', '誰にも刺さらないわ', 'serious'],
          ['left', 'それ普通にやりがち', 'worry'],
          ['right', '根拠がない時も危ない', 'calm'],
          ['left', '強そうな断言なのだ', 'surprise'],
          ['right', '根拠なしは逆効果よ', 'serious'],
          ['left', '最後の行動も要るね', 'calm'],
          ['right', '読後の一歩まで作るの', 'smile'],
        ],
      },
      {
        id: 's04',
        role: 'body',
        caption: '人間の修正を入れる',
        sub: ['対象', '体験', '一文目'],
        goal: 'AI出力には人間の文脈と修正が必要と示す',
        question: 'どう直せばよいか',
        visual: 'mainはAI出力に鉛筆で修正、subは修正ポイント',
        description: 'AI文に人間が赤ペンを入れて整える図解',
        dialogue: [
          ['left', '直すって何をするのだ？', 'worry'],
          ['right', 'まず対象を狭めるの', 'calm'],
          ['left', '初心者向け、とか？', 'smile'],
          ['right', 'もっと具体でいいわ', 'smile'],
          ['left', '昨日困った人向け？', 'worry'],
          ['right', 'その方が刺さるのよ', 'calm'],
          ['left', '体験も足すのだ？', 'calm'],
          ['right', '小さな実例が強いわ', 'smile'],
          ['left', '一文目も直すのだ', 'calm'],
          ['right', '入口で読むか決まるわ', 'serious'],
        ],
      },
      {
        id: 's05',
        role: 'body',
        caption: 'Before Afterで変える',
        sub: ['抽象', '具体', '行動'],
        goal: '抽象文を具体行動へ直す手順を見せる',
        question: 'どのくらい変えるべきか',
        visual: 'mainはBefore Afterの投稿改善、subは変換軸',
        description: '抽象的な文章が具体的な行動文へ改善される図解',
        dialogue: [
          ['left', 'どのくらい直すのだ？', 'worry'],
          ['right', '抽象を具体に変えるの', 'calm'],
          ['left', '頑張りましょう、みたいな？', 'worry'],
          ['right', 'それは弱いわ', 'serious'],
          ['left', '今日一つ保存する、なら？', 'smile'],
          ['right', 'かなり良くなるわね', 'smile'],
          ['left', '行動まで見えるのだ', 'calm'],
          ['right', '読者が迷わないの', 'calm'],
          ['left', '中盤の答えなのだ', 'happy'],
          ['right', 'AI文は材料にするのよ', 'smile'],
        ],
      },
      {
        id: 's06',
        role: 'body',
        caption: '事実、口調、CTAを見る',
        sub: ['事実', '口調', 'CTA'],
        goal: '公開前チェックを3項目に絞る',
        question: '公開前に何を見るか',
        visual: 'mainは3項目チェックリスト、subも確認軸',
        description: '事実、口調、CTAを確認するシンプルなチェック図',
        dialogue: [
          ['left', '公開前チェックは？', 'worry'],
          ['right', '事実、口調、CTAよ', 'calm'],
          ['left', '三つだけなのだ？', 'surprise'],
          ['right', 'まずはそれで十分ね', 'smile'],
          ['left', '事実ミスは怖いのだ', 'worry'],
          ['right', '信用を一気に落とすわ', 'serious'],
          ['left', '口調も見るのだ？', 'calm'],
          ['right', '自分らしさが出る所よ', 'smile'],
          ['left', 'CTAは次の行動だね', 'calm'],
          ['right', 'そこまで直して公開ね', 'calm'],
        ],
      },
      {
        id: 's07',
        role: 'outro',
        caption: 'テンプレは型として使う',
        sub: ['丸写ししない', '素材にする', '毎回直す'],
        goal: 'テンプレはコピペではなく改善の型として使うとまとめる',
        question: 'テンプレ利用は悪いのか',
        visual: 'mainはテンプレをワークフローとして使う図解、subは使い方',
        description: 'テンプレートをコピーではなく作業フローとして使う図解',
        dialogue: [
          ['left', 'テンプレもダメなのだ？', 'worry'],
          ['right', '使い方次第ですわ', 'calm'],
          ['left', '丸写しがダメ？', 'calm'],
          ['right', 'そう、型として使うの', 'smile'],
          ['left', '材料を入れ替えるのだ', 'smile'],
          ['right', '体験と対象を足すわ', 'calm'],
          ['left', '毎回ちょっと直す', 'calm'],
          ['right', 'それで自分の文になる', 'smile'],
          ['left', 'AIは下書きなのだ', 'happy'],
          ['right', '最後は人間が磨くの', 'smile'],
        ],
      },
      {
        id: 's08',
        role: 'cta',
        caption: '一投稿だけ直す',
        sub: ['保存', '修正', '公開'],
        goal: '視聴後に一投稿を修正して保存する行動へ落とす',
        question: '今日なにをすればよいか',
        visual: 'mainは1投稿を保存して修正する最終行動、subは3手順',
        description: 'プロンプトを保存し、一投稿だけ修正して公開する行動図',
        dialogue: [
          ['left', '今日なにをするのだ？', 'worry'],
          ['right', 'AI文を一つ選ぶの', 'calm'],
          ['left', 'そのまま出さない？', 'smile'],
          ['right', '対象と体験を足すわ', 'smile'],
          ['left', '事実も確認するのだ', 'calm'],
          ['right', '最後にCTAを置くの', 'calm'],
          ['left', '一投稿だけならできる', 'happy'],
          ['right', '直した型を保存してね', 'smile'],
          ['left', 'コピペ卒業なのだ', 'happy'],
          ['right', '信頼はそこで守れるわ', 'smile'],
        ],
      },
    ],
  },
];

const promptFor = ({episode, scene, slot}) =>
  [
    `【用途】${scene.id} ${slot}枠。${episode.videoType}で「${scene.caption}」を一瞬で理解させる素材。`,
    `【主題】${scene.description}`,
    `【構図】主役を中央大きめ、補助アイコンは左右上部に少量。下部字幕帯と左右キャラ位置は空ける。`,
    `【テンプレート枠】${episode.layoutTemplate} の ${slot}枠に収める。右sub枠、下字幕帯、左右キャラ領域に重要物を置かない。`,
    '【色】白または淡い背景、主色は青緑、注意だけ赤、影は薄く、全シーンで色味を揃える。',
    '【情報量】1枚1メッセージ。画像内文字なし。細部を詰めず遠目でも読める。',
    `【絵柄】${episode.imageStyle} ゆっくり/ずんだもん解説向けの太線フラット図解。`,
    '【禁止】実在人物、既存キャラクター、ブランドロゴ、実在UI模写、英語UI、細かい文字、密な表、写真風人物。',
  ].join('');

const makeScene = (episode, scene, index) => ({
  id: scene.id,
  role: scene.role,
  scene_goal: scene.goal,
  viewer_question: scene.question,
  visual_role: scene.visual,
  main: {
    kind: 'image',
    asset: `assets/${scene.id}_main.png`,
    caption: scene.caption,
    asset_requirements: {
      description: scene.description,
      imagegen_prompt: promptFor({episode, scene, slot: 'main'}),
      style: `${episode.videoType}向け、16:9、余白多め、文字なし`,
      aspect: '16:9',
    },
  },
  sub: {
    kind: 'bullets',
    items: scene.sub,
  },
  visual_asset_plan: [
    {
      slot: 'main',
      purpose: scene.description,
      insert_timing: `${scene.id} の l01 直前から表示`,
      asset: `assets/${scene.id}_main.png`,
      imagegen_prompt: promptFor({episode, scene, slot: 'main'}),
      audit_points: ['1枚1メッセージ', `${episode.layoutTemplate}のmain枠に収まる`, 'ロゴや細かい文字がない'],
    },
    {
      slot: 'sub',
      purpose: '右サブ枠で要点を3項目に整理する',
      insert_timing: `${scene.id} 全体で表示`,
      audit_points: ['3項目以内', 'mainと役割が違う', '字幕を邪魔しない'],
    },
  ],
  dialogue: scene.dialogue.map(([speaker, text, expression], lineIndex) => ({
    id: `l${String(lineIndex + 1).padStart(2, '0')}`,
    speaker,
    text,
    expression,
    pre_pause_sec: lineIndex === 0 ? 0.14 : 0.08,
    post_pause_sec: lineIndex >= scene.dialogue.length - 2 ? 0.28 : 0.2,
  })),
});

const buildScript = (episode) => ({
  meta: {
    id: episode.id,
    title: episode.title,
    layout_template: episode.layoutTemplate,
    scene_template: episode.layoutTemplate,
    pair: episode.pair,
    fps: 30,
    width: 1280,
    height: 720,
    audience: 'SNSやスマホ利用で失敗を避けたい初心者',
    tone: '短く刺すが、不安だけで終わらせず対処まで出す',
    bgm_mood: '軽く緊張感のある解説用',
    voice_engine: episode.voiceEngine,
    target_duration_sec: 180,
    image_style: episode.imageStyle,
    typography: {
      subtitle_family: 'gothic',
      content_family: 'gothic',
      title_family: 'gothic',
    },
  },
  characters: episode.characters,
  scenes: episode.scenes.map((scene, index) => makeScene(episode, scene, index)),
});

const speakerName = (episode, speaker) => {
  if (episode.pair === 'RM') {
    return speaker === 'left' ? '霊夢' : '魔理沙';
  }
  return speaker === 'left' ? 'ずんだもん' : 'めたん';
};

const buildMarkdown = (episode, script) => {
  const lines = [
    `# ${episode.title}`,
    '',
    `- episode_id: ${episode.id}`,
    `- 動画タイプ: ${episode.videoType}`,
    '- 想定尺: 約3分',
    `- layout_template: ${episode.layoutTemplate}`,
    '',
    '## テンプレート読取',
    ...Object.entries(episode.templateMemo).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## 本編台本',
  ];

  for (const scene of script.scenes) {
    lines.push('', `### ${scene.id}: ${scene.main.caption}`);
    lines.push(`- scene_goal: ${scene.scene_goal}`);
    lines.push(`- viewer_question: ${scene.viewer_question}`);
    lines.push(`- visual_role: ${scene.visual_role}`);
    lines.push(`- image_insert_point: ${scene.id} の l01 直前`);
    lines.push(`- asset_path: script/${episode.id}/${scene.main.asset}`);
    lines.push(`- sub_content: ${scene.sub.items.join(' / ')}`);
    for (const line of scene.dialogue) {
      lines.push(`${speakerName(episode, line.speaker)}：${line.text}`);
    }
  }

  lines.push('', '## セルフ監査', '- 8シーン80セリフで3分尺の密度を確保', '- 全セリフ25文字以内', '- 全シーンにimage gen由来のmain画像を配置', '- 最終行動は2アクション以上');
  return `${lines.join('\n')}\n`;
};

const buildEditingNotes = (episode, script) => {
  const rows = script.scenes.map((scene, index) => {
    const se = index === 0 ? 'ドン' : index === 4 ? 'ポン' : index === 7 ? 'ポチッ' : '';
    return `| ${scene.id} | ${scene.role} | ${scene.main.asset} / sub: ${scene.sub.items.join('・')} | 白文字+黒縁 | 画像フェード、要点で軽くズーム | 発話側を少し前面 | ${se} | なし | ${scene.scene_goal} |`;
  });

  return `# 編集演出指示書

## 1. 全体設定

- 動画タイプ：${episode.videoType}
- 画面比率：16:9
- 解像度：1280x720
- 想定尺：約3分
- 編集環境：Remotion
- 通常字幕フォント：けいふぉんと
- 通常字幕スタイル：白文字 + 太い黒縁 + 軽い影
- 使用テンプレート：${episode.layoutTemplate}

## 2. シーン別演出

| scene_id | パート | 表示素材 | 字幕スタイル | 画面演出 | キャラ演出 | SE | BGM | 備考 |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## 3. 実装時の注意

- 同じ画像役割を45秒以上続けない
- sub枠は3項目以内で読みやすくする
- 字幕は25文字以内の短文を維持する
- BGMなしでも声を最優先にする
`;
};

const buildMeta = (episode, script) => ({
  episode_id: episode.id,
  title: episode.title,
  layout_template: episode.layoutTemplate,
  generated_at: new Date().toISOString(),
  generator: 'Codex built-in image_gen plus project episode generator',
  generated_asset_sheet: episode.generatedSheet,
  assets: script.scenes.map((scene) => ({
    file: scene.main.asset,
    scene_id: scene.id,
    slot: 'main',
    title: `${episode.title} - ${scene.main.caption}`,
    purpose: scene.visual_asset_plan[0].purpose,
    adoption_reason: `${episode.layoutTemplate}のmain枠で1シーン1メッセージを視覚化するため`,
    source_url: episode.generatedSheet,
    source_site: 'OpenAI image generation',
    source_type: 'image_gen',
    license: 'AI-generated image asset for this project',
    imagegen_prompt: scene.main.asset_requirements.imagegen_prompt,
    imagegen_model: 'built-in image_gen',
    credit_required: false,
  })),
});

const ensureDir = async (dirPath) => fs.mkdir(dirPath, {recursive: true});

for (const episode of episodes) {
  const episodeDir = path.join(rootDir, 'script', episode.id);
  await fs.rm(episodeDir, {recursive: true, force: true});
  await ensureDir(path.join(episodeDir, 'assets'));
  await ensureDir(path.join(episodeDir, 'audio'));
  await ensureDir(path.join(episodeDir, 'se'));
  await ensureDir(path.join(episodeDir, 'audits'));
  const script = buildScript(episode);
  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script, {lineWidth: 0}), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), `${JSON.stringify(buildMeta(episode, script), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.md'), buildMarkdown(episode, script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_image_points.md'), buildMarkdown(episode, script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_editing_notes.md'), buildEditingNotes(episode, script), 'utf8');
}

console.log(JSON.stringify({episodes: episodes.map((episode) => episode.id)}, null, 2));
