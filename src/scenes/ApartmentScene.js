import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { getLevel, getMomOpener } from '../data/levels.js';
import { randomNag } from '../data/dialogue.js';
import AudioDistance from '../systems/AudioDistance.js';
import { Sfx } from '../systems/Sfx.js';
import Player from '../objects/Player.js';
import Playables from '../systems/Playables.js';
import I18n from '../systems/I18n.js';

export default class ApartmentScene extends Phaser.Scene {
  constructor() {
    super(SCENES.APARTMENT);
  }

  init(data) {
    this.level = getLevel(data.day || 1);
    this.totalScore = data.totalScore || 0;
    this.slackPoints = 0;
    this.elapsed = 0;
    this.left = false;
    // Persist "I got as far as Day N with total X" so a browser refresh doesn't
    // wipe progress. EndingScene clears it when the week wraps.
    // In YT Playables this hits ytgame.saveData; on itch it's localStorage.
    Playables.setProgress({ day: this.level.day, totalScore: this.totalScore });
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(350, 10, 10, 15);

    // Day title card — brief flash before controls come alive.
    const dayCard = this.add.text(w / 2, h / 2, I18n.t('apt.day_card', { day: this.level.day }), {
      fontFamily: 'serif', fontSize: '56px', color: '#e8b96a', fontStyle: 'bold',
      stroke: '#2a1a10', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(1000);
    this.tweens.add({
      targets: dayCard, alpha: 1, duration: 360,
      onComplete: () => {
        this.tweens.add({
          targets: dayCard, alpha: 0, duration: 500, delay: 700,
          onComplete: () => dayCard.destroy(),
        });
      },
    });

    // AI-painted dusk living room backdrop — scaled to fill canvas
    if (this.textures.exists('bg-apartment')) {
      this.add.image(w / 2, h / 2, 'bg-apartment').setDisplaySize(w, h);
      // Soft dusk tint so HUD text stays readable
      this.add.rectangle(0, 0, w, h, 0x1a1028, 0.18).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x2a1528).setOrigin(0);
      this.add.rectangle(0, h - 80, w, 80, 0x3a2030).setOrigin(0);
    }

    // Procedural furniture is only drawn when the painted bg is absent —
    // otherwise we let the AI image carry the room and use corner indicators.
    const hasBg = this.textures.exists('bg-apartment');
    this.tv = this.add.rectangle(500, h - 200, 100, 70, 0x2a1a2a)
      .setStrokeStyle(3, 0x1a1a1a).setVisible(!hasBg);
    this.tvScreen = this.add.rectangle(500, h - 205, 84, 56, 0x3a5050).setVisible(!hasBg);
    this.tvGlow = this.add.rectangle(500, h - 205, 84, 56, 0x9ac0c0, 0.3);

    this.tableObj = this.add.rectangle(310, h - 130, 100, 30, 0x6a4520).setVisible(!hasBg);
    this.phone = this.add.rectangle(310, h - 138, 28, 46, 0x1a1a2a)
      .setStrokeStyle(1, 0x6acfff).setVisible(!hasBg);
    this.phoneGlow = this.add.rectangle(310, h - 138, 24, 42, 0x6acfff, 0.4);

    this.player = new Player(this, 200, h - 150);

    // Distance preview — a faint truck silhouette "through the window" that
    // fades up as proximity increases, reinforcing the audio cue visually.
    this.windowTruck = null;
    if (this.textures.exists('truck-far')) {
      this.windowTruck = this.add.image(w - 165, 130, 'truck-far')
        .setDisplaySize(180, 100)
        .setAlpha(0);
    }

    // HUD — top bar
    this.dayLabel = this.add.text(w / 2, 20, I18n.t('apt.day_label', { day: this.level.day }), {
      fontFamily: 'serif', fontSize: '18px', color: '#e8b96a',
    }).setOrigin(0.5, 0);

    this.slackLabel = this.add.text(20, 20, I18n.t('apt.slack_label', { n: 0 }), {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#6acfff',
    });

    this.truckBarBg = this.add.rectangle(w - 20, 20, 200, 14, 0x1a1a2a).setOrigin(1, 0).setStrokeStyle(1, 0x4a3040);
    this.truckBar = this.add.rectangle(w - 220 + 1, 21, 0, 12, 0xff6b8a).setOrigin(0, 0);
    this.truckLabel = this.add.text(w - 20, 38, I18n.t('apt.truck_label', { status: I18n.t('apt.truck_distant') }), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#e8dccb',
    }).setOrigin(1, 0);

    // Opening dialogue
    this.dialogue = this.add.text(w / 2, 55, getMomOpener(this.level.day), {
      fontFamily: 'serif', fontSize: '14px', color: '#e8dccb', fontStyle: 'italic',
      align: 'center', wordWrap: { width: w - 80 },
    }).setOrigin(0.5, 0);
    this.tweens.add({ targets: this.dialogue, alpha: 0.35, delay: 4000, duration: 2000 });

    // Controls hint — also doubles as tap zones on touch devices.
    this.hint = this.add.text(w / 2, h - 50, I18n.t('apt.hint'), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#aaa',
    }).setOrigin(0.5);

    // On-screen buttons — work for mouse + touch; keyboard still works too.
    // Each gets a small procedural pictogram on the left so the action reads at
    // a glance even when the user can't make out the small label text.
    const buttonDefs = [
      { label: I18n.t('apt.btn_phone'), x: w / 2 - 180, action: () => this.scrollPhone() },
      { label: I18n.t('apt.btn_tv'),    x: w / 2,       action: () => this.toggleTv() },
      { label: I18n.t('apt.btn_go'),    x: w / 2 + 180, action: () => this.leaveForTruck() },
    ];
    buttonDefs.forEach((b) => {
      const bg = this.add.rectangle(b.x, h - 18, 130, 36, 0x1a1a2a, 0.78)
        .setStrokeStyle(1, 0x6acfff, 0.55);
      this.drawButtonIcon(b.x - 48, h - 18, b.icon);
      this.add.text(b.x + 8, h - 18, b.label, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#6acfff', align: 'center',
      }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x2a2a4a, 0.9));
      bg.on('pointerout', () => bg.setFillStyle(0x1a1a2a, 0.78));
      bg.on('pointerdown', b.action);
    });

    // Tiny ♪ notes next to the truck bar — a visual echo of the Für Elise motif
    // so players with sound muted still read the mechanic.
    this.noteGlyphs = [];
    for (let i = 0; i < 3; i++) {
      const g = this.add.text(w - 236 - i * 14, 18, '♪', {
        fontFamily: 'serif', fontSize: '14px', color: '#e8b96a',
      }).setOrigin(0.5, 0).setAlpha(0);
      this.noteGlyphs.push(g);
    }

    // Urgency border — grows red+strong as the truck gets here. Important
    // accessibility cue: players with muted audio still see the deadline.
    this.urgencyBorder = this.add.rectangle(w / 2, h / 2, w - 4, h - 4)
      .setStrokeStyle(4, 0xff6b8a, 0)
      .setFillStyle()
      .setDepth(500);

    // Notification popup (hidden by default)
    this.notifGroup = this.add.container(0, 0).setVisible(false);
    const notifBg = this.add.rectangle(w / 2, h - 90, 360, 44, 0x0a0a0f, 0.9).setStrokeStyle(2, 0x6acfff);
    this.notifText = this.add.text(w / 2, h - 90, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
    }).setOrigin(0.5);
    this.notifGroup.add([notifBg, this.notifText]);

    // Audio — core mechanic. Hand off to real BGM if user loaded one.
    this.audio = new AudioDistance(this);
    if (this.cache.audio.exists('bgm-main')) {
      const bgm = this.sound.add('bgm-main', { loop: true, volume: 0 });
      this.audio.setRealSound(bgm);
    }
    this.audio.start();

    // Truck recording layer — field recording that fades in on top of BGM as
    // proximity rises. Optional; silently skipped if the user hasn't dropped
    // a recording into assets/audio/sfx/.
    if (this.cache.audio.exists('truck-real')) {
      this.truckRecording = this.sound.add('truck-real', { loop: true, volume: 0 });
      this.truckRecording.play();
    }

    // Input
    this.input.keyboard.on('keydown-E', () => this.scrollPhone());
    this.input.keyboard.on('keydown-T', () => this.toggleTv());
    this.input.keyboard.on('keydown-ENTER', () => this.leaveForTruck());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.left) return;
      this.scene.pause();
      this.scene.launch(SCENES.PAUSE, { resumeKey: SCENES.APARTMENT });
    });

    // Truck approach loop — over truckArrivalTime seconds, proximity goes 0 -> 1
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => this.onTick(0.1),
    });

    // Schedule random nag interruptions
    this.scheduleNotifications();

    // Start some tween on TV & phone for ambient life
    this.tweens.add({ targets: this.phoneGlow, alpha: 0.1, duration: 1200, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.tvGlow, alpha: 0.15, duration: 800, yoyo: true, repeat: -1 });

    // Ensure audio context resumes on first interaction
    this.input.once('pointerdown', () => this.audio.ctx.resume && this.audio.ctx.resume());
    this.input.keyboard.once('keydown', () => this.audio.ctx.resume && this.audio.ctx.resume());
  }

  onTick(dt) {
    if (this.left) return;
    this.elapsed += dt;
    const proximity = Math.min(1, this.elapsed / this.level.truckArrivalTime);
    this.audio.setProximity(proximity);

    // UI
    this.truckBar.width = 198 * proximity;
    let statusKey = 'apt.truck_distant';
    if (proximity > 0.95) statusKey = 'apt.truck_arrived';
    else if (proximity > 0.8) statusKey = 'apt.truck_outside';
    else if (proximity > 0.55) statusKey = 'apt.truck_nearby';
    else if (proximity > 0.3) statusKey = 'apt.truck_approaching';
    this.truckLabel.setText(I18n.t('apt.truck_label', { status: I18n.t(statusKey) }));

    if (proximity > 0.9) {
      this.truckLabel.setColor('#ff6b8a');
      this.player.urgent();
    }

    // Fade the ♪ glyphs in as proximity rises — silent-friendly signal.
    if (this.noteGlyphs) {
      const noteAlpha = Math.max(0, Math.min(1, (proximity - 0.25) / 0.65));
      this.noteGlyphs.forEach((g, i) => {
        const pulse = 0.6 + 0.4 * Math.sin(this.elapsed * 2 + i * 0.8);
        g.setAlpha(noteAlpha * pulse);
      });
    }

    // Urgency border strokes in around proximity > 0.7 and pulses thereafter.
    if (this.urgencyBorder) {
      const urgent = Math.max(0, (proximity - 0.7) / 0.3);
      const pulse = 0.6 + 0.4 * Math.sin(this.elapsed * 4);
      this.urgencyBorder.setStrokeStyle(4, 0xff6b8a, urgent * pulse);
    }

    // Field recording layer — silence until proximity > 0.5, then ramps up
    // quickly. Hard cap at 0.4 so it layers on top of BGM without drowning it.
    if (this.truckRecording) {
      const urgencyVol = Math.max(0, (proximity - 0.5) / 0.5) * 0.4;
      this.truckRecording.setVolume(urgencyVol);
    }

    // Visual proximity preview through the window.
    if (this.windowTruck) {
      if (proximity > 0.85 && this.textures.exists('truck-mid') && this.windowTruck.texture.key !== 'truck-mid') {
        this.windowTruck.setTexture('truck-mid').setDisplaySize(200, 110);
      }
      const targetAlpha = Math.max(0, (proximity - 0.35) / 0.65) * 0.85;
      this.windowTruck.setAlpha(Phaser.Math.Linear(this.windowTruck.alpha, targetAlpha, 0.05));
    }

    // Auto-fail if player stays too long after truck arrives + 5 sec grace
    if (proximity >= 1 && this.elapsed > this.level.truckArrivalTime + 5) {
      this.leaveForTruck(true);
    }
  }

  // Tiny pictogram drawn from primitives so we don't ship icon PNGs for three
  // 24×16 hints. Each centers on (cx, cy) inside the action button.
  drawButtonIcon(cx, cy, kind) {
    const fill = 0x6acfff;
    if (kind === 'phone') {
      // Vertical phone outline + speaker dot
      this.add.rectangle(cx, cy, 12, 18, 0x0a0a14).setStrokeStyle(1.5, fill);
      this.add.rectangle(cx, cy + 6, 4, 1, fill);
    } else if (kind === 'tv') {
      // CRT body + small antenna
      this.add.rectangle(cx, cy + 1, 18, 14, 0x0a0a14).setStrokeStyle(1.5, fill);
      this.add.line(cx, cy, -4, -10, 0, -4, fill).setLineWidth(1);
      this.add.line(cx, cy, 4, -10, 0, -4, fill).setLineWidth(1);
    } else if (kind === 'stairs') {
      // Down-stairs pictogram — two descending steps + arrow
      this.add.rectangle(cx - 5, cy - 4, 6, 3, fill);
      this.add.rectangle(cx + 1, cy + 0, 6, 3, fill);
      this.add.rectangle(cx + 7, cy + 4, 6, 3, fill);
      this.add.text(cx + 12, cy, '↓', {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff', fontStyle: 'bold',
      }).setOrigin(0.5);
    }
  }

  scrollPhone() {
    if (this.left) return;
    this.slackPoints += 2;
    this.slackLabel.setText(I18n.t('apt.slack_label', { n: this.slackPoints }));
    Sfx.scroll(this);
    this.tweens.add({
      targets: this.phoneGlow,
      alpha: 0.8,
      duration: 80,
      yoyo: true,
    });
    this.showPhoneOverlay();
  }

  toggleTv() {
    if (this.left) return;
    this.slackPoints += 1;
    this.slackLabel.setText(I18n.t('apt.slack_label', { n: this.slackPoints }));
    Sfx.static(this);
    this.tweens.add({
      targets: this.tvScreen,
      fillColor: { from: 0x3a5050, to: 0xe8b96a },
      duration: 120,
      yoyo: true,
    });
    this.showTvOverlay();
  }

  // Procedural phone screen — vertical mock feed (avatar dots + caption stripes)
  // that pops up centred so the user can SEE they're doomscrolling, not just
  // hear a click. Auto-dismisses; rapid-fire taps re-bump it.
  showPhoneOverlay() {
    if (this.phoneOverlay && this.phoneOverlay.active) {
      this.phoneOverlay.bumpSeed = (this.phoneOverlay.bumpSeed || 0) + 1;
      this.phoneOverlay.refresh();
      return;
    }
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const cx = w / 2, cy = h / 2;
    const pw = 200, ph = 340;
    const c = this.add.container(cx, cy).setDepth(800);
    const frame = this.add.rectangle(0, 0, pw, ph, 0x0a0a14).setStrokeStyle(4, 0xe8b96a, 0.95);
    const screen = this.add.rectangle(0, 6, pw - 22, ph - 60, 0x141828);
    const notch = this.add.rectangle(0, -ph / 2 + 14, 60, 14, 0x000000);
    const home = this.add.circle(0, ph / 2 - 18, 6, 0x000000).setStrokeStyle(1, 0xe8b96a, 0.7);
    const items = [];
    const refresh = () => {
      items.forEach((o) => o.destroy());
      items.length = 0;
      const baseY = -ph / 2 + 38;
      for (let i = 0; i < 4; i++) {
        const y = baseY + i * 64;
        items.push(this.add.circle(-pw / 2 + 24, y + 10, 8, 0x6acfff, 0.55));
        items.push(this.add.rectangle(-pw / 2 + 44, y, 90, 4, 0xe8dccb, 0.7).setOrigin(0, 0.5));
        items.push(this.add.rectangle(-pw / 2 + 44, y + 10, 60, 3, 0x6acfff, 0.45).setOrigin(0, 0.5));
        items.push(this.add.rectangle(-pw / 2 + 14, y + 26, pw - 28, 18, 0x1f2440, 0.85).setOrigin(0, 0.5));
        const len = 50 + ((this.phoneOverlay && this.phoneOverlay.bumpSeed || 0) * 7 + i * 11) % 80;
        items.push(this.add.rectangle(-pw / 2 + 18, y + 26, len, 3, 0xe8b96a, 0.8).setOrigin(0, 0.5));
        items.push(this.add.rectangle(-pw / 2 + 18, y + 32, len * 0.6, 3, 0xe8dccb, 0.5).setOrigin(0, 0.5));
      }
      c.add(items);
    };
    c.add([frame, screen, notch, home]);
    this.phoneOverlay = c;
    this.phoneOverlay.refresh = refresh;
    this.phoneOverlay.bumpSeed = 0;
    refresh();
    c.setAlpha(0).setScale(0.85);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: 'Quad.easeOut' });
    this.time.delayedCall(1500, () => {
      if (!c.active) return;
      this.tweens.add({
        targets: c, alpha: 0, scale: 0.9, duration: 220,
        onComplete: () => { c.destroy(); this.phoneOverlay = null; },
      });
    });
  }

  // Procedural TV overlay — large CRT panel with rolling scanlines + a faux
  // channel that cycles between news/weather/static so the press has weight.
  showTvOverlay() {
    if (this.tvOverlay && this.tvOverlay.active) {
      this.tvOverlay.cycle();
      return;
    }
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const cx = w / 2, cy = h / 2 - 10;
    const tw = 380, th = 240;
    const c = this.add.container(cx, cy).setDepth(800);
    const cabinet = this.add.rectangle(0, 30, tw + 28, th + 70, 0x2a1a18).setStrokeStyle(2, 0x1a0a08);
    const screen = this.add.rectangle(0, 0, tw, th, 0x141a22).setStrokeStyle(3, 0x0a0a14);
    const knob1 = this.add.circle(tw / 2 - 14, th / 2 + 22, 6, 0x4a3020).setStrokeStyle(1, 0xe8b96a, 0.6);
    const knob2 = this.add.circle(tw / 2 - 14, th / 2 + 40, 4, 0x4a3020).setStrokeStyle(1, 0xe8b96a, 0.4);
    c.add([cabinet, screen, knob1, knob2]);
    const layer = this.add.container(0, 0);
    c.add(layer);
    // Scanlines (always on)
    for (let i = 0; i < 12; i++) {
      const ln = this.add.rectangle(0, -th / 2 + 10 + i * 20, tw - 12, 1, 0x6acfff, 0.06);
      c.add(ln);
    }
    let mode = 0;
    const channels = ['news', 'weather', 'static'];
    const draw = () => {
      layer.removeAll(true);
      const kind = channels[mode % channels.length];
      if (kind === 'news') {
        layer.add(this.add.rectangle(0, -th / 2 + 26, tw - 24, 30, 0x9a2030, 0.85));
        layer.add(this.add.text(0, -th / 2 + 26, I18n.t('apt.tv_news_head'), {
          fontFamily: 'sans-serif', fontSize: '16px', color: '#fff', fontStyle: 'bold',
        }).setOrigin(0.5));
        layer.add(this.add.rectangle(-tw / 2 + 16, 8, 80, 80, 0x3a4a60));
        layer.add(this.add.rectangle(-tw / 2 + 16 + 12, 8 + 12, 56, 4, 0xe8dccb, 0.7).setOrigin(0));
        layer.add(this.add.rectangle(-tw / 2 + 16 + 12, 8 + 24, 40, 4, 0x6acfff, 0.6).setOrigin(0));
        layer.add(this.add.rectangle(0, th / 2 - 22, tw - 12, 22, 0x141828, 0.95));
        layer.add(this.add.text(0, th / 2 - 22, I18n.t('apt.tv_news_ticker'), {
          fontFamily: 'sans-serif', fontSize: '12px', color: '#e8b96a',
        }).setOrigin(0.5));
      } else if (kind === 'weather') {
        layer.add(this.add.text(0, -th / 2 + 30, I18n.t('apt.tv_weather_head'), {
          fontFamily: 'sans-serif', fontSize: '18px', color: '#6acfff', fontStyle: 'bold',
        }).setOrigin(0.5));
        layer.add(this.add.circle(-60, 10, 24, 0xe8b96a));
        layer.add(this.add.text(20, 10, '28°', {
          fontFamily: 'sans-serif', fontSize: '40px', color: '#fff', fontStyle: 'bold',
        }).setOrigin(0, 0.5));
        layer.add(this.add.text(0, th / 2 - 24, I18n.t('apt.tv_weather_sub'), {
          fontFamily: 'sans-serif', fontSize: '12px', color: '#aac0d0',
        }).setOrigin(0.5));
      } else {
        for (let i = 0; i < 80; i++) {
          const x = Phaser.Math.Between(-tw / 2 + 8, tw / 2 - 8);
          const y = Phaser.Math.Between(-th / 2 + 8, th / 2 - 8);
          const g = Phaser.Math.Between(80, 220);
          layer.add(this.add.rectangle(x, y, 6, 4, Phaser.Display.Color.GetColor(g, g, g), 0.7));
        }
        layer.add(this.add.text(0, 0, 'NO SIGNAL', {
          fontFamily: 'monospace', fontSize: '20px', color: '#e8b96a', fontStyle: 'bold',
        }).setOrigin(0.5));
      }
    };
    this.tvOverlay = c;
    this.tvOverlay.cycle = () => { mode++; draw(); };
    draw();
    c.setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: 'Quad.easeOut' });
    this.time.delayedCall(2000, () => {
      if (!c.active) return;
      this.tweens.add({
        targets: c, alpha: 0, scale: 0.95, duration: 240,
        onComplete: () => { c.destroy(); this.tvOverlay = null; },
      });
    });
  }

  // Taipei old-公寓 stairwell vignette before the player drops to the street.
  // Prefers the AI-painted bg-stairwell PNG; falls back to a procedural draw
  // (concrete walls, mosaic steps, rusty handrail, flickering tube, mailboxes,
  // scooter shadow) so the moment still lands even if the asset is missing.
  showStairwellTransition(onDone) {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const c = this.add.container(0, 0).setDepth(2000);
    if (this.textures.exists('bg-stairwell')) {
      c.add(this.add.image(w / 2, h / 2, 'bg-stairwell').setDisplaySize(w, h));
      c.add(this.add.rectangle(0, 0, w, h, 0x0a0810, 0.18).setOrigin(0));
      // Caption + footsteps + fade — same envelope as the procedural path.
      const cap = this.add.text(w / 2, h - 50, I18n.t('apt.stairwell_caption'), {
        fontFamily: 'serif', fontSize: '15px', color: '#e8dccb', fontStyle: 'italic',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2001);
      Sfx.step(this);
      this.time.delayedCall(180, () => Sfx.step(this));
      this.time.delayedCall(360, () => Sfx.step(this));
      c.setAlpha(0); cap.setAlpha(0);
      this.tweens.add({ targets: [c, cap], alpha: 1, duration: 220 });
      this.time.delayedCall(1100, () => {
        this.tweens.add({
          targets: [c, cap], alpha: 0, duration: 260,
          onComplete: () => { c.destroy(); cap.destroy(); onDone && onDone(); },
        });
      });
      return;
    }
    // Block out the whole frame
    c.add(this.add.rectangle(0, 0, w, h, 0x0a0a0e).setOrigin(0));
    // Walls — gradient-ish bands of concrete grey-green
    c.add(this.add.rectangle(0, 0, w, h, 0x2a2820).setOrigin(0));
    c.add(this.add.rectangle(0, 0, w * 0.30, h, 0x1a1812).setOrigin(0));
    c.add(this.add.rectangle(w * 0.70, 0, w * 0.30, h, 0x1a1812).setOrigin(0));
    // Wall stains (random ochre/grey patches)
    for (let i = 0; i < 14; i++) {
      const px = Phaser.Math.Between(40, w - 40);
      const py = Phaser.Math.Between(40, h * 0.6);
      const pw = Phaser.Math.Between(16, 60);
      const ph = Phaser.Math.Between(8, 30);
      const tone = [0x3a3025, 0x4a3a28, 0x2a221a][i % 3];
      c.add(this.add.rectangle(px, py, pw, ph, tone, 0.45));
    }
    // Cracks (thin diagonal lines)
    for (let i = 0; i < 5; i++) {
      const x1 = Phaser.Math.Between(0, w);
      const y1 = Phaser.Math.Between(20, h * 0.5);
      const x2 = x1 + Phaser.Math.Between(-40, 40);
      const y2 = y1 + Phaser.Math.Between(40, 100);
      c.add(this.add.line(0, 0, x1, y1, x2, y2, 0x0a0808, 0.6).setOrigin(0).setLineWidth(1));
    }
    // Ceiling tube light (flickers)
    const ceil = this.add.rectangle(w / 2, 28, 200, 14, 0x3a3a30).setStrokeStyle(1, 0x1a1a14);
    const tube = this.add.rectangle(w / 2, 28, 180, 6, 0xfff4cc, 0.95);
    c.add(ceil); c.add(tube);
    this.tweens.add({ targets: tube, alpha: 0.55, duration: 90, yoyo: true, repeat: 8 });
    // Light cone
    const cone = this.add.triangle(w / 2, 35, -180, 0, 180, 0, 0, h, 0xfff4cc, 0.07).setOrigin(0.5, 0);
    c.add(cone);
    // Steps descending — mosaic-tile front face + tread, perspective-narrowing
    // toward a vanishing point at (w/2, h*0.55).
    const vx = w / 2, vy = h * 0.55;
    const stepCount = 9;
    for (let i = 0; i < stepCount; i++) {
      const t = i / stepCount;
      const tn = (i + 1) / stepCount;
      // y on screen
      const y0 = vy + (h - vy) * Math.pow(t, 1.4);
      const y1 = vy + (h - vy) * Math.pow(tn, 1.4);
      // half-width at this depth
      const hw0 = (w * 0.5 - 60) * Math.pow(tn, 0.85) + 40;
      const hw1 = (w * 0.5 - 60) * Math.pow(t, 0.85) + 40;
      // Tread (top face)
      const tread = this.add.polygon(0, 0, [
        vx - hw1, y0, vx + hw1, y0,
        vx + hw0, y1, vx - hw0, y1,
      ], 0x9a8a70, 0.95).setOrigin(0);
      tread.setStrokeStyle(1, 0x4a3a28, 0.8);
      c.add(tread);
      // Riser front (small dark band just above)
      const riser = this.add.polygon(0, 0, [
        vx - hw1, y0 - 6, vx + hw1, y0 - 6,
        vx + hw1, y0, vx - hw1, y0,
      ], 0x3a2a22, 0.95).setOrigin(0);
      c.add(riser);
      // Mosaic dots on the tread
      const dots = 8 - i;
      for (let d = -dots; d <= dots; d++) {
        const dx = vx + (hw0 * d / (dots + 1));
        const dy = (y0 + y1) / 2;
        c.add(this.add.circle(dx, dy, 1.5 + (1 - t) * 1.5, 0x6a5a40, 0.55));
      }
    }
    // Right-side handrail — three vertical posts + a sloped rail
    for (let i = 0; i < 3; i++) {
      const t = i / 3;
      const tn = (i + 0.5) / 3;
      const x = w / 2 + (w * 0.5 - 60) * Math.pow(tn, 0.85) + 30;
      const y0 = vy + (h - vy) * Math.pow(tn, 1.4);
      c.add(this.add.rectangle(x, y0, 4, 50, 0x6a4a30).setOrigin(0.5, 1));
    }
    c.add(this.add.line(0, 0, w / 2 + 60, vy + 6, w - 30, h - 30, 0x8a5a30, 0.95).setOrigin(0).setLineWidth(4));
    // Mailboxes on left wall — small grid of metal squares
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const mx = 36 + col * 26;
        const my = h * 0.30 + row * 36;
        c.add(this.add.rectangle(mx, my, 22, 30, 0x3a4050).setStrokeStyle(1, 0x6a7080));
        c.add(this.add.rectangle(mx, my + 8, 12, 1, 0x1a1a1a));
        c.add(this.add.circle(mx + 6, my - 6, 1.5, 0xe8b96a));
      }
    }
    // Shadowed scooter silhouette bottom-left (just a hint)
    c.add(this.add.rectangle(70, h - 24, 80, 20, 0x0a0a0e, 0.85));
    c.add(this.add.circle(50, h - 14, 10, 0x0a0a0e, 0.85));
    c.add(this.add.circle(110, h - 14, 10, 0x0a0a0e, 0.85));
    // Caption
    const cap = this.add.text(w / 2, h - 50, I18n.t('apt.stairwell_caption'), {
      fontFamily: 'serif', fontSize: '15px', color: '#e8dccb', fontStyle: 'italic',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2001);
    // Footstep echo
    Sfx.step(this);
    this.time.delayedCall(180, () => Sfx.step(this));
    this.time.delayedCall(360, () => Sfx.step(this));
    // Fade in fast, hold, then fade out + done.
    c.setAlpha(0);
    cap.setAlpha(0);
    this.tweens.add({ targets: [c, cap], alpha: 1, duration: 220 });
    this.time.delayedCall(1100, () => {
      this.tweens.add({
        targets: [c, cap], alpha: 0, duration: 260,
        onComplete: () => { c.destroy(); cap.destroy(); onDone && onDone(); },
      });
    });
  }

  scheduleNotifications() {
    const n = this.level.notifications;
    for (let i = 0; i < n; i++) {
      const delay = (this.level.truckArrivalTime * 1000 * (i + 1)) / (n + 1);
      this.time.delayedCall(delay, () => this.showNotification());
    }
  }

  showNotification() {
    if (this.left) return;
    Sfx.ping(this);
    this.notifText.setText(randomNag(this));
    this.notifGroup.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.notifGroup,
      alpha: 1,
      duration: 200,
    });
    this.time.delayedCall(2400, () => {
      this.tweens.add({
        targets: this.notifGroup,
        alpha: 0,
        duration: 400,
        onComplete: () => this.notifGroup.setVisible(false),
      });
    });
  }

  leaveForTruck(forced = false) {
    if (this.left) return;
    this.left = true;
    const proximity = Math.min(1, this.elapsed / this.level.truckArrivalTime);
    this.audio.stop();
    // Brief Taipei-stairwell vignette before the street drop. Skipped on a
    // forced (timed-out) exit so the player isn't punished with extra UI.
    const goToStreet = () => {
      this.cameras.main.fadeOut(280, 10, 10, 15);
      this.time.delayedCall(300, () => {
        this.scene.start(SCENES.STREET, {
          day: this.level.day,
          slackPoints: this.slackPoints,
          proximityAtExit: proximity,
          forcedExit: forced,
          totalScore: this.totalScore,
        });
      });
    };
    if (forced) { goToStreet(); return; }
    this.showStairwellTransition(goToStreet);
  }

  shutdown() {
    if (this.audio) this.audio.destroy();
    if (this.truckRecording && this.truckRecording.isPlaying) {
      this.truckRecording.stop();
    }
  }
}
