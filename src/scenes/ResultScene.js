import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { getMomLine } from '../data/dialogue.js';
import { TOTAL_DAYS } from '../data/levels.js';

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
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);

    this.add.text(w / 2, 60, `Day ${this.day} — Result`, {
      fontFamily: 'serif', fontSize: '22px', color: '#e8b96a',
    }).setOrigin(0.5);

    const outcome = this.caught ? 'caught' : 'missed';
    const mom = getMomLine(this.day, outcome);

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
    const total = slackScore + bagScore + fullClearBonus + missedPenalty + forcedPenalty;

    const lines = [
      `Slack points : ${this.slackPoints} × 5 = ${slackScore}`,
      `Bags thrown  : ${this.bagsHit} / ${this.bagCount} × 100 = ${bagScore}`,
      fullClearBonus ? `Full clear bonus : +${fullClearBonus}` : null,
      missedPenalty ? `Missed the truck : ${missedPenalty}` : null,
      forcedPenalty ? `Ran out too late : ${forcedPenalty}` : null,
      ``,
      `Total : ${total}`,
    ].filter(Boolean);

    this.add.text(w / 2, h / 2 + 30, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaa',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5, 0);

    const nextLabel = this.day >= TOTAL_DAYS ? '[ SPACE — continue to the depot ]' : '[ SPACE — next day ]';
    const prompt = this.add.text(w / 2, h - 40, nextLabel, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      if (this.day >= TOTAL_DAYS) {
        this.scene.start(SCENES.ENDING);
      } else {
        this.scene.start(SCENES.APARTMENT, { day: this.day + 1 });
      }
    });
  }
}
