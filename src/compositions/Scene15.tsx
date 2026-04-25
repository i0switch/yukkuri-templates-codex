import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-15.jpeg',
  theme: 'light',
  subtitleSafePadding: {left: 168, right: 80, top: 12, bottom: 12},
  title: {x: 32, y: 30, w: 948, h: 114},
  main: {x: 66, y: 172, w: 1792, h: 706},
  subtitle: {
    kind: 'overlay',
    x: 394,
    y: 913,
    w: 1102,
    h: 158,
  },
  leftChar: {x: 205, y: 969, scale: 0.72, expression: 'smile'},
  rightChar: {x: 1748, y: 969, scale: 0.72, expression: 'smile'},
};

export const Scene15: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
