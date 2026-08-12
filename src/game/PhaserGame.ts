import Phaser from 'phaser';
import { WORLD_SIZE } from './worldConstants';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { ForestScene } from './scenes/ForestScene';

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: WORLD_SIZE.width,
    height: WORLD_SIZE.height,
    backgroundColor: '#274b2b',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, HubScene, ForestScene],
  };
  return new Phaser.Game(config);
}
