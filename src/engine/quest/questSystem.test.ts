import { describe, expect, it } from 'vitest';
import { reconcileQuests } from './questSystem';
import { createCtx, createEmptyContentPack, createEmptySnapshot } from '../../../test/fixtures';
import type { QuestDefinition } from '@/types';

const fixTheBridge: QuestDefinition = {
  id: 'fix-the-bridge',
  title: 'Fix the Forest Bridge',
  summary: '',
  startCondition: { type: 'flag', flag: 'metBenny', op: 'truthy' },
  steps: [
    { id: 'talk-to-benny', description: '', completionCondition: { type: 'flag', flag: 'metBenny', op: 'truthy' } },
    { id: 'solve-log-math', description: '', completionCondition: { type: 'flag', flag: 'bridgeFixed', op: 'truthy' } },
    { id: 'choose-path', description: '', completionCondition: { type: 'flag', flag: 'bridgeChoice', op: 'truthy' } },
  ],
};

describe('reconcileQuests', () => {
  it('does not start a quest whose startCondition is unmet', () => {
    const content = createEmptyContentPack({ quests: { 'fix-the-bridge': fixTheBridge } });
    const snapshot = createEmptySnapshot();
    const result = reconcileQuests(snapshot, content.quests, createCtx(snapshot, content));
    expect(result['fix-the-bridge']).toBeUndefined();
  });

  it('auto-starts and auto-advances through multiple newly-completed steps in one pass', () => {
    const content = createEmptyContentPack({ quests: { 'fix-the-bridge': fixTheBridge } });
    const snapshot = createEmptySnapshot({ flags: { metBenny: true, bridgeFixed: true } });
    const result = reconcileQuests(snapshot, content.quests, createCtx(snapshot, content));
    const progress = result['fix-the-bridge']!;
    expect(progress.status).toBe('active');
    expect(progress.completedStepIds).toEqual(['talk-to-benny', 'solve-log-math']);
    expect(progress.currentStepIndex).toBe(2);
  });

  it('completes the quest once every step is done', () => {
    const content = createEmptyContentPack({ quests: { 'fix-the-bridge': fixTheBridge } });
    const snapshot = createEmptySnapshot({
      flags: { metBenny: true, bridgeFixed: true, bridgeChoice: 'cross-bridge' },
    });
    const result = reconcileQuests(snapshot, content.quests, createCtx(snapshot, content));
    expect(result['fix-the-bridge']!.status).toBe('completed');
  });

  it('does not re-complete an already-completed step', () => {
    const content = createEmptyContentPack({ quests: { 'fix-the-bridge': fixTheBridge } });
    const snapshot = createEmptySnapshot({
      flags: { metBenny: true },
      quests: {
        'fix-the-bridge': { questId: 'fix-the-bridge', status: 'active', currentStepIndex: 1, completedStepIds: ['talk-to-benny'] },
      },
    });
    const result = reconcileQuests(snapshot, content.quests, createCtx(snapshot, content));
    expect(result['fix-the-bridge']!.completedStepIds).toEqual(['talk-to-benny']);
  });
});
