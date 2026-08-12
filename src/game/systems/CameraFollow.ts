import type Phaser from 'phaser';
import type { PlayerAvatar } from '@/game/entities/PlayerAvatar';
import { WORLD_SIZE } from '@/game/worldConstants';

export function setupCameraFollow(scene: Phaser.Scene, player: PlayerAvatar): void {
  scene.physics.world.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
  scene.cameras.main.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
  scene.cameras.main.startFollow(player, true, 0.12, 0.12);
}
