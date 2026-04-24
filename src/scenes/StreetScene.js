import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { getLevel } from '../data/levels.js';
import AudioDistance from '../systems/AudioDistance.js';
import { Sfx } from '../systems/Sfx.js';
import Player from '../objects/Player.js';
import TrashTruck from '../objects/TrashTruck.js';
import I18n from '../systems/I18n.js';

// Street chase: the truck drives slowly from right to left. Player spawns on the
// left. Player closes the gap with Right arrow, then presses SPACE to throw the bag.
// Each successful bag throw scores; bags missed count against you. Truck escapes
// when it reaches the left edge of screen or after throwWindow runs out.

export default class StreetScene extends Phaser.Scene {
  constructor() {
    super(SCENES.STREET);
  }

  init(data) {
    this.level = getLevel(data.day || 1);
    this.slackPoints = data.slackPoints || 0;
    this.proximityAtExit = data.proximityAtExit ?? 0.5;
    this.forcedExit = !!data.forcedExit;
    this.totalScore = data.totalScore || 0;
    this.bagsThrown = 0;
    this.bagsHit = 0;
    this.finished = false;
    this.throwLocked = false;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(400, 10, 10, 15);

    // Painted alley backdrop — weather + day choose which variant
    const bgKey = this.pickAlleyBg();
    if (bgKey && this.textures.exists(bgKey)) {
      this.add.image(w / 2, h / 2, bgKey).setDisplaySize(w, h);
      this.add.rectangle(0, 0, w, h, 0x0a0818, 0.12).setOrigin(0);
    } else {
      const skyTop = this.level.weather === 'rain' ? 0x3a3a4a : 0xd97a5a;
      const skyBottom = this.level.weather === 'rain' ? 0x2a2a35 : 0x6a3a5a;
      this.add.rectangle(0, 0, w, h * 0.55, skyTop).setOrigin(0);
      this.add.rectangle(0, h * 0.55, w, h * 0.10, skyBottom).setOrigin(0);
      for (let i = 0; i < 8; i++) {
        const bx = i * (w / 7);
        const bh = 120 + (i % 3) * 40;
        this.add.rectangle(bx, h * 0.65 - bh, w / 7 + 4, bh, 0x3a1f30).setOrigin(0, 1);
      }
      for (let i = 0; i < 3; i++) {
        this.add.line(0, 0, 0, 70 + i * 12, w, 60 + i * 12, 0x1a1a20, 1).setOrigin(0, 0).setLineWidth(1);
      }
      this.add.rectangle(0, h * 0.65, w, h * 0.35, 0x2a1a20).setOrigin(0);
      this.add.rectangle(0, h * 0.65, w, 4, 0x5a4a30).setOrigin(0);
      for (let i = 0; i < 5; i++) {
        this.add.rectangle(80 + i * 120, h * 0.68, 32, 14, 0x3a2a30);
      }
    }

    // Rain overlay
    if (this.level.weather === 'rain') {
      this.rain = this.add.particles(0, 0, null, null);
      this.rainTimer = this.time.addEvent({
        delay: 30, loop: true,
        callback: () => {
          const g = this.add.line(0, 0,
            Phaser.Math.Between(0, w), 0,
            Phaser.Math.Between(0, w) - 10, h,
            0x9ac0c0, 0.3,
          ).setLineWidth(1);
          this.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: () => g.destroy() });
        },
      });
    }

    // Truck — starts off-screen right, drives to left
    this.truck = new TrashTruck(this, w + 120, h * 0.80);
    this.truck.rumble(this);

    // Player on left, walking toward the truck
    this.player = new Player(this, 100, h * 0.82);
    this.player.setFacing('right');
    this.player.walk();

    // HUD
    this.dayLabel = this.add.text(w / 2, 20, I18n.t('street.day_label', { day: this.level.day }), {
      fontFamily: 'serif', fontSize: '16px', color: '#e8b96a',
    }).setOrigin(0.5, 0);

    this.bagsLabel = this.add.text(20, 20, I18n.t('street.bags_label', { hit: 0, total: this.level.bagCount }), {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#e8dccb',
    });

    this.hint = this.add.text(w / 2, h - 50, I18n.t('street.hint'), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#999',
    }).setOrigin(0.5);

    // Tap buttons — mobile + mouse affordance alongside keyboard.
    const btnDefs = [
      { label: '←', x: w / 2 - 140, action: () => { this.player.x = Math.max(60, this.player.x - 18); } },
      { label: I18n.t('street.btn_throw'), x: w / 2, action: () => this.throwBag() },
      { label: '→', x: w / 2 + 140, action: () => { this.player.x = Math.min(w - 60, this.player.x + 24); } },
    ];
    btnDefs.forEach((b) => {
      const bg = this.add.rectangle(b.x, h - 18, 100, 28, 0x1a1a2a, 0.7)
        .setStrokeStyle(1, 0x6acfff, 0.45);
      this.add.text(b.x, h - 18, b.label, {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#6acfff', align: 'center',
      }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x2a2a4a, 0.85));
      bg.on('pointerout', () => bg.setFillStyle(0x1a1a2a, 0.7));
      bg.on('pointerdown', b.action);
    });

    // Timing indicator — a shrinking bar under the player when truck is in range.
    this.rangeBarBg = this.add.rectangle(0, 0, 80, 6, 0x1a1a2a).setVisible(false);
    this.rangeBar = this.add.rectangle(0, 0, 80, 5, 0x6acfff).setOrigin(0, 0.5).setVisible(false);

    // Audio continues from apartment — swap to tension BGM if available, else main.
    this.audio = new AudioDistance(this);
    const bgmKey = this.cache.audio.exists('bgm-tension')
      ? 'bgm-tension'
      : (this.cache.audio.exists('bgm-main') ? 'bgm-main' : null);
    if (bgmKey) {
      const bgm = this.sound.add(bgmKey, { loop: true, volume: 0 });
      this.audio.setRealSound(bgm);
    }
    this.audio.setProximity(0.2);
    this.audio.start();
    // Smooth 800ms BGM ramp instead of snapping to full volume on scene entry.
    this.tweens.addCounter({
      from: 0.2, to: 0.9, duration: 800,
      onUpdate: (t) => this.audio && this.audio.setProximity(t.getValue()),
    });

    // Field recording plays on top if present — grounds the scene in real place.
    if (this.cache.audio.exists('truck-real')) {
      this.truckRecording = this.sound.add('truck-real', { loop: true, volume: 0.35 });
      this.truckRecording.play();
    }

    // Floating "throw NOW" cue above the player whenever in throw range — fixes
    // the "I had no idea when to throw" problem from playtesting. Always built;
    // updateRangeIndicator drives its position + alpha.
    this.throwCue = this.add.text(0, 0, '', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#e8b96a', fontStyle: 'bold',
      stroke: '#0a0a14', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0).setDepth(800);

    // First-time tutorial overlay — without this most players don't realise
    // they need to chase the truck and time the throw. Stays up until SPACE
    // (or any key) is pressed, or 4.5s, whichever comes first. Subsequent days
    // skip it via a session flag.
    this.throwLocked = true;
    const goText = this.add.text(w / 2, h / 2 - 20, I18n.t('street.go'), {
      fontFamily: 'serif', fontSize: '48px', color: '#e8b96a', fontStyle: 'bold',
      stroke: '#2a1a10', strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setScale(0.6);
    this.tweens.add({
      targets: goText, alpha: 1, scale: 1.1, duration: 260, ease: 'Back.easeOut',
      delay: this.tutorialShown ? 0 : 1200,
      onComplete: () => {
        this.tweens.add({
          targets: goText, alpha: 0, duration: 400, delay: 280,
          onComplete: () => goText.destroy(),
        });
      },
    });

    // Truck drives slowly leftward, escape time scales with level.
    // First-time tutorial freezes the truck for an extra 1.2s so the player has
    // a chance to read the prompts before the real timer starts.
    const escapeDuration = 7000 / this.level.streetSpeed;
    const truckDelay = (this.tutorialShown ? 0 : 1200) + 900;
    this.truckTween = this.tweens.add({
      targets: this.truck,
      x: -200,
      duration: escapeDuration,
      delay: truckDelay,
      ease: 'Linear',
      onStart: () => { this.throwLocked = false; },
      onComplete: () => this.endChase(),
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.throwBag());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.finished) return;
      this.scene.pause();
      this.scene.launch(SCENES.PAUSE, { resumeKey: SCENES.STREET });
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      this.player.x = Math.max(60, this.player.x - 18);
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.player.x = Math.min(w - 60, this.player.x + 24);
    });

    // Periodic "distance window" update
    this.time.addEvent({
      delay: 60, loop: true,
      callback: () => this.updateRangeIndicator(),
    });

    this.input.keyboard.once('keydown', () => this.audio.ctx.resume && this.audio.ctx.resume());
  }

  updateRangeIndicator() {
    if (this.finished) return;
    const dx = Math.abs(this.truck.x - this.player.x);
    const inRange = dx < 100;
    this.rangeBarBg.setVisible(inRange).setPosition(this.player.x - 40, this.player.y - 56);
    this.rangeBar.setVisible(inRange).setPosition(this.player.x - 40, this.player.y - 56);
    if (inRange) {
      const quality = 1 - (dx / 100);
      this.rangeBar.width = 80 * quality;
      this.rangeBar.fillColor = dx < 50 ? 0x6affaa : 0x6acfff;
    }
    // Floating "SPACE 丟!" cue above the player whenever in throw range — fixes
    // the "I had no idea when to throw" problem from playtesting.
    if (this.throwCue) {
      this.throwCue.setPosition(this.player.x, this.player.y - 80);
      const targetAlpha = inRange && !this.throwLocked && this.bagsThrown < this.level.bagCount ? 1 : 0;
      this.throwCue.setAlpha(Phaser.Math.Linear(this.throwCue.alpha, targetAlpha, 0.3));
      const sweet = inRange && dx < 50;
      this.throwCue.setColor(sweet ? '#6affaa' : '#e8b96a');
      this.throwCue.setText(sweet ? I18n.t('street.cue_now') : I18n.t('street.cue_close'));
    }
  }

  showTutorialOverlay() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    // Per-level: each day's hint fires the first time the player reaches that
    // day in this session. D1 covers core controls; D2-D5 layer in the wrinkle
    // (more bags, rain, distractions, final push).
    const reg = this.registry;
    const day = this.level.day;
    const flag = `streetTutorialD${day}Seen`;
    if (reg.get(flag)) {
      this.tutorialShown = true;
      return;
    }
    reg.set(flag, true);
    this.tutorialShown = false;

    // D1 also gets the "controls" body; D2+ get a tighter day-specific tip.
    const titleKey = `street.tut_d${day}_title`;
    const bodyKey = `street.tut_d${day}_body`;
    // Body is taller for D1 (3-line controls) than D2-D5 (1-2 line tip).
    const tall = day === 1;
    const panelH = tall ? 200 : 140;

    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.55).setOrigin(0).setDepth(900);
    const panel = this.add.rectangle(w / 2, h / 2, 520, panelH, 0x121026, 0.95)
      .setStrokeStyle(2, 0xe8b96a, 0.9).setDepth(901);
    const title = this.add.text(w / 2, h / 2 - panelH / 2 + 30, I18n.t(titleKey), {
      fontFamily: 'serif', fontSize: '24px', color: '#e8b96a', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(902);
    const body = this.add.text(w / 2, h / 2 + (tall ? 5 : -5), I18n.t(bodyKey), {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#e8dccb',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setDepth(902);
    const dismiss = this.add.text(w / 2, h / 2 + panelH / 2 - 25, I18n.t('street.tut_dismiss'), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#6acfff',
    }).setOrigin(0.5).setDepth(902);
    this.tweens.add({ targets: dismiss, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });

    const dismissAll = () => {
      this.tweens.add({
        targets: [dim, panel, title, body, dismiss], alpha: 0, duration: 240,
        onComplete: () => [dim, panel, title, body, dismiss].forEach((o) => o.destroy()),
      });
    };
    // D1 holds longer (more text); D2+ dismiss faster (player already knows controls).
    const minHold = tall ? 2400 : 1500;
    const autoHold = tall ? 4500 : 3200;
    this.time.delayedCall(minHold, () => this.input.keyboard.once('keydown', dismissAll));
    this.input.once('pointerdown', dismissAll);
    this.time.delayedCall(autoHold, dismissAll);
  }

  throwBag() {
    if (this.finished || this.throwLocked) return;
    if (this.bagsThrown >= this.level.bagCount) return;
    this.throwLocked = true;
    this.bagsThrown += 1;
    Sfx.throw(this);

    const dx = Math.abs(this.truck.x - this.player.x);
    const hit = dx < 90; // generous hitbox; dx<50 is "perfect" which could grant bonus later

    const bag = this.add.rectangle(this.player.x + 10, this.player.y - 10, 12, 16, 0xe8c850).setStrokeStyle(1, 0x805520);

    const targetX = hit ? this.truck.x - 30 : this.truck.x + 100;
    const targetY = hit ? this.truck.y - 30 : this.truck.y + 40;

    // Parabolic toss
    this.tweens.add({
      targets: bag,
      x: targetX,
      y: targetY,
      duration: 600,
      ease: 'Quad.easeIn',
    });
    this.tweens.add({
      targets: bag,
      angle: hit ? 360 : 720,
      duration: 600,
    });

    // Mid-arc lift
    this.tweens.add({
      targets: bag,
      y: bag.y - 80,
      duration: 280,
      ease: 'Quad.easeOut',
      yoyo: false,
      onComplete: () => {
        this.tweens.add({
          targets: bag,
          y: targetY,
          duration: 320,
          ease: 'Quad.easeIn',
          onComplete: () => {
            if (hit) {
              this.bagsHit += 1;
              this.flashHit();
              bag.destroy();
            } else {
              this.flashMiss();
              this.tweens.add({ targets: bag, alpha: 0, duration: 400, onComplete: () => bag.destroy() });
            }
            this.bagsLabel.setText(I18n.t('street.bags_label', { hit: this.bagsHit, total: this.level.bagCount }));
            this.time.delayedCall(250, () => { this.throwLocked = false; });

            if (this.bagsHit >= this.level.bagCount) {
              this.time.delayedCall(700, () => this.endChase(true));
            }
          },
        });
      },
    });
  }

  flashHit() {
    this.cameras.main.shake(160, 0.006);
    const f = this.add.text(this.truck.x - 20, this.truck.y - 60, I18n.t('street.hit'), {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#6affaa', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({ targets: f, y: f.y - 30, alpha: 0, duration: 700, onComplete: () => f.destroy() });
  }

  flashMiss() {
    const f = this.add.text(this.truck.x - 20, this.truck.y - 60, I18n.t('street.miss'), {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ff6b8a',
    }).setOrigin(0.5);
    this.tweens.add({ targets: f, y: f.y - 30, alpha: 0, duration: 700, onComplete: () => f.destroy() });
  }

  endChase(success) {
    if (this.finished) return;
    this.finished = true;
    this.truckTween.stop();
    this.audio.stop();
    const caught = success || this.bagsHit >= this.level.bagCount;
    this.cameras.main.fadeOut(400, 10, 10, 15);
    this.time.delayedCall(430, () => {
      this.scene.start(SCENES.RESULT, {
        day: this.level.day,
        slackPoints: this.slackPoints,
        bagsHit: this.bagsHit,
        bagCount: this.level.bagCount,
        caught,
        forcedExit: this.forcedExit,
        totalScore: this.totalScore,
      });
    });
  }

  pickAlleyBg() {
    if (this.level.weather === 'rain') return 'bg-alley-rain';
    if (this.level.weather === 'nightmarket') return 'bg-alley-night-market';
    return 'bg-alley-clear';
  }

  shutdown() {
    if (this.audio) this.audio.destroy();
    if (this.truckRecording && this.truckRecording.isPlaying) {
      this.truckRecording.stop();
    }
  }
}
