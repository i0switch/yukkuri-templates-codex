import React from 'react';
import {AreaLabel} from '../components/AreaLabel';
import {CHARACTER_PAIRS, type PairId} from '../design-tokens';
import type {Rect, SceneProps, SlotRenderer} from '../types';
import {Scene01} from './Scene01';
import {Scene02} from './Scene02';
import {Scene03} from './Scene03';
import {Scene04} from './Scene04';
import {Scene05} from './Scene05';
import {Scene06} from './Scene06';
import {Scene07} from './Scene07';
import {Scene08} from './Scene08';
import {Scene09} from './Scene09';
import {Scene10} from './Scene10';
import {Scene11} from './Scene11';
import {Scene12} from './Scene12';
import {Scene13} from './Scene13';
import {Scene14} from './Scene14';
import {Scene15} from './Scene15';
import {Scene16} from './Scene16';
import {Scene17} from './Scene17';
import {Scene18} from './Scene18';
import {Scene19} from './Scene19';
import {Scene20} from './Scene20';
import {Scene21} from './Scene21';

export const TEMPLATE_GUIDE_SCENE_IDS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
] as const;

export type TemplateGuideSceneId = (typeof TEMPLATE_GUIDE_SCENE_IDS)[number];

const SCENE_COMPONENTS: Record<TemplateGuideSceneId, React.FC<SceneProps>> = {
  '01': Scene01,
  '02': Scene02,
  '03': Scene03,
  '04': Scene04,
  '05': Scene05,
  '06': Scene06,
  '07': Scene07,
  '08': Scene08,
  '09': Scene09,
  '10': Scene10,
  '11': Scene11,
  '12': Scene12,
  '13': Scene13,
  '14': Scene14,
  '15': Scene15,
  '16': Scene16,
  '17': Scene17,
  '18': Scene18,
  '19': Scene19,
  '20': Scene20,
  '21': Scene21,
};

const LABELS = {
  main: 'ここに画像が来るよ',
  sub: 'ここはサブエリアだよ',
  title: 'ここはタイトルエリアだよ',
  subtitle: 'ここが字幕エリアだよ',
} as const;

const makeGuideSlot =
  (kind: keyof typeof LABELS): SlotRenderer =>
  (rect: Rect) => (
    <AreaLabel
      kind={kind}
      label={LABELS[kind]}
      width={rect.w}
      height={rect.h}
    />
  );

export const TemplateGuideStill: React.FC<{sceneId: TemplateGuideSceneId; pairId: PairId}> = ({
  sceneId,
  pairId,
}) => {
  const SceneComponent = SCENE_COMPONENTS[sceneId];
  const [left, right] = CHARACTER_PAIRS[pairId];

  return (
    <SceneComponent
      leftCharacter={{character: left}}
      rightCharacter={{character: right}}
      titleSlot={makeGuideSlot('title')}
      mainContentSlot={makeGuideSlot('main')}
      subContentSlot={makeGuideSlot('sub')}
      subtitleSlot={makeGuideSlot('subtitle')}
      subtitleText={LABELS.subtitle}
      showAreaLabels={false}
    />
  );
};
