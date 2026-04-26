---
name: yukkuri-codex-imagegen
description: Generate scene assets for ゆっくり / ずんだもん 解説動画 via Codex CLI's built-in image_gen tool. Use when CLAUDE.md "Image Engine Workflow" resolves to codex-imagegen, when generating scene main/sub assets for `script/<episode_id>/assets/`, or when the user requests scene-by-scene image production for a yukkuri video. Triggers on "imagegen", "codex で画像", "シーン画像生成", "asset 生成".
---

# Yukkuri Codex Imagegen

Codex CLI 経由で動画シーン素材を生成するスキル。
このリポジトリの `script/{episode_id}/assets/` に置く `s01_main.png` 系の素材を作る。

## Hard Rules

1. 起動前に `codex login status` で `Logged in using ChatGPT` を確認する。未認証なら `codex login` を案内して停止する。
2. `OPENAI_API_KEY` は **不要**。Codex CLI built-in `image_gen` tool は ChatGPT OAuth で動く。CLI fallback (`scripts/image_gen.py`) は使わない。
3. 生成画像はまず `~/.codex/generated_images/<session-id>/ig_<hash>.png` に保存される。これが正しい挙動。
4. プロジェクト assets への配置は、生成完了後に **Claude / 後段スクリプト側で copy** する。Codex agent に shell 経由で copy/move を頼んでも Windows 環境では `CreateProcessAsUserW failed: 5` で失敗するので無駄。
5. 1 タスク = 1 画像生成。バッチ処理が必要なら for ループで複数回起動する（**直列必須**、画像対応付け確保のため）。
6. **`imagegen_prompt` は `_reference/image_prompt_pack/` を通して作る**。caption から直接プロンプトを書くのは禁止。フローは `01_IMAGE_DIRECTION_PROMPT.md` → `02_IMAGEGEN_PROMPT_PROMPT.md` → `03_IMAGE_PROMPT_AUDIT.md`（55点ゲート）→ FAIL なら `04_IMAGE_REWRITE_PROMPT.md` → PASS で `node scripts/audit-image-prompts.mjs <episode_id>` 機械監査。`run-codex-imagegen-pwsh.mjs` は冒頭でこの機械監査を再呼出するので bypass 不可（バイパスは `YUKKURI_SKIP_IMAGE_GATE=1` のみ、サイレント設定禁止）。
7. 各 image slot には `image_direction`（16フィールド）と `asset_requirements.imagegen_prompt` を必ず入れる。`image_direction` なしの画像生成は失敗扱い。
8. プロンプトには **構図 → スタイル → 色・照明 → アスペクト・解像度感 → 文字方針 → 禁止** の順を入れ、必須キーワード「前景」「中景」「背景」「下部20%」「Remotion」「禁止」を本文にすべて含める（`_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md` の固定文ブロックを必ず適用）。
9. fallback / placeholder image を完了扱いにしない。3回リトライしても失敗したシーンは素材生成未完了として停止する。ユーザー確認なしに NotebookLM / text-fallback / bullets へ降格しない。ユーザーが明示承認した場合だけ、別フローで text-fallback 等へ移る。画像未完成のまま MP4 生成へ進まない。
10. 生成後は `node scripts/audit-generated-images.mjs <episode_id>` でメタ監査（PNG サイズ・解像度・重複・meta.json 必須フィールド）と、`_reference/image_prompt_pack/05_IMAGE_RESULT_AUDIT.md` の LLM 監査を必ず実行する。
11. `meta.json` の `assets[]` には `generator: "Codex (imagegen)"`, `imagegen_prompt`, `imagegen_model: "gpt-image-2"` を必ず記録する。
12. **Windows でのバッチ実行は `scripts/run-codex-imagegen-pwsh.mjs` を使う**。Node→`pwsh.exe`(windowsHide:true)→`codex exec` の3段で cmd ポップアップを完全回避（2026-04-26 確認済み）。
13. **`codex-companion.mjs` 経由のスクリプト（`run-codex-imagegen-batch.mjs` 等）は使用禁止**。windowsHide:true を指定しても cmd ウィンドウがユーザー画面にポップアップするため。
14. multi-line プロンプトは pwsh の here-string `@'...'@` で渡す。`codex exec "<argv>"` で multi-line を直接渡すと shell が改行で切るため壊れる。
15. PowerShell スクリプトは一時 `.ps1` ファイル経由で渡す（`pwsh -File`）。`pwsh -Command -` の stdin 方式は環境によって動作しない事例あり。

## プロンプト品質ルール（必須）

### 構成順（変更なし）
構図 → スタイル → 色・照明 → アスペクト・解像度感 → 文字方針 → 禁止

### 構図ルール（image_direction 準拠）
- `dialogue_role` と `image_should_support` で、どの会話の山を補強する画像か明示する
- `visual_type` は hook_poster / boke_visual / tsukkomi_visual / myth_vs_fact / danger_simulation / before_after / three_step_board / checklist_panel / ranking_board / ui_mockup_safe / flowchart_scene / contrast_card / meme_like_diagram / mini_story_scene / final_action_card から選ぶ
- `composition_type` は `_reference/image_prompt_pack/archetypes/composition_type_catalog.md` から選ぶ
- 前景・中景・背景をそれぞれ別役割にし、白背景中央アイコンだけにしない
- 下部20%は字幕とキャラ用に空け、Remotion で正確な文字を重ねる余白を残す

### スタイルルール（強化版）
- スタイルを1語で終わらせない：「フラット」ではなく「clean flat vector illustration, bold outlines 3px, geometric shapes」
- RM(霊夢・魔理沙): 「clean flat vector, bold geometric shapes, cool blue-teal palette (#00BCD4 #1976D2), laboratory/data aesthetic, bright highlights on white bg」
- ZM(ずんだもん・めたん): 「soft flat illustration, gentle rounded shapes, warm coral-pink palette (#FF7043 #EC407A), explanatory diagram feel, soft shadows, light bg」
- SFテーマ(ZM)許可: 「flat sci-fi illustration, deep space bg (#0D1B2A), neon accent teal (#00E5FF), glowing edges」

### 照明・質感ルール（新規）
- 照明を明示する：「top-left rim light, soft ambient fill, slight gradient from #F5F5F5 to #E8E8E8 background」
- キャラなし: 光源は1つ、背景グラデは微細（差10%以内）
- 質感: アイコン系→「flat matte, no texture」 水彩系→「watercolor wash texture, visible brushstrokes」

### 文字方針
- 画像内文字は最大3語まで。長い日本語、正確なタイトル、説明文は Remotion overlay に分離する
- UI風画像は実在アプリ・実在ロゴ・既存サービス画面を避け、抽象化した safe mockup にする

### 絶対禁止ワード（negativeに必須追加）
「photorealistic, 3D render, photograph, camera shot, stock photo, generic clipart, busy background, cluttered composition, text overlay, watermark, signature, border frame, vignette」

### 解像度感の明示
「designed for 1920x1080 display, clean edges for video rendering, no anti-aliasing artifacts」を末尾に追加

## Working Invocation Patterns

### A. pwsh.exe + codex exec 直叩き（推奨・proven path）

Node から `pwsh.exe` を `windowsHide: true` で spawn し、その中で `codex exec --dangerously-bypass-approvals-and-sandbox` を呼ぶ。子プロセス（codex.exe）も pwsh の hidden console を継承するため、cmd ウィンドウは1回も出ない（2026-04-26 確認）。

実装は `scripts/run-codex-imagegen-pwsh.mjs` を参照。バッチ実行はこれを使う：

```bash
node scripts/run-codex-imagegen-pwsh.mjs <episode_id> [<episode_id>...]
```

Node 内部の核心部分（参考）：

```js
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PWSH = process.env.PWSH_EXE
  || 'C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.6.1.0_x64__8wekyb3d8bbwe\\pwsh.exe';
// バージョンが上がる場合は環境変数 PWSH_EXE で渡す

// 一時 .ps1 を作って prompt を here-string で渡す
const tmpPath = path.join(os.tmpdir(), `imagegen-${Date.now()}.ps1`);
const psScript = `$ErrorActionPreference = 'Continue'
$prompt = @'
${prompt}
'@
$prompt | codex exec --dangerously-bypass-approvals-and-sandbox 2>&1
`;
writeFileSync(tmpPath, psScript, 'utf-8');

const p = spawn(PWSH, ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', tmpPath], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
  windowsHide: true,  // 必須
});
```

完了後、`~/.codex/generated_images/<session>/ig_*.png` に画像が出るので、output 文字列から `[A-Z]:\\...ig_[a-f0-9]+\.png` を regex で抽出（または mtime ベースで最新ファイルを取得）して `script/<episode>/assets/` へ copy。

### A-旧. codex-companion 経由（**使用禁止 / deprecated**）

`codex-companion.mjs` を Node spawn で呼ぶ方式は、Windows で **cmd ウィンドウがユーザー画面にポップアップする問題**が確認されている（2026-04-26）。`windowsHide: true` を spawn options に入れても効果なし。companion が内部で codex.exe を起動する段で新規 console を作るのが原因と推定。

`scripts/run-codex-imagegen-batch.mjs` / `scripts/drain-imagegen-tasks.mjs` / `scripts/relaunch-missing-scenes.mjs` / `scripts/imagegen-single-test.mjs` は **deprecated**。新規利用禁止。下の旧手順は記録のみ残す。

#### 旧手順（参考のみ）

ClaudeCode の openai-codex プラグインに同梱の wrapper を使う。
**multi-line プロンプトは argv 経由で渡してはいけない**（致命バグ参照）。stdin 経由が正しい。

PowerShell から：

```powershell
$companion = "$env:USERPROFILE\.claude\plugins\cache\openai-codex\codex\1.0.1\scripts\codex-companion.mjs"
$prompt = @'
imagegen スキルで画像を1枚生成して。

prompt: <構図>。<スタイル>。<色>。<アスペクト>。テキスト・文字は一切入れない。
size: 1536x1024
negative: 写真風、リアル調、文字、ロゴ、人物の顔

生成完了したらファイルパスだけ報告して、shell経由のコピーは不要。
'@
$prompt | node $companion task --background --fresh
# → "Codex Task started in the background as task-XXXXXX-YYYYYY"
```

Node から（バッチ処理向き）：

```js
import {spawn} from 'node:child_process';
const p = spawn('node', [COMPANION, 'task', '--background', '--fresh'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: false,  // 必ず false。true だとプロンプトが切られる
});
p.stdin.end(prompt);  // 改行込みフルプロンプト
```

進捗確認とログ：

```powershell
node $companion status task-XXXXXX-YYYYYY
node $companion result task-XXXXXX-YYYYYY
```

完了 (`Phase: done`) になったら、`~/.codex/generated_images/` の最新 png を取得：

```powershell
$latest = Get-ChildItem "$env:USERPROFILE\.codex\generated_images" -Recurse -File -Filter "*.png" |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $latest.FullName "script\<episode_id>\assets\s01_main.png"
```

注意: `result` 出力に「保存未完了: shell起動が CreateProcessAsUserW failed: 5」が出てもエラー扱いしない。**画像本体は generated_images に保存されている**。

### B. 対話 codex CLI 経由（半手動・確実）

```bash
codex
# YOLO mode を有効化（/yolo か起動時フラグ）
# プロンプトを貼って Enter
# 生成後にファイルパスが表示される
```

ユーザーに codex を別ターミナルで開いてもらい、プロンプトを順次投入してもらうパターン。`run-codex-imagegen-pwsh.mjs` が使えないときの半手動 fallback。

### C. `codex exec` 直接（非推奨）

`codex exec --dangerously-bypass-approvals-and-sandbox "<prompt>"` を shell argv へ直接渡す方式は、multi-line prompt が壊れるので使わない。通常は A の `run-codex-imagegen-pwsh.mjs`、半手動時だけ B の対話モードを使う。

## Scene Asset Workflow（このリポ用）

`script/<episode_id>/script.yaml` の各 scene が `main.kind: image` のとき、次を実施する。

1. scene 単位で `image_direction` を作る
2. `_reference/image_prompt_pack/02_IMAGEGEN_PROMPT_PROMPT.md` で `asset_requirements.imagegen_prompt` を作る
3. `_reference/image_prompt_pack/03_IMAGE_PROMPT_AUDIT.md` で55点ゲートを通す。FAIL なら `04_IMAGE_REWRITE_PROMPT.md` で構図から作り直す
4. `node scripts/audit-image-prompts.mjs <episode_id>` を通す
5. `scripts/run-codex-imagegen-pwsh.mjs` で生成キックする（codex-companion 経由は禁止）
6. `~/.codex/generated_images/` の出力を `script/<episode_id>/assets/sNN_main.png` 等へ copy する
7. `meta.json` の `assets[]` に `generator: "Codex (imagegen)"`, `imagegen_prompt`, `imagegen_model: "gpt-image-2"`, `license: "AI生成素材。公開前に利用条件を再確認"` を記録する
8. `node scripts/audit-generated-images.mjs <episode_id>` と `05_IMAGE_RESULT_AUDIT.md` で生成後監査する
9. 3回リトライしても失敗したシーンがある場合は、素材生成未完了として停止する。ユーザー確認なしに `script.yaml` を text-fallback / bullets へ書き換えたり、`assets[]` から外して完了扱いにしたりしない。ユーザーが明示承認した場合だけ、別フローで text-fallback 等へ移る。画像未完成のまま MP4 生成へ進まない。

## Prompt Style Recipes

### サイエンス問題提起型（RM・霊夢魔理沙）
- 配色: 青緑系・寒色寄り
- スタイル: フラット研究室風 / 顕微鏡・グラフ・ガラス板モチーフ
- 雰囲気: 「実験データを見せている」感

### 雑学・親しみ型（ZM・ずんだもん）
- 配色: 暖色系・ピンクオレンジ
- スタイル: フラット・水彩 / 教室・吹き出し・キャラ寄り
- 雰囲気: 「説明イラスト」感

### 共通 negative
`写真風、リアル調、文字、ロゴ、人物の顔、漫画的な吹き出しテキスト`

## 致命バグと回避策（必読）

### Bug 1: argv 経由の multi-line prompt が改行で切られる

**症状:** タスクは正常に起動するが、生成される画像が **完全に無関係なテーマ**になる（例: タコの prompt を投げたのに SNS 自動化の図が出る）。クレジットも消費される。

**原因:** `spawn(cmd, args, {shell: true})` または同等の shell 解釈経由で multi-line 文字列を argv として渡すと、Windows の cmd / pwsh が最初の改行までしか読まない。codex-companion の `request.prompt` には先頭1行（例: `imagegen スキルで画像を1枚生成して。`）しか入らない。Codex agent はその generic な prompt + workspace context から prompt 内容を勝手に補完するため、別案件の素材が出る。

**確認方法:** `~/.claude/plugins/data/codex-openai-codex/state/<workspace-hash>/jobs/<task-id>.json` の `request.prompt` を確認。1行のみなら被害発生中。

**修正:** 上記「Working Invocation Patterns A」の通り、**stdin 経由**で渡す。`shell: false` 必須。

### Bug 2: --fresh を省くと別スレッドが流用されることがある

**症状:** Codex session ID が今回のタスク開始時刻より古い ID になり、生成画像が前回までの作業内容を引きずる。

**原因:** codex-companion の `task` 命令はデフォルトで過去のタスク thread を暗黙的に再利用するパスがある（特に並列起動時）。

**修正:** 必ず `--fresh` フラグを付ける。

### Bug 3: codex agent の shell コピーは Windows サンドボックスで失敗する

**症状:** タスク result に `保存未完了: shell起動が CreateProcessAsUserW failed: 5 で失敗` と出る。

**原因:** Windows サンドボックスの権限制約で Codex agent が pwsh.exe を spawn できない。**画像生成自体は成功しているが、agent からの copy が動かない**。

**修正:** prompt に「shell経由のコピーは不要」と明記。後段の Claude / Node 側で `Copy-Item` または `fs.copyFile` を使う。

## Stop Conditions

成功扱いにしない条件：

- `codex login status` が ChatGPT 認証になっていない
- 生成画像が `~/.codex/generated_images/` に存在しない
- 生成画像のサイズが 0B または明らかに壊れている
- 出力 png が `script/<episode_id>/assets/` に copy されていない
- `meta.json` `assets[]` に imagegen 必須フィールドが欠けている
- ユーザー確認なしに text-fallback / bullets へ降格した、または画像未完成のまま MP4 生成へ進めた

## Reference

- `~/.codex/skills/.system/imagegen/SKILL.md` - Codex 公式 imagegen skill 仕様
- `<repo>/CLAUDE.md#Image Engine Workflow` - 上位 engine 解決ロジック
- `<repo>/21_prompt_codex.md` - Codex 向けプロンプト設計原則
- `<repo>/script/ep998-sleep-phone-imagegen/` - imagegen 経路の完成例（3 枚採用）
