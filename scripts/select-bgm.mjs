import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';

const rootDir = process.env.BGM_ROOT_DIR ? path.resolve(process.env.BGM_ROOT_DIR) : process.cwd();
const episodeId = process.argv[2];
const flags = new Set(process.argv.slice(3));
const forceBgm = flags.has('--force') || flags.has('--force-bgm');
const MIN_BGM_BYTES = Number.parseInt(process.env.BGM_MIN_BYTES ?? '10240', 10);
const DOVA_BASE_URL = process.env.DOVA_BASE_URL ?? 'https://dova-s.jp';
const DEFAULT_LICENSE = 'DOVA-SYNDROME 音源利用ライセンス（背景音楽利用・商用利用可・クレジット不要）';

class BgmSelectionError extends Error {
  constructor(message, details = {}) {
    super(`BGM_SELECTION_FAILED: ${message}`);
    this.name = 'BgmSelectionError';
    this.details = details;
  }
}

if (!episodeId) {
  throw new Error('Usage: node scripts/select-bgm.mjs <episode_id>');
}

const episodeDir = path.join(rootDir, 'script', episodeId);
const scriptPath = path.join(episodeDir, 'script.yaml');
const metaPath = path.join(episodeDir, 'meta.json');
const bgmFile = path.join(episodeDir, 'bgm', 'track.mp3');

const normalizeSlashes = (value) => value.replaceAll('\\', '/');

const htmlDecode = (value = '') =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const stripTags = (value = '') => htmlDecode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readScriptDocument = async () => parseDocument(await fs.readFile(scriptPath, 'utf8'));

const statFile = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
};

const hasUsableExistingBgm = async (script) => {
  if (typeof script?.bgm?.file !== 'string' || script.bgm.file.trim() === '') {
    return false;
  }

  const existingPath = path.resolve(episodeDir, script.bgm.file);
  const stat = await statFile(existingPath);
  return Boolean(stat?.isFile() && stat.size >= MIN_BGM_BYTES);
};

const readMetaJson = async () => {
  try {
    const meta = JSON.parse((await fs.readFile(metaPath, 'utf8')).replace(/^\uFEFF/, ''));
    return meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {};
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

const writeMetaJson = async (meta) => {
  await fs.writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
};

const appendOrReplaceBgmLedger = async (candidate, selectionReason) => {
  const meta = await readMetaJson();
  const assets = Array.isArray(meta.assets) ? meta.assets : [];
  const withoutOldTrack = assets.filter((asset) => normalizeSlashes(String(asset?.file ?? '')) !== 'bgm/track.mp3');
  const entry = {
    file: 'bgm/track.mp3',
    source_site: candidate.source_site ?? 'dova-syndrome',
    source_url: candidate.source_url,
    title: candidate.title,
    composer: candidate.composer,
    license: candidate.license ?? DEFAULT_LICENSE,
    credit_required: candidate.credit_required ?? false,
    fetched_at: new Date().toISOString(),
    selection_reason: selectionReason,
  };

  meta.episode_id ??= episodeId;
  meta.assets = [...withoutOldTrack, entry];
  await writeMetaJson(meta);
};

const setScriptBgm = async (document, candidate) => {
  document.set('bgm', {
    source_url: candidate.source_url,
    file: 'bgm/track.mp3',
    license: candidate.license ?? DEFAULT_LICENSE,
    volume: 0.11,
    fade_in_sec: 1.0,
    fade_out_sec: 1.5,
  });
  await fs.writeFile(scriptPath, document.toString(), 'utf8');
};

const buildSearchTerms = (script) => {
  const sourceText = [script?.meta?.bgm_mood, script?.meta?.tone, script?.meta?.title, script?.meta?.audience]
    .filter((value) => typeof value === 'string')
    .join(' ');

  const weightedTerms = [];
  const add = (term, weight = 1) => {
    if (!weightedTerms.some((entry) => entry.term === term)) {
      weightedTerms.push({term, weight});
    }
  };

  const rules = [
    [/緊張|危機|怖|不安|詐欺|注意|警告|ミステリ|謎|不穏|serious|tense|mystery/i, '緊張感', 6],
    [/落ち着|穏やか|静か|夜|睡眠|安心|calm|quiet|ambient/i, '穏やか', 6],
    [/明る|軽快|楽しい|日常|前向き|ポップ|bright|happy|pop/i, '明るい', 5],
    [/実務|教育|解説|学習|知的|仕事|business|study|education/i, '解説', 4],
    [/サイバー|AI|自動化|未来|tech|cyber|digital/i, 'テクノ', 4],
    [/和風|日本|歴史|怪談|japanese/i, '和風', 3],
  ];

  for (const [pattern, term, weight] of rules) {
    if (pattern.test(sourceText)) {
      add(term, weight);
    }
  }

  add(String(script?.meta?.bgm_mood ?? '').trim().split(/[、,・\s]+/).find(Boolean) ?? '穏やか', 3);
  add('穏やか', 1);
  add('解説', 1);
  return weightedTerms.filter(({term}) => term).slice(0, 5);
};

const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'user-agent': 'Codex yukkuri-templates BGM selector',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new BgmSelectionError(`HTTP ${response.status} while fetching ${url}`);
  }
  return {
    text: await response.text(),
    response,
  };
};

const absolutize = (url) => {
  if (!url) {
    return null;
  }
  return new URL(htmlDecode(url), DOVA_BASE_URL).toString();
};

const parseDovaSearchResults = (html, searchTerm) => {
  const candidates = [];
  const blocks = html.match(/<div class="bgmlist">[\s\S]*?(?=<div class="bgmlist"|<div class="paging"|$)/g) ?? [];

  for (const block of blocks) {
    const detailMatch = block.match(/<div class="bgmlist-tracktitle">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a><span>by<a href="[^"]+">([\s\S]*?)<\/a><\/span>/);
    if (!detailMatch) {
      continue;
    }

    const sourceUrl = absolutize(detailMatch[1]);
    candidates.push({
      source_site: 'dova-syndrome',
      source_url: sourceUrl,
      title: stripTags(detailMatch[2]),
      composer: stripTags(detailMatch[3]),
      description: stripTags(block.match(/<div class="bgmlist-trackdetail">([\s\S]*?)<\/div>/)?.[1] ?? ''),
      tags: [...block.matchAll(/<span>([\s\S]*?)<\/span>/g)].map((match) => stripTags(match[1])).filter(Boolean),
      loop: /bgmlist-icoloop_yes/.test(block),
      dl_count: Number.parseInt(stripTags(block.match(/<div class="bgmlist-icodl">([\s\S]*?)<\/div>/)?.[1] ?? '0'), 10) || 0,
      search_term: searchTerm,
      license: DEFAULT_LICENSE,
      credit_required: false,
    });
  }

  return candidates;
};

const loadCandidatesFromEnv = async () => {
  const raw = process.env.BGM_CANDIDATES_JSON;
  if (!raw) {
    return null;
  }

  const json = raw.trim().startsWith('[') ? raw : await fs.readFile(path.resolve(rootDir, raw), 'utf8');
  const candidates = JSON.parse(json);
  if (!Array.isArray(candidates)) {
    throw new BgmSelectionError('BGM_CANDIDATES_JSON must be an array or a path to an array');
  }
  return candidates.map((candidate) => ({
    source_site: 'dova-syndrome',
    license: DEFAULT_LICENSE,
    credit_required: false,
    ...candidate,
  }));
};

const searchDovaCandidates = async (terms) => {
  const envCandidates = await loadCandidatesFromEnv();
  if (envCandidates) {
    return envCandidates;
  }

  const results = [];
  for (const {term} of terms) {
    const url = `${DOVA_BASE_URL}/bgm?keywords=${encodeURIComponent(term)}`;
    const {text} = await fetchText(url);
    results.push(...parseDovaSearchResults(text, term));
  }

  const seen = new Set();
  return results.filter((candidate) => {
    if (!candidate.source_url || seen.has(candidate.source_url)) {
      return false;
    }
    seen.add(candidate.source_url);
    return true;
  });
};

const scoreCandidate = (candidate, terms, script) => {
  const haystack = [
    candidate.title,
    candidate.composer,
    candidate.description,
    ...(Array.isArray(candidate.tags) ? candidate.tags : []),
  ]
    .filter(Boolean)
    .join(' ');
  let score = 0;

  for (const {term, weight} of terms) {
    if (new RegExp(escapeRegExp(term), 'i').test(haystack)) {
      score += weight * 10;
    }
  }

  if (candidate.loop) {
    score += 8;
  }
  if (/解説|教育|実務|注意|詐欺|安全/.test([script?.meta?.tone, script?.meta?.title, script?.meta?.bgm_mood].join(' '))) {
    if (/穏やか|冷静|慎ましい|普通の速さ|ピアノ|テクノ|不思議|緊張/.test(haystack)) {
      score += 6;
    }
  }
  score += Math.min(Number(candidate.dl_count ?? 0) / 1000, 5);
  return score;
};

const selectBestCandidate = (candidates, terms, script) => {
  const usable = candidates.filter((candidate) => candidate.source_url && candidate.title && candidate.composer);
  if (usable.length === 0) {
    throw new BgmSelectionError('No usable BGM candidates found');
  }

  return usable
    .map((candidate) => ({...candidate, score: scoreCandidate(candidate, terms, script)}))
    .sort((a, b) => b.score - a.score)[0];
};

const extractDovaDetail = async (candidate) => {
  if (candidate.download_url) {
    return candidate;
  }

  const {text} = await fetchText(candidate.source_url);
  const audioUrl = absolutize(text.match(/<source src="([^"]+)"/)?.[1]);
  const downloadPageUrl = absolutize(text.match(/href="([^"]+\/download)"/)?.[1]);
  const title = stripTags(text.match(/<h2 class="trialL-title">\s*([\s\S]*?)\s*<span>/)?.[1] ?? candidate.title);
  const composer = stripTags(text.match(/written by\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? candidate.composer);
  const comment = stripTags(text.match(/<p class="trialL-below_trackP">([\s\S]*?)<\/p>/)?.[1] ?? candidate.description ?? '');
  const tags = [...text.matchAll(/<div class="trialL-below_tags">([\s\S]*?)<\/div>/g)]
    .flatMap((match) => [...match[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((tag) => stripTags(tag[1])))
    .filter(Boolean);

  return {
    ...candidate,
    title,
    composer,
    description: comment || candidate.description,
    tags: tags.length > 0 ? tags : candidate.tags,
    download_page_url: downloadPageUrl,
    preview_audio_url: audioUrl,
  };
};

const responseCookies = (response) => {
  const getSetCookie = response.headers.getSetCookie?.();
  if (Array.isArray(getSetCookie) && getSetCookie.length > 0) {
    return getSetCookie.map((cookie) => cookie.split(';')[0]).join('; ');
  }

  const single = response.headers.get('set-cookie');
  return single ? single.split(',').map((cookie) => cookie.split(';')[0]).join('; ') : '';
};

const downloadViaDovaPost = async (candidate) => {
  if (!candidate.download_page_url) {
    return null;
  }

  const page = await fetchText(candidate.download_page_url);
  const csrf = page.text.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/)?.[1];
  const track = page.text.match(/<option value="([^"]+)"/)?.[1] ?? '1';
  if (!csrf) {
    return null;
  }

  const body = new URLSearchParams({csrfmiddlewaretoken: csrf, track});
  const response = await fetch(candidate.download_page_url, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Codex yukkuri-templates BGM selector',
      referer: candidate.download_page_url,
      cookie: responseCookies(page.response),
    },
    body,
  });

  if (!response.ok) {
    return null;
  }
  return Buffer.from(await response.arrayBuffer());
};

const readLocalOrFetch = async (url) => {
  if (!url) {
    return null;
  }

  if (url.startsWith('file://')) {
    return fs.readFile(new URL(url));
  }
  if (!/^https?:\/\//i.test(url)) {
    return fs.readFile(path.resolve(rootDir, url));
  }

  const response = await fetch(url, {
    headers: {'user-agent': 'Codex yukkuri-templates BGM selector'},
  });
  if (!response.ok) {
    throw new BgmSelectionError(`HTTP ${response.status} while downloading BGM`, {url});
  }
  return Buffer.from(await response.arrayBuffer());
};

const validateAudioBuffer = (buffer, candidate) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < MIN_BGM_BYTES) {
    throw new BgmSelectionError(`Downloaded BGM is too small: ${buffer?.length ?? 0} bytes`, {
      source_url: candidate.source_url,
      title: candidate.title,
    });
  }

  const header = buffer.subarray(0, 4).toString('latin1');
  const looksLikeAudio =
    header.startsWith('ID3') ||
    header.startsWith('RIFF') ||
    buffer[0] === 0xff ||
    header.includes('ftyp');
  if (!looksLikeAudio) {
    throw new BgmSelectionError('Downloaded BGM does not look like an audio file', {
      source_url: candidate.source_url,
      title: candidate.title,
    });
  }
};

const downloadCandidate = async (candidate) => {
  const detailed = await extractDovaDetail(candidate);
  const attempts = [
    ['download-page-post', () => downloadViaDovaPost(detailed)],
    ['candidate-download-url', () => readLocalOrFetch(detailed.download_url)],
    ['detail-preview-audio-url', () => readLocalOrFetch(detailed.preview_audio_url)],
  ];
  const failures = [];

  for (const [label, readBuffer] of attempts) {
    try {
      const buffer = await readBuffer();
      if (!buffer) {
        continue;
      }
      validateAudioBuffer(buffer, detailed);
      await fs.mkdir(path.dirname(bgmFile), {recursive: true});
      await fs.writeFile(bgmFile, buffer);
      return detailed;
    } catch (error) {
      failures.push({label, message: error.message});
    }
  }

  throw new BgmSelectionError('Could not download selected BGM from official source', {
    source_url: detailed.source_url,
    title: detailed.title,
    failures,
  });
};

const main = async () => {
  const document = await readScriptDocument();
  const script = document.toJS();

  if (!forceBgm && (await hasUsableExistingBgm(script))) {
    console.log(JSON.stringify({episodeId, status: 'skipped', reason: 'existing bgm.file is present'}, null, 2));
    return;
  }

  const terms = buildSearchTerms(script);
  const candidates = await searchDovaCandidates(terms);
  const selected = selectBestCandidate(candidates, terms, script);
  const detailed = await downloadCandidate(selected);
  const selectionReason = `meta.bgm_mood/title/toneから検索語「${terms.map(({term}) => term).join(' / ')}」を作り、候補内で一致度が最も高いBGMを選定`;

  await setScriptBgm(document, detailed);
  await appendOrReplaceBgmLedger(detailed, selectionReason);

  console.log(
    JSON.stringify(
      {
        episodeId,
        status: 'selected',
        file: 'bgm/track.mp3',
        title: detailed.title,
        composer: detailed.composer,
        source_url: detailed.source_url,
        selection_reason: selectionReason,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  if (error instanceof BgmSelectionError) {
    console.error(error.message);
    if (Object.keys(error.details).length > 0) {
      console.error(JSON.stringify(error.details, null, 2));
    }
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
