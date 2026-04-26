#!/usr/bin/env node
// Image Engine Resolver
//
// 解決した engine を stdout に 1 行出力する。
//   "codex-imagegen": codex CLI が呼べて、ChatGPT OAuth でログイン済み
//   "notebooklm":     上記が満たされない（フォールバック）。notebookLM/ サブワークスペースが必要。
//   "text-fallback":  notebookLM/ も無い場合（最終退避）。
//
// 詳細仕様: ルートの CLAUDE.md#Image Engine Workflow を参照。
//
// 使い方:
//   node scripts/resolve-image-engine.mjs
//   ENGINE=$(node scripts/resolve-image-engine.mjs)
//
// 警告は stderr に出る。CLI 呼び出しのタイムアウトは 3 秒。
// OPENAI_API_KEY は判定に使わない。Codex CLI built-in image_gen は ChatGPT OAuth で動くため。

import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const TIMEOUT_MS = 3000;

const checkCodexCli = () =>
  new Promise((resolve) => {
    let proc;
    try {
      proc = spawn('codex', ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true,
      });
    } catch {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      try {
        proc.kill();
      } catch {
        // noop
      }
      finish(false);
    }, TIMEOUT_MS);

    proc.on('error', () => finish(false));
    proc.on('close', (code) => finish(code === 0));
  });

const checkCodexLogin = () =>
  new Promise((resolve) => {
    let proc;
    try {
      proc = spawn('codex', ['login', 'status'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        windowsHide: true,
      });
    } catch {
      resolve(false);
      return;
    }

    // codex CLI は "Logged in using ChatGPT" を stderr に出すため両方拾う
    let buffer = '';
    let settled = false;
    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      try {
        proc.kill();
      } catch {
        // noop
      }
      finish(false);
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      buffer += chunk.toString();
    });
    proc.on('error', () => finish(false));
    proc.on('close', () => finish(/Logged in/i.test(buffer)));
  });

const checkNotebookLM = () => existsSync(path.join(process.cwd(), 'notebookLM', 'CLAUDE.md'));

const warn = (message) => {
  process.stderr.write(`warn: ${message}\n`);
};

const main = async () => {
  const hasCodex = await checkCodexCli();
  const hasLogin = hasCodex ? await checkCodexLogin() : false;

  if (hasCodex && hasLogin) {
    process.stdout.write('codex-imagegen\n');
    return;
  }

  if (!hasCodex) {
    warn('codex CLI not found in PATH (or --version timed out); falling back to notebooklm');
  } else if (!hasLogin) {
    warn('codex login status: not logged in to ChatGPT (or check timed out); falling back to notebooklm');
  }

  if (checkNotebookLM()) {
    process.stdout.write('notebooklm\n');
    return;
  }

  warn('notebookLM/ workspace not found; final fallback to text-fallback');
  process.stdout.write('text-fallback\n');
};

main().catch((err) => {
  process.stderr.write(`error: ${err?.message ?? err}\n`);
  process.stdout.write('text-fallback\n');
});
