// Resumable muted render in chunks; music is muxed afterwards by render.sh.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const common = { browserExecutable: process.env.CHS, chromiumOptions: { gl: 'swangle' }, timeoutInMilliseconds: 120000, concurrency: 2 };
const dir = 'out/chunks';
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const ranges = [[0, 225], [226, 451], [452, 677], [678, 902]];
for (const [a, b] of ranges) {
  const out = `${dir}/v_${a}-${b}.mp4`;
  if (fs.existsSync(out) && fs.statSync(out).size > 0) { console.log('skip', a, b); continue; }
  const composition = await selectComposition({ serveUrl, id: 'NeuronFilm', ...common });
  for (let attempt = 1; ; attempt++) {
    let last = -1;
    await renderMedia({
      composition, serveUrl, codec: 'h264', crf: 17, muted: true, frameRange: [a, b], outputLocation: `${dir}/tmp.mp4`, ...common,
      onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`chunk ${a}-${b}: ${p * 10}%`); } },
    });
    const n = Number(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', `${dir}/tmp.mp4`]).toString().replace(/[^0-9]/g, ''));
    if (n === b - a + 1) break;
    if (attempt >= 3) throw new Error(`chunk ${a}-${b}: ${n} frames`);
    console.log(`chunk ${a}-${b}: got ${n} frames, retrying`);
  }
  fs.renameSync(`${dir}/tmp.mp4`, out);
  console.log('done', a, b);
}
