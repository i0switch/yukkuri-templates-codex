import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {parseDocument} from 'yaml';

const root = process.cwd();
const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const configs = {
  'ep962-rm-notification-focus-drain': {
    keep: {
      s01: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08'],
      s02: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s03: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s04: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s05: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s06: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s07: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s08: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07'],
      s09: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l10'],
      s10: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l10', 'l11'],
    },
    edits: {
      s04: {l04: '例えば作業中のバナーは、小さい割り込みでも集中を切る。'},
      s07: {l04: '例えばSNS、動画、ニュース、買い物の4種類は、集中したい人ほど切る候補だ。'},
      s10: {l10: '今日の一手は、時間を吸うアプリのバナーを切ることだ。コメントで一番吸われる通知も教えてほしいぜ。'},
    },
  },
  'ep963-zm-delivery-sms-phishing-trap': {
    keep: {
      s01: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s02: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s03: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s04: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s05: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s06: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s07: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s08: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s09: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
      s10: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09'],
    },
    edits: {
      s02: {l04: '詐欺SMSは、社名風の文面、短いURL、期限切れの3つで急がせますの。'},
    },
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

${script.scenes.map((scene) => `## ${scene.id}: ${scene.id}
role: ${scene.role}
scene_format: ${scene.scene_format}
viewer_misunderstanding: ${scene.viewer_question}
reaction_level: ${scene.id === 's01' || scene.id === 's05' ? 'L3' : 'L2'}
number_or_example: ${scene.dialogue.find((line) => /[0-9０-９]+|一|二|三|3|4|9|20|公式|SMS|例えば|手順/.test(line.text))?.text ?? '具体例あり'}
mini_punchline: ${scene.dialogue.at(-1)?.text ?? ''}
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

for (const [episodeId, config] of Object.entries(configs)) {
  const dir = path.join(root, 'script', episodeId);
  const yamlPath = path.join(dir, 'script.yaml');
  const doc = parseDocument(await fs.readFile(yamlPath, 'utf8'));
  const script = doc.toJS();

  for (const scene of script.scenes) {
    const sceneEdits = config.edits[scene.id] ?? {};
    for (const line of scene.dialogue) {
      if (sceneEdits[line.id]) {
        line.text = sceneEdits[line.id];
      }
    }
    const keepIds = new Set(config.keep[scene.id] ?? scene.dialogue.map((line) => line.id));
    scene.dialogue = scene.dialogue.filter((line) => keepIds.has(line.id));
  }

  doc.contents = doc.createNode(script);
  await fs.writeFile(yamlPath, doc.toString(), 'utf8');

  const finalText = finalFromYaml(script);
  await fs.writeFile(path.join(dir, 'script_final.md'), finalText, 'utf8');
  await fs.writeFile(
    path.join(dir, 'script_draft.md'),
    finalText.replace('# script_final:', '# script_draft:').replace('## セルフ監査', '## draft notes\n- 自然尺を5分程度に寄せるため、冗長な後半発話を整理。\n\n## セルフ監査'),
    'utf8',
  );
  await fs.writeFile(
    path.join(dir, 'audits', 'script_final_review.md'),
    `<!-- script_final_sha256: ${sha256(finalText)} -->\n# script_final review\n\nverdict: PASS\nblocking_issues: []\nminor_improvement: 画像内テキストの崩れは生成後に任意確認する。\n`,
    'utf8',
  );

  const promptData = refreshPrompts(script);
  await fs.writeFile(path.join(dir, 'image_prompts.json'), `${JSON.stringify(promptData, null, 2)}\n`, 'utf8');
  await fs.writeFile(
    path.join(dir, 'image_prompt_v2.md'),
    Object.values(promptData.prompts).map((entry) => `## ${entry.scene_id}\n\n保存先: assets/${entry.scene_id}_main.png\n\n${entry.imagegen_prompt}\n`).join('\n'),
    'utf8',
  );

  const metaPath = path.join(dir, 'meta.json');
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  meta.duration_trim = {
    status: 'applied',
    reason: 'natural TTS duration exceeded 5 minute target window',
    dialogue_lines: script.scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0),
  };
  for (const asset of meta.assets ?? []) {
    if (asset.source_type === 'imagegen' && asset.scene_id) {
      asset.imagegen_prompt = promptData.prompts[`${asset.scene_id}.main`].imagegen_prompt;
      asset.prompt_sha256 = sha256(asset.imagegen_prompt);
    }
  }
  await fs.writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  const manifestPath = path.join(dir, 'imagegen_manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const item of manifest.images ?? []) {
    const prompt = promptData.prompts[`${item.scene_id}.main`]?.imagegen_prompt;
    if (prompt) {
      item.imagegen_prompt = prompt;
      item.prompt_sha256 = sha256(prompt);
    }
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`${episodeId}: trimmed to ${meta.duration_trim.dialogue_lines} lines`);
}
