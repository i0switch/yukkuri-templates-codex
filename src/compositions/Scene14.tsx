import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import {FONTS} from '../design-tokens';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-14.jpeg',
  theme: 'dark',
  subtitleSafePadding: {left: 152, right: 128, top: 12, bottom: 12},
  main: {x: 136, y: 123, w: 1260, h: 702},
  sub: {x: 1484, y: 120, w: 338, h: 720},
  subtitle: {
    kind: 'overlay',
    x: 258,
    y: 888,
    w: 1400,
    h: 160,
  },
  leftChar: {x: 142, y: 971, scale: 0.52, expression: 'smile'},
  rightChar: {x: 1782, y: 971, scale: 0.52, expression: 'smile'},
};

const subContentSlot = (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(0,0,0,0.68)',
      fontFamily: FONTS.ui,
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: '0.04em',
      textAlign: 'center',
      lineHeight: 1.35,
      padding: '24px 18px',
      boxSizing: 'border-box',
    }}
  >
    ここはサブコンテンツエリア
  </div>
);

export const Scene14: React.FC<SceneProps> = (props) => (
  <SceneFrame layout={LAYOUT} subContentSlot={props.subContentSlot ?? subContentSlot} {...props} />
);
