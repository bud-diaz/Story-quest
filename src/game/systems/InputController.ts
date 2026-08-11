import Phaser from 'phaser';
import type { NpcSprite } from '@/game/entities/NpcSprite';
import type { InteractableZone } from '@/game/entities/InteractableZone';
import type { PlayerAvatar } from '@/game/entities/PlayerAvatar';
import { useGameStore } from '@/state/gameStore';
import { selectIsInputLocked } from '@/state/selectors';
import { virtualInput } from '@/state/virtualInput';
import { INTERACT_RADIUS } from '@/game/worldConstants';

const MOVE_SPEED = 180;

export type InteractTarget = { type: 'npc'; sprite: NpcSprite } | { type: 'zone'; zone: InteractableZone };

/** Keyboard + touch movement, and proximity-based "nearest interactable" targeting. */
export class InputController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keyW: Phaser.Input.Keyboard.Key;
  private readonly keyA: Phaser.Input.Keyboard.Key;
  private readonly keyS: Phaser.Input.Keyboard.Key;
  private readonly keyD: Phaser.Input.Keyboard.Key;
  private readonly interactKey: Phaser.Input.Keyboard.Key;
  private readonly indicator: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    private readonly player: PlayerAvatar,
    private readonly npcs: NpcSprite[],
    private readonly zones: InteractableZone[],
    private readonly onInteract: (target: InteractTarget) => void,
  ) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input plugin is not available in this scene.');
    this.cursors = keyboard.createCursorKeys();
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.indicator = scene.add
      .text(0, 0, '!', { fontSize: '16px', color: '#ffffff', backgroundColor: '#c0392b', padding: { x: 6, y: 2 } })
      .setOrigin(0.5, 1)
      .setDepth(1000)
      .setVisible(false);
  }

  update(): void {
    const touchInteract = virtualInput.consumeInteract();
    const locked = selectIsInputLocked(useGameStore.getState());
    const nearest = this.findNearestTarget();
    this.updateIndicator(nearest);

    if (locked) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.applyMovement();

    const interactPressed = Phaser.Input.Keyboard.JustDown(this.interactKey) || touchInteract;
    if (interactPressed && nearest) {
      this.onInteract(nearest);
    }
  }

  private applyMovement(): void {
    const v = virtualInput.get();
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keyA.isDown || v.left) vx -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown || v.right) vx += 1;
    if (this.cursors.up.isDown || this.keyW.isDown || v.up) vy -= 1;
    if (this.cursors.down.isDown || this.keyS.isDown || v.down) vy += 1;

    const length = Math.hypot(vx, vy) || 1;
    this.player.setVelocity((vx / length) * MOVE_SPEED, (vy / length) * MOVE_SPEED);
  }

  private updateIndicator(target: InteractTarget | null): void {
    if (!target) {
      this.indicator.setVisible(false);
      return;
    }
    const pos = target.type === 'npc' ? target.sprite : target.zone;
    this.indicator.setPosition(pos.x, pos.y - 48).setVisible(true);
  }

  private findNearestTarget(): InteractTarget | null {
    let best: InteractTarget | null = null;
    let bestDistance = INTERACT_RADIUS;

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { type: 'npc', sprite: npc };
      }
    }
    for (const zone of this.zones) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { type: 'zone', zone };
      }
    }
    return best;
  }
}
