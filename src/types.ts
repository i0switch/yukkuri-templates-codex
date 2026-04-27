import type React from 'react';
import type {CharacterName, Expression, PairId} from './design-tokens';

export type LabelTheme = 'light' | 'dark';

export interface CharacterSpec {
  character: CharacterName;
  expression?: Expression;
  flip?: boolean;
  isSpeaking?: boolean;
  speakingFrame?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Insets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SubtitleLayout extends Rect {
  kind: 'bar' | 'overlay';
  overlayStyle?: 'frame' | 'text';
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  textAlign?: 'left' | 'center';
  fontSize?: number;
  fontWeight?: number | string;
  paddingX?: number;
  paddingY?: number;
}

export interface CharacterLayout {
  x: number;
  y: number;
  scale: number;
  expression: Expression;
}

export interface SceneLayoutOverride {
  characterPlacement?: 'edge' | 'layout';
  leftChar?: Partial<CharacterLayout>;
  rightChar?: Partial<CharacterLayout>;
  titleSafePadding?: Insets;
  mainSafePadding?: Insets;
  subSafePadding?: Insets;
  subtitleSafePadding?: Insets;
}

export interface SceneLayout {
  bgSrc: string;
  bgScale?: number;
  bgTranslateX?: number;
  bgTranslateY?: number;
  characterPlacement?: 'edge' | 'layout';
  theme: LabelTheme;
  title?: Rect;
  titleTheme?: LabelTheme;
  titleSafePadding?: Insets;
  main: Rect;
  mainTheme?: LabelTheme;
  mainSafePadding?: Insets;
  sub?: Rect;
  subTheme?: LabelTheme;
  subSafePadding?: Insets;
  subtitle: SubtitleLayout;
  subtitleTheme?: LabelTheme;
  subtitleSafePadding?: Insets;
  leftChar: CharacterLayout;
  rightChar: CharacterLayout;
  pairOverrides?: Partial<Record<PairId, SceneLayoutOverride>>;
}

export type SlotRenderer = React.ReactNode | ((rect: Rect) => React.ReactNode);

export interface SceneProps {
  leftCharacter?: CharacterSpec;
  rightCharacter?: CharacterSpec;
  subtitleText?: string;
  subtitleSlot?: SlotRenderer;
  mainContentSlot?: SlotRenderer;
  subContentSlot?: SlotRenderer;
  titleSlot?: SlotRenderer;
  showAreaLabels?: boolean;
}
