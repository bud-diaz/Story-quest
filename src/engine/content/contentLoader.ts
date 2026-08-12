/**
 * Pure, framework-agnostic. Must not import from state/, game/, or ui/.
 *
 * Turns arrays of content-authored definitions into an id-indexed
 * ContentPack. Swapping the inputs here for a different story pack (e.g.
 * pirates, space) is the whole story of adding new content to StoryQuest.
 */
import type {
  BranchPoint,
  ChallengeDefinition,
  CompanionDefinition,
  ContentPack,
  ContentPackManifest,
  CosmeticDefinition,
  DialogueTree,
  ItemDefinition,
  NpcDefinition,
  QuestDefinition,
  SceneDefinition,
} from '@/types';

export interface RawContentPackInputs {
  manifest: ContentPackManifest;
  npcs: NpcDefinition[];
  dialogues: DialogueTree[];
  branches: BranchPoint[];
  challenges: ChallengeDefinition[];
  quests: QuestDefinition[];
  items: ItemDefinition[];
  cosmetics: CosmeticDefinition[];
  companions: CompanionDefinition[];
  scenes: SceneDefinition[];
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of items) out[item.id] = item;
  return out;
}

export function buildContentPack(inputs: RawContentPackInputs): ContentPack {
  return {
    manifest: inputs.manifest,
    npcs: indexById(inputs.npcs),
    dialogues: indexById(inputs.dialogues),
    branches: indexById(inputs.branches),
    challenges: indexById(inputs.challenges),
    quests: indexById(inputs.quests),
    items: indexById(inputs.items),
    cosmetics: indexById(inputs.cosmetics),
    companions: indexById(inputs.companions),
    scenes: indexById(inputs.scenes),
  };
}
