import type { Condition, Effect } from './conditionsEffects';

export interface DialogueChoice {
  id: string;
  text: string;
  conditions?: Condition[];
  effects?: Effect[];
  next: string | null;
}

export interface DialogueNode {
  id: string;
  /** npc id, `'player'`, or `'narrator'`. */
  speakerId: string;
  portrait?: string;
  text: string;
  effects?: Effect[];
  choices?: DialogueChoice[];
  /** Opens a challenge modal; result routes to onSuccessNext / onFailureNext. */
  challengeId?: string;
  onSuccessNext?: string;
  onFailureNext?: string;
  /** Linear continuation, used when there are no choices and no challenge. */
  next?: string | null;
  /** Hands the conversation off to a BranchPoint once this node is reached. */
  triggersBranch?: string;
}

export interface DialogueTree {
  id: string;
  npcId: string;
  startNode: string;
  nodes: Record<string, DialogueNode>;
}
