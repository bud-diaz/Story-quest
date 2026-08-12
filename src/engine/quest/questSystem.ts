/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * reconcileQuests() runs after every applyEffects() call and auto-starts /
 * auto-advances quests purely from world state — content never needs to
 * manually call "advance quest" from a dialogue node or challenge.
 */
import {
  createInitialQuestProgress,
  type EvaluationContext,
  type GameStateSnapshot,
  type QuestDefinition,
  type QuestProgress,
} from '@/types';
import { evaluateCondition } from '@/engine/conditions';

export function reconcileQuests(
  snapshot: GameStateSnapshot,
  quests: Record<string, QuestDefinition>,
  ctx: EvaluationContext,
): Record<string, QuestProgress> {
  let progressMap = snapshot.quests;

  for (const def of Object.values(quests)) {
    const existed = def.id in progressMap;
    let progress = progressMap[def.id] ?? createInitialQuestProgress(def.id);
    const localSnapshot = { ...snapshot, quests: progressMap };
    const localCtx: EvaluationContext = { ...ctx, snapshot: localSnapshot };

    if (progress.status === 'not_started') {
      if (!def.startCondition || evaluateCondition(def.startCondition, localCtx)) {
        progress = { ...progress, status: 'active' };
      }
    }

    if (progress.status === 'active') {
      progress = advanceCompletedSteps(progress, def, localCtx);
      if (progress.currentStepIndex >= def.steps.length) {
        progress = { ...progress, status: 'completed' };
      }
    }

    // Don't materialize a not_started entry for a quest that hasn't begun —
    // keeps `snapshot.quests` limited to quests the player has actually met.
    if (existed || progress.status !== 'not_started') {
      progressMap = { ...progressMap, [def.id]: progress };
    }
  }

  return progressMap;
}

function advanceCompletedSteps(
  progress: QuestProgress,
  def: QuestDefinition,
  ctx: EvaluationContext,
): QuestProgress {
  let current = progress;
  // Advance through as many newly-completed consecutive steps as apply in one pass.
  while (current.currentStepIndex < def.steps.length) {
    const step = def.steps[current.currentStepIndex];
    if (!step || current.completedStepIds.includes(step.id)) break;
    if (!evaluateCondition(step.completionCondition, ctx)) break;
    current = {
      ...current,
      completedStepIds: [...current.completedStepIds, step.id],
      currentStepIndex: current.currentStepIndex + 1,
    };
  }
  return current;
}
