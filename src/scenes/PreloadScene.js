import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    const barBg = this.add.rectangle(w / 2, h / 2, 400, 8, 0x2a1a2a);
    const bar = this.add.rectangle(w / 2 - 200, h / 2, 0, 8, 0xe8b96a).setOrigin(0, 0.5);
    this.add.text(w / 2, h / 2 - 30, 'Loading...', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#e8dccb',
    }).setOrigin(0.5);

    this.load.on('progress', (p) => {
      bar.width = 400 * p;
    });
  }

  create() {
    this.scene.start(SCENES.TITLE);
  }
}
