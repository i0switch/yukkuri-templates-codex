# Agent Fast Path

このファイルは、エージェントAIが通常の新規動画生成で迷わず最短ルートに入るための入口。
品質ルール、停止条件、完了条件は `docs/pipeline_contract.md` を正本にする。

## 最初に読む最小セット

通常の新規 episode 生成では、まず次だけを読む。

```text
docs/pipeline_contract.md
docs/agent_fast_path.md
_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
RMなら _reference/script_prompt_pack/local_canonical/yukkuri_master.md
ZMなら _reference/script_prompt_pack/local_canonical/zundamon_master.md
選択テンプレートに必要な template / Scene 定義
```

キャラペアが未確定なら、先に `01_input_normalize_prompt.md` で `character_pair` を確定してから、対応するローカル正本を1つだけ読む。RM/ZM両方のローカル正本を同時に読まない。

その後、工程に応じて `_reference/script_prompt_pack/01_input_normalize_prompt.md` から `11_final_episode_audit.md` までの必要ファイルだけを読む。
`AGENTS.md`、`CLAUDE.md`、`AI_VIDEO_GENERATION_GUIDE.md` は入口確認用であり、通常生成中に何度も全文再読しない。

## 初動探索で読まないもの

次は生成物、複製repo、依存関係、過去作業、公開コピーなので、通常生成の初動探索では読まない。

```text
.claude/worktrees/**
.claude/**/node_modules/**
.claude/**/.cache/**
.claude/**/.remotion-public/**
.claude/**/out/**
.claude/**/public/episodes/**
.claude/**/script/**/audio/**
.claude/**/script/**/bgm/**
.claude/**/script/**/assets/**
.claude/**/notebookLM/workspace/**
node_modules/**
.cache/**
.remotion-public/**
notebookLM/**
out/**
public/episodes/**
script/**/audio/**
script/**/bgm/**
script/**/assets/**
```

過去 episode を参考にする場合は、ユーザー指定の episode、または明示的に選んだ最大2本の軽量テキスト成果物だけに限定する。

## 通常生成で使わない生成器

`scripts/oneoff/**` は過去 episode の修正や移行用の使い捨てスクリプト置き場。
通常の台本生成、YAML化、画像プロンプト生成、画像生成の入口として使わない。
必要な場合だけ、対象 episode と目的を明示して読む。

## 自作スクリプトの後始末

作業中に自作した一時スクリプト、検証用スクリプト、移行用スクリプト、episode専用生成スクリプトは、完了前に必ず削除する。
`create-epXXX.mjs`、`fix-epXXX.mjs`、`generate-epXXX.mjs`、`oneoff`、`temp`、`tmp`、`scratch`、`debug` 系の自作スクリプトを残したまま完了報告しない。
恒久化する場合は、`package.json`、テスト、ドキュメント、gate に正式接続し、削除しない理由を完了報告に書く。

## 画像生成の標準運用

画像生成は `run-codex-imagegen-batch.mjs` を使い、既存画像と台帳が揃っているsceneは再生成しない。

```powershell
npm run imagegen:episode -- <episode_id> --dry-run
npm run imagegen:episode -- <episode_id> --parallel=3
npm run imagegen:episode -- <episode_id> --retry-failed
npm run imagegen:episode -- <episode_id> --only=s01,s05
```

- まず `--dry-run` で対象sceneを確認する。
- 失敗後は `--retry-failed` で失敗sceneだけ再実行する。
- 明示的な差し替えが必要なsceneだけ `--only=sNN` を使う。
- `--force` は既存画像と台帳を意図的に破棄して再生成したい場合だけ使う。

## 最新画像プロンプトの軽量監査

最新 episode 群の `image_prompts.json` に文字化けや旧プロンプト混入がないかだけ確認する。

```powershell
npm run audit:latest-image-prompts
npm run audit:latest-image-prompts -- --limit=3
```

この監査は実画像の品質判定ではない。
文字化け、旧プロンプト文言、読み込み不能な `image_prompts.json` を早く見つけるための軽量チェック。
