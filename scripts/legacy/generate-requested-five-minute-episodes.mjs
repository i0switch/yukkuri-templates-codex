import fs from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';

import {blockLegacyEpisodeGenerator} from './legacy-generator-guard.mjs';

blockLegacyEpisodeGenerator('generate-requested-five-minute-episodes.mjs');

const rootDir = process.cwd();

const imagePrompt = ({episodeTitle, sceneTitle, pair, slot = 'main'}) =>
  [
    `【用途】${episodeTitle} / ${sceneTitle} の ${slot}枠。${pair}解説動画で要点を一瞬で理解させる素材。`,
    `【主題】画面中央に「${sceneTitle}」を象徴する大きな図解モチーフを置く。`,
    '【構図】主役オブジェクトを中央大きめ、補助アイコンは少量。左右と下部に字幕とキャラを避ける余白を残す。',
    `【テンプレート枠】Scene02 テンプレートの${slot === 'main' ? 'メイン枠' : 'サブ枠'}に置く。右sub枠、下字幕帯、左右キャラ領域に重要物を置かない。`,
    '【色】白または淡い背景、主色は青緑、アクセントは黄色、警告だけ赤。全シーンで落ち着いた色味に揃える。',
    '【情報量】1枚1メッセージ。画像内文字なし。細かい説明文や密な表を入れない。',
    '【絵柄】落ち着いたゆっくり/ずんだもん解説向けの太線フラット図解、角丸、余白多め。',
    '【禁止】細かい文字、英語UI、実在人物、既存キャラクター、ブランドロゴ、実在アプリUI模写、写真風人物。',
  ].join('');

const expressionFor = (index, speaker) => {
  if (index % 5 === 0) return speaker === 'left' ? 'halfOpen' : 'calm';
  if (index % 7 === 0) return speaker === 'left' ? 'surprised' : 'smile';
  return speaker === 'left' ? 'smile' : 'calm';
};

const assertShortDialogue = (episodeId, scenes) => {
  const seen = new Map();
  for (const scene of scenes) {
    for (const line of scene.dialogue) {
      const chars = Array.from(line.text).length;
      if (chars > 25) {
        throw new Error(`${episodeId} ${scene.id}/${line.id} exceeds 25 chars: ${line.text} (${chars})`);
      }
      const normalized = line.text.replace(/[。、！？!?「」『』（）()\[\]【】・:：,，.．\s]/g, '');
      seen.set(normalized, (seen.get(normalized) ?? 0) + 1);
      if (seen.get(normalized) > 2) {
        throw new Error(`${episodeId} repeats too often: ${line.text}`);
      }
    }
  }
};

const makeLines = (lines) =>
  lines.map((text, index) => ({
    id: `l${String(index + 1).padStart(2, '0')}`,
    speaker: index % 2 === 0 ? 'left' : 'right',
    text,
    expression: expressionFor(index, index % 2 === 0 ? 'left' : 'right'),
    pre_pause_sec: index === 0 ? 0.12 : 0.06,
    post_pause_sec: index % 3 === 0 ? 0.24 : 0.16,
  }));

const buildScenes = ({episodeId, episodeTitle, pair, sceneSpecs}) => {
  const scenes = sceneSpecs.map((spec, index) => {
    const sceneNo = String(index + 1).padStart(2, '0');
    const asset = `assets/s${sceneNo}_main.jpg`;
    return {
      id: `s${sceneNo}`,
      role: index === 0 ? 'intro' : index === sceneSpecs.length - 1 ? 'cta' : index === sceneSpecs.length - 2 ? 'outro' : 'body',
      scene_goal: spec.goal,
      viewer_question: spec.question,
      visual_role: `mainは${spec.visual}、subは3項目の確認メモを担当`,
      main: {
        kind: 'image',
        asset,
        caption: spec.title,
        asset_requirements: {
          description: spec.visual,
          imagegen_prompt: imagePrompt({episodeTitle, sceneTitle: spec.title, pair}),
          style: 'licensed photo style, clean explainer thumbnail, high readability',
          aspect: '16:9',
        },
      },
      sub: {
        kind: 'bullets',
        items: spec.sub,
      },
      visual_asset_plan: [
        {
          slot: 'main',
          purpose: spec.visual,
          insert_timing: `${spec.title} の冒頭`,
          asset,
          imagegen_prompt: imagePrompt({episodeTitle, sceneTitle: spec.title, pair}),
          audit_points: ['1枚1メッセージ', 'Scene02のmain枠に収まる', 'ロゴや細かい文字がない'],
        },
      ],
      dialogue: makeLines(spec.lines),
      duration_sec: index === sceneSpecs.length - 1 ? 16.1 : 16.7,
    };
  });
  assertShortDialogue(episodeId, scenes);
  return scenes;
};

const makeMetaAssets = ({episodeId, episodeTitle, pair, sceneSpecs}) =>
  sceneSpecs.map((spec, index) => {
    const sceneNo = String(index + 1).padStart(2, '0');
    const file = `assets/s${sceneNo}_main.jpg`;
    const sourceUrl = `https://picsum.photos/seed/${episodeId}-${sceneNo}/1920/1080`;
    return {
      file,
      scene_id: `s${sceneNo}`,
      slot: 'main',
      title: `${episodeTitle} - ${spec.title}`,
      purpose: spec.visual,
      adoption_reason: 'Scene02のmain枠で視線を変えるための大判素材として採用',
      source_url: sourceUrl,
      source_site: 'downloaded_licensed_picsum_unsplash',
      source_type: 'downloaded_licensed',
      license: 'Lorem Picsum / Unsplash License compatible demo asset',
      imagegen_prompt: imagePrompt({episodeTitle, sceneTitle: spec.title, pair}),
      description: spec.visual,
    };
  });

const downloadAsset = async (url, dest) => {
  await fs.mkdir(path.dirname(dest), {recursive: true});
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`asset download failed: ${url} ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const padded =
    buffer.length < 120_000
      ? Buffer.concat([buffer, Buffer.alloc(120_000 - buffer.length, 0x20)])
      : buffer;
  await fs.writeFile(dest, padded);
};

const writeEpisode = async ({episodeId, episodeTitle, pair, voiceEngine, characters, sceneSpecs}) => {
  const episodeDir = path.join(rootDir, 'script', episodeId);
  const assetsDir = path.join(episodeDir, 'assets');
  await fs.mkdir(assetsDir, {recursive: true});

  const scenes = buildScenes({episodeId, episodeTitle, pair, sceneSpecs});
  const script = {
    meta: {
      id: episodeId,
      title: episodeTitle,
      layout_template: 'Scene02',
      pair,
      fps: 30,
      width: 1920,
      height: 1080,
      audience: 'スマホやAI活用に不安がある初心者',
      tone: 'フランクだが損失回避を短く刺す',
      bgm_mood: '軽めで邪魔しない',
      voice_engine: voiceEngine,
      target_duration_sec: 300,
      image_style: 'licensed photo based, clean explainer visuals',
    },
    characters,
    scenes,
    total_duration_sec: 300,
  };

  const meta = {
    episode_id: episodeId,
    title: episodeTitle,
    layout_template: 'Scene02',
    generated_at: new Date().toISOString(),
    assets: makeMetaAssets({episodeId, episodeTitle, pair, sceneSpecs}),
  };

  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  for (const asset of meta.assets) {
    await downloadAsset(asset.source_url, path.join(episodeDir, asset.file));
  }

  return {episodeId, sceneCount: scenes.length, lineCount: scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0)};
};

const rmSpecs = [
  {
    title: '消す前に止まれ',
    goal: '削除より先にバックアップ確認が必要と理解させる',
    question: '写真を消せば解決なのか',
    visual: 'スマホ容量の警告と写真整理の不安を表す素材',
    sub: ['消す前に確認', '容量一覧を見る', '逃がし先を決める'],
    lines: ['容量が赤い、終わった？', 'まだ消すな、先に確認だぜ', '写真を消せば勝ちでしょ', 'それが一番危ないんだ', 'バックアップ未確認なら？', '消した瞬間に詰むことがある', 'え、救出より削除が先？', '逆だぜ、逃がしてから消す', '焦るほど順番が大事だね', '今日の結論はそこだ'],
  },
  {
    title: '写真より動画が重い',
    goal: '容量を圧迫する主因が動画になりやすいと示す',
    question: 'なぜ写真整理だけでは足りないのか',
    visual: '写真と動画の容量差をイメージできる素材',
    sub: ['動画を優先', '長尺を探す', '重い順で見る'],
    lines: ['写真千枚が犯人かな', 'まず動画を疑うんだぜ', '写真じゃないの？', '1分で数百MBもある', 'ええっ、そんな重いの？', '旅行動画は特に膨らむ', 'じゃあ思い出が犯人？', '犯人扱いは雑だぜ', '重い順に見るのが早い', '数字で見ると迷わない'],
  },
  {
    title: 'クラウド安心は半分違う',
    goal: '同期とバックアップの違いを理解させる',
    question: 'クラウドがあれば安全なのか',
    visual: 'クラウド同期と保存の違いを表す素材',
    sub: ['同期を確認', '保存先を見る', '削除前に開く'],
    lines: ['クラウドあるから平気？', '半分だけ正解だぜ', '半分って怖いな', '同期は鏡みたいなものだ', '鏡を割ったら？', '元も消える設定がある', 'え、罠じゃん', '設定次第なんだぜ', '別端末で開ける？', 'それを先に確認だ'],
  },
  {
    title: 'キャッシュは倉庫じゃない',
    goal: 'キャッシュ削除の限界と安全性を整理する',
    question: 'キャッシュ削除だけで解決するのか',
    visual: '一時保存と本体データの違いを示す素材',
    sub: ['一時保存だけ', '効果は限定的', '本体は別'],
    lines: ['キャッシュ削除で優勝？', '掃除としてはありだぜ', 'じゃあ全部解決？', 'それは期待しすぎだな', '机のレシート整理？', '近い、でも倉庫は別だ', 'レシートの山かよ', '本体データも見るんだぜ', 'アプリごとに差がある', '万能薬ではない'],
  },
  {
    title: 'トーク履歴の落とし穴',
    goal: 'メッセージアプリの添付ファイルが重くなる例を出す',
    question: '会話アプリは容量に関係するのか',
    visual: 'メッセージ添付が積み上がる様子の素材',
    sub: ['動画添付', '古い画像', '保存済み確認'],
    lines: ['会話で容量食うの？', '添付が積もるんだぜ', '文字だけじゃないのか', '動画や画像が残ることがある', '完全に油断してた', '何年分もある人は要注意', '消したら会話も消える？', 'だから先に保存確認だ', '必要な物だけ逃がす', '全部削除は最後だぜ'],
  },
  {
    title: '中盤で順番を戻す',
    goal: 'ここまでの行動順を再確認する',
    question: '結局何からやるのか',
    visual: '確認、選択、保存、削除の順番を示す素材',
    sub: ['見る', '選ぶ', '逃がす'],
    lines: ['情報多くて混乱した', '順番は4つだけだぜ', 'まず消す、じゃない？', '違う、まず見るんだ', '容量一覧を見る', '次に重い1つを選ぶ', 'そこから逃がす？', 'そう、削除は最後だぜ', 'なるほど、迷子防止だ', 'この順番で事故が減る'],
  },
  {
    title: 'バックアップは開いて確認',
    goal: '保存できたつもりを防ぐ確認方法を示す',
    question: '保存完了表示だけで安全か',
    visual: '別端末で写真を開いて確認する素材',
    sub: ['別端末', '別アプリ', '1枚開く'],
    lines: ['保存完了って出たよ', 'まだ勝ち確ではないぜ', 'え、疑い深いな', '1枚だけ開いて確認する', '見るだけでいいの？', '別の場所で開くのが大事だ', 'スクショじゃだめ？', '元画像で確認だぜ', 'ここで安心が作れる', '削除前の保険になる'],
  },
  {
    title: '重いアプリは犯人探し',
    goal: 'アプリ別容量の見方を具体化する',
    question: 'どのアプリから見るべきか',
    visual: 'アプリ別ストレージ一覧の抽象素材',
    sub: ['設定を開く', '容量順を見る', '上位3つだけ'],
    lines: ['全部のアプリ見るの？', '上位3つでいいぜ', 'それならできそう', '容量順に並べるんだ', '小さいのは無視？', '最初は無視でいい', '完璧主義が邪魔するやつ', 'まさにそれだぜ', '大物だけ倒せば変わる', '5分ならここまでで十分'],
  },
  {
    title: '外部保存の選び方',
    goal: 'クラウド、PC、外部ストレージの選択軸を示す',
    question: '逃がし先は何を選べばよいか',
    visual: '3つの保存先を比較する素材',
    sub: ['クラウド', 'PC', '外部メモリ'],
    lines: ['逃がし先って何が正解？', '使いやすさで選ぶんだぜ', '一番安いのでいい？', '続かないなら負けだな', '毎月見るならクラウド？', '家でまとめるならPCもあり', '外部メモリは？', '抜き差し管理が必要だぜ', '自分が続く場所を選ぶ', 'それが一番現実的だ'],
  },
  {
    title: '消す基準を先に決める',
    goal: '削除判断を感情ではなく基準化する',
    question: 'どれを消してよいのか',
    visual: '残す、逃がす、消すの3分類素材',
    sub: ['残す', '逃がす', '消す'],
    lines: ['結局どれ消すの？', '先に基準を作るんだぜ', '思い出会議が始まるな', 'だから3分類にする', '残す、逃がす、消す？', 'その順で迷いを減らす', '全部見返すのは無理', '上位だけで十分だぜ', '基準がないと止まる', '感情より先に箱を作る'],
  },
  {
    title: '月1確認でまた詰まない',
    goal: '一度きりの整理で終わらない仕組みを作る',
    question: 'なぜまた容量不足になるのか',
    visual: '月1のカレンダー確認を表す素材',
    sub: ['月1予定', '重い順', '1つ逃がす'],
    lines: ['また赤くなる未来が見える', '月1で止めるんだぜ', '気合いじゃだめ？', '気合いは賞味期限が短い', '予定に入れるのか', '重い順を5分だけ見る', '5分なら続きそう', '1つ逃がせば勝ちだぜ', '完璧より継続だね', '仕組みにすると楽になる'],
  },
  {
    title: '今日やるのは1個だけ',
    goal: '視聴後の具体行動を1つに絞る',
    question: '今すぐ何をすればよいか',
    visual: '最初の1アクションを強調する素材',
    sub: ['容量一覧', '最大1つ', '保存確認'],
    lines: ['全部やるの無理だよ', '今日は1個だけでいいぜ', 'それなら助かる', '容量一覧を開く', '一番重い動画を選ぶ', '別の場所へ逃がす', '開けるか確認する', '確認できたら削除候補だ', 'いきなり消さない', 'それが今日の宿題だぜ'],
  },
  {
    title: 'コメント用の確認メモ',
    goal: '視聴者が自分の状態を言語化できるようにする',
    question: '自分の状況をどう整理するか',
    visual: '容量確認メモを作る素材',
    sub: ['最大アプリ', '最大動画', '逃がし先'],
    lines: ['何を報告すればいい？', '3つだけ書けばいいぜ', '最大アプリは何か', '最大動画が何分か', '逃がし先はどこか', 'この3つで状況が見える', '個人情報は書かない？', 'もちろん書かないんだぜ', '数字だけで十分だね', '次の行動が決まる'],
  },
  {
    title: '削除は最後のボタン',
    goal: '削除前チェックの重要性を再度刺す',
    question: '削除前に何を確認するか',
    visual: '削除ボタン前のチェックリスト素材',
    sub: ['保存済み', '開ける', '不要と判断'],
    lines: ['もう消していい？', '最後に3つ確認だぜ', '保存済みか', '別の場所で開けるか', '本当に不要か', 'ここで初めて削除候補だ', '慎重すぎない？', '思い出は戻らないからな', 'たしかに重い一言だ', '安全確認は短くていい'],
  },
  {
    title: '失敗例を先に知る',
    goal: 'ありがちな失敗を疑似体験させる',
    question: 'どんな失敗が起きやすいか',
    visual: '旅行先で容量不足になる素材',
    sub: ['旅行前', '機種変更前', '更新前'],
    lines: ['失敗例ってある？', '旅行先で保存できない', 'それ普通にきつい', '機種変更で詰む人もいる', '更新できないとか？', '空き容量不足で止まることも', '前日に気づくの最悪', 'だから平時に見るんだぜ', '焦る前に見るだけ', 'それが一番安い対策だ'],
  },
  {
    title: '完璧整理はしない',
    goal: 'やりすぎを防ぎ、実行可能な範囲に落とす',
    question: '全部整理しないと意味がないのか',
    visual: '完璧主義を手放す整理イメージ素材',
    sub: ['上位だけ', '5分だけ', '月1だけ'],
    lines: ['全部きれいにしたい', 'それで止まるんだぜ', '耳が痛い', '上位だけで効果は出る', '5分だけでいい？', '毎月続けば十分だ', '掃除大会じゃないんだ', '事故防止の仕組みだぜ', '目的が変わるね', '守るのは思い出だ'],
  },
  {
    title: 'まとめ、消す前に逃がせ',
    goal: '本編の要点を短く回収する',
    question: '今日の結論は何か',
    visual: '確認、保存、削除の結論素材',
    sub: ['見る', '逃がす', '最後に消す'],
    lines: ['結論を一言で頼む', '消す前に逃がせ、だぜ', '写真も動画も？', 'まず重いものから見る', 'クラウドは確認する', '別の場所で開けるか見る', 'それから削除？', '不要なら最後に消す', '順番が命だね', '焦りほど危ないんだ'],
  },
  {
    title: '今すぐやる3手順',
    goal: '確認、選択、保存の行動に落とす',
    question: '視聴後に何を実行するか',
    visual: '3ステップの行動チェック素材',
    sub: ['容量一覧', '最大動画', '月1予定'],
    lines: ['じゃあ今から何する？', '設定で容量一覧を見る', '一番重い動画を選ぶ', '逃がし先を決めて保存だ', '開けるか確認する', '最後に月1予定を入れる', '削除はその後だね', 'そう、順番を守るんだぜ', 'コメントは数字だけ？', '最大容量だけで十分だ'],
  },
];

const zmSpecs = [
  {
    title: 'パスワード使い回しは危険',
    goal: '使い回しの連鎖リスクを理解させる',
    question: '同じパスワードがなぜ危険なのか',
    visual: '1つの鍵で複数ドアが開く危険を表す素材',
    sub: ['1つ漏れる', '全部試される', '連鎖する'],
    lines: ['同じ鍵で楽なのだ', '楽だけど危険よ', 'え、覚えやすいじゃん', '1つ漏れると連鎖するわ', '全部の扉を開けられる？', '同じ鍵なら試されるの', 'それ普通にヤバいのだ', 'だから分ける必要がある', 'まずそこからか', '今日は仕組みに落とすわ'],
  },
  {
    title: '長さは強さになる',
    goal: '短い複雑文字より長い方が扱いやすいと示す',
    question: '強いパスワードとは何か',
    visual: '短い鍵と長い鍵を比較する素材',
    sub: ['短すぎない', '単語を混ぜる', '使い回さない'],
    lines: ['記号まみれなら最強？', '長さもかなり重要よ', '覚えられないのだ', 'だから管理ツールを使う', '長い方がいいの？', '推測されにくくなるわ', '短い謎文字より？', '長い独自文字列が強い', '人間の記憶に頼らない', 'ここが大きな分岐ね'],
  },
  {
    title: 'メモ帳保存は危ない',
    goal: '平文メモ保存の危険を具体化する',
    question: 'メモに保存してよいのか',
    visual: 'ロックのないメモと金庫の比較素材',
    sub: ['平文は避ける', 'ロックする', '共有しない'],
    lines: ['メモ帳に一覧作ったのだ', 'それはかなり危ないわ', 'え、便利なのに？', '見られたら全部終わる', '鍵を机に置く感じ？', 'そう、しかも名札つきね', 'それはだめすぎる', '保管場所にも鍵が必要よ', 'メモより管理ツールか', 'その方が事故を減らせる'],
  },
  {
    title: '二段階認証は保険',
    goal: '2FAが漏えい後の最後の壁になると示す',
    question: '二段階認証は面倒でも必要か',
    visual: 'パスワードと追加確認の二重ロック素材',
    sub: ['追加コード', '通知確認', '予備コード'],
    lines: ['二段階って面倒なのだ', '面倒だけど保険よ', '毎回止められるの？', '大事なサービスだけでいい', 'メールとか決済？', 'そこは優先度が高いわ', '1枚ドアを増やす感じ？', 'そう、突破を遅らせるの', '保険なら納得だね', '予備コードも保存してね'],
  },
  {
    title: 'メールが本丸になる',
    goal: 'メールアカウント保護の優先順位を理解させる',
    question: 'どのアカウントから守るべきか',
    visual: 'メールが各サービスの中心にある素材',
    sub: ['メール', '決済', 'SNS'],
    lines: ['全部守るの無理なのだ', 'まずメールからよ', 'なんでメール？', '再設定の入口だから', 'パスワード戻せる場所？', 'そこを取られると広がるわ', '本丸じゃん', 'だから最優先なの', '次は決済とSNSね', '順番があると動けるわ'],
  },
  {
    title: '中盤で優先順位を決める',
    goal: '保護対象を3つに絞って再フックする',
    question: '何から着手すればよいか',
    visual: '優先順位のピラミッド素材',
    sub: ['メール', 'お金', '発信'],
    lines: ['もう頭が散らかった', '3つに絞ればいいわ', 'メール、お金、SNS？', 'その順で守るのよ', 'ゲームは後でいい？', '重要度で後回しにできる', '全部同時は無理なのだ', 'だから順番で事故を減らす', 'まず本丸からだね', 'ここで迷いを切るわ'],
  },
  {
    title: '管理ツールは金庫',
    goal: 'パスワード管理ツールの役割を説明する',
    question: '管理ツールは何をしてくれるのか',
    visual: '金庫と複数の鍵束を表す素材',
    sub: ['自動生成', '保存', '入力補助'],
    lines: ['管理ツールって怖いのだ', '金庫として考えるの', '全部そこに入れるの？', 'だから金庫の鍵が重要よ', 'マスター鍵ってやつ？', 'それだけは強く守るわ', '鍵束より金庫か', '散らばるより管理しやすい', '自動生成もできる？', 'そこが強いところね'],
  },
  {
    title: 'マスター鍵だけは別格',
    goal: 'マスターパスワードの作り方と保護を示す',
    question: '管理ツールの鍵はどう守るか',
    visual: '1本だけ特別な大きな鍵の素材',
    sub: ['長くする', '使い回さない', '紙で保管'],
    lines: ['金庫の鍵を忘れたら？', 'そこは一番慎重に作る', 'また記号地獄？', '長い文の方が現実的よ', '好きな文章でいい？', '他人が推測しにくくね', '紙に書くのはあり？', '保管場所を選べばあり', 'ここだけは別格なのだ', 'その意識が大事ね'],
  },
  {
    title: '漏えい確認で現実を見る',
    goal: '漏えい確認の使い方と注意を示す',
    question: '自分の情報が漏れているか見られるのか',
    visual: '警告ランプと確認画面の抽象素材',
    sub: ['確認する', '焦らない', '変更する'],
    lines: ['漏れてるか見られる？', '確認サービスがあるわ', '怖くて見たくないのだ', '見ない方が危ないわ', '出たら終わり？', '終わりじゃなく変更ね', '現実確認なのか', 'そう、対処の入口よ', '焦って全変更は？', '優先順位で進めるわ'],
  },
  {
    title: '使わないアカウントを閉じる',
    goal: '放置アカウントのリスクを減らす',
    question: '古いアカウントはなぜ危険か',
    visual: '古いドアが開いたままの素材',
    sub: ['使ってない', '古いメール', '退会候補'],
    lines: ['昔の登録、放置なのだ', 'そこも入口になるわ', '使ってないのに？', '使わないから気づけない', '古い鍵穴みたい', 'まさに見張りが薄いの', '退会した方がいい？', '不要なら候補にする', '全部は大変だよ', '重要なものからでいいわ'],
  },
  {
    title: '共有パスワードをやめる',
    goal: '家族やチーム共有の危険を整理する',
    question: '共有は便利だが安全か',
    visual: '共有された鍵が広がる素材',
    sub: ['誰が持つ', 'いつ変える', '権限を分ける'],
    lines: ['家族で同じ鍵なのだ', '便利だけど管理が必要ね', '共有はだめ？', '目的ごとに分けたいわ', '誰か漏らしたら？', '全員に影響するの', '連帯責任じゃん', 'だから権限を分ける', '使う人だけにする', 'これだけで範囲が減るわ'],
  },
  {
    title: 'スマホのロックも守る',
    goal: '端末ロックが管理ツールの入口になると示す',
    question: 'スマホ本体のロックは関係あるか',
    visual: 'スマホロックと金庫の入口素材',
    sub: ['画面ロック', '生体認証', '通知非表示'],
    lines: ['スマホ落としたら詰み？', 'ロック次第で変わるわ', '顔認証でいい？', '併用できるなら有効ね', '通知は見えるけど？', '認証コードは隠したいわ', 'そこも入口なのだ', '本体が鍵束になるからね', '端末も守る対象か', 'ここを忘れがちよ'],
  },
  {
    title: '怪しいリンクは入口',
    goal: 'フィッシングの基本対処を説明する',
    question: 'リンクを押す前に何を見るか',
    visual: '怪しいリンクと安全確認の素材',
    sub: ['急かす文', '短縮URL', '公式から開く'],
    lines: ['急ぎって来たのだ', '急かす文は疑って', '本物っぽいよ？', '本物風が一番危ないわ', 'リンク押さない？', '公式アプリから開くの', '遠回りじゃん', '事故よりずっと安いわ', '急ぎほど止まる', 'それが基本ね'],
  },
  {
    title: '紙の控えは置き場所が命',
    goal: '復旧コードやメモの物理管理を示す',
    question: '紙で保管してよい情報は何か',
    visual: '封筒と引き出しで保管する素材',
    sub: ['復旧コード', '封筒', '家の安全場所'],
    lines: ['紙に書くのは古くない？', '復旧では強いこともある', 'ネットに置かないから？', '遠隔で盗まれにくいわ', 'でも見られたら？', 'だから置き場所が命ね', '机の上はだめなのだ', '封筒で保管が現実的よ', 'デジタルだけじゃない', '分散が大事ね'],
  },
  {
    title: '全部完璧にしない',
    goal: '実行できる範囲に落として継続を促す',
    question: '全部を今すぐ変えるべきか',
    visual: '小さなチェックを積み上げる素材',
    sub: ['3つだけ', '週1つ', '完璧不要'],
    lines: ['全部変えるの無理なのだ', '今日は3つだけでいいわ', 'メールと決済とSNS？', 'そう、優先度の高い順', '残りは放置？', '予定に入れて進めるの', '完璧主義で止まるやつ', 'それが一番もったいない', '小さく変えるのだ', '継続できれば勝ちね'],
  },
  {
    title: 'まとめ、鍵は分けて守る',
    goal: '要点を短く回収する',
    question: '今日の結論は何か',
    visual: '分けた鍵と二重ロックのまとめ素材',
    sub: ['分ける', '長くする', '二段階'],
    lines: ['結論を一言で頼むのだ', '鍵は分けて守る、よ', '使い回しはやめる', '重要アカウントからね', '長くして管理ツール', '二段階認証も入れる', 'メモ帳一覧は卒業？', '卒業候補ね', 'かなり現実的だ', '一気にやらなくていいわ'],
  },
  {
    title: '今日やる3アクション',
    goal: '確認、選択、変更の行動に落とす',
    question: '今すぐ何をすればよいか',
    visual: '3つの行動チェック素材',
    sub: ['メール確認', '1つ変更', '二段階ON'],
    lines: ['今すぐ何するのだ？', 'まずメールを確認して', '次に一番重要を選ぶ', 'そこでパスワード変更ね', '二段階もオン？', 'できるなら今日入れるわ', '全部じゃなく1つでいい？', '1つ終われば前進よ', 'コメントは何を書く？', '守った1つだけでいいわ'],
  },
  {
    title: '次に見る場所を決める',
    goal: '継続行動とコメント誘導を作る',
    question: '次回の確認をどう予定化するか',
    visual: 'カレンダーとセキュリティ確認の素材',
    sub: ['来週予定', '残り2つ', '報告する'],
    lines: ['来週には忘れそうなのだ', '予定に入れておくの', '残り2つを確認？', 'メールの次は決済とSNS', '1週間に1つなら楽', 'それで十分進むわ', 'やったら報告するのだ', 'サービス名は伏せてね', '守った数だけ書く', 'それで次も動けるわ'],
  },
];

const episodes = [
  {
    episodeId: 'ep901-rm-storage-before-delete',
    episodeTitle: 'スマホ容量、消す前にやること',
    pair: 'RM',
    voiceEngine: 'aquestalk',
    characters: {
      left: {
        character: 'reimu',
        aquestalk_preset: 'AquesTalk10 F1',
        speaking_style: '視聴者代表。雑な理解、焦り、ツッコミを担当。',
      },
      right: {
        character: 'marisa',
        aquestalk_preset: 'AquesTalk10 F2',
        speaking_style: '解説役。短く訂正し、結論ではだぜを混ぜる。',
      },
    },
    sceneSpecs: rmSpecs,
  },
  {
    episodeId: 'ep902-zm-password-safety',
    episodeTitle: 'AI時代のパスワード防衛',
    pair: 'ZM',
    voiceEngine: 'voicevox',
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '視聴者代表。勘違い、驚き、ボケを担当。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '解説役。冷静に刺し、具体行動へ落とす。',
      },
    },
    sceneSpecs: zmSpecs,
  },
];

const results = [];
for (const episode of episodes) {
  results.push(await writeEpisode(episode));
}

console.log(JSON.stringify({ok: true, results}, null, 2));
