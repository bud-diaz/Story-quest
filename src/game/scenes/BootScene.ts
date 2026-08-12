import Phaser from 'phaser';
import { generateAllTextures } from '@/game/gfx/textureFactory';
import { content, useGameStore } from '@/state/gameStore';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    generateAllTextures(this, content);
    this.scene.start(useGameStore.getState().position.sceneId);
  }
}
