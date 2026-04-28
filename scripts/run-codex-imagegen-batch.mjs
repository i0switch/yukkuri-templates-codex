import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {parseDocument} from 'yaml';
import {loadImagePromptRegistry, promptFromRegistry} from './lib/image-prompt-registry.mjs';

const DEFAULT_PARALLEL = 3;
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;
const IMAGEGEN_ROOT = path.join(process.env.USERPROFILE ?? process.env.HOME ?? '', '.codex', 'generated_images');
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const CODEX_IMAGEGEN_PROMPT = ({episodeId, sceneId, slot, imagegenPrompt}) => `あなたは画像生成専門アシスタントです。

【厳守】
- 使うツールは image_gen だけ。
- shell / PowerShell / Bash / Read / Write / Apply / web / python など、画像生成以外のツールは絶対に使わない。
- プロジェクトファイルを読みに行かない。
- 1回の実行で生成する画像は1枚だけ。
- グリッド、sprite sheet、asset sheet、複数画像、切り出し前提の画像を生成しない。
- 生成画像は Codex の image_gen が保存する。ファイルコピーや保存先操作はしない。
- 完了後は最終行に [ALL_DONE] ${episodeId}/${sceneId}.${slot} とだけ出力する。

【画像生成プロンプト】
${imagegenPrompt}
`;

const usage = () => {
  console.log(`Usage: node scripts/run-codex-imagegen-batch.mjs <episode_id> [--parallel=3] [--only=s01,s02] [--retry-failed] [--force] [--timeout-ms=1200000] [--dry-run]`);
};

const parseArgs = (argv) => {
  const options = {
    parallel: DEFAULT_PARALLEL,
    only: null,
    retryFailed: false,
    force: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    dryRun: false,
  };
  let episodeId = null;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }
    if (arg.startsWith('--parallel=')) {
      options.parallel = Number.parseInt(arg.slice('--parallel='.length), 10);
      continue;
    }
    if (arg.startsWith('--only=')) {
      options.only = new Set(
        arg
          .slice('--only='.length)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      );
      continue;
    }
    if (arg === '--retry-failed') {
      options.retryFailed = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = Number.parseInt(arg.slice('--timeout-ms='.length), 10);
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (!episodeId) {
      episodeId = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!episodeId) {
    usage();
    process.exit(1);
  }
  if (!Number.isInteger(options.parallel) || options.parallel < 1 || options.parallel > 8) {
    throw new Error('--parallel must be an integer from 1 to 8');
  }
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 60_000) {
    throw new Error('--timeout-ms must be at least 60000');
  }

  return {episodeId, options};
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const normalize = (value) => String(value ?? '').replaceAll('\\', '/');
const sha256Text = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sha256File = async (filePath) => crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const readJsonIfExists = async (filePath, fallback) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
};

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const runPromptAudit = ({rootDir, episodeId, allowFailure = false}) => {
  const result = spawnSync(process.execPath, ['scripts/audit-image-prompts.mjs', episodeId], {
    cwd: rootDir,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.error) {
    throw result.error;
  }
  const jsonStart = result.stdout.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`audit:image-prompts did not return JSON:\n${result.stdout}\n${result.stderr}`);
  }
  const report = JSON.parse(result.stdout.slice(jsonStart));
  if (report.ok !== true && !allowFailure) {
    throw new Error(
      [
        `Refusing to run imagegen for ${episodeId}.`,
        'audit:image-prompts reported errors; fix imagegen_prompt first.',
        JSON.stringify(report.issues ?? [], null, 2),
      ].join('\n'),
    );
  }
  return report;
};

const registryRefCandidates = ({sceneId, ref}) => {
  const candidates = [];
  if (typeof ref === 'string' && ref.trim() !== '') {
    candidates.push(ref.trim());
    const hashIndex = ref.indexOf('#');
    if (hashIndex !== -1) {
      candidates.push(ref.slice(hashIndex + 1));
    }
  }
  candidates.push(`${sceneId}.main`, sceneId);
  return [...new Set(candidates.filter(Boolean))];
};

const registryPromptForScene = ({registry, sceneId, promptRef}) => {
  for (const ref of registryRefCandidates({sceneId, ref: promptRef})) {
    const prompt = promptFromRegistry(registry, ref);
    if (prompt) {
      return prompt;
    }
  }

  const prompts = registry?.prompts;
  if (Array.isArray(prompts)) {
    const entry = prompts.find((item) => isPlainObject(item) && item.scene_id === sceneId && (item.slot ?? 'main') === 'main');
    if (typeof entry?.imagegen_prompt === 'string') {
      return entry.imagegen_prompt;
    }
  }

  return '';
};

const collectJobs = async ({episodeDir}) => {
  const yamlPath = path.join(episodeDir, 'script.yaml');
  const doc = parseDocument(await fs.readFile(yamlPath, 'utf8'));
  const script = doc.toJS();
  const registry = await loadImagePromptRegistry(episodeDir);

  if (!Array.isArray(script?.scenes)) {
    throw new Error('script.yaml scenes must be an array');
  }

  const jobs = [];
  for (const scene of script.scenes) {
    const sceneId = scene?.id;
    const content = scene?.main;
    if (typeof sceneId !== 'string' || sceneId.trim() === '') {
      continue;
    }
    if (content?.kind !== 'image') {
      continue;
    }

    const plan = Array.isArray(scene.visual_asset_plan) ? scene.visual_asset_plan.find((item) => item?.slot === 'main') ?? scene.visual_asset_plan[0] : null;
    const asset = normalize(content.asset);
    const imagegenPrompt =
      registryPromptForScene({registry, sceneId, promptRef: plan?.imagegen_prompt_ref}) ||
      (typeof plan?.imagegen_prompt === 'string' ? plan.imagegen_prompt : '') ||
      (typeof content?.asset_requirements?.imagegen_prompt === 'string' ? content.asset_requirements.imagegen_prompt : '');

    if (!imagegenPrompt) {
      throw new Error(`${sceneId}: missing imagegen_prompt`);
    }

    jobs.push({
      sceneId,
      slot: 'main',
      file: asset,
      destAbs: path.join(episodeDir, asset),
      promptSha256: sha256Text(imagegenPrompt),
      imagegenPrompt,
      purpose: typeof plan?.purpose === 'string' && plan.purpose.trim() ? plan.purpose : 'script_final直投げ型の挿入画像',
      adoptionReason: typeof plan?.adoption_reason === 'string' && plan.adoption_reason.trim() ? plan.adoption_reason : 'sceneの要点に一致',
    });
  }

  return jobs;
};

const manifestEntries = (manifest) => {
  if (Array.isArray(manifest?.images)) {
    return manifest.images;
  }
  if (Array.isArray(manifest?.generated_images)) {
    return manifest.generated_images;
  }
  if (Array.isArray(manifest?.entries)) {
    return manifest.entries;
  }
  return [];
};

const manifestFile = (entry) => normalize(entry?.file ?? entry?.destination ?? entry?.saved_path ?? entry?.asset ?? '');
const manifestSource = (entry) => String(entry?.source_url ?? entry?.generation_id ?? entry?.generated_id ?? '').trim();

const isCompleteExistingJob = async ({job, meta, manifest}) => {
  if (!(await fileExists(job.destAbs))) {
    return false;
  }
  const asset = Array.isArray(meta?.assets) ? meta.assets.find((item) => normalize(item?.file) === job.file) : null;
  if (!asset || asset.source_type !== 'imagegen' || asset.generation_tool !== 'codex-imagegen' || asset.rights_confirmed !== true) {
    return false;
  }
  if (asset.scene_id !== job.sceneId || (asset.slot ?? 'main') !== job.slot || asset.imagegen_prompt !== job.imagegenPrompt) {
    return false;
  }
  const source = String(asset.source_url ?? asset.generation_id ?? '').trim();
  if (!source) {
    return false;
  }
  const entry = manifestEntries(manifest).find((item) => manifestFile(item) === job.file || (item?.scene_id === job.sceneId && (item?.slot ?? 'main') === job.slot));
  return Boolean(entry && manifestSource(entry) === source && entry.prompt_sha256 === job.promptSha256);
};

const previousFailedScenes = async (reportPath) => {
  const report = await readJsonIfExists(reportPath, null);
  if (!report || !Array.isArray(report.jobs)) {
    return new Set();
  }
  return new Set(report.jobs.filter((job) => job.status === 'failed').map((job) => job.scene_id).filter(Boolean));
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, {recursive: true});
};

const collectStrings = (value, strings = []) => {
  if (typeof value === 'string') {
    strings.push(value);
    return strings;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, strings);
    }
    return strings;
  }
  if (isPlainObject(value)) {
    for (const item of Object.values(value)) {
      collectStrings(item, strings);
    }
  }
  return strings;
};

const extractSessionIds = (jsonl) => {
  const ids = new Set();
  for (const line of jsonl.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }
    try {
      for (const value of collectStrings(JSON.parse(line))) {
        for (const match of value.matchAll(UUID_RE)) {
          ids.add(match[0]);
        }
      }
    } catch {
      for (const match of line.matchAll(UUID_RE)) {
        ids.add(match[0]);
      }
    }
  }
  return [...ids];
};

const listPngFiles = async (dir) => {
  const files = [];
  try {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await listPngFiles(fullPath)));
      } else if (entry.isFile() && /\.png$/i.test(entry.name)) {
        const stat = await fs.stat(fullPath);
        files.push({path: fullPath, mtimeMs: stat.mtimeMs, name: entry.name});
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  return files;
};

const findGeneratedImage = async ({sessionIds, startedAtMs, finishedAtMs, usedSources}) => {
  const sessionCandidates = [];
  for (const sessionId of sessionIds) {
    const sessionDir = path.join(IMAGEGEN_ROOT, sessionId);
    const files = await listPngFiles(sessionDir);
    sessionCandidates.push(
      ...files
        .filter((file) => file.mtimeMs >= startedAtMs - 5000 && !usedSources.has(file.path))
        .map((file) => ({...file, sessionId})),
    );
  }

  if (sessionCandidates.length === 1) {
    return sessionCandidates[0];
  }
  if (sessionCandidates.length > 1) {
    throw new Error(`Multiple generated PNG candidates found for session: ${sessionCandidates.map((item) => item.path).join(', ')}`);
  }

  const allCandidates = (await listPngFiles(IMAGEGEN_ROOT)).filter(
    (file) => file.mtimeMs >= startedAtMs - 5000 && file.mtimeMs <= finishedAtMs + 5000 && !usedSources.has(file.path),
  );
  if (allCandidates.length === 1) {
    return allCandidates[0];
  }
  if (allCandidates.length === 0) {
    throw new Error('No generated PNG candidate found');
  }
  throw new Error(`Multiple fallback PNG candidates found: ${allCandidates.map((item) => item.path).join(', ')}`);
};

const runCodexImagegenJob = async ({rootDir, episodeId, job, logDir, timeoutMs, usedSources}) => {
  const startedAt = new Date();
  const startedAtMs = Date.now();
  const safeName = `${job.sceneId}_${job.slot}`;
  const stdoutLogPath = path.join(logDir, `${safeName}.jsonl`);
  const stderrLogPath = path.join(logDir, `${safeName}.stderr.txt`);
  const lastMessagePath = path.join(logDir, `${safeName}.last.txt`);
  const codexBin = process.platform === 'win32' ? process.execPath : 'codex';
  const codexScript = process.platform === 'win32'
    ? path.join(process.env.APPDATA ?? '', 'npm', 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
    : null;
  const args = [
    ...(codexScript ? [codexScript] : []),
    'exec',
    '--json',
    '--ignore-rules',
    '--sandbox',
    'read-only',
    '--cd',
    rootDir,
    '--output-last-message',
    lastMessagePath,
    '-',
  ];

  const prompt = CODEX_IMAGEGEN_PROMPT({episodeId, sceneId: job.sceneId, slot: job.slot, imagegenPrompt: job.imagegenPrompt});
  let stdout = '';
  let stderr = '';

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(codexBin, args, {
      cwd: rootDir,
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve(124);
    }, timeoutMs);

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve(code ?? 1);
    });
    child.stdin.end(prompt);
  });

  await fs.writeFile(stdoutLogPath, stdout, 'utf8');
  await fs.writeFile(stderrLogPath, stderr, 'utf8');

  const finishedAt = new Date();
  if (exitCode !== 0) {
    throw new Error(`codex exec failed with exit code ${exitCode}; see ${normalize(path.relative(rootDir, stderrLogPath))}`);
  }

  const sessionIds = extractSessionIds(stdout);
  const generated = await findGeneratedImage({
    sessionIds,
    startedAtMs,
    finishedAtMs: finishedAt.getTime(),
    usedSources,
  });

  usedSources.add(generated.path);
  await ensureDir(path.dirname(job.destAbs));
  await fs.copyFile(generated.path, job.destAbs);

  const sourceUrl = generated.sessionId
    ? `codex://generated_images/${generated.sessionId}/${path.basename(generated.path)}`
    : `codex://generated_images/${normalize(path.relative(IMAGEGEN_ROOT, generated.path))}`;

  return {
    status: 'generated',
    scene_id: job.sceneId,
    slot: job.slot,
    file: job.file,
    source_path: generated.path,
    source_url: sourceUrl,
    original_file: path.basename(generated.path),
    prompt_sha256: job.promptSha256,
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    log: normalize(path.relative(rootDir, stdoutLogPath)),
    stderr_log: normalize(path.relative(rootDir, stderrLogPath)),
    session_ids: sessionIds,
  };
};

const mapLimit = async (items, limit, worker) => {
  const results = new Array(items.length);
  let nextIndex = 0;
  const runners = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
};

const updateLedgers = async ({episodeDir, jobsByFile, generatedResults}) => {
  const metaPath = path.join(episodeDir, 'meta.json');
  const manifestPath = path.join(episodeDir, 'imagegen_manifest.json');
  const meta = await readJsonIfExists(metaPath, {});
  const manifest = await readJsonIfExists(manifestPath, {version: 1, images: []});
  const successFiles = new Set(generatedResults.map((result) => result.file));

  const nextAssets = Array.isArray(meta.assets) ? meta.assets.filter((asset) => !successFiles.has(normalize(asset?.file))) : [];
  for (const result of generatedResults) {
    const job = jobsByFile.get(result.file);
    nextAssets.push({
      file: result.file,
      type: 'image',
      source_type: 'imagegen',
      generation_tool: 'codex-imagegen',
      source_url: result.source_url,
      rights_confirmed: true,
      license: 'AI generated by codex-imagegen for this episode',
      scene_id: result.scene_id,
      slot: result.slot,
      purpose: job.purpose,
      adoption_reason: job.adoptionReason,
      imagegen_prompt: job.imagegenPrompt,
      original_file: result.original_file,
    });
  }
  meta.assets = nextAssets;

  const preservedManifestEntries = manifestEntries(manifest).filter((entry) => !successFiles.has(manifestFile(entry)));
  manifest.version = manifest.version ?? 1;
  manifest.images = [
    ...preservedManifestEntries,
    ...generatedResults.map((result) => ({
      scene_id: result.scene_id,
      slot: result.slot,
      file: result.file,
      source_url: result.source_url,
      original_file: result.original_file,
      prompt_sha256: result.prompt_sha256,
    })),
  ];
  delete manifest.generated_images;
  delete manifest.entries;

  await writeJson(metaPath, meta);
  await writeJson(manifestPath, manifest);
};

const assertNoDuplicateGeneratedImages = async ({episodeDir, jobs}) => {
  const hashes = new Map();
  const duplicates = [];
  for (const job of jobs) {
    if (!(await fileExists(job.destAbs))) {
      continue;
    }
    const hash = await sha256File(job.destAbs);
    if (hashes.has(hash)) {
      duplicates.push({hash, files: [hashes.get(hash), job.file]});
    } else {
      hashes.set(hash, job.file);
    }
  }
  if (duplicates.length > 0) {
    throw new Error(`Duplicate generated image bytes detected: ${JSON.stringify(duplicates)}`);
  }
};

const main = async () => {
  const {episodeId, options} = parseArgs(process.argv.slice(2));
  const rootDir = path.join(import.meta.dirname, '..');
  const episodeDir = path.join(rootDir, 'script', episodeId);
  const reportPath = path.join(episodeDir, '.imagegen-batch-report.json');
  const logDir = path.join(episodeDir, 'audits', 'imagegen_batch');

  await fs.stat(episodeDir);
  const auditReport = runPromptAudit({rootDir, episodeId, allowFailure: options.dryRun});
  const allJobs = await collectJobs({episodeDir});
  const meta = await readJsonIfExists(path.join(episodeDir, 'meta.json'), null);
  const manifest = await readJsonIfExists(path.join(episodeDir, 'imagegen_manifest.json'), null);
  const failedScenes = options.retryFailed ? await previousFailedScenes(reportPath) : null;

  const jobs = [];
  const skipped = [];
  for (const job of allJobs) {
    if (options.only && !options.only.has(job.sceneId)) {
      skipped.push({...job, status: 'skipped', reason: 'not in --only'});
      continue;
    }
    if (options.retryFailed && !failedScenes.has(job.sceneId)) {
      skipped.push({...job, status: 'skipped', reason: 'not failed in previous report'});
      continue;
    }
    if (!options.force && (await isCompleteExistingJob({job, meta, manifest}))) {
      skipped.push({...job, status: 'skipped', reason: 'existing image and ledgers are complete'});
      continue;
    }
    jobs.push(job);
  }

  await ensureDir(logDir);
  const startedAt = new Date().toISOString();
  const report = {
    ok: false,
    episode_id: episodeId,
    started_at: startedAt,
    finished_at: null,
    parallel: options.parallel,
    dry_run: options.dryRun,
    audit_image_prompts_ok: auditReport.ok === true,
    total_jobs: allJobs.length,
    selected_jobs: jobs.length,
    skipped: skipped.map((job) => ({scene_id: job.sceneId, slot: job.slot, file: job.file, status: job.status, reason: job.reason})),
    jobs: [],
    issues: [],
  };
  if (auditReport.ok !== true) {
    report.issues.push({
      level: 'warning',
      code: 'image-prompt-audit-failed',
      message: 'dry-run continued after audit:image-prompts errors; fix these before real imagegen',
      audit_issues: auditReport.issues ?? [],
    });
  }

  if (options.dryRun) {
    report.ok = auditReport.ok === true;
    report.finished_at = new Date().toISOString();
    report.jobs = jobs.map((job) => ({scene_id: job.sceneId, slot: job.slot, file: job.file, status: 'dry-run', prompt_sha256: job.promptSha256}));
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const usedSources = new Set();
  const jobsByFile = new Map(jobs.map((job) => [job.file, job]));
  const results = await mapLimit(jobs, options.parallel, async (job) => {
    try {
      const result = await runCodexImagegenJob({rootDir, episodeId, job, logDir, timeoutMs: options.timeoutMs, usedSources});
      console.log(`[imagegen] ${job.sceneId}: generated ${result.file}`);
      return result;
    } catch (error) {
      console.error(`[imagegen] ${job.sceneId}: FAIL ${error.message}`);
      return {
        status: 'failed',
        scene_id: job.sceneId,
        slot: job.slot,
        file: job.file,
        prompt_sha256: job.promptSha256,
        error: error.message,
      };
    }
  });

  const generatedResults = results.filter((result) => result.status === 'generated');
  const failedResults = results.filter((result) => result.status === 'failed');
  if (generatedResults.length > 0) {
    await updateLedgers({episodeDir, jobsByFile, generatedResults});
  }

  try {
    await assertNoDuplicateGeneratedImages({episodeDir, jobs: allJobs});
  } catch (error) {
    report.issues.push({level: 'error', code: 'duplicate-image-file', message: error.message});
  }

  report.jobs = results;
  report.finished_at = new Date().toISOString();
  report.ok = failedResults.length === 0 && !report.issues.some((issue) => issue.level === 'error');
  if (failedResults.length > 0) {
    report.issues.push({
      level: 'error',
      code: 'failed-imagegen-jobs',
      message: `${failedResults.length} imagegen job(s) failed`,
      scenes: failedResults.map((result) => result.scene_id),
    });
  }

  await writeJson(reportPath, report);
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await main();
