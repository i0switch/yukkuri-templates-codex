import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-20.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 152, right: 120, top: 12, bottom: 12},
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

export const Scene20: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
