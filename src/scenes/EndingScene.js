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
];

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ENDING);
  }

  create() {
    this.actIndex = 0;
    this.showAct();
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
    const prompt = this.add.text(
      w / 2,
      h - 40,
      isLast ? '[ SPACE to return to title ]' : '[ SPACE to continue ]',
      { fontFamily: 'sans-serif', fontSize: '14px', color: '#666' }
    ).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.actIndex += 1;
      if (this.actIndex >= ACTS.length) {
        this.scene.start(SCENES.TITLE);
      } else {
        this.showAct();
      }
    });
  }
}
