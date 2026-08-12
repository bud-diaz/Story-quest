import { describe, expect, it } from 'vitest';
import { applyTraitDelta } from './traitSystem';
import { createInitialTraitState } from '@/types';

describe('applyTraitDelta', () => {
  it('increments a trait', () => {
    const state = applyTraitDelta(createInitialTraitState(), 'curious', 2);
    expect(state.curious).toBe(2);
  });

  it('clamps at TRAIT_MAX', () => {
    const state = applyTraitDelta(createInitialTraitState(), 'clever', 999);
    expect(state.clever).toBe(10);
  });

  it('clamps at TRAIT_MIN', () => {
    const state = applyTraitDelta(createInitialTraitState(), 'kind', -999);
    expect(state.kind).toBe(0);
  });

  it('returns the same reference when the value does not change', () => {
    const state = createInitialTraitState();
    expect(applyTraitDelta(state, 'brave', 0)).toBe(state);
  });
});
