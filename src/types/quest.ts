import type { Condition } from './conditionsEffects';

export interface QuestStep {
  id: string;
  description: string;
  completionCondition: Condition;
}

export interface QuestDefinition {
  id: string;
  title: string;
  summary: string;
  /** When met, the quest auto-starts (see questSystem.reconcileQuests). */
  startCondition?: Condition;
  steps: QuestStep[];
}

export type QuestStatus = 'not_started' | 'active' | 'completed';

export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  currentStepIndex: number;
  completedStepIds: string[];
}

export function createInitialQuestProgress(questId: string): QuestProgress {
  return { questId, status: 'not_started', currentStepIndex: 0, completedStepIds: [] };
}
