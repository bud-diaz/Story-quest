import type { GameState } from './gameStore';
import type { GameStateSnapshot } from '@/types';

/** The plain-data slice engine/ Conditions and Effects operate on. */
export const selectSnapshot = (state: GameState): GameStateSnapshot => ({
  traits: state.traits,
  flags: state.flags,
  inventory: state.inventory,
  quests: state.quests,
  avatar: state.avatar,
  companions: state.companions,
});

/**
 * True while any modal (dialogue/challenge/branch) is open. Phaser's
 * InputController reads this directly off the store every frame instead
 * of listening for a separate "pause" event, so movement-lock can never
 * desync from what's actually on screen.
 */
export const selectIsInputLocked = (state: GameState): boolean => state.activeModal !== null;

export const selectActiveModal = (state: GameState) => state.activeModal;
export const selectPosition = (state: GameState) => state.position;
export const selectTraits = (state: GameState) => state.traits;
export const selectFlags = (state: GameState) => state.flags;
export const selectInventory = (state: GameState) => state.inventory;
export const selectAvatar = (state: GameState) => state.avatar;
export const selectCompanions = (state: GameState) => state.companions;
export const selectQuests = (state: GameState) => state.quests;
export const selectCurrentDialogue = (state: GameState) => state.currentDialogue;
