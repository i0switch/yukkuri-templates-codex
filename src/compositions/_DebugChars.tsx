import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CharacterFace} from '../components/CharacterFace';

export const DebugChars: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#DDDDDD'}}>
      <CharacterFace character="reimu" expression="neutral" x={200} y={540} scale={0.6} />
      <CharacterFace character="marisa" expression="happy" x={700} y={540} scale={0.6} />
      <CharacterFace character="zundamon" expression="smile" x={1200} y={540} scale={0.6} />
      <CharacterFace character="metan" expression="laugh" x={1700} y={540} scale={0.6} />
    </AbsoluteFill>
  );
};
