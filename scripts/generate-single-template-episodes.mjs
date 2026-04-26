throw new Error(
  [
    'generate-single-template-episodes.mjs is disabled.',
    '台本本文をJSに直書きする旧生成ルートは scripts/legacy/ に隔離しました。',
    '新規台本は _reference/script_prompt_pack を読み、Codexレビュー済みの script_final.md から script.yaml 化してください。',
  ].join('\n'),
);
