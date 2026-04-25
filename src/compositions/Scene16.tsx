import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-16.jpeg',
  theme: 'light',
  subtitleSafePadding: {left: 192, right: 160, top: 12, bottom: 12},
  title: {x: 70, y: 20, w: 1780, h: 100},
  main: {x: 70, y: 130, w: 1780, h: 720},
  subtitle: {
    kind: 'overlay',
    x: 232,
    y: 891,
    w: 1454,
    h: 174,
  },
  leftChar: {x: 122, y: 966, scale: 0.6, expression: 'smile'},
  rightChar: {x: 1806, y: 968, scale: 0.6, expression: 'smile'},
};

export const Scene16: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
