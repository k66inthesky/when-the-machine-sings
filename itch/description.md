# When the Machine Sings

*In Taiwan, when the machine sings, you run.*

---

A short narrative arcade game about Taiwan's garbage trucks — the machines
that summon an entire city with Beethoven, and the people they catch
mid-stride every evening.

Every dusk across Taiwan, yellow sanitation trucks roll through the alleys
playing *Für Elise* through their rooftop speakers. Residents stream out
of their apartments, trash bags in hand, to meet them. Miss the music —
miss the truck — the trash stays with you another day. And mom won't let
you forget it.

## What you play

**Five evenings** in a small Taipei walk-up. Mom keeps reminding you. Your
phone keeps lighting up. The TV won't shut up about tomorrow's weather.
*Für Elise* is still far away — until it isn't.

Each evening unfolds in three beats:

- **Slack.** Doomscroll the phone. Channel-flip the TV. Slacking earns
  points — but slack too hard and mom will know. (You only have one pair
  of eyes — try pressing **E** and **T** at the same time and find out.)
- **Stairwell.** Five flights down. From Day 2 onward, you might run into
  one of four neighbours: gossipy Auntie Zhang from 3F, mobility-impaired
  Grandpa Huang from 5F, the village chief Mrs. Chen from 2F, or the
  same-floor Miss Gao you've never quite said hi to. Press **E** within
  two seconds to engage — or just walk past. Each choice has consequences
  that ripple into mom's words and the ending.
- **Chase.** Down on the street, the truck rolls left. Time your throws
  to the green cue. Catch up — and mom is proud. Miss — and you'll hear
  about it on the next-day result screen.

## A real story behind the ending

After the fifth night, the credits keep going. The game's final act is
drawn from real Taipei news (2024–2026):

A sanitation worker found a working rice cooker in the recycling and gave
it to an elderly scavenger he passed every dusk. Residual value:
NT$32.56 — about 1 US dollar. He was indicted, convicted of
misappropriating recycled goods, and sentenced to 3 months. The internet
rallied. Judges and prosecutors were moved — sentence reduced to 3 months
suspended for 2 years. The Ministry of Justice began drafting amendments.

He is still on the route. The machine is still singing.

## Replay it

The week branches more than it looks. Stairwell encounters roll randomly
each day, choices accumulate, and the score gate decides which ending
you see:

> 4 neighbours × 2 (engage) = 8 outcomes / day  
> × 4 stairwell days = 8⁴ = 4,096  
> × ending gate (story / FAILED) = **8,192 distinct runs**

Hidden inside: **9 easter-egg scenes** (matchmaking insert, mom-proud
line, local-info gossip ×5 variants, mom-gossip-scold, CHALLENGE FAILED).
Try them all.

## Controls

| Key      | Action |
| -------- | ------ |
| `E`      | Scroll phone (slack) / engage neighbour in stairwell |
| `T`      | Watch TV (slack) |
| `Enter`  | Head downstairs with the bag |
| `← →`    | Move on the street |
| `Space`  | Throw bag / advance dialogue |
| `Esc`    | Pause |
| `M`      | Mute / unmute |
| `L`      | Toggle language (English / 繁中) |

On-screen buttons also work, so you can play with a mouse, on a phone in
landscape, or on a touchscreen kiosk. Append `?day=3` to the URL to skip
straight into a specific evening.

## Features

- Bilingual throughout (English / 繁體中文) — including mom's voice
- Mom-as-narrator with recorded voice clips for every line, both languages
  (zh-TW-HsiaoChen for Chinese; en-HK-Yan for an Asian-mom feel in English)
- All 7 ending vignettes (depot/handover/sentencing/interview/netizens/
  leniency/sun-after-rain) are **hand-coded** with Phaser primitives — no
  AI assets, just SVG-style procedural illustration so they animate cleanly
- Score gating: low effort lands you on a CHALLENGE FAILED card instead
  of the story
- Modal phone/TV overlays with input mutex (no holding-key shenanigans)
- Adapts to YouTube Playables, Wavedash, and itch.io with the same build

## Made with

- **Phaser 3.90** + **Vite** — HTML5, runs in any modern browser
- **Gemini 2.5 Flash Image (Nano Banana)** — 6 painted backgrounds + 3 mom
  portraits. Used as a *time-budget tool* on a 6-day solo build so the
  schedule could go to procedural ending vignettes, neighbour encounter
  branching, and bilingual voice generation; portraits hand-stripped
  (alpha mask + skin-aware filter), stairwell decluttered with sharp.
- **Suno AI Premier** — original score (*Für Elise* re-arrangement + a
  tension cue + the ending theme)
- **Microsoft Edge Neural TTS** — bilingual mom voice with custom pitch
  / rate envelope per intensity
- Built solo in 6 days for [Gamedev.js Jam 2026](https://itch.io/jam/gamedevjs-2026)

## Theme — Machines

The garbage truck *is* a machine, but in Taiwan it's also a nightly social
ritual: a clock, a community signal, a performance of an 18th-century
melody by a sanitation vehicle that pulls neighbours into the same alley
at the same hour. The game asks what happens inside the machine's routine
— who keeps it running, who steps out of frame to help, and what we miss
when we only notice the machine and not the people inside it.

## Jam challenges entered

- 🏆 **Main ranking** (Innovation / Theme / Gameplay / Graphics / Audio)
- 🐙 **Open Source** — MIT, public repo, readable architecture
- 🎮 **Build it with Phaser** — Phaser 3.90
- 📺 **YouTube Playables** — SDK integrated (firstFrameReady, gameReady,
  cloud saves, onPause/onResume, isAudioEnabled honored)
- 🌊 **Deploy to Wavedash** — same build deployed via CLI

## Credits

- *Für Elise* — Ludwig van Beethoven (public domain)
- News context: Chinatimes, LINE Today, Yahoo News Taiwan
- Based on real Taipei news, 2024–2026
- Author: **k66** ([X: @k66inthesky](https://x.com/k66inthesky))
- Source code (MIT):
  [github.com/k66inthesky/when-the-machine-sings](https://github.com/k66inthesky/when-the-machine-sings)

*Have you ever chased a garbage truck? Hope you enjoyed the story.*
