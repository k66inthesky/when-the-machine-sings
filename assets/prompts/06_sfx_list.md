# Sound Effects Shopping List (12 SFX)

Sources, in priority order:

1. **You record with your phone** — if you're in Taiwan and can do it cheaply, do it (see `07_user_recordings.md`)
2. **[freesound.org](https://freesound.org)** — filter by CC0 license
3. **[jsfxr](https://sfxr.me)** — procedural generator, perfect for UI beeps
4. **[BBC Sound Effects](https://sound-effects.bbcrewind.co.uk)** — free for personal/educational

All final files go into `assets/audio/sfx/` as `.mp3` or `.ogg`, named exactly as below.

---

| File | Source | Notes |
|---|---|---|
| `sfx_truck_engine_loop.mp3` | 🎤 your phone OR freesound "diesel truck idle" | 10-second loop, low rumble |
| `sfx_truck_brake.mp3` | freesound "truck brake squeal" | 1 second, dry |
| `sfx_bag_drop.mp3` | freesound "plastic bag drop" or jsfxr plop | under 0.5 sec |
| `sfx_bag_hit_metal.mp3` | freesound "trash can lid" | soft metallic impact |
| `sfx_footsteps_loop.mp3` | freesound "slippers shuffling" | 1.5 sec loop |
| `sfx_running_loop.mp3` | freesound "running concrete" | 1 sec loop, faster |
| `sfx_phone_notification.mp3` | jsfxr, 2-note rising beep | LINE message ping |
| `sfx_tv_static_bg.mp3` | freesound "crt tv static" or "soap opera muffled" | very quiet ambient loop |
| `sfx_door_slide.mp3` | freesound "metal shutter" | 1 sec |
| `sfx_qte_success.mp3` | jsfxr, 3-note ascending chime | positive feedback |
| `sfx_qte_fail.mp3` | jsfxr, 2-note descending buzz | negative feedback |
| `sfx_score_count.mp3` | jsfxr, quick tick ticker | result screen |

## jsfxr presets (copy these strings into https://sfxr.me)

Use these to generate consistent UI SFX in under 5 minutes total.

| File | Preset name | Description |
|---|---|---|
| `sfx_phone_notification` | **Pickup / Coin** | 2-note beep, shortened |
| `sfx_qte_success` | **Powerup** | rising chime |
| `sfx_qte_fail` | **Hit / Hurt** | descending buzz |
| `sfx_score_count` | **Pickup / Coin** | shortened rapid tick |

(On sfxr.me, pick the preset button on the left, tweak if desired, click Export WAV → Export MP3 or convert in Audacity.)

## Volume normalization

After gathering everything, batch-normalize in Audacity:
- Load all SFX → `Tracks → Normalize → −6 dB peak`
- Export individually, 128 kbps MP3

This prevents the "one sound is way louder than the others" problem that kills playtest impressions.
