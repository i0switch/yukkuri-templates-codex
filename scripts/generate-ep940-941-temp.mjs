throw new Error(
  [
    'generate-ep940-941-temp.mjs is disabled.',
    '旧imagegenプロンプトを含む生成ルートは使用禁止です。',
    '新規生成は _reference/script_prompt_pack と scripts/lib/imagegen-prompt-contract.mjs の正準固定文を使ってください。',
  ].join('\n'),
);
