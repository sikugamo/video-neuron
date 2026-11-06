import React from 'react';
import { AbsoluteFill, Audio, Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS, SHOTS, shotEndF, shotStartF } from './data';
import { Defs, FullNeuron, SCENES } from './scenes';
import { Hud } from './Hud';
import { FONT_CSS } from './fontcss';

const FONTS: [string, string, string][] = [
  ['Rajdhani', 'fonts/Rajdhani-Bold.ttf', '700'],
  ['Rajdhani', 'fonts/Rajdhani-SemiBold.ttf', '600'],
  ['Barlow Condensed', 'fonts/BarlowCondensed-Regular.ttf', '400'],
  ['Barlow Condensed', 'fonts/BarlowCondensed-Medium.ttf', '500'],
  ['JBMono', 'fonts/mono.woff2', '400'],
];
const T = 7; // half-length of the zoom-blur transition, frames

const Stage: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const s = shotStartF(i), e = shotEndF(i);
  const shot = SHOTS[i];
  const t = (f - s) / FPS + i * 3.1;
  const p = (f - s) / (e - s);
  // slow push-in / orbit
  let scale = 1 + 0.12 * p;
  let rot = 0;
  let ox = 540, oy = 610;
  if (shot.scene === 'full') { scale = 1 + 0.06 * p; rot = Math.sin(p * Math.PI) * 1.5; ox = 600; oy = 600; }
  // transition in: arrive from a bigger, blurred frame; out: rush forward into blur
  const inK = interpolate(f, [s - T, s + T], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const outK = i === SHOTS.length - 1 ? 0 : interpolate(f, [e - T, e + T], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const first = i === 0;
  scale *= (first ? 1 : 1 - 0.3 * (1 - inK) + 0.3) * (1 + 0.6 * outK) / (first ? 1 : 1.3);
  const blur = first ? 10 * outK : 14 * (1 - inK) + 10 * outK;
  const opacity = (first ? 1 : inK) * (1 - outK * outK);
  const Scene = shot.scene === 'xray' ? null : SCENES[shot.scene];
  const xf = `translate(${ox}px,${oy}px) scale(${scale}) rotate(${rot}deg) translate(${-ox}px,${-oy}px)`;
  const svg = (child: React.ReactNode) => (
    <svg width={1080} height={1350} viewBox="0 0 1080 1350" style={{ position: 'absolute', inset: 0 }}><Defs /><g filter="url(#bloom)">{child}</g></svg>
  );
  let body: React.ReactNode;
  if (shot.scene === 'xray') {
    const wx = interpolate(f, [s, e], [960, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const inner = (
      <div style={{ position: 'absolute', inset: 0, transform: 'translate(-120px,-260px) scale(1.45)', transformOrigin: '600px 700px' }}>{svg(<FullNeuron t={t} insets={false} />)}</div>
    );
    body = (
      <>
        {inner}
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${wx}px)`, background: '#02140f' }}>
          <div style={{ position: 'absolute', inset: 0, filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(115deg) saturate(4) contrast(1.25)', mixBlendMode: 'screen' }}>{inner}</div>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(77,255,195,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(77,255,195,0.12) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: wx - 3, width: 6, background: '#d8fff0', boxShadow: '0 0 18px 6px #4dffc3' }} />
      </>
    );
  } else {
    body = svg(Scene ? <Scene t={t} /> : null);
  }
  return (
    <AbsoluteFill style={{ opacity, filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      <AbsoluteFill style={{ transform: xf }}>{body}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts', { timeoutInMilliseconds: 100000 }));
  React.useEffect(() => {
    let done = false;
    const fin = () => { if (!done) { done = true; continueRender(handle); } };
    Promise.all(FONTS.map(([fam, , w]) => document.fonts.load(`${w} 20px "${fam}"`))).then(fin, fin);
    const id = setTimeout(fin, 8000);
    return () => clearTimeout(id);
  }, [handle]);
};

export const Film: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const active = SHOTS.map((_, i) => i).filter((i) => f >= shotStartF(i) - T && f < shotEndF(i) + T);
  // brief flash on each cut
  const nearest = Math.min(...SHOTS.slice(1).map((_, k) => Math.abs(f - shotStartF(k + 1))));
  const flash = interpolate(nearest, [0, 4], [0.22, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#04031a', overflow: 'hidden' }}>
      <style>{FONT_CSS}</style>
      {active.map((i) => <Stage key={i} i={i} f={f} />)}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,10,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: '#c8d8ff', opacity: flash, mixBlendMode: 'screen' }} />
      <Hud />
      <Audio src={staticFile('music.m4a')} />
    </AbsoluteFill>
  );
};
