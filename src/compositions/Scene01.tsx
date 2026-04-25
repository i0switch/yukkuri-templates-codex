import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-01.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 260, right: 220, top: 12, bottom: 12},
  main: {x: 100, y: 90, w: 1720, h: 780},
  subtitle: {
    kind: 'bar',
    x: 270,
    y: 896,
    w: 1370,
    h: 114,
    bg: 'rgba(255,255,255,0.88)',
    borderWidth: 0,
    borderRadius: 12,
    textColor: '#1A1A1A',
  },
  leftChar: {x: 170, y: 928, scale: 0.72, expression: 'smile'},
  rightChar: {x: 1750, y: 928, scale: 0.72, expression: 'smile'},
};

export const Scene01: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
