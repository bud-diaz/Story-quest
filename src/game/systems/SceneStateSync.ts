import { content, useGameStore, type GameState } from '@/state/gameStore';
import type { PlayerAvatar } from '@/game/entities/PlayerAvatar';
import type { InteractableZone } from '@/game/entities/InteractableZone';

/**
 * The Phaser half of "persistent state change -> subscribe, diff, react."
 * Subscribes once per scene lifetime and reacts declaratively to flags and
 * avatar cosmetics — no bespoke event is fired per world reaction.
 */
export class SceneStateSync {
  private readonly unsubscribe: () => void;

  constructor(player: PlayerAvatar, zones: InteractableZone[]) {
    const apply = (state: GameState): void => {
      player.setEquipped(state.avatar.equipped, content.cosmetics);

      for (const zone of zones) {
        const { source } = zone;
        if (source.kind === 'bridge' || source.kind === 'gate') {
          const flag = source.data.unlockedByFlag;
          zone.setUnlockedVisual(flag ? Boolean(state.flags[flag]) : true);
        } else if (source.kind === 'companionGate') {
          const tag = source.data.requiresCompanionInteraction;
          const activeId = state.companions.active;
          const unlocked = Boolean(tag && activeId && content.companions[activeId]?.unlocksInteractions.includes(tag));
          zone.setUnlockedVisual(unlocked);
        }
      }
    };

    apply(useGameStore.getState());
    this.unsubscribe = useGameStore.subscribe(apply);
  }

  destroy(): void {
    this.unsubscribe();
  }
}
