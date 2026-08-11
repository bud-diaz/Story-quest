import type { Condition } from './conditionsEffects';

export type AvatarSlot = 'head' | 'body' | 'back' | 'aura' | 'companionSlot';

/**
 * No XP bars — the avatar's appearance is the only feedback for how a
 * player has played. Cosmetics unlock automatically once their
 * unlockConditions are met (see avatarSystem.checkForNewUnlocks) and
 * optionally auto-equip themselves into their slot.
 */
export interface CosmeticDefinition {
  id: string;
  slot: AvatarSlot;
  name: string;
  description: string;
  unlockConditions: Condition[];
  autoEquip?: boolean;
  textureKey: string;
}

export interface AvatarState {
  unlockedCosmetics: string[];
  equipped: Partial<Record<AvatarSlot, string>>;
}

export function createInitialAvatarState(): AvatarState {
  return { unlockedCosmetics: [], equipped: {} };
}
