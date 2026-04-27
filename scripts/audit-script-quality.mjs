import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';
import {estimateEpisodeDuration} from './lib/duration-estimator.mjs';

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

const STRONG_HOOK_RE = /損|危険|ヤバ|やば|詰む|失敗|後悔|バレ|消え|請求|円|%|％|倍|秒|分|時間|日|年|実は|逆|犯人|知らない|放置/;
const WEAK_OPENING_RE = /^(今回は|こんにちは|どうも|今日は.+について|.+あるある(?:だぜ|ね|です)?[。！？!?]*$|.+って知ってる[？?]?$)/;
const RELATABLE_RE = /あるある|つい|やりがち|押し込|放置|忘れ|あとで|いつか|なんとなく|面倒|棚|夜|寝る|スマホ|家|毎月|気づいたら/;
const REASON_TO_WATCH_RE = /この動画|今日は|先に|今から|見れば|わかる|確認|直せ|防げ|避け|やること|手順/;
const SPECIFIC_RE = /[0-9０-９]+|円|秒|分|時間|日|年|回|個|つ|Mbps|GB|%|％|比較|例えば|実例|失敗|あるある|手順|ケース/;
const VIEWER_MISUNDERSTANDING_RE = /でしょ|じゃない|最強|全部|どうせ|たぶん|放置|あとで|面倒|怖|疑|犯人|変えれば|消せば|無料|いつか|雑|つまり/;
const SHORT_REBUTTAL_MAX = 22;
const L3_REACTION_RE = /マジ|ヤバ|やば|詰む|えぐ|怖|こわ|終わ|完全|まずい|待って|それは/;
const COMMENT_PROMPT_RE = /コメント|教えて|どこ|何年|何回|いくら|速度|場所|使ってる|あるある/;
const CONCRETE_ACTION_RE = /今日|今|1回|一回|確認|測る|変える|開く|見る|保存|記録|消す|ログイン|チェック|予定|コメント/;

const AWKWARD_RM_ENDINGS = [
  '見るだぜ',
  'するだぜ',
  'やるだぜ',
  '開くるだぜ',
  '確認するだぜ',
  '使うだぜ',
  '行くだぜ',
  'あるあるだぜ',
  '危険だぜ',
  '必要だぜ',
  '大事だぜ',
  '重要だぜ',
  '安全だぜ',
  '便利だぜ',
  '無料だぜ',
  '古さも見るだぜ',
  '作ろうだぜ',
];

const RM_DAZE_ENDING_RE = /だぜ[。！？!?」』)]*$/;

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

const midpointScenes = (script) =>
  (script.scenes ?? []).filter((_, index, scenes) => {
    const ratio = (index + 0.5) / Math.max(1, scenes.length);
    return ratio >= 0.4 && ratio <= 0.6;
  });

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

const sceneText = (scene) => (scene.dialogue ?? []).map((line) => line.text).filter(Boolean).join(' ');

const auditOpeningHook = ({script, errors}) => {
  const firstScene = script.scenes?.[0];
  const firstLines = (firstScene?.dialogue ?? []).slice(0, 3).map((line) => String(line.text ?? ''));
  if (firstLines.length < 3) {
    pushIssue(errors, 'error', 'opening-too-short', 's01 must have at least 3 opening dialogue lines for 0-15s hook structure');
    return;
  }
  if (WEAK_OPENING_RE.test(firstLines[0].trim())) {
    pushIssue(errors, 'error', 'opening-first-hook-generic', 's01 first line must not be a generic greeting, topic intro, bareあるある, or standalone knowledge question', {
      first_line: firstLines[0],
    });
  }
  if (!STRONG_HOOK_RE.test(firstLines[0])) {
    pushIssue(errors, 'error', 'opening-first-hook-weak', 's01 first line must contain loss, number, surprise, misconception correction, or strong question', {
      first_line: firstLines[0],
    });
  }
  if (!RELATABLE_RE.test(firstLines[1])) {
    pushIssue(errors, 'error', 'opening-relatable-second-beat-missing', 's01 second beat must connect the hook to a viewer-lifeあるある', {
      second_line: firstLines[1],
    });
  }
  if (!REASON_TO_WATCH_RE.test(firstLines.slice(1, 3).join(' '))) {
    pushIssue(errors, 'error', 'opening-watch-reason-missing', 's01 first 15 seconds must state why viewers should keep watching');
  }
};

const auditSceneDialogueLoops = ({script, errors}) => {
  const scenes = script.scenes ?? [];
  for (const [index, scene] of scenes.entries()) {
    if (index === 0 || scene.role === 'cta' || scene.role === 'outro') {
      continue;
    }
    const dialogue = scene.dialogue ?? [];
    const leftQuestionLines = dialogue.filter((line) => line.speaker === 'left' && /[？?]\s*$/.test(String(line.text ?? '').trim()));
    if (leftQuestionLines.length > 1) {
      pushIssue(errors, 'error', 'viewer-question-overuse', `${scene.id}: viewer representative may ask at most one question in a scene; use boke, misconception, reaction, lived experience, or action declaration instead`, {
        question_count: leftQuestionLines.length,
        lines: leftQuestionLines.map((line) => ({id: line.id, text: line.text})),
      });
    }
    const firstLine = dialogue[0];
    if (!firstLine || firstLine.speaker !== 'left' || !VIEWER_MISUNDERSTANDING_RE.test(String(firstLine.text ?? ''))) {
      pushIssue(errors, 'error', 'viewer-first-line-not-boke', `${scene.id}: first body-scene line must be viewer misconception, excuse, fear, doubt, or rough interpretation`, {
        first_line: firstLine?.text ?? null,
      });
    }

    const firstRight = dialogue.find((line) => line.speaker === 'right');
    if (!firstRight || String(firstRight.text ?? '').length > SHORT_REBUTTAL_MAX) {
      pushIssue(errors, 'error', 'explainer-short-rebuttal-missing', `${scene.id}: explainer must give a short rebuttal before explanation`, {
        first_right: firstRight?.text ?? null,
      });
    }

    const text = sceneText(scene);
    if (!SPECIFIC_RE.test(text)) {
      pushIssue(errors, 'error', 'scene-specific-example-missing', `${scene.id}: each body scene requires a number, concrete example, failure case,あるある, or comparison`);
    }

    const leftAfterRight = dialogue.findIndex((line, lineIndex) => line.speaker === 'left' && lineIndex > dialogue.findIndex((candidate) => candidate.speaker === 'right'));
    if (leftAfterRight === -1 || !/(？|\?|マジ|ヤバ|やば|つまり|ってこと|え、|待って|それ)/.test(String(dialogue[leftAfterRight]?.text ?? ''))) {
      pushIssue(errors, 'error', 'viewer-reaction-after-explanation-missing', `${scene.id}: viewer must react, doubt, rephrase, or joke after the explanation`);
    }
  }
};

const auditRmEndingBalance = ({script, lines, errors, warnings}) => {
  if (script.meta?.pair !== 'RM') {
    return;
  }

  const rightLines = lines.filter((line) => line.speaker === 'right');
  const dazeLines = rightLines.filter((line) => RM_DAZE_ENDING_RE.test(String(line.text ?? '').trim()));
  const ratio = dazeLines.length / Math.max(1, rightLines.length);
  if (rightLines.length > 0 && ratio > 0.6) {
    pushIssue(errors, 'error', 'rm-daze-ending-ratio-high', 'RM right-speaker 「だぜ」末尾が60%を超えています。自然な説明語尾と短い断言を混ぜてください', {
      ratio: Number(ratio.toFixed(2)),
      daze_lines: dazeLines.length,
      right_lines: rightLines.length,
    });
  } else if (rightLines.length > 0 && ratio < 0.3) {
    pushIssue(warnings, 'warning', 'rm-daze-ending-ratio-low', 'RM right-speaker 「だぜ」末尾は30〜60%目安です', {
      ratio: Number(ratio.toFixed(2)),
      daze_lines: dazeLines.length,
      right_lines: rightLines.length,
    });
  }

  for (const scene of script.scenes ?? []) {
    let previousDaze = null;
    for (const line of scene.dialogue ?? []) {
      if (line.speaker !== 'right') {
        previousDaze = null;
        continue;
      }
      const currentDaze = RM_DAZE_ENDING_RE.test(String(line.text ?? '').trim());
      if (currentDaze && previousDaze) {
        pushIssue(errors, 'error', 'rm-daze-ending-consecutive', `${scene.id}: 「だぜ」末尾が2セリフ連続しています`, {
          lines: [
            {id: previousDaze.id, text: previousDaze.text},
            {id: line.id, text: line.text},
          ],
        });
        break;
      }
      previousDaze = currentDaze ? line : null;
    }
  }
};

const auditRehookAndEnding = ({script, errors}) => {
  const midText = midpointScenes(script).map(sceneText).join(' ');
  const rehookHits = [
    /実は|犯人|先に疑う|逆|勘違い/.test(midText),
    /[0-9０-９]+|円|秒|分|時間|%|％|倍/.test(midText),
    /失敗|放置|詰む|消え|請求/.test(midText),
    L3_REACTION_RE.test(midText),
  ].filter(Boolean).length;
  if (rehookHits < 2) {
    pushIssue(errors, 'error', 'midpoint-rehook-too-thin', 'midpoint rehook must include at least two of misconception flip, strong number, failure case, L3 reaction, or short assertion', {
      matched_signals: rehookHits,
    });
  }

  const l3Count = (script.scenes ?? [])
    .flatMap((scene) => scene.dialogue ?? [])
    .filter((line) => line.speaker === 'left' && L3_REACTION_RE.test(String(line.text ?? ''))).length;
  if (l3Count < 2) {
    pushIssue(errors, 'error', 'l3-reactions-missing', 'viewer representative needs at least two L3+ reactions across the episode', {l3_count: l3Count});
  }

  const endingText = (script.scenes ?? []).slice(-2).map(sceneText).join(' ');
  if (!CONCRETE_ACTION_RE.test(endingText)) {
    pushIssue(errors, 'error', 'final-concrete-action-missing', 'last section must end with one concrete action viewers can do today');
  }
  if (!COMMENT_PROMPT_RE.test(endingText)) {
    pushIssue(errors, 'error', 'comment-prompt-missing', 'last 30 seconds must include an easyあるある-style comment prompt');
  }
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
  const durationEstimate = estimateEpisodeDuration(script);

  auditOpeningHook({script, errors});
  auditSceneDialogueLoops({script, errors});
  auditRehookAndEnding({script, errors});
  auditRmEndingBalance({script, lines, errors, warnings});

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
      pushIssue(warnings, 'warning', 'five-minute-dialogue-count', '5分前後の発話数90〜130は旧目安です。最終判定はTTSエンジン別の推定自然音声尺で行います', {
        dialogue_lines: lines.length,
        legacy_guideline: '90-130',
      });
    }
    if (!durationEstimate.ok) {
      pushIssue(errors, 'error', 'estimated-natural-speech-duration', 'TTSエンジン別の推定自然音声尺がtarget_duration_secの許容範囲外です', durationEstimate);
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
    duration_estimate: durationEstimate,
    errors,
    warnings,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
