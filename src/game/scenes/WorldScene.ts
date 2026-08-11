import Phaser from 'phaser';
import type { SceneDefinition } from '@/types';
import { content, useGameStore } from '@/state/gameStore';
import { selectSnapshot } from '@/state/selectors';
import { contentRegistry } from '@/engine/content/contentRegistry';
import { evaluateCondition } from '@/engine/conditions';
import { PlayerAvatar } from '@/game/entities/PlayerAvatar';
import { NpcSprite } from '@/game/entities/NpcSprite';
import { InteractableZone, type InteractableSource } from '@/game/entities/InteractableZone';
import { InputController, type InteractTarget } from '@/game/systems/InputController';
import { setupCameraFollow } from '@/game/systems/CameraFollow';
import { SceneStateSync } from '@/game/systems/SceneStateSync';
import { eventBus } from '@/state/eventBus';
import { WORLD_SIZE } from '@/game/worldConstants';
import { createSeededRng, hashString } from '@/utils/rng';

const DEFAULT_LOCKED_TEXT = 'It looks blocked for now.';

/**
 * Shared behavior for every explorable scene: spawn the player at the
 * store's current (or scene-default) position, place NPCs/signposts/
 * interactables straight from scene JSON, wire input + camera + world
 * reactivity, and dispatch interactions to the store. A new scene is just
 * a two-line subclass naming its content sceneId and ground/tuft textures.
 */
export abstract class WorldScene extends Phaser.Scene {
  private player!: PlayerAvatar;
  private inputController!: InputController;
  private sceneStateSync!: SceneStateSync;

  protected constructor(
    private readonly sceneId: string,
    private readonly groundTextureKey: string,
    private readonly tuftTextureKey: string,
  ) {
    super(sceneId);
  }

  create(): void {
    const sceneDef = contentRegistry.scene(content, this.sceneId);

    this.drawGround(sceneDef);

    const storePosition = useGameStore.getState().position;
    const fallbackSpawn = Object.values(sceneDef.spawnPoints)[0] ?? { x: WORLD_SIZE.width / 2, y: WORLD_SIZE.height / 2 };
    const spawn = storePosition.sceneId === this.sceneId ? { x: storePosition.x, y: storePosition.y } : fallbackSpawn;

    this.player = new PlayerAvatar(this, spawn.x, spawn.y);

    const npcSprites = (sceneDef.npcs ?? []).map((npcId) => new NpcSprite(this, contentRegistry.npc(content, npcId)));

    const zoneSources: InteractableSource[] = [
      ...(sceneDef.signposts ?? []).map((data) => ({ kind: 'signpost' as const, data })),
      ...(sceneDef.interactables ?? []).map((data) => ({ kind: data.type, data })),
    ];
    const zones = zoneSources.map((source) => new InteractableZone(this, source));

    this.inputController = new InputController(this, this.player, npcSprites, zones, (target) =>
      this.handleInteract(target),
    );
    setupCameraFollow(this, this.player);
    this.sceneStateSync = new SceneStateSync(this.player, zones);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.sceneStateSync.destroy());
  }

  update(): void {
    this.inputController.update();
  }

  private drawGround(sceneDef: SceneDefinition): void {
    this.add.tileSprite(0, 0, WORLD_SIZE.width, WORLD_SIZE.height, this.groundTextureKey).setOrigin(0, 0);
    const rng = createSeededRng(hashString(sceneDef.id));
    for (let i = 0; i < 40; i++) {
      const x = rng() * WORLD_SIZE.width;
      const y = rng() * WORLD_SIZE.height;
      this.add.image(x, y, this.tuftTextureKey).setDepth(-1).setAlpha(0.85);
    }
  }

  private handleInteract(target: InteractTarget): void {
    if (target.type === 'npc') {
      useGameStore.getState().openDialogueForNpc(target.sprite.npcId);
      return;
    }

    const { source } = target.zone;

    if (source.kind === 'signpost') {
      if (source.data.locked) {
        eventBus.emit('toast', { message: source.data.lockedText ?? DEFAULT_LOCKED_TEXT });
        return;
      }
      if (source.data.targetSceneId && source.data.targetSpawnPoint) {
        useGameStore.getState().travelToScene(source.data.targetSceneId, source.data.targetSpawnPoint);
        this.scene.start(source.data.targetSceneId);
      }
      return;
    }

    if (source.kind === 'challenge') {
      if (source.data.challengeId) useGameStore.getState().openChallenge(source.data.challengeId);
      return;
    }

    if (source.kind === 'bridge' || source.kind === 'gate') {
      const flag = source.data.unlockedByFlag;
      const unlocked = flag ? Boolean(useGameStore.getState().flags[flag]) : true;
      eventBus.emit('toast', {
        message: unlocked ? 'The way is clear!' : (source.data.lockedText ?? DEFAULT_LOCKED_TEXT),
      });
      return;
    }

    if (source.kind === 'companionGate') {
      const tag = source.data.requiresCompanionInteraction;
      const unlocked = tag
        ? evaluateCondition(
            { type: 'companionUnlocks', interactionTag: tag },
            { snapshot: selectSnapshot(useGameStore.getState()), content },
          )
        : false;
      eventBus.emit('toast', {
        message: unlocked ? 'Your companion helps you across!' : (source.data.lockedText ?? DEFAULT_LOCKED_TEXT),
      });
    }
  }
}
