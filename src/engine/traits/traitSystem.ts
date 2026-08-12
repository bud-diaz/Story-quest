/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import { TRAIT_MAX, TRAIT_MIN, type TraitId, type TraitState } from '@/types';

export function applyTraitDelta(state: TraitState, trait: TraitId, delta: number): TraitState {
  const next = state[trait] + delta;
  const clamped = Math.min(TRAIT_MAX, Math.max(TRAIT_MIN, next));
  if (clamped === state[trait]) return state;
  return { ...state, [trait]: clamped };
}
