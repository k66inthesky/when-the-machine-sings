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

# 3. Initialize this repo — detects Vite, prompts for team + project, and
#    writes the real `game_id` into wavedash.toml (replacing the placeholder)
cd /home/k66/when-the-machine-sings
wavedash init
```

## Every-deploy flow (seconds)

```bash
cd /home/k66/when-the-machine-sings
npm run build          # emits dist/ which wavedash.toml already points at
wavedash build push    # uploads the dist/ folder as an immutable build record
```

Uploading does NOT publish the game. Open the Wavedash Developer Portal,
find the build you just pushed, and click Publish to make it live. Only
published builds count for the jam challenge.

## Listing copy

For the Wavedash store page, reuse `itch/description.md` verbatim — the
target audience is similar. The short tagline:

> In Taiwan, when the machine sings, you run. A narrative arcade game
> about the Beethoven-playing garbage truck and the cleaner who gave an
> old woman a rice cooker.

## Notes

- `wavedash.toml` is committed with `game_id = "REPLACE_ME_AFTER_wavedash_init"`.
  `wavedash init` overwrites that in place; commit the result before pushing.
- No Wavedash SDK integration required for single-player — SDK features
  (leaderboards, achievements, multiplayer) are optional and we skip them.
  If we later want to add a global leaderboard, the Playables adapter in
  `src/systems/Playables.js` is already designed as a drop-in abstraction
  and we can slot a Wavedash backend behind the same interface.
- Compression: Vite already gzips on dev but the Wavedash docs ask for
  Brotli on the hosted bundle — that's configured on their end, not ours.
