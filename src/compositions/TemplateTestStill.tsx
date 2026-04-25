import React from 'react';
import type {Rect, SceneProps, SlotRenderer} from '../types';
import {CHARACTER_PAIRS, FONTS, type PairId} from '../design-tokens';
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
import {AutoFitText} from '../components/AutoFitText';

export const TEST_STILL_SCENE_IDS = [
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

export type TestStillSceneId = (typeof TEST_STILL_SCENE_IDS)[number];

const TEST_TEXT =
  '【テストです\n改行テストです\nテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストですテストです】';

const SCENE_COMPONENTS: Record<TestStillSceneId, React.FC<SceneProps>> = {
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

const makeTextSlot = (kind: 'title' | 'main' | 'sub' | 'subtitle'): SlotRenderer => {
  const isTitle = kind === 'title';
  const isSub = kind === 'sub';
  const isSubtitle = kind === 'subtitle';

  return (rect: Rect) => (
    <AutoFitText
      text={TEST_TEXT}
      width={Math.max(1, rect.w - (isTitle ? 20 : isSubtitle ? 56 : isSub ? 28 : 56))}
      height={Math.max(1, rect.h - (isTitle ? 8 : isSubtitle ? 16 : isSub ? 24 : 40))}
      minFontSize={isTitle ? 12 : isSubtitle ? 14 : isSub ? 14 : 18}
      maxFontSize={isTitle ? 20 : isSubtitle ? 30 : isSub ? 24 : 42}
      lineHeight={1.22}
      fontFamily={FONTS.subtitle}
      fontWeight={900}
      color="#111111"
      textAlign="center"
      textShadow="0 2px 0 rgba(255,255,255,0.9), 0 -2px 0 rgba(255,255,255,0.9), 2px 0 0 rgba(255,255,255,0.9), -2px 0 0 rgba(255,255,255,0.9)"
      style={{
        padding: isTitle ? '4px 10px' : isSubtitle ? '8px 28px' : isSub ? '12px 14px' : '20px 28px',
        boxSizing: 'border-box',
      }}
    />
  );
};

export const TemplateTestStill: React.FC<{sceneId: TestStillSceneId; pairId: PairId}> = ({sceneId, pairId}) => {
  const SceneComponent = SCENE_COMPONENTS[sceneId];
  const [left, right] = CHARACTER_PAIRS[pairId];

  return (
    <SceneComponent
      leftCharacter={{character: left}}
      rightCharacter={{character: right}}
      titleSlot={makeTextSlot('title')}
      mainContentSlot={makeTextSlot('main')}
      subContentSlot={makeTextSlot('sub')}
      subtitleSlot={makeTextSlot('subtitle')}
      subtitleText={TEST_TEXT}
      showAreaLabels={false}
    />
  );
};
