export const NOTO_SANS_JP = '"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif';
export const M_PLUS = '"M PLUS Rounded 1c", "Yu Gothic", "Meiryo", sans-serif';
export const KEIFONT_PUBLIC_PATH = 'fonts/keifont.ttf';

export const FONT_FAMILIES = {
  gothic: '"Keifont", "けいふぉんと", "Yu Gothic", "Meiryo", sans-serif',
  mincho: '"Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", serif',
} as const;

export const FONTS = {
  subtitle: FONT_FAMILIES.gothic,
  ui: FONT_FAMILIES.gothic,
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

export const SUBTITLE_FONT_SCALE = 1.25;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1,
} as const;

export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  offWhite: '#F5F5F5',
  areaLabelStrokeDark: 'rgba(0,0,0,0.45)',
  areaLabelTextDark: 'rgba(0,0,0,0.68)',
  areaLabelBgDark: 'rgba(255,255,255,0.22)',
  areaLabelStrokeLight: 'rgba(255,255,255,0.70)',
  areaLabelTextLight: 'rgba(255,255,255,0.92)',
  areaLabelBgLight: 'rgba(0,0,0,0.24)',
} as const;

export const TEXT_STROKE = {
  subtitle: {
    color: COLORS.black,
    width: 6,
  },
  title: {
    color: 'rgba(0,0,0,0.70)',
    width: 2,
  },
  content: {
    color: 'rgba(0,0,0,0.45)',
    width: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.95)',
    width: 2,
  },
} as const;

export const FS = {
  xs: 20,
  sm: 28,
  md: 40,
  subtitle: Math.round(48 * SUBTITLE_FONT_SCALE),
  subtitleLg: 56,
  display: 72,
  areaLabel: 44,
  areaLabelSmall: 32,
} as const;

export const CHARACTER_METRICS = {
  reimu: {
    composeDir: 'characters/reimu',
    imgW: 400,
    imgH: 320,
    faceCenterRatio: {x: 0.5, y: 0.5},
    faceHeightRatio: 1.0,
    visibleBounds: {left: 85, top: 80, right: 352, bottom: 319},
  },
  marisa: {
    composeDir: 'characters/marisa',
    imgW: 400,
    imgH: 320,
    faceCenterRatio: {x: 0.5, y: 0.5},
    faceHeightRatio: 1.0,
    visibleBounds: {left: 23, top: 10, right: 398, bottom: 316},
  },
  zundamon: {
    composeDir: 'characters/zundamon',
    imgW: 524,
    imgH: 800,
    faceCenterRatio: {x: 0.5, y: 0.17},
    faceHeightRatio: 0.3,
    visibleBounds: {left: 123, top: 51, right: 469, bottom: 769},
    fullBody: {
      file: 'full_body.png',
      imgW: 1082,
      imgH: 1650,
      faceCenterRatio: {x: 0.5, y: 0.17},
      visibleBounds: {left: 259, top: 109, right: 964, bottom: 1582},
    },
  },
  metan: {
    composeDir: 'characters/metan',
    imgW: 475,
    imgH: 800,
    faceCenterRatio: {x: 0.5, y: 0.17},
    faceHeightRatio: 0.3,
    visibleBounds: {left: 47, top: 8, right: 427, bottom: 790},
    fullBody: {
      file: 'full_body.png',
      imgW: 1082,
      imgH: 1820,
      faceCenterRatio: {x: 0.5, y: 0.17},
      visibleBounds: {left: 111, top: 24, right: 969, bottom: 1793},
    },
  },
} as const;

export type CharacterName = keyof typeof CHARACTER_METRICS;

export const CHARACTER_PAIRS = {
  RM: ['reimu', 'marisa'],
  ZM: ['zundamon', 'metan'],
} as const;

export type PairId = keyof typeof CHARACTER_PAIRS;

export const EXPRESSION_FILE = {
  neutral: 'compose_open_close.png',
  smile: 'compose_open_mid.png',
  happy: 'compose_open_wide.png',
  laugh: 'compose_closed_wide.png',
  calm: 'compose_closed_close.png',
  smirk: 'compose_closed_mid.png',
  talk: 'compose_half_mid.png',
  halfOpen: 'compose_half_open.png',
} as const;

export type Expression = keyof typeof EXPRESSION_FILE;
