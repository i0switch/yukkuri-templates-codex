import fs from 'node:fs/promises';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {loadImagePromptPack} from './lib/load-image-prompt-pack.mjs';

const rootDir = process.cwd();
const episodeId = process.argv[2];

if (!episodeId) {
  throw new Error('Usage: node scripts/audit-generated-images.mjs <episode_id>');
}

const episodeDir = path.join(rootDir, 'script', episodeId);
const scriptPath = path.join(episodeDir, 'script.yaml');
const metaPath = path.join(episodeDir, 'meta.json');
const resultAuditPath = path.join(episodeDir, 'audits', 'image_result_audit.json');

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const pushIssue = (issues, level, code, message, details = {}) => {
  issues.push({level, code, message, details});
};

const readImageInfo = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return {
      type: 'png',
      bytes: buffer.length,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) {
        break;
      }
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          type: 'jpeg',
          bytes: buffer.length,
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + length;
    }
  }
  return {type: 'unknown', bytes: buffer.length, width: 0, height: 0};
};

const normalize = (value) => String(value ?? '').replaceAll('\\', '/');

const scoreValue = (row, field) => {
  const aliases = {
    script_match: ['台本一致'],
    dialogue_support: ['会話補強'],
    visibility: ['視認性'],
    screen_appeal: ['画面映え'],
    low_generic_feel: ['汎用感の低さ'],
    scene_fit: ['Scene適合', 'シーン適合'],
  };
  for (const key of [field, ...(aliases[field] ?? [])]) {
    if (typeof row?.[key] === 'number') {
      return row[key];
    }
  }
  return undefined;
};

const audit = async () => {
  await loadImagePromptPack(rootDir);
  const issues = [];
  const script = parseDocument(await fs.readFile(scriptPath, 'utf8')).toJS();
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  let resultAudit = null;
  try {
    resultAudit = JSON.parse(await fs.readFile(resultAuditPath, 'utf8'));
  } catch (error) {
    pushIssue(issues, 'error', 'missing-image-result-audit', 'generated images must have script/{episode_id}/audits/image_result_audit.json before render', {
      path: path.relative(rootDir, resultAuditPath).replaceAll('\\', '/'),
      error: error.message,
    });
  }

  const referencedImages = [];
  for (const scene of script.scenes ?? []) {
    for (const slot of ['main', 'sub']) {
      const content = scene?.[slot];
      if (content?.kind === 'image') {
        referencedImages.push({scene_id: scene.id, slot, asset: normalize(content.asset)});
      }
    }
  }

  const metaAssets = new Map();
  for (const asset of meta.assets ?? []) {
    if (isPlainObject(asset) && typeof asset.file === 'string') {
      metaAssets.set(normalize(asset.file), asset);
    }
  }

  const audits = new Map();
  const auditRows = Array.isArray(resultAudit?.images) ? resultAudit.images : Array.isArray(resultAudit) ? resultAudit : [];
  for (const row of auditRows) {
    if (isPlainObject(row) && typeof row.asset === 'string') {
      audits.set(normalize(row.asset), row);
    }
  }

  for (const image of referencedImages) {
    const asset = metaAssets.get(image.asset);
    const auditRow = audits.get(image.asset);
    if (!asset) {
      pushIssue(issues, 'error', 'missing-image-meta-entry', `${image.asset}: referenced image is missing from meta.json`);
      continue;
    }

    for (const field of ['image_direction', 'visual_type', 'supports_dialogue', 'supports_moment', 'imagegen_prompt']) {
      if (asset[field] === undefined || asset[field] === null || asset[field] === '') {
        pushIssue(issues, 'error', 'incomplete-generated-image-ledger', `${image.asset}: meta.json asset is missing ${field}`);
      }
    }

    if (!auditRow) {
      pushIssue(issues, 'error', 'missing-image-result-row', `${image.asset}: generated image result audit row is required`);
    } else {
      if (auditRow.scene_id !== image.scene_id) {
        pushIssue(issues, 'error', 'image-result-scene-mismatch', `${image.asset}: generated image audit scene_id must match the referenced scene`, {
          expected: image.scene_id,
          actual: auditRow.scene_id,
        });
      }
      if (auditRow.slot !== image.slot) {
        pushIssue(issues, 'error', 'image-result-slot-mismatch', `${image.asset}: generated image audit slot must match the referenced slot`, {
          expected: image.slot,
          actual: auditRow.slot,
        });
      }
      const verdict = String(auditRow.verdict ?? auditRow.判定 ?? '').toUpperCase();
      if (verdict !== 'PASS') {
        pushIssue(issues, 'error', 'failed-image-result-audit', `${image.asset}: generated image audit must be PASS`, {
          verdict,
          regeneration_plan: auditRow.regeneration_plan ?? auditRow.再生成方針,
        });
      }
      for (const field of ['script_match', 'dialogue_support', 'visibility', 'screen_appeal', 'low_generic_feel', 'scene_fit']) {
        const value = scoreValue(auditRow, field);
        if (typeof value !== 'number' || value < 7) {
          pushIssue(issues, 'error', 'weak-generated-image-score', `${image.asset}: ${field} must be a score of 7 or higher`, {
            value,
          });
        }
      }
    }

    try {
      const info = await readImageInfo(path.join(episodeDir, image.asset));
      if (info.width < 640 || info.height < 360 || info.bytes < 100_000) {
        pushIssue(issues, 'error', 'weak-generated-image-file', `${image.asset}: generated image is too small or weak for delivery`, info);
      }
    } catch (error) {
      pushIssue(issues, 'error', 'missing-generated-image-file', `${image.asset}: generated image file is missing`, {
        error: error.message,
      });
    }
  }

  const report = {
    ok: !issues.some((issue) => issue.level === 'error'),
    episode_id: episodeId,
    checked_at: new Date().toISOString(),
    image_count: referencedImages.length,
    result_audit_path: path.relative(rootDir, resultAuditPath).replaceAll('\\', '/'),
    issues,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 1;
  }
};

await audit();
