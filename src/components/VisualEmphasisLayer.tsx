import React from 'react';
import type {TimedDialogueLine} from './Lipsync';

type Props = {
  activeLine: TimedDialogueLine | null;
  frame: number;
  fps: number;
  width: number;
  height: number;
  sceneGoal?: string;
};

export const VisualEmphasisLayer: React.FC<Props> = () => null;
