import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';
import {scriptFinalSha256} from './lib/script-final-review-hash.mjs';

const rootDir = process.cwd();
const episodeId = '__fixture_pipeline_hardening';
const episodeDir = path.join(rootDir, 'script', episodeId);

const run = (args, {expectFailure = false} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    return result;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
  return result;
};

const makeDialogue = (sceneIndex) =>
  Array.from({length: 13}, (_, lineIndex) => ({
    id: `l${String(lineIndex + 1).padStart(2, '0')}`,
    speaker: lineIndex % 2 === 0 ? 'left' : 'right',
    text:
      sceneIndex === 1 && lineIndex === 0
        ? 'スマホ写真、消す前に3分で詰むのだ'
        : sceneIndex === 1 && lineIndex === 1
          ? 'それ、あるあるですわ'
          : sceneIndex === 1 && lineIndex === 2
            ? '今日確認すれば防げるのだ'
            : sceneIndex === 10 && lineIndex === 6
              ? '保存先をコメントで教えてほしいのだ'
              : lineIndex === 2
                ? 'それ普通にヤバいのだ'
              : lineIndex === 4
                ? 'マジでヤバい、完全に油断してたのだ'
              : lineIndex % 2 === 0
                ? `どうせ自動で保存されるから${sceneIndex}年放置で平気なのだ`
                : lineIndex === 1
                  ? '雑に信じないで'
                  : `例えば5GBを超えると保存されない写真が出ますわ`,
  }));

const script = {
  meta: {
    id: episodeId,
    title: 'fixture',
    layout_template: 'Scene01',
    pair: 'ZM',
    voice_engine: 'voicevox',
    fps: 30,
    width: 1920,
    height: 1080,
    target_duration_sec: 300,
  },
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
  scenes: Array.from({length: 10}, (_, index) => ({
    id: `s${String(index + 1).padStart(2, '0')}`,
    role: index === 0 ? 'intro' : index === 9 ? 'cta' : 'body',
    scene_goal: index === 5 ? '中盤の再フックで確認を促す' : '確認を促す',
    motion_mode: index === 0 ? 'warning' : index === 5 ? 'reveal' : index === 9 ? 'recap' : 'punch',
    viewer_question: '何を見ればいいか',
    visual_role: '確認手順を示す',
    visual_asset_plan: [
      {
        slot: 'main',
        purpose: '確認手順を示す',
        adoption_reason: '確認手順を示す',
        image_role: index === 9 ? 'オチ補助' : '理解補助',
        composition_type: ['手順図', '証拠写真風', '原因マップ'][index % 3],
        imagegen_prompt: 'fixture',
      },
    ],
    main: {kind: 'image', asset: `assets/s${String(index + 1).padStart(2, '0')}_main.png`},
    sub: null,
    dialogue: makeDialogue(index + 1).map((line, lineIndex) =>
      (index === 0 || index === 5 || index === 9) && lineIndex === 0
        ? {...line, emphasis: {words: ['確認'], style: 'action', se: 'success', pause_after_ms: 300}}
        : line,
    ),
  })),
};

const scriptFinal = `<!-- scene_format: fixture -->
<!-- viewer_misunderstanding: fixture -->
<!-- reaction_level: L3 -->
<!-- mini_punchline: fixture -->
<!-- number_or_example: 3つの確認 -->
<!-- セルフ監査: fixture -->
# fixture

${'ずんだもん「確認してから試すのだ」\nめたん「保存してから開くよ」\n'.repeat(40)}
`;

await fs.rm(episodeDir, {recursive: true, force: true});
await fs.mkdir(path.join(episodeDir, 'audits'), {recursive: true});
await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script), 'utf8');
await fs.writeFile(path.join(episodeDir, 'script_final.md'), scriptFinal, 'utf8');
await fs.writeFile(
  path.join(episodeDir, 'audits', 'script_final_review.md'),
  `<!-- script_final_sha256: ${scriptFinalSha256(scriptFinal)} -->\n# script_final_review\n\nverdict: PASS\n`,
  'utf8',
);

run(['scripts/estimate-episode-duration.mjs', episodeId]);
run(['scripts/audit-script-quality.mjs', episodeId]);
run(['scripts/validate-script-final-review.mjs', episodeId]);

await fs.writeFile(path.join(episodeDir, 'script_final.md'), `${scriptFinal}\n追記でstale化\n`, 'utf8');
run(['scripts/validate-script-final-review.mjs', episodeId], {expectFailure: true});

await fs.rm(episodeDir, {recursive: true, force: true});
console.log(JSON.stringify({ok: true, tested: ['estimate-episode-duration', 'audit-script-quality', 'script-final-review-stale']}, null, 2));
