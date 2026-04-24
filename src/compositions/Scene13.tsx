import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-13.jpeg',
  theme: 'light',
  main: {x: 50, y: 46, w: 1308, h: 742},
  sub: {x: 1420, y: 46, w: 455, h: 742},
  subtitle: {
    kind: 'overlay',
    x: 290,
    y: 840,
    w: 1345,
    h: 210,
  },
  leftChar: {x: 141, y: 973, scale: 0.5, expression: 'smile'},
  rightChar: {x: 1778, y: 973, scale: 0.5, expression: 'smile'},
};

export const Scene13: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
