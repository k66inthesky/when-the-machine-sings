import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENES.RESULT);
  }

  init(data) {
    this.day = data.day || 1;
    this.slackPoints = data.slackPoints || 0;
    this.hits = data.hits || 0;
    this.misses = data.misses || 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);

    const success = this.hits > 0;
    const momLine = success
      ? 'Mom: "You made it. Good."'
      : 'Mom: "You missed it. Again."';
    const score = success ? this.slackPoints * 10 + 100 : this.slackPoints * 10 - 50;

    this.add.text(w / 2, h / 2 - 80, `Day ${this.day} — Result`, {
      fontFamily: 'serif',
      fontSize: '22px',
      color: '#e8b96a',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 30, momLine, {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#e8dccb',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 10, `Score: ${score}`, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#6acfff',
    }).setOrigin(0.5);

    const prompt = this.add.text(w / 2, h / 2 + 80, '[ Press SPACE to continue ]', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#999',
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      if (this.day >= 5) {
        this.scene.start(SCENES.ENDING);
      } else {
        this.scene.start(SCENES.APARTMENT, { day: this.day + 1 });
      }
    });
  }
}
