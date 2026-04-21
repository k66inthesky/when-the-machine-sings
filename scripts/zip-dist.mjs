#!/usr/bin/env node
// Zip the dist/ folder into wtms-submission.zip for itch.io upload.
// Uses `archiver` to avoid a dependency on the system `zip` binary
// (WSL sui ships without it by default).

import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import archiver from 'archiver';

const distDir = resolve('dist');
const outFile = resolve('wtms-submission.zip');

async function ensureDist() {
  try {
    const s = await stat(distDir);
    if (!s.isDirectory()) throw new Error('not a directory');
  } catch (e) {
    console.error(`dist/ not found at ${distDir}. Run \`npm run build\` first.`);
    process.exit(1);
  }
}

await ensureDist();

const output = createWriteStream(outFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const mb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`wrote ${outFile} (${mb} MB)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') console.warn('[zip warn]', err.message);
  else throw err;
});
archive.on('error', (err) => { throw err; });

archive.pipe(output);
archive.directory(distDir, false);
await archive.finalize();
