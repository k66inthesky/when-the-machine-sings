import { defineConfig } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';

// Phaser loads assets by hardcoded relative paths (e.g. 'assets/images/bg/...').
// Vite's dev server happens to serve project-root files, but `vite build` does
// not copy them — so we mirror the whole assets/ tree into dist/ at build end.
// Only ship runtime media (images + .mp3/.ogg audio). Raw-format source audio
// (.wav/.flac), prompts, Windows NTFS Zone.Identifier streams, and .gitkeep
// markers are useful in-repo but not in the shipped bundle — YT Playables caps
// the total bundle at 15 MiB and raw-format source audio alone is >50 MB.
const copyAssetsPlugin = () => ({
  name: 'copy-assets-dir',
  apply: 'build',
  async closeBundle() {
    const subdirs = ['images', 'audio'];
    for (const sub of subdirs) {
      const src = path.resolve('assets', sub);
      const dst = path.resolve('dist/assets', sub);
      try {
        await fs.cp(src, dst, {
          recursive: true,
          force: true,
          filter: (p) => {
            if (p.endsWith(':Zone.Identifier')) return false;
            if (p.endsWith('.gitkeep')) return false;
            // Only .mp3/.ogg are actually loaded by PreloadScene; strip raw
            // source-format audio so the shipped bundle stays under caps.
            if (p.endsWith('.wav') || p.endsWith('.flac')) return false;
            return true;
          },
        });
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
  },
});

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    strictPort: false,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 0,
  },
  plugins: [copyAssetsPlugin()],
});
