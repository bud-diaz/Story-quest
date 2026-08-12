/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * applyEffects() is the one true mutation path for GameStateSnapshot. Every
 * system (dialogue, branches, challenges) funnels its rewards through this
 * function so a single effect list can touch traits, flags, items, quests,
 * companions, and avatar cosmetics uniformly.
 */
import type { ContentPack, Effect, GameStateSnapshot } from '@/types';
import { applyTraitDelta } from '@/engine/traits/traitSystem';
import { applyFlagOp } from '@/engine/flags/flagSystem';
import { addItem, removeItem } from '@/engine/inventory/inventorySystem';
import { recruitCompanion, setActiveCompanion } from '@/engine/companion/companionSystem';
import { unlockCosmetic, equipCosmetic } from '@/engine/avatar/avatarSystem';
import { createInitialQuestProgress } from '@/types';

export function applyEffect(
  snapshot: GameStateSnapshot,
  effect: Effect,
  content: ContentPack,
): GameStateSnapshot {
  switch (effect.type) {
    case 'trait':
      return { ...snapshot, traits: applyTraitDelta(snapshot.traits, effect.trait, effect.delta) };

    case 'flag':
      return { ...snapshot, flags: applyFlagOp(snapshot.flags, effect.flag, effect.op, effect.value) };

    case 'item': {
      const item = content.items[effect.itemId];
      if (!item) return snapshot;
      const quantity = effect.quantity ?? 1;
      const inventory =
        effect.op === 'add'
          ? addItem(snapshot.inventory, item, quantity)
          : removeItem(snapshot.inventory, effect.itemId, quantity);
      return { ...snapshot, inventory };
    }

    case 'companion': {
      const companions =
        effect.op === 'recruit'
          ? recruitCompanion(snapshot.companions, effect.companionId)
          : setActiveCompanion(snapshot.companions, effect.companionId);
      return { ...snapshot, companions };
    }

    case 'quest': {
      const existing = snapshot.quests[effect.questId] ?? createInitialQuestProgress(effect.questId);
      let progress = existing;
      if (effect.op === 'start' && progress.status === 'not_started') {
        progress = { ...progress, status: 'active' };
      } else if (effect.op === 'complete') {
        progress = { ...progress, status: 'completed' };
      } else if (effect.op === 'advance' && effect.stepId && !progress.completedStepIds.includes(effect.stepId)) {
        progress = {
          ...progress,
          completedStepIds: [...progress.completedStepIds, effect.stepId],
          currentStepIndex: progress.currentStepIndex + 1,
        };
      }
      return { ...snapshot, quests: { ...snapshot.quests, [effect.questId]: progress } };
    }

    case 'avatar': {
      const def = content.cosmetics[effect.cosmeticId];
      if (!def) return snapshot;
      const avatar =
        effect.op === 'unlock'
          ? unlockCosmetic(snapshot.avatar, effect.cosmeticId)
          : equipCosmetic(snapshot.avatar, def);
      return { ...snapshot, avatar };
    }
  }
}

export function applyEffects(
  snapshot: GameStateSnapshot,
  effects: Effect[],
  content: ContentPack,
): GameStateSnapshot {
  return effects.reduce((acc, effect) => applyEffect(acc, effect, content), snapshot);
}
