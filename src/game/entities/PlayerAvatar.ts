import Phaser from 'phaser';
import type { AvatarSlot, AvatarState, CosmeticDefinition } from '@/types';
import { TEXTURE_KEYS } from '@/game/gfx/textureKeys';

/** Back-to-front draw order for cosmetic overlay layers. */
const SLOT_DRAW_ORDER: AvatarSlot[] = ['aura', 'back', 'body', 'head', 'companionSlot'];

export class PlayerAvatar extends Phaser.GameObjects.Container {
  private readonly bodyImage: Phaser.GameObjects.Image;
  private readonly slotImages: Partial<Record<AvatarSlot, Phaser.GameObjects.Image>> = {};

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.bodyImage = scene.add.image(0, 0, TEXTURE_KEYS.playerBody).setOrigin(0.5, 1);
    this.add(this.bodyImage);
    this.setSize(40, 56);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 20);
    body.setOffset(-12, -20);
    body.setCollideWorldBounds(true);
  }

  setVelocity(x: number, y: number): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(x, y);
  }

  /** Applies the avatar's current cosmetic loadout, driven entirely by store + content data. */
  setEquipped(equipped: AvatarState['equipped'], cosmetics: Record<string, CosmeticDefinition>): void {
    let changed = false;
    for (const slot of SLOT_DRAW_ORDER) {
      if (slot === 'body') continue; // the base body image is always present
      const cosmeticId = equipped[slot];
      const existing = this.slotImages[slot];
      const def = cosmeticId ? cosmetics[cosmeticId] : undefined;

      if (!def) {
        if (existing) {
          existing.destroy();
          delete this.slotImages[slot];
          changed = true;
        }
        continue;
      }
      if (existing?.texture.key === def.textureKey) continue;

      existing?.destroy();
      this.slotImages[slot] = this.scene.add.image(0, 0, def.textureKey).setOrigin(0.5, 1);
      changed = true;
    }
    if (changed) this.reorderChildren();
  }

  private reorderChildren(): void {
    this.removeAll(false);
    for (const slot of SLOT_DRAW_ORDER) {
      if (slot === 'body') {
        this.add(this.bodyImage);
        continue;
      }
      const image = this.slotImages[slot];
      if (image) this.add(image);
    }
  }
}
