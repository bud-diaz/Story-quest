/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * A BranchPoint is a world-state fork, distinct from an in-conversation
 * DialogueChoice: it's rendered in its own UI and its resolution is
 * recorded generically so future content can gate on "which way did the
 * player go" without caring about the exact conversation that asked.
 */
import type { BranchOption, BranchPoint, Effect, EvaluationContext } from '@/types';
import { branchFlagKey } from '@/types';
import { evaluateConditions } from '@/engine/conditions';

export function getVisibleOptions(branch: BranchPoint, ctx: EvaluationContext): BranchOption[] {
  return branch.options.filter((option) => evaluateConditions(option.conditions, ctx));
}

export interface ResolvedBranch {
  option: BranchOption;
  effects: Effect[];
}

export function resolveBranchOption(branch: BranchPoint, optionId: string): ResolvedBranch | undefined {
  const option = branch.options.find((o) => o.id === optionId);
  if (!option) return undefined;
  const effects: Effect[] = [
    ...option.effects,
    { type: 'flag', flag: branchFlagKey(branch.id), op: 'set', value: optionId },
  ];
  return { option, effects };
}
