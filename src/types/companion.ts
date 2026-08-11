import type { Condition } from './conditionsEffects';

export type CompanionSpecies = 'fox' | 'turtle' | 'bird' | 'wolf' | 'frog';

/**
 * Companions "unlock different solutions": rather than gating content on a
 * specific companion id, content gates on an `unlocksInteractions` tag so
 * new companion species can be added later without touching existing gates.
 */
export interface CompanionDefinition {
  id: string;
  species: CompanionSpecies;
  name: string;
  description: string;
  recruitConditions?: Condition[];
  unlocksInteractions: string[];
}

export interface CompanionState {
  recruited: string[];
  active: string | null;
}

export function createInitialCompanionState(): CompanionState {
  return { recruited: [], active: null };
}
