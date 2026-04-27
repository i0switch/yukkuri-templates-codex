import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseDocument} from 'yaml';

export const DEFAULT_VOICEVOX_BASE_URL = 'http://127.0.0.1:50021';
export const VOICEVOX_BASE_URL = process.env.VOICEVOX_BASE_URL || DEFAULT_VOICEVOX_BASE_URL;

export const sanitizeSpeechText = (text) =>
  text.replace(/[「」]/g, '').replace(/？/g, '?').replace(/！/g, '!').replace(/\s+/g, ' ').trim();

const normalizeBaseUrl = (baseUrl = VOICEVOX_BASE_URL) => String(baseUrl || DEFAULT_VOICEVOX_BASE_URL).replace(/\/+$/, '');

export const checkVoicevoxEngine = async ({baseUrl = VOICEVOX_BASE_URL, timeoutMs = 3000} = {}) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${normalizedBaseUrl}/version`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`GET /version returned HTTP ${response.status}`);
    }
    return {ok: true, baseUrl: normalizedBaseUrl};
  } catch (error) {
    const reason =
      error?.name === 'AbortError'
        ? `timeout after ${timeoutMs}ms`
        : error?.cause?.code
          ? `${error.message}: ${error.cause.code}`
          : error?.message || String(error);
    throw new Error(`VOICEVOX engine preflight failed: ${normalizedBaseUrl} (${reason})`);
  } finally {
    clearTimeout(timeout);
  }
};

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

const synthVoicevox = async (text, speaker, {baseUrl = VOICEVOX_BASE_URL} = {}) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const queryResponse = await fetch(
    `${normalizedBaseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
    {method: 'POST'},
  );
  if (!queryResponse.ok) {
    throw new Error(`VOICEVOX audio_query failed: ${queryResponse.status}`);
  }

  const query = await queryResponse.json();
  query.speedScale = 1.32;
  query.intonationScale = 1.05;
  query.volumeScale = 1.0;
  query.prePhonemeLength = 0.02;
  query.postPhonemeLength = 0.03;

  const synthesisResponse = await fetch(`${normalizedBaseUrl}/synthesis?speaker=${speaker}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(query),
  });

  if (!synthesisResponse.ok) {
    throw new Error(`VOICEVOX synthesis failed: ${synthesisResponse.status}`);
  }

  return Buffer.from(await synthesisResponse.arrayBuffer());
};

export const buildAudioForEpisode = async (episodeDir, script, {baseUrl = VOICEVOX_BASE_URL} = {}) => {
  const {baseUrl: checkedBaseUrl} = await checkVoicevoxEngine({baseUrl});
  const audioDir = path.join(episodeDir, 'audio');
  await fs.mkdir(audioDir, {recursive: true});

  const durations = {};
  for (const scene of script.scenes) {
    for (const line of scene.dialogue) {
      const speakerId =
        line.speaker === 'left'
          ? script.characters.left.voicevox_speaker_id
          : script.characters.right.voicevox_speaker_id;
      const wav = await synthVoicevox(sanitizeSpeechText(line.text), speakerId, {baseUrl: checkedBaseUrl});
      const outFile = path.join(audioDir, `${scene.id}_${line.id}.wav`);
      await fs.writeFile(outFile, wav);
      durations[`${scene.id}_${line.id}`] = probeWavSeconds(outFile);
    }
  }

  await fs.writeFile(path.join(episodeDir, 'line-durations.json'), JSON.stringify(durations, null, 2));
  return durations;
};

const resolveTarget = (rootDir, value) => {
  const directPath = path.resolve(rootDir, value);
  if (value.endsWith('.yaml') || value.endsWith('.yml') || value.endsWith('.json')) {
    return {
      scriptPath: directPath,
      episodeDir: path.dirname(directPath),
    };
  }

  const episodeDir = path.resolve(rootDir, 'script', value);
  return {
    scriptPath: path.join(episodeDir, 'script.yaml'),
    episodeDir,
  };
};

const readScript = async (scriptPath) => {
  const raw = await fs.readFile(scriptPath, 'utf8');
  if (scriptPath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parseDocument(raw).toJS();
};

const runCli = async () => {
  const rootDir = process.cwd();
  const target = process.argv[2];
  if (!target) {
    throw new Error('Usage: node scripts/voicevox.mjs <episode_id|path/to/script.yaml|path/to/script.render.json>');
  }

  const {formatEpisodeValidationResult, validateEpisodeScript} = await import('./lib/episode-validator.mjs');
  const {scriptPath, episodeDir} = resolveTarget(rootDir, target);
  const script = await readScript(scriptPath);
  const result = await validateEpisodeScript(script, {episodeDir});
  const details = formatEpisodeValidationResult(result);
  if (details) {
    console.log(details);
  }
  if (!result.ok) {
    process.exitCode = 1;
    return;
  }

  await checkVoicevoxEngine();
  const durations = await buildAudioForEpisode(episodeDir, script);
  console.log(JSON.stringify({episode: target, lines: Object.keys(durations).length}, null, 2));
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error?.message || error);
    process.exitCode = 1;
  });
}
