# Wavedash Deployment — step by step

The "Deploy to Wavedash" challenge in Gamedev.js Jam 2026 carries a $2,500
prize pool ($1k / $750 / $500 / $250). To be eligible the game must be
published on Wavedash. This file is the one-page runbook — everything here
is user-blocking because it needs credentials I can't create.

## One-time setup (5 minutes)

```bash
# 1. Install the CLI (single binary, per-machine install)
curl -fsSL https://wavedash.com/cli/install.sh | sh
wavedash --version   # sanity check

# 2. Log in — opens browser flow against wavedash.com
wavedash auth login
wavedash auth status  # should show your user

# 3a. (First time only) create a team and a game record in the Developer Portal.
#     Either click through the portal or use:
wavedash team create    --name "k66"
wavedash project create --title "When the Machine Sings" --team-id <TEAM_ID>

# 3b. Initialize this repo — detects Vite, prompts for the team + project you
#     just created, and writes the real `game_id` into wavedash.toml
#     (replacing the REPLACE_ME_AFTER_wavedash_init placeholder).
cd /home/k66/when-the-machine-sings
wavedash init
```

## Every-deploy flow (seconds)

```bash
cd /home/k66/when-the-machine-sings
npm run build                                  # emits dist/ (wavedash.toml points here)
wavedash build push -m "jam submission build"  # uploads dist/ as an immutable record
```

Uploading does NOT publish the game. Open the Wavedash Developer Portal,
find the build you just pushed, and click Publish to make it live. Only
published builds count for the jam challenge.

## Dev-mode smoke test (optional, recommended before `build push`)

```bash
wavedash dev   # serves dist/ over HTTPS with the Wavedash SDK injected
```

Playing through `wavedash dev` exercises the paths in
`src/systems/Playables.js` that only activate when `window.WavedashJS` is
present — in particular the leaderboard upload on the end-of-week screen.
Watch the browser console for any SDK errors before pushing.

## Listing copy

For the Wavedash store page, reuse `itch/description.md` verbatim — the
target audience is similar. The short tagline:

> In Taiwan, when the machine sings, you run. A narrative arcade game
> about the Beethoven-playing garbage truck and the cleaner who gave an
> old woman a rice cooker.

## Store page (fill in via the Developer Portal after first push)

- Title: **When the Machine Sings**
- Short tagline: *In Taiwan, when the machine sings, you run.*
- Long description: paste `itch/description.md` verbatim — same audience
- Thumbnail: same cover image uploaded to itch.io (see `itch/cover_prompt.md`)
- Screenshots: same 5 shots uploaded to itch.io
- Tags: `arcade`, `narrative`, `phaser`, `taiwan`, `audio`

## SDK features we integrate

- **Leaderboard** — `WavedashJS.getOrCreateLeaderboard("wtms-weekly-best", 0, 2)`
  then `uploadLeaderboardScore(id, totalScore, true)` from `EndingScene` via
  `Playables.sendScore()`. Feature-detected — no-op on other hosts.
- **Cloud saves** — not currently wired to Wavedash's remote-file API;
  YT Playables cloud saves + localStorage cover the cross-host case. If
  needed, extend `Playables.persist()` to also call
  `WavedashJS.uploadRemoteFile('saves/progress.json', ...)`.
- **Achievements / multiplayer** — out of scope for a 5-day narrative game.

## Notes

- `wavedash.toml` is committed with `game_id = "REPLACE_ME_AFTER_wavedash_init"`.
  `wavedash init` overwrites that in place; commit the result before pushing.
- Compression: Vite already gzips on dev but the Wavedash docs ask for
  Brotli on the hosted bundle — that's configured on their end, not ours.
