# Suno AI Music Prompts (3 tracks)

> Suno's style prompt field is short. Keep genre + mood + instrumentation tight. Use the "Custom Mode" with manual lyrics = "[instrumental]" for all tracks (no vocals in this game). Length target: 2 minutes each; Suno will give you 2 variants per generation — pick the best.

---

## BGM-01 — Main theme (warm Für Elise arrangement)

**Save as:** `assets/audio/music/bgm_main.mp3`
**Length target:** 2:00 loop
**When it plays:** Apartment scene + Title + low-intensity moments

### Suno settings

- **Mode:** Custom Mode
- **Instrumental:** ✅ yes
- **Style of Music:**
  ```
  warm classical piano arrangement of Beethoven's Für Elise, slow tempo, solo upright piano with subtle felt-muted tone, gentle reverb, nostalgic, cinematic, Studio Ghibli soundtrack influence, Joe Hisaishi style, no percussion, no electronic elements, intimate living-room mood, minor-key melancholy with warmth
  ```
- **Title:** `When the Machine Sings — Main Theme`
- **Lyrics:** `[Instrumental]`

### Fallback (if Suno refuses "Für Elise" by name)

Replace the first line with:
> `warm classical piano arrangement in A minor, three-part melody reminiscent of classic European parlor music, slow tempo, solo upright piano with felt-muted tone...`

---

## BGM-02 — Tension variant (truck approaching)

**Save as:** `assets/audio/music/bgm_tension.mp3`
**Length target:** 1:30 loop
**When it plays:** When truck proximity > 60% in Apartment scene, and during Street scene chase

### Suno settings

- **Mode:** Custom Mode
- **Instrumental:** ✅ yes
- **Style of Music:**
  ```
  same melody as Beethoven's Für Elise but arranged with rising tension, classical piano plus low pulsing cello drone, soft heartbeat taiko-like rhythm underneath, tempo slightly faster, minor key emphasized, cinematic chase-but-still-warm mood, dusk emotional, no vocals, no electronic synths
  ```
- **Title:** `When the Machine Sings — Chase`
- **Lyrics:** `[Instrumental]`

---

## BGM-03 — Ending theme (original, emotional)

**Save as:** `assets/audio/music/bgm_ending.mp3`
**Length target:** 1:30
**When it plays:** Ending Act II and III

### Suno settings

- **Mode:** Custom Mode
- **Instrumental:** ✅ yes
- **Style of Music:**
  ```
  emotional solo piano ballad with gentle string section entering at the one-minute mark, slow tempo (60 bpm), warm reverb, nostalgic, Joe Hisaishi and Yann Tiersen influenced, a theme of quiet dignity and hope after hardship, major key in the second half, no percussion, no vocals, no electronic elements, Taiwan evening melancholy, cinematic end-credits mood
  ```
- **Title:** `When the Machine Sings — Thank Them`
- **Lyrics:** `[Instrumental]`

---

## Post-processing checklist

For all 3 tracks:

1. Download MP3 at highest Suno quality.
2. Open in Audacity (free). Normalize to −3 dB peak. Trim any silence at start/end.
3. For BGM-01 and BGM-02, find a clean loop point (usually a downbeat at the end of a phrase) and export as MP3, 128 kbps (small file, adequate for in-browser).
4. For BGM-03, leave as single-play (no loop).
5. **File size target:** under 2 MB each. If over, drop bitrate to 96 kbps.

## SFX mini-prompt (for jsfxr / Bfxr, not Suno)

Not generated with Suno — use jsfxr presets / freesound CC0. See `06_sfx_list.md`.
