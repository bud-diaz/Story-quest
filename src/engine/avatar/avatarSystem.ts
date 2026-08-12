/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * No XP bars: the avatar's appearance is the only feedback loop for player
 * choices. checkForNewUnlocks() is run by the store after every
 * applyEffects() call so cosmetics unlock and auto-equip themselves purely
 * from world state, with no per-event special-casing in content.
 */
import type { AvatarState, CosmeticDefinition, EvaluationContext, GameStateSnapshot } from '@/types';
import { evaluateConditions } from '@/engine/conditions';

export function unlockCosmetic(state: AvatarState, cosmeticId: string): AvatarState {
  if (state.unlockedCosmetics.includes(cosmeticId)) return state;
  return { ...state, unlockedCosmetics: [...state.unlockedCosmetics, cosmeticId] };
}

export function equipCosmetic(
  state: AvatarState,
  def: Pick<CosmeticDefinition, 'id' | 'slot'>,
): AvatarState {
  return { ...state, equipped: { ...state.equipped, [def.slot]: def.id } };
}

export interface AvatarUnlockResult {
  avatar: AvatarState;
  newlyUnlocked: string[];
}

export function checkForNewUnlocks(
  snapshot: GameStateSnapshot,
  cosmetics: Record<string, CosmeticDefinition>,
  ctx: EvaluationContext,
): AvatarUnlockResult {
  let avatar = snapshot.avatar;
  const newlyUnlocked: string[] = [];
  for (const def of Object.values(cosmetics)) {
    if (avatar.unlockedCosmetics.includes(def.id)) continue;
    if (!evaluateConditions(def.unlockConditions, { ...ctx, snapshot: { ...snapshot, avatar } })) continue;
    avatar = unlockCosmetic(avatar, def.id);
    if (def.autoEquip) avatar = equipCosmetic(avatar, def);
    newlyUnlocked.push(def.id);
  }
  return { avatar, newlyUnlocked };
}
