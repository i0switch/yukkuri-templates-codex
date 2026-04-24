import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-04.jpeg',
  theme: 'dark',
  title: {x: 100, y: 60, w: 1720, h: 100},
  main: {x: 100, y: 180, w: 1720, h: 680},
  subtitle: {
    kind: 'bar',
    x: 268,
    y: 908,
    w: 1386,
    h: 156,
    bg: 'rgba(255,255,255,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 159, y: 946, scale: 0.58, expression: 'smile'},
  rightChar: {x: 1761, y: 946, scale: 0.58, expression: 'smile'},
};

export const Scene04: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
