import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class StreetScene extends Phaser.Scene {
  constructor() {
    super(SCENES.STREET);
  }

  init(data) {
    this.day = data.day || 1;
    this.slackPoints = data.slackPoints || 0;
    this.truckProximity = data.truckProximity || 0;
    this.hits = 0;
    this.misses = 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x2a1a2a).setOrigin(0);
    this.add.text(w / 2, 40, 'The alley — chase the truck', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#e8b96a',
    }).setOrigin(0.5);

    this.add.text(w / 2, 80, '[ placeholder: street with truck ]', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#666',
    }).setOrigin(0.5);

    this.add.text(w / 2, h - 60, 'SPACE: throw the trash bag', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#e8dccb',
    }).setOrigin(0.5);

    this.resultText = this.add.text(w / 2, h / 2, '', {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#6acfff',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      if (this.truckProximity > 0.8) {
        this.hits = 1;
        this.resultText.setText('Bag hit. You made it.');
      } else {
        this.misses = 1;
        this.resultText.setText('Too late. The truck rolls on.');
      }
      this.time.delayedCall(1500, () => {
        this.scene.start(SCENES.RESULT, {
          day: this.day,
          slackPoints: this.slackPoints,
          hits: this.hits,
          misses: this.misses,
        });
      });
    });
  }
}
