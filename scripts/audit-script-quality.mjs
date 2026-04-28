import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-script-quality.mjs <episode_id|path/to/script_final.md>');
}

const resolveScriptFinalPath = (value) => {
  if (value.endsWith('.md') || value.includes('/') || value.includes('\\')) {
    return path.resolve(rootDir, value);
  }
  return path.join(rootDir, 'script', value, 'script_final.md');
};

const scriptFinalPath = resolveScriptFinalPath(target);
const scriptText = await fs.readFile(scriptFinalPath, 'utf8');
const lines = scriptText.split(/\r?\n/);

const pushIssue = (issues, code, message, details = {}) => {
  issues.push({level: 'error', code, message, details});
};

const forbiddenMetaPatterns = [
  {key: 'title', pattern: /^\s*title\s*:/i},
  {key: 'episode_id', pattern: /^\s*episode_id\s*:/i},
  {key: 'target_duration_sec', pattern: /^\s*target_duration_sec\s*:/i},
  {key: 'layout_template', pattern: /^\s*layout_template\s*:/i},
  {key: 'scene_format', pattern: /^\s*scene_format\s*:/i},
  {key: 'viewer_misunderstanding', pattern: /^\s*viewer_misunderstanding\s*:/i},
  {key: 'mini_punchline', pattern: /^\s*mini_punchline\s*:/i},
  {key: 'self_audit', pattern: /^\s*セルフ監査\s*[:：]/},
  {key: 'existing_script_reuse', pattern: /^\s*既存台本流用\s*[:：]/},
  {key: 'layout_template_inline', pattern: /`?layout_template`?\s*[:：=]/i},
  {key: 'episode_id_inline', pattern: /`?episode_id`?\s*[:：=]/i},
];

const issues = [];
const metaLeaks = [];
for (const [index, line] of lines.entries()) {
  for (const meta of forbiddenMetaPatterns) {
    if (meta.pattern.test(line)) {
      metaLeaks.push({line: index + 1, key: meta.key, text: line.trim()});
    }
  }
}

if (metaLeaks.length > 0) {
  pushIssue(
    issues,
    'script-final-meta-leak',
    'script_final.md must not contain planning metadata, audit labels, or episode config fields',
    {matches: metaLeaks},
  );
}

const dialoguePattern = /^\s*([^「」\s#][^「」]{0,24})「([^」]+)」\s*$/;
const dialogue = lines
  .map((line, index) => {
    const match = line.match(dialoguePattern);
    return match ? {line: index + 1, speaker: match[1].trim(), text: match[2].trim()} : null;
  })
  .filter(Boolean);

if (dialogue.length === 0) {
  pushIssue(issues, 'missing-dialogue', 'script_final.md must contain character dialogue lines');
}

const firstDialogue = dialogue[0];
const openingDialogue = dialogue.slice(0, 6);

if (firstDialogue) {
  const text = firstDialogue.text;
  const isLongAbstractSetup =
    text.length >= 30 &&
    /(したら|すると|なら|について|とは|という|って、|って|気分になる|ことになる|ものだ)/.test(text) &&
    !/[！？!?]/.test(text);
  const hasSceneActionCue =
    /見て|聞いて|やば|終わ|詰ん|助け|できた|忘れ|消え|なくした|買った|開いた|作った|書いた|入れた|見つけた|昨日|今日|今週|明日|まだ|もう|青|赤|空いたら|1問|2時間|テスト/.test(text) &&
    /[！？!?]|見て|聞いて|やば|終わ|詰ん|助け|できた|忘れ|消え|なくした|買った|開いた|作った|書いた|入れた|見つけた/.test(text);

  if (isLongAbstractSetup) {
    pushIssue(
      issues,
      'opening-explanation-start',
      'the first dialogue line reads like an explanatory summary instead of a scene action',
      {line: firstDialogue.line, speaker: firstDialogue.speaker, text},
    );
  }

  if (!hasSceneActionCue) {
    pushIssue(
      issues,
      'opening-no-mini-drama',
      'the first dialogue line needs a concrete action, visible situation, or emotional scene cue',
      {line: firstDialogue.line, speaker: firstDialogue.speaker, text},
    );
  }

  if (/あるある/.test(text) && !/(でも|なのに|実は|犯人|損|危険|やば|終わ|詰ん|意外|逆)/.test(text)) {
    pushIssue(
      issues,
      'opening-thin-aruaru',
      'an opening that only states an aruaru without a twist or loss cue is too weak',
      {line: firstDialogue.line, speaker: firstDialogue.speaker, text},
    );
  }
}

const earlyCta = openingDialogue.find((line) => /この動画を見れば|今回は.*(解説|紹介|直す|変える|やる)/.test(line.text));
if (earlyCta) {
  pushIssue(
    issues,
    'opening-early-cta',
    'the opening moves to video-benefit or topic-summary language before the viewer pain lands',
    {line: earlyCta.line, speaker: earlyCta.speaker, text: earlyCta.text},
  );
}

const report = {
  ok: issues.length === 0,
  target,
  script_final_path: path.relative(rootDir, scriptFinalPath),
  checked_at: new Date().toISOString(),
  opening_dialogue: openingDialogue,
  issues,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
