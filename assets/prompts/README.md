# AI Asset Prompts — Execution Order

If you sit down right now to generate everything, this is the order:

## Phase 1 — Style lock-in (30 min)

1. Read **`00_style_guide.md`** — this is the style bible.
2. Pick one prompt from `01_backgrounds.md` (BG-03, the main alley, is best).
3. Generate 4 variants in Nano Banana / Gemini. Pick the one most on-style.
4. If none feel right, tweak the prompt / regenerate. **Do not move on until you have one image you love.** This image becomes the visual benchmark for everything else.

## Phase 2 — Backgrounds first (60 min)

5. Generate BG-01, BG-02, BG-04, BG-05, BG-06 — feed your benchmark from Phase 1 as a reference image each time.
6. Save to `assets/images/bg/` with the exact filenames.
7. Log each seed in `_log.md`.

## Phase 3 — Characters (90 min)

8. Generate CH-01 (player front) — benchmark the character design here.
9. Then CH-02 (player walking, reference CH-01), CH-03 (running).
10. Then CH-04 (mom 3 expressions).
11. Then CH-05 (truck 3 distances).
12. Then CH-06 (NPCs) and CH-07 (cleaner) — these last two carry the ending's emotional weight, prioritize quality.

## Phase 4 — Ending cutscene (60 min — take your time, this is the emotional core)

13. Generate END-01 through END-08 in order, they need to feel like one sequence.
14. END-05 (typography overlay frame) has no character, just atmosphere — easy.
15. END-08 (final "Thank them" shot) — regenerate as many times as needed, this is the last thing the player sees.

## Phase 5 — UI + Title (30 min)

16. Generate UI-01 (title key art) and UI-02 (itch.io cover).
17. Others (buttons, icons, loading) can be placeholder — we only need them to not look broken.

## Phase 6 — Music (20 min)

18. Open Suno, Custom Mode, Instrumental ON.
19. Generate BGM-01 first. If the main theme feels right the rest will too.
20. Generate BGM-02 (tension) and BGM-03 (ending).
21. Download, normalize in Audacity (−3 dB peak), export as 128 kbps MP3, drop into `assets/audio/music/`.

## Phase 7 — SFX (20 min)

22. Follow `06_sfx_list.md`.
23. Record your own on phone where it says 🎤.

## Phase 8 — Recordings (15 min + field trip for truck)

24. Follow `07_user_recordings.md`.

---

**Total generation time estimate:** ~5 hours of focused work.

You can also split over 2 sessions (Day 2 morning and Day 3 morning), and I will have integrated the first batch of assets into the game by then.
