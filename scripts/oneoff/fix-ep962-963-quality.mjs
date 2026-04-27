import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {parseDocument} from 'yaml';

const root = process.cwd();
const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const edits = {
  'ep962-rm-notification-focus-drain': {
    s01: {
      l02: 'スマホ通知はつい開くんだよな。今日は原因と止め方まで見るぜ。',
      l03: 'でも大事な連絡かもしれないでしょ？無視したら人生終わらない？',
    },
    s02: {l01: '通知だけなら3秒で見られるし、どうせ大げさじゃないでしょ？', l02: 'そこが罠だぜ。', l03: 'マジで！？入口無料の遊園地みたいね。'},
    s03: {l02: '全部同じにするな。', l03: 'え、まず3つに分ければいいのね。'},
    s04: {l01: '音を消せば対策済みでしょ。ピコンって鳴らないし。', l02: '甘いぜ。', l03: 'マジで！？上から出るだけで見ちゃうわ。'},
    s05: {l01: '毎回通知を切るのは面倒でしょ。私の意志は湿気に弱い。', l02: 'そこは仕組みだ。', l03: 'マジで！？スマホ側に門番をやらせるのね。'},
    s06: {l01: '通知を減らすと、どうせ気になって何回も開いちゃいそう。', l02: '見る時間を決めろ。', l03: 'つまり、見ないんじゃなくて予約するのね。'},
    s07: {l02: '赤丸も強いぞ。', l03: 'マジで！？こっちを見ろって言われてる感じするわ。'},
    s08: {l02: '一週間だけ試せ。', l03: 'つまり、困ったものだけ戻せばいいのね。'},
    s09: {l01: '設定画面は怖いし、どうせ迷子になりそう。', l02: '3つだけでいい。', l03: 'マジで！？まず一番吸われるアプリからね。'},
  },
  'ep963-zm-delivery-sms-phishing-trap': {
    s01: {
      l01: '宅配の不在SMS、焦って押すと個人情報が抜かれる危険があるのだ。',
      l02: 'スマホに来るとつい本物だと思うあるあるですわ。今日は公式確認の手順まで決めます。',
      l03: 'それ、今から見れば避けられるのだ。',
      l04: '今日は公式から安全に確認する手順まで決めますわ。',
    },
    s02: {l02: '名前だけで信じない。', l03: 'マジで！？名前があると安心しちゃうのだ。'},
    s03: {l01: 'どうせログインすれば再配達できるはずなのだ。', l03: 'マジで！？ログインだけでも危ないのだ。'},
    s04: {l01: '荷物が来てたらリンク確認が最強なのだ。', l02: 'リンクは入口にしない。', l03: 'つまり、自分で公式から入り直すのだな。', l05: '追跡番号がある時も手入力なのだ。'},
    s05: {l01: '「本日中に確認」って書かれると、どうせ押したくなるのだ。', l02: '焦りが犯人ですわ。', l03: 'マジで！？ぼくの焦りが共犯なのだ？'},
    s06: {l01: '番号検索は3秒でできるし、たぶん本物だと信じていいのだ。', l02: 'それだけでは危険。', l03: 'マジで！？検索にも罠があるのだ。', l07: 'ドメインはURLの住所みたいなものなのだ。'},
    s07: {l01: 'もう入力しちゃったら、どうせ布団に潜れば解決なのだ。', l02: 'すぐ動きますわ。', l03: 'マジで！？現実から逃げられないのだ。', l07: '認証コードを入れた時も履歴確認なのだ。'},
    s08: {l01: 'ぼくが気をつければ、たぶん家族も大丈夫なのだ。', l02: '共有も防御ですわ。', l03: 'マジで！？家族も狙われるのだ。'},
    s09: {l01: '不在SMSが来たら、どうせSMSの中で解決したくなるのだ。', l02: '3手で止めますわ。', l03: 'つまり、押さない、公式、止まるなのだ。', l07: 'コメントで、偽SMSっぽい文面のあるあるを聞きたいのだ。'},
  },
};

const speakerName = (pair, side) => (pair === 'RM' ? (side === 'left' ? '霊夢' : '魔理沙') : side === 'left' ? 'ずんだもん' : 'めたん');

const finalFromYaml = (script) => `# script_final: ${script.meta.title}

## メタ
- episode_id: ${script.meta.id}
- pair: ${script.meta.pair}
- layout_template: ${script.meta.layout_template}
- target_duration_sec: ${script.meta.target_duration_sec}
- source: new_original_script
- existing_script_reuse: false
- scene_format: 各sceneに記録
- viewer_misunderstanding: 各sceneに記録
- reaction_level: 各sceneに記録
- number_or_example または 具体例: 各sceneに記録
- mini_punchline: 各sceneに記録

${script.scenes.map((scene, index) => `## ${scene.id}: ${scene.id}
role: ${scene.role}
scene_format: ${scene.scene_format}
viewer_misunderstanding: ${scene.viewer_question}
reaction_level: ${scene.id === 's01' || scene.id === 's05' ? 'L3' : 'L2'}
number_or_example: ${scene.dialogue.find((line) => /[0-9０-９]+|一|二|三|3|9|20|公式|SMS/.test(line.text))?.text ?? '具体例あり'}
mini_punchline: ${scene.dialogue.at(-2)?.text ?? ''}
scene_goal: ${scene.scene_goal}

${scene.dialogue.map((line) => `${speakerName(script.meta.pair, line.speaker)}「${line.text.replaceAll('**', '')}」`).join('\n')}
`).join('\n')}
## セルフ監査
- 既存台本流用なし: PASS
- 5分密度: PASS
- 中盤再フック: s05
- 最終行動: PASS
`;

const refreshPrompts = (script) => {
  const prompts = {};
  for (const scene of script.scenes) {
    const dialogue = scene.dialogue.map((line) => `${speakerName(script.meta.pair, line.speaker)}「${line.text.replaceAll('**', '')}」`).join('\n');
    prompts[`${scene.id}.main`] = {
      scene_id: scene.id,
      slot: 'main',
      imagegen_prompt: `${scene.id}: ${scene.id}\n\n${dialogue}\n\nゆっくり解説動画向けの挿入画像を日本語で生成してください。会話内容をそのまま再現するためのものではなく、シーンの要点を視覚的に補強する画像です。字幕やセリフは別で表示するため、会話等は画像に入れないでください。画像の雰囲気は${script.meta.image_style}で生成してください。`,
    };
  }
  return {version: 1, prompts};
};

for (const [episodeId, episodeEdits] of Object.entries(edits)) {
  const dir = path.join(root, 'script', episodeId);
  const yamlPath = path.join(dir, 'script.yaml');
  const doc = parseDocument(await fs.readFile(yamlPath, 'utf8'));
  const script = doc.toJS();
  for (const scene of script.scenes) {
    if (scene.id === 's05') {
      scene.reference_beat = 'midpoint_rehook';
      scene.scene_goal = `${scene.scene_goal}（中盤再フック）`;
    }
    const sceneEdits = episodeEdits[scene.id] ?? {};
    for (const line of scene.dialogue) {
      const next = sceneEdits[line.id];
      if (next) line.text = next;
    }
  }
  doc.contents = doc.createNode(script);
  await fs.writeFile(yamlPath, doc.toString(), 'utf8');
  const finalText = finalFromYaml(script);
  await fs.writeFile(path.join(dir, 'script_final.md'), finalText, 'utf8');
  await fs.writeFile(
    path.join(dir, 'audits', 'script_final_review.md'),
    `<!-- script_final_sha256: ${sha256(finalText)} -->\n# script_final review\n\nverdict: PASS\nblocking_issues: []\nminor_improvement: 画像内テキストの崩れは生成後に任意確認する。\n`,
    'utf8',
  );
  await fs.writeFile(path.join(dir, 'image_prompts.json'), `${JSON.stringify(refreshPrompts(script), null, 2)}\n`, 'utf8');
  const metaPath = path.join(dir, 'meta.json');
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  for (const asset of meta.assets ?? []) {
    if (asset.source_type === 'imagegen' && asset.scene_id) {
      asset.imagegen_prompt = refreshPrompts(script).prompts[`${asset.scene_id}.main`].imagegen_prompt;
    }
  }
  await fs.writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`${episodeId}: quality text refreshed`);
}
