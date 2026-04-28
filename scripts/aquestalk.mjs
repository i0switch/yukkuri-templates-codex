import fs from 'node:fs/promises';
import path from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {spawnSync, execFileSync} from 'node:child_process';
import {
  audioLineInputHash,
  fileSha256,
  mapLimit,
  readJsonFile,
  readAudioManifest,
  shouldReuseAudioLine,
  shouldReuseLegacyAudioLine,
  writeAudioManifest,
} from './lib/pipeline-cache.mjs';
import {normalizeAquesTalkPreset} from './lib/aquestalk-presets.mjs';

const DEFAULT_AQUESTALK_PATH =
  'C:\\Users\\i0swi\\Downloads\\aquestalkplayer_20250606\\aquestalkplayer\\AquesTalkPlayer.exe';

const AQUESTALK_PATH = process.env.AQUESTALKPLAYER_PATH || DEFAULT_AQUESTALK_PATH;

const probeWavSeconds = (filePath) => {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', filePath],
    {encoding: 'utf8', windowsHide: true},
  );
  if (result.status !== 0) {
    throw new Error(`ffprobe failed for ${filePath}: ${result.stderr || result.stdout}`);
  }

  const seconds = Number.parseFloat(result.stdout.trim());
  if (!Number.isFinite(seconds)) {
    throw new Error(`ffprobe returned invalid duration for ${filePath}`);
  }

  return seconds;
};

const DIGITS_JA = ['ぜろ', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

const numberToJapanese = (raw) => {
  const value = Number.parseInt(String(raw).replaceAll(',', ''), 10);
  if (!Number.isFinite(value)) {
    return raw;
  }
  if (value === 0) {
    return DIGITS_JA[0];
  }
  if (value >= 10000) {
    return String(value)
      .split('')
      .map((digit) => DIGITS_JA[Number.parseInt(digit, 10)] ?? digit)
      .join('');
  }
  const parts = [];
  const thousands = Math.floor(value / 1000);
  const hundreds = Math.floor((value % 1000) / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  if (thousands) parts.push(`${thousands === 1 ? '' : DIGITS_JA[thousands]}せん`);
  if (hundreds) parts.push(`${hundreds === 1 ? '' : DIGITS_JA[hundreds]}ひゃく`);
  if (tens) parts.push(`${tens === 1 ? '' : DIGITS_JA[tens]}じゅう`);
  if (ones) parts.push(DIGITS_JA[ones]);
  return parts.join('');
};

export const sanitizeAquesTalkText = (text) =>
  text
    .replace(/[「」]/g, '')
    .replace(/[!！]/g, '。')
    .replace(/[?？]/g, '？')
    .replace(/\d[\d,]*/g, (match) => numberToJapanese(match))
    .replace(/\s+/g, ' ')
    .trim();

const ensureExecutable = async () => {
  try {
    await fs.access(AQUESTALK_PATH);
  } catch {
    throw new Error(`AquesTalkPlayer.exe not found: ${AQUESTALK_PATH}`);
  }
};

const synthAquesTalkOnce = async ({text, preset, outFile}) => {
  const tempOutFile = path.join(
    process.env.TEMP || 'C:\\Users\\i0swi\\AppData\\Local\\Temp',
    `aquestalk_${Date.now()}_${Math.random().toString(16).slice(2)}.wav`,
  );

  const args = ['/T', sanitizeAquesTalkText(text), '/P', preset, '/W', tempOutFile];
  const result = spawnSync(AQUESTALK_PATH, args, {
    cwd: path.dirname(AQUESTALK_PATH),
    encoding: 'utf8',
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(
      `AquesTalk synthesis failed (${preset}) for text "${sanitizeAquesTalkText(text)}": ${result.stderr || result.stdout || result.status}`,
    );
  }

  try {
    await fs.access(tempOutFile);
    await fs.copyFile(tempOutFile, outFile);
  } finally {
    await fs.rm(tempOutFile, {force: true});
  }
};

const synthAquesTalk = async ({text, preset, outFile}) => {
  await ensureExecutable();
  await fs.mkdir(path.dirname(outFile), {recursive: true});

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await synthAquesTalkOnce({text, preset, outFile});
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await setTimeout(250 * attempt);
      }
    }
  }

  throw lastError;
};

const aquestalkConcurrency = () => Math.max(1, Number.parseInt(process.env.AQUESTALK_AUDIO_CONCURRENCY ?? '1', 10) || 1);

export const buildAudioForEpisodeAquesTalk = async (episodeDir, script, {forceAudio = false} = {}) => {
  const audioDir = path.join(episodeDir, 'audio');
  await fs.mkdir(audioDir, {recursive: true});

  const manifest = await readAudioManifest(episodeDir);
  const legacyDurations = await readJsonFile(path.join(episodeDir, 'line-durations.json'), {});
  const nextEntries = {...(manifest.entries ?? {})};
  const durations = {};
  const tasks = script.scenes.flatMap((scene) =>
    scene.dialogue.map((line) => {
      const side = line.speaker === 'left' ? 'left' : 'right';
      const preset = normalizeAquesTalkPreset({
        side,
        preset: side === 'left' ? script.characters.left.aquestalk_preset : script.characters.right.aquestalk_preset,
      });

      if (!preset) {
        throw new Error(`Missing aquestalk_preset for ${line.speaker} in ${script.meta.id}`);
      }

      const text = sanitizeAquesTalkText(line.text);
      const key = `${scene.id}_${line.id}`;
      return {
        key,
        outFile: path.join(audioDir, `${key}.wav`),
        preset,
        text,
        inputHash: audioLineInputHash({voiceEngine: 'aquestalk', speaker: line.speaker, voiceId: preset, text}),
      };
    }),
  );

  let reused = 0;
  let generated = 0;
  await mapLimit(tasks, aquestalkConcurrency(), async (task) => {
    const cached = forceAudio
      ? {ok: false, reason: 'force_audio'}
      : await shouldReuseAudioLine({manifest, key: task.key, outFile: task.outFile, inputHash: task.inputHash});
    if (cached.ok) {
      durations[task.key] = cached.durationSec;
      reused += 1;
      return;
    }
    const legacy = forceAudio
      ? {ok: false, reason: 'force_audio'}
      : await shouldReuseLegacyAudioLine({lineDurations: legacyDurations, key: task.key, outFile: task.outFile});
    if (legacy.ok) {
      durations[task.key] = legacy.durationSec;
      nextEntries[task.key] = {
        file: `audio/${task.key}.wav`,
        input_hash: task.inputHash,
        duration_sec: legacy.durationSec,
        file_sha256: legacy.fileSha256,
        voice_engine: 'aquestalk',
        preset: task.preset,
        adopted_from: 'line-durations.json',
      };
      reused += 1;
      return;
    }

    await synthAquesTalk({text: task.text, preset: task.preset, outFile: task.outFile});
    const durationSec = probeWavSeconds(task.outFile);
    durations[task.key] = durationSec;
    nextEntries[task.key] = {
      file: `audio/${task.key}.wav`,
      input_hash: task.inputHash,
      duration_sec: durationSec,
      file_sha256: await fileSha256(task.outFile),
      voice_engine: 'aquestalk',
      preset: task.preset,
      generated_at: new Date().toISOString(),
    };
    generated += 1;
  });

  for (const key of Object.keys(nextEntries)) {
    if (!Object.prototype.hasOwnProperty.call(durations, key)) {
      delete nextEntries[key];
    }
  }

  await writeAudioManifest(episodeDir, {version: 1, entries: nextEntries});
  await fs.writeFile(path.join(episodeDir, 'line-durations.json'), JSON.stringify(durations, null, 2));
  console.log(JSON.stringify({audio_cache: {voice_engine: 'aquestalk', reused, generated, force_audio: forceAudio}}, null, 2));
  return durations;
};

export const listAquesTalkPresets = () => {
  const presetFile = path.join(path.dirname(AQUESTALK_PATH), 'AquesTalkPlayer.preset');
  const raw = execFileSync(
    'powershell',
    ['-NoProfile', '-Command', `Get-Content -Encoding Default -Raw '${presetFile.replace(/'/g, "''")}'`],
    {encoding: 'utf8', windowsHide: true},
  );
  return raw;
};
