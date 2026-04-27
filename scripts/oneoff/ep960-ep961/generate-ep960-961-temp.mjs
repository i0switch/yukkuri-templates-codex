throw new Error(
  [
    'scripts/oneoff/ep960-ep961/generate-ep960-961-temp.mjs is disabled.',
    '旧imagegenプロンプトを含むoneoff生成ルートは使用禁止です。',
    '再生成が必要な場合は、正準prompt packと scripts/lib/imagegen-prompt-contract.mjs を使って作り直してください。',
  ].join('\n'),
);
