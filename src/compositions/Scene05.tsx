import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-05.jpeg',
  theme: 'dark',
  main: {x: 60, y: 60, w: 1800, h: 720},
  subtitle: {
    kind: 'overlay',
    x: 386,
    y: 842,
    w: 1146,
    h: 179,
  },
  leftChar: {x: 140, y: 916, scale: 0.58, expression: 'smile'},
  rightChar: {x: 1780, y: 916, scale: 0.58, expression: 'smile'},
};

export const Scene05: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
