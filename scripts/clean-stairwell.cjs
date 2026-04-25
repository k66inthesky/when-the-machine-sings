// Clean the painted stairwell of newspapers / bottles / slippers without
// losing the realistic Taipei-公寓 feel. The original PNG (already backed up
// at 02_stairwell_original.png) reads as a real stairwell; we just need to
// quiet the litter so it doesn't pull focus.
//
// Strategy: paint over the worst clutter regions with a single large clean
// concrete sample (tread of the upper-right stairs) — gaussian-blurred and
// soft-masked so the seam fades into the surrounding wall. Then a global
// mild dim + desaturate so the patches don't pop, plus a vignette so the
// eye stays on the centre stairs.
//
// Run: node scripts/clean-stairwell.cjs
// Writes assets/images/bg/02_stairwell.png in place. The original is kept
// as 02_stairwell_original.png on first run.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'images', 'bg', '02_stairwell.png');
const BACKUP = path.join(ROOT, 'assets', 'images', 'bg', '02_stairwell_original.png');

// Big clutter polygons (rectangles) on the 1024x559 image.
//   - Newspapers/flyers on landing
//   - Beer bottles + cans + slippers bottom-right
//   - Plastic bag/spill bottom-left
const CLUTTER = [
  { x: 230, y: 295, w: 290, h: 165 }, // newspapers
  { x: 670, y: 350, w: 354, h: 209 }, // bottles + slippers cluster
  { x: 0,   y: 420, w: 250, h: 139 }, // bottom-left plastic
];

// Clean sample window (concrete tread on the upper-right stairs).
const CLEAN = { x: 600, y: 200, w: 360, h: 100 };

async function buildPatch(srcBuf, dstW, dstH, blur) {
  // Take the clean tread, resize to the patch destination size, then heavily
  // blur to lose specifics. Add a soft alpha mask (radial gradient) so the
  // patch blends into the surrounding wall instead of having a hard edge.
  const fill = await sharp(srcBuf)
    .extract({ left: CLEAN.x, top: CLEAN.y, width: CLEAN.w, height: CLEAN.h })
    .resize(dstW + 40, dstH + 40, { fit: 'cover' })
    .blur(blur)
    .toBuffer();

  // Build a soft alpha mask via raw pixel buffer (simpler than sharp's mask
  // composite for a radial falloff).
  const w = dstW, h = dstH;
  const mask = Buffer.alloc(w * h);
  const cx = w / 2, cy = h / 2;
  const r = Math.max(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - cx, y - cy) / r;
      // Falloff: center fully opaque, edges 0. Bias inward so the edge is soft
      // but the centre fully covers the clutter.
      const a = Math.max(0, Math.min(1, 1.18 - d));
      mask[y * w + x] = Math.round(255 * Math.pow(a, 1.4));
    }
  }
  const maskBuf = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
    .png().toBuffer();

  return await sharp(fill)
    .extract({ left: 20, top: 20, width: w, height: h }) // re-centre after the +40 oversize
    .joinChannel(maskBuf)
    .png()
    .toBuffer();
}

async function clean() {
  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(SRC, BACKUP);
    console.log('Backed up original to 02_stairwell_original.png');
  }
  const sourceBuf = fs.readFileSync(BACKUP);
  const meta = await sharp(sourceBuf).metadata();
  console.log(`Source ${meta.width}x${meta.height}; patching ${CLUTTER.length} clutter regions.`);

  const overlays = [];
  for (const c of CLUTTER) {
    const patch = await buildPatch(sourceBuf, c.w, c.h, 14);
    overlays.push({ input: patch, left: c.x, top: c.y });
  }

  // Subtle vignette to draw the eye to the centre stairs.
  const vignette = Buffer.alloc(meta.width * meta.height * 4);
  const vcx = meta.width / 2, vcy = meta.height * 0.45;
  const vr = Math.max(meta.width, meta.height) * 0.65;
  for (let y = 0; y < meta.height; y++) {
    for (let x = 0; x < meta.width; x++) {
      const idx = (y * meta.width + x) * 4;
      const d = Math.hypot(x - vcx, y - vcy) / vr;
      const a = Math.max(0, Math.min(0.55, (d - 0.6) * 1.4));
      vignette[idx + 0] = 8;
      vignette[idx + 1] = 8;
      vignette[idx + 2] = 12;
      vignette[idx + 3] = Math.round(a * 255);
    }
  }
  const vignetteBuf = await sharp(vignette, {
    raw: { width: meta.width, height: meta.height, channels: 4 },
  }).png().toBuffer();

  await sharp(sourceBuf)
    .composite([
      ...overlays,
      { input: vignetteBuf, left: 0, top: 0 },
    ])
    .modulate({ saturation: 0.88, brightness: 0.95 })
    .png()
    .toFile(SRC);

  console.log('Done.');
}

clean().catch((e) => { console.error(e); process.exit(1); });
