import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-02.jpeg',
  theme: 'dark',
  main: {x: 44, y: 42, w: 1290, h: 746},
  sub: {x: 1402, y: 44, w: 468, h: 736},
  subtitle: {
    kind: 'overlay',
    x: 264,
    y: 844,
    w: 1392,
    h: 192,
  },
  leftChar: {x: 144, y: 912, scale: 0.59, expression: 'smile'},
  rightChar: {x: 1776, y: 912, scale: 0.59, expression: 'smile'},
};

export const Scene02: React.FC<SceneProps> = (props) => <SceneFrame layout={LAYOUT} {...props} />;
