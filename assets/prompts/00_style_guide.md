# Visual Style Guide — When the Machine Sings

> This is the **style bible**. Paste the "Style suffix" at the end of every single Gemini / Nano Banana image prompt to keep the game looking like one game, not 50 random AI images.

---

## Core aesthetic

- **Medium:** Warm hand-drawn illustration, watercolor + gouache, visible paper grain
- **Influences:** Studio Ghibli backgrounds (Kiki, Spirited Away street scenes), Makoto Shinkai sky and lighting, Tatsuyuki Tanaka line work. **Do not copy specific Ghibli characters — use as stylistic reference only.**
- **Mood:** Nostalgic Taiwan evening. 1990s-to-2010s residential alley, not futuristic, not retro-pixel.
- **Palette:** Golden hour → dusk. Warm ochres, terracotta, muted pink sky, deep teal shadows, occasional neon sign red/green as accent only. Avoid saturated pure colors. 30-color palette discipline.
- **Lighting:** Soft directional light from low sun. Long shadows. Back-lit silhouettes acceptable.
- **No:** CG render look, 3D glossy, anime cel-shading, pixel art, vector flat, chibi cute.

## Composition rules

- Orthographic or near-orthographic side view for gameplay scenes (player will scroll left/right)
- 16:9 aspect ratio for backgrounds (1920×1080 or 960×540 final resolution)
- 1:1 for character portraits / cutscene faces
- Leave top 15% of background relatively empty — HUD overlay sits there

## Taiwan residential alley — required visual vocabulary

Every street scene MUST include at least 4 of these specific elements or it won't read as Taiwan:

- Red-brick 5-story walk-up apartment buildings with rust-streaked concrete
- Metal rolling shutters (鐵捲門), some half-open, some plastered with peeling stickers
- Dense scooter parking on the sidewalk (motorbikes, not bicycles)
- Window-mount air-conditioner units dripping condensation, tangled power cables above
- Traditional Chinese signage in red/yellow/blue on vertical banners: 早餐、鹹酥雞、檳榔、便利商店
- Plastic stools outside shops, round folding tables
- Power lines sagging between poles in thick tangles
- Small Buddhist/Taoist temple corner or red lanterns
- Narrow lane (not wide road)

## Color reference

- Sky golden hour: `#e8b96a` warm → `#c97a8a` pink → `#4a3a5a` dusk purple
- Brick: `#a0533a` with `#6b3020` shadows
- Shutter metal: `#c8b89c` aged cream
- Neon accents: `#ff6b8a` pink, `#6acfff` blue (sparingly)
- Skin tone: `#e5b590` warm

## Style suffix (PASTE AT END OF EVERY PROMPT)

```
warm hand-drawn watercolor illustration, gouache texture, visible brush strokes, soft paper grain, golden hour Taiwan nostalgic mood, Studio Ghibli background influence, Makoto Shinkai sky palette, 1990s-2010s Taipei residential atmosphere, muted warm color palette, no CG, no anime cel-shading, no pixel art, emotionally warm, cinematic composition, 16:9 aspect ratio
```

## Negative prompt (if tool supports it)

```
photo, photograph, 3D render, CGI, anime cel-shading, pixel art, vector flat, low-poly, blurry, text artifacts, watermark, signature, extra fingers, deformed faces, chibi, cartoon network style, saturated neon, cyberpunk
```

## Iteration protocol

1. Generate 4 variants per prompt.
2. Pick the one most on-style even if its content is slightly off.
3. If all 4 drift off-style, prepend `**masterpiece quality**, ` and include the style suffix twice.
4. Save as `assets/images/<category>/<id>_<short_name>.png`.
5. Log the chosen seed / generation id in `assets/prompts/_log.md` for consistency on retries.
