#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {parse, stringify} from 'yaml';

const SCRIPT_DIR = path.resolve(import.meta.dirname, '..', 'script');

const episodes = await fs.readdir(SCRIPT_DIR);

let migrated = 0;
let skipped = 0;
const mixed = [];

for (const ep of episodes) {
  const yamlPath = path.join(SCRIPT_DIR, ep, 'script.yaml');
  let raw;
  try {
    raw = await fs.readFile(yamlPath, 'utf8');
  } catch {
    continue;
  }

  const doc = parse(raw);
  if (!doc || !Array.isArray(doc.scenes) || doc.scenes.length === 0) {
    skipped++;
    continue;
  }

  const usedTemplates = [...new Set(doc.scenes.map((scene) => scene?.scene_template).filter(Boolean))];
  const existingTemplate = doc.meta?.layout_template ?? doc.meta?.scene_template;
  const chosenTemplate = existingTemplate ?? usedTemplates[0];

  if (!chosenTemplate) {
    skipped++;
    continue;
  }

  if (usedTemplates.length > 1) {
    mixed.push({ep, usedTemplates, chosen: chosenTemplate});
  }

  doc.meta = {layout_template: chosenTemplate, ...doc.meta};
  delete doc.meta.scene_template;
  delete doc.meta.allow_duplicate_templates;

  for (const scene of doc.scenes) {
    if (scene && typeof scene === 'object') {
      delete scene.scene_template;
    }
  }

  const output = stringify(doc, {lineWidth: 0, defaultStringType: 'PLAIN', defaultKeyType: 'PLAIN'});
  await fs.writeFile(yamlPath, output, 'utf8');
  migrated++;
}

console.log(`\nMigration complete: ${migrated} updated, ${skipped} skipped\n`);

if (mixed.length > 0) {
  console.log('Episodes that had mixed templates; the chosen whole-video layout_template was used:');
  for (const {ep, usedTemplates, chosen} of mixed) {
    console.log(`  ${ep}: [${usedTemplates.join(', ')}] -> ${chosen}`);
  }
}
