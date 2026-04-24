import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-10.jpeg',
  theme: 'light',
  main: {x: 64, y: 52, w: 1332, h: 760},
  sub: {x: 1463, y: 53, w: 399, h: 768},
  subtitle: {
    kind: 'overlay',
    x: 242,
    y: 886,
    w: 1434,
    h: 145,
  },
  leftChar: {x: 116, y: 943, scale: 0.576, expression: 'smile'},
  rightChar: {x: 1808, y: 943, scale: 0.576, expression: 'smile'},
};

export const Scene10: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
