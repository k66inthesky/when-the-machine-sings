#!/usr/bin/env node
// Trim + convert existing source-audio SFX into the 128 kbps .mp3 files the
// game loads, and synthesize the jsfxr-style UI beeps that the prompt list
// (assets/prompts/06_sfx_list.md) earmarks for procedural generation.
//
// Output: assets/audio/sfx/sfx_*.mp3 — each normalized to -6 dB peak, with
// the duration from the spec table. Raw .wav/.flac sources are left in
// place; vite.config.js already filters them out of the shipped bundle.
//
// Usage: `npm run build:sfx` (or `node scripts/build-sfx.mjs`).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'assets', 'audio', 'sfx');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'wtms-sfx-'));
process.on('exit', () => { try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {} });

function ff(...args) {
  execFileSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
}

// Each entry: { name, source, duration, extraFilter? }
// source is either a filename in assets/audio/sfx/ (for trim+convert) or
// the string 'synth' (for procedurally generated beeps below).
const TRIM_TASKS = [
  { name: 'sfx_truck_engine_loop', source: 'sfx_truck_engine_loop.wav', duration: 10.0, filter: 'afade=t=in:st=0:d=0.05,afade=t=out:st=9.95:d=0.05' },
  { name: 'sfx_truck_brake',       source: 'sfx_truck_brake.wav',       duration: 1.0,  filter: 'afade=t=in:st=0:d=0.02,afade=t=out:st=0.9:d=0.1' },
  { name: 'sfx_bag_drop',          source: 'sfx_bag_drop.wav',          duration: 0.4,  filter: 'afade=t=out:st=0.35:d=0.05' },
  { name: 'sfx_bag_hit_metal',     source: 'sfx_bag_hit_metal.wav',     duration: 0.5,  filter: 'afade=t=out:st=0.4:d=0.1' },
  { name: 'sfx_footsteps_loop',    source: 'sfx_footsteps_loop.wav',    duration: 1.5,  filter: 'afade=t=in:st=0:d=0.05,afade=t=out:st=1.45:d=0.05' },
  { name: 'sfx_tv_static_bg',      source: 'sfx_tv_static_bg.wav',      duration: 2.0,  filter: 'volume=0.35,afade=t=in:st=0:d=0.1,afade=t=out:st=1.9:d=0.1' },
  { name: 'sfx_door_slide',        source: 'sfx_door_slide.wav',        duration: 1.0,  filter: 'afade=t=out:st=0.9:d=0.1' },
];

// Synthesized via ffmpeg's aevalsrc + concat — approximates the jsfxr
// presets called out in 06_sfx_list.md. 44.1 kHz mono, 16-bit, then lamé
// to 128 kbps mp3.
//
//   phone_notification → Pickup/Coin, 2-note rising beep (LINE ping)
//   qte_success         → Powerup, 3-note ascending chime
//   qte_fail            → Hit/Hurt, descending sawtooth buzz
//   score_count         → Pickup/Coin, quick tick ticker
//   running_loop        → 1 sec percussive step loop at faster tempo
// Each synth task picks inputs from ffmpeg's builtin lavfi sources (sine,
// anoisesrc) and applies an amplitude envelope per tone via per-stream
// afade filters in the complex graph — much simpler than aevalsrc
// expressions and portable across ffmpeg builds.
const SYNTH_TASKS = [
  {
    name: 'sfx_phone_notification',
    // LINE-style 2-note ping: 1320 → 1760 Hz, each with a fast decay.
    tones: [
      { freq: 1320, dur: 0.09, decay: 0.07 },
      { freq: 1760, dur: 0.15, decay: 0.12 },
    ],
    postFilter: 'volume=0.6',
  },
  {
    name: 'sfx_qte_success',
    // Powerup arpeggio A4 / E5 / A5.
    tones: [
      { freq: 440,    dur: 0.1, decay: 0.08 },
      { freq: 659.25, dur: 0.1, decay: 0.09 },
      { freq: 880,    dur: 0.3, decay: 0.25 },
    ],
    postFilter: 'volume=0.55',
  },
  {
    name: 'sfx_score_count',
    // Quick tick — one short sine click near 1600 Hz.
    tones: [
      { freq: 1600, dur: 0.08, decay: 0.06 },
    ],
    postFilter: 'volume=0.4',
  },
];

// Descending buzz: pink-noise with a steep low-pass envelope that opens up
// then snaps shut. Built as a one-off so it can live outside the sine graph.
const QTE_FAIL_TASK = {
  name: 'sfx_qte_fail',
  duration: 0.35,
};

// Running loop: percussive sine "thumps" — similar shape to synth SFX
// above but at step frequencies and longer total duration.
const RUNNING_LOOP_TASK = {
  name: 'sfx_running_loop',
  tones: [
    { freq: 140, dur: 0.25, decay: 0.12, offset: 0.00 },
    { freq: 130, dur: 0.25, decay: 0.12, offset: 0.25 },
    { freq: 140, dur: 0.25, decay: 0.12, offset: 0.50 },
    { freq: 130, dur: 0.25, decay: 0.12, offset: 0.75 },
  ],
  totalDuration: 1.0,
  postFilter: 'volume=0.45,afade=t=in:st=0:d=0.02,afade=t=out:st=0.98:d=0.02',
};

function mp3OutPath(name) {
  return path.join(SRC_DIR, `${name}.mp3`);
}

function trimTask(task) {
  const src = path.join(SRC_DIR, task.source);
  if (!fs.existsSync(src)) {
    console.warn(`  [skip] ${task.name}: source missing (${task.source})`);
    return false;
  }
  const out = mp3OutPath(task.name);
  const filter = [`atrim=0:${task.duration}`, 'asetpts=PTS-STARTPTS', task.filter, 'loudnorm=I=-16:LRA=7:TP=-6']
    .filter(Boolean)
    .join(',');
  ff('-i', src, '-af', filter, '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '128k', out);
  const size = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`  [trim] ${task.name}.mp3 (${size} KB, ${task.duration}s)`);
  return true;
}

// Concatenate tones end-to-end (phone_notification, qte_success, score_count).
function synthSequentialTask(task) {
  const out = mp3OutPath(task.name);
  const args = ['-hide_banner', '-loglevel', 'error', '-y'];
  for (const tone of task.tones) {
    args.push('-f', 'lavfi', '-i', `sine=frequency=${tone.freq}:duration=${tone.dur}:sample_rate=44100`);
  }
  const shaped = task.tones.map((t, i) => {
    const decay = Math.max(0, t.decay || t.dur * 0.8);
    return `[${i}:a]afade=t=out:st=${(t.dur - decay).toFixed(3)}:d=${decay.toFixed(3)}[t${i}]`;
  });
  const catInputs = task.tones.map((_, i) => `[t${i}]`).join('');
  const filterComplex = [
    shaped.join(';'),
    `${catInputs}concat=n=${task.tones.length}:v=0:a=1[cat]`,
    `[cat]${task.postFilter},loudnorm=I=-16:LRA=7:TP=-6[out]`,
  ].join(';');
  args.push('-filter_complex', filterComplex, '-map', '[out]');
  args.push('-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '128k', out);
  execFileSync(ffmpegPath, args);
  const size = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`  [synth] ${task.name}.mp3 (${size} KB)`);
}

// Overlap tones at fixed offsets (running_loop).
function synthOverlappedTask(task) {
  const out = mp3OutPath(task.name);
  const args = ['-hide_banner', '-loglevel', 'error', '-y'];
  for (const tone of task.tones) {
    args.push('-f', 'lavfi', '-i', `sine=frequency=${tone.freq}:duration=${tone.dur}:sample_rate=44100`);
  }
  const shaped = task.tones.map((t, i) => {
    const decay = Math.max(0, t.decay);
    const pad = `adelay=${Math.round(t.offset * 1000)}|${Math.round(t.offset * 1000)}`;
    return `[${i}:a]afade=t=out:st=${(t.dur - decay).toFixed(3)}:d=${decay.toFixed(3)},${pad}[t${i}]`;
  });
  const mixInputs = task.tones.map((_, i) => `[t${i}]`).join('');
  const filterComplex = [
    shaped.join(';'),
    `${mixInputs}amix=inputs=${task.tones.length}:duration=longest:normalize=0[mix]`,
    `[mix]atrim=0:${task.totalDuration},${task.postFilter},loudnorm=I=-16:LRA=7:TP=-6[out]`,
  ].join(';');
  args.push('-filter_complex', filterComplex, '-map', '[out]');
  args.push('-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '128k', out);
  execFileSync(ffmpegPath, args);
  const size = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`  [synth] ${task.name}.mp3 (${size} KB)`);
}

// Descending buzz from filtered white noise.
function synthQteFail() {
  const out = mp3OutPath(QTE_FAIL_TASK.name);
  const dur = QTE_FAIL_TASK.duration;
  const args = ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', `anoisesrc=duration=${dur}:color=brown:amplitude=0.8:sample_rate=44100`,
    '-af', `lowpass=f=400,highpass=f=80,afade=t=in:st=0:d=0.01,afade=t=out:st=${(dur - 0.15).toFixed(3)}:d=0.15,volume=0.55,loudnorm=I=-16:LRA=7:TP=-6`,
    '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '128k', out];
  execFileSync(ffmpegPath, args);
  const size = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`  [synth] ${QTE_FAIL_TASK.name}.mp3 (${size} KB)`);
}

function main() {
  fs.mkdirSync(SRC_DIR, { recursive: true });
  console.log('Trimming source audio to spec durations:');
  for (const t of TRIM_TASKS) trimTask(t);
  console.log('Synthesizing jsfxr-style UI beeps:');
  for (const t of SYNTH_TASKS) synthSequentialTask(t);
  synthQteFail();
  synthOverlappedTask(RUNNING_LOOP_TASK);
  console.log('Done. All files in assets/audio/sfx/*.mp3');
}

main();
