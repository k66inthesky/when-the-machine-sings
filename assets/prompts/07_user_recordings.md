# What You (the user) Need to Record in Person

These are the things I literally cannot generate — you being in Taiwan with a phone is an unfair advantage. Each takes under 5 minutes.

---

## REC-01 — Mom's voice lines (you, 女聲)

**Where:** A quiet room (bedroom, closet, car parked in a garage). Aim for zero echo.
**How:** Phone voice recorder, phone held about 15 cm from mouth.
**Volume:** Speak naturally, don't shout — you can amplify later in Audacity.
**Language:** 國台語混用最道地。錄兩版 (國語 + 英文) 以便國際玩家至少聽得懂情緒。

### Lines to record (10 takes each, pick the best)

| ID | 中文原台詞 | English version (optional second take) | Emotion |
|---|---|---|---|
| MOM-01 | 「垃圾車快來了啦！」 | "The truck is almost here!" | 急迫 |
| MOM-02 | 「你又在滑手機！」 | "You're on your phone again!" | 責備 |
| MOM-03 | 「衣架拿走不要忘記！」 | "Don't forget the laundry!" | 交代 |
| MOM-04 | 「袋子呢？袋子綁好了沒？」 | "Where's the bag? Did you tie it?" | 例行 |
| MOM-05 | 「你動作快一點！」 | "Hurry up!" | 趕 |
| MOM-06 | 「你又漏掉了！」 | "You missed it again!" | 失望 |
| MOM-07 | 「做得好啦。」 | "Well done." | 滿意（難得） |
| MOM-08 | 「阿母等你吃飯。」 | "Mom is waiting to eat." | 溫柔 |

### Post-processing (I'll write a one-command Audacity macro)

**Goal:** You are 20s/30s, Mom should sound like she's in her 50s. Light pitch-down (-2 semitones is enough) + slight compression + subtle warmth EQ. We are **not** doing a heavy formant shift that makes it unnatural.

1. Audacity → Effect → Change Pitch → −2 semitones (leaves duration the same)
2. Effect → Compressor → default preset
3. Effect → Filter Curve EQ → slight +2dB around 200 Hz, slight −2dB around 3 kHz

If your voice is already low-pitched, try −1 semitone. If you sound too young, go −3. Let me know after you record one sample and I'll tune it.

### File format

Save as `assets/audio/sfx/voice_mom_01.mp3` through `voice_mom_08.mp3`, 128 kbps MP3.

---

## REC-02 — Real garbage truck field recording

**When:** The next time the truck comes to your neighborhood.
**How:** Open phone voice recorder BEFORE it arrives. Stand near where you normally throw your trash. Record a solid 60 seconds covering:

1. The truck approaching from a distance (music barely audible)
2. Truck passing very close (music at full volume, engine clearly)
3. Truck braking to a stop
4. Neighborhood ambient (dogs barking? chatter?)
5. Truck leaving (music receding)

**Save as:** `assets/audio/sfx/field_truck_arrival.mp3`

Why this matters: **national-level authenticity in 60 seconds of recording**. No AI and no freesound library has this sonic signature of a Taipei evening. International judges will not have heard it. This is your unfair advantage.

---

## REC-03 — (Optional, high value) Real truck video clip

**What:** A 10-15 second mp4 of the actual truck passing, music playing, people running out with bags.
**Use in-game:** Can be overlaid as a textured VHS-filtered background layer in Act III of the ending, or used on the itch.io page as the GIF demo.
**Permission:** You are the one recording, you own it. Avoid clearly showing neighbors' faces — if captured, use a slight blur.

**Save as:** `assets/raw/truck_reference.mp4` (not shipped in game, reference only — **add `assets/raw/` to `.gitignore`**)

---

## REC-04 — (Optional) Ambient living room TV

**What:** Record 30 seconds of whatever is on your TV right now, muffled through a couch cushion (or record from another room).
**Why:** Makes the apartment scene feel real without needing licensed content (as long as volume is low enough to be ambient, and no specific copyrighted dialogue is audible).
**Save as:** `assets/audio/sfx/ambient_livingroom_tv.mp3`, 30 sec, very low volume baseline.

**⚠️ Copyright note:** If any dialogue / music is clearly audible, don't ship it. Heavy low-pass filter (Audacity → Low-Pass Filter, cutoff 800 Hz) will muffle it into unrecognizable ambient.

---

## Priority

1. **REC-01 (Mom voice)** — mandatory, unique value
2. **REC-02 (Field truck recording)** — mandatory, unique value
3. **REC-03 (Truck video)** — nice to have for itch.io GIF
4. **REC-04 (TV ambient)** — only if you have 5 extra minutes

Everything else I can do / fake with AI. These 4 things are where your being-in-Taiwan is pure gold.
