import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// Tiny overlay scene launched on Escape. The gameplay scene underneath is
// paused, so this scene handles the resume keybind.
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  init(data) {
    this.resumeKey = data?.resumeKey || SCENES.APARTMENT;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x050510, 0.72).setOrigin(0);

    this.add.text(w / 2, h / 2 - 30, 'PAUSED', {
      fontFamily: 'serif', fontSize: '42px', color: '#e8b96a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 20, 'ESC: resume', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#6acfff',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 46, '暫停中 — ESC 繼續', {
      fontFamily: 'serif', fontSize: '13px', color: '#aaa9a0', fontStyle: 'italic',
    }).setOrigin(0.5);

    const resume = () => {
      this.scene.resume(this.resumeKey);
      this.scene.stop();
    };
    this.input.keyboard.once('keydown-ESC', resume);
  }
}
