import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { getLevel } from '../data/levels.js';
import { randomNag } from '../data/dialogue.js';
import AudioDistance from '../systems/AudioDistance.js';
import Player from '../objects/Player.js';

export default class ApartmentScene extends Phaser.Scene {
  constructor() {
    super(SCENES.APARTMENT);
  }

  init(data) {
    this.level = getLevel(data.day || 1);
    this.slackPoints = 0;
    this.elapsed = 0;
    this.bagsReady = 0;
    this.notificationsSent = 0;
    this.left = false;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Dusk living room backdrop (procedural placeholder)
    this.add.rectangle(0, 0, w, h, 0x2a1528).setOrigin(0);
    this.add.rectangle(0, h - 80, w, 80, 0x3a2030).setOrigin(0); // floor

    // Window with dusk sky
    const windowFrame = this.add.rectangle(w - 160, 130, 220, 140, 0xe8b96a).setStrokeStyle(4, 0x4a3020);
    this.add.rectangle(w - 160, 130, 210, 130, 0xd97a5a);
    this.add.line(0, 0, w - 270, 130, w - 50, 130, 0x4a3020, 1).setLineWidth(2);
    this.add.line(0, 0, w - 160, 60, w - 160, 200, 0x4a3020, 1).setLineWidth(2);

    // Sofa
    this.add.rectangle(240, h - 180, 220, 70, 0xc97a8a).setStrokeStyle(2, 0x4a2030);
    this.add.rectangle(240, h - 210, 220, 30, 0xd98a9a);

    // CRT TV
    this.tv = this.add.rectangle(500, h - 200, 100, 70, 0x2a1a2a).setStrokeStyle(3, 0x1a1a1a);
    this.tvScreen = this.add.rectangle(500, h - 205, 84, 56, 0x3a5050);
    this.tvGlow = this.add.rectangle(500, h - 205, 84, 56, 0x9ac0c0, 0.3);

    // Coffee table with phone
    this.add.rectangle(310, h - 130, 100, 30, 0x6a4520);
    this.phone = this.add.rectangle(310, h - 138, 28, 46, 0x1a1a2a).setStrokeStyle(1, 0x6acfff);
    this.phoneGlow = this.add.rectangle(310, h - 138, 24, 42, 0x6acfff, 0.4);

    this.player = new Player(this, 200, h - 150);

    // HUD — top bar
    this.dayLabel = this.add.text(w / 2, 20, `Day ${this.level.day} / 5`, {
      fontFamily: 'serif', fontSize: '18px', color: '#e8b96a',
    }).setOrigin(0.5, 0);

    this.slackLabel = this.add.text(20, 20, 'Slack: 0', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#6acfff',
    });

    this.truckBarBg = this.add.rectangle(w - 20, 20, 200, 14, 0x1a1a2a).setOrigin(1, 0).setStrokeStyle(1, 0x4a3040);
    this.truckBar = this.add.rectangle(w - 220 + 1, 21, 0, 12, 0xff6b8a).setOrigin(0, 0);
    this.truckLabel = this.add.text(w - 20, 38, 'Truck: distant', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#e8dccb',
    }).setOrigin(1, 0);

    // Opening dialogue
    this.dialogue = this.add.text(w / 2, 55, this.level.momOpener, {
      fontFamily: 'serif', fontSize: '14px', color: '#e8dccb', fontStyle: 'italic',
      align: 'center', wordWrap: { width: w - 80 },
    }).setOrigin(0.5, 0);
    this.tweens.add({ targets: this.dialogue, alpha: 0.35, delay: 4000, duration: 2000 });

    // Controls hint
    this.hint = this.add.text(w / 2, h - 26, 'E: scroll phone   T: watch TV   ENTER: head downstairs with the bag', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#aaa',
    }).setOrigin(0.5);

    // Notification popup (hidden by default)
    this.notifGroup = this.add.container(0, 0).setVisible(false);
    const notifBg = this.add.rectangle(w / 2, h - 90, 360, 44, 0x0a0a0f, 0.9).setStrokeStyle(2, 0x6acfff);
    this.notifText = this.add.text(w / 2, h - 90, '', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
    }).setOrigin(0.5);
    this.notifGroup.add([notifBg, this.notifText]);

    // Audio — core mechanic
    this.audio = new AudioDistance(this);
    this.audio.start();

    // Input
    this.input.keyboard.on('keydown-E', () => this.scrollPhone());
    this.input.keyboard.on('keydown-T', () => this.toggleTv());
    this.input.keyboard.on('keydown-ENTER', () => this.leaveForTruck());

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
    let status = 'distant';
    if (proximity > 0.95) status = 'ARRIVED — GO NOW';
    else if (proximity > 0.8) status = 'right outside';
    else if (proximity > 0.55) status = 'nearby — hurry';
    else if (proximity > 0.3) status = 'approaching';
    this.truckLabel.setText(`Truck: ${status}`);

    if (proximity > 0.9) {
      this.truckLabel.setColor('#ff6b8a');
      this.player.urgent();
    }

    // Auto-fail if player stays too long after truck arrives + 5 sec grace
    if (proximity >= 1 && this.elapsed > this.level.truckArrivalTime + 5) {
      this.leaveForTruck(true);
    }
  }

  scrollPhone() {
    if (this.left) return;
    this.slackPoints += 2;
    this.slackLabel.setText(`Slack: ${this.slackPoints}`);
    this.tweens.add({
      targets: this.phoneGlow,
      alpha: 0.8,
      duration: 80,
      yoyo: true,
    });
  }

  toggleTv() {
    if (this.left) return;
    this.slackPoints += 1;
    this.slackLabel.setText(`Slack: ${this.slackPoints}`);
    this.tweens.add({
      targets: this.tvScreen,
      fillColor: { from: 0x3a5050, to: 0xe8b96a },
      duration: 120,
      yoyo: true,
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
    this.cameras.main.fadeOut(350, 10, 10, 15);
    this.time.delayedCall(380, () => {
      this.scene.start(SCENES.STREET, {
        day: this.level.day,
        slackPoints: this.slackPoints,
        proximityAtExit: proximity,
        forcedExit: forced,
      });
    });
  }

  shutdown() {
    if (this.audio) this.audio.destroy();
  }
}
