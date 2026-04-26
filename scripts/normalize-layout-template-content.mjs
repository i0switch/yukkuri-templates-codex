#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {parse, stringify} from 'yaml';

const scriptDir = path.resolve(import.meta.dirname, '..', 'script');
const subCapableTemplates = new Set(['Scene02', 'Scene03', 'Scene10', 'Scene13', 'Scene14']);
const titleCapableTemplates = new Set(['Scene04', 'Scene08', 'Scene12', 'Scene15', 'Scene16', 'Scene17', 'Scene19']);

const normalizeEpisode = (doc) => {
  if (!doc?.meta?.layout_template || !Array.isArray(doc.scenes)) {
    return false;
  }

  const template = doc.meta.layout_template;
  let changed = false;

  for (const scene of doc.scenes) {
    if (!scene || typeof scene !== 'object') {
      continue;
    }

    if (!titleCapableTemplates.has(template) && scene.title_text !== undefined) {
      delete scene.title_text;
      changed = true;
    }

    if (!subCapableTemplates.has(template) && scene.sub !== null) {
      scene.sub = null;
      changed = true;
    }
  }

  return changed;
};

let yamlUpdated = 0;
let jsonUpdated = 0;

for (const episode of await fs.readdir(scriptDir)) {
  const episodeDir = path.join(scriptDir, episode);
  const yamlPath = path.join(episodeDir, 'script.yaml');
  const jsonPath = path.join(episodeDir, 'script.render.json');

  try {
    const raw = await fs.readFile(yamlPath, 'utf8');
    const doc = parse(raw);
    if (normalizeEpisode(doc)) {
      const output = stringify(doc, {lineWidth: 0, defaultStringType: 'PLAIN', defaultKeyType: 'PLAIN'});
      await fs.writeFile(yamlPath, output, 'utf8');
      yamlUpdated++;
    }
  } catch {
  }

  try {
    const raw = await fs.readFile(jsonPath, 'utf8');
    const doc = JSON.parse(raw);
    if (normalizeEpisode(doc)) {
      await fs.writeFile(jsonPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
      jsonUpdated++;
    }
  } catch {
  }
}

console.log(JSON.stringify({yamlUpdated, jsonUpdated}, null, 2));
