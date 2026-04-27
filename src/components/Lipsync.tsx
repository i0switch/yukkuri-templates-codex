import type {DialogueLine} from '../lib/load-script';

export type TimedDialogueLine = DialogueLine & {
  wav_sec: number;
  start_sec: number;
  end_sec: number;
};

export const findActiveLine = (
  lines: TimedDialogueLine[],
  frame: number,
  fps: number,
): TimedDialogueLine | null => {
  const currentSec = frame / fps;
  return lines.find((line) => currentSec >= line.start_sec && currentSec < line.end_sec) ?? null;
};

const latestExpressionForSide = (
  lines: TimedDialogueLine[],
  side: 'left' | 'right',
  frame: number,
  fps: number,
  fallback: string,
) => {
  const currentSec = frame / fps;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (line.speaker === side && line.start_sec <= currentSec) {
      return line.expression ?? fallback;
    }
  }

  return fallback;
};

export const pickLipsyncExpression = ({
  side,
  lines,
  activeLine,
  frame,
  fps,
  fallback = 'smile',
}: {
  side: 'left' | 'right';
  lines: TimedDialogueLine[];
  activeLine: TimedDialogueLine | null;
  frame: number;
  fps: number;
  fallback?: string;
}) => {
  const baseExpression = latestExpressionForSide(lines, side, frame, fps, fallback);
  if (!activeLine || activeLine.speaker !== side) {
    return baseExpression;
  }

  const toggleFrames = Math.max(1, Math.round(fps * 0.12));
  const expressiveBase = activeLine.expression && activeLine.expression !== 'normal' ? activeLine.expression : baseExpression;
  return Math.floor(frame / toggleFrames) % 2 === 0 ? 'talk' : expressiveBase;
};
