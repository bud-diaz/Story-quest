import type { TraitState } from './traits';
import type { FlagState } from './flags';
import type { InventoryState } from './inventory';
import type { QuestProgress } from './quest';
import type { AvatarState } from './avatar';
import type { CompanionState } from './companion';

export interface SaveGameV1 {
  saveVersion: 1;
  contentPackId: string;
  contentPackVersion: string;
  savedAt: string;
  traits: TraitState;
  flags: FlagState;
  inventory: InventoryState;
  quests: Record<string, QuestProgress>;
  avatar: AvatarState;
  companions: CompanionState;
  position: { sceneId: string; x: number; y: number };
}

export type SaveGame = SaveGameV1;

export const CURRENT_SAVE_VERSION = 1;
export const SAVE_STORAGE_KEY = 'storyquest:save:v1';
