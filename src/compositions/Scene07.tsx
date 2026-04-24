import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-07.jpeg',
  theme: 'dark',
  main: {x: 392, y: 78, w: 1134, h: 700},
  subtitle: {
    kind: 'overlay',
    x: 350,
    y: 838,
    w: 1216,
    h: 188,
  },
  leftChar: {x: 150, y: 914, scale: 0.62, expression: 'smile'},
  rightChar: {x: 1768, y: 914, scale: 0.62, expression: 'smile'},
};

export const Scene07: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
