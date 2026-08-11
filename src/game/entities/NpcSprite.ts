import Phaser from 'phaser';
import type { NpcDefinition } from '@/types';

export class NpcSprite extends Phaser.GameObjects.Container {
  readonly npcId: string;

  constructor(scene: Phaser.Scene, def: NpcDefinition) {
    super(scene, def.spawnPoint.x, def.spawnPoint.y);
    this.npcId = def.id;
    scene.add.existing(this);

    const image = scene.add.image(0, 0, def.spriteTextureKey).setOrigin(0.5, 1);
    this.add(image);

    const label = scene.add
      .text(0, -image.displayHeight - 6, def.name, {
        fontSize: '12px',
        color: '#2c2c34',
        backgroundColor: '#ffffffcc',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1);
    this.add(label);
  }
}
