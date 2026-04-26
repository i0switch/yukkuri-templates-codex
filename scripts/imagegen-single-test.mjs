#!/usr/bin/env node
// 単発imagegen疎通テスト。stdin経由でプロンプトを渡し、--fresh で必ず新セッション。

import {spawn} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const COMPANION = path.join(
  os.homedir(),
  '.claude',
  'plugins',
  'cache',
  'openai-codex',
  'codex',
  '1.0.1',
  'scripts',
  'codex-companion.mjs'
);

const PROMPT = `imagegen スキルで画像を1枚生成して。

prompt: フラットデザインのイラスト、白背景。中央に賢そうな青緑色のタコが頭にハテナマークを浮かべて何かを考えている構図。色は青緑系・寒色寄り、フラット研究室風。16:9 アスペクト比。テキスト・文字は一切入れない。
size: 1536x1024
negative: 写真風、リアル調、文字、ロゴ、人物の顔

生成完了したらファイルパスだけ報告して。shell経由のコピーは不要。
`;

const main = () => {
  return new Promise((resolve, reject) => {
    const p = spawn('node', [COMPANION, 'task', '--background', '--fresh'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (c) => (stdout += c.toString()));
    p.stderr.on('data', (c) => (stderr += c.toString()));
    p.on('close', (code) => {
      console.log(`exit: ${code}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      const m = (stdout + stderr).match(/task-[a-z0-9]+-[a-z0-9]+/i);
      if (m) {
        console.log(`task: ${m[0]}`);
        resolve(m[0]);
      } else {
        reject(new Error('no task id'));
      }
    });
    p.on('error', reject);
    p.stdin.end(PROMPT);
  });
};

main()
  .then((id) => {
    console.log(`Started: ${id}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
