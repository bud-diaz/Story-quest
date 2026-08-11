/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { CompanionState } from '@/types';

export function recruitCompanion(state: CompanionState, companionId: string): CompanionState {
  if (state.recruited.includes(companionId)) {
    return state.active ? state : { ...state, active: companionId };
  }
  return { recruited: [...state.recruited, companionId], active: companionId };
}

export function setActiveCompanion(state: CompanionState, companionId: string): CompanionState {
  if (!state.recruited.includes(companionId)) return state;
  return { ...state, active: companionId };
}
