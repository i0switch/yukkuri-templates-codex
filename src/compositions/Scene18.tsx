import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-18.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 208, right: 176, top: 12, bottom: 12},
  main: {x: 16, y: 118, w: 1887, h: 737},
  subtitle: {
    kind: 'bar',
    x: 247,
    y: 880,
    w: 1402,
    h: 179,
    bg: 'rgba(0,0,0,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 130, y: 959, scale: 0.64, expression: 'smile'},
  rightChar: {x: 1770, y: 960, scale: 0.64, expression: 'smile'},
};

export const Scene18: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
