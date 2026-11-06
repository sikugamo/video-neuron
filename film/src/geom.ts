import { random } from 'remotion';

export const rnd = (s: string | number) => random(String(s));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type P = [number, number];

// Closed smooth blob through n jittered points (Catmull-Rom -> cubic Bezier)
export function blob(cx: number, cy: number, r: number, seed: string, n = 18, amp = 0.12, sx = 1, sy = 1): string {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rnd(seed + i) - 0.5) * 2 * amp);
    pts.push([cx + Math.cos(a) * rr * sx, cy + Math.sin(a) * rr * sy]);
  }
  return closedSpline(pts);
}

export function closedSpline(pts: P[]): string {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

export function cubicPt(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

// Sample a chain of cubic segments by arc length
export function sampleChain(segs: [P, P, P, P][], step: number): { p: P; a: number }[] {
  const fine: P[] = [];
  segs.forEach((s) => {
    for (let i = 0; i <= 200; i++) fine.push(cubicPt(s[0], s[1], s[2], s[3], i / 200));
  });
  const out: { p: P; a: number }[] = [];
  let acc = 0;
  let next = 0;
  for (let i = 1; i < fine.length; i++) {
    const dx = fine[i][0] - fine[i - 1][0], dy = fine[i][1] - fine[i - 1][1];
    const L = Math.hypot(dx, dy);
    if (L === 0) continue;
    while (acc + L >= next) {
      const k = (next - acc) / L;
      out.push({ p: [fine[i - 1][0] + dx * k, fine[i - 1][1] + dy * k], a: Math.atan2(dy, dx) });
      next += step;
    }
    acc += L;
  }
  return out;
}

export const chainD = (segs: [P, P, P, P][]) =>
  segs.map((s, i) => `${i === 0 ? `M${s[0][0]},${s[0][1]}` : ''} C${s[1][0]},${s[1][1]} ${s[2][0]},${s[2][1]} ${s[3][0]},${s[3][1]}`).join(' ');

export type Seg = { d: string; w: number; a: P; b: P; ang: number; depth: number };

// Recursive branching tree (dendrites, terminals)
export function tree(seed: string, x: number, y: number, ang: number, len: number, depth: number, w: number, out: Seg[] = [], spread = 0.55, maxDepth = depth): Seg[] {
  const bend = (rnd(seed + 'b') - 0.5) * 0.9;
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const cx = (x + x2) / 2 + nx * len * bend * 0.35, cy = (y + y2) / 2 + ny * len * bend * 0.35;
  out.push({ d: `M${x.toFixed(1)},${y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`, w, a: [x, y], b: [x2, y2], ang, depth: maxDepth - depth });
  if (depth > 0) {
    const kids = rnd(seed + 'k') > 0.7 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const off = kids === 2 ? (i === 0 ? -1 : 1) : i - 1;
      const na = ang + off * spread * (0.6 + rnd(seed + 'a' + i) * 0.8);
      tree(seed + '.' + i, x2, y2, na, len * (0.62 + rnd(seed + 'l' + i) * 0.2), depth - 1, Math.max(1.2, w * 0.62), out, spread, maxDepth);
    }
  }
  return out;
}
