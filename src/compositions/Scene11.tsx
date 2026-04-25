import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-11.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 176, right: 176, top: 12, bottom: 12},
  main: {x: 55, y: 45, w: 1810, h: 825},
  subtitle: {
    kind: 'bar',
    x: 245,
    y: 880,
    w: 1435,
    h: 188,
    bg: 'rgba(255,255,255,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 123, y: 961, scale: 0.58, expression: 'smile'},
  rightChar: {x: 1779, y: 961, scale: 0.58, expression: 'smile'},
};

export const Scene11: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
