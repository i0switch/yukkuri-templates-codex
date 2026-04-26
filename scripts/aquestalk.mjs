import fs from 'node:fs/promises';
import path from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {spawnSync, execFileSync} from 'node:child_process';

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

export const sanitizeAquesTalkText = (text) =>
  text
    .replace(/[「」]/g, '')
    .replace(/[!！]/g, '。')
    .replace(/[?？]/g, '？')
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
      `AquesTalk synthesis failed (${preset}): ${result.stderr || result.stdout || result.status}`,
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

export const buildAudioForEpisodeAquesTalk = async (episodeDir, script) => {
  const audioDir = path.join(episodeDir, 'audio');
  await fs.mkdir(audioDir, {recursive: true});

  const durations = {};
  for (const scene of script.scenes) {
    for (const line of scene.dialogue) {
      const preset =
        line.speaker === 'left'
          ? script.characters.left.aquestalk_preset
          : script.characters.right.aquestalk_preset;

      if (!preset) {
        throw new Error(`Missing aquestalk_preset for ${line.speaker} in ${script.meta.id}`);
      }

      const outFile = path.join(audioDir, `${scene.id}_${line.id}.wav`);
      await synthAquesTalk({text: line.text, preset, outFile});
      durations[`${scene.id}_${line.id}`] = probeWavSeconds(outFile);
    }
  }

  await fs.writeFile(path.join(episodeDir, 'line-durations.json'), JSON.stringify(durations, null, 2));
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
