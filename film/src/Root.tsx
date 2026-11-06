import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { DURATION, FPS, H, W } from './data';

export const Root: React.FC = () => (
  <Composition id="NeuronFilm" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
