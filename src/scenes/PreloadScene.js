import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Playables from '../systems/Playables.js';

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

    // YT Playables certification: firstFrameReady() MUST fire once we
    // are visibly rendering a loading UI. Call it at the end of this
    // frame so Phaser has committed the draw.
    this.time.delayedCall(0, () => Playables.firstFrameReady());

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
    this.load.image('mom-proud', 'assets/images/char/mom_proud.png');
    this.load.image('mom-satisfied', 'assets/images/char/mom_satisfied.png');

    this.load.image('truck-far', 'assets/images/char/truck_far.png');
    this.load.image('truck-mid', 'assets/images/char/truck_mid.png');

    // Audio loads — optional. Failed loads are expected before the user drops
    // Suno exports + field recordings in; the game falls back to synth + procedural SFX.
    this.load.audio('bgm-main', [
      'assets/audio/music/bgm_main.mp3',
      'assets/audio/music/bgm_main.ogg',
    ]);
    this.load.audio('bgm-tension', [
      'assets/audio/music/bgm_tension.mp3',
      'assets/audio/music/bgm_tension.ogg',
    ]);
    this.load.audio('bgm-ending', [
      'assets/audio/music/bgm_ending.mp3',
      'assets/audio/music/bgm_ending.ogg',
    ]);
    this.load.audio('truck-real', [
      'assets/audio/sfx/truck_recording.mp3',
      'assets/audio/sfx/truck_recording.ogg',
    ]);
    for (const key of ['throw', 'hit', 'miss', 'ping', 'tick', 'scroll', 'static', 'step']) {
      this.load.audio(`sfx-${key}`, [
        `assets/audio/sfx/${key}.mp3`,
        `assets/audio/sfx/${key}.ogg`,
      ]);
    }

    // Mom voice lines — one per day × two outcomes. Loaded if user has recorded.
    for (let day = 1; day <= 5; day++) {
      for (const outcome of ['caught', 'missed']) {
        this.load.audio(`mom-d${day}-${outcome}`, [
          `assets/audio/voice/mom_d${day}_${outcome}.mp3`,
          `assets/audio/voice/mom_d${day}_${outcome}.ogg`,
        ]);
      }
    }

    // Image loads can silently fail on bad paths — surface that in the console.
    // For audio, we expect 404s before recording + music are ready.
    this.load.on('loaderror', (file) => {
      if (file.type !== 'audio') {
        console.warn('[preload] asset missing:', file.src);
      }
    });
  }

  create() {
    this.scene.start(SCENES.TITLE);
  }
}
