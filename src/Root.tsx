import React from 'react';
import {Composition} from 'remotion';
import {CHARACTER_PAIRS, VIDEO} from './design-tokens';
import {loadEpisodeRenderData} from './lib/load-script';
import {episodeCompositions} from './generated/episode-compositions';
import {DebugChars} from './compositions/_DebugChars';
import {VideoMain} from './compositions/VideoMain';
import {Scene01} from './compositions/Scene01';
import {Scene02} from './compositions/Scene02';
import {Scene03} from './compositions/Scene03';
import {Scene04} from './compositions/Scene04';
import {Scene05} from './compositions/Scene05';
import {Scene06} from './compositions/Scene06';
import {Scene07} from './compositions/Scene07';
import {Scene08} from './compositions/Scene08';
import {Scene09} from './compositions/Scene09';
import {Scene10} from './compositions/Scene10';
import {Scene11} from './compositions/Scene11';
import {Scene12} from './compositions/Scene12';
import {Scene13} from './compositions/Scene13';
import {Scene14} from './compositions/Scene14';
import {Scene15} from './compositions/Scene15';
import {Scene16} from './compositions/Scene16';
import {Scene17} from './compositions/Scene17';
import {Scene18} from './compositions/Scene18';
import {Scene19} from './compositions/Scene19';
import {Scene20} from './compositions/Scene20';
import {Scene21} from './compositions/Scene21';
import {TemplateTestStill, TEST_STILL_SCENE_IDS, type TestStillSceneId} from './compositions/TemplateTestStill';

const common = {
  durationInFrames: VIDEO.durationInFrames,
  fps: VIDEO.fps,
  width: VIDEO.width,
  height: VIDEO.height,
};

const sceneEntries = [
  {id: '01', component: Scene01},
  {id: '02', component: Scene02},
  {id: '03', component: Scene03},
  {id: '04', component: Scene04},
  {id: '05', component: Scene05},
  {id: '06', component: Scene06},
  {id: '07', component: Scene07},
  {id: '08', component: Scene08},
  {id: '09', component: Scene09},
  {id: '10', component: Scene10},
  {id: '11', component: Scene11},
  {id: '12', component: Scene12},
  {id: '13', component: Scene13},
  {id: '14', component: Scene14},
  {id: '15', component: Scene15},
  {id: '16', component: Scene16},
  {id: '17', component: Scene17},
  {id: '18', component: Scene18},
  {id: '19', component: Scene19},
  {id: '20', component: Scene20},
  {id: '21', component: Scene21},
] as const;

export const Root: React.FC = () => {
  return (
    <>
      <Composition id="DebugChars" component={DebugChars} {...common} />
      {episodeCompositions.map((episodeRenderData) => (
        <Composition
          key={episodeRenderData.meta.id}
          id={`Video-${episodeRenderData.meta.id}`}
          component={VideoMain}
          width={episodeRenderData.meta.width}
          height={episodeRenderData.meta.height}
          fps={episodeRenderData.meta.fps}
          durationInFrames={Math.ceil(episodeRenderData.total_duration_sec * episodeRenderData.meta.fps)}
          defaultProps={{script: loadEpisodeRenderData(episodeRenderData)}}
        />
      ))}
      {TEST_STILL_SCENE_IDS.flatMap((id) => [
        <Composition
          key={`TemplateTest-${id}-RM`}
          id={`TemplateTest-${id}-RM`}
          component={TemplateTestStill}
          {...common}
          defaultProps={{sceneId: id as TestStillSceneId, pairId: 'RM'}}
        />,
        <Composition
          key={`TemplateTest-${id}-ZM`}
          id={`TemplateTest-${id}-ZM`}
          component={TemplateTestStill}
          {...common}
          defaultProps={{sceneId: id as TestStillSceneId, pairId: 'ZM'}}
        />,
      ])}
      {sceneEntries.map(({id, component: SceneComponent}) => {
        return (
          <React.Fragment key={id}>
            <Composition
              id={`Scene${id}-RM`}
              component={SceneComponent}
              {...common}
              defaultProps={{
                leftCharacter: {character: CHARACTER_PAIRS.RM[0]},
                rightCharacter: {character: CHARACTER_PAIRS.RM[1]},
                subtitleText: 'ここは字幕エリア',
                showAreaLabels: false,
              }}
            />
            <Composition
              id={`Scene${id}-ZM`}
              component={SceneComponent}
              {...common}
              defaultProps={{
                leftCharacter: {character: CHARACTER_PAIRS.ZM[0]},
                rightCharacter: {character: CHARACTER_PAIRS.ZM[1]},
                subtitleText: 'ここは字幕エリア',
                showAreaLabels: false,
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
