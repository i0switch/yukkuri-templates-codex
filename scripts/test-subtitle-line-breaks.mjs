import {loadDefaultJapaneseParser} from 'budoux';

const parser = loadDefaultJapaneseParser();

const samples = [
  {
    text: 'めたん！解約したはずのサブスクから、またお金が引かれてるのだ！',
    mustKeep: ['サブスクから'],
  },
  {
    text: 'アカウントを確認してから請求元を探す',
    mustKeep: ['確認してから', '請求元を'],
  },
  {
    text: '写真を消す前にバックアップ先を確認して',
    mustKeep: ['写真を', 'バックアップ先を', '確認して'],
  },
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

for (const sample of samples) {
  const phrases = parser.parse(sample.text);
  const joined = phrases.join('|');
  for (const expected of sample.mustKeep) {
    assert(
      phrases.some((phrase) => phrase.includes(expected)),
      `"${expected}" was not kept inside a BudouX phrase: ${joined}`,
    );
  }
}

console.log(JSON.stringify({ok: true, tested: samples.length}, null, 2));
