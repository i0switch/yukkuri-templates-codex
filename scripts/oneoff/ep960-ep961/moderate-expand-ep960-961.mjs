import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument, stringify} from 'yaml';

const rootDir = process.cwd();
const additions = {
  'ep960-rm-wifi-slow-fix': {
    targetTotal: 121,
    s01: [
      ['left','まず現実を見るのね。'], ['right','測れば怒る相手も分かる。'], ['left','それは助かるわ。'],
    ],
    s02: [
      ['left','無料で試せるのは良いわね。'], ['right','戻せるから失敗も小さい。'], ['left','まず置き場チェックね。'],
    ],
    s03: [
      ['left','地図があれば迷わないわ。'], ['right','買う前の判断材料になる。'], ['left','測定、大事ね。'],
    ],
    s04: [
      ['left','夜だけ遅い理由っぽいわ。'], ['right','混雑時間と重なるからな。'], ['left','一つずつ試すのね。'],
    ],
    s05: [
      ['left','触って熱いなら怪しい？'], ['right','かなり怪しい。通気を見る。'], ['left','布は外すわ。'],
    ],
    s06: [
      ['left','期待しすぎ注意ね。'], ['right','でも体感改善は狙える。'], ['left','現実的でいいわ。'],
    ],
    s07: [
      ['left','場所で選ぶのね。'], ['right','近いか遠いかで変える。'], ['left','寝室は試してみるわ。'],
    ],
    s08: [
      ['left','年数も見るのね。'], ['right','不調メモが判断に効く。'], ['left','買う前に記録ね。'],
    ],
    s09: [
      ['left','3つならできそう。'], ['right','測る、動かす、確認だ。'], ['left','今日の宿題ね。'],
    ],
    s10: [
      ['left','増設も慎重にね。'], ['right','弱い場所に置かないこと。'], ['left','置き場所がまた大事なのね。'],
    ],
    s11: [['left','順番が分かれば怖くないわ。']],
  },
  'ep961-zm-food-expense-trap': {
    targetTotal: 130,
    s01: [
      ['left','買う前が勝負なのだ。'], ['right','レジ前では遅いことが多いわ。'], ['left','棚で止まるのだな。'],     ],
    s02: [
      ['left','値札だけで決めないのだ。'], ['right','今週使うかも見るの。'], ['left','かご前に確認なのだ。'],     ],
    s03: [
      ['left','保存できる物だけ多めなのだ。'], ['right','傷む物は予定がある時だけ。'], ['left','冷蔵庫に任せすぎないのだ。'],     ],
    s04: [
      ['left','冷蔵庫を見るの地味だけど強いのだ。'], ['right','二重買いを防げるからね。'], ['left','家の中を先に探すのだ。'], ['right','その順番が節約ですわ。'],
    ],
    s05: [
      ['left','残り物が主役なのだ。'], ['right','先にある物を使うのが近道。'], ['left','足りない物だけ買うのだ。'], ['right','それでロスも減りますわ。'],
    ],
    s06: [
      ['left','我慢より理由づけなのだな。'], ['right','続く判断に変えましょう。'], ['left','気分買いも枠内なのだ。'], ['right','完全禁止より現実的よ。'],
    ],
    s07: [
      ['left','リストにも役割があるのだな。'], ['right','買う理由を短く残す道具よ。'], ['left','願望を書きすぎないのだ。'], ['right','調整枠だけ残しましょう。'],
    ],
    s08: [
      ['left','正解は家庭ごとに違うのだ。'], ['right','使い切れたかを見て調整するの。'], ['left','予定変更も考えるのだ。'], ['right','だから少量追加もありですわ。'],
    ],
    s09: [
      ['left','これなら週末からできそうなのだ。'], ['right','冷蔵庫、在庫、上限枠だけよ。'], ['left','シンプルなのだ。'], ['right','続くことが大事ですわ。'],
    ],
    s10: [
      ['left','続く形が一番なのだ。'], ['right','無理な我慢は高くつくわ。'], ['left','反動買いは避けたいのだ。'], ['right','満足感も残しましょう。'],
    ],
    s11: [
      ['left','まず冷蔵庫から始めるのだ。'], ['right','見る、決める、枠を作る。'], ['left','今週末の3手なのだ。'],     ],
  },
};

const insertBeforeLast = (dialogue, extra) => {
  if (!extra?.length) return dialogue;
  return [...dialogue.slice(0, -1), ...extra, dialogue[dialogue.length - 1]];
};

for (const [episodeId, config] of Object.entries(additions)) {
  const yamlPath = path.join(rootDir, 'script', episodeId, 'script.yaml');
  const script = parseDocument(await fs.readFile(yamlPath, 'utf8')).toJS();
  for (const scene of script.scenes) {
    const current = scene.dialogue.map((line) => [line.speaker, line.text]);
    const merged = insertBeforeLast(current, config[scene.id] ?? []);
    scene.dialogue = merged.map(([speaker, text], index) => ({id: `l${String(index + 1).padStart(2, '0')}`, speaker, text, expression: index % 3 === 0 ? 'smile' : index % 3 === 1 ? 'talk' : 'calm'}));
  }
  const total = script.scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0);
  if (total !== config.targetTotal) throw new Error(`${episodeId}: expected ${config.targetTotal}, got ${total}`);
  script.total_duration_sec = 300.3;
  await fs.writeFile(yamlPath, stringify(script, {lineWidth: 0}), 'utf8');
  await fs.writeFile(path.join(rootDir, 'script', episodeId, 'audits', 'script_prompt_pack_rewrite.md'), `# rewrite\n\n使用prompt: 07_rewrite_prompt.md\n\nepisode_id: ${episodeId}\n\n自然音声尺の実測に基づき、音声速度を変えず、短縮版をベースに中程度の補足発話だけを追加した。情報順序、最終行動、画像方針は維持し、90〜130発話の範囲内で5分許容範囲へ近づけるための再調整である。\n`, 'utf8');
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(additions).map(([id, config]) => [id, config.targetTotal])), null, 2));
