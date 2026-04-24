import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-21.jpeg',
  theme: 'dark',
  main: {x: 287, y: 42, w: 1347, h: 784},
  subtitle: {
    kind: 'overlay',
    x: 349,
    y: 871,
    w: 1230,
    h: 175,
  },
  leftChar: {x: 178, y: 949, scale: 0.64, expression: 'smile'},
  rightChar: {x: 1759, y: 946, scale: 0.64, expression: 'smile'},
};

export const Scene21: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
