# video-neuron

A recreation of `2.mp4` from [vcproo/video-11](https://github.com/vcproo/video-11): a 25-second neuron-anatomy explainer with a sci-fi HUD, built in [Remotion](https://www.remotion.dev/) and set to the original video's background music.

**Final video:** [`neuron.mp4`](neuron.mp4). 1080×1350, 36 fps, 903 frames, 25.08 s, H.264 + AAC.

## What's in it

- **14 shots, same order and timing as the original:** full neuron → soma → nucleus → nucleolus → Nissl substance → mitochondria → dendrites → axon initial segment → myelin sheath → node of Ranvier → axon cross-section → axon terminals → chemical synapse → X-ray half-section → back to the full neuron. Cuts use a zoom-blur transition.
- **Animated HUD:**
  - title block and neuron profile table
  - live membrane-potential trace
  - shot counter, pill label and zoom readout (count-up per shot)
  - focus brackets and scale bar
  - typed info card
  - locator thumbnail with a highlight box
  - shot-sequence strip
  - ion-channel bars and conduction-velocity gauge
  - synapse stats
  - spike raster and scrolling neuron log
- **Music:** the original track, extracted from `2.mp4` without re-encoding (`film/public/music.m4a`).

The original's photoreal 3D imagery is replaced with procedurally drawn SVG art (glow + bloom filters). The creator handle from the original is not reproduced.

## Project layout

```
neuron.mp4              final render
film/
  src/data.ts           shot list: timing, labels, HUD values per shot
  src/scenes.tsx        the 14 procedural SVG scenes
  src/geom.ts           blob / branching-tree / bezier helpers
  src/Hud.tsx           HUD overlay
  src/Film.tsx          composition: camera moves, transitions, fonts, audio
  src/fontcss.ts        embedded @font-face data (generated from public/fonts)
  public/fonts/         Rajdhani, Barlow Condensed (OFL), mono
  public/music.m4a      original background music
  render.mjs/render.sh  chunked, resumable render + audio mux
```

## Setup

Requires Node 22, FFmpeg/ffprobe on `PATH`, and a Chrome Headless Shell binary.

```bash
cd film
npm ci
```

## Run

Preview in Remotion Studio:

```bash
npm run dev
```

Render the final video:

```bash
export CHS=/path/to/chrome-headless-shell   # browser Remotion renders with
./render.sh                                 # writes film/out/neuron.mp4
```

`render.sh` renders four chunks of about 225 frames each (concurrency 2), checks each chunk's frame count, and skips chunks that already exist, so you can re-run it after an interruption. It then joins the chunks and adds `music.m4a` with stream copy. A full render takes about 50 minutes on a 4-vCPU VM with no GPU.

For a single still: `npx remotion still src/index.ts NeuronFilm out/f.png --frame=120 --browser-executable=$CHS`

## Known issues

- Visuals are stylised vector art, not the original's photoreal renders.
- On a heavily loaded machine a Chrome tab can occasionally drop (`Target closed`). Remotion retries the frame automatically, and the chunk's frame-count check catches any gaps.
