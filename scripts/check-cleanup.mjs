import fs from 'node:fs/promises';
import path from 'node:path';

const rootArg = process.argv.find((arg) => arg.startsWith('--root='));
const rootDir = rootArg ? path.resolve(process.cwd(), rootArg.slice('--root='.length)) : process.cwd();

const SCAN_ROOTS = ['', 'scripts', 'tmp', '.cache'];
const EXCLUDED_REL_PREFIXES = ['scripts/oneoff/'];
const SCRIPT_EXT_RE = /\.(mjs|js|cjs|ts|tsx|py|ps1)$/i;
const TEMP_NAME_RE = /(^\.?tmp[_-])|(^temp[_-])|(^scratch[_-])|(^debug[_-])|(^test-run[_-])/i;
const EPISODE_ONEOFF_RE = /^(create|fix|generate|regenerate|patch|trim|refresh)-?ep[\w-]*\.(mjs|js|cjs|ts|py|ps1)$/i;

const normalize = (value) => value.replaceAll('\\', '/');

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const isExcluded = (relPath) => EXCLUDED_REL_PREFIXES.some((prefix) => relPath.startsWith(prefix));

const isCandidate = (relPath) => {
  if (isExcluded(relPath)) {
    return false;
  }
  const name = path.basename(relPath);
  if (!SCRIPT_EXT_RE.test(name)) {
    return false;
  }
  return TEMP_NAME_RE.test(name) || EPISODE_ONEOFF_RE.test(name);
};

const walk = async (dir) => {
  const out = [];
  if (!(await exists(dir))) {
    return out;
  }
  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = normalize(path.relative(rootDir, abs));
    if (entry.isDirectory()) {
      if (rel === 'node_modules' || rel === '.git' || rel === 'out' || rel === 'script' || rel === 'public' || isExcluded(`${rel}/`)) {
        continue;
      }
      out.push(...(await walk(abs)));
      continue;
    }
    if (entry.isFile() && isCandidate(rel)) {
      out.push(rel);
    }
  }
  return out;
};

const candidates = [];
for (const relRoot of SCAN_ROOTS) {
  candidates.push(...(await walk(path.join(rootDir, relRoot))));
}

const uniqueCandidates = [...new Set(candidates)].sort();
const report = {
  ok: uniqueCandidates.length === 0,
  checked_roots: SCAN_ROOTS.map((root) => root || '.'),
  ignored: EXCLUDED_REL_PREFIXES,
  candidates: uniqueCandidates,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
