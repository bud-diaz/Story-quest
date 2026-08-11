/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * Fail-fast lookups over a ContentPack. Content authoring mistakes (a typo
 * in a dialogue id) become an immediate, descriptive error here instead of
 * a silent `undefined` bug three layers away in a Phaser scene.
 */
import type { ContentPack } from '@/types';

function lookup<T>(record: Record<string, T>, id: string, kind: string): T {
  const value = record[id];
  if (!value) throw new Error(`Unknown ${kind} id "${id}"`);
  return value;
}

export const contentRegistry = {
  npc: (pack: ContentPack, id: string) => lookup(pack.npcs, id, 'npc'),
  dialogue: (pack: ContentPack, id: string) => lookup(pack.dialogues, id, 'dialogue'),
  branch: (pack: ContentPack, id: string) => lookup(pack.branches, id, 'branch'),
  challenge: (pack: ContentPack, id: string) => lookup(pack.challenges, id, 'challenge'),
  quest: (pack: ContentPack, id: string) => lookup(pack.quests, id, 'quest'),
  item: (pack: ContentPack, id: string) => lookup(pack.items, id, 'item'),
  cosmetic: (pack: ContentPack, id: string) => lookup(pack.cosmetics, id, 'cosmetic'),
  companion: (pack: ContentPack, id: string) => lookup(pack.companions, id, 'companion'),
  scene: (pack: ContentPack, id: string) => lookup(pack.scenes, id, 'scene'),
};
