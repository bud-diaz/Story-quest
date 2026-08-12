/**
 * Bakes every placeholder texture once, in BootScene.create(), using
 * Phaser's Graphics.generateTexture() — no external art files needed. Ids
 * for cosmetics/NPCs are pulled from the content pack directly, and their
 * colors are derived deterministically from the id string, so this scales
 * to new content-pack entries without code changes.
 */
import Phaser from 'phaser';
import type { AvatarSlot, ContentPack } from '@/types';
import { hexColorForId } from '@/utils/rng';
import { TEXTURE_KEYS } from './textureKeys';

function ensureTexture(scene: Phaser.Scene, key: string, draw: (g: Phaser.GameObjects.Graphics) => void, width: number, height: number): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

const PLAYER_SIZE = { width: 40, height: 56 };

function generatePlayerBody(scene: Phaser.Scene): void {
  ensureTexture(
    scene,
    TEXTURE_KEYS.playerBody,
    (g) => {
      g.fillStyle(0x3f6fb0, 1); // tunic
      g.fillRoundedRect(6, 22, 28, 30, 8);
      g.fillStyle(0xffd9a8, 1); // skin
      g.fillCircle(20, 14, 11);
      g.fillStyle(0x2c2c34, 1); // eyes
      g.fillCircle(16, 13, 1.6);
      g.fillCircle(24, 13, 1.6);
    },
    PLAYER_SIZE.width,
    PLAYER_SIZE.height,
  );
}

/** Cosmetic overlay textures share the player's canvas size so they align without extra offset math. */
function generateCosmeticTexture(scene: Phaser.Scene, key: string, slot: AvatarSlot, color: number): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      switch (slot) {
        case 'head':
          g.fillStyle(color, 1);
          g.fillEllipse(20, 6, 24, 12);
          g.fillRect(8, 4, 24, 6);
          break;
        case 'back':
          g.fillStyle(color, 0.9);
          g.fillTriangle(10, 22, 30, 22, 20, 52);
          break;
        case 'aura':
          g.lineStyle(3, color, 0.85);
          g.strokeCircle(20, 30, 27);
          break;
        case 'body':
          g.fillStyle(color, 0.9);
          g.fillRoundedRect(6, 22, 28, 30, 8);
          break;
        case 'companionSlot':
          g.fillStyle(color, 1);
          g.fillCircle(34, 48, 6);
          break;
      }
    },
    PLAYER_SIZE.width,
    PLAYER_SIZE.height,
  );
}

function generateBeaverSprite(scene: Phaser.Scene, key: string, color: number): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(0x5b4630, 1); // flat tail
      g.fillEllipse(36, 34, 20, 12);
      g.fillStyle(color, 1); // body
      g.fillEllipse(24, 26, 40, 30);
      g.fillStyle(0xf0e4d0, 1); // belly
      g.fillEllipse(20, 32, 18, 14);
      g.fillStyle(0x2c2c34, 1); // eyes
      g.fillCircle(12, 18, 2.2);
      g.fillCircle(20, 15, 2.2);
      g.fillStyle(0xdb8a3a, 1); // teeth
      g.fillRect(9, 21, 5, 4);
    },
    56,
    44,
  );
}

function generateGroundTile(scene: Phaser.Scene, key: string, color: number, lineColor: number): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(color, 1);
      g.fillRect(0, 0, 64, 64);
      g.lineStyle(1, lineColor, 0.25);
      g.strokeRect(0, 0, 64, 64);
    },
    64,
    64,
  );
}

function generateTuft(scene: Phaser.Scene, key: string, color: number): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(color, 1);
      g.fillEllipse(9, 6, 18, 11);
    },
    18,
    12,
  );
}

function generateBridge(scene: Phaser.Scene, key: string, broken: boolean): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      const plankColor = broken ? 0x8a6a4a : 0xa9784f;
      g.fillStyle(0x6b5638, 1); // rails
      g.fillRect(0, 4, 140, 6);
      g.fillRect(0, 38, 140, 6);
      const plankWidth = 16;
      const gapStart = broken ? 55 : 200;
      const gapEnd = broken ? 90 : 200;
      for (let x = 4; x < 140 - plankWidth; x += plankWidth + 2) {
        if (x + plankWidth > gapStart && x < gapEnd) continue;
        g.fillStyle(plankColor, 1);
        g.fillRoundedRect(x, 10, plankWidth, 28, 3);
      }
    },
    140,
    48,
  );
}

function generateSignpost(scene: Phaser.Scene, key: string, locked: boolean): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(0x6b5638, 1); // post
      g.fillRect(13, 16, 6, 28);
      g.fillStyle(locked ? 0x8a8578 : 0x6fae52, 1); // board
      g.fillRoundedRect(0, 0, 32, 20, 4);
      g.lineStyle(2, 0x3f382a, 0.6);
      g.strokeRoundedRect(0, 0, 32, 20, 4);
    },
    32,
    44,
  );
}

function generateCave(scene: Phaser.Scene, key: string, open: boolean): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(0x5a5a63, 1); // rock arch
      g.fillEllipse(30, 30, 60, 56);
      g.fillStyle(open ? 0x14141a : 0x3a3a42, 1); // opening
      g.fillEllipse(30, 34, 34, 34);
    },
    60,
    56,
  );
}

function generateRiverGate(scene: Phaser.Scene, key: string, open: boolean): void {
  ensureTexture(
    scene,
    key,
    (g) => {
      g.fillStyle(0x4a90c4, 1);
      g.fillRect(0, 0, 100, 40);
      g.fillStyle(0x6cb3e0, 0.7);
      for (let x = 4; x < 100; x += 14) g.fillEllipse(x, 20, 10, 6);
      if (!open) {
        g.fillStyle(0x6b5638, 1);
        g.fillRect(10, 6, 8, 28);
        g.fillRect(40, 6, 8, 28);
        g.fillRect(70, 6, 8, 28);
      }
    },
    100,
    40,
  );
}

export function generateAllTextures(scene: Phaser.Scene, content: ContentPack): void {
  generatePlayerBody(scene);
  generateGroundTile(scene, TEXTURE_KEYS.groundHub, 0x9ccb6a, 0x6fae52);
  generateGroundTile(scene, TEXTURE_KEYS.groundForest, 0x6fae52, 0x4f8a3a);
  generateTuft(scene, TEXTURE_KEYS.treeTuft, 0x3c7a3c);
  generateTuft(scene, TEXTURE_KEYS.grassTuft, 0x88c060);
  generateBridge(scene, TEXTURE_KEYS.bridgeBroken, true);
  generateBridge(scene, TEXTURE_KEYS.bridgeFixed, false);
  generateSignpost(scene, TEXTURE_KEYS.signpostUnlocked, false);
  generateSignpost(scene, TEXTURE_KEYS.signpostLocked, true);
  generateCave(scene, TEXTURE_KEYS.caveClosed, false);
  generateCave(scene, TEXTURE_KEYS.caveOpen, true);
  generateRiverGate(scene, TEXTURE_KEYS.riverClosed, false);
  generateRiverGate(scene, TEXTURE_KEYS.riverOpen, true);

  for (const npc of Object.values(content.npcs)) {
    generateBeaverSprite(scene, npc.spriteTextureKey, hexColorForId(npc.id, 35, 38));
  }
  for (const cosmetic of Object.values(content.cosmetics)) {
    generateCosmeticTexture(scene, cosmetic.textureKey, cosmetic.slot, hexColorForId(cosmetic.id));
  }
}
