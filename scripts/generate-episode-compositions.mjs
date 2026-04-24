import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const scriptDir = path.join(rootDir, 'script');
const outputPath = path.join(rootDir, 'src', 'generated', 'episode-compositions.ts');

const toImportName = (episodeId) =>
  episodeId
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[^a-zA-Z]+/, 'episode');

const episodeDirs = await fs.readdir(scriptDir, {withFileTypes: true});
const episodes = [];

for (const entry of episodeDirs) {
  if (!entry.isDirectory()) {
    continue;
  }

  const renderJsonPath = path.join(scriptDir, entry.name, 'script.render.json');
  try {
    await fs.access(renderJsonPath);
    episodes.push({
      id: entry.name,
      importName: toImportName(entry.name),
      importPath: `../../script/${entry.name}/script.render.json`,
    });
  } catch {
    // Skip episodes that have not been built yet.
  }
}

episodes.sort((a, b) => a.id.localeCompare(b.id));

const lines = [
  "import {loadEpisodeRenderData} from '../lib/load-script';",
  ...episodes.map((episode) => `import ${episode.importName} from '${episode.importPath}';`),
  '',
  'export const episodeCompositions = [',
  ...episodes.map((episode) => `  loadEpisodeRenderData(${episode.importName}),`),
  '];',
  '',
];

await fs.writeFile(outputPath, `${lines.join('\n')}`, 'utf8');
console.log(JSON.stringify({episodes: episodes.map((episode) => episode.id), outputPath}, null, 2));
