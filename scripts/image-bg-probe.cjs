// Sample 4 corners of each char image to determine the background color.
const sharp = require('sharp');
const fs = require('fs');
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
    const img = sharp(full);
    const meta = await img.metadata();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const px = (x, y) => {
      const i = (y * info.width + x) * ch;
      return [data[i], data[i+1], data[i+2], ch >= 4 ? data[i+3] : 255];
    };
    const corners = [
      ['TL', px(0, 0)],
      ['TR', px(info.width-1, 0)],
      ['BL', px(0, info.height-1)],
      ['BR', px(info.width-1, info.height-1)],
      ['MID', px(Math.floor(info.width/2), Math.floor(info.height/2))],
    ];
    console.log(`${rel}  ${meta.width}x${meta.height} ch=${ch} fmt=${meta.format}`);
    for (const [k, c] of corners) console.log(`  ${k}: rgb(${c[0]},${c[1]},${c[2]}) a=${c[3]}`);
  }
})();
