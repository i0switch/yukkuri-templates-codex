import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const HOST = 'http://127.0.0.1:50021';

export const sanitizeSpeechText = (text) =>
  text.replace(/[「」]/g, '').replace(/？/g, '?').replace(/！/g, '!').replace(/\s+/g, ' ').trim();

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

const synthVoicevox = async (text, speaker) => {
  const queryResponse = await fetch(
    `${HOST}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
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

  const synthesisResponse = await fetch(`${HOST}/synthesis?speaker=${speaker}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(query),
  });

  if (!synthesisResponse.ok) {
    throw new Error(`VOICEVOX synthesis failed: ${synthesisResponse.status}`);
  }

  return Buffer.from(await synthesisResponse.arrayBuffer());
};

export const buildAudioForEpisode = async (episodeDir, script) => {
  const audioDir = path.join(episodeDir, 'audio');
  await fs.mkdir(audioDir, {recursive: true});

  const durations = {};
  for (const scene of script.scenes) {
    for (const line of scene.dialogue) {
      const speakerId =
        line.speaker === 'left'
          ? script.characters.left.voicevox_speaker_id
          : script.characters.right.voicevox_speaker_id;
      const wav = await synthVoicevox(sanitizeSpeechText(line.text), speakerId);
      const outFile = path.join(audioDir, `${scene.id}_${line.id}.wav`);
      await fs.writeFile(outFile, wav);
      durations[`${scene.id}_${line.id}`] = probeWavSeconds(outFile);
    }
  }

  await fs.writeFile(path.join(episodeDir, 'line-durations.json'), JSON.stringify(durations, null, 2));
  return durations;
};
