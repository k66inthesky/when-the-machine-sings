// Procedural-art player character. Gets swapped for AI-drawn sprite later.
// Looks like a little person with a yellow trash bag.

import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    // Body
    this.body_ = scene.add.rectangle(0, 0, 20, 36, 0x8a6a4a).setStrokeStyle(1, 0x2a1a10);
    this.head = scene.add.circle(0, -26, 9, 0xe5b590).setStrokeStyle(1, 0x2a1a10);
    this.hair = scene.add.rectangle(0, -32, 16, 8, 0x2a1a10);
    this.legs = scene.add.rectangle(0, 22, 18, 6, 0x1a1a2a);

    // Yellow government-regulated trash bag (the iconic Taiwan 專用垃圾袋).
    this.bag = scene.add.rectangle(14, 2, 14, 16, 0xe8c850).setStrokeStyle(1, 0x805520);
    this.bagShine = scene.add.rectangle(11, -2, 3, 8, 0xfff0aa);

    this.add([this.legs, this.body_, this.head, this.hair, this.bag, this.bagShine]);
    this.setSize(28, 62);

    this.bobTween = scene.tweens.add({
      targets: this,
      y: y - 2,
      duration: 550,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  setFacing(dir) {
    // dir: 'left' | 'right'
    const scale = dir === 'left' ? -1 : 1;
    this.setScale(scale, 1);
  }

  urgent() {
    this.bobTween.timeScale = 2.5;
  }

  calm() {
    this.bobTween.timeScale = 1;
  }

  dropBag() {
    this.bag.setVisible(false);
    this.bagShine.setVisible(false);
  }

  showBag() {
    this.bag.setVisible(true);
    this.bagShine.setVisible(true);
  }
}
