import { describe, expect, it } from 'vitest';
import { getVisibleOptions, resolveBranchOption } from './branchEngine';
import { createCtx } from '../../../test/fixtures';
import type { BranchPoint } from '@/types';

const bridgeFork: BranchPoint = {
  id: 'bridge-fork',
  prompt: 'What now?',
  options: [
    { id: 'cross-bridge', label: 'Cross', effects: [{ type: 'trait', trait: 'brave', delta: 1 }] },
    { id: 'explore-cave', label: 'Explore', effects: [{ type: 'trait', trait: 'curious', delta: 1 }] },
  ],
};

describe('branchEngine', () => {
  it('lists all options when none are conditional', () => {
    expect(getVisibleOptions(bridgeFork, createCtx()).map((o) => o.id)).toEqual(['cross-bridge', 'explore-cave']);
  });

  it('resolveBranchOption appends a branch-flag effect recording the choice', () => {
    const resolved = resolveBranchOption(bridgeFork, 'cross-bridge');
    expect(resolved?.option.id).toBe('cross-bridge');
    expect(resolved?.effects).toEqual([
      { type: 'trait', trait: 'brave', delta: 1 },
      { type: 'flag', flag: 'branch:bridge-fork', op: 'set', value: 'cross-bridge' },
    ]);
  });

  it('returns undefined for an unknown option id', () => {
    expect(resolveBranchOption(bridgeFork, 'nope')).toBeUndefined();
  });
});
