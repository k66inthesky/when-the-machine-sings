// Probe all MP3 durations + bitrates via ffmpeg-static, contrast with README targets.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FF = path.resolve(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg');

const TARGETS = {
  // music targets are in seconds (rough — README says 2:00, 1:30, 1:30)
  'bgm_main.mp3':    { sec: 120, role: 'loop'   },
  'bgm_tension.mp3': { sec: 90,  role: 'loop'   },
  'bgm_ending.mp3':  { sec: 90,  role: 'oneshot'},
  // sfx: README says under 0.5s drops, ~1s brakes/door, 1-1.5s loops, very quiet TV bg
  'sfx_bag_drop.mp3':           { sec: 0.5, role: 'oneshot' },
  'sfx_bag_hit_metal.mp3':      { sec: 0.6, role: 'oneshot' },
  'sfx_door_slide.mp3':         { sec: 1.0, role: 'oneshot' },
  'sfx_truck_brake.mp3':        { sec: 1.0, role: 'oneshot' },
  'sfx_phone_notification.mp3': { sec: 0.5, role: 'oneshot' },
  'sfx_qte_success.mp3':        { sec: 0.6, role: 'oneshot' },
  'sfx_qte_fail.mp3':           { sec: 0.5, role: 'oneshot' },
  'sfx_score_count.mp3':        { sec: 0.2, role: 'oneshot' },
  'sfx_footsteps_loop.mp3':     { sec: 1.5, role: 'loop' },
  'sfx_running_loop.mp3':       { sec: 1.0, role: 'loop' },
  'sfx_truck_engine_loop.mp3':  { sec: 10,  role: 'loop' },
  'sfx_tv_static_bg.mp3':       { sec: 4,   role: 'loop' },
};

function probe(file) {
  let out = '';
  try {
    execFileSync(FF, ['-i', file], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stderr || '').toString();
  }
  const dur = (out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/) || []);
  const seconds = dur.length ? (+dur[1]) * 3600 + (+dur[2]) * 60 + (+dur[3]) : NaN;
  const br = (out.match(/Audio:.*?(\d+)\s*kb\/s/) || [])[1] || '?';
  const ch = (out.match(/Audio:.*?(stereo|mono)/) || [])[1] || '?';
  const sr = (out.match(/Audio:.*?(\d+)\s*Hz/) || [])[1] || '?';
  return { seconds, kbps: br, ch, sr };
}

const dirs = ['assets/audio/music', 'assets/audio/sfx'];
const root = path.resolve(__dirname, '..');
const rows = [];
for (const d of dirs) {
  for (const name of fs.readdirSync(path.join(root, d))) {
    if (!name.endsWith('.mp3')) continue;
    if (name.includes('Zone.Identifier')) continue;
    const full = path.join(root, d, name);
    const stat = fs.statSync(full);
    const p = probe(full);
    const t = TARGETS[name];
    let flag = '';
    if (t) {
      if (t.role === 'loop' && Math.abs(p.seconds - t.sec) > t.sec * 0.5) flag = `LOOP-LEN off (target ~${t.sec}s)`;
      if (t.role === 'oneshot' && p.seconds > t.sec * 1.8) flag = `TOO LONG (target ~${t.sec}s)`;
      if (stat.size > 2 * 1024 * 1024 && d.includes('music')) flag = (flag ? flag + '; ' : '') + `>2MB (README cap)`;
    }
    rows.push({ name, seconds: p.seconds.toFixed(2), kbps: p.kbps, ch: p.ch, sr: p.sr, kb: (stat.size/1024).toFixed(0), flag });
  }
}
const w = (s, n) => String(s).padEnd(n);
console.log(`${w('file',32)} ${w('dur(s)',8)} ${w('kbps',6)} ${w('ch',7)} ${w('sr',6)} ${w('kb',7)} flag`);
for (const r of rows) {
  console.log(`${w(r.name,32)} ${w(r.seconds,8)} ${w(r.kbps,6)} ${w(r.ch,7)} ${w(r.sr,6)} ${w(r.kb,7)} ${r.flag}`);
}
