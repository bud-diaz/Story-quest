import { describe, expect, it } from 'vitest';
import { recruitCompanion, setActiveCompanion } from './companionSystem';
import type { CompanionState } from '@/types';

describe('companionSystem', () => {
  it('recruiting a new companion adds it and makes it active', () => {
    const state: CompanionState = { recruited: [], active: null };
    const next = recruitCompanion(state, 'turtle-tumble');
    expect(next).toEqual({ recruited: ['turtle-tumble'], active: 'turtle-tumble' });
  });

  it('recruiting an already-recruited companion does not duplicate it', () => {
    const state: CompanionState = { recruited: ['turtle-tumble'], active: 'turtle-tumble' };
    const next = recruitCompanion(state, 'turtle-tumble');
    expect(next.recruited).toEqual(['turtle-tumble']);
  });

  it('setActiveCompanion only switches to an already-recruited companion', () => {
    const state: CompanionState = { recruited: ['turtle-tumble'], active: null };
    expect(setActiveCompanion(state, 'fox-scout')).toBe(state);
    expect(setActiveCompanion(state, 'turtle-tumble').active).toBe('turtle-tumble');
  });
});
