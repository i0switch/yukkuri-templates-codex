import React from 'react';
import {SceneFrame} from '../components/SceneFrame';
import {FONTS, TEXT_STROKE} from '../design-tokens';
import type {SceneLayout, SceneProps} from '../types';

const LAYOUT: SceneLayout = {
  bgSrc: '/backgrounds/bg-12.jpeg',
  characterPlacement: 'layout',
  theme: 'dark',
  subtitleSafePadding: {left: 0, right: 0, top: 16, bottom: 16},
  title: {x: 20, y: 20, w: 928, h: 90},
  main: {x: 130, y: 140, w: 1660, h: 600},
  subtitle: {
    kind: 'overlay',
    overlayStyle: 'text',
    x: 764,
    y: 889,
    w: 1125,
    h: 162,
    textColor: '#1A1A1A',
    fontSize: 34,
    fontWeight: 700,
    paddingX: 72,
    paddingY: 6,
  },
  leftChar: {x: 219, y: 968, scale: 0.46, expression: 'happy'},
  rightChar: {x: 514, y: 968, scale: 0.46, expression: 'smile'},
};

const titleSlot = (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2B2B2B',
      fontFamily: FONTS.ui,
      fontSize: 30,
      fontWeight: 800,
      textAlign: 'center',
      textShadow: `0 2px 0 #ffffff, 0 -2px 0 #ffffff, 2px 0 0 #ffffff, -2px 0 0 #ffffff`,
      WebkitTextStroke: `${TEXT_STROKE.title.width}px ${TEXT_STROKE.title.color}`,
      paintOrder: 'stroke fill',
      padding: '10px 36px 14px',
      boxSizing: 'border-box',
    }}
  >
    ここはタイトルエリア
  </div>
);

export const Scene12: React.FC<SceneProps> = (props) => (
  <SceneFrame layout={LAYOUT} titleSlot={props.titleSlot ?? titleSlot} {...props} />
);
