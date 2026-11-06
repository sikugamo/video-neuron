import React from 'react';
import { blob, chainD, cubicPt, P, rnd, sampleChain, Seg, tree } from './geom';
import { SceneKey } from './data';

type SP = { t: number; lite?: boolean };
const F = (id: string, lite?: boolean) => (lite ? undefined : `url(#${id})`);

/* ---------- shared defs (one per svg) ---------- */
export const Defs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="bloom" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
      <feColorMatrix in="b" type="matrix" values="1.8 0 0 0 -0.5  0 1.8 0 0 -0.5  0 0 1.8 0 -0.5  0 0 0 1 0" result="bb" />
      <feBlend in="SourceGraphic" in2="bb" mode="screen" />
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4" /></filter>
    <filter id="soft6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
    <radialGradient id="bg"><stop offset="0" stopColor="#0e0a3a" /><stop offset="0.55" stopColor="#060420" /><stop offset="1" stopColor="#02010a" /></radialGradient>
    <radialGradient id="spkO"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.25" stopColor="#ffb347" /><stop offset="0.6" stopColor="#ff5a3c" stopOpacity="0.35" /><stop offset="1" stopColor="#ff3c6a" stopOpacity="0" /></radialGradient>
    <radialGradient id="spkP"><stop offset="0" stopColor="#ffe9ff" /><stop offset="0.3" stopColor="#ff7ad9" /><stop offset="1" stopColor="#8a3cff" stopOpacity="0" /></radialGradient>
    <radialGradient id="spkB"><stop offset="0" stopColor="#ffffff" /><stop offset="0.3" stopColor="#8fc0ff" /><stop offset="1" stopColor="#3a5cff" stopOpacity="0" /></radialGradient>
    <radialGradient id="haloV"><stop offset="0" stopColor="#7a3cff" stopOpacity="0.55" /><stop offset="1" stopColor="#7a3cff" stopOpacity="0" /></radialGradient>
    <radialGradient id="haloB"><stop offset="0" stopColor="#2a5cff" stopOpacity="0.45" /><stop offset="1" stopColor="#2a5cff" stopOpacity="0" /></radialGradient>
    <radialGradient id="nuc" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stopColor="#f0c4ff" /><stop offset="0.3" stopColor="#c46cf5" /><stop offset="0.75" stopColor="#7424c0" /><stop offset="1" stopColor="#2c0a62" /></radialGradient>
    <radialGradient id="nucDark" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stopColor="#3a1a66" /><stop offset="0.6" stopColor="#170932" /><stop offset="1" stopColor="#07021a" /></radialGradient>
    <radialGradient id="soma" cx="0.45" cy="0.45"><stop offset="0" stopColor="#ff8a4a" /><stop offset="0.55" stopColor="#d0337a" /><stop offset="0.85" stopColor="#5a2ad0" /><stop offset="1" stopColor="#3a6cff" /></radialGradient>
    <radialGradient id="cyto" cx="0.5" cy="0.5"><stop offset="0" stopColor="#2a1880" /><stop offset="0.8" stopColor="#1a1060" /><stop offset="1" stopColor="#3a5cff" /></radialGradient>
    <radialGradient id="mitoF"><stop offset="0" stopColor="#ff6a2a" /><stop offset="0.7" stopColor="#c0201a" /><stop offset="1" stopColor="#ff5a2a" /></radialGradient>
    <radialGradient id="bulb" cx="0.45" cy="0.42"><stop offset="0" stopColor="#fff0c8" /><stop offset="0.3" stopColor="#ffb04a" /><stop offset="0.7" stopColor="#e0408a" /><stop offset="1" stopColor="#5a3cff" /></radialGradient>
    <radialGradient id="vesicle" cx="0.45" cy="0.4"><stop offset="0" stopColor="#ffd59a" /><stop offset="0.45" stopColor="#ff8a5a" /><stop offset="0.8" stopColor="#b03ab0" /><stop offset="1" stopColor="#6a3cff" /></radialGradient>
    <linearGradient id="myel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a6cff" stopOpacity="0.55" /><stop offset="0.35" stopColor="#bfe2ff" stopOpacity="0.75" /><stop offset="0.65" stopColor="#7fb4ff" stopOpacity="0.55" /><stop offset="1" stopColor="#2a4cd0" stopOpacity="0.6" /></linearGradient>
    <linearGradient id="myelV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a6cff" stopOpacity="0.55" /><stop offset="0.35" stopColor="#bfe2ff" stopOpacity="0.75" /><stop offset="0.65" stopColor="#7fb4ff" stopOpacity="0.55" /><stop offset="1" stopColor="#2a4cd0" stopOpacity="0.6" /></linearGradient>
  </defs>
);

/* ---------- primitives ---------- */
const Backdrop: React.FC<{ tint?: string }> = ({ tint }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2150} fill="#04031a" />
    <rect x={-400} y={-400} width={1880} height={2150} fill="url(#bg)" />
    <ellipse cx={300} cy={400} rx={600} ry={500} fill="url(#haloV)" opacity={0.5} />
    <ellipse cx={850} cy={1000} rx={600} ry={500} fill="url(#haloB)" opacity={0.6} />
    {tint ? <rect x={-400} y={-400} width={1880} height={2150} fill={tint} /> : null}
  </g>
);

const Spark: React.FC<{ x: number; y: number; r: number; c?: 'O' | 'P' | 'B'; o?: number }> = ({ x, y, r, c = 'O', o = 1 }) => (
  <circle cx={x} cy={y} r={r} fill={`url(#spk${c})`} opacity={o} />
);

const Dendrite: React.FC<{ segs: Seg[]; lite?: boolean; dots?: number; seed: string; col?: string }> = ({ segs, lite, dots = 0.5, seed, col = '#5a82ff' }) => (
  <g filter={F('glow', lite)}>
    {segs.map((s, i) => <path key={'a' + i} d={s.d} stroke="#1c2aa0" strokeWidth={s.w + 4} fill="none" strokeLinecap="round" opacity={0.85} />)}
    {segs.map((s, i) => <path key={'b' + i} d={s.d} stroke={col} strokeWidth={s.w} fill="none" strokeLinecap="round" />)}
    {segs.map((s, i) => <path key={'c' + i} d={s.d} stroke="#d6e6ff" strokeWidth={Math.max(0.8, s.w * 0.28)} fill="none" strokeLinecap="round" opacity={0.85} />)}
    {segs.map((s, i) =>
      rnd(seed + 'd' + i) < dots ? (
        <Spark key={'d' + i} x={(s.a[0] + s.b[0]) / 2} y={(s.a[1] + s.b[1]) / 2} r={4 + s.w * 0.7} c={rnd(seed + 'c' + i) > 0.7 ? 'P' : 'O'} />
      ) : null,
    )}
  </g>
);

// Faint background network of neurons
const Field: React.FC<{ seed: string; n?: number; lite?: boolean; t: number; scale?: number; o?: number }> = ({ seed, n = 14, lite, t, scale = 1, o = 0.75 }) => {
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = rnd(seed + 'x' + i) * 1280 - 100, y = rnd(seed + 'y' + i) * 1500 - 80;
    const r = (5 + rnd(seed + 'r' + i) * 9) * scale;
    const segs: Seg[] = [];
    const k = 4 + Math.floor(rnd(seed + 'k' + i) * 3);
    for (let j = 0; j < k; j++) tree(seed + i + '_' + j, x, y, (j / k) * Math.PI * 2 + rnd(seed + 'o' + i), (50 + rnd(seed + 'L' + i + j) * 60) * scale, 2, 3 * scale, segs, 0.5);
    const tw = 0.6 + 0.4 * Math.sin(t * 2.2 + i * 1.7);
    items.push(
      <g key={i} opacity={(0.35 + rnd(seed + 'op' + i) * 0.5) * o}>
        {segs.map((s, j) => <path key={j} d={s.d} stroke="#4a66ff" strokeWidth={s.w} fill="none" strokeLinecap="round" opacity={0.8} />)}
        <circle cx={x} cy={y} r={r * 1.4} fill="#6a3cd0" opacity={0.6} />
        <Spark x={x} y={y} r={r * 3.2 * tw + r} />
      </g>,
    );
  }
  return <g filter={F('soft', lite)}>{items}</g>;
};

const Particles: React.FC<{ seed: string; n: number; t: number; c?: 'O' | 'P' | 'B'; speed?: number; r?: number }> = ({ seed, n, t, c = 'B', speed = 12, r = 4 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = rnd(seed + 'x' + i) * 1080 + Math.sin(t * 0.7 + i) * 10;
      const y = ((rnd(seed + 'y' + i) * 1500 - t * speed * (0.5 + rnd(seed + 's' + i))) % 1500 + 1500) % 1500 - 75;
      return <Spark key={i} x={x} y={y} r={r * (0.5 + rnd(seed + 'r' + i) * 1.5)} c={c} o={0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))} />;
    })}
  </g>
);

const Mito: React.FC<{ x: number; y: number; rx: number; ry: number; rot: number; lite?: boolean }> = ({ x, y, rx, ry, rot, lite }) => {
  let d = '';
  const n = 7;
  for (let i = 0; i < n; i++) {
    const xx = -rx * 0.75 + (i / (n - 1)) * rx * 1.5;
    const hh = ry * 0.62 * Math.sqrt(Math.max(0, 1 - (xx / rx) ** 2));
    d += `M${xx.toFixed(1)},${(i % 2 ? -hh : hh).toFixed(1)} L${xx.toFixed(1)},${(i % 2 ? hh * 0.2 : -hh * 0.2).toFixed(1)} `;
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} filter={F('glow', lite)}>
      <ellipse rx={rx} ry={ry} fill="url(#mitoF)" stroke="#ffb070" strokeWidth={Math.max(1.5, ry * 0.12)} />
      <path d={d} stroke="#ffd59a" strokeWidth={Math.max(1, ry * 0.12)} strokeLinecap="round" fill="none" />
    </g>
  );
};

/* ---------- 01 full neuron ---------- */
const AXON: [P, P, P, P][] = [
  [[528, 452], [470, 560], [462, 690], [500, 790]],
  [[500, 790], [535, 880], [600, 920], [668, 952]],
];
const SOMA_C: P = [560, 372];

export const FullNeuron: React.FC<SP & { insets?: boolean }> = ({ t, lite, insets = true }) => {
  const dend: Seg[] = [];
  [-2.75, -2.25, -1.75, -1.25, -0.75, -0.2, 0.35, 2.75, 2.25].forEach((a, i) =>
    tree('fd' + i, SOMA_C[0] + Math.cos(a) * 80, SOMA_C[1] + Math.sin(a) * 80, a, 120 + rnd('fl' + i) * 70, 3, 11, dend, 0.5),
  );
  const term: Seg[] = [];
  [0.25, 0.85, 1.4].forEach((a, i) => tree('ft' + i, 668, 952, a, 70, 2, 7, term, 0.45));
  const caps = sampleChain(AXON, 62).slice(1, -1);
  const pulse = (t * 0.55) % 1;
  const pp = sampleChain(AXON, 4);
  const pk = pp[Math.floor(pulse * (pp.length - 1))].p;
  return (
    <g>
      <Backdrop />
      <Field seed="fullbg" t={t} n={16} lite={lite} />
      <Dendrite segs={dend} lite={lite} seed="fdd" dots={0.35} />
      {/* axon core */}
      <path d={chainD(AXON)} stroke="#ff9a3c" strokeWidth={6} fill="none" filter={F('glow2', lite)} />
      {caps.map((c, i) => (
        <g key={i} transform={`translate(${c.p[0]},${c.p[1]}) rotate(${(c.a * 180) / Math.PI})`}>
          <rect x={-27} y={-19} width={54} height={38} rx={15} fill="url(#myelV)" stroke="#d6ecff" strokeWidth={1.6} opacity={0.92} />
          <rect x={-22} y={-14} width={44} height={6} rx={3} fill="#ffffff" opacity={0.25} />
          <Spark x={31} y={0} r={9} />
        </g>
      ))}
      <Spark x={pk[0]} y={pk[1]} r={34} o={0.9} />
      <Dendrite segs={term} lite={lite} seed="ftt" dots={0} />
      {term.filter((s) => s.depth === 2).map((s, i) => (
        <g key={i} filter={F('glow', lite)}>
          <circle cx={s.b[0]} cy={s.b[1]} r={10} fill="url(#bulb)" stroke="#9fc4ff" strokeWidth={1.5} />
        </g>
      ))}
      {/* soma */}
      <g filter={F('glow', lite)}>
        <path d={blob(SOMA_C[0], SOMA_C[1], 98, 'soma', 16, 0.1, 1, 1.05)} fill="url(#soma)" stroke="#8fb6ff" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${505 - i * 7},${340 + i * 4} q-10,35 6,70`} stroke="#ffb347" strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
        <Mito x={590} y={440} rx={22} ry={9} rot={-20} lite />
        <Mito x={520} y={300} rx={18} ry={8} rot={30} lite />
        <circle cx={585} cy={355} r={50} fill="url(#nuc)" stroke="#f0c8ff" strokeWidth={2} />
        <circle cx={578} cy={362} r={14} fill="url(#nucDark)" />
      </g>
      {insets ? (
        <g>
          <circle cx={728} cy={662} r={150} fill="#070826" stroke="#cfd8ff" strokeOpacity={0.35} strokeWidth={2} />
          <clipPath id="mag"><circle cx={728} cy={662} r={148} /></clipPath>
          <g clipPath="url(#mag)">
            <g transform="translate(728,662) scale(0.36) translate(-540,-640)"><SynapseG t={t} lite /></g>
          </g>
          <circle cx={430} cy={958} r={118} fill="#070826" stroke="#cfd8ff" strokeOpacity={0.3} strokeWidth={2} />
          <clipPath id="mag2"><circle cx={430} cy={958} r={116} /></clipPath>
          <g clipPath="url(#mag2)"><g transform="translate(430,958) scale(0.3) translate(-540,-620)"><CrossG t={t} lite /></g></g>
        </g>
      ) : null}
    </g>
  );
};

/* ---------- 02 soma ---------- */
const Soma: React.FC<SP> = ({ t, lite }) => {
  const trunks: Seg[] = [];
  [-2.4, -1.5, -0.55, 0.5, 2.6].forEach((a, i) => tree('st' + i, 560 + Math.cos(a) * 330, 600 + Math.sin(a) * 330, a, 260, 2, 46, trunks, 0.45));
  return (
    <g>
      <Backdrop />
      <Field seed="somabg" t={t} n={10} lite={lite} scale={1.6} />
      <Dendrite segs={trunks} lite={lite} seed="sdd" dots={0.4} />
      <g filter={F('glow', lite)}>
        <path d={blob(560, 600, 360, 'somab', 14, 0.07)} fill="url(#cyto)" stroke="#5a8cff" strokeWidth={34} />
        <path d={blob(560, 600, 360, 'somab', 14, 0.07)} fill="none" stroke="#cfe4ff" strokeWidth={8} strokeDasharray="2 10" opacity={0.8} />
      </g>
      {Array.from({ length: 140 }).map((_, i) => {
        const a = rnd('sp' + i) * Math.PI * 2, r = Math.sqrt(rnd('sr' + i)) * 320;
        return <circle key={i} cx={560 + Math.cos(a) * r} cy={600 + Math.sin(a) * r} r={1.5 + rnd('sz' + i) * 3} fill={rnd('sc' + i) > 0.5 ? '#7fb4ff' : '#c58bff'} opacity={0.6} />;
      })}
      {/* ER rings */}
      <g filter={F('glow', lite)} fill="none">
        {[205, 230, 255].map((r, i) => (
          <path key={i} d={blob(615, 560, r, 'er' + i, 20, 0.05)} stroke="#6f9cff" strokeWidth={9} strokeDasharray="60 16" opacity={0.8} />
        ))}
        {Array.from({ length: 50 }).map((_, i) => {
          const a = (i / 50) * Math.PI * 2;
          return <circle key={i} cx={615 + Math.cos(a) * 218} cy={560 + Math.sin(a) * 218} r={4} fill="#ff4a6a" />;
        })}
      </g>
      {/* golgi */}
      <g filter={F('glow', lite)} fill="none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${300 + i * 16},${600 + i * 4} q-40,90 30,190`} stroke={i % 2 ? '#ffb347' : '#ff8a3c'} strokeWidth={11} strokeLinecap="round" />
        ))}
      </g>
      <Mito x={430} y={870} rx={80} ry={34} rot={-15} lite={lite} />
      <Mito x={790} y={830} rx={70} ry={30} rot={25} lite={lite} />
      <Mito x={350} y={430} rx={60} ry={26} rot={-55} lite={lite} />
      <g filter={F('glow2', lite)}>
        <circle cx={615} cy={560} r={175} fill="url(#nuc)" stroke="#f0c8ff" strokeWidth={3} />
      </g>
      {Array.from({ length: 50 }).map((_, i) => {
        const a = rnd('np' + i) * Math.PI * 2, r = Math.sqrt(rnd('nr' + i)) * 160;
        return <circle key={i} cx={615 + Math.cos(a) * r} cy={560 + Math.sin(a) * r} r={3 + rnd('nz' + i) * 3} fill="#3a0a6a" stroke="#f0c8ff" strokeWidth={1} opacity={0.7} />;
      })}
      <circle cx={590} cy={585} r={44} fill="url(#nucDark)" />
      <Particles seed="sopa" n={30} t={t} c="O" />
    </g>
  );
};

/* ---------- 03 nucleus ---------- */
const Pores: React.FC<{ cx: number; cy: number; R: number; n: number; seed: string }> = ({ cx, cy, R, n, seed }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const u = rnd(seed + 'u' + i) * 2 - 1, th = rnd(seed + 't' + i) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const x = Math.cos(th) * s, y = Math.sin(th) * s, z = u;
      if (z < 0.05) return null;
      const r = (6 + rnd(seed + 'r' + i) * 6) * (R / 360);
      const ang = (Math.atan2(y, x) * 180) / Math.PI;
      return (
        <ellipse key={i} cx={cx + x * R} cy={cy + y * R} rx={r * z + 1} ry={r} transform={`rotate(${ang},${cx + x * R},${cy + y * R})`}
          fill="#2a0858" stroke="#f4d0ff" strokeWidth={1.4} opacity={0.4 + z * 0.6} />
      );
    })}
  </g>
);

const Nucleus: React.FC<SP> = ({ t, lite }) => {
  const fib: Seg[] = [];
  [[-60, 1250, -0.9], [1140, 1300, -2.3], [1140, 150, 2.4]].forEach(([x, y, a], i) => tree('nf' + i, x, y, a, 260, 2, 50, fib, 0.4));
  return (
    <g>
      <Backdrop tint="rgba(60,20,120,0.25)" />
      <Dendrite segs={fib} lite={lite} seed="nfd" dots={0.5} col="#4a7dff" />
      <g filter={F('glow2', lite)}><circle cx={560} cy={610} r={365} fill="url(#nuc)" stroke="#e8b8ff" strokeWidth={5} /></g>
      <circle cx={520} cy={640} r={120} fill="url(#nucDark)" stroke="#b070ff" strokeWidth={3} opacity={0.92} filter={F('glow', lite)} />
      <Pores cx={560} cy={610} R={362} n={260} seed="np" />
      {Array.from({ length: 90 }).map((_, i) => {
        const a = rnd('cs' + i) * Math.PI * 2, r = Math.sqrt(rnd('cr' + i)) * 330;
        return <circle key={i} cx={560 + Math.cos(a) * r} cy={610 + Math.sin(a) * r} r={1.5 + rnd('cz' + i) * 2.5} fill="#ffe0ff" opacity={0.35 + 0.4 * Math.sin(t * 4 + i) ** 2} />;
      })}
      <Particles seed="nupa" n={26} t={t} c="P" r={5} />
    </g>
  );
};

/* ---------- 04 nucleolus ---------- */
const Nucleolus: React.FC<SP> = ({ t, lite }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2150} fill="#2a0a52" />
    <circle cx={540} cy={610} r={900} fill="url(#nuc)" opacity={0.75} />
    <g opacity={0.7}>
      {Array.from({ length: 160 }).map((_, i) => {
        const a = rnd('ls' + i) * Math.PI * 2;
        const r0 = 290 + ((rnd('lr' + i) * 500 + t * 260) % 520);
        const L = 40 + rnd('ll' + i) * 120;
        return (
          <line key={i} x1={540 + Math.cos(a) * r0} y1={610 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + L)} y2={610 + Math.sin(a) * (r0 + L)}
            stroke={rnd('lc' + i) > 0.5 ? '#f4d0ff' : '#ff9ae0'} strokeWidth={1.5 + rnd('lw' + i) * 2.5} strokeLinecap="round" />
        );
      })}
    </g>
    <Pores cx={540} cy={610} R={760} n={140} seed="np2" />
    <g filter={F('glow2', lite)}>
      <circle cx={540} cy={610} r={285} fill="url(#nucDark)" stroke="#c88aff" strokeWidth={6} />
    </g>
    {Array.from({ length: 70 }).map((_, i) => {
      const a = rnd('gs' + i) * Math.PI * 2, r = Math.sqrt(rnd('gr' + i)) * 260;
      return <circle key={i} cx={540 + Math.cos(a) * r} cy={610 + Math.sin(a) * r} r={2 + rnd('gz' + i) * 5} fill="#9a5cff" opacity={0.25 + 0.3 * Math.sin(t * 3 + i) ** 2} />;
    })}
    <ellipse cx={470} cy={520} rx={120} ry={70} fill="#ffffff" opacity={0.06} />
    <Particles seed="nlpa" n={40} t={t} c="P" r={5} speed={30} />
  </g>
);

/* ---------- 05 nissl substance ---------- */
const Nissl: React.FC<SP> = ({ t, lite }) => (
  <g>
    <Backdrop />
    <g filter={F('glow2', lite)}><circle cx={1060} cy={560} r={320} fill="url(#nuc)" stroke="#e8b8ff" strokeWidth={5} /></g>
    <Pores cx={1060} cy={560} R={318} n={120} seed="np3" />
    {Array.from({ length: 8 }).map((_, i) => {
      const o = i * 92 - 40;
      const p0: P = [-80, 560 + o], p1: P = [240, 420 + o], p2: P = [520, 200 + o * 0.7], p3: P = [820, 60 + o * 0.6];
      const d = `M${p0} C${p1} ${p2} ${p3}`;
      const rib = Array.from({ length: 28 }).map((_, k) => {
        const tt = k / 27 + 0.01;
        const q = cubicPt(p0, p1, p2, p3, tt), q2 = cubicPt(p0, p1, p2, p3, tt + 0.01);
        const a = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
        const side = k % 2 ? 1 : -1;
        return <circle key={k} cx={q[0] - Math.sin(a) * 26 * side} cy={q[1] + Math.cos(a) * 26 * side} r={5 + rnd('rb' + i + k) * 3} fill="#ff3d5a" />;
      });
      return (
        <g key={i} filter={F('glow', lite)}>
          <path d={d} stroke="#1a2a9a" strokeWidth={54} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#4f7cff" strokeWidth={42} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#bfe0ff" strokeWidth={5} fill="none" transform="translate(0,-11)" opacity={0.9} />
          <path d={d} stroke="#9fc8ff" strokeWidth={2} fill="none" transform="translate(0,9)" opacity={0.6} strokeDasharray="5 9" />
          {rib}
        </g>
      );
    })}
    <Particles seed="nipa" n={30} t={t} c="O" />
  </g>
);

/* ---------- 06 mitochondria ---------- */
const MitoScene: React.FC<SP> = ({ t, lite }) => {
  const rx = 360, ry = 180;
  let d = '';
  const n = 13;
  for (let i = 0; i < n; i++) {
    const x = -rx * 0.82 + (i / (n - 1)) * rx * 1.64;
    const h = ry * 0.78 * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
    const top = i % 2 === 0;
    d += `M${x.toFixed(1)},${(top ? -h : h).toFixed(1)} Q${(x + 18).toFixed(1)},0 ${x.toFixed(1)},${(top ? h * 0.25 : -h * 0.25).toFixed(1)} `;
  }
  return (
    <g>
      <Backdrop tint="rgba(80,20,140,0.35)" />
      <g filter={F('glow', lite)} fill="none" opacity={0.85}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M-60,${120 + i * 70} C300,${40 + i * 50} 700,${150 + i * 30} 1140,${40 + i * 40}`} stroke="#4f7cff" strokeWidth={22} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={'b' + i} d={`M-60,${1080 + i * 70} C300,${980 + i * 40} 700,${1120 + i * 30} 1140,${1000 + i * 50}`} stroke="#4f7cff" strokeWidth={22} />
        ))}
      </g>
      <circle cx={1000} cy={260} r={200} fill="url(#nuc)" opacity={0.7} />
      <g transform={`translate(540,610) rotate(${-12 + Math.sin(t) * 2})`}>
        <g filter={F('glow2', lite)}>
          <ellipse rx={rx} ry={ry} fill="#7a1010" stroke="#ff6a2a" strokeWidth={22} />
        </g>
        <ellipse rx={rx - 30} ry={ry - 28} fill="url(#mitoF)" opacity={0.85} />
        <clipPath id="mclip"><ellipse rx={rx - 28} ry={ry - 26} /></clipPath>
        <g clipPath="url(#mclip)" filter={F('glow', lite)}>
          <path d={d} stroke="#ff3a1a" strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#ffd59a" strokeWidth={9} fill="none" strokeLinecap="round" />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={(rnd('mx' + i) - 0.5) * rx * 1.6} cy={(rnd('my' + i) - 0.5) * ry * 1.4} r={3} fill="#fff0c8" opacity={0.5 + 0.5 * Math.sin(t * 5 + i)} />
          ))}
        </g>
        <ellipse rx={rx - 8} ry={ry - 6} fill="none" stroke="#ffd0a0" strokeWidth={3} opacity={0.8} />
      </g>
      <Particles seed="mipa" n={30} t={t} c="O" />
    </g>
  );
};

/* ---------- 07 dendrites ---------- */
const Dendrites: React.FC<SP> = ({ t, lite }) => {
  const segs = tree('dm', -60, 1020, -0.72, 360, 4, 30, [], 0.5);
  const spines: React.ReactNode[] = [];
  segs.forEach((s, i) => {
    if (s.w < 4) return;
    const k = Math.floor(s.w / 3);
    for (let j = 0; j < k; j++) {
      const f = (j + 0.5) / k;
      const x = s.a[0] + (s.b[0] - s.a[0]) * f, y = s.a[1] + (s.b[1] - s.a[1]) * f;
      const side = rnd('sd' + i + j) > 0.5 ? 1 : -1;
      const L = s.w * 0.5 + 10 + rnd('sl' + i + j) * 14;
      const a = s.ang + side * (Math.PI / 2 + (rnd('sa' + i + j) - 0.5) * 0.8);
      const ex = x + Math.cos(a) * (L + s.w / 2), ey = y + Math.sin(a) * (L + s.w / 2);
      spines.push(
        <g key={i + '_' + j}>
          <line x1={x} y1={y} x2={ex} y2={ey} stroke="#7fa4ff" strokeWidth={3} strokeLinecap="round" />
          <Spark x={ex} y={ey} r={9 + 4 * Math.sin(t * 4 + i + j) ** 2} />
        </g>,
      );
    }
  });
  return (
    <g>
      <Backdrop />
      <Field seed="dbg" t={t} n={18} lite={lite} scale={1.2} />
      <circle cx={820} cy={430} r={70} fill="url(#nuc)" opacity={0.35} filter={F('soft6', lite)} />
      <Dendrite segs={segs} lite={lite} seed="dmd" dots={0} />
      <g filter={F('glow', lite)}>{spines}</g>
    </g>
  );
};

/* ---------- 08 axon initial segment ---------- */
const AIS: React.FC<SP> = ({ t, lite }) => {
  const cols = ['#ffb347', '#ff7bd5', '#ffd36a', '#ff8a5a', '#d58aff'];
  return (
    <g>
      <Backdrop />
      <Field seed="abg" t={t} n={10} lite={lite} />
      <g transform="translate(330,860) rotate(-44.5)">
        {/* downstream axon + first myelin wrap */}
        <rect x={-900} y={-52} width={900} height={104} fill="#2a4ad0" opacity={0.7} />
        <g filter={F('glow', lite)}>
          <rect x={-150} y={-74} width={130} height={148} rx={40} fill="url(#myelV)" stroke="#d6ecff" strokeWidth={3} />
          <rect x={-440} y={-74} width={270} height={148} rx={40} fill="url(#myelV)" stroke="#d6ecff" strokeWidth={3} />
        </g>
        <g filter={F('glow2', lite)}>
          <path d="M0,-62 C300,-72 520,-160 860,-360 L860,360 C520,160 300,72 0,62 Z" fill="#3a2a9a" opacity={0.55} stroke="#6f9cff" strokeWidth={14} />
        </g>
        <path d="M0,-62 C300,-72 520,-160 860,-360" stroke="#d6ecff" strokeWidth={4} fill="none" strokeDasharray="3 8" />
        <path d="M0,62 C300,72 520,160 860,360" stroke="#d6ecff" strokeWidth={4} fill="none" strokeDasharray="3 8" />
        <g filter={F('glow', lite)}>
          {Array.from({ length: 70 }).map((_, i) => {
            const y0 = (rnd('ay' + i) - 0.5) * 640, y1 = (rnd('ab' + i) - 0.5) * 70;
            const d = `M880,${y0.toFixed(1)} C460,${(y0 * 0.45).toFixed(1)} 200,${y1.toFixed(1)} -500,${(y1 * 0.6).toFixed(1)}`;
            return (
              <path key={i} d={d} stroke={cols[i % cols.length]} strokeWidth={1.5 + rnd('aw' + i) * 3.5} fill="none" opacity={0.85}
                strokeDasharray={`${80 + rnd('ad' + i) * 120} 30`} strokeDashoffset={-t * 420 - i * 37} strokeLinecap="round" />
            );
          })}
        </g>
      </g>
      <Particles seed="aipa" n={30} t={t} c="O" />
    </g>
  );
};

/* ---------- 09 myelin sheath ---------- */
const Myelin: React.FC<SP> = ({ t, lite }) => {
  const segH = 330, gap = 34;
  const py = ((t * 700) % 1900) - 300;
  return (
    <g>
      <Backdrop />
      <Field seed="mbg" t={t} n={16} lite={lite} />
      <g transform="translate(540,620) rotate(8)">
        <rect x={-62} y={-1000} width={124} height={2000} fill="#2a3ab0" opacity={0.8} />
        <rect x={-10} y={-1000} width={20} height={2000} fill="#ff9a3c" filter={F('glow2', lite)} />
        {[-3, -2, -1, 0, 1, 2].map((k) => {
          const y = k * (segH + gap) - segH / 2 + 60;
          return (
            <g key={k} filter={F('glow', lite)}>
              <rect x={-130} y={y} width={260} height={segH} rx={70} fill="url(#myel)" stroke="#d6ecff" strokeWidth={4} />
              {Array.from({ length: 9 }).map((_, j) => (
                <line key={j} x1={-110 + j * 27} y1={y + 30} x2={-110 + j * 27} y2={y + segH - 30} stroke="#e8f4ff" strokeWidth={1.5} opacity={0.45} />
              ))}
              <rect x={-14} y={y + 10} width={28} height={segH - 20} rx={14} fill="#ff9a3c" opacity={0.75} />
              <ellipse cx={0} cy={y - gap / 2} rx={80} ry={14} fill="url(#spkO)" />
            </g>
          );
        })}
        <ellipse cx={0} cy={py - 620} rx={60} ry={160} fill="url(#spkO)" />
      </g>
      <Particles seed="mypa" n={24} t={t} c="B" />
    </g>
  );
};

/* ---------- 10 node of ranvier ---------- */
const Ranvier: React.FC<SP> = ({ t, lite }) => {
  const flash = 0.6 + 0.4 * Math.sin(t * 9) ** 2;
  return (
    <g>
      <Backdrop />
      <Field seed="rbg" t={t} n={10} lite={lite} scale={1.4} />
      <g transform="translate(540,600)">
        <rect x={-95} y={-900} width={190} height={1800} fill="#2a3ab0" />
        <g filter={F('glow', lite)}>
          {[-1, 1].map((s) => (
            <g key={s}>
              <rect x={-320} y={s < 0 ? -760 : 46} width={640} height={714} rx={150} fill="url(#myel)" stroke="#d6ecff" strokeWidth={5} />
              {Array.from({ length: 16 }).map((_, j) => (
                <line key={j} x1={-280 + j * 37} y1={s < 0 ? -700 : 110} x2={-280 + j * 37} y2={s < 0 ? -110 : 700} stroke="#eaf4ff" strokeWidth={2} opacity={0.4} />
              ))}
            </g>
          ))}
        </g>
        <rect x={-14} y={-900} width={28} height={1800} fill="#ff9a3c" opacity={0.85} filter={F('glow2', lite)} />
        <ellipse cx={0} cy={0} rx={140 * flash} ry={36} fill="url(#spkO)" filter={F('glow2', lite)} />
        <ellipse cx={0} cy={0} rx={100} ry={22} fill="none" stroke="#ffd36a" strokeWidth={6} filter={F('glow', lite)} />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2 + t;
          return <circle key={i} cx={Math.cos(a) * 100} cy={Math.sin(a) * 22} r={5} fill="#fff0c8" />;
        })}
      </g>
    </g>
  );
};

/* ---------- 11 axon cross-section ---------- */
export const CrossG: React.FC<SP> = ({ t, lite }) => {
  const cols = ['#ffb347', '#7fb4ff', '#c58bff', '#4dd0ff', '#ff7ad9', '#ffd36a'];
  const cx = 540, cy = 620;
  return (
    <g>
      <Backdrop />
      {/* receding cylinder body */}
      <path d={`M${cx - 340},${cy - 90} L${cx - 720},${cy - 560} L${cx - 60},${cy - 940} L${cx + 300},${cy - 170} Z`} fill="#2a4ad0" opacity={0.75} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={cx - 340 + i * 54} y1={cy - 90 - i * 7} x2={cx - 720 + i * 56} y2={cy - 560 - i * 32} stroke="#bfe0ff" strokeWidth={3} opacity={0.35} />
      ))}
      <g filter={F('glow', lite)}>
        <circle cx={cx} cy={cy} r={360} fill="#3a66e0" />
        {Array.from({ length: 34 }).map((_, i) => (
          <circle key={i} cx={cx} cy={cy} r={210 + i * 4.6} fill="none" stroke={i % 2 ? '#bfe0ff' : '#2a4cd0'} strokeWidth={2.4} opacity={0.75} />
        ))}
        <circle cx={cx} cy={cy} r={200} fill="none" stroke="#ff9a3c" strokeWidth={22} />
        <circle cx={cx} cy={cy} r={200} fill="none" stroke="#ffd59a" strokeWidth={9} strokeDasharray="4 7" />
        <circle cx={cx} cy={cy} r={188} fill="#1a0b44" />
      </g>
      <clipPath id="xclip"><circle cx={cx} cy={cy} r={186} /></clipPath>
      <g clipPath="url(#xclip)" filter={F('glow', lite)}>
        {Array.from({ length: 70 }).map((_, i) => {
          const a = rnd('xa' + i) * Math.PI * 2, r = Math.sqrt(rnd('xr' + i)) * 175;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          const L = 30 + rnd('xl' + i) * 60;
          const ang = -0.75 + (rnd('xo' + i) - 0.5) * 0.7 + Math.sin(t + i) * 0.05;
          return (
            <line key={i} x1={x - Math.cos(ang) * L / 2} y1={y - Math.sin(ang) * L / 2} x2={x + Math.cos(ang) * L / 2} y2={y + Math.sin(ang) * L / 2}
              stroke={cols[i % cols.length]} strokeWidth={6 + rnd('xw' + i) * 6} strokeLinecap="round" />
          );
        })}
        {Array.from({ length: 50 }).map((_, i) => {
          const a = rnd('xd' + i) * Math.PI * 2, r = Math.sqrt(rnd('xq' + i)) * 175;
          return <circle key={'d' + i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={4 + rnd('xs' + i) * 5} fill={cols[(i + 2) % cols.length]} />;
        })}
      </g>
    </g>
  );
};

/* ---------- 12 axon terminals ---------- */
const Terminals: React.FC<SP> = ({ t, lite }) => {
  const segs = tree('tm', 60, 230, 0.62, 250, 4, 24, [], 0.5);
  const tips = segs.filter((s) => s.depth === 4);
  return (
    <g>
      <Backdrop />
      <Field seed="tbg" t={t} n={14} lite={lite} />
      <Dendrite segs={segs} lite={lite} seed="tmd" dots={0.6} />
      {tips.map((s, i) => {
        const r = 24 + rnd('tb' + i) * 14;
        const x = s.b[0] + Math.cos(s.ang) * r * 0.7, y = s.b[1] + Math.sin(s.ang) * r * 0.7;
        return (
          <g key={i} filter={F('glow', lite)}>
            <circle cx={x} cy={y} r={r} fill="url(#bulb)" stroke="#9fc4ff" strokeWidth={3} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={x + Math.cos(k * 1.6 + t * 2 + i) * r * 0.5} cy={y + Math.sin(k * 1.6 + t * 2 + i) * r * 0.5} r={3} fill="#fff6dc" />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/* ---------- 13 chemical synapse ---------- */
export const SynapseG: React.FC<SP> = ({ t, lite }) => {
  const ves: React.ReactNode[] = [];
  let k = 0;
  for (let row = 0; row < 4; row++) {
    for (let c = 0; c < 6 - (row === 3 ? 2 : 0); c++) {
      const x = 300 + c * 92 + (row % 2) * 46 + (row === 3 ? 92 : 0) + (rnd('vx' + k) - 0.5) * 16;
      const y = 470 + row * 78 + (rnd('vy' + k) - 0.5) * 14 + Math.sin(t * 2 + k) * 3;
      ves.push(<circle key={k} cx={x} cy={y} r={34 + rnd('vr' + k) * 6} fill="url(#vesicle)" stroke="#e8c8ff" strokeWidth={3} />);
      k++;
    }
  }
  return (
    <g>
      <Backdrop />
      <Field seed="sybg" t={t} n={10} lite={lite} />
      {/* postsynaptic */}
      <g filter={F('glow', lite)}>
        <path d="M-100,890 C200,860 400,875 540,870 C700,865 880,860 1180,890 L1180,1500 L-100,1500 Z" fill="#2a4ad0" stroke="#9fc8ff" strokeWidth={10} />
        <path d="M-100,935 C200,905 400,920 540,915 C700,910 880,905 1180,935" stroke="#7fb4ff" strokeWidth={6} fill="none" strokeDasharray="4 10" />
      </g>
      {[260, 360, 460, 560, 660, 760, 850].map((x, i) => (
        <g key={i} filter={F('glow', lite)}>
          <rect x={x - 13} y={840} width={26} height={54} rx={7} fill="#b05aff" stroke="#f0c8ff" strokeWidth={2} />
          <rect x={x - 5} y={830} width={10} height={14} rx={3} fill="#ff7ad9" />
        </g>
      ))}
      {/* presynaptic bouton */}
      <g filter={F('glow2', lite)}>
        <path d="M120,-50 C60,300 120,620 230,760 C330,830 750,830 850,760 C960,620 1020,300 960,-50 Z" fill="#4430b0" opacity={0.9} stroke="#9fc8ff" strokeWidth={12} />
      </g>
      <path d="M150,0 C100,300 150,600 250,735 C340,800 740,800 830,735 C930,600 980,300 930,0" stroke="#d6ecff" strokeWidth={4} fill="none" strokeDasharray="3 9" />
      <Mito x={320} y={300} rx={110} ry={44} rot={-25} lite={lite} />
      <Mito x={720} y={250} rx={90} ry={38} rot={20} lite={lite} />
      <g filter={F('glow', lite)}>{ves}</g>
      {/* release */}
      <g filter={F('glow', lite)}>
        {Array.from({ length: 90 }).map((_, i) => {
          const ph = (rnd('rp' + i) + t * 0.9) % 1;
          const x0 = 400 + rnd('rx' + i) * 280;
          return <circle key={i} cx={x0 + Math.sin(i + t * 3) * 14 * ph} cy={790 + ph * 70} r={3 + rnd('rr' + i) * 4} fill={i % 3 ? '#ffb347' : '#ffe08a'} opacity={1 - ph * 0.5} />;
        })}
      </g>
      <Spark x={540} y={800} r={120} o={0.8} />
    </g>
  );
};

/* ---------- registry ---------- */
export const SCENES: Record<Exclude<SceneKey, 'xray'>, React.FC<SP>> = {
  full: FullNeuron,
  soma: Soma,
  nucleus: Nucleus,
  nucleolus: Nucleolus,
  nissl: Nissl,
  mito: MitoScene,
  dendrites: Dendrites,
  ais: AIS,
  myelin: Myelin,
  ranvier: Ranvier,
  cross: CrossG,
  terminals: Terminals,
  synapse: SynapseG,
};
