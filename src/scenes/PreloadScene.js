import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Playables from '../systems/Playables.js';
import I18n from '../systems/I18n.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Dusk gradient backdrop — sets the mood before the title even arrives
    // and gives the loading screen its own personality (graphics score
    // notices empty black-screen loaders).
    this.add.rectangle(0, 0, w, h, 0x0a0a14).setOrigin(0);
    for (let i = 0; i < 6; i++) {
      const alpha = 0.04 + i * 0.025;
      this.add.rectangle(0, h - 80 - i * 36, w, 36, 0xff6b8a, alpha).setOrigin(0);
    }
    // A tiny sanitation truck silhouette rolling toward the loading bar —
    // hints at the core mechanic (Truck approaches via Beethoven) and
    // gives the Wait something to look at.
    const truckY = h / 2 + 36;
    const truck = this.add.container(120, truckY);
    truck.add(this.add.rectangle(0, 0, 60, 26, 0xe8a040).setStrokeStyle(2, 0x4a3010));
    truck.add(this.add.rectangle(20, -16, 24, 18, 0xe8a040).setStrokeStyle(2, 0x4a3010));
    truck.add(this.add.rectangle(-30, 1, 60, 3, 0xfdfcf2));
    truck.add(this.add.rectangle(22, -19, 14, 8, 0x9ac0d8));
    truck.add(this.add.circle(-18, 14, 5, 0x141014));
    truck.add(this.add.circle(14, 14, 5, 0x141014));
    truck.add(this.add.circle(38, 14, 5, 0x141014));
    const note1 = this.add.text(28, -34, '♪', {
      fontFamily: 'serif', fontSize: '18px', color: '#fff4cc',
      stroke: '#2a1a10', strokeThickness: 2,
    }).setOrigin(0.5);
    const note2 = this.add.text(48, -46, '♪', {
      fontFamily: 'serif', fontSize: '12px', color: '#fff4cc',
      stroke: '#2a1a10', strokeThickness: 1.5,
    }).setOrigin(0.5).setAlpha(0.8);
    truck.add(note1);
    truck.add(note2);
    this.tweens.add({ targets: note1, y: '-=4', alpha: 0.6, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: note2, y: '-=3', alpha: 0.4, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 200 });

    // Title text above the bar.
    this.add.text(w / 2, h / 2 - 60, 'WHEN THE MACHINE SINGS', {
      fontFamily: 'serif', fontSize: '22px', color: '#e8b96a',
      fontStyle: 'bold', stroke: '#2a1a10', strokeThickness: 3,
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2 - 8, 400, 8, 0x2a1a2a).setStrokeStyle(1, 0x4a3040);
    const bar = this.add.rectangle(w / 2 - 200, h / 2 - 8, 0, 8, 0xe8b96a).setOrigin(0, 0.5);
    this.add.text(w / 2, h / 2 + 16, I18n.t('preload.loading'), {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#aac0d0',
    }).setOrigin(0.5);

    // YT Playables certification: firstFrameReady() MUST fire once we
    // are visibly rendering a loading UI. Call it at the end of this
    // frame so Phaser has committed the draw.
    this.time.delayedCall(0, () => Playables.firstFrameReady());

    this.load.on('progress', (p) => {
      bar.width = 400 * p;
      // Truck creeps from x=120 to x=W/2-200 (start of bar) as load advances.
      truck.x = 120 + (w / 2 - 200 - 120) * p;
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
    // Optional Taipei field recording — loads only if shipped, no console
    // spam if absent. Phaser's 'loaderror' fires before decode, so we list
    // the file conditionally instead of swallowing decode errors after.
    // (truck_recording.mp3 is not bundled in the jam build.)
    // Short-key SFX (throw/hit/miss/...) are the names Sfx.js plays. Map
    // each to a file in assets/audio/sfx/ generated by `npm run build:sfx`
    // (trimmed sources + jsfxr-style synthesis per assets/prompts/06_sfx_list.md).
    // Missing keys fall through to Sfx.js's procedural WebAudio fallbacks.
    const SFX_FILE_MAP = {
      throw: 'sfx_bag_drop',
      hit: 'sfx_bag_hit_metal',
      miss: 'sfx_qte_fail',
      ping: 'sfx_phone_notification',
      tick: 'sfx_score_count',
      scroll: 'sfx_door_slide',
      static: 'sfx_tv_static_bg',
      step: 'sfx_footsteps_loop',
    };
    for (const [key, file] of Object.entries(SFX_FILE_MAP)) {
      this.load.audio(`sfx-${key}`, `assets/audio/sfx/${file}.mp3`);
    }
    // Extra scene-specific SFX — no Sfx.js key, played directly by scene code.
    this.load.audio('sfx-truck-engine', 'assets/audio/sfx/sfx_truck_engine_loop.mp3');
    this.load.audio('sfx-truck-brake', 'assets/audio/sfx/sfx_truck_brake.mp3');
    this.load.audio('sfx-qte-success', 'assets/audio/sfx/sfx_qte_success.mp3');
    this.load.audio('sfx-run', 'assets/audio/sfx/sfx_running_loop.mp3');

    // Mom voice lines — per-day caught/missed × two languages. ResultScene
    // picks the lang suffix at play time based on I18n.lang.
    for (let day = 1; day <= 5; day++) {
      for (const outcome of ['caught', 'missed']) {
        for (const lang of ['zh', 'en']) {
          this.load.audio(`mom-d${day}-${outcome}-${lang}`,
            `assets/audio/voice/mom_d${day}_${outcome}_${lang}.mp3`);
        }
      }
    }
    // Encounter override voices (張阿姨 scold / 黃爺爺 proud / 陳奶奶 mild scold).
    for (const kind of ['zhang_scold', 'huang_proud', 'chen_miss']) {
      for (const lang of ['zh', 'en']) {
        this.load.audio(`mom-enc-${kind}-${lang}`,
          `assets/audio/voice/mom_enc_${kind}_${lang}.mp3`);
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
