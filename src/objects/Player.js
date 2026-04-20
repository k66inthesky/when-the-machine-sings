// Player character. Uses AI-painted sprites if loaded; otherwise falls back
// to procedural rects so the scene is still playable before assets land.

import Phaser from 'phaser';

const SPRITE_HEIGHT = 110;
const SPRITE_SCALE_FROM = 559;
const WALK_FRAMES = ['player-walk-1', 'player-walk-2', 'player-walk-3', 'player-walk-4'];

export default class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    const hasSprites = scene.textures.exists('player-idle');
    this.spriteMode = hasSprites;

    // Procedural fallback parts — always built, then hidden if sprites exist.
    this.body_ = scene.add.rectangle(0, 0, 20, 36, 0x8a6a4a).setStrokeStyle(1, 0x2a1a10);
    this.head = scene.add.circle(0, -26, 9, 0xe5b590).setStrokeStyle(1, 0x2a1a10);
    this.hair = scene.add.rectangle(0, -32, 16, 8, 0x2a1a10);
    this.legs = scene.add.rectangle(0, 22, 18, 6, 0x1a1a2a);
    this.bag = scene.add.rectangle(14, 2, 14, 16, 0xe8c850).setStrokeStyle(1, 0x805520);
    this.bagShine = scene.add.rectangle(11, -2, 3, 8, 0xfff0aa);
    this.add([this.legs, this.body_, this.head, this.hair, this.bag, this.bagShine]);

    if (hasSprites) {
      [this.body_, this.head, this.hair, this.legs, this.bag, this.bagShine]
        .forEach((r) => r.setVisible(false));
      const scaleFactor = SPRITE_HEIGHT / SPRITE_SCALE_FROM;
      this.sprite = scene.add.image(0, 0, 'player-idle')
        .setOrigin(0.5, 1)
        .setScale(scaleFactor);
      this.sprite.y = SPRITE_HEIGHT / 2;
      this.add(this.sprite);
    }

    this.setSize(28, 62);

    this.bobTween = scene.tweens.add({
      targets: this,
      y: y - 2,
      duration: 550,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.walkFrame = 0;
    this.walkTimer = null;
  }

  setFacing(dir) {
    const scale = dir === 'left' ? -1 : 1;
    this.setScale(scale, 1);
  }

  urgent() {
    this.bobTween.timeScale = 2.5;
    if (this.spriteMode && this.scene.textures.exists('player-run')) {
      if (this.walkTimer) { this.walkTimer.remove(false); this.walkTimer = null; }
      this.sprite.setTexture('player-run');
    } else if (this.spriteMode) {
      this.walk();
    }
  }

  calm() {
    this.bobTween.timeScale = 1;
    this.idle();
  }

  walk() {
    if (!this.spriteMode || this.walkTimer) return;
    this.walkTimer = this.scene.time.addEvent({
      delay: 140,
      loop: true,
      callback: () => {
        this.walkFrame = (this.walkFrame + 1) % WALK_FRAMES.length;
        this.sprite.setTexture(WALK_FRAMES[this.walkFrame]);
      },
    });
  }

  idle() {
    if (!this.spriteMode) return;
    if (this.walkTimer) {
      this.walkTimer.remove(false);
      this.walkTimer = null;
    }
    this.sprite.setTexture('player-idle');
  }

  dropBag() {
    this.bag.setVisible(false);
    this.bagShine.setVisible(false);
  }

  showBag() {
    if (this.spriteMode) return;
    this.bag.setVisible(true);
    this.bagShine.setVisible(true);
  }
}
