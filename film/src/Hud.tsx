import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { FPS, LOG_LINES, SHOTS, fmtK, shotIndexAt, shotStartF } from './data';
import { rnd } from './geom';
import { Defs, FullNeuron } from './scenes';

export const DISP = 'Rajdhani, sans-serif';
export const COND = '"Barlow Condensed", "Liberation Sans Narrow", sans-serif';
export const MONO = 'JBMono, "DejaVu Sans Mono", monospace';

const C = { text: '#e6e8ff', dim: '#9aa0c8', label: '#b8bde0', orange: '#ff9a3c', yellow: '#ffd34a', cyan: '#7fd6ff', pink: '#ff6ab0', line: 'rgba(160,170,255,0.18)' };

const Abs: React.FC<React.PropsWithChildren<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties }>> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

const Head: React.FC<{ x: number; y: number; w: number; l: string; r?: React.ReactNode; rc?: string; ls?: number }> = ({ x, y, w, l, r, rc = C.orange, ls = 2.4 }) => (
  <Abs x={x} y={y} w={w} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${C.line}`, paddingBottom: 6 }}>
    <span style={{ fontFamily: COND, fontWeight: 500, fontSize: 14, letterSpacing: ls, color: C.text, whiteSpace: 'nowrap' }}>{l}</span>
    <span style={{ fontFamily: MONO, fontSize: 12, color: rc, whiteSpace: 'nowrap' }}>{r}</span>
  </Abs>
);

const panel: React.CSSProperties = {
  position: 'absolute', borderRadius: 26, background: 'linear-gradient(180deg, rgba(22,22,52,0.62), rgba(10,10,30,0.72))',
  border: '1.5px solid rgba(170,180,255,0.32)', backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const si = shotIndexAt(f);
  const shot = SHOTS[si];
  const prev = SHOTS[Math.max(0, si - 1)];
  const lf = f - shotStartF(si);
  const ease = interpolate(lf, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const mix = (a: number, b: number) => a + (b - a) * ease;
  const accent = shot.accent;

  // membrane potential readout
  const mvSeq = [-70, -70, -69, -79, -70, -71, -70, -69];
  const mv = mvSeq[Math.floor(f / 18) % mvSeq.length];
  const traceW = 324, traceH = 44;
  let trace = '';
  for (let x = 0; x <= traceW; x += 2) {
    const ph = ((x + t * 90) % 160) / 160;
    let y = traceH - 6 + Math.sin(x * 0.4 + t * 6) * 0.8;
    if (ph > 0.55 && ph < 0.6) y = interpolate(ph, [0.55, 0.57, 0.6], [traceH - 6, 4, traceH - 2]);
    else if (ph >= 0.6 && ph < 0.66) y = interpolate(ph, [0.6, 0.66], [traceH - 2, traceH - 6]);
    trace += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
  }

  // zoom count-up
  const zoom = Math.round(mix(prev === shot ? shot.zoom : prev.zoom, shot.zoom));
  const zoomScale = interpolate(lf, [0, 5, 14], [1.25, 1.25, 1], { extrapolateRight: 'clamp' });

  // typed info card
  const typed = (s: string, delay: number) => s.slice(0, Math.max(0, Math.floor((lf - delay) * 4.5)));

  const ions = shot.ions.map((v, i) => mix(prev.ions[i], v) + Math.sin(t * 5 + i * 2) * 0.8);
  const vel = Math.round(98 + Math.sin(t * 1.3) * 3 + Math.sin(t * 4.1) * 1.5);

  const logStart = Math.floor(f / 9);
  const pad = (n: number) => String(n).padStart(2, '0');

  const seqCols = ['#c9a64a', '#6a5aa8', '#6a5aa8', '#5a4a98', '#3a5a9a', '#7a5aa8', '#4a6aa8', '#8a4a7a', '#4a8aa8', '#a88a4a', '#4a6a8a', '#7a6a4a', '#9a4a8a', '#3a8a7a'];
  const blink = Math.floor(f / 12) % 2 === 0;
  const focusPulse = 1 + Math.sin(t * 4) * 0.03;

  return (
    <div style={{ position: 'absolute', inset: 0, color: C.text }}>
      {/* ---------- top panel ---------- */}
      <div style={{ ...panel, left: 16, top: 16, width: 1048, height: 212 }} />
      <Abs x={40} y={38} style={{ fontFamily: COND, fontWeight: 500, fontSize: 13, letterSpacing: 3, color: '#ff9a5c', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22, color: '#ff8a3c', lineHeight: '14px' }}>✳</span>POWERED BY
      </Abs>
      <Abs x={38} y={52} style={{ fontFamily: DISP, fontWeight: 700, fontSize: 43, letterSpacing: 0.5, lineHeight: '56px', background: 'linear-gradient(180deg,#ffc07a,#ff7a3a)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        CLAUDE OPUS 5.5
      </Abs>
      <Abs x={40} y={107} w={300} h={1} style={{ background: 'rgba(255,170,120,0.35)' }} />
      <Abs x={38} y={110} style={{ fontFamily: DISP, fontWeight: 700, fontSize: 50, letterSpacing: 2, lineHeight: '54px', color: '#efd2ff', textShadow: '0 0 14px #b06aff, 0 0 30px #8a3cff' }}>NEURON</Abs>
      <Abs x={40} y={160} style={{ fontFamily: COND, fontWeight: 500, fontSize: 15, letterSpacing: 3.4, color: C.text }}>STRUCTURE · SIGNAL · CONNECTION</Abs>
      <Abs x={40} y={182} style={{ fontFamily: COND, fontSize: 13, color: C.dim }}>false-color · 3D graphics</Abs>

      <Head x={380} y={40} w={300} l="NEURON PROFILE" />
      {[
        ['Type', 'multipolar · motor', C.text],
        ['Soma diameter', '4 - 100 µm', C.text],
        ['Axon length', 'up to ~1 m', C.text],
        ['Synapses / neuron', '~1 000 - 10 000', C.orange],
        ['Resting potential', '-70 mV', C.cyan],
      ].map(([l, v, c], i) => (
        <Abs key={i} x={380} y={66 + i * 23} w={300} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: COND, fontSize: 14 }}>
          <span style={{ color: C.label }}>{l}</span>
          <span style={{ color: c, fontWeight: 500 }}>{v}</span>
        </Abs>
      ))}

      <Head x={716} y={50} w={324} l="MEMBRANE POTENTIAL" r="mV · live" />
      <Abs x={714} y={74} style={{ fontFamily: DISP, fontWeight: 700, fontSize: 50, lineHeight: '56px', background: 'linear-gradient(180deg,#e6efff,#8fb6ff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>{mv}</Abs>
      <Abs x={816} y={84} style={{ fontFamily: COND, fontSize: 15, color: '#d6d9f5', lineHeight: '20px' }}>resting<br /><span style={{ fontSize: 13, color: C.dim }}>threshold -55 mV</span></Abs>
      <Abs x={716} y={120} w={traceW} h={traceH}>
        <svg width={traceW} height={traceH} style={{ overflow: 'visible' }}>
          <line x1={0} y1={traceH - 2} x2={traceW} y2={traceH - 2} stroke="rgba(255,211,74,0.25)" />
          <path d={trace} stroke={C.yellow} strokeWidth={2} fill="none" style={{ filter: 'drop-shadow(0 0 3px #ffb347)' }} />
        </svg>
      </Abs>
      <Abs x={716} y={172} style={{ fontFamily: COND, fontSize: 13.5, color: C.label }}>Na⁺ in → spike · K⁺ out → reset</Abs>

      {/* ---------- viewport overlay ---------- */}
      <svg width={1080} height={1350} style={{ position: 'absolute', inset: 0 }}>
        {[[30, 245, 1, 1], [1050, 245, -1, 1], [30, 970, 1, -1], [1050, 970, -1, -1]].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x},${y + 26 * sy} L${x},${y} L${x + 26 * sx},${y}`} stroke="rgba(225,230,255,0.85)" strokeWidth={2} fill="none" />
        ))}
        <g transform={`translate(540,588) scale(${focusPulse}) translate(-540,-588)`} stroke="rgba(255,240,200,0.7)" strokeWidth={1.6} fill="none">
          {[[444, 494, 1, 1], [636, 494, -1, 1], [444, 683, 1, -1], [636, 683, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M${x},${y + 16 * sy} L${x},${y} L${x + 16 * sx},${y}`} />
          ))}
          <circle cx={540} cy={588} r={4} />
          <line x1={524} y1={588} x2={532} y2={588} />
          <line x1={548} y1={588} x2={556} y2={588} />
        </g>
        {/* scale bar */}
        <g stroke="#e6e8ff" strokeWidth={2}>
          <line x1={926} y1={941} x2={1026} y2={941} />
          <line x1={926} y1={934} x2={926} y2={948} />
          <line x1={1026} y1={934} x2={1026} y2={948} />
        </g>
      </svg>
      <Abs x={651} y={497} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: C.yellow, opacity: 0.9 }}>FOCUS LOCK · {98 + (Math.floor(f / 20) % 2)}%</Abs>
      <Abs x={926} y={916} w={100} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 14, color: C.text }}>{shot.scale}</Abs>

      <Abs x={52} y={262} style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: COND, fontWeight: 500, fontSize: 15, letterSpacing: 2.2 }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: blink ? '#e8d870' : '#5a5a40', boxShadow: blink ? '0 0 8px #ffe070' : 'none' }} />
        LIVE · SHOT {pad(shot.n)} / 14
      </Abs>
      <Abs x={0} y={258} w={1080} style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${(1 - ease) * -8}px)`, opacity: 0.4 + 0.6 * ease, display: 'flex', alignItems: 'center', gap: 12, padding: '6px 18px', borderRadius: 30,
          background: 'rgba(24,28,64,0.78)', border: '1.5px solid rgba(160,175,255,0.45)', fontFamily: COND, fontWeight: 500, fontSize: 15, letterSpacing: 3.2, color: '#eef0ff' }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          {shot.pill}
        </div>
      </Abs>
      <Abs x={840} y={252} w={198} style={{ textAlign: 'right', fontFamily: DISP, fontWeight: 700, fontSize: 28, color: accent, textShadow: `0 0 10px ${accent}88`, transform: `scale(${zoomScale})`, transformOrigin: 'right center' }}>
        ×{fmtK(zoom)}
      </Abs>

      {/* info card */}
      <div style={{ ...panel, borderRadius: 14, left: 45, top: 835, width: 427, height: 122, overflow: 'hidden', transform: `translateX(${(1 - ease) * -30}px)`, opacity: 0.3 + 0.7 * ease }}>
        <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 4, background: accent, boxShadow: `0 0 10px ${accent}` }} />
        <div style={{ position: 'absolute', left: 18, top: 8, fontFamily: DISP, fontWeight: 700, fontSize: 27, letterSpacing: 1, color: accent, whiteSpace: 'nowrap' }}>{typed(shot.title, 0)}</div>
        <div style={{ position: 'absolute', left: 18, top: 42, fontFamily: COND, fontSize: 15, color: '#e0e4ff' }}>{typed(shot.sub, 4)}</div>
        {shot.bullets.map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: 18, top: 66 + i * 18, fontFamily: MONO, fontSize: 13, color: '#e6e8ff', whiteSpace: 'nowrap' }}>
            {lf > 8 + i * 6 ? '›  ' : ''}{typed(b, 10 + i * 6)}
          </div>
        ))}
      </div>

      {/* ---------- bottom panel ---------- */}
      <div style={{ ...panel, left: 16, top: 992, width: 1048, height: 342 }} />

      {/* locator */}
      <Head x={40} y={1006} w={250} l="LOCATOR · SECTION" r="live" />
      <Abs x={40} y={1035} w={250} h={210} style={{ borderRadius: 6, overflow: 'hidden', border: `1.5px solid ${accent}aa`, background: '#05041a', boxShadow: `inset 0 0 30px ${accent}33` }}>
        <svg width={250} height={210} viewBox="250 220 680 572" preserveAspectRatio="xMidYMid slice">
          <Defs />
          <FullNeuron t={t} lite insets />
        </svg>
        <div style={{ position: 'absolute', left: 250 * shot.loc[0], top: 210 * shot.loc[1], width: 250 * shot.loc[2], height: 210 * shot.loc[3], border: si === 0 || si === 14 ? 'none' : '1.5px solid #e6f0ff', boxShadow: '0 0 8px #8fb6ff' }} />
        {si !== 0 && si !== 14 ? (
          <>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 210 * (shot.loc[1] + shot.loc[3] / 2), height: 1, background: 'rgba(230,240,255,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 250 * (shot.loc[0] + shot.loc[2] / 2), width: 1, background: 'rgba(230,240,255,0.5)' }} />
          </>
        ) : null}
        <div style={{ position: 'absolute', left: 10, top: 6, fontFamily: MONO, fontSize: 12.5, color: C.yellow }}>{pad(shot.n)} / 14</div>
        <div style={{ position: 'absolute', right: 10, top: 7, fontFamily: COND, fontWeight: 500, fontSize: 12, letterSpacing: 1.5, color: accent }}>{shot.title}</div>
      </Abs>
      <Head x={40} y={1250} w={250} l="SHOT SEQUENCE" r="30 s loop" rc={C.dim} />
      {seqCols.map((c, i) => {
        const on = shot.n - 1 === i;
        return <Abs key={i} x={40 + i * 17.8} y={on ? 1276 : 1280} w={14} h={on ? 18 : 12} style={{ background: on ? accent : c, opacity: on ? 1 : 0.75, boxShadow: on ? `0 0 10px ${accent}` : 'none' }} />;
      })}
      <Abs x={40} y={1306} style={{ fontFamily: COND, fontSize: 13, color: C.label }}>whole neuron → parts → whole</Abs>

      {/* ion channels */}
      <Head x={322} y={1006} w={236} l="ION CHANNELS" r="open fraction" />
      {[['Na⁺ in', '#ffc24a'], ['K⁺ out', '#4dd0ff'], ['Ca²⁺ bouton', '#ff6ab0'], ['Na⁺/K⁺ pump', '#9a8aff']].map(([l, c], i) => (
        <React.Fragment key={i}>
          <Abs x={322} y={1034 + i * 24} style={{ fontFamily: COND, fontSize: 13.5, color: C.label }}>{l}</Abs>
          <Abs x={414} y={1038 + i * 24} w={104} h={10} style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: `${Math.max(2, ions[i])}%`, height: '100%', background: c, boxShadow: `0 0 6px ${c}` }} />
          </Abs>
          <Abs x={520} y={1034 + i * 24} w={38} style={{ textAlign: 'right', fontFamily: MONO, fontSize: 12.5 }}>{Math.round(ions[i])}%</Abs>
        </React.Fragment>
      ))}
      <Head x={322} y={1148} w={236} l="CONDUCTION VELOCITY" r="m/s" />
      <svg width={80} height={80} style={{ position: 'absolute', left: 322, top: 1176 }}>
        <circle cx={40} cy={40} r={30} stroke="rgba(127,214,255,0.15)" strokeWidth={6} fill="none" />
        <circle cx={40} cy={40} r={30} stroke="#5fd0ff" strokeWidth={6} fill="none" strokeDasharray={`${(vel / 120) * 188} 200`} transform="rotate(130 40 40)" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #5fd0ff)' }} />
      </svg>
      <Abs x={322} y={1204} w={80} style={{ textAlign: 'center', fontFamily: DISP, fontWeight: 700, fontSize: 19 }}>{vel}</Abs>
      <Abs x={322} y={1245} w={80} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.dim }}>m/s</Abs>
      {[['myelinated · up to 120', C.text], ['bare axon 0.5 - 2 m/s', C.label], ['saltatory: node → node', C.cyan], ['node every ~1 mm', C.orange]].map(([s, c], i) => (
        <Abs key={i} x={408} y={1178 + i * 18} style={{ fontFamily: COND, fontSize: 13, color: c }}>{s}</Abs>
      ))}
      <svg width={236} height={34} style={{ position: 'absolute', left: 322, top: 1256 }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const hot = Math.abs(i - ((f / 3) % 30)) < 1.5;
          const h = hot ? 22 : 2 + rnd('hb' + i + Math.floor(f / 6)) * 4;
          return <rect key={i} x={i * 8} y={32 - h} width={6} height={h} fill={hot ? '#ffc24a' : '#4a5ab0'} opacity={hot ? 1 : 0.7} />;
        })}
      </svg>

      {/* synapse live + focus */}
      <Head x={590} y={1006} w={210} l="SYNAPSE · LIVE" r="glutamate" rc={C.pink} />
      {[
        ['Vesicles / spike', shot.syn.ves / 5, String(shot.syn.ves), '#ffb347'],
        ['Glutamate cleft', parseFloat(shot.syn.glu), `${shot.syn.glu} mM`, '#ff6ab0'],
        ['AMPA open', shot.syn.ampa / 100, `${shot.syn.ampa} %`, '#ff6ab0'],
        ['EPSP', parseFloat(shot.syn.epsp), `${shot.syn.epsp} mV`, '#8fb6ff'],
      ].map(([l, frac, v, c], i) => (
        <React.Fragment key={i}>
          <Abs x={590} y={1034 + i * 24} style={{ fontFamily: COND, fontSize: 13.5, color: C.label }}>{l as string}</Abs>
          <Abs x={686} y={1038 + i * 24} w={50} h={10} style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: `${Math.max(3, (frac as number) * 100 * ease)}%`, height: '100%', background: c as string }} />
          </Abs>
          <Abs x={736} y={1034 + i * 24} w={64} style={{ textAlign: 'right', fontFamily: MONO, fontSize: 12.5 }}>{v as string}</Abs>
        </React.Fragment>
      ))}
      <Head x={590} y={1148} w={210} l="FOCUS" r="zoom" />
      <Abs x={590} y={1172} style={{ fontFamily: DISP, fontWeight: 700, fontSize: 36, lineHeight: '40px' }}>×{fmtK(zoom)}</Abs>
      <Abs x={590} y={1216} style={{ fontFamily: COND, fontWeight: 500, fontSize: 13, letterSpacing: 1.6, color: accent }}>{shot.title}</Abs>
      <Abs x={590} y={1236} style={{ fontFamily: MONO, fontSize: 12.5, color: C.label }}>scale bar {shot.scale}</Abs>
      <svg width={210} height={30} style={{ position: 'absolute', left: 590, top: 1258 }}>
        <path d={Array.from({ length: 106 }).map((_, i) => `${i ? 'L' : 'M'}${i * 2},${(15 + Math.sin(i * 0.12 + t * 3) * 7 + Math.sin(i * 0.31 - t * 2) * 3).toFixed(1)}`).join(' ')} stroke={C.yellow} strokeWidth={1.6} fill="none" />
      </svg>

      {/* raster + log */}
      <Head x={830} y={1006} w={210} l="SPIKE RASTER" ls={1.4} r={<><span style={{ color: C.pink }}>8 neurons</span> · 2.5 s</>} rc={C.orange} />
      <svg width={210} height={70} style={{ position: 'absolute', left: 830, top: 1030 }}>
        {Array.from({ length: 8 }).map((_, r) => (
          <g key={r}>
            <line x1={0} y1={r * 8.5 + 4} x2={210} y2={r * 8.5 + 4} stroke="rgba(255,255,255,0.04)" />
            {Array.from({ length: 4 }).map((_, k) => {
              const x = ((rnd('rs' + r + k) * 210 - t * 84) % 210 + 210) % 210;
              return <rect key={k} x={x} y={r * 8.5} width={2} height={8} fill={r === 0 ? '#ffc24a' : '#ff8ac8'} opacity={0.85} />;
            })}
          </g>
        ))}
      </svg>
      <Abs x={830} y={1105} w={210} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: COND, fontSize: 11.5, color: C.label }}>
        <span>row 1 = this axon</span><span style={{ fontFamily: MONO, fontSize: 12, color: C.text }}>ev/250ms {2 + (Math.floor(f / 30) % 2)}</span>
      </Abs>
      <Head x={830} y={1126} w={210} l="NEURON LOG" r="live" />
      {Array.from({ length: 9 }).map((_, i) => {
        const idx = logStart + i;
        const last = i === 8;
        const code = String(Math.floor(rnd('lg' + idx) * 900) + 100);
        return (
          <Abs key={i} x={834} y={1152 + i * 15} style={{ fontFamily: MONO, fontSize: 11, whiteSpace: 'nowrap', color: last ? '#ffe9a0' : '#c8ccef', opacity: last ? 1 : 0.4 + i * 0.07 }}>
            {last ? '›' : ' '}{code} {LOG_LINES[idx % LOG_LINES.length]}
          </Abs>
        );
      })}
    </div>
  );
};
