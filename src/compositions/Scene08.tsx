import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-08.jpeg',
  theme: 'dark',
  main: {x: 349, y: 120, w: 1223, h: 671},
  subtitle: {
    kind: 'bar',
    x: 266,
    y: 874,
    w: 1374,
    h: 204,
    bg: 'rgba(255,255,255,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 132, y: 974, scale: 0.46, expression: 'laugh'},
  rightChar: {x: 1779, y: 973, scale: 0.46, expression: 'laugh'},
};
export const Scene08: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
