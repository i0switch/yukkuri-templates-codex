import fs from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'out', 'template-guide');
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

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const loadTemplateNames = async () => {
  const templateDir = path.join(rootDir, 'templates');
  const entries = await fs.readdir(templateDir);
  const names = new Map();

  for (const entry of entries) {
    const match = entry.match(/^scene-(\d{2})_.+\.md$/);
    if (match) {
      names.set(match[1], entry);
    }
  }

  return names;
};

const renderGuideImages = async () => {
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
      const compositionId = `TemplateGuide-${sceneId}-RM`;
      const outputPath = path.join(outputDir, `scene-${sceneId}-rm-guide.png`);
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
  } finally {
    await browser.close({silent: true});
  }
};

const writeHtml = async () => {
  const templateNames = await loadTemplateNames();
  const cards = sceneIds
    .map((sceneId) => {
      const sceneName = `Scene${sceneId}`;
      const templateName = templateNames.get(sceneId) ?? `scene-${sceneId}_unknown.md`;
      const imageName = `scene-${sceneId}-rm-guide.png`;

      return `
        <article class="card">
          <a class="imageLink" href="${escapeHtml(imageName)}" target="_blank" rel="noreferrer">
            <img src="${escapeHtml(imageName)}" alt="${escapeHtml(sceneName)} guide image" loading="lazy">
          </a>
          <div class="meta">
            <h2>${escapeHtml(sceneName)}</h2>
            <p>${escapeHtml(templateName)}</p>
          </div>
        </article>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>テンプレート一覧ガイド</title>
  <style>
    :root {
      color-scheme: light;
      font-family: "Yu Gothic", "Meiryo", system-ui, sans-serif;
      background: #f4f6f8;
      color: #18202a;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f4f6f8;
    }

    header {
      padding: 28px 32px 18px;
      border-bottom: 1px solid #d9dee7;
      background: #ffffff;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      line-height: 1.25;
    }

    header p {
      margin: 0;
      color: #5d6876;
      font-size: 14px;
    }

    main {
      width: min(1760px, 100%);
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 18px;
    }

    .card {
      overflow: hidden;
      border: 1px solid #d9dee7;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 8px 22px rgba(24, 32, 42, 0.08);
    }

    .imageLink {
      display: block;
      background: #dfe5ec;
      aspect-ratio: 16 / 9;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .meta {
      padding: 12px 14px 14px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      white-space: nowrap;
    }

    .meta p {
      margin: 0;
      color: #647282;
      font-size: 12px;
      text-align: right;
      overflow-wrap: anywhere;
    }

    @media (max-width: 520px) {
      header {
        padding: 22px 18px 14px;
      }

      main {
        padding: 14px;
        grid-template-columns: 1fr;
      }

      .meta {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
      }

      .meta p {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>テンプレート一覧ガイド</h1>
    <p>RM表示のみ。画像、サブ、タイトル、字幕の各エリアを確認するための補助HTML。</p>
  </header>
  <main>
${cards}
  </main>
</body>
</html>
`;

  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
};

await renderGuideImages();
await writeHtml();

const generatedImages = (await fs.readdir(outputDir)).filter((entry) => entry.endsWith('-rm-guide.png'));

console.log(
  JSON.stringify(
    {
      outputDir,
      html: path.join(outputDir, 'index.html'),
      imageCount: generatedImages.length,
    },
    null,
    2,
  ),
);
