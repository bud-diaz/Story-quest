/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * Stateless helpers for walking a DialogueTree. The orchestration (applying
 * a node's effects, deciding whether to wait for a choice / open a
 * challenge / hand off to a branch) lives in state/gameStore, which is the
 * only layer allowed to combine this with applyEffects().
 */
import type { DialogueChoice, DialogueNode, DialogueTree, EvaluationContext } from '@/types';
import { evaluateConditions } from '@/engine/conditions';

export function getStartNode(tree: DialogueTree): DialogueNode {
  const node = tree.nodes[tree.startNode];
  if (!node) throw new Error(`Dialogue tree "${tree.id}" has no start node "${tree.startNode}"`);
  return node;
}

export function getNode(tree: DialogueTree, nodeId: string): DialogueNode {
  const node = tree.nodes[nodeId];
  if (!node) throw new Error(`Dialogue tree "${tree.id}" has no node "${nodeId}"`);
  return node;
}

export function getVisibleChoices(node: DialogueNode, ctx: EvaluationContext): DialogueChoice[] {
  if (!node.choices) return [];
  return node.choices.filter((choice) => evaluateConditions(choice.conditions, ctx));
}

export function findChoice(node: DialogueNode, choiceId: string): DialogueChoice | undefined {
  return node.choices?.find((c) => c.id === choiceId);
}

/** True once a node has nothing left to do but end the conversation. */
export function isTerminalNode(node: DialogueNode): boolean {
  return !node.choices?.length && !node.challengeId && !node.triggersBranch && !node.next;
}
