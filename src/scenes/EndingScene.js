import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, ENDING_THRESHOLD } from '../config.js';
import Playables from '../systems/Playables.js';
import I18n from '../systems/I18n.js';

// Ending acts live in strings.js (one title key + one body array key per act).
// The language toggle on TitleScene flips these in place — each act re-renders
// fresh on onChange, so mid-ending language swaps work too.
//
// `kind: 'vignette'` plays a procedural illustrated tableau before the body
// text — used for Act II to walk through the 2024 rice-cooker case beat by
// beat. `vignette` IDs map to drawVignette() branches.
const ACT_KEYS = [
  { kind: 'text',     title: 'ending.act1.title',      body: 'ending.act1.body' },
  { kind: 'vignette', title: 'ending.act2.title',      body: 'ending.act2a.body', vignette: 'depot_cooker' },
  { kind: 'vignette', title: 'ending.act2b.title',     body: 'ending.act2b.body', vignette: 'handover' },
  { kind: 'vignette', title: 'ending.act2c.title',     body: 'ending.act2c.body', vignette: 'sentencing' },
  { kind: 'vignette', title: 'ending.act2d.title',     body: 'ending.act2d.body', vignette: 'interview_tears' },
  { kind: 'vignette', title: 'ending.act2e.title',     body: 'ending.act2e.body', vignette: 'netizens' },
  { kind: 'vignette', title: 'ending.act2f.title',     body: 'ending.act2f.body', vignette: 'leniency' },
  { kind: 'vignette', title: 'ending.act2g.title',     body: 'ending.act2g.body', vignette: 'interview_still' },
  { kind: 'vignette', title: 'ending.act3.title',      body: 'ending.act3.body',  vignette: 'sun_after_rain' },
  { kind: 'text',     title: 'ending.credits.title',   body: 'ending.credits.body' },
];

// Optional act inserted after Act III only if the player greeted 高小姐 in
// the stairwell at any point during the week. Mom's matchmaking reveal is
// week-end material — too big to land on a per-day result screen.
const GAO_ACT = { kind: 'vignette', title: 'ending.gao.title', body: 'ending.gao.body', vignette: 'matchmaking' };

function checkGreetedGao(registry) {
  for (let d = 2; d <= 5; d++) {
    if (registry.get(`encounter_d${d}_kind`) === 'gao'
        && registry.get(`encounter_d${d}_engaged`)) {
      return true;
    }
  }
  return false;
}

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ENDING);
  }

  init(data) {
    this.totalScore = data?.totalScore || 0;
    this.failed = !!data?.failed;
    // Week's done — clear the resume slot.
    Playables.clearProgress();
  }

  create() {
    this.actIndex = 0;
    // Build the per-run act list — slot the Gao matchmaking insert in just
    // before the credits if the player greeted her any day this week.
    this.acts = ACT_KEYS.slice();
    if (checkGreetedGao(this.registry)) {
      this.acts.splice(this.acts.length - 1, 0, GAO_ACT);
    }
    this.cameras.main.fadeIn(700, 5, 5, 10);
    if (this.failed) {
      // No bgm on fail — the silence sells the loss.
      this.showFailCard();
      this.unsubI18n = I18n.onChange(() => this.showFailCard());
      this.events.once('shutdown', () => {
        if (this.unsubI18n) this.unsubI18n();
      });
      return;
    }
    if (this.cache.audio.exists('bgm-ending')) {
      this.endingBgm = this.sound.add('bgm-ending', { loop: true, volume: 0.6 });
      this.endingBgm.play();
    }
    this.showAct();
    this.unsubI18n = I18n.onChange(() => this.showAct());
    this.events.once('shutdown', () => {
      if (this.endingBgm && this.endingBgm.isPlaying) this.endingBgm.stop();
      if (this.unsubI18n) this.unsubI18n();
    });
  }

  showFailCard() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    this.children.removeAll();
    this.input.keyboard.removeAllListeners();

    this.add.rectangle(0, 0, w, h, 0x080608).setOrigin(0);

    const title = this.add.text(w / 2, h / 2 - 80, I18n.t('fail.title'), {
      fontFamily: 'serif', fontSize: '54px', color: '#ff6b8a',
      fontStyle: 'bold', stroke: '#1a0510', strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 700 });

    const body = I18n.tArray('fail.body')
      .map((line) => line.replace('{s}', this.totalScore).replace('{t}', ENDING_THRESHOLD))
      .join('\n');
    this.add.text(w / 2, h / 2 + 20, body, {
      fontFamily: 'serif', fontSize: '17px', color: '#e8dccb',
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    const prompt = this.add.text(w / 2, h - 40, I18n.t('fail.prompt'), {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#666',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 5, 5, 10);
      this.time.delayedCall(520, () => this.scene.start(SCENES.TITLE));
    });
  }

  showAct() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.children.removeAll();
    this.input.keyboard.removeAllListeners();

    const act = this.acts[this.actIndex];
    const isVignette = act.kind === 'vignette';

    // Vignettes get a darker, flatter backdrop so the procedural illustration
    // reads cleanly. Text-only acts can keep the painted yard backdrop.
    if (isVignette) {
      this.add.rectangle(0, 0, w, h, 0x0a0810).setOrigin(0);
    } else if (this.textures.exists('bg-yard-ending')) {
      this.add.image(w / 2, h / 2, 'bg-yard-ending').setDisplaySize(w, h);
      this.add.rectangle(0, 0, w, h, 0x0a0a0f, 0.55).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    this.add.text(w / 2, 40, I18n.t(act.title), {
      fontFamily: 'serif',
      fontSize: isVignette ? 20 : 24,
      color: '#e8b96a',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    if (isVignette) {
      // Stage occupies the upper portion; caption sits below.
      this.drawVignette(act.vignette, w / 2, h / 2 - 40);
      const body = I18n.tArray(act.body).join('\n');
      this.add.text(w / 2, h - 110, body, {
        fontFamily: 'serif', fontSize: '15px', color: '#e8dccb',
        align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);
    } else {
      const body = I18n.tArray(act.body).join('\n');
      this.add.text(w / 2, h / 2, body, {
        fontFamily: 'serif',
        fontSize: '17px',
        color: '#e8dccb',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5);
    }

    const isLast = this.actIndex === this.acts.length - 1;
    if (isLast) {
      const best = this.persistHighScore(this.totalScore);
      const gradeKey = this.gradeKey(this.totalScore);
      const line = best > this.totalScore
        ? I18n.t('ending.score_best',     { s: this.totalScore, b: best })
        : I18n.t('ending.score_new_best', { s: this.totalScore });
      this.add.text(w / 2, h - 90, I18n.t(gradeKey), {
        fontFamily: 'serif', fontSize: '14px', color: '#e8b96a', fontStyle: 'italic',
      }).setOrigin(0.5);
      this.add.text(w / 2, h - 72, line, {
        fontFamily: 'monospace', fontSize: '13px', color: '#e8b96a',
      }).setOrigin(0.5);
    }
    const prompt = this.add.text(
      w / 2,
      h - 40,
      I18n.t(isLast ? 'ending.prompt_return' : 'ending.prompt_continue'),
      { fontFamily: 'sans-serif', fontSize: '14px', color: '#666' }
    ).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 5, 5, 10);
      this.time.delayedCall(520, () => {
        this.actIndex += 1;
        if (this.actIndex >= this.acts.length) {
          this.scene.start(SCENES.TITLE);
        } else {
          this.cameras.main.fadeIn(500, 5, 5, 10);
          this.showAct();
        }
      });
    });
  }

  // ── Vignette renderer ─────────────────────────────────────────────────────
  // Each branch draws a small tableau centred on (cx, cy). Stays under ~280px
  // tall so the title above + caption below don't overlap. All from primitives.
  drawVignette(id, cx, cy) {
    if (id === 'depot_cooker') return this.vignetteDepotCooker(cx, cy);
    if (id === 'handover')      return this.vignetteHandover(cx, cy);
    if (id === 'sentencing')    return this.vignetteSentencing(cx, cy);
    if (id === 'interview_tears') return this.vignetteInterview(cx, cy, true);
    if (id === 'netizens')      return this.vignetteNetizens(cx, cy);
    if (id === 'leniency')      return this.vignetteLeniency(cx, cy);
    if (id === 'interview_still') return this.vignetteInterview(cx, cy, false);
    if (id === 'sun_after_rain')  return this.vignetteSunAfterRain(cx, cy);
    if (id === 'matchmaking')     return this.vignetteMatchmaking(cx, cy);
  }

  // Reusable: draws a small standing person silhouette centred on (x, y).
  // kind: 'cleaner' (orange vest), 'grandma' (curved back, walking stick),
  // 'judge' (black robe), 'reporter' (suit + mic).
  drawPerson(x, y, kind, scale = 1) {
    const s = scale;
    const head = 0xf2c79a;
    if (kind === 'cleaner') {
      // Body: orange vest over grey shirt
      this.add.rectangle(x, y + 10 * s, 26 * s, 36 * s, 0x3a3a3a);
      this.add.rectangle(x, y + 6 * s,  28 * s, 24 * s, 0xe8a040);
      this.add.rectangle(x, y + 14 * s, 28 * s, 4 * s,  0xe8dccb, 0.85); // reflective stripe
      // Pants
      this.add.rectangle(x - 6 * s, y + 36 * s, 8 * s, 18 * s, 0x2a2a2a);
      this.add.rectangle(x + 6 * s, y + 36 * s, 8 * s, 18 * s, 0x2a2a2a);
      // Head + cap
      this.add.circle(x, y - 16 * s, 11 * s, head);
      this.add.rectangle(x, y - 24 * s, 24 * s, 6 * s, 0xe8a040);
      this.add.rectangle(x + 8 * s, y - 26 * s, 12 * s, 4 * s, 0xe8a040);
    } else if (kind === 'grandma') {
      // Hunched silhouette
      this.add.rectangle(x, y + 14 * s, 22 * s, 30 * s, 0x6a3a4a); // floral top
      this.add.rectangle(x, y + 32 * s, 22 * s, 18 * s, 0x2a2030); // skirt
      // Head leaning forward
      this.add.circle(x - 3 * s, y - 8 * s, 9 * s, head);
      // Bun
      this.add.circle(x - 7 * s, y - 16 * s, 4 * s, 0xc8c8c8);
      // Walking stick angling right
      this.add.line(0, 0, x + 8 * s, y - 4 * s, x + 16 * s, y + 50 * s, 0x6a4a30, 1).setOrigin(0).setLineWidth(2);
    } else if (kind === 'judge') {
      this.add.rectangle(x, y + 12 * s, 30 * s, 44 * s, 0x141014); // black robe
      this.add.rectangle(x, y + 6 * s,  18 * s, 14 * s, 0xe8dccb); // collar
      this.add.circle(x, y - 14 * s, 10 * s, head);
      this.add.rectangle(x, y - 24 * s, 24 * s, 6 * s, 0xc8c8c8); // wig
    } else if (kind === 'reporter') {
      this.add.rectangle(x, y + 10 * s, 24 * s, 36 * s, 0x2a3050); // suit
      this.add.line(0, 0, x, y - 4 * s, x, y + 16 * s, 0xe8dccb).setOrigin(0).setLineWidth(2); // tie
      this.add.circle(x, y - 14 * s, 10 * s, head);
      this.add.rectangle(x - 4 * s, y - 22 * s, 18 * s, 6 * s, 0x141014); // hair
    }
  }

  vignetteDepotCooker(cx, cy) {
    // Recycling depot: piles of bags + bins, cleaner kneeling holding a cooker
    // Background floor band
    this.add.rectangle(cx, cy + 80, 480, 30, 0x2a2620, 1);
    // Bin row
    for (let i = 0; i < 4; i++) {
      const bx = cx - 180 + i * 100;
      this.add.rectangle(bx, cy + 30, 64, 90, [0x3a6a40, 0x3a4a8a, 0xc09030, 0x9a2030][i]);
      this.add.rectangle(bx, cy - 12, 64, 8, 0x141014); // lid slot
    }
    // Loose bags pile
    for (let i = 0; i < 12; i++) {
      const bx = cx + 70 + (i % 4) * 18 - 30;
      const by = cy + 60 - Math.floor(i / 4) * 14;
      this.add.ellipse(bx, by, 30, 18, [0x2a2a2a, 0x4a3a30, 0x3a4040][i % 3]);
    }
    // Cleaner figure (left of centre)
    this.drawPerson(cx - 100, cy + 4, 'cleaner', 1);
    // Rice cooker in his hands — squat cylinder + lid + handle
    const ckX = cx - 100, ckY = cy + 28;
    this.add.rectangle(ckX, ckY, 36, 28, 0xe8dccb).setStrokeStyle(2, 0x6a5a40);
    this.add.rectangle(ckX, ckY - 14, 32, 6, 0x9a8a70);
    this.add.circle(ckX, ckY - 18, 3, 0x6a5a40);
    this.add.line(0, 0, ckX - 22, ckY, ckX + 22, ckY, 0x6a5a40).setOrigin(0).setLineWidth(2);
    // Thought bubble (top-right) — grandma silhouette
    const bx = cx + 130, by = cy - 60;
    this.add.ellipse(bx, by, 130, 90, 0x141828, 0.92).setStrokeStyle(2, 0x6acfff, 0.8);
    this.add.circle(bx - 56, by + 50, 6, 0x141828).setStrokeStyle(1.5, 0x6acfff, 0.7);
    this.add.circle(bx - 64, by + 60, 4, 0x141828).setStrokeStyle(1, 0x6acfff, 0.6);
    this.drawPerson(bx, by, 'grandma', 0.65);
  }

  vignetteHandover(cx, cy) {
    // Sidewalk + scooter shadow + cleaner hands cooker to grandma + heart particles
    this.add.rectangle(cx, cy + 80, 520, 30, 0x2a2820);
    // Scooter shadow (right edge)
    this.add.rectangle(cx + 200, cy + 80, 70, 6, 0x0a0a0e, 0.7);
    this.add.circle(cx + 175, cy + 80, 7, 0x141014, 0.7);
    this.add.circle(cx + 225, cy + 80, 7, 0x141014, 0.7);
    // Cleaner on the left
    this.drawPerson(cx - 70, cy + 4, 'cleaner', 1);
    // Cooker mid-air between them
    const ckX = cx, ckY = cy + 16;
    this.add.rectangle(ckX, ckY, 36, 28, 0xe8dccb).setStrokeStyle(2, 0x6a5a40);
    this.add.rectangle(ckX, ckY - 14, 32, 6, 0x9a8a70);
    // Grandma on the right, hands extended
    this.drawPerson(cx + 80, cy + 4, 'grandma', 1);
    // Smile dot
    this.add.arc(cx + 77, cy - 5, 4, 0, 180, false, 0x9a2030);
    // Heart particles rising
    for (let i = 0; i < 5; i++) {
      const hx = cx + 60 + i * 12;
      const hy = cy - 30 - i * 14;
      this.drawHeart(hx, hy, 6 - i * 0.6, 0xff6b8a);
    }
  }

  drawHeart(x, y, r, color) {
    this.add.circle(x - r * 0.5, y, r, color);
    this.add.circle(x + r * 0.5, y, r, color);
    this.add.triangle(x, y, x - r, y, x + r, y, x, y + r * 1.6, color);
  }

  vignetteSentencing(cx, cy) {
    // Courtroom: judge bench + flags + gavel descending + GUILTY stamp
    // Bench
    this.add.rectangle(cx, cy + 60, 380, 20, 0x4a3020);
    this.add.rectangle(cx, cy + 80, 360, 20, 0x3a2418);
    // Wall back
    this.add.rectangle(cx, cy - 50, 380, 70, 0x1a1614);
    // Two flags
    this.add.rectangle(cx - 140, cy - 50, 26, 60, 0x9a2030);
    this.add.rectangle(cx + 140, cy - 50, 26, 60, 0x142060);
    // Judge silhouette behind bench
    this.drawPerson(cx, cy + 8, 'judge', 1);
    // Defendant (cleaner) small at bottom-left
    this.drawPerson(cx - 110, cy + 100, 'cleaner', 0.7);
    // Gavel — coming down with motion lines
    const gx = cx + 80, gy = cy + 30;
    this.add.rectangle(gx, gy, 30, 14, 0x6a4a28).setStrokeStyle(1, 0x2a1a08);
    this.add.rectangle(gx + 14, gy, 30, 6, 0x6a4a28);
    // Motion lines
    for (let i = 0; i < 3; i++) {
      this.add.line(0, 0, gx - 20, gy - 20 - i * 6, gx - 4, gy - 6 - i * 6, 0xe8b96a, 0.6).setOrigin(0).setLineWidth(2);
    }
    // GUILTY stamp
    const stamp = this.add.rectangle(cx + 120, cy + 110, 110, 30, 0x141014, 0.92).setStrokeStyle(3, 0x9a2030);
    this.add.text(cx + 120, cy + 110, I18n.t('ending.stamp_guilty'), {
      fontFamily: 'serif', fontSize: '18px', color: '#ff6b8a', fontStyle: 'bold',
    }).setOrigin(0.5).setAngle(-8);
    stamp.setAngle(-8);
  }

  vignetteInterview(cx, cy, withTears) {
    // Courthouse steps. Cleaner facing reporter on the left holding mic.
    // Steps
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(cx, cy + 70 + i * 10, 480 - i * 40, 10, 0x4a4a52, 0.9);
    }
    // Building back
    this.add.rectangle(cx, cy - 40, 360, 80, 0x2a2a32);
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(cx - 140 + i * 70, cy - 40, 30, 60, 0xc0c0c8); // columns
    }
    // Reporter on the left
    this.drawPerson(cx - 90, cy + 20, 'reporter', 1);
    // Mic boom — line from reporter toward cleaner
    this.add.line(0, 0, cx - 70, cy + 4, cx + 20, cy - 8, 0x141014).setOrigin(0).setLineWidth(3);
    this.add.circle(cx + 22, cy - 10, 5, 0x141014).setStrokeStyle(1, 0xe8b96a);
    // Cleaner on the right
    this.drawPerson(cx + 70, cy + 20, 'cleaner', 1);
    if (withTears) {
      // Bowed head + tear
      this.add.circle(cx + 70, cy + 6, 11, 0xf2c79a);
      this.add.circle(cx + 66, cy + 14, 2, 0x6acfff);
      this.add.circle(cx + 66, cy + 22, 1.5, 0x6acfff, 0.8);
      this.add.circle(cx + 66, cy + 30, 1, 0x6acfff, 0.6);
      // Frowning mouth
      this.add.arc(cx + 70, cy + 8, 4, 180, 360, false, 0x4a2820);
    } else {
      // Tiny smile
      this.add.arc(cx + 70, cy + 5, 4, 0, 180, false, 0x4a2820);
    }
    // Camera flashes
    if (withTears) {
      for (let i = 0; i < 3; i++) {
        this.add.circle(cx - 130 - i * 30, cy - 30 - (i % 2) * 12, 3, 0xfff4cc, 0.9);
      }
    }
  }

  vignetteNetizens(cx, cy) {
    // "Comment feed" panel — fixed inner column laid out vertically so text
    // can wrap to a second line without escaping the frame. Each row gets a
    // tiny avatar silhouette to the left so the netizen-as-person reading is
    // explicit (the prior pass scattered comments freely and long Chinese
    // lines spilled past the border).
    const frameW = 520, frameH = 230;
    this.add.rectangle(cx, cy, frameW, frameH, 0x141828).setStrokeStyle(2, 0x6acfff, 0.5);

    const comments = [
      I18n.t('ending.netizen_c1'),
      I18n.t('ending.netizen_c2'),
      I18n.t('ending.netizen_c3'),
      I18n.t('ending.netizen_c4'),
      I18n.t('ending.netizen_c5'),
    ];

    // Inner padding from the frame edge.
    const padX = 16, padY = 18;
    const innerL = cx - frameW / 2 + padX;
    const innerR = cx + frameW / 2 - padX;
    const innerT = cy - frameH / 2 + padY;
    const rowH   = (frameH - padY * 2) / comments.length;
    const avatarW = 22;
    const textL  = innerL + avatarW + 8;
    const textW  = innerR - textL;

    const avatarColors = [0xff9aa8, 0x9accff, 0xffd28a, 0xc8a8e8, 0x9affc8];

    comments.forEach((txt, i) => {
      const rowY = innerT + rowH * (i + 0.5);
      // Avatar — circle head + shoulder block, all clipped well inside frame.
      const ax = innerL + avatarW / 2;
      this.add.circle(ax, rowY - 4, 7, avatarColors[i % avatarColors.length])
        .setStrokeStyle(1, 0x0a0a0f, 0.6);
      this.add.rectangle(ax, rowY + 8, 16, 10, avatarColors[i % avatarColors.length])
        .setStrokeStyle(1, 0x0a0a0f, 0.6);

      // Comment text — origin (0, 0.5) so left-aligned at textL; wordWrap
      // forces multi-line for long Chinese lines so nothing escapes textW.
      const t = this.add.text(textL, rowY, txt, {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#e8dccb',
        wordWrap: { width: textW, useAdvancedWrap: true },
        lineSpacing: 2,
      }).setOrigin(0, 0.5);
      // Subtle bob to keep the feed feeling alive.
      this.tweens.add({ targets: t, y: rowY - 2, duration: 1200 + i * 200, yoyo: true, repeat: -1 });
    });

    // A few hearts down the right edge — clamped well inside the frame.
    for (let i = 0; i < 4; i++) {
      const hx = innerR - 8;
      const hy = innerT + 14 + i * (rowH * 0.95);
      this.drawHeart(hx, hy, 4.5, 0xff6b8a);
    }
  }

  vignetteLeniency(cx, cy) {
    // Judge + prosecutor with thought bubble showing scale tipping toward heart
    this.add.rectangle(cx, cy + 60, 380, 20, 0x4a3020);
    this.add.rectangle(cx, cy + 80, 360, 20, 0x3a2418);
    this.add.rectangle(cx, cy - 50, 380, 70, 0x1a1614);
    this.drawPerson(cx - 60, cy + 8, 'judge', 1);
    this.drawPerson(cx + 60, cy + 8, 'judge', 1);
    // Soft glow
    this.add.circle(cx - 60, cy - 14, 22, 0xfff4cc, 0.18);
    this.add.circle(cx + 60, cy - 14, 22, 0xfff4cc, 0.18);
    // Thought bubble centred above with scale
    const bx = cx, by = cy - 110;
    this.add.ellipse(bx, by, 200, 90, 0x141828, 0.92).setStrokeStyle(2, 0x6acfff, 0.8);
    this.add.circle(bx, by + 55, 6, 0x141828).setStrokeStyle(1.5, 0x6acfff, 0.7);
    this.add.circle(bx + 6, by + 65, 3, 0x141828).setStrokeStyle(1, 0x6acfff, 0.6);
    // Scale: pivot + tilted bar, heart-side down
    this.add.line(0, 0, bx, by - 20, bx, by + 14, 0x9a8a70).setOrigin(0).setLineWidth(2);
    this.add.rectangle(bx, by - 24, 90, 4, 0x9a8a70).setAngle(8);
    // Left pan: book (法)
    this.add.rectangle(bx - 32, by - 14, 18, 12, 0x6a4a30);
    this.add.text(bx - 32, by - 14, '法', { fontFamily: 'serif', fontSize: '10px', color: '#e8dccb' }).setOrigin(0.5);
    // Right pan: heart (情) — heavier, dipped lower
    this.drawHeart(bx + 36, by - 6, 7, 0xff6b8a);
  }

  // Act III backdrop: clearing sky with the truck driving past underneath.
  // After the storm of the case → the route still rolls. Soft gradient sky
  // bands, faint rainbow arc, fluffy clouds, sun rays piercing through, then
  // a small Taipei-orange truck silhouette tracking left-to-right along the
  // road below. No text — the act3 body lines render as caption.
  // Mom-tells-you-she-arranged-a-date vignette. Same dim-living-room backdrop
  // family as Act II vignettes (so it doesn't pop visually) but populated with
  // a smiling mom on the left + a shy "you" on the right, with a small heart
  // floating between them and a sweat-bead on the player's head.
  vignetteMatchmaking(cx, cy) {
    // Subtle warm wall + floor band so the figures stand on something
    this.add.rectangle(cx, cy - 30, 360, 140, 0x2a2030, 0.85);
    this.add.rectangle(cx, cy + 50, 360, 24, 0x4a3a30, 0.9);
    // Wall hint — picture frame
    this.add.rectangle(cx - 130, cy - 80, 38, 48, 0x6a4a30).setStrokeStyle(2, 0x4a3018);
    this.add.rectangle(cx - 130, cy - 80, 30, 40, 0xe8dccb);
    // A soft heart drifting between the two figures.
    this.drawHeart(cx, cy - 30, 9, 0xff6b8a);
    this.add.text(cx, cy - 50, '♡', {
      fontFamily: 'serif', fontSize: '14px', color: '#ff9ab0',
    }).setOrigin(0.5);

    // Mom on the left — facing right, smiling, hands clasped.
    const mx = cx - 70;
    const my = cy + 8;
    this.add.rectangle(mx, my + 14, 30, 42, 0x6a3a4a); // floral top
    this.add.rectangle(mx - 8, my + 38, 12, 18, 0x2a2030); // skirt
    this.add.rectangle(mx + 8, my + 38, 12, 18, 0x2a2030);
    // Arms folded toward centre (toward player)
    this.add.rectangle(mx + 14, my + 8, 6, 18, 0x6a3a4a).setRotation(0.4);
    this.add.rectangle(mx + 16, my + 18, 6, 16, 0x6a3a4a).setRotation(0.7);
    // Head + bun
    this.add.circle(mx, my - 14, 11, 0xf2c79a);
    this.add.circle(mx - 6, my - 22, 5, 0xc0c0c0); // grey bun
    this.add.circle(mx + 4, my - 22, 5, 0xc0c0c0);
    // Smiling face — closed-eye crescents + mouth curve
    this.add.line(0, 0, mx - 5, my - 16, mx - 1, my - 14, 0x101010, 1).setOrigin(0).setLineWidth(1.5);
    this.add.line(0, 0, mx + 1, my - 14, mx + 5, my - 16, 0x101010, 1).setOrigin(0).setLineWidth(1.5);
    this.add.arc(mx, my - 8, 4, 0, 180, false, 0xff6b8a).setStrokeStyle(1.5, 0x6a2030);
    // Speech-thought bubble pointing toward player (small)
    this.add.text(mx + 30, my - 30, '♡', {
      fontFamily: 'serif', fontSize: '20px', color: '#ff9ab0',
    }).setOrigin(0.5);

    // You on the right — facing left, shy: head tilted, sweat bead, blushing
    const px = cx + 70;
    const py = cy + 8;
    this.add.rectangle(px, py + 14, 28, 40, 0x4a5a70); // shirt
    this.add.rectangle(px - 6, py + 38, 10, 18, 0x2a2820); // pants
    this.add.rectangle(px + 6, py + 38, 10, 18, 0x2a2820);
    // Arm scratching back of head
    this.add.rectangle(px - 12, py + 4, 6, 22, 0x4a5a70).setRotation(-0.4);
    this.add.rectangle(px + 14, py + 12, 6, 18, 0x4a5a70);
    // Head — tilted slightly, looking down-left
    this.add.circle(px - 2, py - 14, 11, 0xf2d6b6);
    // Hair — short tousled
    this.add.rectangle(px - 4, py - 22, 22, 6, 0x2a1810);
    this.add.rectangle(px + 5, py - 24, 8, 4, 0x2a1810);
    // Blush dots on cheeks
    this.add.circle(px - 8, py - 12, 2.5, 0xff8a9a, 0.7);
    this.add.circle(px + 4, py - 12, 2.5, 0xff8a9a, 0.7);
    // Eyes — small dots, looking down
    this.add.circle(px - 4, py - 14, 1.2, 0x101010);
    this.add.circle(px + 2, py - 14, 1.2, 0x101010);
    // Awkward mouth — small flat dash
    this.add.rectangle(px - 1, py - 10, 4, 1.2, 0x101010);
    // Sweat bead on the side of the head
    this.add.ellipse(px + 11, py - 18, 4, 6, 0x6acfff, 0.95);
    this.add.ellipse(px + 11, py - 18, 1.5, 2.5, 0xffffff, 0.85);

    // Tiny "..." thought bubble above the player
    this.add.ellipse(px + 22, py - 36, 38, 18, 0xfdfcf2, 0.95).setStrokeStyle(1, 0x2a2820);
    this.add.text(px + 22, py - 36, '⋯⋯⋯', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#1a1a1a',
    }).setOrigin(0.5);
    this.add.circle(px + 12, py - 26, 3, 0xfdfcf2).setStrokeStyle(1, 0x2a2820);
    this.add.circle(px + 8,  py - 22, 1.8, 0xfdfcf2).setStrokeStyle(1, 0x2a2820);
  }

  vignetteSunAfterRain(cx, cy) {
    const w = GAME_WIDTH;
    // Sky gradient — three bands top to bottom (deep blue → cyan → cream).
    this.add.rectangle(0, cy - 130, w, 60, 0x4a6da0).setOrigin(0);
    this.add.rectangle(0, cy - 70,  w, 60, 0x8ab8d8).setOrigin(0);
    this.add.rectangle(0, cy - 10,  w, 60, 0xf2d9b0).setOrigin(0);

    // Sun — warm disk with a soft halo, low and right of centre.
    const sunX = cx + 110;
    const sunY = cy - 50;
    this.add.circle(sunX, sunY, 38, 0xffe8a0, 0.18);
    this.add.circle(sunX, sunY, 26, 0xffe8a0, 0.32);
    this.add.circle(sunX, sunY, 18, 0xfff4cc, 0.95);
    // Sun rays — eight thin lines radiating
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i;
      const r1 = 22, r2 = 36;
      this.add.line(0, 0,
        sunX + Math.cos(a) * r1, sunY + Math.sin(a) * r1,
        sunX + Math.cos(a) * r2, sunY + Math.sin(a) * r2,
        0xfff4cc, 0.6).setOrigin(0).setLineWidth(1.5);
    }

    // Rainbow arc — six concentric thin arcs, low arc anchored centre-bottom.
    const rbX = cx - 60, rbY = cy + 80;
    const rbColors = [0xff6b6b, 0xff9a4a, 0xf2d24a, 0x6affaa, 0x6acfff, 0xa06aff];
    for (let i = 0; i < rbColors.length; i++) {
      const r = 200 - i * 4;
      this.add.arc(rbX, rbY, r, 200, 340, false, rbColors[i], 0.45).setStrokeStyle(2, rbColors[i], 0.6);
    }

    // A few fluffy clouds drifting at different depths.
    const cloud = (x, y, scale, alpha) => {
      this.add.ellipse(x, y, 60 * scale, 22 * scale, 0xffffff, alpha);
      this.add.ellipse(x - 16 * scale, y + 4 * scale, 36 * scale, 18 * scale, 0xffffff, alpha);
      this.add.ellipse(x + 18 * scale, y + 4 * scale, 40 * scale, 18 * scale, 0xffffff, alpha);
    };
    cloud(cx - 180, cy - 100, 0.9, 0.85);
    cloud(cx + 30,  cy - 110, 1.1, 0.78);
    cloud(cx - 60,  cy - 130, 0.7, 0.82);

    // Wet street — dark band with a thin highlight reflection of the sky.
    this.add.rectangle(0, cy + 50, w, 100, 0x1a1a22).setOrigin(0);
    this.add.rectangle(0, cy + 50, w, 6, 0xc8d8e8, 0.55).setOrigin(0); // wet sheen
    // Lane dashes
    for (let i = 0; i < 8; i++) {
      this.add.rectangle(60 + i * 110, cy + 90, 40, 4, 0xe8b96a, 0.5).setOrigin(0, 0.5);
    }

    // The truck — Taipei-orange box on wheels driving rightward. Anchored
    // about cx-60 so the ending caption below has clean negative space.
    const tx = cx - 40, ty = cy + 70;
    // Cab
    this.add.rectangle(tx + 56, ty - 6,  36, 26, 0xe8a040).setStrokeStyle(1, 0x4a3010);
    // Cargo box
    this.add.rectangle(tx, ty, 100, 38, 0xe8a040).setStrokeStyle(1, 0x4a3010);
    // White stripe along middle (Taipei livery)
    this.add.rectangle(tx, ty - 2, 100, 4, 0xfdfcf2);
    // Cab window
    this.add.rectangle(tx + 60, ty - 12, 22, 12, 0x9ac0d8);
    // Wheels
    this.add.circle(tx - 30, ty + 22, 8, 0x141014);
    this.add.circle(tx + 22, ty + 22, 8, 0x141014);
    this.add.circle(tx + 66, ty + 22, 8, 0x141014);
    this.add.circle(tx - 30, ty + 22, 4, 0x6a6a6a);
    this.add.circle(tx + 22, ty + 22, 4, 0x6a6a6a);
    this.add.circle(tx + 66, ty + 22, 4, 0x6a6a6a);
    // ♪ note above the cab — the machine is still singing
    this.add.text(tx + 56, ty - 30, '♪', {
      fontFamily: 'serif', fontSize: '20px', color: '#fff4cc', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(tx + 76, ty - 38, '♪', {
      fontFamily: 'serif', fontSize: '14px', color: '#fff4cc', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  // ── Existing methods continue below ───────────────────────────────────────
  gradeKey(total) {
    if (total >= 900) return 'ending.grade_perfect';
    if (total >= 600) return 'ending.grade_good';
    if (total >= 300) return 'ending.grade_by';
    if (total >= 0)   return 'ending.grade_slack';
    return 'ending.grade_disaster';
  }

  persistHighScore(score) {
    // Playables.setBest compares against the cached value and only
    // writes if score is a new best. Both paths (YT cloud / localStorage)
    // are handled inside the adapter. YT certification requires score
    // sent via sendScore matches the best in save — so we mirror both.
    const prev = Playables.getBest();
    if (score > prev) {
      Playables.setBest(score);
      Playables.sendScore(score);
      return score;
    }
    // Still send the best-known score so YT's leaderboard is consistent
    // when the current run wasn't a new high.
    Playables.sendScore(prev);
    return prev;
  }
}
