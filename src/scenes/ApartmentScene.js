import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class ApartmentScene extends Phaser.Scene {
  constructor() {
    super(SCENES.APARTMENT);
  }

  init(data) {
    this.day = data.day || 1;
    this.slackPoints = 0;
    this.truckProximity = 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x1a1020).setOrigin(0);
    this.add.text(w / 2, 40, `Day ${this.day} — Afternoon`, {
      fontFamily: 'serif',
      fontSize: '22px',
      color: '#e8b96a',
    }).setOrigin(0.5);

    this.add.text(w / 2, 80, '[ placeholder: apartment living room ]', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#666',
    }).setOrigin(0.5);

    this.hintText = this.add.text(w / 2, h - 80, 'E: scroll phone (slack)   |   ENTER: leave for the truck', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#e8dccb',
    }).setOrigin(0.5);

    this.slackText = this.add.text(20, 20, 'Slack: 0', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#6acfff',
    });

    this.truckText = this.add.text(w - 20, 20, 'Truck: distant', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#ff6b8a',
    }).setOrigin(1, 0);

    this.input.keyboard.on('keydown-E', () => {
      this.slackPoints += 1;
      this.slackText.setText(`Slack: ${this.slackPoints}`);
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start(SCENES.STREET, {
        day: this.day,
        slackPoints: this.slackPoints,
        truckProximity: this.truckProximity,
      });
    });

    this.time.addEvent({
      delay: 1000,
      repeat: 30,
      callback: () => {
        this.truckProximity += 1 / 30;
        if (this.truckProximity > 0.9) {
          this.truckText.setText('Truck: HERE NOW!').setColor('#ff6b8a');
        } else if (this.truckProximity > 0.6) {
          this.truckText.setText('Truck: close');
        } else if (this.truckProximity > 0.3) {
          this.truckText.setText('Truck: approaching');
        }
      },
    });
  }
}
