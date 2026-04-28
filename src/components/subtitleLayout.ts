type OverlaySubtitleRect = {
  w: number;
  h: number;
  paddingX?: number;
  paddingY?: number;
};

export type OverlaySubtitleLayout = {
  paddingX: number;
  paddingY: number;
  innerWidth: number;
  innerHeight: number;
};

const finiteOrDefault = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const resolveOverlaySubtitleLayout = ({
  rect,
  strokeWidth,
  fallbackPaddingX,
  fallbackPaddingY,
}: {
  rect: OverlaySubtitleRect;
  strokeWidth: number;
  fallbackPaddingX: number;
  fallbackPaddingY: number;
}): OverlaySubtitleLayout => {
  const strokeAllowance = Math.max(0, finiteOrDefault(strokeWidth, 0)) * 2;
  const paddingX = Math.max(0, finiteOrDefault(rect.paddingX, fallbackPaddingX)) + strokeAllowance;
  const paddingY = Math.max(0, finiteOrDefault(rect.paddingY, fallbackPaddingY)) + strokeAllowance;

  return {
    paddingX,
    paddingY,
    innerWidth: Math.max(1, rect.w - paddingX * 2),
    innerHeight: Math.max(1, rect.h - paddingY * 2),
  };
};
