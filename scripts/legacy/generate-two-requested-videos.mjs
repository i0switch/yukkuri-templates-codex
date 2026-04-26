import fs from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const sourceBgmPath = path.join(rootDir, 'script', 'ep000-test-all-21-scenes', 'bgm', 'track.mp3');

const ensureDir = async (dirPath) => fs.mkdir(dirPath, {recursive: true});

const countChars = (value) => Array.from(value).length;

const commonMeta = {
  pair: 'ZM',
  fps: 30,
  width: 1920,
  height: 1080,
  audience: '副業や生活改善に興味がある一般層',
  tone: '短く刺す・危機感あり・でも対処まで出す',
  bgm_mood: '軽快だが少し緊張感',
  voice_engine: 'voicevox',
  target_duration_sec: 300,
  image_style: 'フラット図解・テキストなし・動画挿入用',
  typography: {
    subtitle_family: 'gothic',
    content_family: 'gothic',
    title_family: 'gothic',
    subtitle_stroke_color: '#000000',
    subtitle_stroke_width: 6,
  },
};

const characters = {
  left: {
    character: 'zundamon',
    voicevox_speaker_id: 3,
    speaking_style: '疑問役。語尾は〜のだ。短く反応する。',
  },
  right: {
    character: 'metan',
    voicevox_speaker_id: 2,
    speaking_style: '整理役。落ち着いて損失回避を示す。',
  },
};

const bgm = {
  title: 'upbeat step',
  source_url: 'https://dova-s.jp/en/bgm/detail/16211',
  file: 'bgm/track.mp3',
  license: 'DOVA-SYNDROME 標準利用規約',
  volume: 0.08,
  fade_in_sec: 0.8,
  fade_out_sec: 1.5,
};

const episodes = [
  {
    id: 'ep701-ai-sidejob-trap',
    title: 'AI副業で最初に損する人',
    template: 'Scene02',
    templateMemo: {
      main_content: '左上の大きいメイン枠に図解または要点カード',
      sub_content: '右上の縦長サブ枠に3項目以内の注意点',
      subtitle_area: '下部白帯。25文字以内の短文字幕',
      title_area: '独立タイトル枠なし。title_textは補助見出し扱い',
      character_layout: '下部左右端。字幕帯の端に軽く重ねる',
      avoid_area: '右サブ枠へ文字を詰めすぎない',
    },
    assets: [
      ['s01_main.png', 'スマホとAI画面を前に迷う初心者、周囲に小さな警告アイコン'],
      ['s07_main.png', '無料ツール沼、未完成ファイル、散らかったタスクの図解'],
      ['s14_main.png', '小さな自動化の流れ、入力から投稿までのシンプルなパイプライン'],
      ['s21_main.png', 'チェックリストで安全に進む副業設計、落ち着いた達成感'],
    ],
    mainBullets: [
      ['需要確認', '小さく販売', '反応を記録'],
      ['ツールより需要', '売る前に聞く', '反応で判断'],
      ['収集沼', '未完成', '売上ゼロ'],
      ['学習だけ', '検証ゼロ', '一週間消耗'],
      ['買う人不在', '悩みが浅い', '便利止まり'],
      ['小さな実績', '一件の反応', '大作禁止'],
      ['困りごと', '言葉を拾う', '答えは後'],
      ['一時間商品', '軽く買える', '範囲を絞る'],
      ['安すぎ注意', '価値範囲', '無料で逃げない'],
      ['保存導線', '相談導線', '読後の一歩'],
      ['手順固定後', '自動化', '失敗も増幅'],
      ['結論先出し', '損を刺す', '一歩で閉じる'],
      ['放置リスク', '対処一つ', '保存される型'],
      ['十人確認', '一人で悩まない', '市場に聞く'],
      ['三十分運用', '記録固定', '改善固定'],
      ['切り口変更', '商品断定しない', '見せ方検証'],
      ['フック', '悩み具体性', '入口改善'],
      ['不安で終えない', '対処まで', '信用を守る'],
      ['短く刺す', '一投稿一つ', '欲張らない'],
      ['悩み十個', '一投稿', '反応記録'],
      ['需要逆算', '順番重視', '作って探さない'],
      ['今日一投稿', '記録開始', '放置を止める'],
    ],
    subBullets: [
      ['作りすぎ注意', '導線を置く', '自動化は後'],
      ['需要確認', '小さく出す', '記録する'],
      ['集めない', '作る', '見せる'],
      ['時間上限', '期限', '検証数'],
      ['誰の悩み', '痛みの深さ', '支払う理由'],
      ['1件でよい', '早く出す', '反応を見る'],
      ['質問3つ', '原文保存', '言い換えない'],
      ['成果物1つ', '納期短め', '値段軽め'],
      ['安売り注意', '範囲明記', '追加は別'],
      ['保存', '相談', '次の投稿'],
      ['手順化後', 'ログあり', '戻せる'],
      ['結論', '損失', '行動'],
      ['放置', '損', '対処'],
      ['10人', '3反応', '1改善'],
      ['30分', '記録', '次回改善'],
      ['切り口', '見出し', '悩み'],
      ['入口', '具体例', '一文目'],
      ['危機感', '根拠', '対処'],
      ['一投稿', '一主張', '一行動'],
      ['メモ', '投稿', '記録'],
      ['順番', '需要', '小さく'],
      ['今日', '一歩', '記録'],
    ],
    sceneTitles: [
      ['導入', ['AI副業は楽に見えるのだ', 'でも最初に損しやすいわ', '稼げる前に消耗なのだ', '順番を間違えるからよ']],
      ['結論', ['先に売り物を決めるのだ？', 'そこが一番大事なのよ', 'ツール選びじゃないのだ', '需要確認が先ですわ']],
      ['よくある罠', ['無料ツールを集めがちなのだ', '集めても売上は増えないわ', '作業感だけ増えるのだ', '成果物が出ないのが痛いの']],
      ['損失1', ['時間が溶けるのだ', '学習だけで満足するからよ', '気づくと一週間なのだ', '検証ゼロなら危険ですわ']],
      ['損失2', ['買う人を見てないのだ', '自分の便利だけで作るのよ', 'それは売れないのだ', '悩みの深さが足りないわ']],
      ['損失3', ['実績がないと怖いのだ', 'だから小さく試すのよ', 'いきなり大作はだめなのだ', '一件の反応を取りに行くわ']],
      ['確認', ['まず何を聞けばいいのだ？', '困りごとを三つ集めるの', '答えを売る前なのだ', '悩みの言葉を拾うのよ']],
      ['商品化', ['商品はどう作るのだ？', '一時間で終わる形にするわ', '小さいほど良いのだ', '最初は軽く買える物ですわ']],
      ['価格', ['安ければ売れるのだ？', '安すぎると雑に見えるわ', '無料配布じゃないのだ', '価値の範囲を決めるのよ']],
      ['導線', ['投稿だけでいいのだ？', '次の行動が必要なのよ', '読んで終わりは損なのだ', '保存か相談へつなげるわ']],
      ['自動化', ['自動化はいつ使うのだ？', '手順が固まってからよ', '先に自動化は危険なのだ', '失敗も増幅するからですわ']],
      ['型', ['投稿の型が欲しいのだ', '結論から始めるのよ', '損を短く刺すのだ', '最後に一歩を置くわ']],
      ['例', ['たとえば何を書くのだ？', '放置リスクを書くのよ', 'やらない損なのだ', '対処を一つ出すのが鍵よ']],
      ['最低条件', ['何件で判断するのだ？', '十人の反応を見たいわ', '一人で悩まないのだ', '市場に聞くのが早いの']],
      ['作業量', ['毎日長時間は無理なのだ', '三十分でも回せるわ', '仕組みがあればなのだ', '記録と改善を固定するのよ']],
      ['失敗対策', ['反応ゼロなら終わりなのだ？', '切り口を変えるだけよ', '商品が悪いとは限らないのだ', '見せ方の検証ですわ']],
      ['改善', ['どこを直せばいいのだ？', 'フックと悩みの具体性ね', '中身より入口なのだ', '読まれないと売れないわ']],
      ['危険', ['煽りすぎはだめなのだ？', '信用を削るから危険よ', '不安だけ残すのだ', '対処まで出して完成ですわ']],
      ['テンプレ', ['投稿は短くていいのだ？', '短い方が刺さることもあるわ', '一投稿一メッセージなのだ', '欲張るほど弱くなるのよ']],
      ['最短手順', ['今日やるなら何なのだ？', '悩みを十個メモするの', '次に一個だけ投稿なのだ', '反応を必ず記録してね']],
      ['まとめ', ['ツールより順番なのだ', '需要から逆算するのよ', '作ってから探さないのだ', '先に欲しい人を見るわ']],
      ['CTA', ['まず小さく試すのだ', '今日一投稿で十分よ', '放置が一番損なのだ', '反応の記録から始めてね']],
    ],
    mainForScene: (index) => {
      const assetMap = {0: 's01_main.png', 6: 's07_main.png', 13: 's14_main.png', 20: 's21_main.png'};
      if (assetMap[index]) {
        const description = episodes[0].assets.find(([file]) => file === assetMap[index])?.[1];
        return makeImageContent({
          asset: `assets/${assetMap[index]}`,
          caption: index === 0 ? '最初に損する順番' : index === 6 ? '悩みの言葉を拾う' : index === 13 ? '十人で小さく検証' : '需要から逆算する',
          description,
          template: 'Scene02',
          slot: 'main',
        });
      }
      return {kind: 'bullets', items: episodes[0].mainBullets[index]};
    },
    subForScene: (index) => ({kind: 'bullets', items: episodes[0].subBullets[index]}),
  },
  {
    id: 'ep702-phone-storage-risk',
    title: 'スマホ容量を放置すると損する理由',
    template: 'Scene20',
    templateMemo: {
      main_content: '中央ガラス枠に図解や要点カードを大きく表示',
      sub_content: 'sub_contentなし',
      subtitle_area: '下部字幕枠。25文字以内で短く切る',
      title_area: '独立タイトル枠なし。main内とtitle_textで補助',
      character_layout: '下部左右端。中央字幕枠を避ける',
      avoid_area: '中央ガラス枠外と虹色光線の端を覆いすぎない',
    },
    assets: [
      ['s01_main.png', '容量不足のスマホ、写真と動画が積み上がり警告が出る図解'],
      ['s08_main.png', 'バックアップされない写真と壊れたクラウド矢印の注意図解'],
      ['s15_main.png', '写真整理の三分類、残す、消す、移すを示すシンプル図解'],
      ['s22_main.png', 'スマホが軽くなり通知が整うクリーンなホーム画面'],
    ],
    mainBullets: [
      ['容量不足', '撮れない', '更新できない'],
      ['撮影失敗', '大事な瞬間', '後悔'],
      ['動作低下', '更新失敗', '警告増加'],
      ['保存不可', 'イベント中', 'あとで消す罠'],
      ['同期停止', '保存済み錯覚', '写真消失'],
      ['警告慣れ', '通知埋もれ', '危険見逃し'],
      ['動画が重い', '積み上がる', '一気に効く'],
      ['連写', 'スクショ', '重複写真'],
      ['スクショから', '期限切れ', '低リスク'],
      ['長い動画', '先に避難', '不安を減らす'],
      ['残す', '消す', '移す'],
      ['週一', '五分', '固定日'],
      ['同期確認', '端末外で見る', '入れたつもり禁止'],
      ['コピー', '確認', '削除'],
      ['設定確認', '数字で見る', '感覚禁止'],
      ['大きい順', '未使用アプリ', '整理'],
      ['古い月', '時間制限', '迷ったら移す'],
      ['スクショ後削除', '放置前', '増やさない'],
      ['自動削除注意', '別保存', '設定確認'],
      ['撮影安定', '探す時間減', '気分も軽い'],
      ['機会損失', '写真保護', '先に逃がす'],
      ['空き確認', '動画移動', '五分で開始'],
    ],
    sceneTitles: [
      ['導入', ['容量不足を放置してないのだ？', 'それ地味に損が大きいわ', '写真が多いだけなのだ', '実はリスクが重なるのよ']],
      ['結論', ['何が一番怖いのだ？', '撮りたい時に撮れないことよ', 'それはかなり困るのだ', '大事な瞬間ほど起きるわ']],
      ['症状', ['最近スマホが重いのだ', '空き容量が少ないかもね', 'アプリも遅いのだ', '更新失敗も増えやすいわ']],
      ['損失1', ['写真が保存できないのだ', 'イベント中に起きると痛いわ', 'あとで消せばいいのだ', 'そのあとが来ないのよ']],
      ['損失2', ['バックアップも危ないのだ？', '容量不足で止まることがあるわ', '守れてないのだ', '保存済みのつもりが危険ね']],
      ['損失3', ['通知も増えてうるさいのだ', '警告が日常になるのよ', '慣れると無視なのだ', '本当に危険な通知も埋もれるわ']],
      ['原因', ['犯人は写真なのだ？', '動画が一番重いことが多いわ', '短い動画も危険なのだ', '積もると一気に効くのよ']],
      ['見落とし', ['同じ写真が多いのだ', '連写とスクショが残りがちね', '消すのが面倒なのだ', 'だから仕組みにするのよ']],
      ['基準', ['何から消すのだ？', 'まずスクショから見るの', '思い出じゃないのだ', '期限切れ情報が多いわ']],
      ['次', ['動画はどうするのだ？', '長いものから移すのよ', '消すより先に避難なのだ', '不安を減らす順番ね']],
      ['分類', ['分類が苦手なのだ', '三つだけでいいわ', '残す消す移すなのだ', '迷ったら移すにするのよ']],
      ['頻度', ['毎日やるのは無理なのだ', '週一で十分ですわ', '五分でもいいのだ', '固定日を決めるのが強いわ']],
      ['クラウド', ['クラウドに入れたら安心なのだ？', '同期済み確認が必要よ', '入れたつもりは危険なのだ', '端末外で見えるか確認ね']],
      ['注意', ['全部消すのは怖いのだ', 'だから二段階で進めるの', '先にコピーなのだ', '確認してから削除ですわ']],
      ['実践1', ['まず空き容量を見るのだ', '設定画面で確認するわ', '数字で見るのだ', '感覚だと後回しになるの']],
      ['実践2', ['次に大きい順なのだ', '重いアプリも確認ね', '使わないゲームなのだ', '残す理由がなければ整理よ']],
      ['実践3', ['写真は月別がいいのだ？', '古い月から見ると楽よ', '思い出に浸るのだ', '時間制限をつけてね']],
      ['予防', ['増やさない工夫はあるのだ？', 'スクショ後にすぐ消すの', '一番簡単なのだ', '放置前に止めるのが勝ちよ']],
      ['自動化', ['自動削除は便利なのだ？', '設定は確認して使うのよ', '勝手に消えるの怖いのだ', '大事な物は別保存ね']],
      ['効果', ['整理すると何が変わるのだ？', '撮影と更新が安定するわ', '気分も軽いのだ', '探す時間も減るのよ']],
      ['まとめ', ['容量不足はただの通知じゃないのだ', '機会損失の入口なのよ', '写真を失う前なのだ', '先に逃がすのが正解ね']],
      ['CTA', ['今日やることは一つなのだ', '空き容量を確認してね', '不足なら動画から移すのだ', '五分だけで未来が軽いわ']],
    ],
    mainForScene: (index) => {
      const assetMap = {0: 's01_main.png', 7: 's08_main.png', 14: 's15_main.png', 21: 's22_main.png'};
      if (assetMap[index]) {
        const description = episodes[1].assets.find(([file]) => file === assetMap[index])?.[1];
        return makeImageContent({
          asset: `assets/${assetMap[index]}`,
          caption: index === 0 ? '容量不足は放置リスク' : index === 7 ? 'バックアップ漏れに注意' : index === 14 ? '整理は三分類で進める' : '五分で未来を軽くする',
          description,
          template: 'Scene20',
          slot: 'main',
        });
      }
      return {kind: 'bullets', items: episodes[1].mainBullets[index]};
    },
    subForScene: () => null,
  },
];

const makeImagePrompt = ({caption, description, template, slot}) => [
  `ゆっくり解説動画の${template} ${slot}枠に入れる図解素材`,
  `主題: ${caption}`,
  `内容: ${description}`,
  '1枚1メッセージ、中央に主題、余白を広く取る',
  '細かい文字、ブランドロゴ、実在人物、既存キャラクターは禁止',
  '16:9、フラット図解、青緑基調、字幕やキャラを邪魔しない',
].join('。');

const makeImageContent = ({asset, caption, description, template, slot}) => ({
  kind: 'image',
  asset,
  caption,
  asset_requirements: {
    description,
    imagegen_prompt: makeImagePrompt({caption, description, template, slot}),
    style: '16:9 flat explainer diagram, spacious composition, no small text',
    aspect: '16:9',
    negative: 'small text, dense UI, brand logos, real people, existing characters',
  },
});

const getSceneLines = (_episode, _index, sceneTuple) => {
  const [, lines] = sceneTuple;
  return lines;
};

const getSceneQuality = (episode, index, sceneTuple, main, sub) => {
  const [title, lines] = sceneTuple;
  const leftLine = lines.find((_, lineIndex) => lineIndex % 2 === 0) ?? lines[0];
  const contentText = main.kind === 'image' ? main.caption : main.items?.join(' / ') ?? main.text;
  const subText = sub ? sub.items?.join(' / ') ?? sub.text ?? sub.caption : 'サブ枠なし';

  return {
    title,
    scene_goal: `${title}: ${lines[1] ?? lines[0]} を短く理解させる`,
    viewer_question: leftLine,
    visual_role: `main枠は「${contentText}」、sub枠は「${subText}」を担当する`,
  };
};

const makeScene = (episode, index, sceneTuple) => {
  const main = episode.mainForScene(index);
  const sub = episode.subForScene(index);
  const quality = getSceneQuality(episode, index, sceneTuple, main, sub);
  return {
    id: `s${String(index + 1).padStart(2, '0')}`,
    role: index === 0 ? 'intro' : index === episode.sceneTitles.length - 1 ? 'cta' : index > episode.sceneTitles.length - 4 ? 'outro' : 'body',
    scene_goal: quality.scene_goal,
    viewer_question: quality.viewer_question,
    visual_role: quality.visual_role,
    title_text: episode.template === 'Scene20' ? quality.title : undefined,
    main,
    sub,
    dialogue: getSceneLines(episode, index, sceneTuple).map((text, lineIndex) => ({
      id: `l${String(lineIndex + 1).padStart(2, '0')}`,
      speaker: lineIndex % 2 === 0 ? 'left' : 'right',
      text,
      expression: lineIndex === 0 ? 'happy' : lineIndex === 1 ? 'calm' : 'smile',
      pre_pause_sec: 0.12,
      post_pause_sec: 0.28,
    })),
  };
};

const buildScript = (episode) => ({
  meta: {
    id: episode.id,
    title: episode.title,
    layout_template: episode.template,
    ...commonMeta,
  },
  characters,
  bgm,
  scenes: episode.sceneTitles.map((scene, index) => makeScene(episode, index, scene)),
});

const buildImagePointScript = (episode) => {
  const lines = [`# ${episode.title} 画像ポイント付き台本`, '', `- episode_id: ${episode.id}`, `- template: ${episode.template}`, ''];
  for (const [key, value] of Object.entries(episode.templateMemo)) {
    lines.push(`- ${key}: ${value}`);
  }
  lines.push('');
  for (let index = 0; index < episode.sceneTitles.length; index += 1) {
    const scene = makeScene(episode, index, episode.sceneTitles[index]);
    lines.push(`## ${scene.id} ${scene.title_text}`);
    lines.push(`- scene_template: ${episode.template}`);
    lines.push(`- main_content: ${scene.main.kind === 'image' ? `${scene.main.caption} / ${scene.main.asset}` : scene.main.items?.join(' / ') ?? scene.main.text}`);
    lines.push(`- sub_content: ${scene.sub ? scene.sub.items.join(' / ') : 'sub_contentなし'}`);
    lines.push(`- subtitle_area: ${episode.templateMemo.subtitle_area}`);
    lines.push(`- title_area: ${episode.templateMemo.title_area}`);
    lines.push(`- image_insert_point: ${scene.main.kind === 'image' ? `${scene.id} の冒頭 l01 の直前から表示` : '画像なし。箇条書きカード表示'}`);
    lines.push(`- asset_path: ${scene.main.kind === 'image' ? `script/${episode.id}/${scene.main.asset}` : 'asset_pathなし'}`);
    lines.push('');
    for (const line of scene.dialogue) {
      lines.push(`- ${line.speaker === 'left' ? 'ずんだもん' : 'めたん'}: ${line.text}`);
    }
    lines.push('');
  }
  return lines.join('\n');
};

const buildScriptMarkdown = (episode) => {
  const lines = [`# ${episode.title}`, '', '## 企画', '- 1投稿1メッセージの動画版として、放置リスクから対処まで短く通す', `- 使用テンプレート: ${episode.template}`, '- 想定尺: 5分程度', '', '## 台本'];
  episode.sceneTitles.forEach((sceneTuple, index) => {
    const [title] = sceneTuple;
    const dialogue = getSceneLines(episode, index, sceneTuple);
    const sceneId = `s${String(index + 1).padStart(2, '0')}`;
    lines.push('', `### ${sceneId} ${title}`);
    dialogue.forEach((line, lineIndex) => {
      lines.push(`${lineIndex % 2 === 0 ? 'ずんだもん' : 'めたん'}：${line}`);
    });
  });
  lines.push('', '## 自己監査', '- 25文字以内の短文字幕に分割済み', '- 1動画1テンプレート固定', '- 不安だけで終わらず、対処と次の行動まで入れた');
  return lines.join('\n');
};

const buildEditScript = (episode) => {
  const rows = episode.sceneTitles.map(([title], index) => {
    const scene = makeScene(episode, index, episode.sceneTitles[index]);
    const asset = scene.main.kind === 'image' ? scene.main.asset : '箇条書きカード';
    const se = index === 0 ? 'ドン' : index % 6 === 0 ? 'ポン' : index % 5 === 0 ? 'ピコン' : '';
    return `| ${scene.id} | ${scene.role} | ${asset} | 白文字+黒縁 | ${index === 0 ? 'タイトル軽くズーム' : 'フェードイン'} | 発話側を少し前面 | ${se} | 通奏 | ${title} |`;
  });
  return `# ${episode.title} 編集箇所付き台本

## 1. 全体設定

- 動画タイプ：ずんだもん解説
- 画面比率：16:9
- 解像度：1280x720
- 想定尺：5分程度
- 編集環境：Remotion
- 通常字幕フォント：けいふぉんと
- 通常字幕スタイル：白文字 + 太い黒縁 + 軽い影
- 使用テンプレート：${episode.template} のみ

## 2. タイムライン概要

| パート | 目安時間 | 主な演出 | BGM |
|---|---:|---|---|
| OP | 0:00-0:15 | 問題提起を大きく見せる | 軽快 |
| 本編 | 0:15-4:35 | 図解と箇条書きを交互に出す | 通奏 |
| まとめ | 4:35-5:00 | 要点回収と行動提示 | フェードアウト |

## 3. シーン別演出

| scene_id | パート | 表示素材 | 字幕スタイル | 画面演出 | キャラ演出 | SE | BGM | 備考 |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## 4. 必要素材リスト

| asset_id | 種類 | 内容 | 用途 | 入手元候補 |
|---|---|---|---|---|
${episode.assets.map(([file, desc]) => `| ${file} | ImageGen PNG | ${desc} | main枠 | image gen |`).join('\n')}

## 5. 実装時の注意

- 15秒以上同じ見た目が続く箇所は、箇条書きカードのフェードで動きを作る
- SEは重要箇所だけ
- 字幕は最大2行、台詞は25文字以内
- BGMはセリフを邪魔しない音量にする
`;
};

const sceneIdFromAssetFile = (file) => file.replace(/_main\.png$/u, '');

const imageGenerationId = ({episodeId, sceneId, slot, asset}) =>
  ['image_gen', episodeId, sceneId, slot, asset.split('/').pop()].join(':');

const buildMeta = (episode) => ({
  episode_id: episode.id,
  generated_at: new Date().toISOString(),
  generator: 'Codex requested two video generator',
  template: episode.template,
  theme: episode.title,
  voices: [
    {visual_character: 'ずんだもん', engine: 'VOICEVOX', speaker_id: 3, credit: 'VOICEVOX:ずんだもん'},
    {visual_character: '四国めたん', engine: 'VOICEVOX', speaker_id: 2, credit: 'VOICEVOX:四国めたん'},
  ],
  assets: [
    {
      file: 'bgm/track.mp3',
      source_site: 'dova-syndrome',
      source_url: bgm.source_url,
      title: bgm.title,
      license: bgm.license,
      credit_required: false,
    },
    ...episode.assets.map(([file, description]) => {
      const sceneId = sceneIdFromAssetFile(file);
      const assetPath = `assets/${file}`;
      return {
        file: assetPath,
        source_site: 'OpenAI image generation',
        source_type: 'image_gen',
        generation_id: imageGenerationId({episodeId: episode.id, sceneId, slot: 'main', asset: assetPath}),
        scene_id: sceneId,
        slot: 'main',
        purpose: description,
        adoption_reason: `${episode.template}のmain枠で1シーン1メッセージを視覚化するため`,
        description,
        imagegen_prompt: makeImagePrompt({
          caption: description,
          description,
          template: episode.template,
          slot: 'main',
        }),
        imagegen_model: 'built-in image_gen',
        provenance: 'image_gen per-asset ledger entry',
        license: 'user-generated AI asset for this project',
        credit_required: false,
      };
    }),
  ],
});

for (const episode of episodes) {
  const script = buildScript(episode);
  for (const scene of script.scenes) {
    for (const line of scene.dialogue) {
      if (countChars(line.text) > 25) {
        throw new Error(`${episode.id} ${scene.id}/${line.id} exceeds 25 chars: ${line.text}`);
      }
    }
  }

  const episodeDir = path.join(rootDir, 'script', episode.id);
  await ensureDir(path.join(episodeDir, 'audio'));
  await ensureDir(path.join(episodeDir, 'assets'));
  await ensureDir(path.join(episodeDir, 'bgm'));
  await ensureDir(path.join(episodeDir, 'se'));
  await fs.copyFile(sourceBgmPath, path.join(episodeDir, 'bgm', 'track.mp3'));
  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.md'), buildScriptMarkdown(episode), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_image_points.md'), buildImagePointScript(episode), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_editing_notes.md'), buildEditScript(episode), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), JSON.stringify(buildMeta(episode), null, 2), 'utf8');
}

console.log(JSON.stringify({episodes: episodes.map((episode) => episode.id)}, null, 2));








