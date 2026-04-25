import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, ENDING_THRESHOLD } from '../config.js';
import { getMomLine } from '../data/dialogue.js';
import { TOTAL_DAYS } from '../data/levels.js';
import I18n from '../systems/I18n.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENES.RESULT);
  }

  init(data) {
    this.day = data.day || 1;
    this.slackPoints = data.slackPoints || 0;
    this.bagsHit = data.bagsHit || 0;
    this.bagCount = data.bagCount || 1;
    this.caught = !!data.caught;
    this.forcedExit = !!data.forcedExit;
    this.priorTotal = data.totalScore || 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.cameras.main.fadeIn(450, 10, 10, 15);
    this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);

    this.add.text(w / 2, 60, I18n.t('result.header', { day: this.day }), {
      fontFamily: 'serif', fontSize: '22px', color: '#e8b96a',
    }).setOrigin(0.5);

    const outcome = this.caught ? 'caught' : 'missed';
    const mom = getMomLine(this.day, outcome);

    // Play recorded mom voice if loaded; otherwise silence — the on-screen line reads.
    // Track the sound instance so SPACE can interrupt it instead of letting
    // the clip drag past the player's patience (esp. day-5 missed line).
    const voiceKey = `mom-d${this.day}-${outcome}`;
    this.momVoice = null;
    if (this.cache.audio.exists(voiceKey)) {
      this.momVoice = this.sound.add(voiceKey, { volume: 0.9 });
      this.momVoice.play();
    }

    // Pick the painted mom portrait keyed to outcome + day.
    let portraitKey = null;
    if (!this.caught) {
      portraitKey = 'mom-angry';
    } else if (this.day >= 4) {
      portraitKey = 'mom-proud';
    } else {
      portraitKey = 'mom-satisfied';
    }
    const hasPortrait = portraitKey && this.textures.exists(portraitKey);

    if (hasPortrait) {
      this.add.image(100, 170, portraitKey).setDisplaySize(140, 214).setOrigin(0.5);
      this.add.text(w / 2 + 50, 170, mom, {
        fontFamily: 'serif', fontSize: '18px', color: '#e8dccb', fontStyle: 'italic',
        align: 'left', wordWrap: { width: w - 280 },
      }).setOrigin(0.5);
    } else {
      this.add.text(w / 2, 130, mom, {
        fontFamily: 'serif', fontSize: '18px', color: '#e8dccb', fontStyle: 'italic',
        align: 'center', wordWrap: { width: w - 120 },
      }).setOrigin(0.5);
    }

    // Score breakdown
    const slackScore = this.slackPoints * 5;
    const bagScore = this.bagsHit * 100;
    const fullClearBonus = this.bagsHit >= this.bagCount ? 100 : 0;
    const missedPenalty = this.caught ? 0 : -75;
    const forcedPenalty = this.forcedExit ? -50 : 0;
    const dayTotal = slackScore + bagScore + fullClearBonus + missedPenalty + forcedPenalty;
    this.runningTotal = this.priorTotal + dayTotal;

    const lines = [
      I18n.t('result.slack', { n: this.slackPoints, s: slackScore }),
      I18n.t('result.bags',  { h: this.bagsHit, t: this.bagCount, s: bagScore }),
      fullClearBonus ? I18n.t('result.full_clear', { s: fullClearBonus }) : null,
      missedPenalty  ? I18n.t('result.missed',     { s: missedPenalty }) : null,
      forcedPenalty  ? I18n.t('result.forced',     { s: forcedPenalty }) : null,
      ``,
      I18n.t('result.day_total',  { d: this.day, s: dayTotal }),
      I18n.t('result.week_total', { s: this.runningTotal }),
    ].filter(Boolean);

    this.add.text(w / 2, h / 2 + 30, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaa',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5, 0);

    const nextLabel = I18n.t(this.day >= TOTAL_DAYS ? 'result.next_depot' : 'result.next_day');
    const prompt = this.add.text(w / 2, h - 40, nextLabel, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      // Cut the mom voice off — pressing SPACE here means the player has
      // read the line and is ready to move on. Letting the clip continue
      // (esp. the long day-5 missed line) feels punishing.
      if (this.momVoice && this.momVoice.isPlaying) this.momVoice.stop();
      this.cameras.main.fadeOut(400, 10, 10, 15);
      this.time.delayedCall(430, () => {
        if (this.day >= TOTAL_DAYS) {
          const failed = this.runningTotal < ENDING_THRESHOLD;
          this.scene.start(SCENES.ENDING, { totalScore: this.runningTotal, failed });
        } else {
          this.scene.start(SCENES.APARTMENT, { day: this.day + 1, totalScore: this.runningTotal });
        }
      });
    });

    // Belt-and-braces: also stop the voice if the scene is shut down for any
    // other reason (HMR, scene jump from elsewhere).
    this.events.once('shutdown', () => {
      if (this.momVoice && this.momVoice.isPlaying) this.momVoice.stop();
    });
  }
}
