import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';
import {estimateEpisodeDuration} from './lib/duration-estimator.mjs';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'duration-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  return buffer;
};

const promptSha256 = (value) => createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');

const run = (args, {expectFailure = false, expectMessage} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  const output = `${result.stdout}\n${result.stderr}`;

  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${output}`);
    }
    if (expectMessage && !output.includes(expectMessage)) {
      throw new Error(`Expected failure message "${expectMessage}" but got:\n${output}`);
    }
    return;
  }

  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${output}`);
  }
  if (expectMessage && !output.includes(expectMessage)) {
    throw new Error(`Expected message "${expectMessage}" but got:\n${output}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const estimateFixture = ({targetDurationSec, voiceEngine = 'voicevox', lineCount}) =>
  estimateEpisodeDuration({
    meta: {
      target_duration_sec: targetDurationSec,
      voice_engine: voiceEngine,
    },
    scenes: [
      {
        dialogue: Array.from({length: lineCount}, (_, index) => ({
          id: `l${String(index + 1).padStart(3, '0')}`,
          text: 'テスト発話',
        })),
      },
    ],
  });

const makeDialogue = (lineCount) =>
  Array.from({length: lineCount}, (_, index) => {
    const base = {
      id: `l${String(index + 1).padStart(2, '0')}`,
      speaker: index % 2 === 0 ? 'left' : 'right',
      text: index % 2 === 0 ? '危険を確認するのだ' : 'テストですわ',
    };
    if (index === 0) {
      return {
        ...base,
        wav_sec: 1,
        start_sec: 0.1,
        end_sec: 1.1,
      };
    }
    if (index === 1) {
      return {...base, wav_sec: 1, start_sec: 1.3, end_sec: 2.3};
    }
    return base;
  });

const writeFixture = async ({name, targetDurationSec, totalDurationSec, dialogueLineCount = 2}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});
  await fs.writeFile(path.join(dir, 'assets', 's01_main.png'), pngBytes());

  const script = {
    meta: {
      id: name,
      title: name,
      layout_template: 'Scene02',
      pair: 'ZM',
      fps: 30,
      width: 1280,
      height: 720,
      audience: 'test',
      tone: 'test',
      bgm_mood: 'test',
      voice_engine: 'voicevox',
      target_duration_sec: targetDurationSec,
      image_style: 'test',
    },
    characters: {
      left: {character: 'zundamon', voicevox_speaker_id: 3},
      right: {character: 'metan', voicevox_speaker_id: 2},
    },
    total_duration_sec: totalDurationSec,
    scenes: [
      {
        id: 's01',
        role: 'intro',
        motion_mode: 'warning',
        scene_goal: 'test',
        viewer_question: 'test',
        visual_role: 'test',
        duration_sec: totalDurationSec,
        visual_asset_plan: [
          {
            slot: 'main',
            purpose: 'test',
            adoption_reason: 'test',
            image_role: '理解補助',
            composition_type: '誇張図解',
            imagegen_prompt: 'duration guard fixture image prompt',
          },
        ],
        main: {kind: 'image', asset: 'assets/s01_main.png'},
        sub: {
          kind: 'bullets',
          items: ['尺チェック', '自然音声優先'],
        },
        dialogue: makeDialogue(dialogueLineCount),
      },
    ],
  };

  const meta = {
    assets: [
      {
        file: 'assets/s01_main.png',
        source_type: 'imagegen',
        generation_tool: 'codex-imagegen',
        rights_confirmed: true,
        license: 'generated image',
        scene_id: 's01',
        slot: 'main',
        purpose: 'test',
        adoption_reason: 'test',
        imagegen_prompt: 'duration guard fixture image prompt',
        source_url: 'codex://generated_images/duration-guard-fixture/s01_main.png',
        generation_id: 'duration-guard-fixture/s01_main.png',
      },
    ],
  };
  const manifest = {
    version: 1,
    images: [
      {
        file: 'assets/s01_main.png',
        destination: 'assets/s01_main.png',
        scene_id: 's01',
        slot: 'main',
        source_url: 'codex://generated_images/duration-guard-fixture/s01_main.png',
        generation_id: 'duration-guard-fixture/s01_main.png',
        prompt_sha256: promptSha256('duration guard fixture image prompt'),
      },
    ],
  };

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'imagegen_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const target300At280 = await writeFixture({name: 'target-300-at-280', targetDurationSec: 300, totalDurationSec: 280});
const target300At260 = await writeFixture({name: 'target-300-at-260', targetDurationSec: 300, totalDurationSec: 260});
const target300At340 = await writeFixture({name: 'target-300-at-340', targetDurationSec: 300, totalDurationSec: 340, dialogueLineCount: 150});
const target360At340 = await writeFixture({name: 'target-360-at-340', targetDurationSec: 360, totalDurationSec: 340});
const target360At310 = await writeFixture({name: 'target-360-at-310', targetDurationSec: 360, totalDurationSec: 310});
const target360At410 = await writeFixture({name: 'target-360-at-410', targetDurationSec: 360, totalDurationSec: 410});

run(['scripts/validate-episode-script.mjs', target300At260], {
  expectFailure: true,
  expectMessage: 'allowed_min=270s',
});
run(['scripts/validate-episode-script.mjs', target300At280]);
run(['scripts/validate-episode-script.mjs', target300At340], {
  expectMessage: 'script_final.md must stay unchanged for duration',
});
run(['scripts/validate-episode-script.mjs', target360At340]);
run(['scripts/validate-episode-script.mjs', target360At310], {
  expectFailure: true,
  expectMessage: 'allowed_min=324s',
});
run(['scripts/validate-episode-script.mjs', target360At410], {
  expectMessage: 'script_final.md must stay unchanged for duration',
});
run(['scripts/estimate-episode-duration.mjs', target300At260], {
  expectFailure: true,
  expectMessage: '"duration_status": "under"',
});
run(['scripts/estimate-episode-duration.mjs', target300At260], {
  expectFailure: true,
  expectMessage: '"recommended_action": "add_dialogue"',
});
run(['scripts/estimate-episode-duration.mjs', target300At340], {
  expectMessage: '"duration_status": "over"',
});
run(['scripts/estimate-episode-duration.mjs', target300At340], {
  expectMessage: '"recommended_action": "keep_natural_overrun_do_not_trim"',
});
const measuredProfileTarget = await writeFixture({name: 'target300-measured-profile', targetDurationSec: 300, totalDurationSec: 300, dialogueLineCount: 100});
await fs.writeFile(
  path.join(path.dirname(measuredProfileTarget), 'tts-duration-profile.json'),
  `${JSON.stringify({version: 1, voice_engine: 'voicevox', dialogue_lines: 100, total_audio_sec: 410, actual_seconds_per_line: 4.1}, null, 2)}\n`,
  'utf8',
);
run(['scripts/estimate-episode-duration.mjs', measuredProfileTarget], {
  expectMessage: '"seconds_per_line_source": "tts-duration-profile.json"',
});
run(['scripts/estimate-episode-duration.mjs', measuredProfileTarget], {
  expectMessage: '"estimated_duration_sec": 410',
});

const underEstimate = estimateFixture({targetDurationSec: 300, lineCount: 80});
assert(underEstimate.ok === false, 'under target estimate must fail');
assert(underEstimate.duration_status === 'under', 'under target estimate must report duration_status=under');
assert(underEstimate.recommended_line_delta > 0, 'under target estimate must recommend additional lines');
assert(underEstimate.recommended_action === 'add_dialogue', 'under target estimate must recommend adding dialogue');

const withinEstimate = estimateFixture({targetDurationSec: 300, lineCount: 90});
assert(withinEstimate.ok === true, 'within target estimate must pass');
assert(withinEstimate.duration_status === 'within', 'within target estimate must report duration_status=within');
assert(withinEstimate.recommended_line_delta === 0, 'within target estimate must not recommend line changes');
assert(withinEstimate.recommended_action === 'keep_script', 'within target estimate must recommend keeping the script');
assert(withinEstimate.seconds_per_line === 3.3, 'VOICEVOX estimate must use 3.3 seconds per line for speedScale 1.15');

const overEstimate = estimateFixture({targetDurationSec: 300, lineCount: 110});
assert(overEstimate.ok === true, 'over target estimate must pass');
assert(overEstimate.duration_status === 'over', 'over target estimate must report duration_status=over');
assert(overEstimate.recommended_line_delta === 0, 'over target estimate must not recommend line changes');
assert(overEstimate.recommended_action === 'keep_natural_overrun_do_not_trim', 'over target estimate must explicitly forbid line removal for duration');

const buildEpisodeSource = await fs.readFile(path.join(rootDir, 'scripts', 'build-episode.mjs'), 'utf8');
for (const removedPaddingToken of ['remainingGap', 'scenePadding']) {
  if (buildEpisodeSource.includes(removedPaddingToken)) {
    throw new Error(`build-episode.mjs must not pad scenes to target_duration_sec with ${removedPaddingToken}`);
  }
}

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
