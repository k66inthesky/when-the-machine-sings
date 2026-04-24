import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Chiptune from '../systems/Chiptune.js';

// Two-slide cultural primer before Day 1. Jam judges from outside Taiwan
// need the context that the sanitation truck literally plays Für Elise
// every evening and neighbours chase it on foot. Without this, the gameplay
// reads as abstract; with it, the whole loop lands.
const SLIDES = [
  {
    en: [
      'In Taiwan, the garbage trucks sing.',
      'Every evening, they play "Für Elise" through rooftop speakers',
      'as they crawl through the alleys.',
    ],
    zh: [
      '在台灣，垃圾車會唱歌。',
      '每天傍晚，它們一邊在巷子裡慢慢開，',
      '一邊從車頂喇叭播〈給愛麗絲〉。',
    ],
  },
  {
    en: [
      'You have to meet them on the street,',
      'bag in hand, before the music fades.',
      '',
      'Miss it, and your mother will not let you forget.',
    ],
    zh: [
      '你必須拎著垃圾袋在巷口等，',
      '在音樂消失前把袋子交上去。',
      '',
      '錯過了 — 媽媽不會讓你忘記這件事。',
    ],
  },
];

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENES.INTRO);
  }

  create() {
    this.slideIndex = 0;
    this.cameras.main.fadeIn(600, 5, 5, 10);
    this.bg = null;
    // Keep the title's Für Elise going across the primer — the motif
    // carrying through the cultural context reinforces that the melody
    // *is* the ritual. Slightly softer than title so text reads calmer.
    this.chiptune = new Chiptune(this, { volume: 0.11 });
    this.chiptune.start();
    this.showSlide();
  }

  showSlide() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.children.removeAll();

    // Soft painted backdrop — alley for slide 1, apartment hint for slide 2.
    const bgKey = this.slideIndex === 0 ? 'bg-alley-clear' : 'bg-apartment';
    if (this.textures.exists(bgKey)) {
      this.add.image(w / 2, h / 2, bgKey).setDisplaySize(w, h);
      this.add.rectangle(0, 0, w, h, 0x050510, 0.62).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    const slide = SLIDES[this.slideIndex];

    const en = this.add.text(w / 2, h / 2 - 50, slide.en.join('\n'), {
      fontFamily: 'serif', fontSize: '20px', color: '#e8dccb', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    const zh = this.add.text(w / 2, h / 2 + 60, slide.zh.join('\n'), {
      fontFamily: 'serif', fontSize: '16px', color: '#aaa9a0', fontStyle: 'italic',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: en, alpha: 1, duration: 700 });
    this.tweens.add({ targets: zh, alpha: 1, duration: 700, delay: 250 });

    const prompt = this.add.text(w / 2, h - 36,
      this.slideIndex === SLIDES.length - 1 ? '[ SPACE — begin Day 1 ]' : '[ SPACE — continue ]', {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
      }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.slideIndex += 1;
      if (this.slideIndex >= SLIDES.length) {
        this.cameras.main.fadeOut(500, 5, 5, 10);
        this.time.delayedCall(520, () => this.scene.start(SCENES.APARTMENT, { day: 1, totalScore: 0 }));
      } else {
        this.showSlide();
      }
    });
    this.input.keyboard.once('keydown-ESC', () => {
      this.cameras.main.fadeOut(300, 5, 5, 10);
      this.time.delayedCall(320, () => this.scene.start(SCENES.APARTMENT, { day: 1, totalScore: 0 }));
    });
  }
}
