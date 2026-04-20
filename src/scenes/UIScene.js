import Phaser from 'phaser';
import { SCENES } from '../config.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI, active: false });
  }

  create() {
    // Global HUD overlay — wired up in a later iteration.
  }
}
