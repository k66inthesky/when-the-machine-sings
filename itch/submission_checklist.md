# Gamedev.js Jam 2026 — Submission Checklist

Deadline: **2026-04-26 17:00 CET** (Taipei: 2026-04-26 23:00 CST)
Today: **2026-04-21** — ~5 days of buffer.

## Status (2026-04-21 midday)

- Code: complete end-to-end pipeline smoke-tested (Title → Intro → 5 days → Ending → Credits)
- Art: 6 painted backgrounds + 9 character sprites integrated; more optional assets welcome
- Music: 3 Suno tracks loaded (`bgm-main`, `bgm-tension`, `bgm-ending`) — real audio hooks wired
- Voice: 10 mom voice slots wired to Preload (5 days × caught/missed) — waiting on user recording
- SFX: 8 WebAudio procedural fallbacks in place; real files optional
- Touch buttons + mute + pause + debug shortcut all shipped
- Audio context unlock fixed (first-gesture resume in main.js)
- **YouTube Playables SDK integrated** via `src/systems/Playables.js` adapter — same build runs on itch / YT / Wavedash / localhost with no branching
- **Wavedash manifest** (`wavedash.toml`) + runbook (`docs/DEPLOY_WAVEDASH.md`) ready to push

## Before submitting

- [ ] `npm run build` produces clean `dist/` with all images + audio
- [ ] `npm run release` zips dist into `wtms-submission.zip` (also works manually)
- [ ] Test the zip by extracting and opening `index.html` locally — make sure assets resolve with relative paths
- [ ] At least one full 5-day playthrough end-to-end in Chrome + Firefox
- [ ] Audio unlock works (first click/keypress resumes WebAudio context)
- [ ] No uncaught errors in console during a full playthrough
- [ ] Mute toggle (M) and pause (ESC) confirmed on both scenes
- [ ] `?day=N` URL param still skips to that day (useful for judges)

## Itch.io page

- [ ] Title: **When the Machine Sings**
- [ ] Short description (one line): *A narrative arcade game about Taiwan's garbage trucks and the music they sing.*
- [ ] Kind of project: **HTML**
- [ ] Release status: **Released**
- [ ] Cover image uploaded (630×500, see `cover_prompt.md`)
- [ ] Genre: **Arcade** (primary), tag also as **Narrative**
- [ ] Tags: `gamedevjs-jam-2026`, `taiwan`, `arcade`, `narrative`, `phaser`, `html5`, `audio`, `dusk`
- [ ] Description body: paste `description.md`
- [ ] Screenshots × 5 (see `cover_prompt.md` for suggested shots)
- [ ] Community: Comments enabled, Disable rating = off
- [ ] Pricing: No payments (free)

## Jam submission

- [ ] Submit via [gamedevjs-2026 jam page](https://itch.io/jam/gamedevjs-2026)
- [ ] Fill in: Innovation (audio-as-gameplay), Theme (machines ritual), Gameplay, Graphics, Audio
- [ ] **Tick every challenge** on the submission form (sign-ups are what enter you — sign-up is free, opt-outs cost prize money):
  - [ ] Open Source (GitHub Copilot Pro × 5) — repo is public + MIT
  - [ ] Build it with Phaser (Phaser Editor Pro × 10) — Phaser 3.90
  - [ ] YouTube Playables (Gemini Pro × 5, fast-track × 10) — SDK is live in the build
  - [ ] Deploy to Wavedash ($1k / $750 / $500 / $250) — **run `wavedash build push` first** per `docs/DEPLOY_WAVEDASH.md`
  - [ ] (skip) Ethereum — not integrated
- [ ] Submit at least 12 hours before deadline to leave buffer for fixes

## Wavedash (one extra step — takes ~10 min)

- [ ] `curl -fsSL https://wavedash.com/cli/install.sh | sh` to install CLI
- [ ] `wavedash auth login` (browser flow)
- [ ] `wavedash init` in repo root — fills `game_id` into wavedash.toml
- [ ] `npm run build` → `wavedash build push`
- [ ] Publish the pushed build via Wavedash Developer Portal
- [ ] Paste the Wavedash URL into itch description as a secondary play link

## Post-submit

- [ ] Share on Gamedev.js jam Discord channel #submissions
- [ ] Post to X / Mastodon with gameplay gif
- [ ] Keep the repo public with MIT license
- [ ] Push committed code to origin/main so Open Source judges see the final state
