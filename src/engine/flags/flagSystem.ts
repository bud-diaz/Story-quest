/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { FlagState, FlagValue } from '@/types';

export function applyFlagOp(
  state: FlagState,
  flag: string,
  op: 'set' | 'increment' | 'toggle',
  value?: FlagValue,
): FlagState {
  switch (op) {
    case 'set':
      return { ...state, [flag]: value ?? true };
    case 'toggle':
      return { ...state, [flag]: !state[flag] };
    case 'increment': {
      const current = typeof state[flag] === 'number' ? (state[flag] as number) : 0;
      return { ...state, [flag]: current + (typeof value === 'number' ? value : 1) };
    }
  }
}
