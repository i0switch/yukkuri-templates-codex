import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'voice-engine-guard-fixtures');

const pngBytes = () => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  return buffer;
};

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
};

const writeFixture = async ({name, voiceEngine, characters, extraScriptMeta = {}, extraMeta = {}, mutateScript}) => {
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
      voice_engine: voiceEngine,
      target_duration_sec: 300,
      image_style: 'test',
      ...extraScriptMeta,
    },
    characters,
    scenes: [
      {
        id: 's01',
        role: 'intro',
        motion_mode: 'warning',
        scene_goal: 'test',
        viewer_question: 'test',
        visual_role: 'test',
        visual_asset_plan: [
          {
            slot: 'main',
            purpose: 'test',
            adoption_reason: 'test',
            image_role: '理解補助',
            composition_type: '誇張図解',
            imagegen_prompt: 'fixture image prompt',
          },
        ],
        main: {kind: 'image', asset: 'assets/s01_main.png'},
        sub: {
          kind: 'bullets',
          items: ['音声エンジン確認', 'キャラ設定確認'],
        },
        dialogue: [
          {id: 'l01', speaker: 'left', text: '危険を確認するのだ', emphasis: {words: ['危険'], style: 'danger', se: 'warning', pause_after_ms: 300}},
          {id: 'l02', speaker: 'right', text: 'テストですわ'},
        ],
      },
    ],
  };

  const meta = {
    ...extraMeta,
    assets: [
      {
        file: 'assets/s01_main.png',
        source_type: 'user_generated',
        generation_tool: 'fixture',
        rights_confirmed: true,
        license: 'generated image',
        scene_id: 's01',
        slot: 'main',
        purpose: 'test',
        adoption_reason: 'test',
        imagegen_prompt: 'fixture image prompt',
      },
    ],
  };

  if (mutateScript) {
    mutateScript(script);
  }

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const badAquesTalkZm = await writeFixture({
  name: 'bad-aquestalk-zm',
  voiceEngine: 'aquestalk',
  characters: {
    left: {character: 'zundamon', aquestalk_preset: '女性１'},
    right: {character: 'metan', aquestalk_preset: '女性２'},
  },
});

const goodVoicevoxZm = await writeFixture({
  name: 'good-voicevox-zm',
  voiceEngine: 'voicevox',
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
});

const badYamlAudioPlaybackRate = await writeFixture({
  name: 'bad-yaml-audio-playback-rate',
  voiceEngine: 'voicevox',
  extraScriptMeta: {audio_playback_rate: 1.25},
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
});

const badMetaJsonAudioPlaybackRate = await writeFixture({
  name: 'bad-meta-json-audio-playback-rate',
  voiceEngine: 'voicevox',
  extraMeta: {audio_generation: {audio_playback_rate: 1.25}},
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
});

const badYamlTopLevelAudioPlaybackRate = await writeFixture({
  name: 'bad-yaml-top-level-audio-playback-rate',
  voiceEngine: 'voicevox',
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
  mutateScript: (script) => {
    script.audio_playback_rate = 1.25;
  },
});

const badYamlSceneAudioPlaybackRate = await writeFixture({
  name: 'bad-yaml-scene-audio-playback-rate',
  voiceEngine: 'voicevox',
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
  mutateScript: (script) => {
    script.scenes[0].audio_playback_rate = 1.25;
  },
});

const badYamlDialogueAudioPlaybackRate = await writeFixture({
  name: 'bad-yaml-dialogue-audio-playback-rate',
  voiceEngine: 'voicevox',
  characters: {
    left: {character: 'zundamon', voicevox_speaker_id: 3},
    right: {character: 'metan', voicevox_speaker_id: 2},
  },
  mutateScript: (script) => {
    script.scenes[0].dialogue[0].audio_playback_rate = 1.25;
  },
});

run(['scripts/validate-episode-script.mjs', badAquesTalkZm], {
  expectFailure: true,
  expectMessage: 'ZM episodes must use voice_engine: voicevox',
});
run(['scripts/validate-episode-script.mjs', badYamlAudioPlaybackRate], {
  expectFailure: true,
  expectMessage: 'audio_playback_rate is forbidden in script.yaml',
});
run(['scripts/validate-episode-script.mjs', badMetaJsonAudioPlaybackRate], {
  expectFailure: true,
  expectMessage: 'audio_playback_rate is forbidden in meta.json',
});
run(['scripts/validate-episode-script.mjs', badYamlTopLevelAudioPlaybackRate], {
  expectFailure: true,
  expectMessage: 'script.yaml.audio_playback_rate',
});
run(['scripts/validate-episode-script.mjs', badYamlSceneAudioPlaybackRate], {
  expectFailure: true,
  expectMessage: 'script.yaml.scenes[0].audio_playback_rate',
});
run(['scripts/validate-episode-script.mjs', badYamlDialogueAudioPlaybackRate], {
  expectFailure: true,
  expectMessage: 'script.yaml.scenes[0].dialogue[0].audio_playback_rate',
});
run(['scripts/validate-episode-script.mjs', goodVoicevoxZm]);

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
