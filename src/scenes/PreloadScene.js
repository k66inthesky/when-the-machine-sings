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

    this.load.image('bg-apartment', 'assets/images/bg/01_apartment_livingroom.png');
    this.load.image('bg-stairwell', 'assets/images/bg/02_stairwell.png');
    this.load.image('bg-alley-clear', 'assets/images/bg/03_alley_dusk_clear.png');
    this.load.image('bg-alley-rain', 'assets/images/bg/04_alley_dusk_rain.png');
    this.load.image('bg-alley-night-market', 'assets/images/bg/05_alley_dusk_night_market.png');
    this.load.image('bg-yard-ending', 'assets/images/bg/06_yard_ending.png');

    this.load.image('player-idle', 'assets/images/char/player_front_idle.png');
    this.load.image('player-walk-1', 'assets/images/char/player_walk_side_01.png');
    this.load.image('player-walk-2', 'assets/images/char/player_walk_side_02.png');
    this.load.image('player-walk-3', 'assets/images/char/player_walk_side_03.png');
    this.load.image('player-walk-4', 'assets/images/char/player_walk_side_04.png');
    this.load.image('player-run', 'assets/images/char/player_run_side.png');
    this.load.image('mom-angry', 'assets/images/char/mom_angry.png');
    this.load.image('mom-proud', 'assets/images/char/_proud.png');
    this.load.image('mom-satisfied', 'assets/images/char/_satisfied.png');

    // Image loads can silently fail on bad paths — surface that in the console.
    this.load.on('loaderror', (file) => {
      console.warn('[preload] asset missing:', file.src);
    });
  }

  create() {
    this.scene.start(SCENES.TITLE);
  }
}
