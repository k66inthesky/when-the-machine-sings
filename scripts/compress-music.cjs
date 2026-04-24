// Re-encode the 3 BGM tracks to fit the README's <2 MB target.
// 96 kbps mono is wide enough for a Phaser game and matches the README's
// fallback recipe ("If over, drop bitrate to 96 kbps").
//
// Original files are backed up to assets/raw/ first so a higher-fidelity
// re-encode can revert without re-downloading from Suno.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FF = path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg');
const RAW = path.join(ROOT, 'assets', 'raw', 'music');
fs.mkdirSync(RAW, { recursive: true });

// Bitrate per track tuned to land under 2 MB given the source duration.
const FILES = [
  // 193s — 72 kbps to stay safely under 2 MB cap (80k lands at 2.01 MB)
  { rel: 'assets/audio/music/bgm_main.mp3',    kbps: 72 },
  // 97s — comfortably fits at 96 kbps
  { rel: 'assets/audio/music/bgm_tension.mp3', kbps: 96 },
  // 159s — 80 kbps fits with headroom (~1.72 MB)
  { rel: 'assets/audio/music/bgm_ending.mp3',  kbps: 80 },
];

for (const job of FILES) {
  const full = path.join(ROOT, job.rel);
  const backup = path.join(RAW, path.basename(job.rel));
  if (!fs.existsSync(backup)) fs.copyFileSync(full, backup);
  const tmp = full + '.tmp.mp3';
  // Note: -q:a triggers VBR and overrides -b:a, so we omit it to get strict CBR.
  execFileSync(FF, [
    '-y', '-i', backup,
    '-ac', '1',
    '-codec:a', 'libmp3lame',
    '-b:a', `${job.kbps}k`,
    tmp,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  fs.renameSync(tmp, full);
  const before = fs.statSync(backup).size;
  const after  = fs.statSync(full).size;
  console.log(`${job.rel}: ${(before/1024/1024).toFixed(2)} MB → ${(after/1024/1024).toFixed(2)} MB @ ${job.kbps}k mono`);
}
