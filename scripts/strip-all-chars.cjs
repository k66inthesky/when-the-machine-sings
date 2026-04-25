// Re-strip every PNG in assets/images/char/ from a clean baseline.
//
// Background type varies per file:
//   - mom_*.png         → off-white watercolor wash + paper texture
//   - player_*.png      → flat / textured solid (anime style)
//   - truck_*.png       → environment around a vehicle
//
// One pipeline can't get every case perfect, but the strategy holds:
//   1. Restore each file from the latest committed-original we can find
//      in /tmp/char_orig/ (populated from git on first run).
//   2. Sample the bg colour from a thin border ring (avoids picking up
//      anti-aliased edges).
//   3. BFS flood-fill from the entire border. A pixel joins the bg set
//      iff:
//        a. its colour is within `tol` of the sampled bg ref, OR
//        b. it's a "bright neutral" wash pixel (lum ≥ 180 AND saturation ≤ 14)
//      AND
//        c. it doesn't look like skin (warm-bias guard for character art)
//      AND
//        d. it doesn't look like a painted edge (sat ≥ 60 anywhere)
//   4. Apply a 1-pixel feather (alpha=110 for bg pixels touching FG, 0
//      everywhere else) so the cut reads as painted, not stamped.
//
// Run: node scripts/strip-all-chars.cjs

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHAR_DIR = path.join(ROOT, 'assets/images/char');
const BACKUP_DIR = '/tmp/char_orig';

// Per-file strip profile. Tighter tol = less aggressive cut. Looser tol +
// looser skin guard = wider erase. 'mom' values are tuned to the
// watercolor wash; 'flat' values are for the player + truck art.
const PROFILES = {
  mom: { tol: 32, lumGate: 180, satGate: 14, skinR: 175, skinRB: 24, paintedSat: 60, feather: 110 },
  flat: { tol: 28, lumGate: 200, satGate: 10, skinR: 175, skinRB: 22, paintedSat: 50, feather: 100 },
};

const FILE_PROFILES = {
  'mom_angry.png':           'mom',
  'mom_proud.png':           'mom',
  'mom_satisfied.png':       'mom',
  'player_front_idle.png':   'flat',
  'player_run_side.png':     'flat',
  'player_walk_side_01.png': 'flat',
  'player_walk_side_02.png': 'flat',
  'player_walk_side_03.png': 'flat',
  'player_walk_side_04.png': 'flat',
  'truck_far.png':           'flat',
  'truck_mid.png':           'flat',
};

// ── Backup originals once (find earliest committed version of each file) ──

function ensureBackups() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  for (const f of Object.keys(FILE_PROFILES)) {
    const dst = path.join(BACKUP_DIR, f);
    if (fs.existsSync(dst)) continue;
    // Walk git log for the first commit that introduced this file. The art
    // has been re-stripped multiple times; we want the pre-strip baseline.
    let baselineSha = null;
    try {
      const log = execSync(`git -C "${ROOT}" log --diff-filter=A --pretty=%H -- "assets/images/char/${f}"`, { encoding: 'utf8' });
      const shas = log.trim().split(/\s+/).filter(Boolean);
      baselineSha = shas[shas.length - 1] || null; // earliest (last in --pretty=%H output)
    } catch (_) { /* fall through */ }
    if (!baselineSha) {
      console.log(`  · ${f}: no git history, copying current state`);
      fs.copyFileSync(path.join(CHAR_DIR, f), dst);
      continue;
    }
    try {
      execSync(`git -C "${ROOT}" show ${baselineSha}:assets/images/char/${f} > "${dst}"`, { shell: '/bin/bash' });
      console.log(`  · ${f}: backed up from ${baselineSha.slice(0, 7)}`);
    } catch (e) {
      console.log(`  · ${f}: git show failed, copying current state`);
      fs.copyFileSync(path.join(CHAR_DIR, f), dst);
    }
  }
}

// ── Strip ──────────────────────────────────────────────────────────────────

async function strip(inFile, outFile, profile) {
  const { data, info } = await sharp(inFile)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample bg from a thin border ring.
  let bgR = 0, bgG = 0, bgB = 0, n = 0;
  const ring = (x, y) => {
    const idx = (y * width + x) * channels;
    bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; n++;
  };
  for (let x = 0; x < width; x += 4) {
    for (const y of [0, 1, height - 2, height - 1]) ring(x, y);
  }
  for (let y = 0; y < height; y += 4) {
    for (const x of [0, 1, width - 2, width - 1]) ring(x, y);
  }
  bgR /= n; bgG /= n; bgB /= n;
  const bgLum = (bgR + bgG + bgB) / 3;

  const { tol, lumGate, satGate, skinR, skinRB, paintedSat, feather } = profile;

  // BFS from every border pixel.
  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) { stack.push(x, 0); stack.push(x, height - 1); }
  for (let y = 0; y < height; y++) { stack.push(0, y); stack.push(width - 1, y); }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const pidx = y * width + x;
    if (visited[pidx]) continue;
    const idx = pidx * channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const dr = Math.abs(r - bgR), dg = Math.abs(g - bgG), db = Math.abs(b - bgB);
    const chroma = Math.max(dr, dg, db);
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);

    // Skin guard — keep warm-toned mid pixels even if close to bg
    const looksSkin = (r > skinR) && (r - b > skinRB) && (r > g);
    // Painted-edge guard — anything saturated is real ink, never bg
    const looksPainted = sat >= paintedSat;

    const isBgRef = chroma <= tol;
    const isWash  = lum >= lumGate && sat <= satGate;
    const isBg = !looksSkin && !looksPainted && (isBgRef || isWash);

    if (!isBg) continue;
    visited[pidx] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // Soft 1px feather — bg pixels touching FG get partial alpha so the
  // cut doesn't read as cardboard.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pidx = y * width + x;
      if (!visited[pidx]) continue;
      const idx = pidx * channels;
      let touchesFg = false;
      for (let dy = -1; dy <= 1 && !touchesFg; dy++) {
        for (let dx = -1; dx <= 1 && !touchesFg; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (!visited[ny * width + nx]) touchesFg = true;
        }
      }
      data[idx + 3] = touchesFg ? feather : 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outFile);

  let cleared = 0;
  for (let i = 0; i < width * height; i++) if (visited[i]) cleared++;
  return {
    cleared, total: width * height,
    bgRef: [bgR, bgG, bgB].map(Math.round),
    bgLum: Math.round(bgLum),
    width, height,
  };
}

// ── Run ────────────────────────────────────────────────────────────────────

(async () => {
  console.log('Backing up originals if needed...');
  ensureBackups();
  console.log('\nStripping...');
  for (const [f, profileKey] of Object.entries(FILE_PROFILES)) {
    const src = path.join(BACKUP_DIR, f);
    const dst = path.join(CHAR_DIR, f);
    if (!fs.existsSync(src)) {
      console.log(`  ! ${f}: backup missing, skipping`);
      continue;
    }
    const profile = PROFILES[profileKey];
    const tmp = dst + '.tmp';
    const stats = await strip(src, tmp, profile);
    fs.renameSync(tmp, dst);
    const pct = (stats.cleared / stats.total * 100).toFixed(1);
    console.log(`  ✓ ${f.padEnd(26)} ${stats.width}×${stats.height}  cleared ${pct.padStart(5)}%  bg=${stats.bgRef.join(',')}  lum=${stats.bgLum}`);
  }
  console.log('\nDone. Reload the game to pick up the new alpha.');
})().catch((e) => { console.error(e); process.exit(1); });
