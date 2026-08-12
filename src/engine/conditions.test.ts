import { describe, expect, it } from 'vitest';
import { evaluateCondition, evaluateConditions } from './conditions';
import { createCtx, createEmptyContentPack, createEmptySnapshot } from '../../test/fixtures';
import type { Condition } from '@/types';

describe('evaluateCondition', () => {
  it('evaluates trait comparisons', () => {
    const ctx = createCtx(createEmptySnapshot({ traits: { brave: 3, curious: 0, kind: 0, clever: 0, creative: 0 } }));
    expect(evaluateCondition({ type: 'trait', trait: 'brave', op: 'gte', value: 3 }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'trait', trait: 'brave', op: 'gt', value: 3 }, ctx)).toBe(false);
    expect(evaluateCondition({ type: 'trait', trait: 'brave', op: 'lt', value: 4 }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'trait', trait: 'brave', op: 'eq', value: 3 }, ctx)).toBe(true);
  });

  it('evaluates flag truthy/falsy/eq/neq', () => {
    const ctx = createCtx(createEmptySnapshot({ flags: { metBenny: true, bridgeChoice: 'cross-bridge' } }));
    expect(evaluateCondition({ type: 'flag', flag: 'metBenny', op: 'truthy' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'flag', flag: 'unset', op: 'falsy' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'flag', flag: 'bridgeChoice', op: 'eq', value: 'cross-bridge' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'flag', flag: 'bridgeChoice', op: 'neq', value: 'explore-cave' }, ctx)).toBe(true);
  });

  it('evaluates item has/lacks/countGte', () => {
    const ctx = createCtx(createEmptySnapshot({ inventory: { stacks: [{ itemId: 'pebble', quantity: 2 }] } }));
    expect(evaluateCondition({ type: 'item', itemId: 'pebble', op: 'has' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'item', itemId: 'log', op: 'lacks' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'item', itemId: 'pebble', op: 'countGte', value: 2 }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'item', itemId: 'pebble', op: 'countGte', value: 3 }, ctx)).toBe(false);
  });

  it('evaluates companion recruited/active', () => {
    const ctx = createCtx(createEmptySnapshot({ companions: { recruited: ['turtle-tumble'], active: 'turtle-tumble' } }));
    expect(evaluateCondition({ type: 'companion', op: 'recruited', companionId: 'turtle-tumble' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'companion', op: 'active' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'companion', op: 'active', companionId: 'fox-scout' }, ctx)).toBe(false);
  });

  it('evaluates companionUnlocks against the active companion tag', () => {
    const content = createEmptyContentPack({
      companions: {
        'turtle-tumble': {
          id: 'turtle-tumble',
          species: 'turtle',
          name: 'Tumble',
          description: '',
          unlocksInteractions: ['river-shortcut'],
        },
      },
    });
    const snapshot = createEmptySnapshot({ companions: { recruited: ['turtle-tumble'], active: 'turtle-tumble' } });
    const ctx = createCtx(snapshot, content);
    expect(evaluateCondition({ type: 'companionUnlocks', interactionTag: 'river-shortcut' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'companionUnlocks', interactionTag: 'hidden-trail' }, ctx)).toBe(false);
  });

  it('evaluates quest completed/active/stepReached', () => {
    const content = createEmptyContentPack({
      quests: {
        'fix-the-bridge': {
          id: 'fix-the-bridge',
          title: '',
          summary: '',
          steps: [
            { id: 'talk-to-benny', description: '', completionCondition: { type: 'flag', flag: 'x', op: 'truthy' } },
            { id: 'solve-log-math', description: '', completionCondition: { type: 'flag', flag: 'y', op: 'truthy' } },
          ],
        },
      },
    });
    const snapshot = createEmptySnapshot({
      quests: {
        'fix-the-bridge': { questId: 'fix-the-bridge', status: 'active', currentStepIndex: 1, completedStepIds: ['talk-to-benny'] },
      },
    });
    const ctx = createCtx(snapshot, content);
    expect(evaluateCondition({ type: 'quest', questId: 'fix-the-bridge', op: 'active' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'quest', questId: 'fix-the-bridge', op: 'stepReached', stepId: 'talk-to-benny' }, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'quest', questId: 'fix-the-bridge', op: 'stepReached', stepId: 'solve-log-math' }, ctx)).toBe(false);
    expect(evaluateCondition({ type: 'quest', questId: 'unknown', op: 'completed' }, ctx)).toBe(false);
  });

  it('evaluates all/any/not composition', () => {
    const ctx = createCtx(createEmptySnapshot({ flags: { a: true, b: false } }));
    const all: Condition = {
      type: 'all',
      conditions: [
        { type: 'flag', flag: 'a', op: 'truthy' },
        { type: 'flag', flag: 'b', op: 'falsy' },
      ],
    };
    expect(evaluateCondition(all, ctx)).toBe(true);
    const any: Condition = {
      type: 'any',
      conditions: [
        { type: 'flag', flag: 'a', op: 'falsy' },
        { type: 'flag', flag: 'b', op: 'falsy' },
      ],
    };
    expect(evaluateCondition(any, ctx)).toBe(true);
    expect(evaluateCondition({ type: 'not', condition: { type: 'flag', flag: 'a', op: 'falsy' } }, ctx)).toBe(true);
  });

  it('evaluateConditions treats an empty/undefined list as always true', () => {
    const ctx = createCtx();
    expect(evaluateConditions(undefined, ctx)).toBe(true);
    expect(evaluateConditions([], ctx)).toBe(true);
  });
});
