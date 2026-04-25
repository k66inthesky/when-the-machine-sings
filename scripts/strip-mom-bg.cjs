// Cuts the off-white textured background from the mom portraits via flood-fill
// from the four corners. Alpha tolerance is generous on the inside (~28 LAB
// distance) so the watercolor wash dissolves cleanly without nicking the
// floral apron's lighter petals.
//
// Run: node scripts/strip-mom-bg.cjs
//
// Reads assets/images/char/mom_{angry,proud,satisfied}.png in place
// (overwrites with alpha-stripped versions). PreloadScene picks them up on
// next reload — no code change needed.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['mom_angry.png', 'mom_proud.png', 'mom_satisfied.png'];

async function strip(inFile, outFile) {
  const img = sharp(inFile).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Sample background from a thin border ring (averages out texture noise).
  let bgR = 0, bgG = 0, bgB = 0, n = 0;
  const stride = 6;
  for (let x = 0; x < width; x += stride) {
    for (const y of [0, 1, 2, height - 3, height - 2, height - 1]) {
      const idx = (y * width + x) * channels;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; n++;
    }
  }
  for (let y = 0; y < height; y += stride) {
    for (const x of [0, 1, 2, width - 3, width - 2, width - 1]) {
      const idx = (y * width + x) * channels;
      bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2]; n++;
    }
  }
  bgR /= n; bgG /= n; bgB /= n;

  const tol = 36;       // chroma tolerance
  const lumTol = 18;    // also accept "anything brighter than ref - lumTol"

  // BFS from every border pixel. Stack-based for speed; visited bitset prevents
  // re-walking. Only pixels reachable from the border AND background-coloured
  // get cleared, so the apron's interior whites stay intact.
  const visited = new Uint8Array(width * height);
  const stack = [];
  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    stack.push(x, y);
  };
  for (let x = 0; x < width; x++) { seed(x, 0); seed(x, height - 1); }
  for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }

  let cleared = 0;
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
    const bgLum = (bgR + bgG + bgB) / 3;
    const isBg = chroma <= tol || lum >= bgLum - lumTol;
    if (!isBg) continue;
    visited[pidx] = 1;
    cleared++;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // Apply alpha. Edge pixels (background neighbouring foreground) get a
  // partial alpha so the cut-out doesn't read as cardboard. Cheap 1-pass
  // 3x3 majority check.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pidx = y * width + x;
      if (!visited[pidx]) continue;
      const idx = pidx * channels;
      // Partial transparency for border bg pixels touching foreground.
      let touchesFg = false;
      for (let dy = -1; dy <= 1 && !touchesFg; dy++) {
        for (let dx = -1; dx <= 1 && !touchesFg; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (!visited[ny * width + nx]) touchesFg = true;
        }
      }
      data[idx + 3] = touchesFg ? 90 : 0;
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outFile);
  return { cleared, total: width * height, bgRef: [bgR, bgG, bgB].map(Math.round) };
}

(async () => {
  for (const f of FILES) {
    const p = path.join(ROOT, 'assets', 'images', 'char', f);
    if (!fs.existsSync(p)) {
      console.log(`skip (missing): ${f}`);
      continue;
    }
    const tmp = p + '.tmp';
    const stats = await strip(p, tmp);
    fs.renameSync(tmp, p);
    const pct = (stats.cleared / stats.total * 100).toFixed(1);
    console.log(`${f}: cleared ${pct}% (bg ref rgb ${stats.bgRef.join(',')})`);
  }
  console.log('Done. PreloadScene will see the new alpha on reload.');
})().catch((e) => { console.error(e); process.exit(1); });
