// Composite each stripped PNG over a checkerboard so I can eyeball whether the
// silhouette is clean or carrying a bg halo / chewed edges.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'scripts', 'preview-out');
fs.mkdirSync(OUT, { recursive: true });

const FILES = [
  'assets/images/char/player_front_idle.png',
  'assets/images/char/player_run_side.png',
  'assets/images/char/truck_far.png',
  'assets/images/char/truck_mid.png',
];

(async () => {
  for (const rel of FILES) {
    const full = path.join(ROOT, rel);
    const img = sharp(full);
    const { width, height } = await img.metadata();
    // 16x16 magenta-on-cyan checker = very obvious if any halo bleeds through.
    const cs = 16;
    const buf = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y*width + x) * 3;
        const odd = ((Math.floor(x/cs) + Math.floor(y/cs)) % 2) === 0;
        buf[i] = odd ? 255 : 0;       // R
        buf[i+1] = 0;                  // G
        buf[i+2] = odd ? 0 : 255;     // B
      }
    }
    const checker = sharp(buf, { raw: { width, height, channels: 3 } });
    const composited = await checker
      .composite([{ input: full }])
      .png()
      .toBuffer();
    const outName = path.basename(rel, '.png') + '_check.png';
    fs.writeFileSync(path.join(OUT, outName), composited);
    console.log(`wrote ${outName}`);
  }
})();
