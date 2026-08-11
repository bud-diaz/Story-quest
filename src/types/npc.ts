export interface NpcDefinition {
  id: string;
  name: string;
  sceneId: string;
  spawnPoint: { x: number; y: number };
  portraitTextureKey: string;
  spriteTextureKey: string;
  defaultDialogueId: string;
  /**
   * Optional: once this flag is truthy, re-interacting with the NPC opens
   * this dialogue instead of defaultDialogueId. Keeps "what does this NPC
   * say now" fully data-driven rather than hardcoded per-NPC scene logic.
   */
  postDialogue?: { flag: string; dialogueId: string };
}
