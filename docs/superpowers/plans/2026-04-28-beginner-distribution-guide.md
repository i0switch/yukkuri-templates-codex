# Beginner Distribution Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public guide `index.html` with a one-page beginner onboarding guide that includes setup, usage, prompt examples, manual-script flow, self-provided-image flow, and the existing template gallery.

**Architecture:** This is a static HTML update only. The existing guide images remain in place and are referenced by the new page; no image regeneration or app-code changes are needed.

**Tech Stack:** Static HTML/CSS, existing PNG guide assets, repository docs as source of truth.

---

## File Structure

- Modify: `C:/Users/i0swi/Desktop/ナレッジ/ryudos-product-hub/public/yukkuri-zundamon-generator/guide/index.html`
  - Responsibility: one-page public guide for complete beginners.
  - Must include all onboarding sections and the existing 21 template cards.
- Read-only reference: `docs/superpowers/specs/2026-04-28-beginner-distribution-guide-design.md`
  - Responsibility: approved design requirements.
- Read-only reference: `docs/pipeline_contract.md`
  - Responsibility: authoritative pipeline, artifact, license/provenance, and completion rules.
- Read-only reference: `docs/RUNBOOK_VIDEO_GENERATION.md`
  - Responsibility: short command/run order.

No new permanent scripts are needed. Do not create helper scripts for this task.

---

### Task 1: Replace the static guide HTML

**Files:**
- Modify: `C:/Users/i0swi/Desktop/ナレッジ/ryudos-product-hub/public/yukkuri-zundamon-generator/guide/index.html`

- [ ] **Step 1: Confirm the target file exists and is the existing template guide**

Use the Read tool on:

```text
C:/Users/i0swi/Desktop/ナレッジ/ryudos-product-hub/public/yukkuri-zundamon-generator/guide/index.html
```

Expected: the file starts with `<!doctype html>`, title `テンプレート一覧ガイド`, and contains `scene-01-rm-guide.png` through `scene-21-rm-guide.png`.

- [ ] **Step 2: Replace the full HTML with the beginner guide**

Use the Write tool to overwrite the same file with this complete content:

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ゆっくり・ずんだもん動画生成ガイド</title>
  <style>
    :root {
      color-scheme: light;
      font-family: "Yu Gothic", "Meiryo", system-ui, sans-serif;
      background: #eef3f8;
      color: #172033;
      --card: #ffffff;
      --ink-soft: #536173;
      --line: #d9e2ee;
      --blue: #2563eb;
      --blue-dark: #1e3a8a;
      --green: #047857;
      --yellow-bg: #fff7d6;
      --yellow-line: #f4d35e;
      --red-bg: #ffe9e9;
      --red-line: #f28b82;
      --code-bg: #101827;
      --code-ink: #eef7ff;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 32rem),
        linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%);
    }

    a {
      color: var(--blue);
    }

    header {
      padding: 44px 24px 28px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.92);
    }

    .hero,
    main {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--blue-dark);
      font-weight: 700;
      letter-spacing: 0.08em;
      font-size: 13px;
    }

    h1 {
      margin: 0;
      font-size: clamp(30px, 4vw, 48px);
      line-height: 1.18;
    }

    .lead {
      max-width: 780px;
      margin: 14px 0 0;
      color: var(--ink-soft);
      font-size: 16px;
      line-height: 1.8;
    }

    .quickStart {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .quickCard,
    section,
    .templateCard {
      border: 1px solid var(--line);
      background: var(--card);
      border-radius: 18px;
      box-shadow: 0 14px 36px rgba(23, 32, 51, 0.08);
    }

    .quickCard {
      padding: 16px;
    }

    .quickCard strong {
      display: block;
      margin-bottom: 6px;
      color: var(--blue-dark);
    }

    .quickCard p {
      margin: 0;
      color: var(--ink-soft);
      font-size: 13px;
      line-height: 1.6;
    }

    nav {
      width: min(1180px, calc(100% - 32px));
      margin: 18px auto 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    nav a {
      padding: 9px 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #ffffff;
      color: #243044;
      font-size: 13px;
      text-decoration: none;
    }

    main {
      padding: 24px 0 52px;
      display: grid;
      gap: 18px;
    }

    section {
      padding: 24px;
    }

    h2 {
      margin: 0 0 14px;
      font-size: 24px;
      line-height: 1.3;
    }

    h3 {
      margin: 22px 0 8px;
      font-size: 18px;
    }

    p,
    li {
      color: #2d3a4e;
      line-height: 1.8;
    }

    p {
      margin: 0 0 12px;
    }

    ol,
    ul {
      margin: 8px 0 0;
      padding-left: 1.25rem;
    }

    .twoColumn {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .miniCard {
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: #f8fbff;
    }

    .miniCard h3 {
      margin-top: 0;
    }

    .note,
    .warning,
    .danger {
      margin: 14px 0;
      padding: 14px 16px;
      border-radius: 14px;
      line-height: 1.8;
    }

    .note {
      border: 1px solid #a7d8c2;
      background: #eafaf2;
    }

    .warning {
      border: 1px solid var(--yellow-line);
      background: var(--yellow-bg);
    }

    .danger {
      border: 1px solid var(--red-line);
      background: var(--red-bg);
    }

    code {
      padding: 0.12em 0.34em;
      border-radius: 6px;
      background: #edf2f7;
      color: #172033;
      font-family: Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
    }

    pre {
      overflow-x: auto;
      margin: 12px 0 0;
      padding: 16px;
      border-radius: 14px;
      background: var(--code-bg);
      color: var(--code-ink);
      line-height: 1.65;
      white-space: pre-wrap;
    }

    pre code {
      padding: 0;
      background: transparent;
      color: inherit;
      font-size: 14px;
    }

    .templateGrid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .templateCard {
      overflow: hidden;
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

    .templateMeta {
      padding: 13px 14px 15px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .templateMeta h3 {
      margin: 0;
      font-size: 18px;
      white-space: nowrap;
    }

    .templateMeta p {
      margin: 0;
      color: var(--ink-soft);
      font-size: 12px;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .checklist li {
      margin-bottom: 6px;
    }

    @media (max-width: 860px) {
      .quickStart,
      .twoColumn {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 520px) {
      header {
        padding: 34px 18px 22px;
      }

      .hero,
      main,
      nav {
        width: min(100% - 24px, 1180px);
      }

      section {
        padding: 18px;
      }

      .templateMeta {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
      }

      .templateMeta p {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="hero">
      <p class="eyebrow">ZIP配布版・初心者向け</p>
      <h1>ゆっくり・ずんだもん動画生成ガイド</h1>
      <p class="lead">このページは、配布されたフォルダから動画を書き出すまでの手順を、上から順番に進められるようにまとめたガイドです。Gitは使わず、Windowsをメインに説明します。</p>
      <div class="quickStart" aria-label="最短手順">
        <div class="quickCard"><strong>1. ZIPを展開</strong><p>日本語や空白が少ない場所にフォルダを置きます。</p></div>
        <div class="quickCard"><strong>2. npm install</strong><p>PowerShellでフォルダを開いて初回だけ実行します。</p></div>
        <div class="quickCard"><strong>3. 音声を起動</strong><p>ずんだもんはVOICEVOX、ゆっくりはAquesTalk系を準備します。</p></div>
        <div class="quickCard"><strong>4. AIに依頼</strong><p>プロンプトをClaude Codeへ貼って完成まで進めます。</p></div>
      </div>
    </div>
    <nav aria-label="目次">
      <a href="#what">できること</a>
      <a href="#setup">セットアップ</a>
      <a href="#workflow">使い方</a>
      <a href="#prompt">プロンプト例</a>
      <a href="#manual-script">自作台本</a>
      <a href="#own-images">自前画像</a>
      <a href="#trouble">トラブル</a>
      <a href="#templates">テンプレ一覧</a>
    </nav>
  </header>

  <main>
    <section id="what">
      <h2>1. このアプリでできること</h2>
      <p>テーマをAIに渡すだけで、台本、画像設計、音声、Remotion動画書き出しまで進めるための動画生成テンプレート集です。</p>
      <ul class="checklist">
        <li>ゆっくり解説（霊夢・魔理沙）または、ずんだもん解説（ずんだもん・四国めたん）を作れます。</li>
        <li>21種類の画面テンプレートから、動画の見た目を選べます。</li>
        <li>Codexの画像生成を使う流れと、自分で画像を用意する流れの両方に対応しています。</li>
        <li>自分で書いた台本を元に、動画用の成果物へ整える流れにも対応しています。</li>
      </ul>
      <div class="note">完成動画は基本的に <code>out/videos/{episode_id}.mp4</code> に出ます。AIが作業する途中成果物は <code>script/{episode_id}/</code> にまとまります。</div>
    </section>

    <section id="setup">
      <h2>2. 初回セットアップ</h2>
      <h3>ZIPを展開する</h3>
      <ol>
        <li>配布されたZIPを右クリックして展開します。</li>
        <li>おすすめの置き場所は <code>C:\yukkuri-templates</code> や <code>C:\Users\あなたの名前\Desktop\yukkuri-templates</code> です。</li>
        <li>フォルダを開いて、<code>package.json</code> が見える場所が作業フォルダです。</li>
      </ol>
      <div class="warning">Macでも動かせる可能性はありますが、このガイドはWindowsメインです。MacではPowerShell部分をターミナルに読み替え、音声ソフトの対応状況を確認してください。</div>

      <h3>必要なもの</h3>
      <div class="twoColumn">
        <div class="miniCard">
          <h3>導入済み前提</h3>
          <ul>
            <li>Claudeアプリ</li>
            <li>Claude Code</li>
            <li>Codexアプリ版、またはCodex CLI</li>
          </ul>
          <p>入っていない場合は、先にそれぞれの公式手順でログインまで済ませてください。</p>
        </div>
        <div class="miniCard">
          <h3>追加で必要</h3>
          <ul>
            <li>Node.js / npm</li>
            <li>VOICEVOX（ずんだもん音声）</li>
            <li>AquesTalk系のゆっくり音声環境</li>
            <li>Chrome（Remotionの描画で使います）</li>
          </ul>
        </div>
      </div>

      <h3>PowerShellで初回インストール</h3>
      <p>展開したフォルダをエクスプローラーで開き、アドレスバーに <code>powershell</code> と入力してEnterを押すと、その場所でPowerShellを開けます。</p>
      <pre><code>npm install</code></pre>
      <p>これは初回だけでOKです。終わるまで数分かかることがあります。</p>

      <h3>音声ソフトの注意</h3>
      <div class="warning">ずんだもん動画を作る時は、生成前にVOICEVOXを起動しておきます。このアプリは通常 <code>http://127.0.0.1:50021</code> のVOICEVOXエンジンへ接続します。</div>
      <div class="danger">VOICEVOX、ずんだもん、四国めたん、AquesTalk系の音声は、それぞれ利用規約やクレジット表記の条件があります。YouTube収益化や商用利用をする場合は、必ず各音声ソフトとキャラクターのライセンスを確認してください。</div>
    </section>

    <section id="workflow">
      <h2>3. 実際の使い方</h2>
      <ol>
        <li>VOICEVOXなど必要な音声ソフトを起動します。</li>
        <li>Claude Codeでこのフォルダを開きます。</li>
        <li>下のプロンプト例を貼ります。</li>
        <li>AIが <code>planning.md</code>、<code>script_draft.md</code>、<code>script_final.md</code> を作ります。</li>
        <li><code>script_final.md</code> のレビュー後、<code>script.yaml</code>、画像、音声、動画書き出しへ進みます。</li>
        <li>最後にgate、render、video auditまで通ったら完成です。</li>
      </ol>
      <div class="note">「完成まで自動で決定して進めて」と書くと、細かい判断をAIに任せやすくなります。ただし、ライセンス確認や自分で用意した素材の権利確認は利用者側で行ってください。</div>
    </section>

    <section id="prompt">
      <h2>4. AIに投げるプロンプト例</h2>
      <p>そのままコピペして、テーマやテンプレート名だけ変えれば使えます。</p>
      <pre><code>2分程度の動画を生成してください。
ゆっくりで生成してください。
使用したいテンプレはscene-12_classroom-bubbles.md
使用するテンプレートは必ず厳守してください。

ジャンル
AI副業で失敗する人の共通点

ツール集めで満足、商品設計なし、集客導線なし。
フック：「AIを使えば稼げる、と思った人から脱落します」

既存の台本は流用しないでください。
image genスキルを使用して画像の生成を実施してください。
動画書き出しはHDでお願いします。

完成まで自動で決定して進めて。</code></pre>

      <h3>変える場所</h3>
      <ul>
        <li><strong>動画の長さ:</strong> <code>2分程度</code>、<code>5分程度</code> のように指定します。</li>
        <li><strong>キャラ:</strong> <code>ゆっくり</code> または <code>ずんだもん</code> と書きます。</li>
        <li><strong>テンプレ:</strong> 下のテンプレート一覧からファイル名を選びます。</li>
        <li><strong>ジャンル:</strong> 動画のテーマを書きます。</li>
        <li><strong>フック:</strong> 冒頭で視聴者を止める一言を書きます。</li>
        <li><strong>画像:</strong> Codexで作るなら <code>image genスキルを使用</code>、自分で作るなら「画像は自分で用意します」と書きます。</li>
        <li><strong>解像度:</strong> <code>HD</code> は1280×720、<code>FullHD</code> は1920×1080の意味で使います。</li>
      </ul>
    </section>

    <section id="manual-script">
      <h2>5. 自分の台本をそのまま使いたい場合</h2>
      <p>自作台本がある場合は、AIに「この台本を元に動画化して」と渡せます。仕組み上は、原文を保存してから動画用に整える流れになっています。</p>
      <pre><code>自作台本を使って動画を生成してください。
以下の台本を原文として保存し、内容を崩さずに動画用へ整えてください。
キャラはずんだもんでお願いします。
テンプレートはscene-12_classroom-bubbles.mdを使ってください。
画像は自分で用意します。
動画書き出しはHDでお願いします。

ここに自分の台本を貼る</code></pre>
      <ul>
        <li>原文は <code>script/{episode_id}/source_manual_script.md</code> に残す流れです。</li>
        <li>AIは <code>planning.md</code>、<code>script_draft.md</code>、<code>script_final.md</code> を作ります。</li>
        <li><code>script_final.md</code> のレビューが終わるまで、YAML化、画像、音声、レンダーには進みません。</li>
        <li>自分の台本を使う場合でも、gate、render、video auditが通るまで完成扱いにはしません。</li>
      </ul>
    </section>

    <section id="own-images">
      <h2>6. Codexなしで画像を自分で用意したい場合</h2>
      <p>Codexが使えない、または別の画像生成ツールを使いたい場合は、AIに画像プロンプトだけ作らせて、画像そのものは自分で用意できます。</p>
      <pre><code>画像はCodexで生成せず、自分で用意します。
各シーン用の画像生成プロンプトをimage_prompt_v2.mdに作ってください。
画像の保存先ファイル名も指定してください。
画像を保存したら、その画像をuser_generatedとして受け入れて動画化してください。</code></pre>
      <ol>
        <li>AIに <code>image_prompt_v2.md</code> を作らせます。</li>
        <li>ChatGPT Images、Midjourney、Canvaなど任意のツールで画像を作ります。</li>
        <li>画像を <code>script/{episode_id}/assets/s01_main.png</code> のように保存します。</li>
        <li>AIに「画像を保存しました。権利確認済みです」と伝えます。</li>
        <li>AIが <code>meta.json</code> に <code>source_type: "user_generated"</code> として記録します。</li>
      </ol>
      <div class="danger">自分で用意した画像は、生成ツール名、利用権利、ライセンス確認が必要です。placeholder、fallback、local card、出所不明画像は正式素材として使わないでください。</div>
    </section>

    <section id="trouble">
      <h2>7. トラブル時の見方</h2>
      <div class="twoColumn">
        <div class="miniCard">
          <h3>VOICEVOXに繋がらない</h3>
          <p>VOICEVOXアプリを起動してから再実行します。ずんだもん動画では <code>127.0.0.1:50021</code> に接続できる必要があります。</p>
        </div>
        <div class="miniCard">
          <h3>画像が足りない</h3>
          <p><code>script/{episode_id}/assets/</code> に指定されたPNGがあるか確認します。自前画像の場合はファイル名が一致しているか見ます。</p>
        </div>
        <div class="miniCard">
          <h3>完成と言われない</h3>
          <p><code>gate:episode</code>、動画書き出し、<code>audit:video</code> が終わっていない可能性があります。MP4があるだけでは完成扱いではありません。</p>
        </div>
        <div class="miniCard">
          <h3>画面テンプレが違う</h3>
          <p>プロンプトに「使用するテンプレートは必ず厳守」と書き、下の一覧から正しいファイル名を指定してください。</p>
        </div>
      </div>
    </section>

    <section id="templates">
      <h2>8. テンプレート一覧</h2>
      <p>クリックするとプレビュー画像を別タブで開けます。プロンプトでは、カード下のファイル名をそのまま指定してください。</p>
      <div class="templateGrid">
        <article class="templateCard"><a class="imageLink" href="scene-01-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-01-rm-guide.png" alt="Scene01 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene01</h3><p>scene-01_watercolor-frame.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-02-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-02-rm-guide.png" alt="Scene02 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene02</h3><p>scene-02_gray-3panel.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-03-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-03-rm-guide.png" alt="Scene03 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene03</h3><p>scene-03_black-3panel.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-04-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-04-rm-guide.png" alt="Scene04 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene04</h3><p>scene-04_whiteboard-desk.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-05-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-05-rm-guide.png" alt="Scene05 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene05</h3><p>scene-05_geometric-subtitle.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-06-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-06-rm-guide.png" alt="Scene06 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene06</h3><p>scene-06_mech-panel.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-07-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-07-rm-guide.png" alt="Scene07 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene07</h3><p>scene-07_laboratory-glass.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-08-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-08-rm-guide.png" alt="Scene08 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene08</h3><p>scene-08_japanese-room-tag.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-09-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-09-rm-guide.png" alt="Scene09 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene09</h3><p>scene-09_cinema-bar.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-10-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-10-rm-guide.png" alt="Scene10 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene10</h3><p>scene-10_mono-3panel.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-11-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-11-rm-guide.png" alt="Scene11 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene11</h3><p>scene-11_whiteboard-ui.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-12-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-12-rm-guide.png" alt="Scene12 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene12</h3><p>scene-12_classroom-bubbles.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-13-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-13-rm-guide.png" alt="Scene13 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene13</h3><p>scene-13_dark-3panel.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-14-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-14-rm-guide.png" alt="Scene14 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene14</h3><p>scene-14_multilayer-glass.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-15-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-15-rm-guide.png" alt="Scene15 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene15</h3><p>scene-15_sakura-night.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-16-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-16-rm-guide.png" alt="Scene16 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene16</h3><p>scene-16_sf-3stack-dark.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-17-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-17-rm-guide.png" alt="Scene17 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene17</h3><p>scene-17_sf-3stack-mid.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-18-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-18-rm-guide.png" alt="Scene18 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene18</h3><p>scene-18_mountain-scenery.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-19-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-19-rm-guide.png" alt="Scene19 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene19</h3><p>scene-19_whiteboard-desk-2.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-20-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-20-rm-guide.png" alt="Scene20 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene20</h3><p>scene-20_rainbow-glass.md</p></div></article>
        <article class="templateCard"><a class="imageLink" href="scene-21-rm-guide.png" target="_blank" rel="noreferrer"><img src="scene-21-rm-guide.png" alt="Scene21 guide image" loading="lazy"></a><div class="templateMeta"><h3>Scene21</h3><p>scene-21_ui-decoration.md</p></div></article>
      </div>
    </section>
  </main>
</body>
</html>
```

- [ ] **Step 3: Read back the file and verify key sections**

Use the Read tool on the target file.

Expected: file contains these strings:

```text
ゆっくり・ずんだもん動画生成ガイド
ZIP配布版・初心者向け
AIに投げるプロンプト例
自分の台本をそのまま使いたい場合
Codexなしで画像を自分で用意したい場合
テンプレート一覧
scene-21_ui-decoration.md
```

- [ ] **Step 4: Verify all template image references exist in the HTML**

Use the Grep tool with pattern:

```text
scene-[0-9]{2}-rm-guide\.png
```

Path:

```text
C:/Users/i0swi/Desktop/ナレッジ/ryudos-product-hub/public/yukkuri-zundamon-generator/guide/index.html
```

Expected: matches include `scene-01-rm-guide.png` through `scene-21-rm-guide.png`. Each appears twice because each card has an `href` and an `img src`.

- [ ] **Step 5: Check the referenced PNG files exist**

Use Glob with pattern:

```text
scene-*-rm-guide.png
```

Path:

```text
C:/Users/i0swi/Desktop/ナレッジ/ryudos-product-hub/public/yukkuri-zundamon-generator/guide
```

Expected: 21 PNG files are returned.

- [ ] **Step 6: Run a lightweight repository status check**

Run:

```bash
rtk git status --short
```

Expected: existing repository changes may be present. Confirm the new spec and plan files are visible if untracked, and note that the public `index.html` target is outside the repository worktree so it may not appear in this git status.

- [ ] **Step 7: Report completion without claiming video/app runtime verification**

Tell the user:

```text
ガイドHTMLを指定先に更新しました。既存テンプレ画像21枚を参照した1ページ完結ガイドになっています。ブラウザでの目視確認は未実施なので、開いて見た目を確認してください。
```

Do not commit unless the user explicitly asks for a commit.

---

## Self-Review

- Spec coverage: setup, ZIP distribution, Windows main/Mac note, Git unnecessary, prompt example, manual script flow, self-provided image flow, troubleshooting, and template gallery are all covered in Task 1 Step 2.
- Placeholder scan: no TBD/TODO/fill-in placeholders are present.
- Scope check: this is a single static HTML update; no separate subsystem plan is needed.
- Testing: read-back, grep, and file-existence checks cover the static requirements. Browser visual verification is intentionally left to the user because visual companion/browser review was declined.
