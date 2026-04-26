import fs from 'node:fs/promises';
import path from 'node:path';
import {parse, stringify} from 'yaml';

import {blockLegacyEpisodeGenerator} from './legacy-generator-guard.mjs';

blockLegacyEpisodeGenerator('create-requested-rm-zm-five-minute-episodes.mjs');

const rootDir = process.cwd();

const sourceBgm = path.join(rootDir, 'script', 'ep000-test-all-21-scenes', 'bgm', 'track.mp3');

const episodePlans = [
  {
    sourceId: 'ep501-zm-ai-habit-automation',
    id: 'ep851-rm-ai-automation-risk',
    pair: 'RM',
    title: 'AI自動化で時間が増えない本当の理由',
    layoutTemplate: 'Scene02',
    videoType: 'ゆっくり解説',
    voiceEngine: 'aquestalk',
    characters: {
      left: {
        character: 'reimu',
        aquestalk_preset: 'れいむ',
        speaking_style: '疑問役。短く不安や違和感を出す。',
      },
      right: {
        character: 'marisa',
        aquestalk_preset: 'まりさ',
        speaking_style: '解説役。結論を先に言い、語尾は〜だぜ寄り。',
      },
    },
    tone: '危機感あり・実用的・ゆっくり解説らしい掛け合い',
    audience: 'AI活用や業務改善を始めたい初心者',
  },
  {
    sourceId: 'ep502-zm-money-leak-subscription',
    id: 'ep852-zm-subscription-leak',
    pair: 'ZM',
    title: 'サブスク貧乏を止める3つの見直し方',
    layoutTemplate: 'Scene17',
    videoType: 'ずんだもん解説',
    voiceEngine: 'voicevox',
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '疑問役。語尾は〜なのだ。短く反応する。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '整理役。落ち着いて損失回避を示す。',
      },
    },
    tone: '短く刺す・危機感あり・対処まで出す',
    audience: '固定費や生活改善に興味がある一般層',
  },
];

const ensureDir = async (dir) => fs.mkdir(dir, {recursive: true});

const pathExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const rmLine = (text, speaker) => {
  if (speaker === 'left') {
    return text
      .replace(/なのだ/g, 'なのね')
      .replace(/のだ/g, 'のね')
      .replace(/ですわ/g, 'だわ')
      .replace(/ますわ/g, 'るわ');
  }

  return text
    .replace(/ですわ/g, 'だぜ')
    .replace(/ますわ/g, 'るぜ')
    .replace(/なのよ/g, 'なんだぜ')
    .replace(/のよ/g, 'んだぜ')
    .replace(/だわ/g, 'だぜ')
    .replace(/わ$/g, 'ぜ')
    .replace(/よ$/g, 'ぜ')
    .replace(/ね$/g, 'な');
};

const promptFor = ({plan, scene, slot, caption}) =>
  [
    `【用途】${scene.id} ${slot}枠。${plan.videoType}で「${caption}」を一瞬で理解させる素材。`,
    `【主題】画面中央に「${caption}」を象徴する大きな図解モチーフを置く。`,
    `【構図】主役オブジェクトを中央大きめ、補助アイコンは左右上部に少量。左右と下部に字幕とキャラを避ける余白を残す。`,
    `【テンプレート枠】${plan.layoutTemplate} の ${slot}枠に収める。字幕帯、左右キャラ位置、サブ枠がある場合はその領域に重要物を置かない。`,
    '【色】白または淡い背景、主色は青緑、注意や損失だけ赤、影は薄く、全シーンで色味を揃える。',
    '【情報量】1枚1メッセージ。画像内文字なし。細部を詰めず遠目でも読める。',
    `【絵柄】${plan.videoType}向けの太線フラット図解、角丸、余白多め、meta.image_styleと統一。`,
    '【禁止】細かい文字、英語UI、ブランドロゴ、実在人物、既存キャラクター、実在アプリUI模写、写真風人物。',
  ].join('');

const normalizeContent = (plan, scene, key) => {
  const content = scene[key];
  if (!content || content.kind !== 'image') {
    return content ?? null;
  }

  const caption = content.caption || content.asset;
  const prompt = promptFor({plan, scene, slot: key, caption});
  return {
    ...content,
    asset_requirements: {
      description: `${caption}を、${plan.layoutTemplate}の${key}枠で見やすい図解として表示する`,
      imagegen_prompt: prompt,
      style: `${plan.videoType}向け、16:9、フラット図解、余白多め、文字なし`,
      aspect: '16:9',
      negative: 'small text, dense UI, brand logos, real people, existing characters',
      scene_goal: scene.scene_goal,
      template_slot: key,
      visual_tone: plan.tone,
      composition: '中央主題、左右下部に余白、字幕帯を邪魔しない',
      spacing: '大きな余白、1枚1メッセージ、細かい要素なし',
    },
  };
};

const sceneRole = (index, total, originalRole) => {
  if (index === 0) return 'intro';
  if (index === total - 1) return 'cta';
  if (index >= total - 3) return 'outro';
  return originalRole === 'intro' ? 'body' : originalRole;
};

const buildScenes = (plan, sourceScript) =>
  sourceScript.scenes.map((scene, index) => {
    const sceneTitle = scene.main?.caption || scene.title_text || `${plan.title} ${scene.id}`;
    const firstLeft = scene.dialogue?.find((line) => line.speaker === 'left')?.text || sceneTitle;
    const normalized = {
      ...scene,
      role: sceneRole(index, sourceScript.scenes.length, scene.role),
      scene_goal: `${sceneTitle}を通じて、放置リスクと対処の一歩を理解させる`,
      viewer_question: firstLeft,
      visual_role:
        scene.sub && plan.layoutTemplate === 'Scene02'
          ? `main枠は「${sceneTitle}」の図解、sub枠は3項目の補足を担当する`
          : `main枠は「${sceneTitle}」を大きく見せ、字幕は短い反応だけに絞る`,
    };

    delete normalized.scene_template;
    delete normalized.duration_sec;
    delete normalized.tail_pad_sec;

    normalized.dialogue = normalized.dialogue.map((line) => ({
      id: line.id,
      speaker: line.speaker,
      text: plan.pair === 'RM' ? rmLine(line.text, line.speaker) : line.text,
      expression: line.expression,
      pre_pause_sec: 0.1,
      post_pause_sec: 0.25,
    }));

    normalized.main = normalizeContent(plan, normalized, 'main');
    normalized.sub = normalized.sub ?? null;
    normalized.visual_asset_plan = [
      {
        required: normalized.main?.kind === 'image',
        slot: 'main',
        purpose: `視聴者に「${sceneTitle}」を一目で理解させる`,
        insert_timing: `${normalized.id} の l01 直前から表示`,
        asset: normalized.main?.kind === 'image' ? normalized.main.asset : undefined,
        imagegen_prompt: normalized.main?.kind === 'image' ? normalized.main.asset_requirements.imagegen_prompt : undefined,
        audit_points: [
          '1枚1メッセージになっている',
          `${plan.layoutTemplate}の表示枠に収まる`,
          '細かい文字やロゴがない',
        ],
      },
    ];

    return normalized;
  });

const buildScript = (plan, sourceScript) => ({
  meta: {
    id: plan.id,
    title: plan.title,
    layout_template: plan.layoutTemplate,
    scene_template: plan.layoutTemplate,
    pair: plan.pair,
    fps: 30,
    width: 1280,
    height: 720,
    audience: plan.audience,
    tone: plan.tone,
    bgm_mood: sourceScript.meta.bgm_mood || '軽い解説用ループ',
    voice_engine: plan.voiceEngine,
    target_duration_sec: 300,
    image_style: `${plan.videoType}向けフラット図解。余白多め、文字なし、ロゴなし`,
    typography: {
      subtitle_family: 'gothic',
      content_family: 'gothic',
      title_family: 'gothic',
      subtitle_stroke_color: '#000000',
      subtitle_stroke_width: 6,
    },
  },
  characters: plan.characters,
  bgm: {
    title: 'upbeat step',
    source_url: 'https://dova-s.jp/en/bgm/detail/16211',
    file: 'bgm/track.mp3',
    license: 'DOVA-SYNDROME 標準利用規約',
    volume: 0.08,
    fade_in_sec: 0.8,
    fade_out_sec: 1.5,
  },
  scenes: buildScenes(plan, sourceScript),
});

const imageGenerationId = ({episodeId, sceneId, slot, asset}) =>
  ['image_gen', episodeId, sceneId, slot, asset.split('/').pop()].join(':');

const buildMeta = (plan, script) => ({
  episode_id: plan.id,
  generated_at: new Date().toISOString(),
  generator: 'Codex requested RM/ZM five minute generator',
  template: plan.layoutTemplate,
  theme: plan.title,
  voices:
    plan.pair === 'RM'
      ? [
          {visual_character: '霊夢', engine: 'AquesTalkPlayer', preset: 'れいむ', credit: 'AquesTalkPlayer preset: れいむ'},
          {visual_character: '魔理沙', engine: 'AquesTalkPlayer', preset: 'まりさ', credit: 'AquesTalkPlayer preset: まりさ'},
        ]
      : [
          {visual_character: 'ずんだもん', engine: 'VOICEVOX', speaker_id: 3, credit: 'VOICEVOX:ずんだもん'},
          {visual_character: '四国めたん', engine: 'VOICEVOX', speaker_id: 2, credit: 'VOICEVOX:四国めたん'},
        ],
  assets: [
    {
      file: 'bgm/track.mp3',
      source_site: 'dova-syndrome',
      source_url: 'https://dova-s.jp/en/bgm/detail/16211',
      title: 'upbeat step',
      license: 'DOVA-SYNDROME 標準利用規約',
      credit_required: false,
    },
    ...script.scenes
      .filter((scene) => scene.main?.kind === 'image')
      .map((scene) => ({
        file: scene.main.asset,
        source_site: 'OpenAI image generation',
        source_type: 'image_gen',
        generation_id: imageGenerationId({episodeId: plan.id, sceneId: scene.id, slot: 'main', asset: scene.main.asset}),
        scene_id: scene.id,
        slot: 'main',
        purpose: scene.visual_asset_plan[0].purpose,
        adoption_reason: `${plan.layoutTemplate}のmain枠で見やすく、セリフ理解を補助できるため`,
        description: scene.main.asset_requirements.description,
        imagegen_prompt: scene.main.asset_requirements.imagegen_prompt,
        imagegen_model: 'built-in image_gen',
        provenance: 'image_gen per-asset ledger entry',
        license: 'user-generated local image asset for this project',
        credit_required: false,
      })),
  ],
});

const buildMarkdown = (plan, script) => {
  const lines = [
    `# ${plan.title}`,
    '',
    `- 動画タイプ: ${plan.videoType}`,
    `- 想定尺: 約5分`,
    `- 使用テンプレート: ${plan.layoutTemplate}`,
    '',
  ];

  for (const scene of script.scenes) {
    lines.push(`## ${scene.id} ${scene.main?.caption || scene.title_text || scene.role}`);
    lines.push(`- scene_goal: ${scene.scene_goal}`);
    lines.push(`- visual_role: ${scene.visual_role}`);
    if (scene.main?.kind === 'image') {
      lines.push(`- image_insert_point: ${scene.id} の l01 直前`);
      lines.push(`- asset_path: script/${plan.id}/${scene.main.asset}`);
    }
    for (const line of scene.dialogue) {
      const name =
        plan.pair === 'RM'
          ? line.speaker === 'left'
            ? '霊夢'
            : '魔理沙'
          : line.speaker === 'left'
            ? 'ずんだもん'
            : 'めたん';
      lines.push(`- ${name}: ${line.text}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
};

const buildEditNotes = (plan, script) => {
  const rows = script.scenes.map((scene, index) => {
    const se = index === 0 ? 'ドン' : index % 5 === 0 ? 'ポン' : '';
    return `| ${scene.id} | ${scene.role} | ${scene.main?.kind === 'image' ? scene.main.asset : '箇条書き'} | 白文字+黒縁 | フェードイン、要点で軽くズーム | 発話側を口パク | ${se} | 通奏 | ${scene.scene_goal} |`;
  });

  return `# 編集演出指示書

## 1. 全体設定

- 動画タイプ：${plan.videoType}
- 画面比率：16:9
- 解像度：1280x720
- 想定尺：約5分
- 編集環境：Remotion
- 通常字幕フォント：けいふぉんと
- 通常字幕スタイル：白文字 + 太い黒縁 + 軽い影
- 使用テンプレート：${plan.layoutTemplate}

## 2. シーン別演出

| scene_id | パート | 表示素材 | 字幕スタイル | 画面演出 | キャラ演出 | SE | BGM | 備考 |
|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
};

for (const plan of episodePlans) {
  const sourceDir = path.join(rootDir, 'script', plan.sourceId);
  const targetDir = path.join(rootDir, 'script', plan.id);
  if (await pathExists(targetDir)) {
    throw new Error(`${plan.id} already exists. This generator no longer overwrites or copies image assets; choose a new episode id after generating per-asset image_gen files.`);
  }
  const sourceScript = parse(await fs.readFile(path.join(sourceDir, 'script.yaml'), 'utf8'));
  const script = buildScript(plan, sourceScript);

  await ensureDir(targetDir);
  await ensureDir(path.join(targetDir, 'assets'));
  await ensureDir(path.join(targetDir, 'audio'));
  await ensureDir(path.join(targetDir, 'bgm'));
  await ensureDir(path.join(targetDir, 'se'));
  await fs.copyFile(sourceBgm, path.join(targetDir, 'bgm', 'track.mp3'));
  await fs.writeFile(path.join(targetDir, 'script.yaml'), stringify(script, {lineWidth: 0}), 'utf8');
  await fs.writeFile(path.join(targetDir, 'meta.json'), `${JSON.stringify(buildMeta(plan, script), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(targetDir, 'script.md'), buildMarkdown(plan, script), 'utf8');
  await fs.writeFile(path.join(targetDir, 'script_image_points.md'), buildMarkdown(plan, script), 'utf8');
  await fs.writeFile(path.join(targetDir, 'script_editing_notes.md'), buildEditNotes(plan, script), 'utf8');
}

console.log(JSON.stringify({episodes: episodePlans.map((plan) => plan.id)}, null, 2));
