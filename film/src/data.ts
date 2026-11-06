export const FPS = 36;
export const W = 1080;
export const H = 1350;
export const DURATION = 903; // 25.08 s, matches the music track

export type SceneKey =
  | 'full' | 'soma' | 'nucleus' | 'nucleolus' | 'nissl' | 'mito' | 'dendrites'
  | 'ais' | 'myelin' | 'ranvier' | 'cross' | 'terminals' | 'synapse' | 'xray';

export type Shot = {
  n: number;
  start: number; // seconds
  scene: SceneKey;
  pill: string;
  title: string;
  sub: string;
  bullets: string[];
  zoom: number;
  scale: string;
  accent: string;
  loc: [number, number, number, number]; // locator box in 0..1 thumbnail coords
  ions: [number, number, number, number];
  syn: { ves: number; glu: string; ampa: number; epsp: string };
};

export const SHOTS: Shot[] = [
  { n: 1, start: 0, scene: 'full', pill: 'ORBIT · FULL NEURON', title: 'NEURON', sub: 'Structure · signal · connection',
    bullets: ['~86 billion in a human brain', 'up to ~10 000 links each', 'signals up to 120 m/s'],
    zoom: 700, scale: '20 µm', accent: '#ffc24a', loc: [0, 0, 1, 1], ions: [8, 4, 66, 45], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 2, start: 1.75, scene: 'soma', pill: 'CLOSE-UP · SOMA', title: 'SOMA', sub: 'Cell body · the control centre',
    bullets: ['holds nucleus and organelles', 'sums every incoming input', '4 - 100 µm across'],
    zoom: 1200, scale: '10 µm', accent: '#ff9d5c', loc: [0.42, 0.06, 0.32, 0.26], ions: [9, 5, 12, 52], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 3, start: 3.5, scene: 'nucleus', pill: 'CLOSE-UP · NUCLEUS', title: 'NUCLEUS', sub: 'Genome · gene expression',
    bullets: ['DNA wrapped as chromatin', 'nuclear pores gate RNA out', 'never divides again'],
    zoom: 4000, scale: '5 µm', accent: '#c48bff', loc: [0.5, 0.1, 0.2, 0.17], ions: [8, 4, 6, 48], syn: { ves: 1, glu: '0.03', ampa: 2, epsp: '+0.00' } },
  { n: 4, start: 4.75, scene: 'nucleolus', pill: 'CLOSE-UP · NUCLEOLUS', title: 'NUCLEOLUS', sub: 'Ribosome factory',
    bullets: ['builds ribosomal RNA', 'large in busy neurons', 'no membrane of its own'],
    zoom: 12000, scale: '1 µm', accent: '#d68cff', loc: [0.55, 0.13, 0.1, 0.09], ions: [8, 4, 5, 47], syn: { ves: 1, glu: '0.03', ampa: 2, epsp: '+0.00' } },
  { n: 5, start: 6.0, scene: 'nissl', pill: 'CLOSE-UP · NISSL SUBSTANCE', title: 'NISSL SUBSTANCE', sub: 'Rough ER · protein synthesis',
    bullets: ['stacks studded with ribosomes', 'makes transmitter enzymes', 'stains dark in the soma'],
    zoom: 8000, scale: '2 µm', accent: '#7fb4ff', loc: [0.44, 0.1, 0.16, 0.14], ions: [8, 4, 7, 50], syn: { ves: 1, glu: '0.04', ampa: 2, epsp: '+0.00' } },
  { n: 6, start: 7.5, scene: 'mito', pill: 'CLOSE-UP · MITOCHONDRIA', title: 'MITOCHONDRIA', sub: 'ATP power plants',
    bullets: ['cristae fold the inner membrane', 'fuel the Na⁺/K⁺ pump', 'brain uses ~20% of body energy'],
    zoom: 15000, scale: '0.5 µm', accent: '#ff6a3d', loc: [0.47, 0.17, 0.1, 0.08], ions: [8, 4, 6, 71], syn: { ves: 1, glu: '0.04', ampa: 2, epsp: '+0.00' } },
  { n: 7, start: 8.75, scene: 'dendrites', pill: 'CLOSE-UP · DENDRITES', title: 'DENDRITES', sub: 'Receptive branches',
    bullets: ['spines catch incoming synapses', 'thousands of inputs per cell', 'pass graded potentials inward'],
    zoom: 1500, scale: '10 µm', accent: '#6f9cff', loc: [0.08, 0.02, 0.36, 0.3], ions: [14, 5, 9, 46], syn: { ves: 3, glu: '0.31', ampa: 18, epsp: '+0.42' } },
  { n: 8, start: 10.25, scene: 'ais', pill: 'CLOSE-UP · AXON INITIAL SEGMENT', title: 'AXON INITIAL SEGMENT', sub: 'Spike trigger zone',
    bullets: ['densest Na⁺ channels in the cell', 'threshold reached at -55 mV', 'all-or-none spike starts here'],
    zoom: 3000, scale: '5 µm', accent: '#ff7bd5', loc: [0.4, 0.27, 0.16, 0.14], ions: [62, 8, 6, 44], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 9, start: 11.75, scene: 'myelin', pill: 'CLOSE-UP · MYELIN SHEATH', title: 'MYELIN SHEATH', sub: 'Glial insulation',
    bullets: ['wrapped by oligodendrocytes', 'cuts membrane capacitance', 'lets the spike jump ahead'],
    zoom: 2500, scale: '5 µm', accent: '#7fd6ff', loc: [0.36, 0.4, 0.16, 0.2], ions: [8, 4, 4, 48], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 10, start: 13.5, scene: 'ranvier', pill: 'CLOSE-UP · NODE OF RANVIER', title: 'NODE OF RANVIER', sub: 'Saltatory relay point',
    bullets: ['bare gap of ~1 µm', 'Na⁺ channels re-boost the spike', 'node every ~1 mm'],
    zoom: 10000, scale: '1 µm', accent: '#ffb347', loc: [0.4, 0.5, 0.1, 0.1], ions: [71, 22, 4, 46], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 11, start: 15.0, scene: 'cross', pill: 'CLOSE-UP · AXON CROSS-SECTION', title: 'AXON CROSS-SECTION', sub: 'Inside the cable',
    bullets: ['up to 100 myelin wraps', 'microtubules carry cargo', 'neurofilaments hold shape'],
    zoom: 20000, scale: '0.5 µm', accent: '#5fd0ff', loc: [0.04, 0.72, 0.22, 0.22], ions: [8, 4, 4, 49], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
  { n: 12, start: 17.5, scene: 'terminals', pill: 'CLOSE-UP · AXON TERMINALS', title: 'AXON TERMINALS', sub: 'Output branches',
    bullets: ['axon splits into many boutons', 'each bouton is a synapse', 'Ca²⁺ triggers release'],
    zoom: 2000, scale: '10 µm', accent: '#ffa04a', loc: [0.46, 0.72, 0.36, 0.26], ions: [10, 6, 41, 47], syn: { ves: 4, glu: '0.22', ampa: 9, epsp: '+0.18' } },
  { n: 13, start: 19.25, scene: 'synapse', pill: 'CLOSE-UP · CHEMICAL SYNAPSE', title: 'CHEMICAL SYNAPSE', sub: 'Electric → chemical → electric',
    bullets: ['vesicles fuse, glutamate floods', 'cleft only ~20 nm wide', 'AMPA receptors open downstream'],
    zoom: 40000, scale: '200 nm', accent: '#ff7ad9', loc: [0.6, 0.62, 0.22, 0.2], ions: [8, 4, 66, 49], syn: { ves: 4, glu: '0.84', ampa: 71, epsp: '+0.65' } },
  { n: 14, start: 21.75, scene: 'xray', pill: 'X-RAY · HALF SECTION', title: 'X-RAY SECTION', sub: 'Membrane peeled away',
    bullets: ['organelles in false colour', 'one cell, one direction of flow', 'dendrite → soma → axon'],
    zoom: 800, scale: '20 µm', accent: '#4dffc3', loc: [0.3, 0.4, 0.56, 0.5], ions: [8, 25, 25, 59], syn: { ves: 2, glu: '0.65', ampa: 71, epsp: '+0.65' } },
  { n: 1, start: 23.25, scene: 'full', pill: 'ORBIT · FULL NEURON', title: 'NEURON', sub: 'Structure · signal · connection',
    bullets: ['~86 billion in a human brain', 'up to ~10 000 links each', 'signals up to 120 m/s'],
    zoom: 700, scale: '20 µm', accent: '#ffc24a', loc: [0, 0, 1, 1], ions: [8, 4, 66, 45], syn: { ves: 2, glu: '0.04', ampa: 3, epsp: '+0.00' } },
];

export const shotStartF = (i: number) => Math.round(SHOTS[i].start * FPS);
export const shotEndF = (i: number) => (i + 1 < SHOTS.length ? shotStartF(i + 1) : DURATION);
export const shotIndexAt = (f: number) => {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (f >= shotStartF(i)) k = i;
  return k;
};

export const LOG_LINES = [
  'conduction 98 m/s', 'Ca²⁺ influx at bouton', 'vesicle fusion · glutamate', 'AMPA receptors bound',
  'EPSP +0.5 mV downstream', 'Na⁺/K⁺-ATPase · 3 Na⁺ : 2 K⁺', 'render ok · claude-opus-5.5', 'AIS · threshold -55 mV',
  'Na⁺ channels open', 'spike +40 mV · ~1 ms', 'K⁺ channels repolarise', 'node 1 → node 2 · saltatory',
];

export const fmtK = (v: number) => {
  const s = Math.round(v).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
