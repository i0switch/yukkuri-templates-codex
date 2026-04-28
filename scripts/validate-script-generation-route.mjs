import fs from 'node:fs/promises';
import path from 'node:path';
import {loadScriptPromptPack} from './lib/load-script-prompt-pack.mjs';
import {loadImagePromptPack} from './lib/load-image-prompt-pack.mjs';

const rootDir = process.cwd();
const scriptsDir = path.join(rootDir, 'scripts');
const IGNORED_SCRIPT_DIRS = new Set(['node_modules', '.git', 'legacy', 'experimental', 'oneoff']);

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const walk = async (dirPath) => {
  const files = [];
  for (const entry of await fs.readdir(dirPath, {withFileTypes: true})) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_SCRIPT_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...(await walk(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.mjs')) {
      files.push(entryPath);
    }
  }
  return files;
};

const countMatches = (text, pattern) => (text.match(pattern) ?? []).length;

const inspectScriptFile = async (filePath, issues) => {
  const source = await fs.readFile(filePath, 'utf8');
  const rel = path.relative(rootDir, filePath).replaceAll('\\', '/');
  const name = path.basename(filePath);
  if (/^test-.*\.mjs$/.test(name)) {
    return;
  }
  const hasConstEpisodes = /const\s+episodes\s*=\s*\[/.test(source);
  const hasHardcodedPlanCollection =
    /const\s+(episodePlans|sceneTitles|topics|plans)\s*=\s*\[/.test(source) ||
    /(?:^|[\s,{])sceneTitles\s*:\s*\[/.test(source) ||
    /function\s+getSceneLines\s*\(/.test(source) ||
    /const\s+getSceneLines\s*=/.test(source);
  const dialogueCount = countMatches(source, /dialogue\s*:\s*\[/g);
  const writesScriptYaml = /writeFile[\s\S]{0,160}script\.yaml/.test(source);
  const writesRenderJson = /writeFile[\s\S]{0,160}script\.render\.json/.test(source);
  const readsScriptMd = /script\.md/.test(source);
  const loadsPromptPack = /loadScriptPromptPack|script_prompt_pack/.test(source);

  if (/^create-.*episode.*\.mjs$/.test(name) && hasConstEpisodes && dialogueCount > 0) {
    pushIssue(issues, 'error', 'hardcoded-create-episode', 'create-*episode*.mjs に episodes/dialogue 直書きが残っています', {
      file: rel,
      dialogue_count: dialogueCount,
    });
  }

  if (/^create-.*video.*\.mjs$/.test(name) && dialogueCount > 0) {
    pushIssue(issues, 'error', 'hardcoded-create-video', 'create-*video*.mjs に dialogue 直書きが残っています', {
      file: rel,
      dialogue_count: dialogueCount,
    });
  }

  if (dialogueCount >= 3 && hasConstEpisodes && !rel.includes('/legacy/') && !rel.includes('/experimental/')) {
    pushIssue(issues, 'error', 'hardcoded-dialogue-generator', '本番 scripts 配下にセリフ配列を持つ生成器があります', {
      file: rel,
      dialogue_count: dialogueCount,
    });
  }

  if (writesScriptYaml && hasHardcodedPlanCollection && !loadsPromptPack && !rel.includes('/legacy/') && !rel.includes('/experimental/')) {
    pushIssue(issues, 'error', 'hardcoded-plan-generator', '本番 scripts 配下に構成・台本プランを直書きして script.yaml を作る生成器があります', {
      file: rel,
    });
  }

  if (writesScriptYaml && !loadsPromptPack && !readsScriptMd && name !== 'build-episode.mjs') {
    pushIssue(issues, 'error', 'yaml-without-prompt-pack', 'prompt pack / script.md を経由せず script.yaml を作る可能性があります', {
      file: rel,
    });
  }

  if (writesRenderJson && !readsScriptMd && name !== 'build-episode.mjs') {
    pushIssue(issues, 'error', 'render-json-without-script-md', 'script.md を経由せず script.render.json を作る可能性があります', {
      file: rel,
    });
  }

  if (/create-three-minute/i.test(name)) {
    pushIssue(issues, 'warning', 'legacy-three-minute-generator', 'create-three-minute-* 系は通常生成ルートに置かないでください', {
      file: rel,
    });
  }
};

const audit = async () => {
  const issues = [];
  await loadScriptPromptPack(rootDir);
  await loadImagePromptPack(rootDir);

  const files = await walk(scriptsDir);
  for (const filePath of files) {
    await inspectScriptFile(filePath, issues);
  }

  const report = {
    ok: !issues.some((issue) => issue.level === 'error'),
    checked_at: new Date().toISOString(),
    ignored_dirs: ['scripts/legacy', 'scripts/experimental', 'scripts/oneoff'],
    issues,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
