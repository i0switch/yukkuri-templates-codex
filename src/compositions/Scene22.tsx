import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-22.jpeg',
  theme: 'dark',
  main: {x: 79, y: 66, w: 1760, h: 774},
  subtitle: {
    kind: 'overlay',
    x: 379,
    y: 859,
    w: 1163,
    h: 182,
  },
  leftChar: {x: 230, y: 958, scale: 0.62, expression: 'smile'},
  rightChar: {x: 1696, y: 960, scale: 0.62, expression: 'smile'},
};

export const Scene22: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
