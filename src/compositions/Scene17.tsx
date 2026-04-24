import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-17.jpeg',
  theme: 'light',
  title: {x: 70, y: 20, w: 1780, h: 100},
  titleTheme: 'light',
  main: {x: 69, y: 140, w: 1772, h: 711},
  mainTheme: 'dark',
  subtitle: {
    kind: 'overlay',
    x: 243,
    y: 883,
    w: 1425,
    h: 162,
  },
  subtitleTheme: 'light',
  leftChar: {x: 124, y: 966, scale: 0.6, expression: 'smile'},
  rightChar: {x: 1788, y: 970, scale: 0.6, expression: 'smile'},
};

export const Scene17: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
