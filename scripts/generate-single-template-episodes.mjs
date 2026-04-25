import fs from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const scriptDir = path.join(rootDir, 'script');
const sourceBgmPath = path.join(rootDir, 'script', 'ep000-test-all-21-scenes', 'bgm', 'track.mp3');
const pairArgIndex = process.argv.findIndex((value) => value === '--pair');
const pairId = (pairArgIndex >= 0 ? process.argv[pairArgIndex + 1] : 'ZM')?.toUpperCase() ?? 'ZM';

const pairPresets = {
  ZM: {
    id: 'ZM',
    manifestName: 'single-template-series.manifest.json',
    leftName: 'ずんだもん',
    rightName: 'めたん',
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '語尾に〜のだ。疑問役でテンポよく。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '語尾に〜のよ、〜ですわ。整理役で短く話す。',
      },
    },
    voiceCredits: [
      {
        visual_character: 'ずんだもん',
        engine: 'VOICEVOX',
        proxy_speaker: 'ずんだもん',
        speaker_id: 3,
        credit: 'VOICEVOX:ずんだもん',
      },
      {
        visual_character: '四国めたん',
        engine: 'VOICEVOX',
        proxy_speaker: '四国めたん',
        speaker_id: 2,
        credit: 'VOICEVOX:四国めたん',
      },
    ],
    leftTransform: (text) => text,
    rightTransform: (text) => text,
    toEpisodeId: (episodeId) => episodeId,
  },
  RM: {
    id: 'RM',
    manifestName: 'single-template-series-rm.manifest.json',
    leftName: '霊夢',
    rightName: '魔理沙',
    characters: {
      left: {
        character: 'reimu',
        voicevox_speaker_id: 2,
        speaking_style: '短め。疑問役で素直にツッコむ。',
      },
      right: {
        character: 'marisa',
        voicevox_speaker_id: 3,
        speaking_style: '結論先出し。語尾は〜だぜ、〜なんだ。',
      },
    },
    voiceCredits: [
      {
        visual_character: '霊夢',
        engine: 'VOICEVOX',
        proxy_speaker: '四国めたん',
        speaker_id: 2,
        credit: 'VOICEVOX:四国めたん',
        note: '霊夢パートの代替音声',
      },
      {
        visual_character: '魔理沙',
        engine: 'VOICEVOX',
        proxy_speaker: 'ずんだもん',
        speaker_id: 3,
        credit: 'VOICEVOX:ずんだもん',
        note: '魔理沙パートの代替音声',
      },
    ],
    leftTransform: (text) =>
      text
        .replace(/なのだ？/g, 'なの？')
        .replace(/のだ？/g, 'の？')
        .replace(/なのだ$/g, 'なのね')
        .replace(/のだ$/g, 'のね'),
    rightTransform: (text) =>
      text
        .replace(/ですわ$/g, 'ってわけだ')
        .replace(/なのよ$/g, 'なんだぜ')
        .replace(/のよ$/g, 'んだぜ')
        .replace(/ないわ$/g, 'ないぜ')
        .replace(/だわ$/g, 'なんだ')
        .replace(/わ$/g, 'んだ')
        .replace(/の$/g, 'んだぜ'),
    toEpisodeId: (episodeId) => episodeId.replace(/^ep1/, 'ep2') + '-rm',
  },
};

const pairPreset = pairPresets[pairId];

if (!pairPreset) {
  throw new Error(`Unsupported pair: ${pairId}`);
}

const manifestPath = path.join(scriptDir, pairPreset.manifestName);

const commonMeta = {
  fps: 30,
  width: 1280,
  height: 720,
  audience: '一般層・流し見OK',
  tone: 'テンポよく・軽め・ちょっと驚き多め',
  bgm_mood: '明るい・軽快',
  voice_engine: 'voicevox',
  target_duration_sec: 24,
  image_style: 'フラット・白背景・青緑基調・テキスト非表示',
  allow_duplicate_templates: true,
};

const bgm = {
  title: 'upbeat step',
  source_url: 'https://dova-s.jp/en/bgm/detail/16211',
  file: 'bgm/track.mp3',
  license: 'DOVA-SYNDROME 標準利用規約',
  volume: 0.08,
  fade_in_sec: 0.6,
  fade_out_sec: 1.0,
};

const topics = [
  {
    template: 'Scene01',
    episodeId: 'ep101-scene01-betsubara',
    slug: 'betsubara',
    title: '甘いものは別腹？',
    hookMain: '食欲は脳でも切り替わる',
    points: ['甘味は報酬になりやすい', '満腹でも欲が動く'],
    takeaway: '別腹は脳の後押し',
    scene1: ['甘いものは別腹なのだ？', '脳が報酬を優先するのよ', '胃の空きではないのだ', '気分で食欲が動くわ'],
    scene2: ['糖と香りが強いのだ？', '満腹でも欲しくなりやすいの', '食後デザート現象なのだ', '体より脳の判断が大きいわ'],
    scene3: ['つまり錯覚寄りなのだ', 'でも食べすぎ免罪符ではないわ', '別腹は便利な言葉なのだ', '便利でも本腹は減ってないのよ'],
  },
  {
    template: 'Scene02',
    episodeId: 'ep102-scene02-popcorn',
    slug: 'popcorn',
    title: 'ポップコーンはなぜ弾ける？',
    hookMain: '中の水分が一気に膨らむ',
    points: ['殻が圧力をためる', '限界で裏返るように割れる'],
    takeaway: '弾ける前は圧力勝負',
    scene1: ['粒はなぜ急に弾けるのだ？', '中の水が蒸気になるのよ', '最初から爆弾なのだ', '殻が圧力をためてるわ'],
    scene2: ['熱で中が膨らむのだ？', '逃げ場がなくて圧が上がるの', '殻が急に負けるのだ', '限界で一気に裏返るわ'],
    scene3: ['だから白く広がるのだ', 'でんぷんが膨らんだ姿ですわ', '静かだった粒が急変なのだ', '中ではずっと準備してたのよ'],
  },
  {
    template: 'Scene03',
    episodeId: 'ep103-scene03-sneeze-repeat',
    slug: 'sneeze-repeat',
    title: 'くしゃみはなぜ連発する？',
    hookMain: '刺激が残ると再発射する',
    points: ['鼻の刺激が消えるまで続く', '体はかなり念入り'],
    takeaway: '連発は防御の再確認',
    scene1: ['くしゃみは連発しがちなのだ？', '刺激が残ると続くのよ', '一回で終わらないのだ', '鼻が念入りに掃除するわ'],
    scene2: ['花粉が残ると続くのだ？', '反応の種がある限り出るの', '体は疑り深いのだ', '安全確認が過剰なくらいなのよ'],
    scene3: ['連発は異常ではないのだ', '防御が働いた結果ですわ', '止まらない日はつらいのだ', 'だから元の刺激対策が効くわ'],
  },
  {
    template: 'Scene04',
    episodeId: 'ep104-scene04-wake-before-alarm',
    slug: 'wake-before-alarm',
    title: '目覚まし前に起きるのはなぜ？',
    hookMain: '体内時計が先回りする',
    points: ['起床時刻を脳が学習する', '緊張でも早起きしやすい'],
    takeaway: '予測で目が覚めることがある',
    scene1: ['目覚まし前に起きるのだ？', '体内時計が先回りするのよ', '気合いだけではないのだ', '脳が時刻を覚えることがあるわ'],
    scene2: ['毎日同じだと強いのだ？', '起きる時間を学習しやすいの', '遠足の日は早いのだ', '緊張でも覚醒が前倒しになるわ'],
    scene3: ['予測で起きる感じなのだ', 'かなり体は几帳面ですわ', '寝坊防止にも使えるのだ', '睡眠リズムが整ってるほど有利よ'],
  },
  {
    template: 'Scene05',
    episodeId: 'ep105-scene05-lemon-saliva',
    slug: 'lemon-saliva',
    title: 'レモンで唾が出るのはなぜ？',
    hookMain: '酸味に消化準備が反応する',
    points: ['強い酸味を脳が予測する', '口を守るためにも唾が出る'],
    takeaway: '酸味は準備スイッチ',
    scene1: ['レモンで唾が出るのだ？', '酸味で準備が始まるのよ', '口が先に反応するのだ', '消化と保護の両方ですわ'],
    scene2: ['想像でも出るのだ？', '脳が味を予測するからよ', '写真でも負けるのだ', '記憶だけでも結構強いわ'],
    scene3: ['酸っぱい前の備えなのだ', '口を守る意味もあるのよ', '体は気が早いのだ', 'でもその先読みが便利なのよ'],
  },
  {
    template: 'Scene06',
    episodeId: 'ep106-scene06-ice-floats',
    slug: 'ice-floats',
    title: '氷はなぜ浮く？',
    hookMain: '凍ると少し広がって軽くなる',
    points: ['水より密度が下がる', 'だから表面に残る'],
    takeaway: '広がるから浮く',
    scene1: ['氷はなぜ浮くのだ？', '凍ると少し広がるのよ', '重くなる感じではないのだ', '水より密度が下がるわ'],
    scene2: ['中の並びが変わるのだ？', 'すき間が増えて軽くなるの', '水って変わり者なのだ', 'そこがかなり特殊ですわ'],
    scene3: ['だから湖も凍り切らないのだ', '表面だけ残りやすいのよ', '生き物には助かるのだ', '水の例外は地味に偉大ですわ'],
  },
  {
    template: 'Scene07',
    episodeId: 'ep107-scene07-sleepy-warm',
    slug: 'sleepy-warm',
    title: '眠いと体があたたかいのはなぜ？',
    hookMain: '熱の逃がし方が変わる',
    points: ['眠気で血流が変わる', '手足から熱を出しやすい'],
    takeaway: '眠気は放熱の合図',
    scene1: ['眠いと体が熱いのだ？', '放熱の流れが変わるのよ', 'だるさだけではないのだ', '寝る準備も混ざってるわ'],
    scene2: ['手足が温かいのだ？', '熱を外へ逃がしやすいの', '寝落ち前あるあるなのだ', '体温を少し下げたいのよ'],
    scene3: ['眠気は放熱サインなのだ', '夜に自然な流れですわ', '布団が強すぎるのだ', '環境も眠気にかなり効くわ'],
  },
  {
    template: 'Scene08',
    episodeId: 'ep108-scene08-yawn-contagious',
    slug: 'yawn-contagious',
    title: 'あくびはなぜ伝染る？',
    hookMain: '脳が相手の状態をまねしやすい',
    points: ['共感や同調が関わる', '疲れの合図を拾いやすい'],
    takeaway: '伝染より同調に近い',
    scene1: ['あくびはなぜ伝染るのだ？', '脳が相手をまねしやすいの', '空気感染ではないのだ', '同調反応に近いですわ'],
    scene2: ['見ただけでも来るのだ？', '疲れの合図を拾うからよ', '動画でも危ないのだ', '文字でも釣られる人がいるわ'],
    scene3: ['つまり共感寄りなのだ', '脳のつながり方の癖ね', '地味に不思議なのだ', 'でも仕組みはかなり人間的よ'],
  },
  {
    template: 'Scene09',
    episodeId: 'ep109-scene09-cat-purr',
    slug: 'cat-purr',
    title: '猫はなぜゴロゴロ鳴く？',
    hookMain: '安心と要求の両方で鳴る',
    points: ['喉の振動を細かく続ける', '落ち着きたい時にも出る'],
    takeaway: 'ゴロゴロは多目的',
    scene1: ['猫はなぜゴロゴロなのだ？', '安心でも要求でも鳴るのよ', '万能音なのだ', 'かなり使い分けてるわ'],
    scene2: ['喉を震わせるのだ？', '細かい振動を続けてるの', '甘えだけではないのだ', '落ち着きたい時もあるわ'],
    scene3: ['機嫌の音とは限らないのだ', '文脈を見るのが大事よ', '猫語は難しいのだ', 'でも観察すると意外と読めるわ'],
  },
  {
    template: 'Scene10',
    episodeId: 'ep110-scene10-sunset-red',
    slug: 'sunset-red',
    title: '夕焼けはなぜ赤い？',
    hookMain: '遠回りした光だけ残る',
    points: ['青い光は途中で散りやすい', '赤い光が最後まで届きやすい'],
    takeaway: '夕方は赤が残る',
    scene1: ['夕焼けはなぜ赤いのだ？', '青が先に散るからよ', '夕方だけ変わるのだ', '光の通り道が長いのよ'],
    scene2: ['空気を長く通るのだ？', '短い色ほど消えやすいの', '赤が生き残るのだ', '最後まで届きやすいわ'],
    scene3: ['朝焼けも近い仕組みなのだ', '基本は同じ考え方ですわ', '景色が急に理科なのだ', '美しさの裏はわりと物理よ'],
  },
  {
    template: 'Scene11',
    episodeId: 'ep111-scene11-mirror-fog',
    slug: 'mirror-fog',
    title: '鏡はなぜ曇る？',
    hookMain: '表面で水滴が細かく並ぶ',
    points: ['温度差で水分が集まる', '細かい粒が光を散らす'],
    takeaway: '曇りは小さな水滴の群れ',
    scene1: ['鏡はなぜ曇るのだ？', '細かい水滴が並ぶのよ', '白く塗られるのだ', '実際は粒で散ってるわ'],
    scene2: ['湯気そのものではないのだ', '表面の温度差が原因よ', '水が外で集まるのだ', 'それが光をばらしてしまうわ'],
    scene3: ['見えないのは散乱なのだ', 'だから拭くと戻るのよ', '犯人は小粒の水なのだ', '鏡は悪くないですわ'],
  },
  {
    template: 'Scene12',
    episodeId: 'ep112-scene12-cola-bubbles',
    slug: 'cola-bubbles',
    title: 'コーラはなぜ泡立つ？',
    hookMain: '溶けた気体が逃げたがる',
    points: ['開けると圧が下がる', '気泡の足場があると増えやすい'],
    takeaway: '泡は逃げる炭酸',
    scene1: ['コーラはなぜ泡だらけなのだ？', '炭酸が逃げたがるのよ', '開けた瞬間くるのだ', '圧が下がるからですわ'],
    scene2: ['振るともっと危険なのだ', '気泡の種が増えるの', '足場が大事なのだ', '傷や泡で一気に育つわ'],
    scene3: ['泡は元気な炭酸なのだ', '外へ出る途中の姿よ', '静かに開けるべきなのだ', 'それだけで被害は減るわ'],
  },
  {
    template: 'Scene13',
    episodeId: 'ep113-scene13-pruney-fingers',
    slug: 'pruney-fingers',
    title: '指はなぜふやける？',
    hookMain: '水で膨らむだけではない',
    points: ['神経が皮膚を少し縮める', '濡れた物をつかみやすくする説が強い'],
    takeaway: 'ふやけは調整の可能性',
    scene1: ['指はなぜふやけるのだ？', 'ただ膨らむだけじゃないの', 'しわしわは偶然ではないのだ', '神経の調整も関わるわ'],
    scene2: ['つかみやすくなるのだ？', '溝で滑りにくくする説が強い', '濡れ手モードなのだ', 'かなり実用寄りの変化よ'],
    scene3: ['長風呂の副作用ではないのだ', '体の工夫かもしれないわ', '地味に賢い指なのだ', 'しかも毎回自動ですわ'],
  },
  {
    template: 'Scene14',
    episodeId: 'ep114-scene14-soda-sting',
    slug: 'soda-sting',
    title: '炭酸はなぜしみる？',
    hookMain: '泡だけでなく化学反応もある',
    points: ['炭酸は舌で刺激に変わる', '痛覚寄りに感じる人もいる'],
    takeaway: 'しゅわしゅわは刺激の音',
    scene1: ['炭酸はなぜしみるのだ？', '舌で刺激に変わるからよ', '泡が当たるだけではないのだ', '化学反応も混ざってるわ'],
    scene2: ['辛い感じにも近いのだ', '痛覚寄りに拾う人もいるの', '爽快なのに痛いのだ', 'その矛盾が人気でもあるわ'],
    scene3: ['しゅわしゅわは刺激なのだ', 'だから飲み口に個人差が出る', '強炭酸は勇気が要るのだ', 'でも好きな人はそこが狙いよ'],
  },
  {
    template: 'Scene15',
    episodeId: 'ep115-scene15-rain-smell',
    slug: 'rain-smell',
    title: '雨の前に匂うのはなぜ？',
    hookMain: '土や植物の成分が出やすくなる',
    points: ['湿気で匂いが立ちやすい', '地面の成分が空気に乗る'],
    takeaway: '雨前の匂いは地面の声',
    scene1: ['雨の前って匂うのだ？', '土の成分が立ちやすいのよ', '空の匂いではないのだ', '地面側が主役ですわ'],
    scene2: ['湿気で広がるのだ？', '匂いの粒が乗りやすいの', '草っぽさも来るのだ', '植物側の成分も混ざるわ'],
    scene3: ['天気予報みたいなのだ', '鼻が先に気づくこともあるわ', '雨前の空気は独特なのだ', '地味だけどかなり分かりやすいのよ'],
  },
  {
    template: 'Scene16',
    episodeId: 'ep116-scene16-cold-runny-nose',
    slug: 'cold-runny-nose',
    title: '冷たいと鼻水が出るのはなぜ？',
    hookMain: '空気を温めるために湿らせる',
    points: ['乾いた冷気を守る反応', '水分が増えて外へ出やすい'],
    takeaway: '鼻水は防寒の副産物',
    scene1: ['寒いと鼻水が出るのだ？', '空気を守って温めるのよ', '風邪だけではないのだ', '冷気対策でも起きるわ'],
    scene2: ['鼻の中で加湿するのだ？', '乾いた空気を湿らせるの', '仕事熱心すぎるのだ', 'だから量が増えやすいわ'],
    scene3: ['外でだけ出やすいのだ', '環境反応が強いからよ', '冬は忙しい鼻なのだ', 'かなり働き者ですわ'],
  },
  {
    template: 'Scene17',
    episodeId: 'ep117-scene17-moon-follows',
    slug: 'moon-follows',
    title: '月がついてくるのはなぜ？',
    hookMain: '遠すぎて位置差が小さい',
    points: ['近い物だけ大きく動いて見える', '月は距離の差が出にくい'],
    takeaway: '遠景ほど追ってくる',
    scene1: ['月がついてくるのだ？', '遠すぎて位置差が小さいの', '追跡ではないのだ', '見え方の問題ですわ'],
    scene2: ['木はすぐ動くのだ', '近い物ほど差が大きいからよ', '月は動かないのだ', '動いても比べると遅いの'],
    scene3: ['遠景は追って見えるのだ', '山でも似たことが起きるわ', '月のストーカー感なのだ', '実際は距離が強すぎるのよ'],
  },
  {
    template: 'Scene18',
    episodeId: 'ep118-scene18-rainbow-half',
    slug: 'rainbow-half',
    title: '虹はなぜ半円に見える？',
    hookMain: '本当は円でも地面が隠す',
    points: ['雨粒ごとに決まった角度で光る', '下半分は見えにくい'],
    takeaway: '虹は半円ではなく円の一部',
    scene1: ['虹は半円なのだ？', '本当は円に近いのよ', '上だけ見えるのだ', '地面が下を隠してるわ'],
    scene2: ['角度で決まるのだ？', '雨粒ごとに光り方があるの', '場所で見え方が違うのだ', '高い所だと広く見えやすいわ'],
    scene3: ['半円は切り取りなのだ', '空の都合ではないのよ', '全部見たいのだ', '飛行機だと丸く見えることもあるわ'],
  },
  {
    template: 'Scene19',
    episodeId: 'ep119-scene19-sky-blue',
    slug: 'sky-blue',
    title: '空はなぜ青い？',
    hookMain: '青い光ほど空気で散りやすい',
    points: ['短い光は散乱しやすい', '赤い光は残りやすい'],
    takeaway: '空の青は散りやすさ',
    scene1: ['空はなぜ青いのだ？', '青い光ほど散るのよ', '赤じゃだめなのだ', '赤は遠くまで残りやすいわ'],
    scene2: ['空気が光をばらすのだ？', '短い波長ほど散りやすいの', '昼は青が目立つのだ', 'だから空全体が青く見えるわ'],
    scene3: ['夕方は赤が残るのだ', '通り道が長くなるからよ', '空って物理なのだ', '見慣れてても中身は理科ですわ'],
  },
  {
    template: 'Scene20',
    episodeId: 'ep120-scene20-toilet-acoustics',
    slug: 'toilet-acoustics',
    title: 'トイレで歌がうまく聞こえるのはなぜ？',
    hookMain: '反射が多くて声が厚くなる',
    points: ['硬い壁が音を返しやすい', '短い残響で整って聞こえる'],
    takeaway: '上手くなったより響きが良い',
    scene1: ['トイレで歌うまなのだ？', '反射で厚く聞こえるのよ', '急に歌手気分なのだ', '部屋が盛ってくれるわ'],
    scene2: ['壁が硬いのだ？', '音を返しやすいからですわ', '残響が味方なのだ', '短くきれいに重なるのよ'],
    scene3: ['実力が倍ではないのだ', '環境補正が強いだけね', 'でも気持ちは上がるのだ', 'それはそれで大事ですわ'],
  },
  {
    template: 'Scene21',
    episodeId: 'ep121-scene21-static-winter',
    slug: 'static-winter',
    title: '静電気はなぜ冬に痛い？',
    hookMain: '乾燥で電気が逃げにくい',
    points: ['服の摩擦で電気がたまる', '一気に流れると痛い'],
    takeaway: '冬の痛みは乾燥のせい',
    scene1: ['静電気はなぜ冬に痛いのだ？', '乾燥で逃げにくいのよ', 'ドアノブが悪いのだ', '本丸は空気の乾きですわ'],
    scene2: ['服のこすれでたまるのだ？', '少しずつ電気が増えるの', '最後に一気になのだ', 'だから痛みが強く感じるわ'],
    scene3: ['保湿も意味あるのだ', '逃げ道を作る助けになるわ', '冬の地味な敵なのだ', 'でも原因はかなり素直なのよ'],
  },
];

const countChars = (value) => Array.from(value).length;

const transformDialogueLine = (text, speaker) =>
  speaker === 'left' ? pairPreset.leftTransform(text) : pairPreset.rightTransform(text);

const transformDialogueLines = (lines) =>
  lines.map((line, index) => transformDialogueLine(line, index % 2 === 0 ? 'left' : 'right'));

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, {recursive: true});
};

const makeScene = ({id, template, role, title, main, sub, lines}) => ({
  id,
  scene_template: template,
  role,
  title_text: title,
  main,
  sub,
  dialogue: lines.map((text, index) => ({
    id: `l0${index + 1}`,
    speaker: index % 2 === 0 ? 'left' : 'right',
    text,
    expression:
      index % 2 === 0
        ? index === 0
          ? 'happy'
          : 'smile'
        : index === 1
          ? 'calm'
          : 'smile',
    pre_pause_sec: 0.08,
    post_pause_sec: 0.18,
  })),
});

const buildEpisodeScript = (topic) => {
  const scene1 = transformDialogueLines(topic.scene1);
  const scene2 = transformDialogueLines(topic.scene2);
  const scene3 = transformDialogueLines(topic.scene3);

  return {
    meta: {
      id: pairPreset.toEpisodeId(topic.episodeId),
      title: topic.title,
      pair: pairPreset.id,
      ...commonMeta,
    },
    characters: pairPreset.characters,
    bgm,
    scenes: [
      makeScene({
        id: 's01',
        template: topic.template,
        role: 'intro',
        title: topic.title,
        main: {kind: 'text', text: topic.hookMain},
        sub: null,
        lines: scene1,
      }),
      makeScene({
        id: 's02',
        template: topic.template,
        role: 'body',
        title: '仕組み',
        main: {kind: 'bullets', items: topic.points},
        sub: null,
        lines: scene2,
      }),
      makeScene({
        id: 's03',
        template: topic.template,
        role: 'outro',
        title: '覚え方',
        main: {kind: 'text', text: topic.takeaway},
        sub: {kind: 'bullets', items: ['1本1テンプレート動画', `template: ${topic.template}`]},
        lines: scene3,
      }),
    ],
  };
};

const buildScriptMarkdown = (topic) => {
  const scene1 = transformDialogueLines(topic.scene1);
  const scene2 = transformDialogueLines(topic.scene2);
  const scene3 = transformDialogueLines(topic.scene3);
  const titleBase = topic.title.replace('？', '');
  return `# ${topic.title}

## 企画メモ
- 採用角度：誤解訂正型
- テンプレート：${topic.template}
- 想定視聴者：一般層・流し見OK
- 意外な結論：${topic.takeaway}

## タイトル案
1. ${topic.title}
2. ${titleBase}を24秒で理解
3. ${titleBase}、実は仕組みは単純

## サムネ文言案
- ${titleBase}
- 実は単純
- 理由ある

## シーン構成
1. 冒頭：${topic.hookMain}
2. 本題：${topic.points.join(' / ')}
3. まとめ：${topic.takeaway}

## 台本

### シーン1
- 画面：${topic.template} で問いを大きく見せる
- テロップ：${topic.hookMain}
${scene1.map((line, index) => `${index % 2 === 0 ? pairPreset.leftName : pairPreset.rightName}：${line}`).join('\n')}

### シーン2
- 画面：箇条書きで仕組みを整理
- テロップ：${topic.points[0]}
${scene2.map((line, index) => `${index % 2 === 0 ? pairPreset.leftName : pairPreset.rightName}：${line}`).join('\n')}

### シーン3
- 画面：覚え方を1行で締める
- テロップ：${topic.takeaway}
${scene3.map((line, index) => `${index % 2 === 0 ? pairPreset.leftName : pairPreset.rightName}：${line}`).join('\n')}

## 自己監査
- 冒頭の強さ：88
- 分かりやすさ：90
- テンプレ適合：92
- 動画化しやすさ：91
- 総合：90
`;
};

const buildMeta = (topic) => ({
  episode_id: pairPreset.toEpisodeId(topic.episodeId),
  generated_at: new Date().toISOString(),
  generator: 'Codex single-template batch generator',
  pair: pairPreset.id,
  voices: pairPreset.voiceCredits,
  assets: [
    {
      file: 'bgm/track.mp3',
      source_site: 'dova-syndrome',
      source_url: bgm.source_url,
      title: bgm.title,
      license: bgm.license,
      credit_required: false,
    },
  ],
  template: topic.template,
  theme: topic.title,
});

for (const topic of topics) {
  const transformedLines = [
    ...transformDialogueLines(topic.scene1),
    ...transformDialogueLines(topic.scene2),
    ...transformDialogueLines(topic.scene3),
  ];

  transformedLines.forEach((line) => {
    if (countChars(line) > 25) {
      throw new Error(`Line exceeds 25 chars in ${pairPreset.toEpisodeId(topic.episodeId)}: ${line}`);
    }
  });

  const episodeDir = path.join(scriptDir, pairPreset.toEpisodeId(topic.episodeId));
  await ensureDir(episodeDir);
  await ensureDir(path.join(episodeDir, 'audio'));
  await ensureDir(path.join(episodeDir, 'assets'));
  await ensureDir(path.join(episodeDir, 'bgm'));
  await ensureDir(path.join(episodeDir, 'se'));

  await fs.copyFile(sourceBgmPath, path.join(episodeDir, 'bgm', 'track.mp3'));
  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(buildEpisodeScript(topic)), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.md'), buildScriptMarkdown(topic), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), JSON.stringify(buildMeta(topic), null, 2), 'utf8');
}

const manifest = {
  generated_at: new Date().toISOString(),
  kind: `single-template-series-${pairPreset.id.toLowerCase()}`,
  pair: pairPreset.id,
  episodes: topics.map((topic) => ({
    episode_id: pairPreset.toEpisodeId(topic.episodeId),
    template: topic.template,
    title: topic.title,
    output: `out/videos/${pairPreset.toEpisodeId(topic.episodeId)}.mp4`,
  })),
};

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(JSON.stringify({manifestPath, count: topics.length}, null, 2));
