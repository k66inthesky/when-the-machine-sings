// Procedural garbage truck — Taipei white+orange livery.

import Phaser from 'phaser';

export default class TrashTruck extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    // Main cabin + cargo hopper
    this.hopper = scene.add.rectangle(-30, 0, 130, 64, 0xf5f1e8).setStrokeStyle(2, 0x2a1a10);
    this.cab = scene.add.rectangle(60, 0, 60, 58, 0xf5f1e8).setStrokeStyle(2, 0x2a1a10);

    // Orange stripe — the iconic Taipei sanitation livery
    this.stripe = scene.add.rectangle(15, 6, 200, 8, 0xe8892a);

    // Windshield
    this.window = scene.add.rectangle(65, -10, 36, 22, 0x6acfff).setStrokeStyle(1, 0x2a1a10);

    // Wheels
    this.wheelFront = scene.add.circle(55, 36, 12, 0x1a1a1a).setStrokeStyle(2, 0x2a1a10);
    this.wheelBack = scene.add.circle(-55, 36, 12, 0x1a1a1a).setStrokeStyle(2, 0x2a1a10);
    this.wheelFrontHub = scene.add.circle(55, 36, 4, 0xaaaaaa);
    this.wheelBackHub = scene.add.circle(-55, 36, 4, 0xaaaaaa);

    // Speaker (where Für Elise comes from)
    this.speaker = scene.add.rectangle(75, -30, 10, 6, 0x2a1a10);

    // Rear claw mechanism details
    this.clawLine = scene.add.rectangle(-90, -20, 4, 40, 0x2a1a10);
    this.clawBar = scene.add.rectangle(-95, -38, 14, 4, 0x2a1a10);

    this.add([
      this.hopper, this.cab, this.stripe, this.window,
      this.wheelFront, this.wheelBack, this.wheelFrontHub, this.wheelBackHub,
      this.speaker, this.clawLine, this.clawBar,
    ]);

    this.setSize(200, 80);

    this.wheelTweens = [
      scene.tweens.add({ targets: [this.wheelFrontHub, this.wheelBackHub], angle: 360, duration: 600, repeat: -1 }),
    ];
  }

  driveAway(targetX, duration, onDone) {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      duration,
      ease: 'Sine.easeIn',
      onComplete: onDone,
    });
  }

  rumble(scene) {
    scene.tweens.add({
      targets: this,
      y: this.y - 1,
      duration: 70,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
    });
  }
}
