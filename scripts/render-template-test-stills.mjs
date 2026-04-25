import fs from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'out', 'test-stills');
const sceneIds = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
];
const pairIds = ['RM', 'ZM'];

await fs.mkdir(outputDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: path.join(rootDir, 'src', 'index.ts'),
  onProgress: (progress) => {
    if (progress === 1) {
      console.log('Bundle complete');
    }
  },
});

const browser = await openBrowser('chrome', {
  logLevel: 'warn',
});

try {
  for (const sceneId of sceneIds) {
    for (const pairId of pairIds) {
      const compositionId = `TemplateTest-${sceneId}-${pairId}`;
      const outputPath = path.join(outputDir, `scene-${sceneId}-${pairId.toLowerCase()}-test.png`);
      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        puppeteerInstance: browser,
        logLevel: 'warn',
      });

      console.log(`Rendering ${compositionId} -> ${outputPath}`);
      await renderStill({
        serveUrl,
        composition,
        output: outputPath,
        frame: 0,
        imageFormat: 'png',
        overwrite: true,
        puppeteerInstance: browser,
        logLevel: 'warn',
      });
    }
  }
} finally {
  await browser.close({silent: true});
}

console.log(JSON.stringify({outputDir, count: sceneIds.length * pairIds.length}, null, 2));
