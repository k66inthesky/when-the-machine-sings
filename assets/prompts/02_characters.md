# Character Prompts (~22 images)

> Consistency is the hard part. **Pass 1** establishes the character. Subsequent passes for other poses/expressions: paste Pass 1's output as a **reference image** + use the same seed if your tool supports it.

---

## CH-01 — Player character (you), full body front

**Save as:** `assets/images/char/player_front_idle.png`
**Aspect:** 1:1, transparent background if possible

**Prompt:**

> Full body standing portrait of a young adult in modern casual home clothes — oversized grey t-shirt, black shorts, plastic slippers (藍白拖), messy hair, holding a smartphone in one hand and a yellow government-regulated trash bag (透明黃色專用垃圾袋) in the other. Slightly hunched posture, a bit sleepy, warm tired smile. Ambiguous gender-presenting, late 20s, East Asian features. Face readable from a distance, stylized not realistic. **Transparent background, character centered, full body visible head to toe.**

---

## CH-02 — Player walking frame (side view, 4 frames)

**Save as:** `assets/images/char/player_walk_side_01.png` through `_04.png`
**Aspect:** 1:1 each

**Prompt (generate 4 variants from same prompt + reference CH-01):**

> Same character as [reference CH-01], now in side-view walking cycle pose — left foot forward, right arm swinging forward, still holding yellow trash bag, slight forward lean conveying hurry. **Side profile. Transparent background. Keep face, hair, clothes identical to reference image.**

Generate frames 2, 3, 4 with slight variations in leg position (mid-stride, right-foot-forward, mid-stride opposite).

---

## CH-03 — Player running frame (urgency)

**Save as:** `assets/images/char/player_run_side.png`
**Aspect:** 1:1

**Prompt:**

> Same character as reference, now mid-sprint — both feet off the ground, hair blown back, trash bag swinging forward with motion blur streaks (hand-drawn ink speed-lines, not photo blur), face urgent but determined. Side view. Transparent background.

---

## CH-04 — Mom (3 expressions: angry, satisfied, proud)

**Save as:** `assets/images/char/mom_angry.png`, `_satisfied.png`, `_proud.png`
**Aspect:** 1:1

**Prompt (base — vary expression line):**

> Portrait bust of a Taiwanese mother in her early 50s, practical short permed hair, wearing a floral cotton apron over a simple blouse, kind but tired eyes, holding a wooden spoon in one hand. Expression: **[ANGRY — brow furrowed, mouth open mid-scold, waving the spoon / SATISFIED — small soft smile, spoon lowered / PROUD — warm smile, one eyebrow raised approvingly]**. Warm lighting. Transparent background. Waist-up framing.

---

## CH-05 — The garbage truck (3 distances: far, medium, close)

**Save as:** `assets/images/char/truck_far.png`, `_mid.png`, `_close.png`
**Aspect:** 16:9 each

**Prompt (base):**

> A Taiwanese municipal garbage truck, white cab with orange horizontal stripes, open rear hopper with a claw mechanism, boxy 1990s-2000s design (not futuristic), side view, orthographic perspective, illustrated in warm hand-drawn style. Visible details: "台北市環保局" (Taipei City Environmental Protection Bureau) lettering on the side, side mirrors, a small speaker mounted above the cab (this is where the music plays from). **Transparent background. Full truck visible with about 10% margin on each side.**

**Variations:**
- `_far.png`: same, but scaled down to appear small-in-frame (fills about 30% of canvas width), soft atmospheric haze
- `_mid.png`: normal scale (fills about 60% of canvas width)
- `_close.png`: larger (fills 90%), rear hopper details clearly visible, ready-to-throw distance

---

## CH-06 — Street NPCs (4 variants)

**Save as:** `assets/images/char/npc_aunty.png`, `_uncle.png`, `_kid.png`, `_grandma.png`
**Aspect:** 1:1 each

**Prompt (one per variant):**

- **aunty:** Middle-aged Taiwanese woman, perm hair, carrying a small dog on a leash, side view walking slowly, blocking the alley narrow width. Transparent background.
- **uncle:** Older man in a white sleeveless undershirt (台客 vibe), flip flops, holding a lit cigarette, leaning on a scooter and reading a newspaper. Transparent background.
- **kid:** A child in a school uniform, chasing a ball into the street. Transparent background.
- **grandma:** A thin elderly woman with a hand-pushed wooden cart full of flattened cardboard and a few plastic bottles — this is an elderly scavenger (拾荒嬤). Kind weathered face, simple cotton clothes, a hand towel wrapped on her head. She is slow and small. Warm but dignified portrayal. **This character appears in the ending — treat with respect, no caricature.**

---

## CH-07 — Sanitation worker (cleaner, hero of the ending)

**Save as:** `assets/images/char/cleaner_back.png`, `_front.png`
**Aspect:** 1:1 each

**Prompt:**

> Taiwanese sanitation worker in his mid-50s, 30 years on the job. Olive-green uniform with reflective yellow stripes, a cap, work gloves, slightly stooped posture from decades of labor, weathered kind face with laugh lines, small build. Carries a broom or grabs a trash bag with practiced ease. **Front portrait** version: three-quarter facing camera, warm expression. **Back version**: shown from behind, walking toward a parked garbage truck at the end of his shift. Both warm and dignified — this is the emotional core of the ending, do not caricature, no cartoon exaggeration.

---

## Consistency checklist (after generation)

- [ ] Player face same across all 6+ player images
- [ ] Mom face same across 3 expression images
- [ ] Cleaner face same across 2 images
- [ ] Truck is the same vehicle across 3 distances (same stripes, same lettering)
- [ ] Color palette matches the style guide (no accidental saturated greens/blues)
- [ ] Line work density matches across images (not some sketchy, some polished)

If consistency fails on any character: regenerate with the first successful image as explicit reference, or accept and move on — one-dev jam scope.
