// Background removal for character/truck PNGs that arrived as JPEG-with-PNG-extension.
//
// Strategy: flood-fill from image edges. Any pixel within `tol` RGB-distance of the
// detected background color, AND reachable from an edge through a chain of background
// pixels, becomes transparent. Internal pixels that happen to match (e.g. white t-shirt
// against a white bg) are preserved because they're not edge-connected.
//
// After flood-fill, we feather the silhouette by 1px (alpha proportional to distance
// from the cut) so the result composites cleanly over the painted backdrops.
//
// Output overwrites the input file in place; originals are first copied to assets/raw/
// so the disk truth can be restored if a tweak goes sideways.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'assets', 'raw');
fs.mkdirSync(RAW, { recursive: true });

// tolerance: RGB Euclidean distance under which pixels match bg (after edge connectivity)
// trim: extra alpha-trim to crop empty margin
// JPEG compression introduces wide pixel variance against a flat AI bg, so tolerance
// needs to be generous (~70-90). Flood-fill from the edges keeps internal whites safe.
const JOBS = [
  { rel: 'assets/images/char/player_front_idle.png', tol: 75, trim: true },
  // Run + walk frames share a busy grey bg with wide JPEG variance; needs higher tolerance.
  { rel: 'assets/images/char/player_run_side.png',   tol: 95, trim: true },
  { rel: 'assets/images/char/player_walk_side_01.png', tol: 95, trim: true },
  { rel: 'assets/images/char/player_walk_side_02.png', tol: 95, trim: true },
  { rel: 'assets/images/char/player_walk_side_03.png', tol: 95, trim: true },
  { rel: 'assets/images/char/player_walk_side_04.png', tol: 95, trim: true },
  { rel: 'assets/images/char/truck_far.png',         tol: 80, trim: true },
  { rel: 'assets/images/char/truck_mid.png',         tol: 90, trim: true },
  // Mom portraits — flat studio-grey bg around 188-191. Higher tolerance handles
  // soft hair edges that fade into the bg gradient (a tight tol leaves a halo).
  { rel: 'assets/images/char/mom_angry.png',     tol: 110, trim: true },
  { rel: 'assets/images/char/mom_proud.png',     tol: 110, trim: true },
  { rel: 'assets/images/char/mom_satisfied.png', tol: 110, trim: true },
];

function rgbDist(a, b) {
  const dr = a[0]-b[0], dg = a[1]-b[1], db = a[2]-b[2];
  return Math.sqrt(dr*dr + dg*dg + db*db);
}

async function strip(job) {
  const full = path.join(ROOT, job.rel);
  const backup = path.join(RAW, path.basename(job.rel));
  if (!fs.existsSync(backup)) fs.copyFileSync(full, backup);

  const img = sharp(backup);
  const meta = await img.metadata();
  const w = meta.width, h = meta.height;
  const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = 4;

  const px = (x, y) => [data[(y*w+x)*ch], data[(y*w+x)*ch+1], data[(y*w+x)*ch+2]];

  // Determine background color from top + bottom rows (most reliable — well-framed
  // AI output never has the subject touching the very top/bottom edge). Median per
  // channel rejects any stray dark pixels (e.g. drop shadow that briefly grazes the
  // edge).
  const samples = [];
  for (let x = 0; x < w; x += 4) { samples.push(px(x, 0)); samples.push(px(x, h-1)); }
  const median = (idx) => {
    const arr = samples.map(s => s[idx]).sort((a,b)=>a-b);
    return arr[Math.floor(arr.length/2)];
  };
  const bg = [median(0), median(1), median(2)];

  // Flood fill from edges. Mark visited[y*w+x] = 1 for transparent.
  const visited = new Uint8Array(w*h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, 0); stack.push(x, h-1); }
  for (let y = 0; y < h; y++) { stack.push(0, y); stack.push(w-1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const idx = y*w + x;
    if (visited[idx]) continue;
    const c = px(x, y);
    if (rgbDist(c, bg) > job.tol) continue;
    visited[idx] = 1;
    stack.push(x+1, y); stack.push(x-1, y);
    stack.push(x, y+1); stack.push(x, y-1);
  }

  // Apply alpha: 0 where visited; otherwise 255. Edge feather: pixel kept but neighbor
  // visited → drop alpha to 180.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y*w + x) * ch;
      const idx = y*w + x;
      if (visited[idx]) {
        data[i+3] = 0;
      } else {
        // Look at 4-connected neighbors for feathering
        let near = 0;
        if (x > 0   && visited[idx-1]) near++;
        if (x < w-1 && visited[idx+1]) near++;
        if (y > 0   && visited[idx-w]) near++;
        if (y < h-1 && visited[idx+w]) near++;
        if (near >= 2) data[i+3] = 160;
        else if (near === 1) data[i+3] = 220;
      }
    }
  }

  let out = sharp(data, { raw: { width: w, height: h, channels: 4 } });
  if (job.trim) out = out.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 });
  await out.png({ compressionLevel: 9 }).toFile(full);
  const meta2 = await sharp(full).metadata();
  console.log(`${job.rel}: bg=rgb(${bg.map(v=>v.toFixed(0)).join(',')}) → ${meta2.width}x${meta2.height} (was ${w}x${h})`);
}

(async () => {
  for (const j of JOBS) await strip(j);
})();
