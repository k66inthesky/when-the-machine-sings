#!/usr/bin/env node
// Zip the dist/ folder into wtms-submission.zip for itch.io upload.
//
// itch.io's HTML upload caps at 1000 files per zip — past that, the page
// rejects the upload with "Too many files in zip". We're well under that
// (~70 files), but the script enforces a hard cap and excludes obvious dev
// artefacts so a stray asset doesn't push us over silently.

import { createWriteStream } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import archiver from 'archiver';

const distDir = resolve('dist');
const outFile = resolve('wtms-submission.zip');

// itch.io HTML upload limit is 1000 files. Keep a buffer.
const MAX_FILES = 950;

// Files to skip even if they ended up in dist/. The two PNG/MD artefacts are
// dev backups + recording notes that don't ship; everything else is "any
// file Vite happened to copy that we don't want".
const SKIP_FILE_NAMES = new Set([
  '02_stairwell_original.png', // pre-cleanup backup, kept in repo only
  'RECORDING_SCRIPT.md',       // VO source doc
  '.DS_Store',
  'Thumbs.db',
]);
// Anything matching these regexes is also skipped.
const SKIP_PATTERNS = [
  /:Zone\.Identifier$/i,         // Windows mark-of-the-web sidecar
  /\.tmp$/i,
  /\.bak$/i,
];

async function listFiles(dir) {
  const out = [];
  async function walk(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.isFile()) {
        out.push(p);
      }
    }
  }
  await walk(dir);
  return out;
}

async function ensureDist() {
  try {
    const s = await stat(distDir);
    if (!s.isDirectory()) throw new Error('not a directory');
  } catch (e) {
    console.error(`dist/ not found at ${distDir}. Run \`npm run build\` first.`);
    process.exit(1);
  }
}

function shouldInclude(filePath) {
  const name = basename(filePath);
  if (SKIP_FILE_NAMES.has(name)) return false;
  for (const re of SKIP_PATTERNS) if (re.test(name)) return false;
  return true;
}

await ensureDist();

const allFiles = await listFiles(distDir);
const included = allFiles.filter(shouldInclude);
const skipped = allFiles.filter((f) => !shouldInclude(f));

if (skipped.length) {
  console.log(`Skipping ${skipped.length} dev-only file(s):`);
  for (const f of skipped) console.log(`  - ${relative(distDir, f)}`);
}

if (included.length > MAX_FILES) {
  console.error(`ERROR: ${included.length} files in zip exceeds itch.io safe cap of ${MAX_FILES}.`);
  console.error(`Trim assets in dist/ before re-running.`);
  process.exit(1);
}

const output = createWriteStream(outFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const mb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`wrote ${outFile} (${mb} MB, ${included.length} files / ${MAX_FILES} cap)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') console.warn('[zip warn]', err.message);
  else throw err;
});
archive.on('error', (err) => { throw err; });

archive.pipe(output);
for (const f of included) {
  archive.file(f, { name: relative(distDir, f) });
}
await archive.finalize();
