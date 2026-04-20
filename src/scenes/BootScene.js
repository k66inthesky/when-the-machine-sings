import Phaser from 'phaser';
import { SCENES } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    const el = document.getElementById('loading-fallback');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    this.scene.start(SCENES.PRELOAD);
  }
}
