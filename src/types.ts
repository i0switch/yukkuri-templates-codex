import type React from 'react';
import type {CharacterName, Expression} from './design-tokens';

export type LabelTheme = 'light' | 'dark';

export interface CharacterSpec {
  character: CharacterName;
  expression?: Expression;
  flip?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
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

export interface SceneLayout {
  bgSrc: string;
  bgScale?: number;
  bgTranslateX?: number;
  bgTranslateY?: number;
  theme: LabelTheme;
  title?: Rect;
  titleTheme?: LabelTheme;
  main: Rect;
  mainTheme?: LabelTheme;
  sub?: Rect;
  subTheme?: LabelTheme;
  subtitle: SubtitleLayout;
  subtitleTheme?: LabelTheme;
  leftChar: CharacterLayout;
  rightChar: CharacterLayout;
}

export interface SceneProps {
  leftCharacter?: CharacterSpec;
  rightCharacter?: CharacterSpec;
  subtitleText?: string;
  subtitleSlot?: React.ReactNode;
  mainContentSlot?: React.ReactNode;
  subContentSlot?: React.ReactNode;
  titleSlot?: React.ReactNode;
  showAreaLabels?: boolean;
}
