import type { TraitState } from './traits';
import type { FlagState } from './flags';
import type { InventoryState } from './inventory';
import type { QuestProgress } from './quest';
import type { AvatarState } from './avatar';
import type { CompanionState } from './companion';
import type { ContentPack } from './contentPack';

/**
 * The plain-data slice of GameState that engine/ systems evaluate
 * Conditions and apply Effects against. Deliberately does not include
 * UI-only fields (activeModal, isInputLocked) — those live only in the
 * state/ store, never in engine/.
 */
export interface GameStateSnapshot {
  traits: TraitState;
  flags: FlagState;
  inventory: InventoryState;
  quests: Record<string, QuestProgress>;
  avatar: AvatarState;
  companions: CompanionState;
}

/** Conditions that reference quest/companion data need the content pack too. */
export interface EvaluationContext {
  snapshot: GameStateSnapshot;
  content: ContentPack;
}
