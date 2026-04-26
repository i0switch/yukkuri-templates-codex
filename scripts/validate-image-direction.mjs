#!/usr/bin/env node
// 軽量 lint: script.yaml 内の image scene すべてに image_direction が存在するかだけ確認する。
// 詳細監査は audit-image-prompts.mjs に任せる。
//
// Usage:
//   node scripts/validate-image-direction.mjs <episode_id>

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parse as parseYaml} from 'yaml';

const ROOT = process.cwd();

async function main() {
  const epIds = process.argv.slice(2);
  if (epIds.length === 0) {
    console.error('Usage: node scripts/validate-image-direction.mjs <episode_id>');
    process.exit(2);
  }

  let fail = false;
  for (const epId of epIds) {
    const scriptPath = path.join(ROOT, 'script', epId, 'script.yaml');
    let script;
    try {
      const text = await readFile(scriptPath, 'utf8');
      script = parseYaml(text);
    } catch (e) {
      console.error(`!! ${epId}: ${e.message}`);
      fail = true;
      continue;
    }

    const missing = [];
    let imageCount = 0;
    for (const scene of script.scenes ?? []) {
      for (const slot of ['main', 'sub']) {
        const obj = scene?.[slot];
        if (!obj || obj.kind !== 'image') continue;
        imageCount += 1;
        if (!obj.image_direction || typeof obj.image_direction !== 'object') {
          missing.push(`${scene.id}/${slot}`);
        }
      }
    }

    if (imageCount === 0) {
      console.log(`${epId}: image scene が無いのでスキップ`);
      continue;
    }
    if (missing.length > 0) {
      console.error(`!! ${epId}: image_direction 欠落 (${missing.length}/${imageCount})`);
      for (const m of missing) console.error(`  - ${m}`);
      fail = true;
    } else {
      console.log(`${epId}: image_direction OK (${imageCount} scenes)`);
    }
  }

  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(`validate-image-direction error: ${e?.message ?? e}`);
  process.exit(2);
});
