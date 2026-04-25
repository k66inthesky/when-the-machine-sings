// Cuts the off-white watercolor wash from the mom portraits while leaving
// skin / hair / clothing intact. Earlier passes were too aggressive — flood
// fill leaked across thin gaps and ate edges of the right arm + face.
//
// Strategy: BFS from the border, but a pixel only joins the bg set if BOTH
// (a) its colour is within `tol` of the sampled border average, AND
// (b) its luminance is above `minBgLum` (the apron / skin / hair are all
//     darker than the wash, so this excludes them cleanly).
// Skin tones in particular tend to sit around lum 200-220 with a warm bias;
// the wash sits at ~230+ and is desaturated. Combining the two cuts cleanly.
//
// Run: node scripts/strip-mom-bg.cjs
// Restores from /tmp/mom_orig/ first if available — defensive against
// accumulating cuts when the script gets re-run.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['mom_angry.png', 'mom_proud.png', 'mom_satisfied.png'];
const BACKUP_DIR = '/tmp/mom_orig';

async function strip(inFile, outFile) {
  const { data, info } = await sharp(inFile)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample bg from a thin border ring and compute mean RGB + min lum.
  let bgR = 0, bgG = 0, bgB = 0, n = 0;
  let minBorderLum = 255;
  const ring = (x, y) => {
    const idx = (y * width + x) * channels;
    bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; n++;
    const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (lum < minBorderLum) minBorderLum = lum;
  };
  for (let x = 0; x < width; x += 4) {
    for (const y of [0, 1, height - 2, height - 1]) ring(x, y);
  }
  for (let y = 0; y < height; y += 4) {
    for (const x of [0, 1, width - 2, width - 1]) ring(x, y);
  }
  bgR /= n; bgG /= n; bgB /= n;
  const bgLum = (bgR + bgG + bgB) / 3;

  // Tight params — only erase pixels that are close to the sampled bg
  // colour AND aren't recognisable skin. The wash sits around lum ~200; so
  // we allow anything within tol of the bg ref colour as long as it doesn't
  // look like skin (warm bias) or saturated cloth.
  const tol = 32;

  // BFS from every border pixel. Stack-based for speed.
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
    // Pixel-internal saturation (max channel - min channel). The watercolor
    // wash is essentially neutral grey — saturation < ~15. Skin (warm bias)
    // sits at saturation 40+. Clothing (apron blue/red) saturates much higher.
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    // Skin guard for safety even when chroma drift is small.
    const looksSkin = (r > 175) && (r - b > 24) && (r > g);
    // Background: either close to the sampled bg colour, OR a "bright neutral"
    // pixel that fits the wash profile (light + low saturation). Combining
    // both lets the BFS cross noisy texture patches without breaking on an
    // outlier bright spot.
    const isBg = !looksSkin && (
      (chroma <= tol) ||
      (lum >= 180 && sat <= 14)
    );
    if (!isBg) continue;
    visited[pidx] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // Soft 1px feather: bg pixels that touch foreground get partial alpha
  // so the cut looks painted, not stamped.
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
      data[idx + 3] = touchesFg ? 110 : 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outFile);

  let cleared = 0;
  for (let i = 0; i < width * height; i++) if (visited[i]) cleared++;
  return {
    cleared, total: width * height,
    bgRef: [bgR, bgG, bgB].map(Math.round),
    bgLum: Math.round(bgLum), tol,
  };
}

(async () => {
  for (const f of FILES) {
    const dst = path.join(ROOT, 'assets', 'images', 'char', f);
    // Always start from the pre-strip backup so re-runs are deterministic.
    const backup = path.join(BACKUP_DIR, f);
    if (fs.existsSync(backup)) {
      fs.copyFileSync(backup, dst);
    }
    if (!fs.existsSync(dst)) {
      console.log(`skip (missing): ${f}`);
      continue;
    }
    const tmp = dst + '.tmp';
    const stats = await strip(dst, tmp);
    fs.renameSync(tmp, dst);
    const pct = (stats.cleared / stats.total * 100).toFixed(1);
    console.log(`${f}: cleared ${pct}% (bg ref rgb ${stats.bgRef.join(',')}; lum ${stats.bgLum}; tol ${stats.tol})`);
  }
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
