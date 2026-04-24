import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

type Props = {
  src: string;
  fallbackColor?: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
};

const toStaticPath = (src: string) => src.replace(/^\/+/, '');

export const Background: React.FC<Props> = ({
  src,
  fallbackColor = '#EEEEEE',
  scale = 1,
  translateX = 0,
  translateY = 0,
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: fallbackColor}}>
      <Img
        src={staticFile(toStaticPath(src))}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};
