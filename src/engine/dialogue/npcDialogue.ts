/** Pure, framework-agnostic. Must not import from state/, game/, or ui/. */
import type { FlagState, NpcDefinition } from '@/types';

/** Which dialogue tree an interaction with this NPC should currently open. */
export function resolveNpcDialogueId(npc: NpcDefinition, flags: FlagState): string {
  if (npc.postDialogue && flags[npc.postDialogue.flag]) {
    return npc.postDialogue.dialogueId;
  }
  return npc.defaultDialogueId;
}
