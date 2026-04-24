// Quick check: how many pixels are now transparent in each output?
const sharp = require('sharp');
const path = require('path');
const FILES = [
  'assets/images/char/player_front_idle.png',
  'assets/images/char/player_run_side.png',
  'assets/images/char/truck_far.png',
  'assets/images/char/truck_mid.png',
];
(async () => {
  for (const rel of FILES) {
    const full = path.resolve(__dirname, '..', rel);
    const { data, info } = await sharp(full).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparent = 0, partial = 0, opaque = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
      else if (data[i] < 255) partial++;
      else opaque++;
    }
    const total = info.width * info.height;
    console.log(`${rel}  ${info.width}x${info.height}  transp=${(100*transparent/total).toFixed(1)}%  partial=${partial}  opaque=${(100*opaque/total).toFixed(1)}%`);
  }
})();
