# When the Machine Sings

> *In Taiwan, when the machine sings, you run.*

A short narrative arcade game about the Taiwanese garbage truck — the machine that summons an entire neighborhood every evening with a Beethoven melody. A 6-day solo build for [Gamedev.js Jam 2026](https://itch.io/jam/gamedevjs-2026) (Theme: **Machines**).

![Theme: Machines](https://img.shields.io/badge/theme-machines-e8b96a) ![Phaser 3.90](https://img.shields.io/badge/phaser-3.90-6acfff) ![MIT](https://img.shields.io/badge/license-MIT-green)

---

## The premise

Every evening in Taiwan, garbage trucks roll through the neighborhood playing *Für Elise*. The music is a countdown: when it fades, the truck is gone, and your trash bag stays with you. Five in-game evenings. A mother who nags. A phone that steals your time. And in the last act, the camera leaves you and follows the truck — to somewhere based on a real Taipei news story from 2024-2025.

The game asks a small question inside a machine's nightly routine: *who are we noticing?*

## Play

- **Itch.io**: *link will be filled in at submission*
- **YouTube Playables**: submitted for certification (same build)
- **Wavedash**: [see docs/DEPLOY_WAVEDASH.md](./docs/DEPLOY_WAVEDASH.md)

Controls: `←` `→` to move, `E` phone, `T` TV, `Enter` downstairs, `Space` throw bag, `Esc` pause, `M` mute. Touch buttons mirror these on mobile. `?day=N` (1–5) jumps to a specific day.

A full week is about 5 minutes. The game is bilingual EN / 繁體中文 throughout.

## Why this code may be worth reading

- **The core mechanic is WebAudio.** [src/systems/AudioDistance.js](./src/systems/AudioDistance.js) drives truck proximity as a gain curve. The Für Elise melody *is* the countdown — you play by listening.
- **One build, three platforms.** [src/systems/Playables.js](./src/systems/Playables.js) is a thin adapter that fans out to whatever platform SDK is on the page. In the YT container it forwards to `ytgame.game.saveData` / `loadData`, respects `onPause` / `onResume` / `isAudioEnabled`, and feeds `engagement.sendScore`. On Wavedash it upserts a `wtms-weekly-best` leaderboard via `WavedashJS.uploadLeaderboardScore`. On itch / localhost it falls through to localStorage. No scene code branches on host.
- **Narrative > scope.** The repo is deliberately small. One mechanic, one emotion, one ending.

## Architecture

```
src/
├── main.js                  # Phaser.Game bootstrap, global mute, YT audio/pause hooks
├── config.js                # scene keys, canvas size
├── scenes/
│   ├── BootScene.js         # strips the HTML loading fallback
│   ├── PreloadScene.js      # asset load + firstFrameReady()
│   ├── TitleScene.js        # title card + mid-week resume + gameReady()
│   ├── IntroScene.js        # 2 slides of cultural primer
│   ├── ApartmentScene.js    # listen-for-truck phase, slack vs. listen
│   ├── StreetScene.js       # throw-the-bag phase
│   ├── ResultScene.js       # day summary
│   ├── EndingScene.js       # 4-act finale (fiction → news → dedication → credits)
│   └── PauseScene.js        # ESC overlay
├── systems/
│   ├── AudioDistance.js     # proximity → WebAudio gain (Für Elise synth / real BGM)
│   ├── Sfx.js               # procedural SFX
│   └── Playables.js         # YT Playables + localStorage adapter
├── data/
│   ├── levels.js            # 5 days × weather × pacing × mom opener
│   └── dialogue.js          # bilingual mom nags
└── objects/
    └── Player.js
```

## Jam challenges entered

| Challenge | Status | Evidence |
|---|---|---|
| **Main Ranking** (Innovation/Theme/Gameplay/Graphics/Audio) | Entering | This repo |
| **Open Source** (GitHub Copilot Pro × 5) | Entering | MIT + public repo + this README |
| **Build it with Phaser** (Phaser Editor Pro × 10) | Entering | [package.json](./package.json) — `phaser ^3.90.0` |
| **YouTube Playables** (Gemini Pro × 5, fast-track × 10) | Entering | SDK integrated — see [src/systems/Playables.js](./src/systems/Playables.js) |
| **Deploy to Wavedash** ($2,500 pool) | Entering | [docs/DEPLOY_WAVEDASH.md](./docs/DEPLOY_WAVEDASH.md), [wavedash.toml](./wavedash.toml), WavedashJS leaderboard wired in [src/systems/Playables.js](./src/systems/Playables.js) |
| Ethereum ($130) | Skipping | Blockchain integration conflicts with narrative |

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # emits dist/
npm run preview    # serves dist/ for a final check
npm run release    # build + zip dist/ as wtms-submission.zip
```

Debug shortcut: `?day=N` (1–5) on any URL skips straight into that day's apartment scene — useful for jam judging and QA.

## Tech stack

- [Phaser 3.90](https://phaser.io) — HTML5 game framework
- [Vite 5](https://vitejs.dev) — dev server and bundler
- [YouTube Playables SDK](https://developers.google.com/youtube/gaming/playables) — lifecycle + cloud saves when hosted on YT
- [archiver](https://www.npmjs.com/package/archiver) — build the submission zip
- Vanilla JavaScript + WebAudio — no other dependencies

## Credits

- *Für Elise* — Ludwig van Beethoven (Public Domain)
- Artwork: Google Gemini 2.5 Flash Image ("Nano Banana"); prompts by author
- Music: Suno AI (Premier plan); prompts by author
- Mom's voice: recorded by author
- Narrative: drawn from Taiwan news coverage 2024–2025 (cited in-game credits)

## License

MIT — see [LICENSE](./LICENSE). The project uses real news citations under fair use for educational / cultural context; characters are otherwise fictional.

Built solo by [@k66inthesky](https://github.com/k66inthesky).
