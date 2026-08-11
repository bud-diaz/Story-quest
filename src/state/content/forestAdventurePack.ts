/**
 * The only file that knows the forest-adventure content pack is made of
 * these specific JSON files. Loading a different story pack later means
 * writing one more file like this one — everything downstream (engine/,
 * game/, ui/) only ever sees the assembled ContentPack shape.
 */
import { buildContentPack } from '@/engine/content/contentLoader';
import type {
  BranchPoint,
  ChallengeDefinition,
  CompanionDefinition,
  ContentPackManifest,
  CosmeticDefinition,
  DialogueTree,
  ItemDefinition,
  NpcDefinition,
  QuestDefinition,
  SceneDefinition,
} from '@/types';

import manifest from '@/content/packs/forest-adventure/pack.json';
import beaver from '@/content/packs/forest-adventure/npcs/beaver.json';
import beaverIntro from '@/content/packs/forest-adventure/dialogues/beaver-intro.json';
import beaverPostBridgeCross from '@/content/packs/forest-adventure/dialogues/beaver-post-bridge-cross.json';
import beaverPostBridgeCave from '@/content/packs/forest-adventure/dialogues/beaver-post-bridge-cave.json';
import beaverPostBridgeHelp from '@/content/packs/forest-adventure/dialogues/beaver-post-bridge-help.json';
import beaverIdlePostQuest from '@/content/packs/forest-adventure/dialogues/beaver-idle-post-quest.json';
import bridgeFork from '@/content/packs/forest-adventure/branches/bridge-fork.json';
import mathBeaverLogs from '@/content/packs/forest-adventure/challenges/math-beaver-logs.json';
import readingForestSign from '@/content/packs/forest-adventure/challenges/reading-forest-sign.json';
import fixTheBridge from '@/content/packs/forest-adventure/quests/fix-the-bridge.json';
import items from '@/content/packs/forest-adventure/items/items.json';
import cosmetics from '@/content/packs/forest-adventure/avatar/cosmetics.json';
import companions from '@/content/packs/forest-adventure/companions/companions.json';
import hub from '@/content/packs/forest-adventure/scenes/hub.json';
import forest from '@/content/packs/forest-adventure/scenes/forest.json';

export function loadForestAdventurePack() {
  return buildContentPack({
    manifest: manifest as ContentPackManifest,
    npcs: [beaver as NpcDefinition],
    dialogues: [
      beaverIntro,
      beaverPostBridgeCross,
      beaverPostBridgeCave,
      beaverPostBridgeHelp,
      beaverIdlePostQuest,
    ] as DialogueTree[],
    branches: [bridgeFork] as BranchPoint[],
    challenges: [mathBeaverLogs, readingForestSign] as ChallengeDefinition[],
    quests: [fixTheBridge] as QuestDefinition[],
    items: items as ItemDefinition[],
    cosmetics: cosmetics as CosmeticDefinition[],
    companions: companions as CompanionDefinition[],
    scenes: [hub, forest] as SceneDefinition[],
  });
}
