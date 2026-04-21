import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const ACTS = [
  {
    title: 'Act I — The Machine Goes Home',
    text: [
      'After the last stop, you follow the truck.',
      'The cleaner has been on this route for thirty years.',
      'He knows which grandma waits where, which bag is heavier than it looks.',
    ],
  },
  {
    title: 'Act II — Taipei, July 2024',
    text: [
      'A rice cooker was found, intact, in the recycling.',
      'The cleaner gave it to an elderly scavenger he knew.',
      'Residual value: NT$32.56 — about one US dollar.',
      '',
      '"I just wanted her days to be a little easier."',
      '— the cleaner, 30 years on the job',
      '',
      'December 2025. Court verdict:',
      'Three months, suspended for two years.',
    ],
  },
  {
    title: 'Act III — And Yet',
    text: [
      'Ministry of Justice began drafting amendments.',
      'The Supreme Prosecutor issued a notice:',
      '"Weigh the law, the reason, and the heart."',
      '',
      'He is still on the route this morning.',
      'The machine is still singing.',
      '',
      'Thank them.',
    ],
  },
  {
    title: 'Credits',
    text: [
      'A game by k66 — Gamedev.js Jam 2026',
      'Theme: Machines',
      '',
      'Music inspired by "Für Elise" — Ludwig van Beethoven',
      'Narrative drawn from Taiwan case coverage, 2024–2025',
      '',
      'Made with Phaser 3, Vite, WebAudio, and a lot of coffee.',
      '獻給所有在傍晚跑過巷子的人。',
    ],
  },
];

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ENDING);
  }

  init(data) {
    this.totalScore = data?.totalScore || 0;
    // Week's done — clear the resume slot.
    try { localStorage.removeItem('wtms_progress'); } catch (_) {}
  }

  create() {
    this.actIndex = 0;
    this.cameras.main.fadeIn(700, 5, 5, 10);
    if (this.cache.audio.exists('bgm-ending')) {
      this.endingBgm = this.sound.add('bgm-ending', { loop: true, volume: 0.6 });
      this.endingBgm.play();
    }
    this.showAct();
    this.events.once('shutdown', () => {
      if (this.endingBgm && this.endingBgm.isPlaying) this.endingBgm.stop();
    });
  }

  showAct() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.children.removeAll();
    if (this.textures.exists('bg-yard-ending')) {
      this.add.image(w / 2, h / 2, 'bg-yard-ending').setDisplaySize(w, h);
      // Heavy darken so text stays legible over the painted scene.
      this.add.rectangle(0, 0, w, h, 0x0a0a0f, 0.55).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    const act = ACTS[this.actIndex];

    this.add.text(w / 2, 60, act.title, {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#e8b96a',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const body = act.text.join('\n');
    this.add.text(w / 2, h / 2, body, {
      fontFamily: 'serif',
      fontSize: '17px',
      color: '#e8dccb',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    const isLast = this.actIndex === ACTS.length - 1;
    if (isLast) {
      const best = this.persistHighScore(this.totalScore);
      const grade = this.gradeWeek(this.totalScore);
      const line = best > this.totalScore
        ? `Your week: ${this.totalScore}   •   Best: ${best}`
        : `Your week: ${this.totalScore}   •   New best!`;
      this.add.text(w / 2, h - 90, `${grade[0]}   ·   ${grade[1]}`, {
        fontFamily: 'serif', fontSize: '14px', color: '#e8b96a', fontStyle: 'italic',
      }).setOrigin(0.5);
      this.add.text(w / 2, h - 72, line, {
        fontFamily: 'monospace', fontSize: '13px', color: '#e8b96a',
      }).setOrigin(0.5);
    }
    const prompt = this.add.text(
      w / 2,
      h - 40,
      isLast ? '[ SPACE to return to title ]' : '[ SPACE to continue ]',
      { fontFamily: 'sans-serif', fontSize: '14px', color: '#666' }
    ).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 5, 5, 10);
      this.time.delayedCall(520, () => {
        this.actIndex += 1;
        if (this.actIndex >= ACTS.length) {
          this.scene.start(SCENES.TITLE);
        } else {
          this.cameras.main.fadeIn(500, 5, 5, 10);
          this.showAct();
        }
      });
    });
  }

  gradeWeek(total) {
    if (total >= 900) return ['Perfect week', '滿分的一週'];
    if (total >= 600) return ['Good kid', '乖孩子'];
    if (total >= 300) return ['Got by', '勉強過關'];
    if (total >= 0) return ['The slack one', '廢柴青年'];
    return ['Disaster week', '慘淡的一週'];
  }

  persistHighScore(score) {
    try {
      const prev = parseInt(localStorage.getItem('wtms_best') || '0', 10) || 0;
      if (score > prev) {
        localStorage.setItem('wtms_best', String(score));
        return score;
      }
      return prev;
    } catch (_) {
      return score;
    }
  }
}
