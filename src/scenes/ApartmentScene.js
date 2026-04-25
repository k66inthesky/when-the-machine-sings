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

    this.createSlackHud();

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
      { label: I18n.t('apt.btn_phone'), x: w / 2 - 180, icon: 'phone', action: () => this.scrollPhone() },
      { label: I18n.t('apt.btn_tv'),    x: w / 2,       icon: 'tv',    action: () => this.toggleTv() },
      { label: I18n.t('apt.btn_go'),    x: w / 2 + 180, icon: 'stairs', action: () => this.leaveForTruck() },
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

    // Input — ignore browser's auto-repeat so holding E or T can't farm slack.
    // Each physical press = one bump; release before pressing again. canSlack()
    // is still in place as a 220ms safety net for pointerdown spam.
    this.input.keyboard.on('keydown-E', (e) => { if (e && e.repeat) return; this.scrollPhone(); });
    this.input.keyboard.on('keydown-T', (e) => { if (e && e.repeat) return; this.toggleTv(); });
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

  // Throttle gate. keydown auto-repeats when a key is held; without this the
  // player could pin E or T and farm slack at ~60/sec. 220ms cooldown caps
  // realistic spam at ~4 taps/sec — fast enough to feel responsive on a real
  // tap, slow enough that holding the key isn't a free win.
  canSlack() {
    const now = this.time.now;
    if (now - (this._lastSlackAt || 0) < 220) return false;
    this._lastSlackAt = now;
    return true;
  }

  scrollPhone() {
    if (this.left) return;
    if (!this.canSlack()) return;
    this.dismissTvOverlay(); // mutually exclusive with TV
    this.bumpSlack(2);
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
    if (!this.canSlack()) return;
    this.dismissPhoneOverlay(); // mutually exclusive with phone
    this.bumpSlack(1);
    Sfx.static(this);
    this.tweens.add({
      targets: this.tvScreen,
      fillColor: { from: 0x3a5050, to: 0xe8b96a },
      duration: 120,
      yoyo: true,
    });
    this.showTvOverlay();
  }

  dismissPhoneOverlay() {
    if (this.phoneOverlay && this.phoneOverlay.active) {
      const c = this.phoneOverlay;
      this.phoneOverlay = null;
      this.tweens.killTweensOf(c);
      c.destroy();
    }
  }

  dismissTvOverlay() {
    if (this.tvOverlay && this.tvOverlay.active) {
      const c = this.tvOverlay;
      this.tvOverlay = null;
      this.tweens.killTweensOf(c);
      c.destroy();
    }
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
    // Modal backdrop — full-screen dim child positioned to span the canvas in
    // local coords (offset by -cx,-cy from the centred container). Its
    // setInteractive() swallows clicks so the bottom buttons / wall objects
    // can't be triggered through the overlay.
    const backdrop = this.add.rectangle(-cx, -cy, w, h, 0x000000, 0.55).setOrigin(0)
      .setInteractive();
    c.add(backdrop);
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
    // Modal backdrop matching the phone overlay — dims the room + blocks
    // input from leaking through to the buttons behind.
    const backdrop = this.add.rectangle(-cx, -cy, w, h, 0x000000, 0.55).setOrigin(0)
      .setInteractive();
    c.add(backdrop);
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
  // Prefers the painted PNG (real-apartment look, decluttered by
  // scripts/clean-stairwell.cjs); falls back to a procedural draw if the
  // asset is missing. Day 2-5 always overlay a neighbour with a speech
  // bubble on top of whichever backdrop is used.
  showStairwellTransition(onDone) {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const c = this.add.container(0, 0).setDepth(2000);

    if (this.textures.exists('bg-stairwell')) {
      // Painted backdrop + slight dim so any residual cleanup smudges fade.
      c.add(this.add.image(w / 2, h / 2, 'bg-stairwell').setDisplaySize(w, h));
      c.add(this.add.rectangle(0, 0, w, h, 0x0a0810, 0.22).setOrigin(0));
    } else {
      this.drawProceduralStairwell(c, w, h);
    }

    // Day 2-5: a neighbour standing on the upper step says hi. Day 1 keeps
    // the empty stairwell to underline how alone the player started out.
    let neighborCleanup = () => {};
    if (this.level.day >= 2) {
      neighborCleanup = this.drawStairwellNeighbor(c, this.level.day);
    }

    // Caption — only on day 1 (the empty-stairwell day). On neighbour days
    // the speech bubble itself is the caption.
    let cap = null;
    if (this.level.day === 1) {
      cap = this.add.text(w / 2, h - 40, I18n.t('apt.stairwell_caption'), {
        fontFamily: 'serif', fontSize: '15px', color: '#e8dccb', fontStyle: 'italic',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2001);
    }

    // Footstep echo
    Sfx.step(this);
    this.time.delayedCall(180, () => Sfx.step(this));
    this.time.delayedCall(360, () => Sfx.step(this));

    // Fade envelope. Neighbour days hold ~700ms longer so the player can read.
    const hold = this.level.day === 1 ? 1100 : 1900;
    const targets = cap ? [c, cap] : [c];
    c.setAlpha(0); if (cap) cap.setAlpha(0);
    this.tweens.add({ targets, alpha: 1, duration: 220 });
    this.time.delayedCall(hold, () => {
      this.tweens.add({
        targets, alpha: 0, duration: 260,
        onComplete: () => {
          c.destroy(); if (cap) cap.destroy();
          neighborCleanup();
          onDone && onDone();
        },
      });
    });
  }

  drawProceduralStairwell(c, w, h) {
    c.add(this.add.rectangle(0, 0, w, h, 0x0a0a0e).setOrigin(0));
    c.add(this.add.rectangle(0, 0, w, h, 0x2a2820).setOrigin(0));
    c.add(this.add.rectangle(0, 0, w * 0.28, h, 0x1a1812).setOrigin(0));
    c.add(this.add.rectangle(w * 0.72, 0, w * 0.28, h, 0x1a1812).setOrigin(0));
    const ceil = this.add.rectangle(w / 2, 28, 200, 14, 0x3a3a30).setStrokeStyle(1, 0x1a1a14);
    const tube = this.add.rectangle(w / 2, 28, 180, 6, 0xfff4cc, 0.95);
    c.add(ceil); c.add(tube);
    this.tweens.add({ targets: tube, alpha: 0.6, duration: 110, yoyo: true, repeat: 4 });
    c.add(this.add.triangle(w / 2, 35, -180, 0, 180, 0, 0, h, 0xfff4cc, 0.07).setOrigin(0.5, 0));
    const vx = w / 2, vy = h * 0.55;
    const stepCount = 9;
    for (let i = 0; i < stepCount; i++) {
      const t = i / stepCount;
      const tn = (i + 1) / stepCount;
      const y0 = vy + (h - vy) * Math.pow(t, 1.4);
      const y1 = vy + (h - vy) * Math.pow(tn, 1.4);
      const hw0 = (w * 0.5 - 60) * Math.pow(tn, 0.85) + 40;
      const hw1 = (w * 0.5 - 60) * Math.pow(t, 0.85) + 40;
      c.add(this.add.polygon(0, 0, [
        vx - hw1, y0, vx + hw1, y0,
        vx + hw0, y1, vx - hw0, y1,
      ], 0x9a8a70, 0.95).setOrigin(0).setStrokeStyle(1, 0x4a3a28, 0.8));
      c.add(this.add.polygon(0, 0, [
        vx - hw1, y0 - 6, vx + hw1, y0 - 6,
        vx + hw1, y0, vx - hw1, y0,
      ], 0x3a2a22, 0.95).setOrigin(0));
    }
    for (const side of [-1, 1]) {
      const railX1 = w / 2 + side * 60;
      const railX2 = side > 0 ? w - 30 : 30;
      c.add(this.add.line(0, 0, railX1, vy + 6, railX2, h - 30, 0x8a5a30, 0.95).setOrigin(0).setLineWidth(4));
    }
  }

  // Adds a small neighbour silhouette + speech bubble to the stairwell
  // container. Returns a cleanup function (currently no-op since everything
  // lives inside the container's destroy chain, but keeps the contract open).
  drawStairwellNeighbor(c, day) {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    // Stand the neighbour on the upper-right portion of the staircase so they
    // don't block the central vanishing point.
    const nx = w * 0.62;
    const ny = h * 0.66;
    // Each day picks a different silhouette + tone.
    const presets = {
      2: { kind: 'auntie',   bodyColor: 0xb0506a, headColor: 0xf2c79a, hatColor: 0x2a1820 },
      3: { kind: 'uncle',    bodyColor: 0x4a5a70, headColor: 0xe8b890, hatColor: 0x3a2820, prop: 'umbrella' },
      4: { kind: 'kid',      bodyColor: 0xe8b96a, headColor: 0xf2c79a, hatColor: null },
      5: { kind: 'old_man',  bodyColor: 0x6a5a4a, headColor: 0xe8b890, hatColor: 0x2a1810, prop: 'cane' },
    };
    const p = presets[day] || presets[2];
    const s = p.kind === 'kid' ? 0.78 : 1.0;
    // Body (torso)
    c.add(this.add.rectangle(nx, ny + 14 * s, 22 * s, 38 * s, p.bodyColor));
    // Pants
    c.add(this.add.rectangle(nx - 5 * s, ny + 36 * s, 8 * s, 18 * s, 0x2a1f1a));
    c.add(this.add.rectangle(nx + 5 * s, ny + 36 * s, 8 * s, 18 * s, 0x2a1f1a));
    // Arms (one slightly raised in a wave)
    c.add(this.add.rectangle(nx - 14 * s, ny + 12 * s, 5 * s, 22 * s, p.bodyColor));
    c.add(this.add.rectangle(nx + 14 * s, ny + 4 * s,  5 * s, 22 * s, p.bodyColor).setRotation(-0.35));
    // Head
    c.add(this.add.circle(nx, ny - 12 * s, 9 * s, p.headColor));
    // Hair / hat
    if (p.hatColor) {
      c.add(this.add.rectangle(nx, ny - 18 * s, 18 * s, 5 * s, p.hatColor));
    }
    // Eyes (dot pair)
    c.add(this.add.circle(nx - 3 * s, ny - 12 * s, 1.2, 0x101010));
    c.add(this.add.circle(nx + 3 * s, ny - 12 * s, 1.2, 0x101010));
    // Optional prop
    if (p.prop === 'umbrella') {
      c.add(this.add.arc(nx + 22 * s, ny - 4 * s, 16 * s, 180, 360, false, 0x2a4060));
      c.add(this.add.rectangle(nx + 22 * s, ny + 8 * s, 2, 24 * s, 0x6a4a30));
    } else if (p.prop === 'cane') {
      c.add(this.add.line(0, 0, nx + 14 * s, ny + 4 * s, nx + 22 * s, ny + 38 * s, 0x6a4a30).setLineWidth(2));
    }

    // Speech bubble — name above, line in the bubble. Bubble points down-left
    // toward the neighbour's mouth.
    const name = I18n.t(`apt.neighbor_d${day}_name`);
    const line = I18n.t(`apt.neighbor_d${day}_line`);
    const padX = 14, padY = 8;
    const bubbleY = ny - 70;
    // Measure roughly via temporary text
    const tmp = this.add.text(0, 0, line, { fontFamily: 'serif', fontSize: '14px' }).setVisible(false);
    const bw = Math.min(260, Math.max(120, tmp.width + padX * 2));
    tmp.destroy();
    const bx = Math.min(w - bw / 2 - 12, nx - 30);
    const bubbleBg = this.add.rectangle(bx, bubbleY, bw, 50, 0xfdfcf2, 0.96).setStrokeStyle(2, 0x1a1a1a, 0.85);
    const bubbleTail = this.add.triangle(0, 0,
      bx + 30, bubbleY + 24,
      bx + 46, bubbleY + 24,
      nx - 4, ny - 18,
      0xfdfcf2, 0.96
    ).setOrigin(0);
    c.add(bubbleBg); c.add(bubbleTail);
    c.add(this.add.text(bx, bubbleY - 8, name, {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#8a5a30',
    }).setOrigin(0.5));
    c.add(this.add.text(bx, bubbleY + 8, line, {
      fontFamily: 'serif', fontSize: '14px', color: '#1a1a1a',
    }).setOrigin(0.5));

    return () => {};
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

  // Top-left slack HUD: phone-icon + label + segmented progress bar + number.
  // Bar tier flips colour as the player gets greedier — cyan→amber→red — so
  // the cost of slacking is felt visually before the result screen scolds.
  createSlackHud() {
    const x = 20;
    const y = 14;
    const barW = 110;
    const barH = 9;

    // Phone glyph — small rounded rect with screen + home dot
    this.add.rectangle(x + 6, y + 13, 14, 22, 0x1a1a2a).setStrokeStyle(1, 0x6acfff);
    this.add.rectangle(x + 6, y + 11, 10, 14, 0x6acfff, 0.45);
    this.add.circle(x + 6, y + 21, 1.4, 0x6acfff);

    this.add.text(x + 22, y + 1, I18n.t('apt.slack_label_short'), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#9adfff',
    });

    this.slackBarBg = this.add.rectangle(x + 22, y + 18, barW, barH, 0x102030)
      .setOrigin(0, 0).setStrokeStyle(1, 0x4a6a80);
    // scaleX-driven fill — tweens reliably on Phaser Shapes (Rectangle.width
    // has a setter but doesn't cleanly tween via the WebGL renderer).
    this.slackBar = this.add.rectangle(x + 22 + 1, y + 18 + 1, barW - 2, barH - 2, 0x6acfff)
      .setOrigin(0, 0).setScale(0, 1);
    // Tick marks at 33% / 66% to give the bar a notion of "tiers"
    this.add.line(x + 22 + barW * 0.33, y + 18 + barH / 2, 0, -barH / 2, 0, barH / 2, 0x4a6a80)
      .setLineWidth(1);
    this.add.line(x + 22 + barW * 0.66, y + 18 + barH / 2, 0, -barH / 2, 0, barH / 2, 0x4a6a80)
      .setLineWidth(1);

    this.slackNum = this.add.text(x + 22 + barW + 8, y + 13, '0', {
      fontFamily: 'monospace', fontSize: '15px', color: '#6acfff', fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.slackBarMax = barW - 2;
    this.slackSoftCap = 60; // bar saturates at 60 points; number keeps counting
  }

  bumpSlack(amount) {
    this.slackPoints += amount;
    this.slackNum.setText(String(this.slackPoints));

    // Tier colours track greed: cyan (chill) → amber (heads up) → red (greedy).
    let color = 0x6acfff;
    let textColor = '#6acfff';
    if (this.slackPoints >= this.slackSoftCap * 0.66) { color = 0xff6b8a; textColor = '#ff6b8a'; }
    else if (this.slackPoints >= this.slackSoftCap * 0.33) { color = 0xe8b96a; textColor = '#e8b96a'; }

    const fillRatio = Math.min(1, this.slackPoints / this.slackSoftCap);
    this.slackBar.fillColor = color;
    this.slackNum.setColor(textColor);

    this.tweens.add({
      targets: this.slackBar,
      scaleX: fillRatio,
      duration: 220,
      ease: 'Cubic.easeOut',
    });
    // Quick number pop + bar flash so each tap feels rewarding (and hollow).
    this.slackNum.setScale(1.35);
    this.tweens.add({
      targets: this.slackNum, scale: 1, duration: 200, ease: 'Back.easeOut',
    });
    this.slackBar.setAlpha(1);
    this.tweens.add({
      targets: this.slackBar, alpha: 0.7, duration: 120, yoyo: true,
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
