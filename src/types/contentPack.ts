import type { NpcDefinition } from './npc';
import type { DialogueTree } from './dialogue';
import type { BranchPoint } from './narrative';
import type { ChallengeDefinition } from './challenge';
import type { QuestDefinition } from './quest';
import type { ItemDefinition } from './inventory';
import type { CosmeticDefinition } from './avatar';
import type { CompanionDefinition } from './companion';
import type { SceneDefinition } from './scene';

export interface ContentPackManifest {
  id: string;
  version: string;
  title: string;
  description: string;
  startSceneId: string;
  startSpawnPoint: string;
}

/**
 * A fully-loaded content pack: everything that makes a story a story, with
 * zero engine code inside it. Swapping this object is how StoryQuest would
 * support an entirely different adventure (pirates, space, ...) later.
 */
export interface ContentPack {
  manifest: ContentPackManifest;
  npcs: Record<string, NpcDefinition>;
  dialogues: Record<string, DialogueTree>;
  branches: Record<string, BranchPoint>;
  challenges: Record<string, ChallengeDefinition>;
  quests: Record<string, QuestDefinition>;
  items: Record<string, ItemDefinition>;
  cosmetics: Record<string, CosmeticDefinition>;
  companions: Record<string, CompanionDefinition>;
  scenes: Record<string, SceneDefinition>;
}
