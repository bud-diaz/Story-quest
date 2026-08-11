import Phaser from 'phaser';
import type { SceneInteractable, SceneSignpost } from '@/types';
import { TEXTURE_KEYS } from '@/game/gfx/textureKeys';

export type InteractableSource =
  | { kind: 'signpost'; data: SceneSignpost }
  | { kind: SceneInteractable['type']; data: SceneInteractable };

/** A world marker for a signpost / bridge / gate / companion gate / challenge trigger from scene JSON. */
export class InteractableZone extends Phaser.GameObjects.Container {
  readonly source: InteractableSource;
  private readonly visual: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, source: InteractableSource) {
    super(scene, source.data.x, source.data.y);
    this.source = source;
    scene.add.existing(this);

    this.visual = scene.add.image(0, 0, this.initialTextureKey(source));
    this.visual.setOrigin(0.5, source.kind === 'signpost' || source.kind === 'challenge' ? 1 : 0.5);
    this.add(this.visual);
  }

  private initialTextureKey(source: InteractableSource): string {
    switch (source.kind) {
      case 'signpost':
        return source.data.locked ? TEXTURE_KEYS.signpostLocked : TEXTURE_KEYS.signpostUnlocked;
      case 'challenge':
        return TEXTURE_KEYS.signpostUnlocked;
      case 'bridge':
        return TEXTURE_KEYS.bridgeBroken;
      case 'gate':
        return TEXTURE_KEYS.caveClosed;
      case 'companionGate':
        return TEXTURE_KEYS.riverClosed;
    }
  }

  /** Swaps the world texture to reflect flag/companion state — called by SceneStateSync. */
  setUnlockedVisual(unlocked: boolean): void {
    if (this.source.kind === 'bridge') {
      this.visual.setTexture(unlocked ? TEXTURE_KEYS.bridgeFixed : TEXTURE_KEYS.bridgeBroken);
    } else if (this.source.kind === 'gate') {
      this.visual.setTexture(unlocked ? TEXTURE_KEYS.caveOpen : TEXTURE_KEYS.caveClosed);
    } else if (this.source.kind === 'companionGate') {
      this.visual.setTexture(unlocked ? TEXTURE_KEYS.riverOpen : TEXTURE_KEYS.riverClosed);
    }
  }
}
