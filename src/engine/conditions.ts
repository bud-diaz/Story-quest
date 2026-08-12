/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * The single Condition evaluator shared by dialogue choices, branch
 * options, quest step completion, avatar cosmetic unlocks, and companion
 * recruitment gates.
 */
import type { Condition, EvaluationContext } from '@/types';

export function evaluateCondition(condition: Condition, ctx: EvaluationContext): boolean {
  switch (condition.type) {
    case 'trait':
      return compareNumber(ctx.snapshot.traits[condition.trait], condition.op, condition.value);

    case 'flag': {
      const actual = ctx.snapshot.flags[condition.flag];
      switch (condition.op) {
        case 'truthy':
          return Boolean(actual);
        case 'falsy':
          return !actual;
        case 'eq':
          return actual === condition.value;
        case 'neq':
          return actual !== condition.value;
      }
      break;
    }

    case 'item': {
      const stack = ctx.snapshot.inventory.stacks.find((s) => s.itemId === condition.itemId);
      const quantity = stack?.quantity ?? 0;
      switch (condition.op) {
        case 'has':
          return quantity > 0;
        case 'lacks':
          return quantity === 0;
        case 'countGte':
          return quantity >= (condition.value ?? 1);
      }
      break;
    }

    case 'companion': {
      const { companions } = ctx.snapshot;
      if (condition.op === 'recruited') {
        return condition.companionId
          ? companions.recruited.includes(condition.companionId)
          : companions.recruited.length > 0;
      }
      // op === 'active'
      return condition.companionId
        ? companions.active === condition.companionId
        : companions.active !== null;
    }

    case 'companionUnlocks': {
      const activeId = ctx.snapshot.companions.active;
      if (!activeId) return false;
      const def = ctx.content.companions[activeId];
      return def ? def.unlocksInteractions.includes(condition.interactionTag) : false;
    }

    case 'quest': {
      const progress = ctx.snapshot.quests[condition.questId];
      if (!progress) return false;
      if (condition.op === 'completed') return progress.status === 'completed';
      if (condition.op === 'active') return progress.status === 'active';
      // op === 'stepReached': true once the step has been completed (or the
      // whole quest has), not merely while it is the current in-progress step.
      if (progress.status === 'completed') return true;
      if (!condition.stepId) return false;
      return progress.completedStepIds.includes(condition.stepId);
    }

    case 'all':
      return condition.conditions.every((c) => evaluateCondition(c, ctx));

    case 'any':
      return condition.conditions.some((c) => evaluateCondition(c, ctx));

    case 'not':
      return !evaluateCondition(condition.condition, ctx);
  }
}

function compareNumber(
  actual: number,
  op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq',
  expected: number,
): boolean {
  switch (op) {
    case 'gt':
      return actual > expected;
    case 'gte':
      return actual >= expected;
    case 'lt':
      return actual < expected;
    case 'lte':
      return actual <= expected;
    case 'eq':
      return actual === expected;
  }
}

export function evaluateConditions(conditions: Condition[] | undefined, ctx: EvaluationContext): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, ctx));
}
