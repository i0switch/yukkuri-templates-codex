import {loadDefaultJapaneseParser} from 'budoux';
import {measureLineBreaks} from './subtitleLineBreaks';

type TimedText = {
  text?: string;
  start_sec: number;
  end_sec: number;
};

type WidthBasedSplitOptions = {
  width: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  maxLines: number;
  maxChars?: number;
};

type SplitOptions = number | WidthBasedSplitOptions;

const japaneseParser = loadDefaultJapaneseParser();
const VISUAL_EMPHASIS_MARKER = /\[\[([^\]\n][^\]\n]*?)\]\]/g;

const visibleLength = (value: string) => [...value.replace(/\s+/g, '')].length;

export const stripVisualEmphasisMarkers = (text: string) =>
  String(text ?? '').replace(VISUAL_EMPHASIS_MARKER, '$1');

export const extractVisualEmphasisText = (text: string) => {
  const match = VISUAL_EMPHASIS_MARKER.exec(String(text ?? ''));
  VISUAL_EMPHASIS_MARKER.lastIndex = 0;
  return match?.[1]?.trim() ?? '';
};

const subtitlePageWeight = (value: string) => {
  const normalized = String(value ?? '').replace(/\s+/g, '');
  const base = [...normalized].length;
  const shortPauseCount = [...normalized.matchAll(/[、]/g)].length;
  const longPauseCount = [...normalized.matchAll(/[。！？!?]/g)].length;
  return Math.max(1, base + shortPauseCount * 0.6 + longPauseCount * 1.4);
};

const resolveWeightedSegmentIndex = (segments: string[], progress: number) => {
  const weights = segments.map(subtitlePageWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const targetWeight = Math.min(totalWeight - Number.EPSILON, Math.max(0, progress) * totalWeight);
  let cursor = 0;

  for (let index = 0; index < weights.length; index += 1) {
    cursor += weights[index];
    if (targetWeight < cursor) {
      return index;
    }
  }

  return segments.length - 1;
};

const splitLongChunk = (chunk: string, maxChars: number) => {
  const segments: string[] = [];
  let current = '';
  for (const char of chunk) {
    if (current && visibleLength(current + char) > maxChars) {
      segments.push(current);
      current = char;
      continue;
    }
    current += char;
  }
  if (current) {
    segments.push(current);
  }
  return segments;
};

const parseChunks = (text: string) => {
  try {
    const chunks = japaneseParser.parse(text).filter((chunk) => chunk.length > 0);
    return chunks.length > 0 ? chunks : [text];
  } catch {
    return [text];
  }
};

const isWidthBasedOptions = (options: SplitOptions): options is WidthBasedSplitOptions =>
  typeof options === 'object' &&
  Number.isFinite(options.width) &&
  Number.isFinite(options.fontSize) &&
  Number.isFinite(options.lineHeight) &&
  Number.isFinite(options.maxLines);

const measurePage = (text: string, options: WidthBasedSplitOptions) =>
  measureLineBreaks({
    text,
    width: Math.max(1, options.width),
    fontSize: Math.max(1, options.fontSize),
    lineHeight: Math.max(0.1, options.lineHeight),
    letterSpacing: options.letterSpacing ?? 0,
    maxLines: Math.max(1, options.maxLines),
  });

const fitsPage = (text: string, options: WidthBasedSplitOptions) => {
  if (!text) {
    return true;
  }
  if (typeof options.maxChars === 'number' && options.maxChars > 0 && visibleLength(text) > options.maxChars) {
    return false;
  }
  const measured = measurePage(text, options);
  return measured.fitsMaxLines;
};

const splitLongChunkByPage = (chunk: string, options: WidthBasedSplitOptions) => {
  const segments: string[] = [];
  let current = '';
  for (const char of chunk) {
    const next = current + char;
    if (current && !fitsPage(next, options)) {
      segments.push(measurePage(current, options).text);
      current = char;
      continue;
    }
    current = next;
  }
  if (current) {
    segments.push(measurePage(current, options).text);
  }
  return segments;
};

const splitSubtitleTextByWidth = (normalized: string, options: WidthBasedSplitOptions) => {
  const segments: string[] = [];
  let current = '';

  for (const chunk of parseChunks(normalized)) {
    if (!fitsPage(chunk, options)) {
      if (current) {
        segments.push(measurePage(current, options).text);
        current = '';
      }
      segments.push(...splitLongChunkByPage(chunk, options));
      continue;
    }

    if (/[。！？!?]$/.test(current) && visibleLength(current) >= 18) {
      segments.push(measurePage(current, options).text);
      current = chunk;
      continue;
    }

    const next = current + chunk;
    if (current && !fitsPage(next, options)) {
      segments.push(measurePage(current, options).text);
      current = chunk;
      continue;
    }
    current = next;
  }

  if (current) {
    segments.push(measurePage(current, options).text);
  }
  return segments.length > 0 ? segments : [normalized];
};

const splitSubtitleTextByChars = (normalized: string, maxChars: number) => {
  if (visibleLength(normalized) <= maxChars) {
    return [normalized];
  }

  const segments: string[] = [];
  let current = '';
  for (const chunk of parseChunks(normalized)) {
    if (visibleLength(chunk) > maxChars) {
      if (current) {
        segments.push(current);
        current = '';
      }
      segments.push(...splitLongChunk(chunk, maxChars));
      continue;
    }

    const next = current + chunk;
    if (current && visibleLength(next) > maxChars) {
      segments.push(current);
      current = chunk;
      continue;
    }
    current = next;
  }

  if (current) {
    segments.push(current);
  }
  return segments.length > 0 ? segments : [normalized];
};

export const splitSubtitleText = (text: string, options: SplitOptions) => {
  const normalized = stripVisualEmphasisMarkers(text).replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [''];
  }
  if (isWidthBasedOptions(options)) {
    return splitSubtitleTextByWidth(normalized, options);
  }
  return splitSubtitleTextByChars(normalized, options);
};

export const resolveSubtitleSegmentText = ({
  line,
  currentSec,
  maxChars,
  splitOptions,
}: {
  line: TimedText | null;
  currentSec: number;
  maxChars?: number;
  splitOptions?: SplitOptions;
}) => {
  if (!line) {
    return '';
  }
  const segments = splitSubtitleText(line.text ?? '', splitOptions ?? maxChars ?? 30);
  if (segments.length <= 1) {
    return segments[0] ?? '';
  }

  const duration = Math.max(0.001, line.end_sec - line.start_sec);
  const progress = Math.min(0.999999, Math.max(0, (currentSec - line.start_sec) / duration));
  const index = resolveWeightedSegmentIndex(segments, progress);
  return segments[index] ?? '';
};
