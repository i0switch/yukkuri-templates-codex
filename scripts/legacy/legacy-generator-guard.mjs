export function blockLegacyEpisodeGenerator(scriptName) {
  if (process.env.ALLOW_LEGACY_EPISODE_GENERATOR === '1') {
    return;
  }

  throw new Error(
    `${scriptName} is a legacy episode generator and is blocked by default. ` +
      'Use the script prompt pack and image prompt pack workflow instead. ' +
      'Legacy generators can reintroduce weak imagegen prompts or batch/grid asset habits. ' +
      'Set ALLOW_LEGACY_EPISODE_GENERATOR=1 only for historical fixture recovery.',
  );
}
