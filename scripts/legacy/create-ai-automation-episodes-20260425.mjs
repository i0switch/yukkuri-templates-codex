import fs from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';

import {blockLegacyEpisodeGenerator} from './legacy-generator-guard.mjs';

blockLegacyEpisodeGenerator('create-ai-automation-episodes-20260425.mjs');

const rootDir = process.cwd();
const sourceBgm = path.join(rootDir, 'script', 'ep000-test-all-21-scenes', 'bgm', 'track.mp3');
const notebookRoot = path.join(rootDir, 'notebookLM', 'workspace', 'projects', 'ai-automation-20260425');

const promptFor = ({typeLabel, sceneId, caption, tone}) =>
  [
    `【用途】${sceneId} main枠。${typeLabel}動画で「${caption}」を一瞬で理解させる素材。`,
    `【主題】画面中央に「${caption}」を象徴する大きな図解モチーフを置く。`,
    '【構図】主役オブジェクトを中央大きめ、補助アイコンは左上または背景に少量。右サブ枠と下部字幕帯を邪魔しない横長配置。',
    '【テンプレート枠】Scene02 の main枠に収める。右sub枠、下字幕帯、左右キャラ領域に重要物を置かない。',
    `【色】トーンは${tone}。白または淡い背景、主色は青、アクセントは黄色、警告だけ赤。`,
    '【情報量】1枚1メッセージ。画像内文字なし。遠目でも見やすい余白を左右と下部に残す。',
    '【絵柄】ゆっくり/ずんだもん解説向けの太線フラット図解、角丸、余白多め、meta.image_styleと統一。',
    '【禁止】細かい文字、英語UI、ブランドロゴ、実在人物、既存キャラクター、実在UI模写、密なUI、写真風人物。',
  ].join('');

const baseMeta = ({id, title, pair, voiceEngine, tone, characters}) => ({
  id,
  title,
  layout_template: 'Scene02',
  scene_template: 'Scene02',
  pair,
  fps: 30,
  width: 1280,
  height: 720,
  audience: 'AI活用と業務効率化を始めたい初心者',
  tone,
  bgm_mood: '軽快で実務的',
  voice_engine: voiceEngine,
  target_duration_sec: 300,
  image_style: 'NotebookLM生成の解説用インフォグラフィック。Scene02 main枠向け、余白多め。',
  typography: {
    subtitle_family: 'gothic',
    content_family: 'gothic',
    title_family: 'gothic',
  },
  characters,
});

const line = (id, speaker, text, expression = 'smile') => ({
  id,
  speaker,
  text,
  expression,
  pre_pause_sec: 0.2,
  post_pause_sec: 0.85,
});

const buildScene = ({typeLabel, tone, id, role, caption, source, bullets, goal, question, visualRole, lines}) => ({
  id,
  source,
  role,
  scene_goal: goal,
  viewer_question: question,
  visual_role: visualRole,
  main: {
    kind: 'image',
    asset: `assets/${id}_main.png`,
    caption,
    asset_requirements: {
      description: `${caption}をScene02のmain枠で見やすい図解として表示する`,
      imagegen_prompt: promptFor({typeLabel, sceneId: id, caption, tone}),
      style: `${typeLabel}向け。横長、余白多め、細かい文字なし`,
      aspect: '16:9',
      notebooklm_source: source,
    },
  },
  sub: {
    kind: 'bullets',
    items: bullets,
  },
  dialogue: lines.map((entry, index) => line(`l${String(index + 1).padStart(2, '0')}`, ...entry)),
  visual_asset_plan: [
    {
      slot: 'main',
      purpose: `${caption}を一目で理解させる`,
      insert_timing: `${id} の l01 直前から表示`,
      asset: `assets/${id}_main.png`,
      imagegen_prompt: promptFor({typeLabel, sceneId: id, caption, tone}),
      audit_points: ['1枚1メッセージになっている', 'Scene02のmain枠に収まる', '細かい文字やロゴがない'],
    },
    {
      slot: 'sub',
      purpose: '右サブ枠で要点を3項目以内に整理する',
      insert_timing: `${id} 全体で表示`,
      audit_points: ['3項目以内', 'mainと役割が違う', '字幕を邪魔しない'],
    },
  ],
});

const rmScenes = [
  {
    id: 's01',
    role: 'intro',
    caption: '得する自動化と損する自動化',
    source: 'fig_1.png',
    bullets: ['丸投げNG', '確認が先', '型で得する'],
    goal: 'AI自動化は全員が得するわけではないと刺す',
    question: 'AIを使えば得するんじゃないの？',
    visualRole: 'mainは損得分岐、subは今日の論点を示す',
    lines: [
      ['left', 'AI使えば得でしょ？', 'smile'],
      ['right', '実は逆も多いぜ', 'calm'],
      ['left', 'え、損するの？', 'surprise'],
      ['right', '使い方次第だな', 'calm'],
      ['left', '急に怖いんだけど', 'worry'],
      ['right', '今日は境目を分けるぜ', 'smile'],
      ['left', '難しい設定の話？', 'worry'],
      ['right', '見る場所はシンプルだぜ', 'smile'],
      ['left', 'それなら聞きたいわ', 'smile'],
      ['right', 'まず誤解からだな', 'calm'],
    ],
  },
  {
    id: 's02',
    role: 'body',
    caption: '自動化は丸投げではない',
    source: 'info_1.png',
    bullets: ['目的', '手順', '確認'],
    goal: '自動化は判断まで放置することではないと理解させる',
    question: '放置でいいんじゃないの？',
    visualRole: 'mainは人間とAIの分担、subは3つの前提',
    lines: [
      ['right', '自動化は丸投げじゃない', 'calm'],
      ['left', 'じゃあ何なの？', 'worry'],
      ['right', '手順を任せることだ', 'smile'],
      ['left', '判断は人間なのね', 'calm'],
      ['right', 'そこを忘れると危ない', 'serious'],
      ['left', '放置はダメってことね', 'worry'],
      ['right', '目的がないとズレるぜ', 'calm'],
      ['left', '作業名だけじゃ弱い？', 'worry'],
      ['right', '範囲が広すぎるんだ', 'serious'],
      ['left', '先に分けるのね', 'calm'],
    ],
  },
  {
    id: 's03',
    role: 'body',
    caption: '目的なしで出力だけ増える',
    source: 'info_2.png',
    bullets: ['目的なし', '出力過多', '手戻り増'],
    goal: '目的なしAI利用が時間を溶かす理由を示す',
    question: '何が無駄になるの？',
    visualRole: 'mainは迷走ループ、subは損する特徴',
    lines: [
      ['left', '損する人って誰？', 'worry'],
      ['right', '目的がない人だぜ', 'calm'],
      ['left', '便利そうに触る人？', 'worry'],
      ['right', 'そう、出力だけ増える', 'serious'],
      ['left', 'それ普通に疲れるね', 'worry'],
      ['right', '時間を溶かすんだ', 'calm'],
      ['left', 'AIなのに時短じゃない？', 'surprise'],
      ['right', '選別で時間を食うぜ', 'serious'],
      ['left', '紙の山みたいね', 'worry'],
      ['right', '整理なしだとそうなる', 'calm'],
    ],
  },
  {
    id: 's04',
    role: 'body',
    caption: '得する人は型を持つ',
    source: 'info_3.png',
    bullets: ['入力', '基準', '修正'],
    goal: '得する人はテンプレートと確認基準を持つと示す',
    question: 'どう使えば得なの？',
    visualRole: 'mainは型の流れ、subは得する3条件',
    lines: [
      ['left', '得する人は何が違うの？', 'worry'],
      ['right', '型を持ってるんだ', 'smile'],
      ['left', '型ってテンプレ？', 'calm'],
      ['right', 'そうだぜ', 'smile'],
      ['left', '毎回悩まないのか', 'surprise'],
      ['right', 'そこが強いんだ', 'calm'],
      ['left', '入力も決めるの？', 'worry'],
      ['right', '基準も先に置くぜ', 'calm'],
      ['left', '修正しやすそうね', 'smile'],
      ['right', '再現性が出るんだ', 'smile'],
    ],
  },
  {
    id: 's05',
    role: 'body',
    caption: '差はツールより運用に出る',
    source: 'info_4.png',
    bullets: ['入力品質', '確認基準', '改善回数'],
    goal: '高性能AIより運用の差が成果を分けると転換する',
    question: '高いAIなら勝てる？',
    visualRole: 'mainは運用の天秤、subは差が出る場所',
    lines: [
      ['left', '高いAIなら勝てる？', 'worry'],
      ['right', 'そこが誤解だぜ', 'serious'],
      ['left', '違うの？', 'surprise'],
      ['right', '差は運用に出る', 'calm'],
      ['left', 'ツールじゃないんだ', 'worry'],
      ['right', '仕組みが本体だな', 'calm'],
      ['left', 'ちょっと地味ね', 'calm'],
      ['right', 'でも効くのはそこだぜ', 'smile'],
      ['left', '派手さより安定？', 'worry'],
      ['right', '長く勝つなら安定だ', 'calm'],
    ],
  },
  {
    id: 's06',
    role: 'body',
    caption: 'SNS投稿で差が出る',
    source: 'slide_1_p01.png',
    bullets: ['一発出しNG', '修正する', '資産化する'],
    goal: 'SNS投稿作成を例にAI自動化の損得を具体化する',
    question: '実際どこで差が出る？',
    visualRole: 'mainは投稿生成フロー、subはNGとOK',
    lines: [
      ['left', '投稿作りで例えて', 'smile'],
      ['right', '一発出しは危ない', 'serious'],
      ['left', 'たまに見るやつだ', 'worry'],
      ['right', 'AI臭さが残るんだ', 'calm'],
      ['left', '得する人は？', 'worry'],
      ['right', '直して資産にする', 'smile'],
      ['left', '資産って何？', 'worry'],
      ['right', '次も使える型だぜ', 'calm'],
      ['left', '毎回育てる感じね', 'smile'],
      ['right', 'それが積み上がる', 'smile'],
    ],
  },
  {
    id: 's07',
    role: 'body',
    caption: '任せる範囲を分ける',
    source: 'slide_1_p02.png',
    bullets: ['作業は任せる', '判断は持つ', '事実を見る'],
    goal: 'AIに任せる作業と人間が見る仕事を分ける',
    question: '何を任せていい？',
    visualRole: 'mainは境界線、subは確認3点',
    lines: [
      ['left', '何を任せればいい？', 'worry'],
      ['right', '作業は任せていい', 'calm'],
      ['left', '判断は？', 'worry'],
      ['right', '人間が持つべきだ', 'serious'],
      ['left', '事実確認も？', 'surprise'],
      ['right', 'そこは絶対だな', 'serious'],
      ['left', '最後は私が見るのね', 'calm'],
      ['right', '責任者は自分だぜ', 'calm'],
      ['left', '部下に近い感じ？', 'worry'],
      ['right', 'かなり近いな', 'smile'],
    ],
  },
  {
    id: 's08',
    role: 'body',
    caption: '小さく試してから広げる',
    source: 'slide_1_p03.png',
    bullets: ['一工程だけ', '結果を見る', '次に広げる'],
    goal: '最初から全部自動化しない実践手順を示す',
    question: '全部自動化したら強い？',
    visualRole: 'mainは小さな階段、subは導入順',
    lines: [
      ['left', '全部自動化したら強い？', 'worry'],
      ['right', '最初は危ないぜ', 'serious'],
      ['left', '欲張っちゃダメ？', 'worry'],
      ['right', '一工程だけでいい', 'calm'],
      ['left', '小さすぎない？', 'surprise'],
      ['right', '小さい方が直せる', 'smile'],
      ['left', '失敗も軽いのね', 'calm'],
      ['right', 'だから続けやすい', 'smile'],
      ['left', '広げるのは後ね', 'calm'],
      ['right', '勝ってから広げるぜ', 'smile'],
    ],
  },
  {
    id: 's09',
    role: 'outro',
    caption: '損しない判断基準3つ',
    source: 'slide_1_p04.png',
    bullets: ['目的', '型', '確認'],
    goal: 'AI自動化で損しないための判断基準を回収する',
    question: '結局何を守ればいい？',
    visualRole: 'mainは3条件まとめ、subは今日の結論',
    lines: [
      ['right', '今日の結論は三つだぜ', 'smile'],
      ['left', '目的、型、確認ね', 'calm'],
      ['right', 'この順番が大事だ', 'calm'],
      ['left', '道具はその後なのね', 'worry'],
      ['right', '先に仕組みを見るんだ', 'calm'],
      ['left', '丸投げは卒業ね', 'smile'],
      ['right', '確認込みで自動化だぜ', 'smile'],
      ['left', '人に話せそうだわ', 'smile'],
      ['right', 'それなら勝ちだな', 'smile'],
      ['left', '今日から変えられそう', 'happy'],
    ],
  },
  {
    id: 's10',
    role: 'cta',
    caption: '今日やる一つの作業',
    source: 'slide_1_p05.png',
    bullets: ['一つ選ぶ', '型にする', '結果を見る'],
    goal: '視聴者の次の行動を一つに絞る',
    question: 'まず何をすればいい？',
    visualRole: 'mainは今日の行動、subはコメントしやすい問い',
    lines: [
      ['left', '結局どうすればいい？', 'worry'],
      ['right', '作業を一つ選べ', 'calm'],
      ['left', 'いきなり全部じゃない？', 'worry'],
      ['right', 'それは失敗しやすい', 'serious'],
      ['left', 'まず一個を型にする', 'calm'],
      ['right', 'それが得する使い方だ', 'smile'],
      ['left', '放置じゃなく仕組みね', 'smile'],
      ['right', '今日そこから始めよう', 'smile'],
      ['left', 'コメントで作業を教えてね', 'happy'],
      ['right', '次は型作りを話すぜ', 'smile'],
    ],
  },
];

const zmScenes = [
  {
    id: 's01',
    role: 'intro',
    caption: '楽になる道と疲れる道',
    source: 'fig_1.png',
    bullets: ['時間', '確認', '仕組み'],
    goal: 'AI自動化は全員を得させないと刺す',
    question: '便利なのに損する人がいるのだ？',
    visualRole: 'mainは勝ち負けの分岐、subは今日の問い',
    lines: [
      ['right', 'AI自動化、雑だと損するわ', 'serious'],
      ['left', '便利なのに損なのだ？', 'surprise'],
      ['right', '得する人は使い方が違うの', 'calm'],
      ['left', 'そこ知りたいのだ！', 'happy'],
      ['right', '今日は分岐点を見るわ', 'smile'],
      ['left', 'ボクも楽したいのだ', 'smile'],
      ['right', '楽には順番があるの', 'calm'],
      ['left', '順番を間違えるのだ？', 'worry'],
      ['right', 'そこが一番多いわ', 'serious'],
      ['left', '気をつけるのだ', 'calm'],
    ],
  },
  {
    id: 's02',
    role: 'body',
    caption: '自動化は魔法ではない',
    source: 'info_1.png',
    bullets: ['丸投げ', '未確認', '目的なし'],
    goal: '自動化の誤解を直す',
    question: '放置すれば勝手に稼ぐのだ？',
    visualRole: 'mainは誤解と現実、subはNG思考',
    lines: [
      ['left', '放置で稼ぐのだ？', 'worry'],
      ['right', 'そこが危ない誤解ね', 'serious'],
      ['left', '魔法じゃないのだ？', 'surprise'],
      ['right', '作業を減らす道具よ', 'calm'],
      ['left', '道具なら使い方が大事なのだ', 'calm'],
      ['right', 'その通りですわ', 'smile'],
      ['left', 'AIが全部考えるのでは？', 'worry'],
      ['right', '目的は人が決めるの', 'calm'],
      ['left', 'そこを忘れがちなのだ', 'worry'],
      ['right', 'だから損が生まれるわ', 'serious'],
    ],
  },
  {
    id: 's03',
    role: 'body',
    caption: '丸投げでズレる成果物',
    source: 'info_2.png',
    bullets: ['目的なし', '確認なし', '丸投げ'],
    goal: '損する人の共通点を見せる',
    question: 'どういう人が損するのだ？',
    visualRole: 'mainは失敗ループ、subは損する3条件',
    lines: [
      ['left', '損する人って誰なのだ？', 'worry'],
      ['right', 'まず目的がない人ね', 'calm'],
      ['left', '耳が痛いのだ', 'worry'],
      ['right', '次に確認しない人', 'serious'],
      ['left', '確認は面倒なのだ', 'worry'],
      ['right', '省くと後で増えるわ', 'calm'],
      ['left', '何が増えるのだ？', 'surprise'],
      ['right', '修正と作り直しね', 'serious'],
      ['left', '全然楽じゃないのだ', 'worry'],
      ['right', '早く見えるだけよ', 'calm'],
    ],
  },
  {
    id: 's04',
    role: 'body',
    caption: '材料を渡す人が得する',
    source: 'info_3.png',
    bullets: ['例文', '条件', '禁止事項'],
    goal: '得する人は素材と条件を渡すと示す',
    question: '得する人は何が違うのだ？',
    visualRole: 'mainは材料3点セット、subは得する人の条件',
    lines: [
      ['left', '得する人は何するのだ？', 'worry'],
      ['right', '先に材料を渡しますわ', 'calm'],
      ['left', '材料って何なのだ？', 'worry'],
      ['right', '例文、条件、禁止事項ね', 'smile'],
      ['left', '料理のレシピみたいなのだ', 'smile'],
      ['right', 'かなり近いですわ', 'smile'],
      ['left', '材料なしは無理なのだ', 'calm'],
      ['right', 'AIにも同じ話ですわ', 'calm'],
      ['left', '完成形も見せるのだ？', 'worry'],
      ['right', 'それがとても効くわ', 'smile'],
    ],
  },
  {
    id: 's05',
    role: 'body',
    caption: 'ミスは静かに積み上がる',
    source: 'slide_1_p01.png',
    bullets: ['誤情報', '手戻り', '信用低下'],
    goal: '中盤で最大の落とし穴を提示する',
    question: '本当に怖いのは何なのだ？',
    visualRole: 'mainは見えないコスト、subは放置リスク',
    lines: [
      ['left', '少し雑でもよくない？', 'worry'],
      ['right', '本当に怖いのはそこよ', 'serious'],
      ['left', '何が怖いのだ？', 'surprise'],
      ['right', 'ミスが静かに積もるの', 'serious'],
      ['left', '静かに積むの怖いのだ', 'worry'],
      ['right', '気づくと信用を失うわ', 'calm'],
      ['left', 'それはかなり重いのだ', 'worry'],
      ['right', 'だから途中で見るのよ', 'calm'],
      ['left', '小さく確認するのだ', 'calm'],
      ['right', '一番安い対策ですわ', 'smile'],
    ],
  },
  {
    id: 's06',
    role: 'body',
    caption: '任せる範囲と見る範囲',
    source: 'slide_1_p02.png',
    bullets: ['下書き', '判断', '公開'],
    goal: 'AIに任せる部分と人間が見る部分を分ける',
    question: 'どこまで任せていいのだ？',
    visualRole: 'mainは役割分担、subは人間チェック',
    lines: [
      ['left', 'どこまで任せていいのだ？', 'worry'],
      ['right', '下書きは任せていいわ', 'calm'],
      ['left', '判断はどうするのだ？', 'worry'],
      ['right', '人間が持つのよ', 'serious'],
      ['left', '丸投げはだめなのだな', 'calm'],
      ['right', '最後の責任者は自分よ', 'calm'],
      ['left', '責任は消えないのだ', 'worry'],
      ['right', 'そこが大事ですわ', 'smile'],
      ['left', 'AIは助手なのだ', 'calm'],
      ['right', 'その見方が安全ね', 'smile'],
    ],
  },
  {
    id: 's07',
    role: 'body',
    caption: '小さく始める3ステップ',
    source: 'slide_1_p03.png',
    bullets: ['選ぶ', '試す', '直す'],
    goal: '具体的な得する使い方を提示する',
    question: '何から自動化するのだ？',
    visualRole: 'mainは小さく始める手順、subは最初の候補',
    lines: [
      ['left', '何から始めるのだ？', 'worry'],
      ['right', '繰り返し作業からね', 'calm'],
      ['left', '毎日やることなのだ？', 'worry'],
      ['right', 'そう。小さいほどいいわ', 'smile'],
      ['left', '大きく始めないのだ？', 'surprise'],
      ['right', '小さく勝つ方が続くの', 'calm'],
      ['left', '失敗しても軽いのだ', 'calm'],
      ['right', '直すのも簡単ですわ', 'smile'],
      ['left', 'ボクでもできそうなのだ', 'happy'],
      ['right', '一つ選べば十分よ', 'smile'],
    ],
  },
  {
    id: 's08',
    role: 'body',
    caption: '全部自動化しない勇気',
    source: 'slide_1_p04.png',
    bullets: ['共感', '判断', '責任'],
    goal: 'AI自動化に向かない作業もあると示す',
    question: '全部自動化したら最強なのだ？',
    visualRole: 'mainは向く作業と向かない作業、subは残す仕事',
    lines: [
      ['left', '全部自動化したら最強？', 'worry'],
      ['right', 'それは危ない考えね', 'serious'],
      ['left', 'そうなのだ？', 'surprise'],
      ['right', '感情の判断は残すのよ', 'calm'],
      ['left', '人間っぽさの所なのだ？', 'worry'],
      ['right', 'そこが価値になるわ', 'smile'],
      ['left', 'AIに任せない勇気なのだ', 'calm'],
      ['right', 'いい言い方ですわ', 'smile'],
      ['left', '全部じゃなく選ぶのだ', 'calm'],
      ['right', 'それが得する使い方ね', 'smile'],
    ],
  },
  {
    id: 's09',
    role: 'outro',
    caption: '得する3ステップ',
    source: 'slide_1_p05.png',
    bullets: ['目的', '型', '確認'],
    goal: '得する人の判断基準をまとめる',
    question: '結局どう使えば得なのだ？',
    visualRole: 'mainは3ステップまとめ、subは今日の結論',
    lines: [
      ['left', '結局どう使えば得なのだ？', 'worry'],
      ['right', '目的、型、確認の順番ね', 'calm'],
      ['left', 'この3つなのだな', 'calm'],
      ['right', 'ここを外さないことよ', 'smile'],
      ['left', '思ったより地味なのだ', 'worry'],
      ['right', '地味な人ほど勝つのよ', 'smile'],
      ['left', '名言っぽいのだ', 'happy'],
      ['right', 'でも本当にそうですわ', 'calm'],
      ['left', '丸投げは卒業なのだ', 'smile'],
      ['right', '仕組みで使いましょう', 'smile'],
    ],
  },
  {
    id: 's10',
    role: 'cta',
    caption: '今日やること',
    source: 'slide_1_p06.png',
    bullets: ['一作業', '型にする', '記録する'],
    goal: '今日やる行動を一つに絞る',
    question: '今日なにをすればいいのだ？',
    visualRole: 'mainは今日の行動、subはコメント誘導',
    lines: [
      ['left', '今日なにをするのだ？', 'worry'],
      ['right', '毎日作業を一つ選ぶの', 'calm'],
      ['left', 'まず一個でいいのだな', 'smile'],
      ['right', 'それをAI用に型にするわ', 'calm'],
      ['left', '結果も見るのだ', 'calm'],
      ['right', '記録も残すと強いわ', 'smile'],
      ['left', '次が楽になるのだ', 'happy'],
      ['right', 'そこまでが自動化ですわ', 'smile'],
      ['left', '試したい作業を書いてほしいのだ', 'happy'],
      ['right', '次回は型を作りますわ', 'smile'],
    ],
  },
];

const episodes = [
  {
    id: 'ep861-rm-ai-automation-separate',
    typeLabel: 'ゆっくり解説',
    title: 'AI自動化で損する人・得する人',
    pair: 'RM',
    styleDir: 'yukkuri',
    voiceEngine: 'aquestalk',
    tone: '危機感あり・実用的・ゆっくり解説らしい掛け合い',
    characters: {
      left: {
        character: 'reimu',
        aquestalk_preset: 'れいむ',
        speaking_style: '視聴者代表。短い疑問、驚き、ツッコミを担当。',
      },
      right: {
        character: 'marisa',
        aquestalk_preset: 'まりさ',
        speaking_style: '解説役。自然な「だぜ」「だな」で整理する。',
      },
    },
    scenes: rmScenes.map((scene) => buildScene({typeLabel: 'ゆっくり解説', tone: '危機感あり・実用的・ゆっくり解説らしい掛け合い', ...scene})),
  },
  {
    id: 'ep862-zm-ai-automation-separate',
    typeLabel: 'ずんだもん解説',
    title: 'AI自動化で損する人・得する人',
    pair: 'ZM',
    styleDir: 'zundamon',
    voiceEngine: 'voicevox',
    tone: '軽快で実用的。丸投げリスクをやさしく注意する',
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '視聴者代表。短い疑問と驚き。語尾は自然な「のだ」。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '整理役。落ち着いて「ですわ」「のよ」で説明する。',
      },
    },
    scenes: zmScenes.map((scene) => buildScene({typeLabel: 'ずんだもん解説', tone: '軽快で実用的。丸投げリスクをやさしく注意する', ...scene})),
  },
];

const ensureDir = async (dir) => fs.mkdir(dir, {recursive: true});

const cleanEpisodeDir = async (dir) => {
  await fs.rm(dir, {recursive: true, force: true});
  await ensureDir(path.join(dir, 'assets'));
  await ensureDir(path.join(dir, 'audio'));
  await ensureDir(path.join(dir, 'bgm'));
  await ensureDir(path.join(dir, 'se'));
  await ensureDir(path.join(dir, 'audits'));
};

const copyAssets = async (episode, episodeDir) => {
  const generatedDir = path.join(notebookRoot, episode.styleDir, 'materials', 'generated');
  for (const scene of episode.scenes) {
    await fs.copyFile(path.join(generatedDir, scene.source), path.join(episodeDir, scene.main.asset));
  }
};

const buildScript = (episode) => ({
  meta: baseMeta(episode),
  characters: episode.characters,
  bgm: {
    title: 'upbeat step',
    source_url: 'https://dova-s.jp/en/bgm/detail/16211',
    file: 'bgm/track.mp3',
    license: 'DOVA-SYNDROME 標準利用規約',
    volume: 0.08,
    fade_in_sec: 0.8,
    fade_out_sec: 1.5,
  },
  scenes: episode.scenes.map(({source, ...scene}) => scene),
});

const buildMeta = (episode, script) => ({
  episode_id: episode.id,
  generated_at: new Date().toISOString(),
  generator: 'Codex + NotebookLM generated artifact workflow',
  source_notebooklm_project: 'notebookLM/workspace/projects/ai-automation-20260425',
  template: 'Scene02',
  theme: episode.title,
  voices:
    episode.pair === 'RM'
      ? [
          {visual_character: '霊夢', engine: 'AquesTalkPlayer', preset: 'れいむ', credit: 'AquesTalkPlayer preset: れいむ'},
          {visual_character: '魔理沙', engine: 'AquesTalkPlayer', preset: 'まりさ', credit: 'AquesTalkPlayer preset: まりさ'},
        ]
      : [
          {visual_character: 'ずんだもん', engine: 'VOICEVOX', speaker_id: 3, credit: 'VOICEVOX:ずんだもん'},
          {visual_character: '四国めたん', engine: 'VOICEVOX', speaker_id: 2, credit: 'VOICEVOX:四国めたん'},
        ],
  assets: [
    {
      file: 'bgm/track.mp3',
      source_site: 'dova-syndrome',
      source_url: 'https://dova-s.jp/en/bgm/detail/16211',
      title: 'upbeat step',
      license: 'DOVA-SYNDROME 標準利用規約',
      credit_required: false,
    },
    ...script.scenes.map((scene) => ({
      file: scene.main.asset,
      source_site: 'NotebookLM',
      source_type: 'NotebookLM generated artifact',
      source_url: `notebooklm://ai-automation-20260425/${episode.styleDir}/${scene.id}`,
      scene_id: scene.id,
      slot: 'main',
      purpose: scene.visual_asset_plan[0].purpose,
      adoption_reason: 'NotebookLMで生成取得した実画像で、Scene02のmain枠に十分な解像度と余白があるため',
      description: scene.main.asset_requirements.description,
      imagegen_prompt: scene.main.asset_requirements.imagegen_prompt,
      license: 'NotebookLM generated artifact. 公開前に利用条件を再確認',
      credit_required: false,
    })),
  ],
});

const buildMarkdown = (episode, script) => {
  const names =
    episode.pair === 'RM'
      ? {left: '霊夢', right: '魔理沙'}
      : {left: 'ずんだもん', right: '四国めたん'};
  const lines = [
    `# ${episode.title}`,
    '',
    `- episode_id: ${episode.id}`,
    `- 動画タイプ: ${episode.typeLabel}`,
    '- 使用テンプレート: Scene02',
    '- 想定尺: 約5分',
    '',
  ];

  for (const scene of script.scenes) {
    lines.push(`## ${scene.id} ${scene.main.caption}`);
    lines.push(`- scene_goal: ${scene.scene_goal}`);
    lines.push(`- viewer_question: ${scene.viewer_question}`);
    lines.push(`- visual_role: ${scene.visual_role}`);
    lines.push(`- image_insert_point: ${scene.id} の l01 直前`);
    lines.push(`- asset_path: script/${episode.id}/${scene.main.asset}`);
    lines.push(`- sub_content: ${scene.sub.items.join(' / ')}`);
    for (const dialogue of scene.dialogue) {
      lines.push(`- ${names[dialogue.speaker]}: ${dialogue.text}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
};

const buildEditingNotes = (episode, script) => {
  const rows = script.scenes.map((scene, index) => {
    const se = index === 0 ? 'ドン' : index % 3 === 0 ? 'ポン' : '';
    return `| ${scene.id} | ${scene.role} | ${scene.main.asset} | 白文字+黒縁 | 画像フェード、章頭だけ軽くズーム | 発話側を口パク | ${se} | 通奏 | ${scene.scene_goal} |`;
  });
  return `# 編集演出指示書

## 1. 全体設定

- 動画タイプ：${episode.typeLabel}
- 画面比率：16:9
- 解像度：1280x720
- 想定尺：約5分
- 編集環境：Remotion
- 通常字幕フォント：けいふぉんと
- 通常字幕スタイル：白文字 + 太い黒縁 + 軽い影
- 使用テンプレート：Scene02

## 2. シーン別演出

| scene_id | パート | 表示素材 | 字幕スタイル | 画面演出 | キャラ演出 | SE | BGM | 備考 |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
};

for (const episode of episodes) {
  const episodeDir = path.join(rootDir, 'script', episode.id);
  await cleanEpisodeDir(episodeDir);
  const script = buildScript(episode);
  await copyAssets(episode, episodeDir);
  await fs.copyFile(sourceBgm, path.join(episodeDir, 'bgm', 'track.mp3'));
  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script, {lineWidth: 0}), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), `${JSON.stringify(buildMeta(episode, script), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.md'), buildMarkdown(episode, script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_image_points.md'), buildMarkdown(episode, script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_editing_notes.md'), buildEditingNotes(episode, script), 'utf8');
}

console.log(JSON.stringify({episodes: episodes.map((episode) => episode.id)}, null, 2));
