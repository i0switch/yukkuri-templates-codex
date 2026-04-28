import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {stringify} from 'yaml';
import {formatCanonicalImagegenPrompt} from './lib/imagegen-prompt-contract.mjs';

const rootDir = process.cwd();
const fixtureRoot = path.join(rootDir, '.cache', 'imagegen-guard-fixtures');

const pngBytes = (seed = 1) => {
  const buffer = Buffer.alloc(100_100, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(1920, 16);
  buffer.writeUInt32BE(1080, 20);
  buffer.writeUInt32BE(seed, 24);
  return buffer;
};

const run = (args, {expectFailure = false} = {}) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (expectFailure) {
    if (result.status === 0) {
      throw new Error(`Expected failure but passed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    }
    return;
  }
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
};

const runJson = (args) => {
  const result = spawnSync(process.execPath, args, {cwd: rootDir, encoding: 'utf8', windowsHide: true});
  if (result.status !== 0) {
    throw new Error(`Expected pass but failed: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
  const jsonStart = result.stdout.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`Expected JSON in stdout: node ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout.slice(jsonStart));
};

const promptFor = ({sceneId, lineText}) =>
  formatCanonicalImagegenPrompt({
    sceneId,
    sceneTitle: 'テストシーン',
    dialogueText: lineText,
    mood: '青緑と白を基調にした明るい解説動画向けの雰囲気',
  });

const sceneFor = (index, prompt, {usePromptRef = false} = {}) => {
  const sceneId = `s${String(index).padStart(2, '0')}`;
  const visualTypes = ['hook_poster', 'myth_vs_fact', 'danger_simulation', 'before_after', 'flowchart_scene', 'checklist_panel', 'mini_story_scene', 'final_action_card'];
  const visualType = visualTypes[(index - 1) % visualTypes.length];
  const compositionType = ['NG / OK 比較', '誇張図解', '証拠写真風'][index % 3];
  const lineText = `確認${index}をするのだ`;
  const finalPrompt = prompt ?? promptFor({sceneId, lineText});
  const promptRef = `${sceneId}.main`;
  return {
    id: sceneId,
    role: index === 1 ? 'intro' : index === 7 ? 'outro' : index === 8 ? 'cta' : 'body',
    motion_mode: index === 1 ? 'warning' : index === 4 || index === 5 ? 'reveal' : index === 8 ? 'recap' : index % 2 === 0 ? 'punch' : 'compare',
    scene_goal: `${sceneId} goal`,
    viewer_question: `${sceneId} question`,
    visual_role: `${sceneId} visual`,
    main: {
      kind: 'image',
      asset: `assets/${sceneId}_main.png`,
      asset_requirements: {
        ...(usePromptRef ? {imagegen_prompt_ref: promptRef} : {imagegen_prompt: finalPrompt}),
      },
    },
    sub: null,
    visual_asset_plan: [
      {
        slot: 'main',
        purpose: `${sceneId} purpose`,
        image_role: index === 8 ? 'オチ補助' : '理解補助',
        composition_type: compositionType,
        supports_dialogue: [`${sceneId}_l01`],
        supports_moment: `${sceneId}_l01の誤解を止めて行動へつなぐ瞬間`,
        visual_type: visualType,
        composition_type: compositionType,
        image_direction: {
          scene_id: sceneId,
          dialogue_role: '誤解訂正',
          scene_emotion: '危険から安心',
          visual_type: visualType,
          composition_type: compositionType,
          image_should_support: `${sceneId}_l01の会話補強`,
          key_visual_sentence: '危険を避けて安全な行動へ進む',
          main_subject: '注意サイン付きスマホ',
          foreground: '大きな注意サインとスマホ',
          midground: '安全な選択肢へ向かう矢印',
          background: '青緑の解説動画用パネル',
          color_palette: '青緑、白、注意の赤',
          text_strategy: {
            image_text_allowed: true,
            image_text_max_words: 3,
            image_text_examples: ['STOP'],
          },
          layout_safety: {
            keep_bottom_20_percent_empty: true,
            avoid_character_area: true,
            avoid_sub_area_overlap: true,
          },
          must_not_include: ['実在UI', '既存キャラクター', '長文日本語'],
          quality_bar: 'YouTube解説動画の高品質スライドとして成立',
        },
        ...(usePromptRef ? {imagegen_prompt_ref: promptRef} : {imagegen_prompt: finalPrompt}),
      },
    ],
    dialogue: [
      {
        id: 'l01',
        speaker: index % 2 === 0 ? 'right' : 'left',
        text: lineText,
        ...([1, 4, 5, 8].includes(index) ? {emphasis: {words: ['確認'], style: 'action', se: 'success', pause_after_ms: 300}} : {}),
      },
    ],
  };
};

const writeFixture = async ({name, badPrompt, sheetMeta = false, userGenerated = false, rightsConfirmed = true, duplicateImages = false, usePromptRef = false, useTimeline = false}) => {
  const dir = path.join(fixtureRoot, name);
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});

  const scenes = Array.from({length: 8}, (_, index) => sceneFor(index + 1, index === 0 ? badPrompt : undefined, {usePromptRef}));
  if (useTimeline) {
    const scene = scenes[0];
    const lineTexts = Array.from({length: 10}, (_, index) => `確認${index + 1}をするのだ`);
    scene.dialogue = lineTexts.map((text, index) => ({
      id: `l${String(index + 1).padStart(2, '0')}`,
      speaker: index % 2 === 0 ? 'left' : 'right',
      text,
      ...(index === 0 ? {emphasis: {words: ['確認'], style: 'action', se: 'success', pause_after_ms: 300}} : {}),
    }));
    scene.main_timeline = [
      {slot: 'main_01', slot_group: 'main', asset: 'assets/s01_main_01.png', start_line_id: 'l01', end_line_id: 'l05'},
      {slot: 'main_02', slot_group: 'main', asset: 'assets/s01_main_02.png', start_line_id: 'l06', end_line_id: 'l10'},
    ];
    scene.visual_asset_plan = scene.main_timeline.map((entry, index) => {
      const text = lineTexts.slice(index * 5, index * 5 + 5).join('\n');
      const promptRef = `s01.${entry.slot}`;
      return {
        slot: entry.slot,
        slot_group: 'main',
        purpose: `s01 ${entry.slot} purpose`,
        image_role: index === 0 ? '不安喚起' : '理解補助',
        composition_type: index === 0 ? '事故寸前構図' : '手順図',
        imagegen_prompt_ref: promptRef,
        imagegen_prompt: promptFor({sceneId: 's01', lineText: text}),
      };
    });
  }
  const script = {
    meta: {
      id: name,
      title: name,
      pair: 'ZM',
      fps: 30,
      width: 1920,
      height: 1080,
      audience: 'test',
      tone: 'test',
      bgm_mood: 'test',
      voice_engine: 'voicevox',
      target_duration_sec: 300,
      image_style: '青緑の高品質解説動画スライド',
      layout_template: 'Scene01',
    },
    characters: {
      left: {character: 'zundamon', voicevox_speaker_id: 3},
      right: {character: 'metan', voicevox_speaker_id: 2},
    },
    scenes,
  };

  const assets = [];
  const manifestImages = [];
  for (const scene of scenes) {
    const assetJobs = [
      {asset: scene.main.asset, slot: 'main', plan: scene.visual_asset_plan.find((item) => item.slot === 'main') ?? scene.visual_asset_plan[0], prompt: promptFor({sceneId: scene.id, lineText: `確認${Number(scene.id.slice(1))}をするのだ`})},
      ...(Array.isArray(scene.main_timeline)
        ? scene.main_timeline.map((entry, index) => ({
            asset: entry.asset,
            slot: entry.slot,
            slot_group: entry.slot_group,
            plan: scene.visual_asset_plan.find((item) => item.slot === entry.slot),
            prompt: scene.visual_asset_plan.find((item) => item.slot === entry.slot)?.imagegen_prompt ?? promptFor({sceneId: scene.id, lineText: `確認${Number(scene.id.slice(1))}をするのだ`}),
            seed: Number(scene.id.slice(1)) * 10 + index,
          }))
        : []),
    ];
    for (const assetJob of assetJobs) {
      const assetPath = assetJob.asset;
      await fs.writeFile(path.join(dir, assetPath), pngBytes(duplicateImages ? 1 : (assetJob.seed ?? Number(scene.id.slice(1)))));
      const plan = assetJob.plan;
      const prompt = assetJob.prompt;
    const sourceUrl = sheetMeta ? 'codex://generated_images/shared-sheet/sheet.png' : `codex://generated_images/${name}/${scene.id}.png`;
      const generationId = sheetMeta ? 'shared-sheet' : `${name}-${scene.id}-${assetJob.slot}`;
    assets.push({
      file: assetPath,
      source_type: userGenerated ? 'user_generated' : 'imagegen',
      ...(userGenerated
        ? {
            generation_tool: 'Claude Code user workflow',
            rights_confirmed: rightsConfirmed,
          }
        : {
            generation_tool: 'codex-imagegen',
            rights_confirmed: true,
            source_url: sourceUrl,
            generation_id: generationId,
          }),
      license: 'generated image',
      imagegen_model: 'gpt-image-2',
      scene_id: scene.id,
      slot: assetJob.slot,
      ...(assetJob.slot_group ? {slot_group: assetJob.slot_group} : {}),
      purpose: plan.purpose,
      adoption_reason: `${scene.id}の会話補強に一致`,
      imagegen_prompt: prompt,
      image_direction: plan.image_direction,
      visual_type: plan.visual_type,
      supports_dialogue: plan.supports_dialogue,
      supports_moment: plan.supports_moment,
      ...(sheetMeta ? {crop_from: 'sheet.png'} : {}),
    });
    if (!userGenerated) {
      manifestImages.push({
        scene_id: scene.id,
        slot: assetJob.slot,
        ...(assetJob.slot_group ? {slot_group: assetJob.slot_group} : {}),
        file: assetPath,
        source_url: sourceUrl,
        generation_id: generationId,
        original_file: `${scene.id}.png`,
        prompt_sha256: createHash('sha256').update(prompt, 'utf8').digest('hex'),
      });
    }
  }
  }

  const meta = {assets};
  if (sheetMeta) {
    meta.generated_asset_sheet = 'openai-image://shared-sheet';
  }

  await fs.writeFile(path.join(dir, 'script.yaml'), stringify(script), 'utf8');
  await fs.writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  if (usePromptRef) {
    await fs.writeFile(
      path.join(dir, 'image_prompts.json'),
      `${JSON.stringify(
        {
          version: 1,
          prompts: Object.fromEntries(
            scenes.flatMap((scene) => {
              const entries = [{slot: 'main', asset: scene.main.asset, prompt: promptFor({sceneId: scene.id, lineText: `確認${Number(scene.id.slice(1))}をするのだ`})}];
              if (Array.isArray(scene.main_timeline)) {
                for (const entry of scene.main_timeline) {
                  const plan = scene.visual_asset_plan.find((item) => item.slot === entry.slot);
                  entries.push({slot: entry.slot, asset: entry.asset, prompt: plan?.imagegen_prompt ?? ''});
                }
              }
              return entries.map((entry) => [
                `${scene.id}.${entry.slot}`,
                {
                  ref: `${scene.id}.${entry.slot}`,
                  scene_id: scene.id,
                  slot: entry.slot,
                  asset: entry.asset,
                  imagegen_prompt: entry.prompt,
                  prompt_sha256: createHash('sha256').update(entry.prompt, 'utf8').digest('hex'),
                },
              ]);
            }),
          ),
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }
  if (!userGenerated) {
    await fs.writeFile(path.join(dir, 'imagegen_manifest.json'), `${JSON.stringify({version: 1, images: manifestImages}, null, 2)}\n`, 'utf8');
  }
  return path.join(dir, 'script.yaml');
};

await fs.mkdir(fixtureRoot, {recursive: true});

const passPath = await writeFixture({name: 'pass'});
const promptRefPath = await writeFixture({name: 'prompt-ref-pass', usePromptRef: true});
const timelinePath = await writeFixture({name: 'timeline-pass', usePromptRef: true, useTimeline: true});
const userGeneratedPath = await writeFixture({name: 'user-generated-pass', userGenerated: true});
const userGeneratedNoRightsPath = await writeFixture({name: 'user-generated-no-rights', userGenerated: true, rightsConfirmed: false});

run(['scripts/validate-episode-script.mjs', passPath]);
run(['scripts/validate-episode-script.mjs', promptRefPath]);
run(['scripts/validate-episode-script.mjs', timelinePath]);
const timelineDryRun = runJson(['scripts/run-codex-imagegen-batch.mjs', timelinePath, '--dry-run', '--force']);
if (timelineDryRun.total_jobs !== 9 || !timelineDryRun.jobs.some((job) => job.scene_id === 's01' && job.slot === 'main_02')) {
  throw new Error(`Expected timeline dry-run to collect timeline jobs plus legacy scene jobs, got ${JSON.stringify(timelineDryRun.jobs)}`);
}
const timelineOnlyDryRun = runJson(['scripts/run-codex-imagegen-batch.mjs', timelinePath, '--dry-run', '--force', '--only=s01.main_02']);
if (timelineOnlyDryRun.selected_jobs !== 1 || timelineOnlyDryRun.jobs[0]?.slot !== 'main_02') {
  throw new Error(`Expected --only=s01.main_02 to select one job, got ${JSON.stringify(timelineOnlyDryRun.jobs)}`);
}
const promptRefDir = path.dirname(promptRefPath);
const promptRefManifestPath = path.join(promptRefDir, 'imagegen_manifest.json');
const staleManifest = JSON.parse(await fs.readFile(promptRefManifestPath, 'utf8'));
staleManifest.images[0].prompt_sha256 = 'stale-prompt-hash';
await fs.writeFile(promptRefManifestPath, `${JSON.stringify(staleManifest, null, 2)}\n`, 'utf8');
run(['scripts/sync-imagegen-ledger.mjs', promptRefDir, '--check'], {expectFailure: true});
run(['scripts/sync-imagegen-ledger.mjs', promptRefDir]);
run(['scripts/sync-imagegen-ledger.mjs', promptRefDir, '--check']);
run(['scripts/validate-episode-script.mjs', userGeneratedPath]);
run(['scripts/validate-episode-script.mjs', userGeneratedNoRightsPath], {expectFailure: true});

console.log(JSON.stringify({ok: true, fixture_root: path.relative(rootDir, fixtureRoot).replaceAll('\\', '/')}, null, 2));
