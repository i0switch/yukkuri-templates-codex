export const RM_AQUESTALK_PRESETS = Object.freeze({
  left: '女性１',
  right: 'まりさ',
});

export const VALID_RM_AQUESTALK_PRESETS = new Set(Object.values(RM_AQUESTALK_PRESETS));

const normalizeToken = (value) =>
  String(value ?? '')
    .trim()
    .normalize('NFKC')
    .toLowerCase();

const PRESET_ALIASES = new Map([
  ['reimu', RM_AQUESTALK_PRESETS.left],
  ['れいむ', RM_AQUESTALK_PRESETS.left],
  ['霊夢', RM_AQUESTALK_PRESETS.left],
  ['女性1', RM_AQUESTALK_PRESETS.left],
  ['女性１', RM_AQUESTALK_PRESETS.left],
  ['marisa', RM_AQUESTALK_PRESETS.right],
  ['まりさ', RM_AQUESTALK_PRESETS.right],
  ['魔理沙', RM_AQUESTALK_PRESETS.right],
]);

export const normalizeAquesTalkPreset = ({side, preset}) => {
  const raw = String(preset ?? '').trim();
  const sideDefault = RM_AQUESTALK_PRESETS[side];
  if (!raw && sideDefault) {
    return sideDefault;
  }

  const alias = PRESET_ALIASES.get(normalizeToken(raw));
  return alias ?? raw;
};

export const isValidRmAquesTalkPreset = (preset) => VALID_RM_AQUESTALK_PRESETS.has(String(preset ?? '').trim());
