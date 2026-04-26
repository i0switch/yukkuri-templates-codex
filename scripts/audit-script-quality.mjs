import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';

const rootDir = process.cwd();
const target = process.argv[2];

if (!target) {
  throw new Error('Usage: node scripts/audit-script-quality.mjs <episode_id|path/to/script.yaml>');
}

const REQUIRED_SCRIPT_FINAL_MARKERS = [
  'scene_format',
  'viewer_misunderstanding',
  'reaction_level',
  'mini_punchline',
  'セルフ監査',
];

const AWKWARD_RM_ENDINGS = [
  '見るだぜ',
  'するだぜ',
  'やるだぜ',
  '開くるだぜ',
  '確認するだぜ',
  '使うだぜ',
  '行くだぜ',
];

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const resolveTarget = (value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml')) {
    return {episodeDir: path.dirname(directPath), scriptPath: directPath};
  }
  const episodeDir = path.join(rootDir, 'script', value);
  return {episodeDir, scriptPath: path.join(episodeDir, 'script.yaml')};
};

const readYaml = async (scriptPath) => parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();

const speakerRunIssues = (script) => {
  const issues = [];
  for (const scene of script.scenes ?? []) {
    let prev = null;
    let run = 0;
    for (const line of scene.dialogue ?? []) {
      if (line.speaker === prev) {
        run += 1;
      } else {
        prev = line.speaker;
        run = 1;
      }
      if (line.speaker === 'right' && run >= 3) {
        issues.push({scene: scene.id, speaker: line.speaker, run});
        break;
      }
    }
  }
  return issues;
};

const hasMidpointRehook = (script) =>
  (script.scenes ?? []).some((scene) =>
    [scene.reference_beat, scene.scene_goal, scene.title_text]
      .filter(Boolean)
      .some((value) => /midpoint_rehook|再フック|中盤/.test(String(value))),
  );

const finalActionCount = (script) => {
  const lastScenes = (script.scenes ?? []).slice(-2);
  const text = lastScenes
    .flatMap((scene) => [
      scene.title_text,
      scene.main?.text,
      scene.main?.caption,
      ...(scene.main?.items ?? []),
      ...(scene.sub?.items ?? []),
      ...(scene.dialogue ?? []).map((line) => line.text),
    ])
    .filter(Boolean)
    .join(' ');
  return (text.match(/保存|確認|開か|相談|記録|投稿|見る|消す|ブロック|通報|公式|チェック|試す|作る|送る/g) ?? []).length;
};

const audit = async () => {
  const errors = [];
  const warnings = [];
  await loadScriptPromptPack(rootDir, {log: false});

  const {episodeDir, scriptPath} = resolveTarget(target);
  const script = await readYaml(scriptPath);
  const scriptFinalPath = path.join(episodeDir, 'script_final.md');

  let scriptFinal = '';
  try {
    scriptFinal = await fs.readFile(scriptFinalPath, 'utf8');
  } catch {
    pushIssue(errors, 'error', 'missing-script-final', 'script_final.md がありません。新規生成は prompt pack 経由の script_final.md を必須にします', {
      script_final: path.relative(rootDir, scriptFinalPath),
    });
  }

  if (scriptFinal) {
    const missingMarkers = REQUIRED_SCRIPT_FINAL_MARKERS.filter((marker) => !scriptFinal.includes(marker));
    if (!/number_or_example|具体例/.test(scriptFinal)) {
      missingMarkers.push('number_or_example または 具体例');
    }
    if (missingMarkers.length > 0) {
      pushIssue(errors, 'error', 'script-final-missing-quality-markers', 'script_final.md に prompt pack 品質マーカーが不足しています', {
        missing: missingMarkers,
      });
    }
  }

  const scenes = script.scenes ?? [];
  const lines = scenes.flatMap((scene) => (scene.dialogue ?? []).map((line) => ({...line, scene: scene.id})));
  const targetSec = Number(script.meta?.target_duration_sec ?? script.total_duration_sec ?? 0);
  const averageLines = scenes.length > 0 ? lines.length / scenes.length : 0;

  if (targetSec >= 150 && targetSec <= 240) {
    if (scenes.length < 6 || scenes.length > 8) {
      pushIssue(errors, 'error', 'three-minute-scenes', '3分前後は6〜8シーンが必要です', {scenes: scenes.length});
    }
    if (lines.length < 60 || lines.length > 80) {
      pushIssue(errors, 'error', 'three-minute-dialogue-count', '3分前後は60〜80セリフが目安です', {dialogue_lines: lines.length});
    }
  }

  if (targetSec >= 270 && targetSec <= 390) {
    if (scenes.length < 10) pushIssue(errors, 'error', 'five-minute-scenes', '5分前後は10シーン以上が必要です', {scenes: scenes.length});
    if (lines.length < 90 || lines.length > 130) {
      pushIssue(errors, 'error', 'five-minute-dialogue-count', '5分前後は90〜130セリフが目安です', {dialogue_lines: lines.length});
    }
  }

  if (targetSec >= 150 && averageLines < 8) {
    pushIssue(errors, 'error', 'low-dialogue-density', '1シーン平均8セリフ以上が必要です', {
      average_lines_per_scene: Number(averageLines.toFixed(2)),
    });
  }

  if (targetSec >= 150 && !hasMidpointRehook(script)) {
    pushIssue(errors, 'error', 'midpoint-rehook-missing', '中盤再フックがありません');
  }

  if (targetSec >= 150 && finalActionCount(script) < 2) {
    pushIssue(errors, 'error', 'final-actions-thin', '最終行動が2アクション未満です', {
      action_hits: finalActionCount(script),
    });
  }

  const monologues = speakerRunIssues(script);
  if (monologues.length > 0) {
    pushIssue(errors, 'error', 'explainer-monologue', '解説役の3セリフ以上の独演があります', {
      scenes: monologues,
    });
  }

  const awkwardRmLines = lines
    .filter((line) => AWKWARD_RM_ENDINGS.some((ending) => String(line.text ?? '').includes(ending)))
    .map((line) => ({scene: line.scene, id: line.id, text: line.text}));
  if (awkwardRmLines.length > 0) {
    pushIssue(errors, 'error', 'awkward-rm-ending', 'RMの不自然な語尾があります', {
      lines: awkwardRmLines,
      suggestions: {
        '見るだぜ': '見るんだぜ',
        '確認するだぜ': '確認だぜ / 確認するんだ',
        '使うだぜ': '使うんだぜ',
        '行くだぜ': '行くんだぜ',
      },
    });
  }

  const pair = script.meta?.pair;
  if (pair === 'ZM') {
    const zundaLines = lines.filter((line) => line.speaker === 'left');
    const zundaEndingLines = zundaLines.filter((line) => /なのだ|のだ/.test(String(line.text ?? '')));
    const ratio = zundaEndingLines.length / Math.max(1, zundaLines.length);
    if (ratio === 0) {
      pushIssue(errors, 'error', 'zunda-ending-missing', '「のだ」「なのだ」が0%でキャラ性不足です');
    } else if (ratio < 0.2 || ratio > 0.4) {
      pushIssue(warnings, 'warning', 'zunda-ending-ratio', '「のだ」「なのだ」は20〜40%目安です', {
        ratio: Number(ratio.toFixed(2)),
      });
    }
  }

  const questionAnswerRuns = scenes
    .filter((scene) => {
      const texts = scene.dialogue ?? [];
      let qa = 0;
      for (let index = 0; index < texts.length - 1; index += 2) {
        if (/[？?]/.test(texts[index]?.text ?? '') && texts[index + 1]?.speaker !== texts[index]?.speaker) {
          qa += 1;
        }
      }
      return qa >= 3;
    })
    .map((scene) => scene.id);
  if (questionAnswerRuns.length > 0) {
    pushIssue(warnings, 'warning', 'question-answer-loop', '質問→回答だけが3往復以上続くシーンがあります', {
      scenes: questionAnswerRuns,
    });
  }

  const report = {
    ok: errors.length === 0,
    episode_id: script.meta?.id ?? path.basename(episodeDir),
    checked_at: new Date().toISOString(),
    script_path: path.relative(rootDir, scriptPath),
    errors,
    warnings,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
