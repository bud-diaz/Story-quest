import type { Condition, Effect } from './conditionsEffects';

/**
 * A BranchPoint is a world-state fork — distinct from an in-conversation
 * DialogueChoice. It is presented in its own UI (ChoicePrompt, not
 * DialogueBox) and its resolution is recorded generically as
 * `flags['branch:<branchPointId>'] = optionId`, persisting well beyond the
 * conversation that triggered it.
 */
export interface BranchOption {
  id: string;
  label: string;
  conditions?: Condition[];
  effects: Effect[];
  /** A short follow-up dialogue beat played immediately after resolving. */
  outcomeDialogueId?: string;
}

export interface BranchPoint {
  id: string;
  prompt: string;
  options: BranchOption[];
}

export function branchFlagKey(branchPointId: string): string {
  return `branch:${branchPointId}`;
}
