import fs from 'node:fs/promises';
import path from 'node:path';
import {parse as parseYaml} from 'yaml';

const rootDir = process.cwd();
const scriptDir = path.join(rootDir, 'script');

const args = process.argv.slice(2);
const explicitEpisodes = args.filter((arg) => !arg.startsWith('--'));
const strictMode = args.includes('--strict') || explicitEpisodes.length > 0;

const COUNT_CHARS = (text) => Array.from(text ?? '').length;

const RM_AWKWARD_ENDINGS = [
  '見るだぜ',
  'するだぜ',
  'やるだぜ',
  '開くるだぜ',
  '確認するだぜ',
  '使うだぜ',
  '行くだぜ',
  '言うだぜ',
  '聞くだぜ',
  '出すだぜ',
  '読むだぜ',
  '書くだぜ',
];

// 最終行動はカテゴリ別に判定し、命令/実行形との近接ヒットを2カテゴリ以上要求する。
// false negative を抑えるため execute カテゴリから「今日／一度／一回」のような単独で締め文に紛れる語は除外。
const FINAL_ACTION_CATEGORIES = {
  confirm: ['確認', '見直', '点検', 'チェック', '振り返', '確かめ', 'たしかめ', '検証', '見比べ'],
  choose: ['選ぶ', '選択', '決め', '判断', '選び', '絞り込', '選んで'],
  save: ['保存', '記録', 'メモ', '残す', 'スクショ', 'バックアップ', '逃が', '隔離', 'テンプレ化', '書く', '書き出', '書き残'],
  schedule: ['予定', 'カレンダー', 'スケジュール', '日付を入れ', '日時を', 'アラーム', 'リマインダ', '登録'],
  organize: ['整理', '消す', '削除', '消去', 'まとめ', '片付', '断捨離'],
  execute: ['設定', '変更', '切り替え', '入れ替え', 'オン／オフ', 'アップデート', '止め', '止まる', '寝かす', '寝かせ', '渡す', '実行'],
};

// 命令／実行を示す末尾形・近接動詞・行動名詞。
// 視聴後すぐ実行できる行動（命令形・意志形・基本形での自他動詞）を緩めに広く拾う。
const ACTION_VERB_PATTERNS = [
  /(?:て|で|り|れ|ろ|よ|な)$/,                  // 命令／てform 末尾
  /(?:しよう|しましょう|してみよう|やろう|やってみよう|始めよう|してね)/,
  /(?:入れて|入れる|入れよう|入れたい)/,
  /(?:決めて|決める|決めよう|決めたい|絞る|絞って)/,
  /(?:保存して|保存する|保存しよう|残して|残す|残そう|書き出す|書き出して|書く)/,
  /(?:消して|消す|消そう|止めて|止める|止めよう|やめて|やめる)/,
  /(?:確認して|確認する|確認しよう|チェックして|チェックする)/,
  /(?:選んで|選ぶ|選ぼう|決めて)/,
  /(?:やる|やって|やろう)/,
  /(?:寝かす|寝かせる|渡す|渡して|検証する|検証して|登録する|登録して)/,
  /(?:整理する|整理して|まとめる|まとめて|片付ける|片付けて)/,
];

// 行動を強く示す名詞（動詞無くても行動寄り）。命令/実行形が周囲にあれば併用ヒットさせる。
const ACTION_NOUN_RE = /(記録|スクショ|チェック|テンプレ|リマインダ|アラーム)/;

const MIDPOINT_HOOK_KEYWORDS = ['ここで', 'ところで', '実は', 'もう一つ', '裏側', '逆に', 'さらに', '裏では', '本当は', '別角度', '視点を変え'];

const formatDurationBucket = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return null;
  if (seconds <= 60) return 'short';
  if (seconds <= 100) return 'short-90';
  if (seconds <= 220) return '3min';
  if (seconds <= 360) return '5min';
  if (seconds <= 540) return '7min';
  return '10min+';
};

const bucketLimits = {
  '3min': {minScenes: 8, minLines: 80, maxLines: 95, minLinesPerScene: 8},
  '5min': {minScenes: 10, minLines: 90, maxLines: 130, minLinesPerScene: 8},
  '7min': {minScenes: 12, minLines: 110, maxLines: 160, minLinesPerScene: 8},
  '10min+': {minScenes: 14, minLines: 130, maxLines: 220, minLinesPerScene: 8},
};

const tryReadFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const loadYamlIfExists = async (filePath) => {
  const text = await tryReadFile(filePath);
  if (text === null) return null;
  return parseYaml(text);
};

const checkScriptMd = (text) => {
  const issues = [];
  if (!text) {
    issues.push({level: 'fatal', code: 'missing-script-md', message: 'script.md が無い。prompt pack の draft / audit を経由していない疑い。'});
    return issues;
  }
  const need = [
    {label: 'scene_format', re: /scene_format/i},
    {label: 'hook_type', re: /hook_type/i},
    {label: 'viewer_misunderstanding', re: /viewer_misunderstanding|視聴者[誤]?解|誤解/i},
    {label: 'boke_or_reaction', re: /boke_or_reaction|ボケ|リアクション/i},
    {label: 'reaction_level', re: /reaction_level|L[1-5]|リアクション強度/i},
    {label: 'mini_punchline', re: /mini_punchline|小オチ|小ネタ|punchline/i},
    {label: 'audit_or_self_check', re: /セルフ監査|自己監査|台本監査|ジャンル適合/i},
    {label: 'number_or_example', re: /\d|具体例|あるある/i},
  ];

  for (const {label, re} of need) {
    if (!re.test(text)) {
      issues.push({level: 'warn', code: `script-md-missing:${label}`, message: `script.md に ${label} の記載が見つからない。`});
    }
  }
  return issues;
};

const collectDialogue = (script) => {
  if (!script || !Array.isArray(script.scenes)) return [];
  const out = [];
  for (const scene of script.scenes) {
    if (!Array.isArray(scene?.dialogue)) continue;
    for (const line of scene.dialogue) {
      out.push({sceneId: scene.id ?? '?', speaker: line.speaker, text: String(line.text ?? '')});
    }
  }
  return out;
};

const sceneAverages = (script) => {
  if (!script || !Array.isArray(script.scenes)) return {avg: 0, perScene: []};
  const counts = script.scenes.map((scene) => Array.isArray(scene?.dialogue) ? scene.dialogue.length : 0);
  if (counts.length === 0) return {avg: 0, perScene: counts};
  const avg = counts.reduce((sum, n) => sum + n, 0) / counts.length;
  return {avg, perScene: counts};
};

const checkLayoutTemplate = (script) => {
  const issues = [];
  const layout = script?.meta?.layout_template;
  if (!layout) {
    issues.push({level: 'fatal', code: 'meta-layout-missing', message: 'meta.layout_template が無い。'});
  } else if (!/^Scene(0[1-9]|1[0-9]|2[0-1])$/.test(layout)) {
    issues.push({level: 'fatal', code: 'meta-layout-format', message: `meta.layout_template が Scene01〜Scene21 形式ではない: ${layout}`});
  }
  if (Array.isArray(script?.scenes)) {
    for (const scene of script.scenes) {
      if (scene?.scene_template) {
        issues.push({level: 'fatal', code: 'scene-template-leak', message: `scenes[].scene_template が残っている: ${scene.id ?? '?'}`});
      }
    }
  }
  return issues;
};

const checkLineLengths = (lines) => {
  const issues = [];
  for (const line of lines) {
    const len = COUNT_CHARS(line.text);
    if (len > 25) {
      issues.push({level: 'fatal', code: 'line-too-long', message: `${line.sceneId} の ${line.speaker ?? '?'} セリフが ${len} 文字 (>25): ${line.text}`});
    }
  }
  return issues;
};

const checkLineDuplication = (lines) => {
  const issues = [];
  const seen = new Map();
  for (const line of lines) {
    const key = line.text.trim();
    if (!key) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [text, count] of seen) {
    if (count >= 3) {
      issues.push({level: 'warn', code: 'line-repeated', message: `同じセリフが ${count} 回登場: 「${text}」`});
    }
  }
  return issues;
};

const checkDialogueDensity = (script) => {
  const issues = [];
  const target = script?.meta?.target_duration_sec;
  const bucket = formatDurationBucket(target);
  if (!bucket) {
    return issues;
  }
  const limits = bucketLimits[bucket];
  if (!limits) {
    return issues;
  }
  const lineTotal = collectDialogue(script).length;
  const sceneTotal = Array.isArray(script.scenes) ? script.scenes.length : 0;
  const {avg, perScene} = sceneAverages(script);

  if (sceneTotal < limits.minScenes) {
    issues.push({level: 'fatal', code: 'scene-count-low', message: `${bucket} 想定でシーン数 ${sceneTotal} < ${limits.minScenes}`});
  }
  if (lineTotal < limits.minLines) {
    issues.push({level: 'fatal', code: 'line-count-low', message: `${bucket} 想定でセリフ総数 ${lineTotal} < ${limits.minLines}`});
  }
  if (limits.maxLines && lineTotal > limits.maxLines) {
    issues.push({level: 'warn', code: 'line-count-high', message: `${bucket} 想定でセリフ総数 ${lineTotal} > ${limits.maxLines} (情報過多の可能性)`});
  }
  if (avg < limits.minLinesPerScene) {
    issues.push({level: 'fatal', code: 'avg-lines-low', message: `1シーン平均 ${avg.toFixed(1)} < ${limits.minLinesPerScene}`});
  }
  const fixedSix = perScene.filter((n) => n === 6).length;
  if (perScene.length >= 5 && fixedSix / perScene.length >= 0.7) {
    issues.push({level: 'warn', code: 'six-line-fixed', message: `多くのシーンが6セリフ固定 (${fixedSix}/${perScene.length})、単調の疑い`});
  }
  return issues;
};

const checkRmEndings = (lines, pair) => {
  if (pair !== 'RM') return [];
  const issues = [];
  for (const line of lines) {
    for (const bad of RM_AWKWARD_ENDINGS) {
      if (line.text.includes(bad)) {
        issues.push({level: 'fatal', code: 'rm-awkward-ending', message: `不自然な RM 語尾: ${line.sceneId} ${line.speaker ?? '?'} 「${bad}」 → 「${bad.replace('だぜ', 'んだぜ')}」候補`});
      }
    }
  }
  if (lines.length > 0) {
    const right = lines.filter((line) => line.speaker === 'right');
    if (right.length >= 5) {
      const dazeCount = right.filter((line) => /(だぜ|なんだ|なのだ)([。?！!？\.\?]?)$/.test(line.text.trim())).length;
      const ratio = dazeCount / right.length;
      if (ratio < 0.3) {
        issues.push({level: 'warn', code: 'rm-daze-low', message: `RM 魔理沙の「だぜ／なんだ」比率 ${(ratio * 100).toFixed(0)}% < 30% (キャラ立ち弱)`});
      } else if (ratio > 0.6) {
        issues.push({level: 'warn', code: 'rm-daze-high', message: `RM 魔理沙の「だぜ／なんだ」比率 ${(ratio * 100).toFixed(0)}% > 60% (過剰)`});
      }
    }
  }
  return issues;
};

const checkZmEndings = (lines, pair) => {
  if (pair !== 'ZM') return [];
  const issues = [];
  const left = lines.filter((line) => line.speaker === 'left');
  if (left.length >= 5) {
    const nodaCount = left.filter((line) => /(なのだ|のだ)([。?！!？]?)$/.test(line.text.trim())).length;
    const ratio = nodaCount / left.length;
    if (ratio < 0.2) {
      issues.push({level: 'warn', code: 'zm-noda-low', message: `ZM ずんだもんの「のだ/なのだ」比率 ${(ratio * 100).toFixed(0)}% < 20% (キャラ性不足)`});
    } else if (ratio > 0.5) {
      issues.push({level: 'warn', code: 'zm-noda-high', message: `ZM ずんだもんの「のだ/なのだ」比率 ${(ratio * 100).toFixed(0)}% > 50% (過剰)`});
    }
  }
  // 3連続 のだ チェック
  const leftSequential = lines.filter((line) => line.speaker === 'left').map((line) => /(なのだ|のだ)([。?！!？]?)$/.test(line.text.trim()));
  let streak = 0;
  for (const isNoda of leftSequential) {
    if (isNoda) {
      streak += 1;
      if (streak >= 3) {
        issues.push({level: 'warn', code: 'zm-noda-streak', message: '「のだ/なのだ」が3連続。同じ語尾の連発を分散させる。'});
        break;
      }
    } else {
      streak = 0;
    }
  }
  return issues;
};

const checkAssetPaths = (script) => {
  const issues = [];
  if (!Array.isArray(script?.scenes)) return issues;
  for (const scene of script.scenes) {
    for (const slot of ['main', 'sub']) {
      const node = scene?.[slot];
      if (!node || node.kind !== 'image') continue;
      const asset = node.asset;
      if (typeof asset !== 'string' || !asset.startsWith('assets/')) {
        issues.push({level: 'fatal', code: 'asset-path-bad', message: `${scene.id ?? '?'}.${slot}.asset が assets/... 相対パスではない: ${asset}`});
      }
    }
  }
  return issues;
};

const checkFinalAction = (script) => {
  const issues = [];
  if (!Array.isArray(script?.scenes) || script.scenes.length === 0) return issues;
  // 最終シーン全体のセリフを評価対象に取る。「行動まとめシーン」全体を見ないと、最後の挨拶／締め文に依存して
  // 行動ありの台本でも0カテゴリになりやすい。passive判定は終盤2シーンを参照する。
  const lastScene = script.scenes[script.scenes.length - 1];
  const lastSceneLines = Array.isArray(lastScene?.dialogue) ? lastScene.dialogue.map((line) => String(line?.text ?? '')) : [];
  const tail2 = script.scenes.slice(-2);
  const tail2Texts = tail2.flatMap((scene) => Array.isArray(scene?.dialogue) ? scene.dialogue.map((line) => String(line?.text ?? '')) : []);
  const lastNLines = lastSceneLines;
  const joined = tail2Texts.join(' ');

  const seeOnly = /見るだけ|考えるだけ|後でやる/.test(joined);
  if (seeOnly) {
    issues.push({level: 'fatal', code: 'final-action-passive', message: '最終行動が「見るだけ／考えるだけ／後でやる」で終わっている。確認＋選択／保存／予定化など2アクション以上に。'});
  }

  // 行動セリフ（命令/実行形・行動名詞のいずれかを含む）を抽出。
  const actionLines = lastNLines.filter((text) => {
    if (!text) return false;
    if (ACTION_VERB_PATTERNS.some((re) => re.test(text))) return true;
    if (ACTION_NOUN_RE.test(text)) return true;
    return false;
  });

  // 行動セリフ自体が無い時点で「見るだけ／考えるだけ」相当。
  if (actionLines.length === 0) {
    issues.push({level: 'fatal', code: 'final-action-no-verb', message: '終盤5セリフに命令/実行形（〜して・〜入れて・〜決める 等）も行動名詞も無い。具体行動が示されていない。'});
  }

  // カテゴリ判定は「行動セリフ群のテキスト全体」で行う。説明文中の語彙ヒットを排除しつつ、
  // 「2個目、決定を1日寝かせる」のように動詞なし・名詞中心の行動文も近接ヒットさせる。
  const actionJoined = actionLines.join(' ');
  const hitCategories = [];
  const hitDetails = {};
  for (const [category, kws] of Object.entries(FINAL_ACTION_CATEGORIES)) {
    const matched = kws.filter((kw) => actionJoined.includes(kw));
    if (matched.length > 0) {
      hitCategories.push(category);
      hitDetails[category] = matched;
    }
  }
  const effectiveCount = hitCategories.length;

  if (effectiveCount < 2) {
    issues.push({
      level: 'fatal',
      code: 'final-action-thin',
      message: `最終行動カテゴリが ${effectiveCount} 個 (要 2+, action lines: ${actionLines.length})。検出: ${JSON.stringify(hitDetails)}`,
    });
  }
  return issues;
};

const checkMidpointHook = (script) => {
  const issues = [];
  if (!Array.isArray(script?.scenes)) return issues;
  const total = script.scenes.length;
  if (total < 5) return issues;
  const start = Math.floor(total * 0.4);
  const end = Math.ceil(total * 0.6);
  const mid = script.scenes.slice(start, end + 1);
  const text = mid.flatMap((scene) => Array.isArray(scene?.dialogue) ? scene.dialogue.map((line) => String(line?.text ?? '')) : []).join(' ');
  if (!text) return issues;
  const hits = MIDPOINT_HOOK_KEYWORDS.filter((kw) => text.includes(kw));
  if (hits.length === 0) {
    issues.push({level: 'warn', code: 'midpoint-hook-missing', message: '中盤40〜60%に再フックワードが見つからない (検出キーワード: ここで/実は/逆に等)'});
  }
  return issues;
};

const auditEpisode = async (episodeId) => {
  const dir = path.join(scriptDir, episodeId);
  const yamlPath = path.join(dir, 'script.yaml');
  const mdPath = path.join(dir, 'script.md');

  let yamlText;
  try {
    yamlText = await fs.readFile(yamlPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        episodeId,
        ok: false,
        fatal: [{level: 'fatal', code: 'missing-script-yaml', message: `script.yaml が無い: ${yamlPath}`}],
        warn: [],
      };
    }
    throw error;
  }

  let script;
  try {
    script = parseYaml(yamlText);
  } catch (error) {
    return {
      episodeId,
      ok: false,
      fatal: [{level: 'fatal', code: 'yaml-parse-error', message: `script.yaml の YAML パースに失敗: ${error.message}`}],
      warn: [],
    };
  }

  const lines = collectDialogue(script);
  const pair = script?.meta?.pair ?? null;

  const allIssues = [
    ...(await (async () => {
      const text = await tryReadFile(mdPath);
      return checkScriptMd(text);
    })()),
    ...checkLayoutTemplate(script),
    ...checkLineLengths(lines),
    ...checkLineDuplication(lines),
    ...checkDialogueDensity(script),
    ...checkRmEndings(lines, pair),
    ...checkZmEndings(lines, pair),
    ...checkAssetPaths(script),
    ...checkFinalAction(script),
    ...checkMidpointHook(script),
  ];

  const fatal = allIssues.filter((issue) => issue.level === 'fatal');
  const warn = allIssues.filter((issue) => issue.level === 'warn');
  return {
    episodeId,
    ok: fatal.length === 0,
    metrics: {
      pair,
      target_duration_sec: script?.meta?.target_duration_sec ?? null,
      sceneCount: Array.isArray(script?.scenes) ? script.scenes.length : 0,
      lineCount: lines.length,
      avgLinesPerScene: Number(sceneAverages(script).avg.toFixed(2)),
      durationBucket: formatDurationBucket(script?.meta?.target_duration_sec),
    },
    fatal,
    warn,
  };
};

const enumerateEpisodes = async () => {
  if (explicitEpisodes.length > 0) return explicitEpisodes;
  let entries;
  try {
    entries = await fs.readdir(scriptDir, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries.filter((entry) => entry.isDirectory() && entry.name.startsWith('ep')).map((entry) => entry.name).sort();
};

const main = async () => {
  const episodes = await enumerateEpisodes();
  const reports = [];
  for (const episodeId of episodes) {
    reports.push(await auditEpisode(episodeId));
  }

  const fail = reports.some((report) => !report.ok);
  const out = {
    ok: !fail,
    mode: strictMode ? 'strict' : 'lenient',
    summary: {
      total: reports.length,
      pass: reports.filter((report) => report.ok).length,
      fail: reports.filter((report) => !report.ok).length,
    },
    reports,
  };

  console.log(JSON.stringify(out, null, 2));
  if (fail && strictMode) {
    console.error(`\nFAIL: ${out.summary.fail}/${out.summary.total} episode(s) で品質 fatal 検出。strict モードのため exit 1。`);
    process.exit(1);
  }
  if (fail) {
    console.warn(`\nWARN: ${out.summary.fail}/${out.summary.total} episode(s) で品質 fatal が検出されたが lenient モードのため exit 0。新規生成は引数 <episode_id> または --strict で必ず確認してください。`);
  }
};

main().catch((error) => {
  console.error('audit-script-quality.mjs failed:', error.stack ?? error.message ?? error);
  process.exit(1);
});
