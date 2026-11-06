#!/usr/bin/env bash
# Render the film in resumable chunks, then mux the original music track (stream copy, no re-encode).
set -e
. ~/.local/opt/env.sh
cd "$(dirname "$0")"
node render.mjs
printf "file 'v_%s.mp4'\n" 0-225 226-451 452-677 678-902 > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i public/music.m4a -map 0:v -map 1:a -c copy -movflags +faststart out/neuron.mp4
echo muxed
