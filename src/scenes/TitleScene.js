import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.TITLE);
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);

    this.add.text(w / 2, h / 2 - 80, 'WHEN THE MACHINE SINGS', {
      fontFamily: 'serif',
      fontSize: '40px',
      color: '#e8b96a',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 30, 'In Taiwan, when the machine sings, you run.', {
      fontFamily: 'serif',
      fontSize: '16px',
      color: '#e8dccb',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const prompt = this.add.text(w / 2, h / 2 + 60, '[ Press SPACE to start ]', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#6acfff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(w / 2, h - 30, 'Gamedev.js Jam 2026 — Theme: Machines', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#666',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start(SCENES.APARTMENT, { day: 1 });
    });
  }
}
