import type { TraitId } from './traits';
import type { FlagValue } from './flags';

/**
 * Condition and Effect are the shared backbone reused by dialogue choices,
 * branch options, quest step completion, avatar cosmetic unlocks, and
 * companion recruitment. One evaluator (engine/conditions.ts) and one
 * applier (engine/effects.ts) back every one of those systems.
 */
export type CompareOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
export type FlagOp = 'eq' | 'neq' | 'truthy' | 'falsy';

export type Condition =
  | { type: 'trait'; trait: TraitId; op: CompareOp; value: number }
  | { type: 'flag'; flag: string; op: FlagOp; value?: FlagValue }
  | { type: 'item'; itemId: string; op: 'has' | 'lacks' | 'countGte'; value?: number }
  | { type: 'companion'; op: 'recruited' | 'active'; companionId?: string }
  | { type: 'companionUnlocks'; interactionTag: string }
  | { type: 'quest'; questId: string; op: 'completed' | 'active' | 'stepReached'; stepId?: string }
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

export type Effect =
  | { type: 'trait'; trait: TraitId; delta: number }
  | { type: 'flag'; flag: string; op: 'set' | 'increment' | 'toggle'; value?: FlagValue }
  | { type: 'item'; itemId: string; op: 'add' | 'remove'; quantity?: number }
  | { type: 'companion'; companionId: string; op: 'recruit' | 'setActive' }
  | { type: 'quest'; questId: string; op: 'start' | 'advance' | 'complete'; stepId?: string }
  | { type: 'avatar'; op: 'unlock' | 'equip'; cosmeticId: string };
