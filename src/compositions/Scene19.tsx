import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-19.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 176, right: 136, top: 12, bottom: 12},
  title: {x: 100, y: 60, w: 1720, h: 100},
  main: {x: 100, y: 180, w: 1720, h: 680},
  subtitle: {
    kind: 'bar',
    x: 253,
    y: 907,
    w: 1418,
    h: 152,
    bg: 'rgba(255,255,255,0.0)',
    borderWidth: 0,
    textColor: '#FFFFFF',
  },
  leftChar: {x: 128, y: 969, scale: 0.585, expression: 'smile'},
  rightChar: {x: 1820, y: 982, scale: 0.6, expression: 'smile'},
};

export const Scene19: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
