import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Playables from '../systems/Playables.js';
import I18n from '../systems/I18n.js';

// Ending acts live in strings.js (one title key + one body array key per act).
// The language toggle on TitleScene flips these in place — each act re-renders
// fresh on onChange, so mid-ending language swaps work too.
const ACT_KEYS = [
  { title: 'ending.act1.title',    body: 'ending.act1.body' },
  { title: 'ending.act2.title',    body: 'ending.act2.body' },
  { title: 'ending.act3.title',    body: 'ending.act3.body' },
  { title: 'ending.credits.title', body: 'ending.credits.body' },
];

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ENDING);
  }

  init(data) {
    this.totalScore = data?.totalScore || 0;
    // Week's done — clear the resume slot.
    Playables.clearProgress();
  }

  create() {
    this.actIndex = 0;
    this.cameras.main.fadeIn(700, 5, 5, 10);
    if (this.cache.audio.exists('bgm-ending')) {
      this.endingBgm = this.sound.add('bgm-ending', { loop: true, volume: 0.6 });
      this.endingBgm.play();
    }
    this.showAct();
    this.unsubI18n = I18n.onChange(() => this.showAct());
    this.events.once('shutdown', () => {
      if (this.endingBgm && this.endingBgm.isPlaying) this.endingBgm.stop();
      if (this.unsubI18n) this.unsubI18n();
    });
  }

  showAct() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.children.removeAll();
    this.input.keyboard.removeAllListeners();

    if (this.textures.exists('bg-yard-ending')) {
      this.add.image(w / 2, h / 2, 'bg-yard-ending').setDisplaySize(w, h);
      // Heavy darken so text stays legible over the painted scene.
      this.add.rectangle(0, 0, w, h, 0x0a0a0f, 0.55).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    const act = ACT_KEYS[this.actIndex];

    this.add.text(w / 2, 60, I18n.t(act.title), {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#e8b96a',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const body = I18n.tArray(act.body).join('\n');
    this.add.text(w / 2, h / 2, body, {
      fontFamily: 'serif',
      fontSize: '17px',
      color: '#e8dccb',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    const isLast = this.actIndex === ACT_KEYS.length - 1;
    if (isLast) {
      const best = this.persistHighScore(this.totalScore);
      const gradeKey = this.gradeKey(this.totalScore);
      const line = best > this.totalScore
        ? I18n.t('ending.score_best',     { s: this.totalScore, b: best })
        : I18n.t('ending.score_new_best', { s: this.totalScore });
      this.add.text(w / 2, h - 90, I18n.t(gradeKey), {
        fontFamily: 'serif', fontSize: '14px', color: '#e8b96a', fontStyle: 'italic',
      }).setOrigin(0.5);
      this.add.text(w / 2, h - 72, line, {
        fontFamily: 'monospace', fontSize: '13px', color: '#e8b96a',
      }).setOrigin(0.5);
    }
    const prompt = this.add.text(
      w / 2,
      h - 40,
      I18n.t(isLast ? 'ending.prompt_return' : 'ending.prompt_continue'),
      { fontFamily: 'sans-serif', fontSize: '14px', color: '#666' }
    ).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 5, 5, 10);
      this.time.delayedCall(520, () => {
        this.actIndex += 1;
        if (this.actIndex >= ACT_KEYS.length) {
          this.scene.start(SCENES.TITLE);
        } else {
          this.cameras.main.fadeIn(500, 5, 5, 10);
          this.showAct();
        }
      });
    });
  }

  gradeKey(total) {
    if (total >= 900) return 'ending.grade_perfect';
    if (total >= 600) return 'ending.grade_good';
    if (total >= 300) return 'ending.grade_by';
    if (total >= 0)   return 'ending.grade_slack';
    return 'ending.grade_disaster';
  }

  persistHighScore(score) {
    // Playables.setBest compares against the cached value and only
    // writes if score is a new best. Both paths (YT cloud / localStorage)
    // are handled inside the adapter. YT certification requires score
    // sent via sendScore matches the best in save — so we mirror both.
    const prev = Playables.getBest();
    if (score > prev) {
      Playables.setBest(score);
      Playables.sendScore(score);
      return score;
    }
    // Still send the best-known score so YT's leaderboard is consistent
    // when the current run wasn't a new high.
    Playables.sendScore(prev);
    return prev;
  }
}
