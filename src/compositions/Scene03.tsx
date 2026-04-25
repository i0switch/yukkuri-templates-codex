import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-03.jpeg',
  theme: 'light',
  subtitleSafePadding: {left: 160, right: 140, top: 12, bottom: 12},
  main: {x: 57, y: 52, w: 1388, h: 768},
  sub: {x: 1526, y: 50, w: 348, h: 774},
  subtitle: {
    kind: 'bar',
    x: 252,
    y: 882,
    w: 1416,
    h: 160,
    bg: 'rgba(0,0,0,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 122, y: 922, scale: 0.56, expression: 'smile'},
  rightChar: {x: 1792, y: 922, scale: 0.56, expression: 'smile'},
};

export const Scene03: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
