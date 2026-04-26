import fs from 'node:fs/promises';
import path from 'node:path';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';

const rootDir = process.cwd();
const scriptsDir = path.join(rootDir, 'scripts');
const scriptDir = path.join(rootDir, 'script');

const ALLOWED_HARDCODE_DIRS = new Set([
  path.join(scriptsDir, 'legacy'),
  path.join(scriptsDir, 'experimental'),
]);

const SUSPECT_FILENAME_PATTERNS = [
  /^create-.*episode.*\.mjs$/i,
  /^create-.*video.*\.mjs$/i,
  /^generate-.*episode.*\.mjs$/i,
  /^generate-.*video.*\.mjs$/i,
  /^build-.*episode.*\.mjs$/i,
  /^make-.*episode.*\.mjs$/i,
  /^make-.*video.*\.mjs$/i,
  /^seed-.*episode.*\.mjs$/i,
  /^scaffold-.*episode.*\.mjs$/i,
];

const ARRAY_DECL_PATTERNS = [
  {pattern: /(?:const|let|var)\s+episodes\s*=\s*\[/m, label: 'episodes = ['},
  {pattern: /(?:const|let|var)\s+topics\s*=\s*\[/m, label: 'topics = ['},
  {pattern: /(?:const|let|var)\s+scripts\s*=\s*\[/m, label: 'scripts = ['},
  {pattern: /export\s+(?:default\s+)?(?:const|let|var)?\s*episodes\s*=?\s*\[/m, label: 'export episodes = ['},
  {pattern: /export\s+(?:default\s+)?(?:const|let|var)?\s*topics\s*=?\s*\[/m, label: 'export topics = ['},
];

const SCRIPT_BODY_PATTERNS = [
  {pattern: /dialogue\s*:\s*\[/m, label: 'dialogue: ['},
  {pattern: /scene1\s*:\s*\[/m, label: 'scene1: [...]'},
  {pattern: /scenes\s*:\s*\[\s*\{[\s\S]*?dialogue\s*:\s*\[/m, label: 'scenes:[ {dialogue:[...]'},
  {pattern: /lines\s*:\s*\[\s*['"\[]/m, label: 'lines: [...]'},
];

const FILE_WRITE_PATTERNS = [
  {pattern: /writeFile\s*\([^)]*script\.yaml/m, label: 'writeFile(script.yaml)'},
  {pattern: /writeFile\s*\([^)]*script\.render\.json/m, label: 'writeFile(script.render.json)'},
  {pattern: /writeFile\s*\([^)]*script\.md/m, label: 'writeFile(script.md)'},
];

const ALLOWLIST_FILES = new Set([
  // 自身を含む「検出パターンを正規表現として参照するファイル」は誤検出回避のため除外。
  'validate-script-generation-route.mjs',
  'audit-script-quality.mjs',
  // build-episode は gate を呼び出すだけで台本本文をハードコードしない
  'build-episode.mjs',
]);

const fatalFindings = [];
const warnFindings = [];

const args = process.argv.slice(2);
const explicitEpisodes = args.filter((arg) => !arg.startsWith('--'));
const strictMode = args.includes('--strict') || explicitEpisodes.length > 0;

const isUnderAllowed = (filePath) => {
  for (const dir of ALLOWED_HARDCODE_DIRS) {
    if (filePath.startsWith(dir + path.sep)) {
      return true;
    }
  }
  return false;
};

const matchesSuspectName = (basename) => SUSPECT_FILENAME_PATTERNS.some((re) => re.test(basename));

const containsHardcodePatterns = (text) => {
  const arrayHits = ARRAY_DECL_PATTERNS.filter(({pattern}) => pattern.test(text)).map(({label}) => label);
  const bodyHits = SCRIPT_BODY_PATTERNS.filter(({pattern}) => pattern.test(text)).map(({label}) => label);
  const writeHits = FILE_WRITE_PATTERNS.filter(({pattern}) => pattern.test(text)).map(({label}) => label);
  // 台本ハードコードと判定する条件:
  //   (a) 配列宣言 + dialogue/scene1/lines などのセリフ系
  //   (b) writeFile(script.yaml/.md/.render.json) + dialogue/scene1/lines
  const hits = [];
  if (arrayHits.length > 0 && bodyHits.length > 0) {
    hits.push(...arrayHits, ...bodyHits);
  }
  if (writeHits.length > 0 && bodyHits.length > 0) {
    for (const label of writeHits) if (!hits.includes(label)) hits.push(label);
    for (const label of bodyHits) if (!hits.includes(label)) hits.push(label);
  }
  return hits;
};

const SCANNED_EXTENSIONS = new Set(['.mjs', '.cjs', '.js', '.ts', '.mts', '.cts']);

const walkScripts = async (dir) => {
  const result = [];
  let entries;
  try {
    entries = await fs.readdir(dir, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return result;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'lib') continue;
      result.push(...(await walkScripts(full)));
      continue;
    }
    const ext = path.extname(entry.name);
    if (!SCANNED_EXTENSIONS.has(ext)) continue;
    if (entry.name.endsWith('.d.ts')) continue;
    result.push(full);
  }
  return result;
};

const inspectGenerator = async (filePath) => {
  const basename = path.basename(filePath);
  if (ALLOWLIST_FILES.has(basename)) return;
  if (isUnderAllowed(filePath)) return;

  const content = await fs.readFile(filePath, 'utf8');
  const hits = containsHardcodePatterns(content);
  if (hits.length === 0) return;

  // suspect filename か writeFile 経路がある場合のみ fatal にする。
  // 単に dialogue/scene1 という単語を含むだけのテストやコメントを誤検出しないための二段ブロック。
  const writeFileHit = FILE_WRITE_PATTERNS.some(({pattern}) => pattern.test(content));
  const filenameSuspect = matchesSuspectName(basename);
  if (!writeFileHit && !filenameSuspect) {
    return;
  }

  fatalFindings.push({
    type: 'hardcoded-script-generator',
    file: path.relative(rootDir, filePath),
    detail: `ハードコード台本生成の疑い (${filenameSuspect ? 'suspect filename' : 'writeFile path'}): ${hits.join(', ')}`,
    suggestion: `scripts/legacy/ または scripts/experimental/ へ移動するか、_reference/script_prompt_pack 経由の生成に置き換えてください。`,
  });
};

const inspectAllGenerators = async () => {
  const files = await walkScripts(scriptsDir);
  for (const file of files) {
    await inspectGenerator(file);
  }
};

const checkPromptPack = async () => {
  try {
    await loadScriptPromptPack(rootDir, {silent: true});
  } catch (error) {
    fatalFindings.push({
      type: 'missing-prompt-pack',
      file: '_reference/script_prompt_pack/',
      detail: error.message ?? String(error),
      suggestion: '_reference/script_prompt_pack 配下の必須プロンプトを揃えてください。',
    });
  }
};

const inspectEpisodeIntegrity = async (episodeId) => {
  const dir = path.join(scriptDir, episodeId);
  const yamlPath = path.join(dir, 'script.yaml');
  const renderPath = path.join(dir, 'script.render.json');
  const mdPath = path.join(dir, 'script.md');

  const exists = async (p) => {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  };

  const dirExists = await exists(dir);
  const yamlExists = dirExists && (await exists(yamlPath));
  const renderExists = dirExists && (await exists(renderPath));
  const mdExists = dirExists && (await exists(mdPath));

  const isExplicit = explicitEpisodes.includes(episodeId);

  if (!dirExists) {
    if (isExplicit) {
      fatalFindings.push({
        type: 'episode-dir-missing',
        file: `script/${episodeId}/`,
        detail: `指定された episode ディレクトリが存在しない: ${dir}`,
        suggestion: `episode_id を確認してください。新規生成中なら _reference/script_prompt_pack/02_draft_prompt.md → 05_yaml_prompt.md を経由して script/${episodeId}/script.md と script.yaml を作成してください。`,
      });
    }
    return;
  }
  if (!yamlExists && !renderExists) {
    if (isExplicit) {
      fatalFindings.push({
        type: 'episode-script-missing',
        file: `script/${episodeId}/script.yaml`,
        detail: `script.yaml も script.render.json も無い空の episode ディレクトリ: ${dir}`,
        suggestion: 'prompt pack 経由で script.md → script.yaml を作成してください。',
      });
    }
    return;
  }
  const sink = (isExplicit || strictMode) ? fatalFindings : warnFindings;
  if (yamlExists && !mdExists) {
    sink.push({
      type: 'missing-script-md',
      file: `script/${episodeId}/script.md`,
      detail: 'script.yaml はあるが script.md が無い (prompt pack の draft フェーズを通っていない疑い)',
      suggestion: '_reference/script_prompt_pack/02_draft_prompt.md → 03_audit_prompt.md を経由して script.md を残してください。',
    });
  }
  if (renderExists && !yamlExists) {
    fatalFindings.push({
      type: 'render-without-yaml',
      file: `script/${episodeId}/script.render.json`,
      detail: 'script.yaml なしで script.render.json が存在する',
      suggestion: 'script.yaml を正本として再生成し、build-episode.mjs で render.json を再ビルドしてください。',
    });
  }
};

const inspectAllEpisodes = async () => {
  if (explicitEpisodes.length > 0) {
    for (const id of explicitEpisodes) {
      await inspectEpisodeIntegrity(id);
    }
    return;
  }
  let entries;
  try {
    entries = await fs.readdir(scriptDir, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith('ep')) continue;
    await inspectEpisodeIntegrity(entry.name);
  }
};

const main = async () => {
  await checkPromptPack();
  await inspectAllGenerators();
  await inspectAllEpisodes();

  const fail = fatalFindings.length > 0;
  const summary = {
    ok: !fail,
    mode: strictMode ? 'strict' : 'lenient',
    explicitEpisodes,
    fatal: fatalFindings,
    warnings: warnFindings,
    checked: {
      promptPack: '_reference/script_prompt_pack/',
      scriptsScanned: 'scripts/**/*.mjs (excluding legacy/experimental/lib/node_modules)',
      episodesScanned: explicitEpisodes.length > 0 ? explicitEpisodes : 'script/ep*',
    },
  };

  if (fail) {
    console.error(JSON.stringify(summary, null, 2));
    console.error('\nFAIL: 台本生成ルートが prompt pack 経由になっていません。上記の fatal を解消してください。');
    process.exit(1);
  } else {
    console.log(JSON.stringify(summary, null, 2));
    if (warnFindings.length > 0) {
      console.log(`\nOK (with ${warnFindings.length} warnings): 既存 episode の遺物が検出されました。新規生成では --strict / <episode_id> 引数で必ず FAIL に昇格させてください。`);
    } else {
      console.log('\nOK: prompt pack 必須ファイルそろい、危険なハードコード生成スクリプトと欠損も検出されませんでした。');
    }
  }
};

main().catch((error) => {
  console.error('validate-script-generation-route.mjs failed:', error.stack ?? error.message ?? error);
  process.exit(1);
});
