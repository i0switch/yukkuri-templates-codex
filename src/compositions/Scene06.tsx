import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-06.jpeg',
  theme: 'dark',
  main: {x: 411, y: 130, w: 1092, h: 585},
  subtitle: {
    kind: 'overlay',
    x: 358,
    y: 865,
    w: 1207,
    h: 167,
  },
  leftChar: {x: 160, y: 914, scale: 0.6, expression: 'smile'},
  rightChar: {x: 1760, y: 914, scale: 0.6, expression: 'smile'},
};

export const Scene06: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
