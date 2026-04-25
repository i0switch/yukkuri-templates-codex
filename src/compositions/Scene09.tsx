import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-09.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 120, right: 104, top: 12, bottom: 12},
  main: {x: 10, y: 163, w: 1888, h: 698},
  subtitle: {
    kind: 'bar',
    x: 238,
    y: 873,
    w: 1448,
    h: 202,
    bg: 'rgba(255,255,255,0.85)',
    borderWidth: 0,
    borderRadius: 12,
    textColor: '#1A1A1A',
  },
  leftChar: {x: 118, y: 975, scale: 0.45, expression: 'smile'},
  rightChar: {x: 1802, y: 975, scale: 0.45, expression: 'smile'},
};

export const Scene09: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
